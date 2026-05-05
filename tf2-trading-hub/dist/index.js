"use strict";

const express = require("express");
const SteamUser = require("steam-user");
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require("steam-tradeoffer-manager");
const SteamTotp = require("steam-totp");
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const VERSION = "5.13.67";
const PORT = Number(process.env.PORT || 8099);
const DATA_DIR = process.env.DATA_DIR || "/data";
const ACCOUNTS_DIR = path.join(DATA_DIR, "accounts");

const GLOBAL = {
  accounts: path.join(DATA_DIR, "tf2-hub-accounts.json"),
  settings: path.join(DATA_DIR, "tf2-hub-global-settings.json"),
  audit: path.join(DATA_DIR, "tf2-hub-global-audit.jsonl"),
  priceSchema: path.join(DATA_DIR, "tf2-hub-price-schema.json"),
};

const LEGACY = {
  creds: path.join(DATA_DIR, "tf2-hub-credentials.json"),
  runtime: path.join(DATA_DIR, "tf2-hub-runtime-state.json"),
  inventory: path.join(DATA_DIR, "tf2-hub-inventory-cache.json"),
  listingsA: path.join(DATA_DIR, "tf2-hub-listings-cache.json"),
  listingsB: path.join(DATA_DIR, "steam-companion-backpack-listings.json"),
  audit: path.join(DATA_DIR, "steam-companion-audit.jsonl"),
  poll: path.join(DATA_DIR, "steam-tradeoffer-poll.json"),
  oldPrice: path.join(DATA_DIR, "tf2-hub-backpack-price-schema.json"),
  options: path.join(DATA_DIR, "options.json"),
};

const bus = new EventEmitter();
bus.setMaxListeners(200);

const DEFAULT_GLOBAL_SETTINGS = {
  dry_run: true,
  autonomous_enabled: false,
  autonomous_publish_enabled: false,
  autonomous_trade_accept_enabled: false,
  min_profit_ref: 0,
  max_publish_per_cycle: 5,
  max_trade_accept_per_cycle: 3,
  require_price_confidence: true,
  allow_unpriced_items: false,
  max_parallel_accounts: 1,
  price_schema_ttl_minutes: 60,
  inventory_ttl_minutes: 10,
  listings_ttl_minutes: 5,
  pipeline_interval_minutes: 5,
};

const DEFAULT_ACCOUNT_FLAGS = {
  enabled: false,
  autonomous_enabled: false,
  autonomous_publish_enabled: false,
  autonomous_trade_accept_enabled: false,
  dry_run: true,
  min_profit_ref: 0,
  max_publish_per_cycle: 5,
  max_trade_accept_per_cycle: 3,
  require_price_confidence: true,
  allow_unpriced_items: false,
};

const SECRET_FIELDS = new Set([
  "steam_password",
  "password",
  "shared_secret",
  "identity_secret",
  "steam_web_api_key",
  "steam_api_key",
  "backpack_access_token",
  "backpack_api_key",
  "bptf_token",
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

function appendJsonl(file, entry) {
  try {
    ensureDir(path.dirname(file));
    fs.appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n", "utf8");
  } catch {
    // audit must never crash the add-on
  }
}

function nowIso() {
  return new Date().toISOString();
}

function safeId(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "account";
}

function accountDir(accountId) {
  return path.join(ACCOUNTS_DIR, safeId(accountId));
}

function accountPaths(accountId) {
  const dir = accountDir(accountId);
  return {
    dir,
    credentials: path.join(dir, "credentials.json"),
    runtime: path.join(dir, "runtime-state.json"),
    inventory: path.join(dir, "inventory-cache.json"),
    listings: path.join(dir, "listings-cache.json"),
    drafts: path.join(dir, "listing-drafts.json"),
    ignoredDrafts: path.join(dir, "ignored-drafts.json"),
    poll: path.join(dir, "tradeoffer-poll.json"),
    audit: path.join(dir, "audit.jsonl"),
  };
}

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (SECRET_FIELDS.has(key) || /secret|token|password|api_key|apikey/i.test(key)) {
      out[key] = val ? "saved" : "missing";
    } else if (typeof val === "object") {
      out[key] = sanitize(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function log(level, event, data = {}, accountId = null) {
  const safe = sanitize(data || {});
  const entry = { level, event, account_id: accountId || undefined, ...safe };
  console.log(`[${level.toUpperCase()}] ${event}`, Object.keys(safe).length ? safe : "");
  appendJsonl(GLOBAL.audit, entry);
  if (accountId) appendJsonl(accountPaths(accountId).audit, entry);
  bus.emit("log", { ts: nowIso(), ...entry });
}

function loadGlobalSettings() {
  return { ...DEFAULT_GLOBAL_SETTINGS, ...(readJson(GLOBAL.settings, {}) || {}) };
}

function saveGlobalSettings(patch) {
  const cur = loadGlobalSettings();
  const next = { ...cur, ...(patch || {}), updated_at: nowIso() };
  writeJson(GLOBAL.settings, next);
  return next;
}

function legacyCredsToAccountCreds(c = {}) {
  return {
    steam_username: c.steam_username || c.username || "",
    steam_password: c.steam_password || c.password || "",
    shared_secret: c.shared_secret || "",
    identity_secret: c.identity_secret || "",
    steamid64: c.steamid64 || c.steam_id || "",
    steam_web_api_key: c.steam_web_api_key || c.steam_api_key || "",
    backpack_access_token: c.backpack_access_token || c.bptf_token || "",
    backpack_api_key: c.backpack_api_key || "",
  };
}

function normalizeAccountRecord(record = {}) {
  const account_id = safeId(record.account_id || record.id || record.label || "main");
  return {
    account_id,
    label: String(record.label || (account_id === "main" ? "Main account" : account_id)),
    role: ["main", "trading", "storage", "pricing_only", "disabled"].includes(record.role) ? record.role : (account_id === "main" ? "main" : "trading"),
    ...DEFAULT_ACCOUNT_FLAGS,
    ...record,
    account_id,
    updated_at: record.updated_at || nowIso(),
    created_at: record.created_at || nowIso(),
  };
}

function loadAccounts() {
  ensureDir(DATA_DIR);
  ensureDir(ACCOUNTS_DIR);
  const raw = readJson(GLOBAL.accounts, null);
  if (Array.isArray(raw) && raw.length) return raw.map(normalizeAccountRecord);
  return migrateLegacyAccount();
}

function saveAccounts(accounts) {
  writeJson(GLOBAL.accounts, accounts.map(normalizeAccountRecord));
}

function migrateLegacyAccount() {
  ensureDir(ACCOUNTS_DIR);
  const accounts = [normalizeAccountRecord({
    account_id: "main",
    label: "Main account",
    role: "main",
    enabled: true,
    dry_run: true,
  })];
  const p = accountPaths("main");
  ensureDir(p.dir);

  if (fs.existsSync(LEGACY.creds) && !fs.existsSync(p.credentials)) {
    const creds = legacyCredsToAccountCreds(readJson(LEGACY.creds, {}) || {});
    writeJson(p.credentials, creds);
    log("info", "legacy_credentials_migrated", { target: "accounts/main" }, "main");
  }
  const copyIf = [
    [LEGACY.runtime, p.runtime],
    [LEGACY.inventory, p.inventory],
    [fs.existsSync(LEGACY.listingsA) ? LEGACY.listingsA : LEGACY.listingsB, p.listings],
    [LEGACY.poll, p.poll],
  ];
  for (const [from, to] of copyIf) {
    try { if (from && fs.existsSync(from) && !fs.existsSync(to)) fs.copyFileSync(from, to); } catch { /* non-fatal */ }
  }
  if (fs.existsSync(LEGACY.oldPrice) && !fs.existsSync(GLOBAL.priceSchema)) {
    try { fs.copyFileSync(LEGACY.oldPrice, GLOBAL.priceSchema); } catch { /* non-fatal */ }
  }
  saveAccounts(accounts);
  return accounts;
}

function findAccount(accountId = "main") {
  const accounts = loadAccounts();
  return accounts.find(a => a.account_id === safeId(accountId)) || accounts.find(a => a.role === "main") || accounts[0];
}

function updateAccountRecord(accountId, patch) {
  const id = safeId(accountId);
  const accounts = loadAccounts();
  const idx = accounts.findIndex(a => a.account_id === id);
  const cur = idx >= 0 ? accounts[idx] : normalizeAccountRecord({ account_id: id, label: id });
  const next = normalizeAccountRecord({ ...cur, ...(patch || {}), account_id: id, updated_at: nowIso() });
  if (idx >= 0) accounts[idx] = next;
  else accounts.push(next);
  saveAccounts(accounts);
  return next;
}

function deleteAccountRecord(accountId) {
  const id = safeId(accountId);
  if (id === "main") throw new Error("The main account cannot be deleted");
  const accounts = loadAccounts().filter(a => a.account_id !== id);
  saveAccounts(accounts);
}

function loadCreds(accountId = "main") {
  return readJson(accountPaths(accountId).credentials, {}) || {};
}

function saveCreds(accountId, patch = {}) {
  const p = accountPaths(accountId);
  const current = loadCreds(accountId);
  const next = { ...current };
  const map = {
    username: "steam_username",
    password: "steam_password",
    steam_id: "steamid64",
    steam_api_key: "steam_web_api_key",
    bptf_token: "backpack_access_token",
  };
  const fields = [
    "steam_username", "steam_password", "shared_secret", "identity_secret", "steamid64",
    "steam_web_api_key", "backpack_access_token", "backpack_api_key",
    "username", "password", "steam_id", "steam_api_key", "bptf_token",
  ];
  for (const f of fields) {
    if (!Object.prototype.hasOwnProperty.call(patch, f)) continue;
    const target = map[f] || f;
    if (patch[f] === "" || patch[f] === null || patch[f] === undefined) continue;
    next[target] = String(patch[f]);
  }
  if (patch.clear_fields && Array.isArray(patch.clear_fields)) {
    for (const f of patch.clear_fields) delete next[map[f] || f];
  }
  writeJson(p.credentials, next);
  return next;
}

function credentialStatus(accountId = "main") {
  const c = loadCreds(accountId);
  return {
    has_username: !!c.steam_username,
    has_password: !!c.steam_password,
    has_shared_secret: !!c.shared_secret,
    has_identity_secret: !!c.identity_secret,
    has_steam_api_key: !!c.steam_web_api_key,
    has_bptf_token: !!c.backpack_access_token,
    has_backpack_access_token: !!c.backpack_access_token,
    has_backpack_api_key: !!c.backpack_api_key,
    steam_id: c.steamid64 || null,
    steamid64: c.steamid64 || null,
    username: c.steam_username || null,
  };
}

function desiredOnline(accountId) {
  const runtime = readJson(accountPaths(accountId).runtime, { desired_online: false });
  return runtime.desired_online === true;
}

function setDesiredOnline(accountId, value, reason = "manual") {
  const next = {
    ...(readJson(accountPaths(accountId).runtime, {}) || {}),
    desired_online: Boolean(value),
    reason,
    updated_at: nowIso(),
  };
  writeJson(accountPaths(accountId).runtime, next);
  return next;
}

function summarizeBptfError(err) {
  const body = err?.body || {};
  const status = err?.status || null;
  let code = "api_error";
  if (status === 401) code = "unauthorized";
  else if (status === 403) code = "forbidden";
  else if (status === 429) code = "rate_limited";
  return {
    code,
    error: err?.message || "Unknown Backpack.tf error",
    status,
    message: body.message || body.error || body.raw || null,
  };
}

async function apiFetch(url, opts = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await res.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; }
    catch { body = { raw: text.slice(0, 1200) }; }
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body });
    return body;
  } finally {
    clearTimeout(timer);
  }
}

let priceSchemaCache = null;
let priceSchemaTTL = 0;
let pricingState = {
  status: "not_loaded",
  item_count: 0,
  last_sync: null,
  last_error: null,
  endpoint_used: null,
};

function getPriceItemCount(schema) {
  return Object.keys(schema?.response?.items || schema?.items || {}).length;
}

function loadCachedPriceSchema() {
  const schema = readJson(GLOBAL.priceSchema, null);
  pricingState.item_count = getPriceItemCount(schema);
  if (schema) pricingState.status = pricingState.status === "not_loaded" ? "cached" : pricingState.status;
  return schema;
}

function findPricingKey(preferredAccountId = null) {
  const candidates = [];
  if (preferredAccountId) candidates.push(preferredAccountId);
  for (const acc of loadAccounts()) candidates.push(acc.account_id);
  for (const id of [...new Set(candidates)]) {
    const c = loadCreds(id);
    if (c.backpack_api_key) return { account_id: id, key: c.backpack_api_key };
  }
  return null;
}

async function refreshPriceSchema({ force = false, accountId = null } = {}) {
  const settings = loadGlobalSettings();
  if (!force && priceSchemaCache && Date.now() < priceSchemaTTL) return priceSchemaCache;
  const keyInfo = findPricingKey(accountId);
  if (!keyInfo) {
    const cached = loadCachedPriceSchema();
    pricingState = {
      ...pricingState,
      status: cached ? "cached_missing_api_key" : "missing_api_key",
      last_error: cached ? null : "Backpack.tf API key is missing. Save backpack_api_key, not the access token.",
      endpoint_used: "IGetPrices/v4",
    };
    return cached;
  }
  try {
    const url = `https://backpack.tf/api/IGetPrices/v4?key=${encodeURIComponent(keyInfo.key)}&appid=440`;
    const data = await apiFetch(url, {}, 30000);
    priceSchemaCache = data;
    priceSchemaTTL = Date.now() + Number(settings.price_schema_ttl_minutes || 60) * 60 * 1000;
    writeJson(GLOBAL.priceSchema, data);
    pricingState = {
      status: "ok",
      item_count: getPriceItemCount(data),
      last_sync: nowIso(),
      last_error: null,
      endpoint_used: "IGetPrices/v4",
      account_id: keyInfo.account_id,
    };
    log("info", "price_schema_updated", { count: pricingState.item_count, source_account: keyInfo.account_id });
    return data;
  } catch (err) {
    const detail = summarizeBptfError(err);
    const cached = loadCachedPriceSchema();
    pricingState = {
      ...pricingState,
      status: detail.code,
      last_error: detail.message || detail.error,
      endpoint_used: "IGetPrices/v4",
    };
    log("warn", "price_schema_fetch_failed", detail);
    return cached;
  }
}

function parseCurrencyPrice(raw) {
  if (!raw) return null;
  if (typeof raw === "number") return { metal: raw, keys: 0, text: `${raw} ref` };
  if (typeof raw === "object") {
    const keys = Number(raw.keys || raw.key || 0);
    const metal = Number(raw.metal || raw.refined || raw.value || 0);
    return { keys, metal, text: `${keys ? `${keys} key${keys === 1 ? "" : "s"} ` : ""}${metal ? `${metal} ref` : ""}`.trim() || "0 ref" };
  }
  return { keys: 0, metal: 0, text: String(raw) };
}

function lookupPrice(schema, name, quality = "Unique") {
  const items = schema?.response?.items || schema?.items || {};
  if (!name || !items || !Object.keys(items).length) return null;
  const key = Object.keys(items).find(k => k.toLowerCase() === String(name).toLowerCase());
  if (!key) return null;
  const item = items[key];
  const prices = item?.prices || item?.priceindex || item;
  const qCandidates = [quality, "Unique", "6", Object.keys(prices || {})[0]].filter(Boolean);
  for (const q of qCandidates) {
    const qData = prices?.[q];
    const tradable = qData?.Tradable || qData?.tradable || qData;
    const craftable = tradable?.Craftable || tradable?.craftable || tradable;
    const entries = Array.isArray(craftable) ? craftable : Object.values(craftable || {}).flat();
    const entry = entries.find(Boolean);
    if (entry) {
      const raw = entry.value !== undefined ? entry.value : entry.price || entry;
      return {
        item_name: key,
        quality: q,
        raw: entry,
        suggested: parseCurrencyPrice(raw),
        confidence: entry.last_update || entry.currency ? "medium" : "low",
      };
    }
  }
  return { item_name: key, raw: item, suggested: null, confidence: "low" };
}

function itemValueRef(item, schema) {
  const price = lookupPrice(schema, item.name || item.market_hash_name || item.item_name, item.quality || "Unique");
  if (!price?.suggested) return { ref: 0, known: false, price };
  const keyRate = Number(loadGlobalSettings().key_ref_estimate || 77);
  return { ref: Number(price.suggested.metal || 0) + Number(price.suggested.keys || 0) * keyRate, known: true, price };
}

function extractListingsPayload(data) {
  const candidates = [
    data,
    data?.listings,
    data?.response,
    data?.response?.listings,
    data?.results,
    data?.response?.results,
    data?.classifieds,
    data?.response?.classifieds,
    data?.data,
    data?.data?.listings,
    data?.data?.results,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  for (const c of candidates) {
    if (c && typeof c === "object") {
      const values = Object.values(c).flatMap(v => Array.isArray(v) ? v : (v && typeof v === "object" ? [v] : []));
      if (values.some(v => v && typeof v === "object")) return values;
    }
  }
  return [];
}

function normalizeListing(l) {
  const item = l?.item || l?.item_details || l?.details || l?.listing?.item || {};
  const currencies = l?.currencies || l?.price || l?.currencies_raw || l?.listing?.currencies || {};
  const intentRaw = l?.intent ?? l?.listing_intent ?? l?.buyout ?? l?.listing?.intent;
  return {
    id: String(l?.id || l?.listing_id || l?._id || l?.listing?.id || `${Date.now()}-${Math.random()}`),
    intent: intentRaw === 0 || intentRaw === "buy" ? "buy" : "sell",
    item_name: item?.name || item?.market_hash_name || l?.item_name || l?.name || l?.market_hash_name || "Unknown item",
    currencies,
    bump: l?.bump || l?.bumped_at || null,
    created: l?.created || l?.created_at || null,
    raw_intent: intentRaw ?? null,
  };
}

class AccountRuntime {
  constructor(record) {
    this.record = normalizeAccountRecord(record);
    this.id = this.record.account_id;
    this.paths = accountPaths(this.id);
    ensureDir(this.paths.dir);
    this.client = null;
    this.community = null;
    this.manager = null;
    this.reconnectTimer = null;
    this.tickRunning = false;
    this.pipelineRunning = false;
    this.offerQueue = readJson(path.join(this.paths.dir, "offers-cache.json"), []) || [];
    this.inventory = readJson(this.paths.inventory, []) || [];
    this.listings = readJson(this.paths.listings, []) || [];
    this.drafts = readJson(this.paths.drafts, []) || [];
    this.status = "offline";
    this.loginError = null;
    this.steamId = credentialStatus(this.id).steamid64 || null;
    this.displayName = null;
    this.offerManagerReady = false;
    this.lastOfferSync = null;
    this.lastListingSync = null;
    this.lastListingError = null;
    this.lastBptfDiagnostic = { status: "not_checked" };
    this.lastInvSync = null;
    this.lastInvError = null;
    this.lastInvSource = null;
    this.nextInvSyncAfter = null;
    this.invFailureCount = 0;
    this.lastInvFailureLogAt = 0;
    this.lastPipeline = { status: "not_run" };
    this.startedAt = nowIso();
  }

  emitStatus() {
    bus.emit("status", { account_id: this.id, status: this.status });
  }

  accountFlags() {
    const latest = findAccount(this.id) || this.record;
    return { ...DEFAULT_ACCOUNT_FLAGS, ...loadGlobalSettings(), ...latest };
  }

  creds() { return loadCreds(this.id); }

  publicStatus() {
    return {
      account_id: this.id,
      label: this.record.label,
      role: this.record.role,
      enabled: !!this.record.enabled,
      status: this.status,
      steam_id: this.steamId,
      display_name: this.displayName,
      login_error: this.loginError,
      offer_manager_ready: this.offerManagerReady,
      offer_queue: this.offerQueue.length,
      listing_count: this.listings.length,
      listing_error: this.lastListingError,
      backpack: this.lastBptfDiagnostic,
      inventory_count: this.inventory.length,
      inventory_error: this.lastInvError,
      inventory_source: this.lastInvSource,
      inventory_retry_after: this.nextInvSyncAfter,
      draft_count: this.drafts.length,
      last_offer_sync: this.lastOfferSync,
      last_listing_sync: this.lastListingSync,
      last_inv_sync: this.lastInvSync,
      last_pipeline: this.lastPipeline,
      desired_online: desiredOnline(this.id),
      credentials: credentialStatus(this.id),
      flags: this.safeFlags(),
    };
  }

  safeFlags() {
    const f = this.accountFlags();
    return {
      dry_run: !!f.dry_run,
      autonomous_enabled: !!f.autonomous_enabled,
      autonomous_publish_enabled: !!f.autonomous_publish_enabled,
      autonomous_trade_accept_enabled: !!f.autonomous_trade_accept_enabled,
      min_profit_ref: Number(f.min_profit_ref || 0),
      max_publish_per_cycle: Number(f.max_publish_per_cycle || 5),
      max_trade_accept_per_cycle: Number(f.max_trade_accept_per_cycle || 3),
      require_price_confidence: f.require_price_confidence !== false,
      allow_unpriced_items: !!f.allow_unpriced_items,
    };
  }

  buildSteamClients() {
    this.client = new SteamUser({ autoRelogin: false });
    this.community = new SteamCommunity();
    this.manager = new TradeOfferManager({
      steam: this.client,
      community: this.community,
      language: "en",
      pollInterval: 30000,
      pollData: readJson(this.paths.poll, undefined),
      cancelTime: 7 * 24 * 60 * 60 * 1000,
    });

    this.client.on("loggedOn", () => {
      this.status = "online";
      this.steamId = this.client.steamID?.getSteamID64() || this.steamId;
      this.loginError = null;
      if (this.steamId) saveCreds(this.id, { steamid64: this.steamId });
      try { this.client.setPersona(SteamUser.EPersonaState.Online); } catch { /* optional */ }
      try { this.client.gamesPlayed(440); } catch { /* optional */ }
      log("info", "steam_logged_on", { steamid: this.steamId }, this.id);
      this.emitStatus();
    });

    this.client.on("webSession", (_sid, cookies) => {
      this.manager.setCookies(cookies, err => {
        this.offerManagerReady = !err;
        if (err) log("warn", "manager_set_cookies_failed", { error: err.message }, this.id);
        else log("info", "offer_manager_ready", {}, this.id);
        this.emitStatus();
      });
      this.community.setCookies(cookies);
      const c = this.creds();
      if (c.identity_secret) {
        try { this.community.startConfirmationChecker(30000, c.identity_secret); } catch { /* optional */ }
      }
      log("info", "steam_web_session_set", {}, this.id);
    });

    this.client.on("steamGuard", (_domain, callback, lastCodeWrong) => {
      if (lastCodeWrong) log("warn", "steamguard_wrong_code", {}, this.id);
      const c = this.creds();
      if (c.shared_secret) {
        callback(SteamTotp.generateAuthCode(c.shared_secret));
        log("info", "steamguard_totp_generated", {}, this.id);
      } else {
        this.status = "steamguard_required";
        this.loginError = "Steam Guard required. Save shared_secret for this account.";
        log("warn", "steamguard_no_secret", {}, this.id);
        this.emitStatus();
      }
    });

    this.client.on("error", err => {
      this.status = "error";
      this.loginError = err.message;
      log("error", "steam_client_error", { message: err.message, eresult: err.eresult }, this.id);
      this.emitStatus();
      if (desiredOnline(this.id)) this.scheduleReconnect();
    });

    this.client.on("disconnected", (eresult, msg) => {
      this.status = desiredOnline(this.id) ? "reconnect_wait" : "disconnected_manual";
      this.offerManagerReady = false;
      log(desiredOnline(this.id) ? "warn" : "info", desiredOnline(this.id) ? "steam_disconnected" : "steam_manual_disconnect_complete", { eresult, msg }, this.id);
      this.emitStatus();
      if (desiredOnline(this.id)) this.scheduleReconnect();
    });

    this.manager.on("pollData", data => {
      try { writeJson(this.paths.poll, data); } catch { /* non-fatal */ }
    });

    this.manager.on("newOffer", offer => this.handleNewOffer(offer));
    this.manager.on("receivedOfferChanged", (offer) => {
      if (offer.state !== TradeOfferManager.ETradeOfferState.Active) {
        this.offerQueue = this.offerQueue.filter(o => o.id !== offer.id);
        this.persistOffers();
        log("info", "offer_no_longer_active", { id: offer.id, state: offer.state }, this.id);
      }
    });
    this.manager.on("pollFailure", err => log("warn", "trade_poll_failure", { error: err.message }, this.id));
  }

  persistOffers() {
    writeJson(path.join(this.paths.dir, "offers-cache.json"), this.offerQueue.slice(-200));
  }

  async handleNewOffer(offer) {
    const entry = {
      id: String(offer.id),
      account_id: this.id,
      partner: offer.partner?.getSteamID64?.() || String(offer.partner || ""),
      message: offer.message || "",
      items_to_give: (offer.itemsToGive || []).map(i => ({ assetid: i.assetid, name: i.market_hash_name || i.name, classid: i.classid, quality: i.quality || "" })),
      items_to_receive: (offer.itemsToReceive || []).map(i => ({ assetid: i.assetid, name: i.market_hash_name || i.name, classid: i.classid, quality: i.quality || "" })),
      received_at: nowIso(),
    };
    entry.evaluation = await this.evaluateOffer(entry).catch(err => ({ decision: "manual_review", reason: err.message, risk: "unknown" }));
    this.offerQueue.push(entry);
    this.lastOfferSync = nowIso();
    this.persistOffers();
    log("info", "new_trade_offer", { id: entry.id, partner: entry.partner, decision: entry.evaluation.decision }, this.id);
    bus.emit("offer", entry);
    await this.maybeAutoActOnOffer(entry).catch(err => log("warn", "offer_auto_action_failed", { id: entry.id, error: err.message }, this.id));
  }

  async evaluateOffer(entry) {
    const schema = await refreshPriceSchema({ accountId: this.id });
    const give = entry.items_to_give.map(i => itemValueRef(i, schema));
    const receive = entry.items_to_receive.map(i => itemValueRef(i, schema));
    const giveRef = give.reduce((s, v) => s + v.ref, 0);
    const receiveRef = receive.reduce((s, v) => s + v.ref, 0);
    const unknown = [...give, ...receive].filter(v => !v.known).length;
    const profitRef = receiveRef - giveRef;
    const flags = [];
    if (unknown) flags.push("unpriced");
    if (!entry.items_to_give.length && entry.items_to_receive.length) flags.push("gift");
    if (profitRef < 0) flags.push("loss");
    if (entry.items_to_give.length + entry.items_to_receive.length > 40) flags.push("large_offer");
    const settings = this.safeFlags();
    let decision = "manual_review";
    if (!unknown && profitRef >= Number(settings.min_profit_ref || 0)) decision = "safe";
    if (unknown && !settings.allow_unpriced_items) decision = "manual_review";
    return { give_ref: giveRef, receive_ref: receiveRef, profit_ref: profitRef, unknown_items: unknown, flags, decision, dry_run: settings.dry_run };
  }

  async maybeAutoActOnOffer(entry) {
    const settings = this.safeFlags();
    if (!settings.autonomous_enabled || !settings.autonomous_trade_accept_enabled) return;
    if (settings.dry_run) {
      log("info", "offer_auto_accept_dry_run", { id: entry.id, evaluation: entry.evaluation }, this.id);
      return;
    }
    if (entry.evaluation.decision === "safe" && entry.evaluation.profit_ref >= Number(settings.min_profit_ref || 0)) {
      await this.acceptOffer(entry.id);
      log("info", "offer_auto_accepted", { id: entry.id }, this.id);
    } else {
      log("info", "offer_auto_skipped", { id: entry.id, reason: entry.evaluation.flags?.join(",") || entry.evaluation.decision }, this.id);
    }
  }

  scheduleReconnect(delayMs = 30000) {
    if (!desiredOnline(this.id)) return this.clearReconnectTimer();
    if (this.reconnectTimer) return;
    this.status = "reconnect_wait";
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (desiredOnline(this.id)) this.login().catch(err => log("error", "reconnect_failed", { error: err.message }, this.id));
    }, delayMs);
    log("info", "steam_reconnect_scheduled", { delay_ms: delayMs }, this.id);
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  async login() {
    const record = findAccount(this.id) || this.record;
    this.record = record;
    if (record.role === "disabled" || record.enabled === false) throw new Error("Account is disabled");
    if (record.role === "pricing_only") throw new Error("Pricing-only account does not need Steam login");
    const c = this.creds();
    if (!c.steam_username || !c.steam_password) throw new Error("Missing Steam username/password for account");
    setDesiredOnline(this.id, true, "login");
    this.clearReconnectTimer();
    this.status = "connecting";
    this.loginError = null;
    if (this.client) this.stop("restart_before_login", { keepDesired: true });
    this.buildSteamClients();
    const opts = { accountName: c.steam_username, password: c.steam_password };
    if (c.shared_secret) opts.twoFactorCode = SteamTotp.generateAuthCode(c.shared_secret);
    log("info", "steam_login_attempt", { username: c.steam_username }, this.id);
    this.client.logOn(opts);
    this.emitStatus();
  }

  stop(reason = "manual_disconnect", options = {}) {
    if (!options.keepDesired) setDesiredOnline(this.id, false, reason);
    this.clearReconnectTimer();
    if (this.community) { try { this.community.stopConfirmationChecker(); } catch { /* optional */ } }
    if (this.manager) { try { this.manager.shutdown(); } catch { /* optional */ } try { this.manager.pollInterval = -1; } catch { /* optional */ } }
    if (this.client) {
      try { this.client.autoRelogin = false; } catch { /* optional */ }
      try { this.client.gamesPlayed([]); } catch { /* optional */ }
      try { this.client.setPersona(SteamUser.EPersonaState.Offline); } catch { /* optional */ }
      try { this.client.logOff(); } catch { /* optional */ }
    }
    this.client = null;
    this.community = null;
    this.manager = null;
    this.offerManagerReady = false;
    this.status = options.keepDesired ? "offline" : "disconnected_manual";
    this.loginError = null;
    log("info", "bot_disconnect_requested", { reason }, this.id);
    this.emitStatus();
  }

  getCommunityInventory(steamId) {
    return new Promise((resolve, reject) => {
      if (!this.community || typeof this.community.getUserInventoryContents !== "function") return reject(new Error("Steam community inventory API is not ready"));
      this.community.getUserInventoryContents(steamId, 440, "2", true, (err, inventory) => err ? reject(err) : resolve(Array.isArray(inventory) ? inventory : []));
    });
  }

  getManagerInventory() {
    return new Promise((resolve, reject) => {
      if (!this.manager || !this.offerManagerReady) return reject(new Error("TradeOfferManager is not ready"));
      this.manager.getInventoryContents(440, "2", true, (err, inventory) => err ? reject(err) : resolve(Array.isArray(inventory) ? inventory : []));
    });
  }

  async getSteamWebApiInventory(steamId) {
    const c = this.creds();
    if (!c.steam_web_api_key) throw new Error("No Steam Web API key configured");
    const url = `https://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/?key=${encodeURIComponent(c.steam_web_api_key)}&steamid=${encodeURIComponent(steamId)}&format=json`;
    const data = await apiFetch(url, {}, 20000);
    const items = data?.result?.items || data?.response?.items || [];
    return items.map(i => ({
      assetid: i.id || i.assetid || `${i.defindex || "item"}-${i.inventory || Math.random()}`,
      classid: i.classid || String(i.defindex || ""),
      defindex: i.defindex || null,
      name: i.name || (i.defindex ? `TF2 item #${i.defindex}` : "TF2 item"),
      quality: i.quality !== undefined ? String(i.quality) : "",
      tradable: !(i.flag_cannot_trade || i.cannot_trade),
      amount: Number(i.quantity || i.amount) || 1,
    }));
  }

  async getPublicInventory(steamId) {
    const url = `https://steamcommunity.com/inventory/${encodeURIComponent(steamId)}/440/2?l=english&count=5000`;
    const data = await apiFetch(url, {}, 20000);
    const descriptions = new Map((data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d]));
    return (data.assets || []).map(a => {
      const desc = descriptions.get(`${a.classid}_${a.instanceid}`) || {};
      return { assetid: a.assetid, classid: a.classid, name: desc.market_hash_name || desc.name || "Unknown", quality: desc.tags?.find(t => t.category === "Quality")?.localized_tag_name || "", tradable: desc.tradable === 1, amount: Number(a.amount) || 1 };
    });
  }

  normalizeInventoryItem(item) {
    const qualityTag = item.tags?.find?.(t => t.category === "Quality");
    return {
      account_id: this.id,
      assetid: item.assetid || item.id,
      classid: item.classid || null,
      defindex: item.defindex || null,
      name: item.market_hash_name || item.name || "Unknown",
      market_hash_name: item.market_hash_name || item.name || "Unknown",
      quality: qualityTag?.localized_tag_name || qualityTag?.name || item.quality || "Unique",
      tradable: item.tradable !== false && item.tradable !== 0,
      amount: Number(item.amount) || 1,
    };
  }

  async syncInventory({ force = false, throwOnError = false } = {}) {
    const steamId = this.creds().steamid64 || this.steamId;
    if (!steamId) {
      const err = new Error("No SteamID64 available for inventory sync");
      this.setInventoryFailure(err, { force });
      if (throwOnError) throw err;
      return this.inventory;
    }
    if (!force && this.nextInvSyncAfter && Date.now() < new Date(this.nextInvSyncAfter).getTime()) return this.inventory;
    const attempts = [];
    const sources = [
      ["community_session", () => this.getCommunityInventory(steamId)],
      ["tradeoffer_manager", () => this.getManagerInventory()],
      ["steam_web_api", () => this.getSteamWebApiInventory(steamId)],
      ["public_inventory", () => this.getPublicInventory(steamId)],
    ];
    try {
      for (const [source, loader] of sources) {
        try {
          const raw = await loader();
          this.inventory = raw.map(i => this.normalizeInventoryItem(i)).filter(i => i.tradable);
          this.lastInvSync = nowIso();
          this.lastInvError = null;
          this.lastInvSource = source;
          this.invFailureCount = 0;
          this.nextInvSyncAfter = null;
          writeJson(this.paths.inventory, this.inventory);
          log("info", "inventory_synced", { count: this.inventory.length, source }, this.id);
          return this.inventory;
        } catch (err) {
          attempts.push(`${source}: ${err.message || err}`);
        }
      }
      throw new Error(attempts.join(" | "));
    } catch (err) {
      this.setInventoryFailure(err, { force });
      if (throwOnError) throw err;
      return this.inventory;
    }
  }

  setInventoryFailure(err, { force = false } = {}) {
    this.lastInvError = err.message || String(err);
    this.invFailureCount += 1;
    const delayMinutes = Math.min(30, Math.max(2, this.invFailureCount * 2));
    this.nextInvSyncAfter = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
    const now = Date.now();
    const shouldLog = force || this.invFailureCount === 1 || now - this.lastInvFailureLogAt > 10 * 60 * 1000;
    if (shouldLog) {
      this.lastInvFailureLogAt = now;
      log("warn", "inventory_sync_failed", { error: this.lastInvError, retry_after: this.nextInvSyncAfter, failure_count: this.invFailureCount }, this.id);
    }
  }

  async syncListings() {
    const c = this.creds();
    const steamId = String(c.steamid64 || this.steamId || "").trim();
    this.lastListingError = null;
    if (!c.backpack_access_token) {
      this.lastBptfDiagnostic = { status: "missing_token", message: "Backpack.tf access token is missing.", steam_id: steamId || null, cached_count: this.listings.length };
      return this.listings;
    }
    if (!steamId) {
      this.lastBptfDiagnostic = { status: "missing_steamid", message: "SteamID64 is missing.", cached_count: this.listings.length };
      return this.listings;
    }
    const url = `https://backpack.tf/api/classifieds/listings/v1?token=${encodeURIComponent(c.backpack_access_token)}&steamid=${encodeURIComponent(steamId)}`;
    try {
      const data = await apiFetch(url, { headers: { "X-Auth-Token": c.backpack_access_token, "User-Agent": `TF2-HA-TF2-Trading-Hub/${VERSION}` } }, 20000);
      const raw = extractListingsPayload(data);
      this.listings = raw.map(normalizeListing).filter(l => l.id || l.item_name);
      this.lastListingSync = nowIso();
      this.lastBptfDiagnostic = {
        status: this.listings.length ? "ok" : "empty",
        message: this.listings.length ? `Loaded ${this.listings.length} active listings.` : "Backpack.tf API responded successfully, but this account has no active listings.",
        steam_id: steamId,
        endpoint_used: "classifieds/listings/v1",
        raw_count: raw.length,
        parsed_count: this.listings.length,
        response_keys: data && typeof data === "object" ? Object.keys(data).slice(0, 16) : [],
      };
      writeJson(this.paths.listings, this.listings);
      log("info", "listings_synced", { count: this.listings.length, status: this.lastBptfDiagnostic.status }, this.id);
    } catch (err) {
      const detail = summarizeBptfError(err);
      this.lastListingError = detail.message || detail.error;
      this.lastBptfDiagnostic = { status: detail.code, message: this.lastListingError, http_status: detail.status, endpoint_used: "classifieds/listings/v1", steam_id: steamId, cached_count: this.listings.length };
      log("warn", "listings_sync_failed", detail, this.id);
      this.listings = readJson(this.paths.listings, []) || this.listings;
    }
    return this.listings;
  }

  async generateDrafts({ force = false } = {}) {
    const schema = await refreshPriceSchema({ accountId: this.id });
    const ignored = new Set(readJson(this.paths.ignoredDrafts, []) || []);
    const existing = force ? [] : (readJson(this.paths.drafts, []) || []);
    const byAsset = new Map(existing.map(d => [String(d.assetid), d]));
    const drafts = [];
    for (const item of this.inventory) {
      if (!item.tradable) continue;
      if (ignored.has(String(item.assetid))) continue;
      const price = lookupPrice(schema, item.market_hash_name || item.name, item.quality || "Unique");
      const warnings = [];
      let confidence = price?.confidence || "missing";
      if (!price?.suggested) { warnings.push("needs_price"); confidence = "missing"; }
      const prev = byAsset.get(String(item.assetid));
      drafts.push({
        ...(prev || {}),
        draft_id: prev?.draft_id || `${this.id}-${item.assetid}`,
        account_id: this.id,
        assetid: String(item.assetid),
        market_hash_name: item.market_hash_name || item.name,
        name: item.name,
        quality: item.quality || "Unique",
        tradable: !!item.tradable,
        craftable: item.craftable !== false,
        suggested_price: price?.suggested || null,
        source_price: price?.raw || null,
        confidence,
        warnings,
        status: warnings.length ? "needs_price" : "ready",
        created_at: prev?.created_at || nowIso(),
        updated_at: nowIso(),
      });
    }
    this.drafts = drafts;
    writeJson(this.paths.drafts, drafts);
    log("info", "listing_drafts_generated", { count: drafts.length, priced: drafts.filter(d => d.status === "ready").length }, this.id);
    return drafts;
  }

  async publishDraft(draftId, { dryRun = null } = {}) {
    const flags = this.safeFlags();
    const effectiveDryRun = dryRun === null ? flags.dry_run : Boolean(dryRun);
    const c = this.creds();
    const draft = this.drafts.find(d => String(d.draft_id) === String(draftId));
    if (!draft) throw new Error("Draft not found");
    if (!c.backpack_access_token) throw new Error("Backpack.tf access token is missing");
    if (!draft.suggested_price && !flags.allow_unpriced_items) throw new Error("Draft is unpriced and unpriced publishing is disabled");
    const payload = {
      intent: "sell",
      id: draft.assetid,
      currencies: { metal: Number(draft.suggested_price?.metal || 0), keys: Number(draft.suggested_price?.keys || 0) },
      details: "Listed by TF2 Trading Hub",
    };
    if (effectiveDryRun) {
      log("info", "listing_publish_dry_run", { draft_id: draft.draft_id, item: draft.name, payload }, this.id);
      return { dry_run: true, payload };
    }
    const result = await apiFetch("https://backpack.tf/api/classifieds/list/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": c.backpack_access_token, "User-Agent": `TF2-HA-TF2-Trading-Hub/${VERSION}` },
      body: JSON.stringify({ listings: [payload] }),
    }, 20000);
    log("info", "listing_published", { draft_id: draft.draft_id, item: draft.name }, this.id);
    return result;
  }

  ignoreDraft(draftId) {
    const ignored = new Set(readJson(this.paths.ignoredDrafts, []) || []);
    ignored.add(String(draftId).split(`${this.id}-`).pop());
    ignored.add(String(draftId));
    writeJson(this.paths.ignoredDrafts, [...ignored]);
    this.drafts = this.drafts.filter(d => String(d.draft_id) !== String(draftId));
    writeJson(this.paths.drafts, this.drafts);
    log("info", "listing_draft_ignored", { draft_id: draftId }, this.id);
    return this.drafts;
  }

  async archiveListing(id) {
    const c = this.creds();
    if (!c.backpack_access_token) throw new Error("Backpack.tf access token is missing");
    await apiFetch("https://backpack.tf/api/classifieds/delete/v1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "X-Auth-Token": c.backpack_access_token },
      body: JSON.stringify({ listing_id: id }),
    }, 15000);
    log("info", "listing_archived", { id }, this.id);
  }

  getOffer(id) {
    return new Promise((resolve, reject) => {
      if (!this.manager) return reject(new Error("Steam is not connected"));
      this.manager.getOffer(id, (err, offer) => err ? reject(err) : resolve(offer));
    });
  }

  async acceptOffer(id) {
    const offer = await this.getOffer(id);
    await new Promise((resolve, reject) => offer.accept((err, status) => err ? reject(err) : resolve(status)));
    this.offerQueue = this.offerQueue.filter(o => String(o.id) !== String(id));
    this.persistOffers();
    log("info", "offer_accepted", { id }, this.id);
  }

  async declineOffer(id) {
    const offer = await this.getOffer(id);
    await new Promise((resolve, reject) => offer.decline(err => err ? reject(err) : resolve()));
    this.offerQueue = this.offerQueue.filter(o => String(o.id) !== String(id));
    this.persistOffers();
    log("info", "offer_declined", { id }, this.id);
  }

  async runPipeline({ force = false } = {}) {
    if (this.pipelineRunning) return this.lastPipeline;
    this.pipelineRunning = true;
    const result = { status: "running", started_at: nowIso(), steps: [] };
    this.lastPipeline = result;
    try {
      const flags = this.safeFlags();
      await refreshPriceSchema({ accountId: this.id, force }).then(() => result.steps.push("price_schema"));
      await this.syncInventory({ force }).then(() => result.steps.push("inventory"));
      await this.syncListings().then(() => result.steps.push("listings"));
      await this.generateDrafts({ force }).then(() => result.steps.push("drafts"));
      if (flags.autonomous_enabled && flags.autonomous_publish_enabled) {
        let published = 0;
        for (const draft of this.drafts.filter(d => d.status === "ready").slice(0, Number(flags.max_publish_per_cycle || 5))) {
          await this.publishDraft(draft.draft_id, { dryRun: flags.dry_run });
          published += 1;
        }
        result.steps.push(`publish:${published}`);
      }
      if (this.manager) { try { this.manager.doPoll(); } catch { /* non-fatal */ } }
      result.status = "ok";
      result.finished_at = nowIso();
      result.dry_run = flags.dry_run;
      log("info", "pipeline_complete", { steps: result.steps, dry_run: result.dry_run }, this.id);
    } catch (err) {
      result.status = "error";
      result.error = err.message;
      result.finished_at = nowIso();
      log("warn", "pipeline_failed", { error: err.message, steps: result.steps }, this.id);
    } finally {
      this.pipelineRunning = false;
    }
    return result;
  }

  async tick() {
    if (this.tickRunning || !this.record.enabled || this.record.role === "disabled") return;
    this.tickRunning = true;
    try {
      const s = loadGlobalSettings();
      const now = Date.now();
      const invTtl = Number(s.inventory_ttl_minutes || 10) * 60 * 1000;
      const listingTtl = Number(s.listings_ttl_minutes || 5) * 60 * 1000;
      if (!this.lastInvSync || now - new Date(this.lastInvSync).getTime() > invTtl) await this.syncInventory({ force: false });
      if (!this.lastListingSync || now - new Date(this.lastListingSync).getTime() > listingTtl) await this.syncListings();
    } catch (err) {
      log("warn", "account_tick_failed", { error: err.message }, this.id);
    } finally {
      this.tickRunning = false;
    }
  }
}

const runtimes = new Map();
function getRuntime(accountId = "main") {
  const acc = findAccount(accountId);
  if (!acc) throw new Error("Account not found");
  const id = acc.account_id;
  let rt = runtimes.get(id);
  if (!rt) {
    rt = new AccountRuntime(acc);
    runtimes.set(id, rt);
  } else {
    rt.record = normalizeAccountRecord(acc);
  }
  return rt;
}
function mainRuntime() { return getRuntime((loadAccounts().find(a => a.role === "main") || loadAccounts()[0] || { account_id: "main" }).account_id); }
function allRuntimes() { return loadAccounts().map(a => getRuntime(a.account_id)); }

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

function accountResponse(rt) {
  return { ...rt.publicStatus(), record: { ...rt.record, credentials: undefined } };
}

app.get("/api/status", (_req, res) => {
  const rt = mainRuntime();
  res.json({
    ok: true,
    version: VERSION,
    ...rt.publicStatus(),
    accounts: allRuntimes().map(r => r.publicStatus()),
    pricing: pricingState,
    global_settings: loadGlobalSettings(),
  });
});
app.get("/api/version", (_req, res) => res.json({ version: VERSION }));
app.get("/api/version-audit", (_req, res) => res.json({ ok: true, app_version: VERSION, addon_version: VERSION, server_version: VERSION, package_version: readJson(path.join(__dirname, "..", "package.json"), {}).version || VERSION }));

app.get("/api/settings", (_req, res) => res.json({ ok: true, settings: loadGlobalSettings() }));
app.patch("/api/settings", (req, res) => res.json({ ok: true, settings: saveGlobalSettings(req.body || {}) }));

app.get("/api/accounts", (_req, res) => res.json({ ok: true, accounts: allRuntimes().map(accountResponse) }));
app.post("/api/accounts", wrap(async (req, res) => {
  const body = req.body || {};
  const accountId = safeId(body.account_id || body.label || `account-${Date.now()}`);
  const rec = updateAccountRecord(accountId, { ...DEFAULT_ACCOUNT_FLAGS, ...body, account_id: accountId });
  if (body.credentials) saveCreds(accountId, body.credentials);
  const rt = getRuntime(accountId);
  log("info", "account_saved", { role: rec.role, enabled: rec.enabled }, accountId);
  res.json({ ok: true, account: accountResponse(rt) });
}));
app.get("/api/accounts/:accountId", (req, res) => res.json({ ok: true, account: accountResponse(getRuntime(req.params.accountId)) }));
app.patch("/api/accounts/:accountId", (req, res) => {
  const rec = updateAccountRecord(req.params.accountId, req.body || {});
  const rt = getRuntime(rec.account_id);
  res.json({ ok: true, account: accountResponse(rt) });
});
app.delete("/api/accounts/:accountId", (req, res) => { deleteAccountRecord(req.params.accountId); res.json({ ok: true }); });

app.get("/api/credentials", (_req, res) => res.json({ ok: true, ...credentialStatus(mainRuntime().id) }));
app.post("/api/credentials", wrap(async (req, res) => {
  const rt = mainRuntime();
  saveCreds(rt.id, req.body || {});
  log("info", "credentials_saved", {}, rt.id);
  if (desiredOnline(rt.id) && ["offline", "error", "disconnected_manual"].includes(rt.status)) rt.login().catch(err => log("warn", "auto_login_after_credentials_failed", { error: err.message }, rt.id));
  res.json({ ok: true, ...credentialStatus(rt.id) });
}));
app.get("/api/accounts/:accountId/credentials", (req, res) => res.json({ ok: true, ...credentialStatus(req.params.accountId) }));
app.post("/api/accounts/:accountId/credentials", (req, res) => { saveCreds(req.params.accountId, req.body || {}); log("info", "credentials_saved", {}, req.params.accountId); res.json({ ok: true, ...credentialStatus(req.params.accountId) }); });

app.post("/api/bot/login", wrap(async (_req, res) => { const rt = mainRuntime(); await rt.login(); res.json({ ok: true, status: rt.status }); }));
app.post("/api/bot/disconnect", (_req, res) => { const rt = mainRuntime(); rt.stop("ui_disconnect"); res.json({ ok: true, status: rt.status, desired_online: desiredOnline(rt.id) }); });
app.post("/api/accounts/:accountId/bot/login", wrap(async (req, res) => { const rt = getRuntime(req.params.accountId); await rt.login(); res.json({ ok: true, status: rt.status }); }));
app.post("/api/accounts/:accountId/bot/disconnect", (req, res) => { const rt = getRuntime(req.params.accountId); rt.stop("ui_disconnect"); res.json({ ok: true, status: rt.status, desired_online: desiredOnline(rt.id) }); });
app.get("/api/accounts/:accountId/status", (req, res) => res.json({ ok: true, ...getRuntime(req.params.accountId).publicStatus() }));

app.get("/api/offers", (_req, res) => res.json({ ok: true, offers: mainRuntime().offerQueue }));
app.get("/api/accounts/:accountId/offers", (req, res) => res.json({ ok: true, offers: getRuntime(req.params.accountId).offerQueue }));
app.post("/api/offers/sync", (_req, res) => { const rt = mainRuntime(); if (rt.manager) { try { rt.manager.doPoll(); } catch (err) { log("warn", "manual_offer_poll_failed", { error: err.message }, rt.id); } } rt.lastOfferSync = nowIso(); res.json({ ok: true, offers: rt.offerQueue }); });
app.post("/api/accounts/:accountId/offers/sync", (req, res) => { const rt = getRuntime(req.params.accountId); if (rt.manager) { try { rt.manager.doPoll(); } catch (err) { log("warn", "manual_offer_poll_failed", { error: err.message }, rt.id); } } rt.lastOfferSync = nowIso(); res.json({ ok: true, offers: rt.offerQueue }); });
app.post("/api/offers/:id/accept", wrap(async (req, res) => { await mainRuntime().acceptOffer(req.params.id); res.json({ ok: true }); }));
app.post("/api/offers/:id/decline", wrap(async (req, res) => { await mainRuntime().declineOffer(req.params.id); res.json({ ok: true }); }));
app.post("/api/accounts/:accountId/offers/:offerId/accept", wrap(async (req, res) => { await getRuntime(req.params.accountId).acceptOffer(req.params.offerId); res.json({ ok: true }); }));
app.post("/api/accounts/:accountId/offers/:offerId/decline", wrap(async (req, res) => { await getRuntime(req.params.accountId).declineOffer(req.params.offerId); res.json({ ok: true }); }));

app.get("/api/listings", (_req, res) => { const rt = mainRuntime(); res.json({ ok: true, listings: rt.listings, last_sync: rt.lastListingSync, diagnostic: rt.lastBptfDiagnostic, error: rt.lastListingError }); });
app.post("/api/listings/sync", wrap(async (_req, res) => { const rt = mainRuntime(); const listings = await rt.syncListings(); res.json({ ok: true, listings, last_sync: rt.lastListingSync, diagnostic: rt.lastBptfDiagnostic, error: rt.lastListingError }); }));
app.delete("/api/listings/:id", wrap(async (req, res) => { const rt = mainRuntime(); await rt.archiveListing(req.params.id); await rt.syncListings().catch(() => {}); res.json({ ok: true }); }));
app.post("/api/accounts/:accountId/backpack/sync", wrap(async (req, res) => { const rt = getRuntime(req.params.accountId); const listings = await rt.syncListings(); res.json({ ok: true, listings, diagnostic: rt.lastBptfDiagnostic }); }));
app.get("/api/accounts/:accountId/backpack/diagnostics", (req, res) => { const rt = getRuntime(req.params.accountId); res.json({ ok: true, listing_count: rt.listings.length, last_listing_sync: rt.lastListingSync, listing_error: rt.lastListingError, diagnostic: rt.lastBptfDiagnostic, pricing: pricingState, credentials: credentialStatus(rt.id) }); });
app.get("/api/backpack/diagnostics", (_req, res) => { const rt = mainRuntime(); res.json({ ok: true, listing_count: rt.listings.length, last_listing_sync: rt.lastListingSync, listing_error: rt.lastListingError, diagnostic: rt.lastBptfDiagnostic, pricing: pricingState, credentials: credentialStatus(rt.id) }); });


app.post("/api/backpack/sync", wrap(async (_req, res) => {
  const rt = mainRuntime();
  const listings = await rt.syncListings();
  res.json({ ok: true, listings, diagnostic: rt.lastBptfDiagnostic });
}));
app.get("/api/accounts/:accountId/listings", (req, res) => {
  const rt = getRuntime(req.params.accountId);
  res.json({ ok: true, listings: rt.listings, last_sync: rt.lastListingSync, diagnostic: rt.lastBptfDiagnostic, error: rt.lastListingError });
});

app.get("/api/inventory", (_req, res) => { const rt = mainRuntime(); res.json({ ok: true, inventory: rt.inventory, count: rt.inventory.length, last_sync: rt.lastInvSync, source: rt.lastInvSource, error: rt.lastInvError }); });
app.post("/api/inventory/sync", wrap(async (_req, res) => { const rt = mainRuntime(); await rt.syncInventory({ force: true, throwOnError: true }); res.json({ ok: true, inventory: rt.inventory, count: rt.inventory.length, last_sync: rt.lastInvSync, source: rt.lastInvSource }); }));
app.post("/api/accounts/:accountId/inventory/sync", wrap(async (req, res) => { const rt = getRuntime(req.params.accountId); await rt.syncInventory({ force: true, throwOnError: true }); res.json({ ok: true, inventory: rt.inventory, count: rt.inventory.length, last_sync: rt.lastInvSync, source: rt.lastInvSource }); }));


app.get("/api/accounts/:accountId/inventory", (req, res) => {
  const rt = getRuntime(req.params.accountId);
  res.json({ ok: true, inventory: rt.inventory, count: rt.inventory.length, last_sync: rt.lastInvSync, source: rt.lastInvSource, error: rt.lastInvError });
});

app.get("/api/prices/schema", wrap(async (_req, res) => { const schema = await refreshPriceSchema(); res.json({ ok: true, has_schema: !!schema, ...pricingState }); }));
app.post("/api/prices/schema/refresh", wrap(async (_req, res) => { const schema = await refreshPriceSchema({ force: true }); res.json({ ok: true, has_schema: !!schema, ...pricingState }); }));
app.get("/api/prices/lookup", wrap(async (req, res) => { const schema = await refreshPriceSchema(); const price = lookupPrice(schema, String(req.query.name || ""), String(req.query.quality || "Unique")); res.json({ ok: true, name: req.query.name || "", found: !!price, price }); }));

app.get("/api/listing-drafts", (_req, res) => { const rt = mainRuntime(); res.json({ ok: true, drafts: rt.drafts }); });
app.post("/api/listing-drafts/generate", wrap(async (_req, res) => { const rt = mainRuntime(); const drafts = await rt.generateDrafts({ force: true }); res.json({ ok: true, drafts }); }));
app.post("/api/listing-drafts/:id/publish", wrap(async (req, res) => { const result = await mainRuntime().publishDraft(req.params.id, req.body || {}); res.json({ ok: true, result }); }));
app.post("/api/listing-drafts/:id/ignore", (req, res) => { const drafts = mainRuntime().ignoreDraft(req.params.id); res.json({ ok: true, drafts }); });
app.get("/api/accounts/:accountId/listing-drafts", (req, res) => res.json({ ok: true, drafts: getRuntime(req.params.accountId).drafts }));
app.post("/api/accounts/:accountId/listing-drafts/generate", wrap(async (req, res) => { const drafts = await getRuntime(req.params.accountId).generateDrafts({ force: true }); res.json({ ok: true, drafts }); }));
app.post("/api/accounts/:accountId/listing-drafts/:draftId/publish", wrap(async (req, res) => { const result = await getRuntime(req.params.accountId).publishDraft(req.params.draftId, req.body || {}); res.json({ ok: true, result }); }));
app.post("/api/accounts/:accountId/listing-drafts/:draftId/ignore", (req, res) => { const drafts = getRuntime(req.params.accountId).ignoreDraft(req.params.draftId); res.json({ ok: true, drafts }); });

app.post("/api/pipeline/run", wrap(async (_req, res) => { const rt = mainRuntime(); const result = await rt.runPipeline({ force: true }); res.json({ ok: true, result }); }));
app.post("/api/accounts/:accountId/pipeline/run", wrap(async (req, res) => { const result = await getRuntime(req.params.accountId).runPipeline({ force: true }); res.json({ ok: true, result }); }));

app.get("/api/events", (_req, res) => {
  try {
    const lines = fs.existsSync(GLOBAL.audit) ? fs.readFileSync(GLOBAL.audit, "utf8").trim().split("\n").filter(Boolean).slice(-300) : [];
    const events = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
    res.json({ ok: true, events });
  } catch { res.json({ ok: true, events: [] }); }
});
app.get("/api/events/stream", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no" });
  const send = data => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const onLog = entry => send({ type: "log", entry });
  const onStatus = status => send({ type: "status", status });
  const onOffer = offer => send({ type: "offer", offer });
  bus.on("log", onLog); bus.on("status", onStatus); bus.on("offer", onOffer);
  const hb = setInterval(() => res.write(": ping\n\n"), 25000);
  req.on("close", () => { clearInterval(hb); bus.off("log", onLog); bus.off("status", onStatus); bus.off("offer", onOffer); });
});

app.get("/api/diagnostics", (_req, res) => res.json({ ok: true, version: VERSION, accounts: allRuntimes().map(r => r.publicStatus()), pricing: pricingState, node_version: process.version }));
app.get("/api/diagnostics/bundle", (_req, res) => {
  const accounts = allRuntimes().map(r => r.publicStatus());
  res.json({
    ok: true,
    version: VERSION,
    status: mainRuntime().status,
    accounts,
    active_sessions_count: accounts.filter(a => a.status === "online").length,
    connected_steam_accounts: accounts.filter(a => a.steam_id).map(a => ({ account_id: a.account_id, steam_id: a.steam_id, status: a.status })),
    failed_accounts: accounts.filter(a => ["error", "steamguard_required"].includes(a.status)),
    pricing: pricingState,
    global_settings: loadGlobalSettings(),
    files: { accounts_exists: fs.existsSync(GLOBAL.accounts), price_schema_exists: fs.existsSync(GLOBAL.priceSchema), global_audit_exists: fs.existsSync(GLOBAL.audit) },
    node_version: process.version,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

app.use((err, req, res, _next) => {
  log("error", "request_error", { method: req.method, path: req.path, error: err.message });
  res.status(500).json({ ok: false, error: err.message });
});

async function schedulerTick() {
  for (const rt of allRuntimes()) await rt.tick();
}

async function main() {
  ensureDir(DATA_DIR); ensureDir(ACCOUNTS_DIR);
  loadAccounts();
  loadCachedPriceSchema();
  process.on("uncaughtException", err => log("error", "uncaught_exception", { error: err.message, stack: err.stack?.split("\n")[0] }));
  process.on("unhandledRejection", reason => log("error", "unhandled_rejection", { error: String(reason) }));
  process.on("SIGTERM", () => {
    log("info", "sigterm_received", {});
    for (const rt of allRuntimes()) rt.stop("sigterm", { keepDesired: true });
    process.exit(0);
  });
  log("info", "server_starting", { version: VERSION, port: PORT });
  app.listen(PORT, "0.0.0.0", () => log("info", "server_listening", { port: PORT }));
  for (const rt of allRuntimes()) {
    if (desiredOnline(rt.id) && rt.record.enabled && !["disabled", "pricing_only"].includes(rt.record.role)) {
      rt.login().catch(err => log("warn", "initial_login_error", { error: err.message }, rt.id));
    }
  }
  setInterval(() => schedulerTick().catch(err => log("error", "scheduler_error", { error: err.message })), 60 * 1000);
  log("info", "server_ready", { version: VERSION });
}

main().catch(err => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
