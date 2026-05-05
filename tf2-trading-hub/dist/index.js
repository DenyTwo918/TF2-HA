'use strict';

const express          = require('express');
const SteamUser        = require('steam-user');
const SteamCommunity   = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp        = require('steam-totp');
const fs               = require('fs');
const path             = require('path');
const { EventEmitter } = require('events');

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSION  = '5.13.67';
const PORT     = Number(process.env.PORT  || 8099);
const DATA_DIR = process.env.DATA_DIR    || '/data';

// ─── Event bus ────────────────────────────────────────────────────────────────

const bus = new EventEmitter();
bus.setMaxListeners(200);

// ─── Global paths ─────────────────────────────────────────────────────────────

const G = {
  accounts:       path.join(DATA_DIR, 'tf2-hub-accounts.json'),
  globalSettings: path.join(DATA_DIR, 'tf2-hub-global-settings.json'),
  globalAudit:    path.join(DATA_DIR, 'tf2-hub-global-audit.jsonl'),
  priceSchema:    path.join(DATA_DIR, 'tf2-hub-price-schema.json'),
  options:        path.join(DATA_DIR, 'options.json'),
};

// ─── Per-account paths ────────────────────────────────────────────────────────

function accountDir(id) { return path.join(DATA_DIR, 'accounts', id); }
function AP(id) {
  const dir = accountDir(id);
  return {
    dir,
    credentials: path.join(dir, 'credentials.json'),
    runtime:     path.join(dir, 'runtime-state.json'),
    inventory:   path.join(dir, 'inventory-cache.json'),
    listings:    path.join(dir, 'listings-cache.json'),
    drafts:      path.join(dir, 'listing-drafts.json'),
    ignored:     path.join(dir, 'ignored-drafts.json'),
    pollData:    path.join(dir, 'tradeoffer-poll.json'),
    audit:       path.join(dir, 'audit.jsonl'),
  };
}

// Legacy single-account paths for migration
const LEGACY = {
  creds:       path.join(DATA_DIR, 'tf2-hub-credentials.json'),
  runtime:     path.join(DATA_DIR, 'tf2-hub-runtime-state.json'),
  inventory:   path.join(DATA_DIR, 'tf2-hub-inventory-cache.json'),
  listings:    path.join(DATA_DIR, 'steam-companion-backpack-listings.json'),
  priceSchema: path.join(DATA_DIR, 'tf2-hub-backpack-price-schema.json'),
  drafts:      path.join(DATA_DIR, 'tf2-hub-listing-drafts.json'),
  ignored:     path.join(DATA_DIR, 'tf2-hub-ignored-drafts.json'),
  pollData:    path.join(DATA_DIR, 'steam-tradeoffer-poll.json'),
  audit:       path.join(DATA_DIR, 'steam-companion-audit.jsonl'),
};

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}

function writeJson(p, data) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, p);
}

function appendLine(filePath, obj) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(filePath, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n', 'utf8');
  } catch { /* non-fatal */ }
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(level, event, data = {}) {
  const entry = { level, event, ...data };
  console.log(`[${level.toUpperCase()}] ${event}`, Object.keys(data).length ? data : '');
  appendLine(G.globalAudit, entry);
  bus.emit('log', entry);
}

function accountLog(accountId, level, event, data = {}) {
  const entry = { level, event, account_id: accountId, ...data };
  console.log(`[${level.toUpperCase()}][${accountId}] ${event}`, Object.keys(data).length ? data : '');
  appendLine(AP(accountId).audit, entry);
  appendLine(G.globalAudit, entry);
  bus.emit('log', entry);
}

// ─── Global settings ──────────────────────────────────────────────────────────

const DEFAULT_GLOBAL_SETTINGS = {
  autonomous_enabled:               false,
  autonomous_publish_enabled:       false,
  autonomous_trade_accept_enabled:  false,
  min_profit_ref:                   0,
  max_publish_per_cycle:            5,
  max_trade_accept_per_cycle:       3,
  require_price_confidence:         true,
  allow_unpriced_items:             false,
  dry_run:                          true,
  max_parallel_accounts:            1,
};

function getGlobalSettings() {
  return { ...DEFAULT_GLOBAL_SETTINGS, ...readJson(G.globalSettings, {}) };
}

function saveGlobalSettings(patch) {
  const next = { ...getGlobalSettings(), ...patch };
  writeJson(G.globalSettings, next);
  return next;
}

function getOptions() { return readJson(G.options, {}); }

// ─── Account CRUD ─────────────────────────────────────────────────────────────

const DEFAULT_ACCOUNT_SETTINGS = {
  role:                             'main',
  enabled:                          false,
  dry_run:                          true,
  autonomous_enabled:               false,
  autonomous_publish_enabled:       false,
  autonomous_trade_accept_enabled:  false,
  min_profit_ref:                   0,
  max_publish_per_cycle:            5,
  max_trade_accept_per_cycle:       3,
  require_price_confidence:         true,
  allow_unpriced_items:             false,
};

function loadAccounts() { return readJson(G.accounts, []); }
function saveAccounts(accounts) { writeJson(G.accounts, accounts); }
function getAccount(id) { return loadAccounts().find(a => a.account_id === id) || null; }

function upsertAccount(data) {
  const accounts = loadAccounts();
  const idx = accounts.findIndex(a => a.account_id === data.account_id);
  const now = new Date().toISOString();
  if (idx >= 0) {
    accounts[idx] = { ...accounts[idx], ...data, updated_at: now };
  } else {
    accounts.push({ ...DEFAULT_ACCOUNT_SETTINGS, created_at: now, updated_at: now, ...data });
  }
  saveAccounts(accounts);
  return getAccount(data.account_id);
}

function deleteAccount(id) {
  saveAccounts(loadAccounts().filter(a => a.account_id !== id));
}

function getMainAccountId() {
  const accounts = loadAccounts();
  const main = accounts.find(a => a.role === 'main') || accounts[0];
  return main?.account_id || 'main';
}

// ─── Credentials (per account) ────────────────────────────────────────────────

const CRED_FIELDS = [
  'username', 'password', 'shared_secret', 'identity_secret',
  'steam_api_key', 'bptf_token', 'bptf_api_key', 'steam_id',
];

function loadCreds(accountId) { return readJson(AP(accountId).credentials, {}); }

function saveCreds(accountId, patch) {
  const cur = loadCreds(accountId);
  const next = { ...cur };
  for (const f of CRED_FIELDS) {
    if (patch[f] !== undefined && patch[f] !== '') next[f] = patch[f];
    if (patch[`_clear_${f}`] === true) delete next[f];
  }
  writeJson(AP(accountId).credentials, next);
  return next;
}

function credStatus(accountId) {
  const c = loadCreds(accountId);
  return {
    has_username:        !!c.username,
    has_password:        !!c.password,
    has_shared_secret:   !!c.shared_secret,
    has_identity_secret: !!c.identity_secret,
    has_steam_api_key:   !!c.steam_api_key,
    has_bptf_token:      !!c.bptf_token,
    has_bptf_api_key:    !!c.bptf_api_key,
    steam_id:            c.steam_id || null,
    username:            c.username || null,
  };
}

// ─── Runtime state (per account) ──────────────────────────────────────────────

function loadRuntime(accountId) {
  return readJson(AP(accountId).runtime, { desired_online: true });
}

function setDesiredOnline(accountId, value, reason = 'manual') {
  const next = { ...loadRuntime(accountId), desired_online: Boolean(value), reason, updated_at: new Date().toISOString() };
  writeJson(AP(accountId).runtime, next);
  return next;
}

function wantsOnline(accountId) {
  return loadRuntime(accountId).desired_online !== false;
}

// ─── Session state ────────────────────────────────────────────────────────────

const sessions = new Map();

function createSession(accountId) {
  return {
    accountId,
    status:           'offline',
    loginError:       null,
    steamId:          null,
    displayName:      null,
    offerQueue:       [],
    listings:         readJson(AP(accountId).listings, []),
    lastListingError: null,
    lastListingSource: null,
    lastBptfDiagnostic: { status: 'not_checked' },
    inventory:        readJson(AP(accountId).inventory, []),
    lastOfferSync:    null,
    lastListingSync:  null,
    lastInvSync:      null,
    lastInvError:     null,
    invFailureCount:  0,
    nextInvSyncAfter: null,
    lastInvSource:    null,
    lastInvFailureLogAt: 0,
    offerManagerReady: false,
    pipelineRunning:  false,
    lastPipelineResult: null,
    startedAt:        new Date().toISOString(),
    desiredOnline:    wantsOnline(accountId),
    client:           null,
    community:        null,
    manager:          null,
    reconnectTimer:   null,
  };
}

function getSession(accountId) {
  if (!sessions.has(accountId)) sessions.set(accountId, createSession(accountId));
  return sessions.get(accountId);
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch(url, opts = {}, timeoutMs = 20000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res  = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await res.text();
    let body;
    try { body = text ? JSON.parse(text) : {}; }
    catch { body = { raw: text }; }
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body });
    return body;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Price schema (global — uses bptf_api_key, not access token) ──────────────

let _priceSchemaCache   = null;
let _priceSchemaTTL     = 0;
let _lastPriceSchemaSync  = null;
let _lastPriceSchemaError = null;
let _priceSchemaStatus  = 'not_loaded';

function getPriceItemCount(schema) {
  return Object.keys(schema?.response?.items || schema?.items || {}).length;
}

function summarizeBptfError(err) {
  const body = err?.body || {};
  return {
    error:   err?.message || 'Unknown error',
    status:  err?.status  || null,
    message: body.message || body.error || body.raw || null,
  };
}

function findPricingApiKey() {
  for (const account of loadAccounts()) {
    const c = loadCreds(account.account_id);
    if (c.bptf_api_key) return c.bptf_api_key;
  }
  // Fallback to legacy file
  const legacyCreds = readJson(LEGACY.creds, {});
  return legacyCreds.bptf_api_key || null;
}

async function getPriceSchema() {
  if (_priceSchemaCache && Date.now() < _priceSchemaTTL) return _priceSchemaCache;

  const apiKey = findPricingApiKey();
  if (!apiKey) {
    const cached = readJson(G.priceSchema, null) || readJson(LEGACY.priceSchema, null);
    _priceSchemaStatus = cached ? 'cached_no_key' : 'no_key';
    if (cached) {
      _priceSchemaCache = cached;
      _priceSchemaTTL   = Date.now() + 5 * 60 * 1000;
    }
    return cached;
  }

  try {
    const data = await apiFetch(
      `https://backpack.tf/api/IGetPrices/v4?key=${encodeURIComponent(apiKey)}&appid=440`,
      {}, 30000
    );
    _priceSchemaCache    = data;
    _priceSchemaTTL      = Date.now() + 60 * 60 * 1000;
    _lastPriceSchemaSync = new Date().toISOString();
    _lastPriceSchemaError = null;
    _priceSchemaStatus   = 'ok';
    writeJson(G.priceSchema, data);
    log('info', 'price_schema_updated', { count: getPriceItemCount(data) });
    return data;
  } catch (err) {
    const detail = summarizeBptfError(err);
    _lastPriceSchemaError = detail;
    _priceSchemaStatus = err.status === 403 ? 'forbidden_check_api_key' : 'error';
    if (err.status === 403) {
      log('warn', 'price_schema_forbidden', {
        hint: 'Use bptf_api_key (not the access token) for price schema. The API key is different from your account access token.',
        ...detail,
      });
    } else {
      log('warn', 'price_schema_fetch_failed', detail);
    }
    const cached = readJson(G.priceSchema, null) || readJson(LEGACY.priceSchema, null);
    if (cached) { _priceSchemaCache = cached; _priceSchemaTTL = Date.now() + 5 * 60 * 1000; }
    return cached;
  }
}

function lookupPrice(name, schema) {
  if (!schema) return null;
  const items = schema?.response?.items || schema?.items || {};
  const key = Object.keys(items).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? items[key] : null;
}

// ─── Listings sync (per account — uses bptf_token access token) ───────────────

function extractListingsPayload(data) {
  const candidates = [
    data?.listings, data?.response?.listings,
    data?.results,  data?.response?.results,
    data?.classifieds, data?.response?.classifieds,
    data?.data?.listings, data?.data?.results,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  for (const c of candidates) {
    if (c && typeof c === 'object') {
      const vals = Object.values(c).flatMap(v => Array.isArray(v) ? v : [v]);
      if (vals.length) return vals;
    }
  }
  return [];
}

function normalizeListing(l) {
  const item = l?.item || l?.item_details || l?.details || {};
  const currencies = l?.currencies || l?.price || l?.currencies_raw || {};
  const intentRaw = l?.intent ?? l?.listing_intent ?? l?.buyout;
  return {
    id:        String(l?.id || l?.listing_id || l?._id || `${Date.now()}-${Math.random()}`),
    intent:    intentRaw === 0 || intentRaw === 'buy' ? 'buy' : 'sell',
    item_name: item?.name || l?.item_name || l?.name || l?.market_hash_name || 'Unknown item',
    currencies,
    bump:      l?.bump || l?.bumped_at || null,
    created:   l?.created || l?.created_at || null,
  };
}

async function syncListings(accountId) {
  const sess   = getSession(accountId);
  const creds  = loadCreds(accountId);
  const paths  = AP(accountId);
  const steamId = String(creds.steam_id || sess.steamId || '').trim();
  sess.lastListingError = null;

  if (!creds.bptf_token) {
    sess.listings = readJson(paths.listings, []);
    sess.lastBptfDiagnostic = {
      status:       'missing_token',
      message:      'Backpack.tf access token (bptf_token) is not saved. Add it in Credentials.',
      account_id:   accountId,
      steam_id:     steamId || null,
      cached_count: sess.listings.length,
    };
    return sess.listings;
  }
  if (!steamId) {
    sess.listings = readJson(paths.listings, []);
    sess.lastBptfDiagnostic = {
      status:       'missing_steamid',
      message:      'SteamID64 is missing. Save it in Credentials or connect the bot first.',
      account_id:   accountId,
      cached_count: sess.listings.length,
    };
    return sess.listings;
  }

  try {
    const url = `https://backpack.tf/api/classifieds/listings/v1?token=${encodeURIComponent(creds.bptf_token)}&steamid=${encodeURIComponent(steamId)}`;
    const data = await apiFetch(url, {}, 20000);
    const raw  = extractListingsPayload(data);
    const parsed = raw.map(normalizeListing).filter(l => l.id);
    sess.listings        = parsed;
    sess.lastListingSync = new Date().toISOString();
    sess.lastListingSource = 'backpack_classifieds';
    sess.lastBptfDiagnostic = {
      status:       parsed.length ? 'ok' : 'empty',
      message:      parsed.length
        ? `Loaded ${parsed.length} active listings.`
        : 'Backpack.tf returned zero active listings for this SteamID. This can be normal if the account has no active classifieds.',
      account_id:   accountId,
      steam_id:     steamId,
      response_keys: data && typeof data === 'object' ? Object.keys(data).slice(0, 12) : [],
      raw_count:    raw.length,
      parsed_count: parsed.length,
      token_saved:  true,
    };
    writeJson(paths.listings, sess.listings);
    accountLog(accountId, 'info', 'listings_synced', { count: parsed.length, status: sess.lastBptfDiagnostic.status });
  } catch (err) {
    const detail = summarizeBptfError(err);
    sess.lastListingError = detail.error;
    const statusMap = { 401: 'unauthorized', 403: 'forbidden', 429: 'rate_limited' };
    sess.lastBptfDiagnostic = {
      status:      statusMap[err.status] || 'api_error',
      message:     detail.message || detail.error,
      http_status: detail.status,
      account_id:  accountId,
      steam_id:    steamId,
      token_saved: true,
    };
    accountLog(accountId, 'warn', 'listings_sync_failed', detail);
    const cached = readJson(paths.listings, null);
    if (cached) sess.listings = cached;
  }
  return sess.listings;
}

async function archiveListing(accountId, listingId) {
  const creds = loadCreds(accountId);
  if (!creds.bptf_token) throw new Error('No Backpack.tf access token configured');
  await apiFetch('https://backpack.tf/api/classifieds/delete/v1', {
    method:  'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': creds.bptf_token },
    body:    JSON.stringify({ listing_id: listingId }),
  }, 15000);
  accountLog(accountId, 'info', 'listing_archived', { id: listingId });
}

async function publishListingRaw(accountId, payload) {
  const creds = loadCreds(accountId);
  if (!creds.bptf_token) throw new Error('No Backpack.tf access token configured');
  const data = await apiFetch('https://backpack.tf/api/classifieds/list/v1', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': creds.bptf_token },
    body:    JSON.stringify({ listings: [payload] }),
  }, 15000);
  accountLog(accountId, 'info', 'listing_published_raw', {});
  return data;
}

// ─── Inventory sync (per account) ─────────────────────────────────────────────

function normalizeInventoryItem(item) {
  const qualityTag   = item.tags?.find(t => t.category === 'Quality');
  const craftableTag = item.tags?.find(t => t.category === 'Craftable');
  return {
    assetid:  item.assetid || item.id,
    classid:  item.classid || null,
    name:     item.market_hash_name || item.name || 'Unknown',
    quality:  qualityTag?.localized_tag_name || qualityTag?.name || '',
    tradable: item.tradable !== false && item.tradable !== 0,
    craftable: craftableTag ? craftableTag.internal_name !== 'tag_not_craftable' : true,
    amount:   Number(item.amount) || 1,
  };
}

function getCommunityInventory(accountId) {
  const sess   = getSession(accountId);
  const creds  = loadCreds(accountId);
  const steamId = creds.steam_id || sess.steamId;
  return new Promise((resolve, reject) => {
    if (!sess.community || typeof sess.community.getUserInventoryContents !== 'function')
      return reject(new Error('Steam community not ready'));
    sess.community.getUserInventoryContents(steamId, 440, '2', true, (err, inv) => {
      if (err) return reject(err);
      resolve(Array.isArray(inv) ? inv : []);
    });
  });
}

function getManagerInventory(accountId) {
  const sess = getSession(accountId);
  return new Promise((resolve, reject) => {
    if (!sess.manager || !sess.offerManagerReady)
      return reject(new Error('Offer manager not ready'));
    sess.manager.getInventoryContents(440, '2', true, (err, inv) => {
      if (err) return reject(err);
      resolve(Array.isArray(inv) ? inv : []);
    });
  });
}

async function getSteamWebApiInventory(accountId) {
  const creds  = loadCreds(accountId);
  const sess   = getSession(accountId);
  if (!creds.steam_api_key) throw new Error('No Steam Web API key');
  const steamId = creds.steam_id || sess.steamId;
  const url = `https://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/?key=${encodeURIComponent(creds.steam_api_key)}&steamid=${encodeURIComponent(steamId)}&format=json`;
  const data = await apiFetch(url, {}, 20000);
  return (data?.result?.items || []).map(i => ({
    assetid:  i.id || `${i.defindex}-${i.inventory || Math.random()}`,
    classid:  String(i.defindex || ''),
    name:     i.name || `TF2 item #${i.defindex}`,
    quality:  i.quality !== undefined ? String(i.quality) : '',
    tradable: !(i.flag_cannot_trade || i.cannot_trade),
    craftable: true,
    amount:   Number(i.quantity || 1),
  }));
}

async function getPublicInventory(accountId) {
  const creds  = loadCreds(accountId);
  const sess   = getSession(accountId);
  const steamId = creds.steam_id || sess.steamId;
  const url = `https://steamcommunity.com/inventory/${encodeURIComponent(steamId)}/440/2?l=english&count=5000`;
  const data = await apiFetch(url, {}, 20000);
  const descs = new Map((data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d]));
  return (data.assets || []).map(a => {
    const desc = descs.get(`${a.classid}_${a.instanceid}`) || {};
    return {
      assetid:  a.assetid,
      classid:  a.classid,
      name:     desc.market_hash_name || desc.name || 'Unknown',
      quality:  desc.tags?.find(t => t.category === 'Quality')?.localized_tag_name || '',
      tradable: desc.tradable === 1,
      craftable: true,
      amount:   Number(a.amount) || 1,
    };
  });
}

async function getInventoryViaSources(accountId) {
  const sources = [
    ['community_session',   () => getCommunityInventory(accountId)],
    ['tradeoffer_manager',  () => getManagerInventory(accountId)],
    ['steam_web_api',       () => getSteamWebApiInventory(accountId)],
    ['public_inventory',    () => getPublicInventory(accountId)],
  ];
  const attempts = [];
  for (const [source, loader] of sources) {
    try { return { source, items: await loader() }; }
    catch (err) { attempts.push(`${source}: ${err.message}`); }
  }
  const e = new Error(attempts.join(' | '));
  e.attempts = attempts;
  throw e;
}

async function syncInventory(accountId, { force = false, throwOnError = false } = {}) {
  const sess  = getSession(accountId);
  const creds = loadCreds(accountId);
  const steamId = creds.steam_id || sess.steamId;

  if (!steamId) {
    const err = new Error('No SteamID64 available for inventory sync');
    sess.lastInvError = err.message;
    if (throwOnError) throw err;
    return sess.inventory;
  }
  if (!force && sess.nextInvSyncAfter && Date.now() < new Date(sess.nextInvSyncAfter).getTime())
    return sess.inventory;

  try {
    const { source, items } = await getInventoryViaSources(accountId);
    sess.inventory      = items.map(normalizeInventoryItem).filter(i => i.tradable);
    sess.lastInvSync    = new Date().toISOString();
    sess.lastInvError   = null;
    sess.invFailureCount = 0;
    sess.nextInvSyncAfter = null;
    sess.lastInvSource  = source;
    writeJson(AP(accountId).inventory, sess.inventory);
    accountLog(accountId, 'info', 'inventory_synced', { count: sess.inventory.length, source });
  } catch (err) {
    sess.lastInvError    = err.message || String(err);
    sess.invFailureCount += 1;
    const delayMin = Math.min(30, Math.max(2, sess.invFailureCount * 2));
    sess.nextInvSyncAfter = new Date(Date.now() + delayMin * 60000).toISOString();
    const now = Date.now();
    if (force || sess.invFailureCount === 1 || now - sess.lastInvFailureLogAt > 10 * 60000) {
      sess.lastInvFailureLogAt = now;
      accountLog(accountId, 'warn', 'inventory_sync_failed', { error: sess.lastInvError, retry_after: sess.nextInvSyncAfter });
    }
    if (throwOnError) throw err;
  }
  return sess.inventory;
}

// ─── Listing drafts (per account) ─────────────────────────────────────────────

function loadDrafts(accountId)  { return readJson(AP(accountId).drafts,  []); }
function saveDrafts(accountId, d) { writeJson(AP(accountId).drafts, d); }
function loadIgnored(accountId) { return readJson(AP(accountId).ignored, []); }
function saveIgnored(accountId, d) { writeJson(AP(accountId).ignored, d); }

async function generateDrafts(accountId) {
  const sess    = getSession(accountId);
  const schema  = await getPriceSchema().catch(() => null);
  const items   = sess.inventory.length
    ? sess.inventory
    : await syncInventory(accountId).catch(() => []);
  const ignoredSet = new Set(loadIgnored(accountId).map(i => i.assetid));
  const existing   = new Map(loadDrafts(accountId).map(d => [d.assetid, d]));
  const now = new Date().toISOString();
  const drafts = [];

  for (const item of items) {
    if (!item.tradable)            continue;
    if (ignoredSet.has(item.assetid)) continue;

    const draftId = `${accountId}-${item.assetid}`;
    const prev    = existing.get(item.assetid);

    let suggested_sell_price = null;
    let confidence = 'none';
    let status = 'needs_price';
    const warnings = [];

    const priceEntry = schema ? lookupPrice(item.name, schema) : null;
    if (priceEntry) {
      const sellData = priceEntry.prices?.['6']?.Tradable?.Craftable?.[0];
      if (sellData) {
        suggested_sell_price = sellData.value_raw || sellData.value || null;
        confidence = 'schema';
        status = 'ready';
      }
    }
    if (!suggested_sell_price) warnings.push('No price found in schema');
    if (!item.craftable)       warnings.push('Non-craftable item');

    drafts.push({
      draft_id:            draftId,
      account_id:          accountId,
      assetid:             item.assetid,
      classid:             item.classid,
      market_hash_name:    item.name,
      quality:             item.quality,
      tradable:            item.tradable,
      craftable:           item.craftable,
      suggested_sell_price,
      source_price:        suggested_sell_price,
      confidence,
      status,
      warnings,
      created_at:          prev?.created_at || now,
      updated_at:          now,
    });
  }

  saveDrafts(accountId, drafts);
  accountLog(accountId, 'info', 'drafts_generated', {
    count:  drafts.length,
    priced: drafts.filter(d => d.status === 'ready').length,
  });
  return drafts;
}

async function publishDraft(accountId, draftId) {
  const account       = getAccount(accountId);
  const globalSettings = getGlobalSettings();
  const dryRun        = account?.dry_run ?? globalSettings.dry_run ?? true;
  const allowUnpriced = account?.allow_unpriced_items ?? globalSettings.allow_unpriced_items ?? false;

  const drafts = loadDrafts(accountId);
  const draft  = drafts.find(d => d.draft_id === draftId);
  if (!draft) throw new Error(`Draft ${draftId} not found`);

  if (draft.status === 'needs_price' && !allowUnpriced)
    throw new Error('Draft has no price. Enable allow_unpriced_items to publish unpriced items.');

  const auditEntry = {
    account_id: accountId, draft_id: draftId,
    item: draft.market_hash_name,
    price: draft.suggested_sell_price,
    dry_run: dryRun,
  };

  if (dryRun) {
    accountLog(accountId, 'info', 'draft_publish_simulated', { ...auditEntry, action: 'simulated_publish' });
    return { ok: true, dry_run: true, draft_id: draftId, item: draft.market_hash_name };
  }

  const payload = {
    intent: 1,
    item:   { quality: 6, name: draft.market_hash_name },
    currencies: draft.suggested_sell_price ? { metal: draft.suggested_sell_price } : { metal: 0.11 },
    details: `Selling ${draft.market_hash_name}`,
    buyout: 1,
    offers: 1,
  };
  await publishListingRaw(accountId, payload);
  accountLog(accountId, 'info', 'draft_published', { ...auditEntry, action: 'published' });

  saveDrafts(accountId, drafts.map(d =>
    d.draft_id === draftId ? { ...d, status: 'published', published_at: new Date().toISOString() } : d
  ));
  return { ok: true, dry_run: false, draft_id: draftId, item: draft.market_hash_name };
}

async function ignoreDraft(accountId, draftId) {
  const drafts = loadDrafts(accountId);
  const draft  = drafts.find(d => d.draft_id === draftId);
  if (!draft) throw new Error(`Draft ${draftId} not found`);

  const ignored = loadIgnored(accountId);
  ignored.push({ draft_id: draftId, assetid: draft.assetid, item: draft.market_hash_name, ignored_at: new Date().toISOString() });
  saveIgnored(accountId, ignored);
  saveDrafts(accountId, drafts.filter(d => d.draft_id !== draftId));
  return { ok: true };
}

// ─── Trade offer evaluation ───────────────────────────────────────────────────

async function evaluateOffer(offerEntry, schema) {
  const tags = [];
  let valueIn = 0, valueOut = 0, unknownItems = 0;

  function itemValue(item) {
    if (!schema) return null;
    const pe = lookupPrice(item.name, schema);
    const sd = pe?.prices?.['6']?.Tradable?.Craftable?.[0];
    return sd?.value_raw || sd?.value || null;
  }

  for (const item of (offerEntry.items_to_receive || [])) {
    const v = itemValue(item);
    if (v) valueIn += v; else unknownItems++;
  }
  for (const item of (offerEntry.items_to_give || [])) {
    const v = itemValue(item);
    if (v) valueOut += v; else unknownItems++;
  }

  const isGift  = offerEntry.is_gift || (!offerEntry.items_to_give?.length && offerEntry.items_to_receive?.length > 0);
  const isEmpty = !offerEntry.items_to_give?.length && !offerEntry.items_to_receive?.length;
  const profit  = valueIn - valueOut;

  if (isGift)       tags.push('gift');
  if (isEmpty)      tags.push('empty');
  if (!schema)      tags.push('no_pricing');
  if (unknownItems) tags.push('unpriced');
  if (profit > 0.1) tags.push('profit');
  else if (profit < -0.1) tags.push('loss');

  const recommendation = (isGift || isEmpty || unknownItems || !schema)
    ? 'manual_review' : profit >= 0 ? 'safe' : 'manual_review';
  tags.push(recommendation === 'safe' ? 'safe' : 'manual_review');

  return { value_in: valueIn, value_out: valueOut, profit, unknown_items: unknownItems, tags, recommendation, evaluated_at: new Date().toISOString() };
}

// ─── Steam client (per account) ───────────────────────────────────────────────

function clearReconnectTimer(accountId) {
  const sess = getSession(accountId);
  if (sess.reconnectTimer) { clearTimeout(sess.reconnectTimer); sess.reconnectTimer = null; }
}

function scheduleReconnect(accountId, delayMs = 30000) {
  const sess = getSession(accountId);
  if (!wantsOnline(accountId)) { clearReconnectTimer(accountId); return; }
  if (sess.reconnectTimer) return;
  sess.reconnectTimer = setTimeout(() => {
    sess.reconnectTimer = null;
    tryLogin(accountId).catch(err => accountLog(accountId, 'error', 'reconnect_error', { error: err.message }));
  }, delayMs);
}

function buildSteamClients(accountId) {
  const sess  = getSession(accountId);
  const paths = AP(accountId);

  sess.client    = new SteamUser({ autoRelogin: false });
  sess.community = new SteamCommunity();
  sess.manager   = new TradeOfferManager({
    steam:        sess.client,
    community:    sess.community,
    language:     'en',
    pollInterval: 30000,
    pollData:     readJson(paths.pollData, undefined),
    cancelTime:   7 * 24 * 60 * 60 * 1000,
  });

  sess.client.on('loggedOn', () => {
    sess.status     = 'online';
    sess.steamId    = sess.client.steamID?.getSteamID64();
    sess.loginError = null;
    try {
      const c = loadCreds(accountId);
      if (sess.steamId && c.steam_id !== sess.steamId) saveCreds(accountId, { steam_id: sess.steamId });
    } catch { /* non-fatal */ }
    sess.client.setPersona(SteamUser.EPersonaState.Online);
    sess.client.gamesPlayed(440);
    accountLog(accountId, 'info', 'steam_logged_on', { steamid: sess.steamId });
    bus.emit('status', { accountId });
  });

  sess.client.on('webSession', (_sessionId, cookies) => {
    sess.manager.setCookies(cookies, err => {
      sess.offerManagerReady = !err;
      if (err) accountLog(accountId, 'warn', 'manager_cookies_failed', { error: err.message });
      else accountLog(accountId, 'info', 'offer_manager_ready', {});
      bus.emit('status', { accountId });
    });
    sess.community.setCookies(cookies);
    const c = loadCreds(accountId);
    if (c.identity_secret) sess.community.startConfirmationChecker(30000, c.identity_secret);
    accountLog(accountId, 'info', 'steam_web_session_set', {});
  });

  sess.client.on('steamGuard', (_domain, callback, lastCodeWrong) => {
    if (lastCodeWrong) accountLog(accountId, 'warn', 'steamguard_wrong_code', {});
    const c = loadCreds(accountId);
    if (c.shared_secret) {
      callback(SteamTotp.generateAuthCode(c.shared_secret));
      accountLog(accountId, 'info', 'steamguard_totp_generated', {});
    } else {
      sess.status     = 'steamguard_required';
      sess.loginError = 'Steam Guard required. Set shared_secret in credentials.';
      accountLog(accountId, 'warn', 'steamguard_no_secret', {});
      bus.emit('status', { accountId });
    }
  });

  sess.client.on('error', err => {
    sess.status     = 'error';
    sess.loginError = err.message;
    accountLog(accountId, 'error', 'steam_client_error', { message: err.message, eresult: err.eresult });
    bus.emit('status', { accountId });
    if (wantsOnline(accountId)) scheduleReconnect(accountId);
  });

  sess.client.on('disconnected', (eresult, msg) => {
    sess.status           = 'offline';
    sess.offerManagerReady = false;
    const desired = wantsOnline(accountId);
    accountLog(accountId, desired ? 'warn' : 'info',
      desired ? 'steam_disconnected' : 'steam_manual_disconnect_complete', { eresult, msg });
    bus.emit('status', { accountId });
    if (desired) scheduleReconnect(accountId);
  });

  sess.manager.on('pollData', data => {
    try { writeJson(paths.pollData, data); } catch { /* non-fatal */ }
  });

  sess.manager.on('newOffer', async offer => {
    const schema = await getPriceSchema().catch(() => null);
    const entry = {
      id:               offer.id,
      account_id:       accountId,
      partner:          offer.partner?.getSteamID64(),
      message:          offer.message || '',
      items_to_give:    offer.itemsToGive?.map(i => ({ assetid: i.assetid, name: i.name, classid: i.classid })) || [],
      items_to_receive: offer.itemsToReceive?.map(i => ({ assetid: i.assetid, name: i.name, classid: i.classid })) || [],
      is_gift:          !offer.itemsToGive?.length,
      received_at:      new Date().toISOString(),
    };
    entry.evaluation = await evaluateOffer(entry, schema).catch(() => null);
    sess.offerQueue.push(entry);
    sess.lastOfferSync = new Date().toISOString();
    accountLog(accountId, 'info', 'new_trade_offer', {
      id: entry.id, partner: entry.partner,
      items_in: entry.items_to_receive.length,
      items_out: entry.items_to_give.length,
      tags: entry.evaluation?.tags,
    });
    bus.emit('offer', entry);
    handleOfferAutonomous(accountId, entry).catch(e =>
      accountLog(accountId, 'warn', 'autonomous_offer_error', { error: e.message })
    );
  });

  sess.manager.on('receivedOfferChanged', (offer) => {
    if (offer.state !== TradeOfferManager.ETradeOfferState.Active) {
      sess.offerQueue = sess.offerQueue.filter(o => o.id !== offer.id);
      accountLog(accountId, 'info', 'offer_no_longer_active', { id: offer.id, state: offer.state });
    }
  });

  sess.manager.on('pollFailure', err => {
    accountLog(accountId, 'warn', 'trade_poll_failure', { error: err.message });
  });
}

async function handleOfferAutonomous(accountId, entry) {
  const account        = getAccount(accountId);
  const gs             = getGlobalSettings();
  const autoAccept     = account?.autonomous_trade_accept_enabled ?? gs.autonomous_trade_accept_enabled ?? false;
  const dryRun         = account?.dry_run ?? gs.dry_run ?? true;
  if (!autoAccept) return;

  const ev   = entry.evaluation;
  const tags = ev?.tags || [];
  if (tags.includes('manual_review') || tags.includes('unpriced') || tags.includes('no_pricing') || tags.includes('empty')) return;

  const minProfit = account?.min_profit_ref ?? gs.min_profit_ref ?? 0;
  if ((ev?.profit ?? -999) < minProfit) {
    accountLog(accountId, 'info', 'offer_auto_skipped', { id: entry.id, reason: 'insufficient_profit', profit: ev?.profit });
    return;
  }

  if (dryRun) {
    accountLog(accountId, 'info', 'offer_auto_accept_simulated', { id: entry.id, profit: ev?.profit, dry_run: true });
    return;
  }
  await acceptOffer(accountId, entry.id);
  accountLog(accountId, 'info', 'offer_auto_accepted', { id: entry.id, profit: ev?.profit });
}

async function tryLogin(accountId) {
  const sess  = getSession(accountId);
  setDesiredOnline(accountId, true, 'login_requested');
  const creds = loadCreds(accountId);
  if (!creds.username || !creds.password) {
    accountLog(accountId, 'info', 'login_skipped_no_credentials', {});
    return;
  }
  if (sess.status === 'online' || sess.status === 'connecting') return;
  clearReconnectTimer(accountId);

  if (sess.client) {
    try { sess.client.autoRelogin = false; } catch { /* ignore */ }
    try { sess.client.gamesPlayed([]); } catch { /* ignore */ }
    try { sess.client.logOff(); } catch { /* ignore */ }
    sess.client = null; sess.community = null; sess.manager = null; sess.offerManagerReady = false;
  }

  sess.status = 'connecting'; sess.loginError = null;
  accountLog(accountId, 'info', 'steam_login_attempt', { username: creds.username });
  bus.emit('status', { accountId });

  buildSteamClients(accountId);
  const loginOpts = { accountName: creds.username, password: creds.password };
  if (creds.shared_secret) loginOpts.twoFactorCode = SteamTotp.generateAuthCode(creds.shared_secret);
  sess.client.logOn(loginOpts);
}

function stopBot(accountId, reason = 'manual_disconnect') {
  const sess = getSession(accountId);
  setDesiredOnline(accountId, false, reason);
  sess.desiredOnline = false;
  clearReconnectTimer(accountId);

  if (sess.community) try { sess.community.stopConfirmationChecker(); } catch { /* optional */ }
  if (sess.manager) {
    try { sess.manager.shutdown(); } catch { /* optional */ }
    try { sess.manager.pollInterval = -1; } catch { /* optional */ }
  }
  if (sess.client) {
    try { sess.client.autoRelogin = false; } catch { /* optional */ }
    try { sess.client.gamesPlayed([]); } catch { /* ignore */ }
    try { sess.client.setPersona(SteamUser.EPersonaState.Offline); } catch { /* ignore */ }
    try { sess.client.logOff(); } catch { /* ignore */ }
  }
  sess.client = null; sess.community = null; sess.manager = null;
  sess.offerManagerReady = false;
  sess.status = 'offline'; sess.loginError = null;
  accountLog(accountId, 'info', 'bot_disconnect_requested', { reason });
  bus.emit('status', { accountId });
}

// ─── Offer actions ────────────────────────────────────────────────────────────

function getOfferObj(accountId, id) {
  const sess = getSession(accountId);
  return new Promise((resolve, reject) => {
    if (!sess.manager) return reject(new Error('Steam not connected'));
    sess.manager.getOffer(id, (err, o) => err ? reject(err) : resolve(o));
  });
}

async function acceptOffer(accountId, id) {
  const sess  = getSession(accountId);
  const offer = await getOfferObj(accountId, id);
  await new Promise((resolve, reject) => offer.accept((err, status) => err ? reject(err) : resolve(status)));
  sess.offerQueue = sess.offerQueue.filter(o => o.id !== id);
  accountLog(accountId, 'info', 'offer_accepted', { id });
}

async function declineOffer(accountId, id) {
  const sess  = getSession(accountId);
  const offer = await getOfferObj(accountId, id);
  await new Promise((resolve, reject) => offer.decline(err => err ? reject(err) : resolve()));
  sess.offerQueue = sess.offerQueue.filter(o => o.id !== id);
  accountLog(accountId, 'info', 'offer_declined', { id });
}

// ─── Autonomous pipeline (per account) ───────────────────────────────────────

let globalPipelineRunning = false;

async function runPipeline(accountId) {
  const sess = getSession(accountId);
  if (sess.pipelineRunning)
    return { ok: false, error: 'Pipeline already running for this account' };
  sess.pipelineRunning = true;
  const result = { accountId, startedAt: new Date().toISOString(), steps: [], errors: [] };

  async function step(name, fn) {
    try { await fn(); result.steps.push({ name, status: 'ok' }); }
    catch (err) {
      result.steps.push({ name, status: 'error', error: err.message });
      result.errors.push({ name, error: err.message });
      accountLog(accountId, 'warn', `pipeline_step_error`, { step: name, error: err.message });
    }
  }

  try {
    await step('inventory_sync',  () => syncInventory(accountId));
    await step('price_schema',    () => getPriceSchema());
    await step('listings_sync',   () => syncListings(accountId));
    await step('draft_generation',() => generateDrafts(accountId));

    const account = getAccount(accountId);
    const gs      = getGlobalSettings();
    const autoPublish = account?.autonomous_publish_enabled ?? gs.autonomous_publish_enabled ?? false;
    const dryRun      = account?.dry_run ?? gs.dry_run ?? true;
    const maxPublish  = account?.max_publish_per_cycle ?? gs.max_publish_per_cycle ?? 5;

    if (autoPublish) {
      await step('autonomous_publish', async () => {
        const toPublish = loadDrafts(accountId).filter(d => d.status === 'ready').slice(0, maxPublish);
        let published = 0;
        for (const draft of toPublish) {
          try { await publishDraft(accountId, draft.draft_id); published++; }
          catch (e) { accountLog(accountId, 'warn', 'auto_publish_failed', { draft_id: draft.draft_id, error: e.message }); }
        }
        accountLog(accountId, 'info', 'autonomous_publish_complete', { published, dry_run: dryRun });
      });
    }

    result.completedAt = new Date().toISOString();
    result.ok = result.errors.length === 0;
    sess.lastPipelineResult = result;
    accountLog(accountId, 'info', 'pipeline_complete', { steps: result.steps.length, errors: result.errors.length });
  } finally {
    sess.pipelineRunning = false;
  }
  return result;
}

async function runGlobalPipeline() {
  if (globalPipelineRunning) return { ok: false, error: 'Global pipeline already running' };
  globalPipelineRunning = true;
  try {
    const gs       = getGlobalSettings();
    const maxPar   = gs.max_parallel_accounts ?? 1;
    const accounts = loadAccounts().filter(a => a.enabled && a.role !== 'disabled');
    const results  = [];
    for (let i = 0; i < accounts.length; i += maxPar) {
      const batch = accounts.slice(i, i + maxPar);
      const batchResults = await Promise.allSettled(batch.map(a => runPipeline(a.account_id)));
      for (const r of batchResults)
        results.push(r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
    }
    return { ok: true, results };
  } finally {
    globalPipelineRunning = false;
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

let schedulerRunning = false;

async function schedulerTick() {
  if (schedulerRunning) return;
  schedulerRunning = true;
  try {
    const now         = Date.now();
    const LISTING_TTL = 5  * 60 * 1000;
    const INV_TTL     = 10 * 60 * 1000;
    const PRICE_TTL   = 60 * 60 * 1000;

    if (!_lastPriceSchemaSync || now - new Date(_lastPriceSchemaSync).getTime() > PRICE_TTL)
      await getPriceSchema().catch(e => log('warn', 'tick_price_error', { error: e.message }));

    for (const [accountId, sess] of sessions) {
      if (!sess.status || sess.status === 'offline') continue;
      if (!sess.lastListingSync || now - new Date(sess.lastListingSync).getTime() > LISTING_TTL)
        await syncListings(accountId).catch(e => accountLog(accountId, 'warn', 'tick_listings_error', { error: e.message }));
      if (!sess.lastInvSync || now - new Date(sess.lastInvSync).getTime() > INV_TTL)
        await syncInventory(accountId).catch(e => accountLog(accountId, 'warn', 'tick_inv_error', { error: e.message }));
    }
  } finally {
    schedulerRunning = false;
  }
}

// ─── Migration (legacy single-account → multi-account) ────────────────────────

async function migrateLegacy() {
  if (loadAccounts().length > 0) return;
  if (!fs.existsSync(LEGACY.creds)) return;

  const legacyCreds = readJson(LEGACY.creds, {});
  if (!legacyCreds.username && !legacyCreds.steam_id) return;

  log('info', 'migration_start', { from: 'legacy', to: 'accounts/main' });
  try {
    const mainDir = accountDir('main');
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir, { recursive: true });

    // Migrate credentials — bptf_token stays as access token; bptf_api_key is separate
    writeJson(AP('main').credentials, {
      username:        legacyCreds.username,
      password:        legacyCreds.password,
      shared_secret:   legacyCreds.shared_secret,
      identity_secret: legacyCreds.identity_secret,
      steam_api_key:   legacyCreds.steam_api_key,
      bptf_token:      legacyCreds.bptf_token,
      steam_id:        legacyCreds.steam_id,
    });

    const copy = (src, dst) => {
      if (src && fs.existsSync(src) && !fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
        log('info', 'migration_file_copied', { src, dst });
      }
    };
    copy(LEGACY.runtime,   AP('main').runtime);
    copy(LEGACY.inventory, AP('main').inventory);
    copy(LEGACY.listings,  AP('main').listings);
    copy(LEGACY.drafts,    AP('main').drafts);
    copy(LEGACY.ignored,   AP('main').ignored);
    copy(LEGACY.pollData,  AP('main').pollData);
    copy(LEGACY.audit,     AP('main').audit);
    copy(LEGACY.priceSchema, G.priceSchema);

    upsertAccount({
      account_id: 'main',
      label:      'Main account',
      role:       'main',
      enabled:    true,
      dry_run:    true,
      autonomous_enabled:              false,
      autonomous_publish_enabled:      false,
      autonomous_trade_accept_enabled: false,
    });

    log('info', 'migration_complete', { account_id: 'main' });
  } catch (err) {
    log('error', 'migration_failed', { error: err.message });
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

function getActiveId(req) {
  return req.params.accountId || req.query.account_id || getMainAccountId();
}

// ── Version & status ──────────────────────────────────────────────────────────

app.get('/api/version',       (_req, res) => res.json({ version: VERSION }));
app.get('/api/version-audit', (_req, res) => res.json({ ok: true, app_version: VERSION, addon_version: VERSION, server_version: VERSION, package_version: VERSION }));

app.get('/api/status', (req, res) => {
  const id   = getActiveId(req);
  const sess = getSession(id);
  const cred = credStatus(id);
  res.json({
    ok:                  true,
    version:             VERSION,
    account_id:          id,
    status:              sess.status,
    steam_id:            sess.steamId,
    display_name:        sess.displayName,
    login_error:         sess.loginError,
    offer_queue:         sess.offerQueue.length,
    listing_count:       sess.listings.length,
    listing_error:       sess.lastListingError,
    listing_source:      sess.lastListingSource,
    backpack:            sess.lastBptfDiagnostic,
    price_schema_status: _priceSchemaStatus,
    price_item_count:    getPriceItemCount(_priceSchemaCache),
    last_price_schema_sync:  _lastPriceSchemaSync,
    last_price_schema_error: _lastPriceSchemaError,
    inventory_count:     sess.inventory.length,
    inventory_error:     sess.lastInvError,
    inventory_retry_after: sess.nextInvSyncAfter,
    inventory_source:    sess.lastInvSource,
    offer_manager_ready: sess.offerManagerReady,
    last_offer_sync:     sess.lastOfferSync,
    last_listing_sync:   sess.lastListingSync,
    last_inv_sync:       sess.lastInvSync,
    started_at:          sess.startedAt,
    desired_online:      wantsOnline(id),
    credentials:         cred,
  });
});

// ── Credentials ───────────────────────────────────────────────────────────────

app.get('/api/credentials', (req, res) => {
  const id = getActiveId(req);
  res.json({ ok: true, account_id: id, ...credStatus(id) });
});

app.post('/api/credentials', wrap(async (req, res) => {
  const id = getActiveId(req);
  saveCreds(id, req.body || {});
  log('info', 'credentials_saved', { account_id: id });
  const sess = getSession(id);
  if (wantsOnline(id) && (sess.status === 'offline' || sess.status === 'error'))
    tryLogin(id).catch(() => {});
  res.json({ ok: true, account_id: id, ...credStatus(id) });
}));

// ── Accounts CRUD ─────────────────────────────────────────────────────────────

app.get('/api/accounts', (_req, res) => {
  const enriched = loadAccounts().map(a => {
    const sess = sessions.get(a.account_id);
    const cred = credStatus(a.account_id);
    return {
      ...a,
      status:          sess?.status || 'offline',
      steam_id:        sess?.steamId || cred.steam_id || null,
      inventory_count: sess?.inventory?.length || 0,
      listing_count:   sess?.listings?.length || 0,
      offer_count:     sess?.offerQueue?.length || 0,
      last_inv_sync:   sess?.lastInvSync || null,
      credentials:     cred,
    };
  });
  res.json({ ok: true, accounts: enriched });
});

app.post('/api/accounts', wrap(async (req, res) => {
  const body = req.body || {};
  if (!body.account_id) return res.status(400).json({ ok: false, error: 'account_id required' });
  const account = upsertAccount({
    account_id: body.account_id,
    label:      body.label || body.account_id,
    role:       body.role || 'trading',
    enabled:    false,
    dry_run:    true,
    autonomous_enabled: false,
    autonomous_publish_enabled: false,
    autonomous_trade_accept_enabled: false,
  });
  const dir = accountDir(body.account_id);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  log('info', 'account_created', { account_id: body.account_id });
  res.json({ ok: true, account });
}));

app.get('/api/accounts/:accountId', (req, res) => {
  const account = getAccount(req.params.accountId);
  if (!account) return res.status(404).json({ ok: false, error: 'Account not found' });
  const sess = sessions.get(req.params.accountId);
  res.json({ ok: true, account: { ...account, status: sess?.status || 'offline' } });
});

app.patch('/api/accounts/:accountId', wrap(async (req, res) => {
  const { accountId } = req.params;
  const account = getAccount(accountId);
  if (!account) return res.status(404).json({ ok: false, error: 'Account not found' });
  const body = req.body || {};
  const credPatch = {};
  for (const f of CRED_FIELDS) if (body[f] !== undefined) { credPatch[f] = body[f]; delete body[f]; }
  const updated = upsertAccount({ ...account, ...body, account_id: accountId });
  if (Object.keys(credPatch).length) saveCreds(accountId, credPatch);
  log('info', 'account_updated', { account_id: accountId });
  res.json({ ok: true, account: updated });
}));

app.delete('/api/accounts/:accountId', (req, res) => {
  const { accountId } = req.params;
  if (accountId === 'main') return res.status(400).json({ ok: false, error: 'Cannot delete main account' });
  if (sessions.has(accountId)) { stopBot(accountId, 'account_deleted'); sessions.delete(accountId); }
  deleteAccount(accountId);
  log('info', 'account_deleted', { account_id: accountId });
  res.json({ ok: true });
});

// ── Per-account bot control ───────────────────────────────────────────────────

app.post('/api/accounts/:accountId/bot/login', wrap(async (req, res) => {
  const { accountId } = req.params;
  if (!getAccount(accountId)) return res.status(404).json({ ok: false, error: 'Account not found' });
  await tryLogin(accountId);
  res.json({ ok: true, account_id: accountId, status: getSession(accountId).status });
}));

app.post('/api/accounts/:accountId/bot/disconnect', (req, res) => {
  const { accountId } = req.params;
  stopBot(accountId, 'ui_disconnect');
  res.json({ ok: true, account_id: accountId, status: getSession(accountId).status, desired_online: wantsOnline(accountId) });
});

app.get('/api/accounts/:accountId/status', (req, res) => {
  const { accountId } = req.params;
  const sess = getSession(accountId);
  res.json({
    ok: true, account_id: accountId,
    status: sess.status, steam_id: sess.steamId,
    desired_online: wantsOnline(accountId),
    offer_queue: sess.offerQueue.length,
    listing_count: sess.listings.length,
    inventory_count: sess.inventory.length,
    credentials: credStatus(accountId),
    last_pipeline: sess.lastPipelineResult,
  });
});

// ── Per-account inventory ─────────────────────────────────────────────────────

app.post('/api/accounts/:accountId/inventory/sync', wrap(async (req, res) => {
  const { accountId } = req.params;
  try {
    await syncInventory(accountId, { force: true, throwOnError: true });
    const sess = getSession(accountId);
    res.json({ ok: true, inventory: sess.inventory, count: sess.inventory.length, last_sync: sess.lastInvSync, source: sess.lastInvSource });
  } catch (err) {
    const sess = getSession(accountId);
    res.status(502).json({ ok: false, error: err.message, count: sess.inventory.length, last_sync: sess.lastInvSync });
  }
}));

// ── Per-account listings ──────────────────────────────────────────────────────

app.post('/api/accounts/:accountId/backpack/sync', wrap(async (req, res) => {
  const { accountId } = req.params;
  const listings = await syncListings(accountId);
  const sess = getSession(accountId);
  res.json({ ok: true, listings, count: listings.length, diagnostic: sess.lastBptfDiagnostic });
}));

app.get('/api/accounts/:accountId/backpack/diagnostics', (req, res) => {
  const { accountId } = req.params;
  const sess = getSession(accountId);
  const cred = credStatus(accountId);
  res.json({
    ok:                  true,
    account_id:          accountId,
    has_access_token:    cred.has_bptf_token,
    has_api_key:         cred.has_bptf_api_key,
    steamid64:           sess.steamId || cred.steam_id || null,
    listings_status:     sess.lastBptfDiagnostic?.status || 'not_checked',
    listings_count:      sess.listings.length,
    price_schema_status: _priceSchemaStatus,
    price_item_count:    getPriceItemCount(_priceSchemaCache),
    last_price_schema_sync: _lastPriceSchemaSync,
    last_error:          sess.lastListingError || _lastPriceSchemaError?.error || null,
    endpoint_used:       'https://backpack.tf/api/classifieds/listings/v1',
    timestamp:           new Date().toISOString(),
  });
});

// ── Per-account listing drafts ────────────────────────────────────────────────

app.get('/api/accounts/:accountId/listing-drafts', (req, res) => {
  const { accountId } = req.params;
  res.json({ ok: true, account_id: accountId, drafts: loadDrafts(accountId) });
});

app.post('/api/accounts/:accountId/listing-drafts/generate', wrap(async (req, res) => {
  const { accountId } = req.params;
  const drafts = await generateDrafts(accountId);
  res.json({ ok: true, account_id: accountId, count: drafts.length, drafts });
}));

app.post('/api/accounts/:accountId/listing-drafts/:draftId/publish', wrap(async (req, res) => {
  const { accountId, draftId } = req.params;
  res.json(await publishDraft(accountId, draftId));
}));

app.post('/api/accounts/:accountId/listing-drafts/:draftId/ignore', wrap(async (req, res) => {
  const { accountId, draftId } = req.params;
  res.json(await ignoreDraft(accountId, draftId));
}));

// ── Per-account offers ────────────────────────────────────────────────────────

app.get('/api/accounts/:accountId/offers', (req, res) => {
  const { accountId } = req.params;
  res.json({ ok: true, account_id: accountId, offers: getSession(accountId).offerQueue });
});

app.post('/api/accounts/:accountId/offers/sync', (req, res) => {
  const { accountId } = req.params;
  const sess = getSession(accountId);
  if (sess.manager) { try { sess.manager.doPoll(); } catch { /* non-fatal */ } sess.lastOfferSync = new Date().toISOString(); }
  res.json({ ok: true, offers: sess.offerQueue });
});

app.post('/api/accounts/:accountId/offers/:offerId/accept', wrap(async (req, res) => {
  const { accountId, offerId } = req.params;
  const sess = getSession(accountId);
  if (sess.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await acceptOffer(accountId, offerId);
  res.json({ ok: true });
}));

app.post('/api/accounts/:accountId/offers/:offerId/decline', wrap(async (req, res) => {
  const { accountId, offerId } = req.params;
  const sess = getSession(accountId);
  if (sess.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await declineOffer(accountId, offerId);
  res.json({ ok: true });
}));

// ── Per-account pipeline ──────────────────────────────────────────────────────

app.post('/api/accounts/:accountId/pipeline/run', wrap(async (req, res) => {
  const { accountId } = req.params;
  if (!getAccount(accountId)) return res.status(404).json({ ok: false, error: 'Account not found' });
  res.json({ ok: true, result: await runPipeline(accountId) });
}));

// ── Legacy / global aliases (route to main account) ───────────────────────────

app.get('/api/offers', (req, res) => {
  res.json({ ok: true, offers: getSession(getMainAccountId()).offerQueue });
});
app.post('/api/offers/sync', (req, res) => {
  const id = getMainAccountId(); const sess = getSession(id);
  if (sess.manager) { try { sess.manager.doPoll(); } catch { /* non-fatal */ } sess.lastOfferSync = new Date().toISOString(); }
  res.json({ ok: true, offers: sess.offerQueue });
});
app.post('/api/offers/:id/accept', wrap(async (req, res) => {
  const id = getMainAccountId(); const sess = getSession(id);
  if (sess.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await acceptOffer(id, req.params.id); res.json({ ok: true });
}));
app.post('/api/offers/:id/decline', wrap(async (req, res) => {
  const id = getMainAccountId(); const sess = getSession(id);
  if (sess.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await declineOffer(id, req.params.id); res.json({ ok: true });
}));
app.post('/api/offers/:id/counter', (_req, res) => res.status(501).json({ ok: false, error: 'Not implemented in multi-account mode' }));

app.get('/api/listings', (req, res) => {
  const id = getMainAccountId(); const sess = getSession(id);
  res.json({ ok: true, listings: sess.listings, last_sync: sess.lastListingSync, diagnostic: sess.lastBptfDiagnostic, error: sess.lastListingError });
});
app.post('/api/listings/sync', wrap(async (req, res) => {
  const id = getMainAccountId();
  const listings = await syncListings(id);
  const sess = getSession(id);
  res.json({ ok: true, listings, last_sync: sess.lastListingSync, diagnostic: sess.lastBptfDiagnostic });
}));
app.post('/api/listings', wrap(async (req, res) => {
  const id = getMainAccountId();
  const result = await publishListingRaw(id, req.body);
  await syncListings(id).catch(() => {});
  res.json({ ok: true, result });
}));
app.delete('/api/listings/:id', wrap(async (req, res) => {
  const id = getMainAccountId();
  await archiveListing(id, req.params.id);
  await syncListings(id).catch(() => {});
  res.json({ ok: true });
}));

app.get('/api/inventory', (req, res) => {
  const id = getMainAccountId(); const sess = getSession(id);
  res.json({ ok: true, inventory: sess.inventory, count: sess.inventory.length, last_sync: sess.lastInvSync, source: sess.lastInvSource, error: sess.lastInvError });
});
app.post('/api/inventory/sync', wrap(async (req, res) => {
  const id = getMainAccountId();
  try {
    await syncInventory(id, { force: true, throwOnError: true });
    const sess = getSession(id);
    res.json({ ok: true, inventory: sess.inventory, count: sess.inventory.length, last_sync: sess.lastInvSync, source: sess.lastInvSource, error: null });
  } catch (err) {
    const sess = getSession(id);
    res.status(502).json({ ok: false, error: err.message, inventory: sess.inventory, count: sess.inventory.length, last_sync: sess.lastInvSync, retry_after: sess.nextInvSyncAfter });
  }
}));

app.post('/api/bot/login', wrap(async (req, res) => {
  const id = getMainAccountId();
  await tryLogin(id);
  res.json({ ok: true, status: getSession(id).status });
}));
app.post('/api/bot/disconnect', (req, res) => {
  const id = getMainAccountId();
  stopBot(id, 'ui_disconnect');
  res.json({ ok: true, status: getSession(id).status, desired_online: wantsOnline(id) });
});

// ── Backpack diagnostics (global) ─────────────────────────────────────────────

app.get('/api/backpack/diagnostics', (req, res) => {
  const id   = getMainAccountId();
  const sess = getSession(id);
  const cred = credStatus(id);
  res.json({
    ok:                  true,
    account_id:          id,
    has_access_token:    cred.has_bptf_token,
    has_api_key:         cred.has_bptf_api_key,
    steamid64:           sess.steamId || cred.steam_id || null,
    listings_status:     sess.lastBptfDiagnostic?.status || 'not_checked',
    listings_count:      sess.listings.length,
    price_schema_status: _priceSchemaStatus,
    price_item_count:    getPriceItemCount(_priceSchemaCache),
    last_price_schema_sync: _lastPriceSchemaSync,
    last_error:          sess.lastListingError || _lastPriceSchemaError?.error || null,
    endpoint_used:       'https://backpack.tf/api/classifieds/listings/v1',
    timestamp:           new Date().toISOString(),
  });
});
app.post('/api/backpack/sync', wrap(async (req, res) => {
  const id = getMainAccountId();
  const listings = await syncListings(id);
  const sess = getSession(id);
  res.json({ ok: true, listings, count: listings.length, diagnostic: sess.lastBptfDiagnostic });
}));

// ── Prices ────────────────────────────────────────────────────────────────────

app.get('/api/prices/schema', wrap(async (_req, res) => {
  const schema = await getPriceSchema();
  res.json({ ok: true, has_schema: !!schema, item_count: getPriceItemCount(schema), status: _priceSchemaStatus, last_sync: _lastPriceSchemaSync, last_error: _lastPriceSchemaError });
}));

app.post('/api/prices/schema/refresh', wrap(async (_req, res) => {
  _priceSchemaCache = null; _priceSchemaTTL = 0;
  const schema = await getPriceSchema();
  res.json({ ok: true, has_schema: !!schema, item_count: getPriceItemCount(schema), status: _priceSchemaStatus, last_sync: _lastPriceSchemaSync, last_error: _lastPriceSchemaError });
}));

app.get('/api/prices/lookup', wrap(async (req, res) => {
  const name   = String(req.query.name || '').trim();
  const schema = await getPriceSchema();
  const price  = lookupPrice(name, schema);
  res.json({ ok: true, name, found: !!price, price });
}));

// ── Listing drafts (global → main) ───────────────────────────────────────────

app.get('/api/listing-drafts', (req, res) => {
  res.json({ ok: true, drafts: loadDrafts(getMainAccountId()) });
});
app.post('/api/listing-drafts/generate', wrap(async (req, res) => {
  const id = getMainAccountId();
  const drafts = await generateDrafts(id);
  res.json({ ok: true, count: drafts.length, drafts });
}));
app.post('/api/listing-drafts/:id/publish', wrap(async (req, res) => {
  res.json(await publishDraft(getMainAccountId(), req.params.id));
}));
app.post('/api/listing-drafts/:id/ignore', wrap(async (req, res) => {
  res.json(await ignoreDraft(getMainAccountId(), req.params.id));
}));

// ── Pipeline (global) ─────────────────────────────────────────────────────────

app.post('/api/pipeline/run', wrap(async (_req, res) => {
  res.json({ ok: true, result: await runPipeline(getMainAccountId()) });
}));
app.post('/api/pipeline/run-all', wrap(async (_req, res) => {
  res.json(await runGlobalPipeline());
}));

// ── Global settings ───────────────────────────────────────────────────────────

app.get('/api/settings', (_req, res) => res.json({ ok: true, settings: getGlobalSettings() }));
app.patch('/api/settings', (req, res) => res.json({ ok: true, settings: saveGlobalSettings(req.body || {}) }));

// ── Events ────────────────────────────────────────────────────────────────────

app.get('/api/events', (req, res) => {
  const logFile = req.query.account_id ? AP(req.query.account_id).audit : G.globalAudit;
  try {
    const lines = fs.existsSync(logFile)
      ? fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).slice(-200)
      : [];
    const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    res.json({ ok: true, events: entries.reverse() });
  } catch { res.json({ ok: true, events: [] }); }
});

app.get('/api/events/stream', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
  const send    = data => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const onLog   = e => send({ type: 'log',    entry: e });
  const onStat  = e => send({ type: 'status', ...e });
  const onOffer = e => send({ type: 'offer',  offer: e });
  bus.on('log', onLog); bus.on('status', onStat); bus.on('offer', onOffer);
  const hb = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(hb); bus.off('log', onLog); bus.off('status', onStat); bus.off('offer', onOffer); });
});

// ── Diagnostics ───────────────────────────────────────────────────────────────

app.get('/api/diagnostics', (_req, res) => {
  const id   = getMainAccountId();
  const sess = getSession(id);
  res.json({
    ok: true, version: VERSION, status: sess.status,
    credentials: credStatus(id), offer_queue: sess.offerQueue.length,
    listing_count: sess.listings.length, backpack: sess.lastBptfDiagnostic,
    inventory_count: sess.inventory.length, started_at: sess.startedAt,
    uptime_seconds: Math.floor((Date.now() - new Date(sess.startedAt)) / 1000),
    node_version: process.version,
  });
});

app.get('/api/diagnostics/bundle', (_req, res) => {
  const accounts = loadAccounts().map(a => {
    const sess = sessions.get(a.account_id);
    const cred = credStatus(a.account_id);
    return {
      account_id: a.account_id, label: a.label, role: a.role,
      status:          sess?.status || 'offline',
      steam_id:        sess?.steamId || cred.steam_id || null,
      inventory_count: sess?.inventory?.length || 0,
      listing_count:   sess?.listings?.length || 0,
      offer_count:     sess?.offerQueue?.length || 0,
      backpack_status: sess?.lastBptfDiagnostic?.status || 'not_checked',
      has_token:       cred.has_bptf_token,
      has_api_key:     cred.has_bptf_api_key,
      last_pipeline:   sess?.lastPipelineResult || null,
    };
  });
  res.json({
    ok:                  true,
    version:             VERSION,
    global_settings:     getGlobalSettings(),
    price_schema_status: _priceSchemaStatus,
    price_item_count:    getPriceItemCount(_priceSchemaCache),
    last_price_schema_sync:  _lastPriceSchemaSync,
    last_price_schema_error: _lastPriceSchemaError,
    accounts,
    connected_accounts:  accounts.filter(a => a.status === 'online').length,
    total_inventory:     accounts.reduce((s, a) => s + a.inventory_count, 0),
    total_listings:      accounts.reduce((s, a) => s + a.listing_count, 0),
    total_offers:        accounts.reduce((s, a) => s + a.offer_count, 0),
    node_version:        process.version,
    files: { price_schema_exists: fs.existsSync(G.priceSchema), global_audit_exists: fs.existsSync(G.globalAudit) },
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  log('error', 'request_error', { method: req.method, path: req.path, error: err.message });
  res.status(500).json({ ok: false, error: err.message });
});

// ─── Startup ──────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  process.on('uncaughtException', err => log('error', 'uncaught_exception', { error: err.message, stack: err.stack?.split('\n')[0] }));
  process.on('unhandledRejection', reason => log('error', 'unhandled_rejection', { error: String(reason) }));
  process.on('SIGTERM', () => {
    log('info', 'sigterm_received', {});
    for (const [accountId] of sessions) {
      clearReconnectTimer(accountId);
      const sess = sessions.get(accountId);
      if (sess.community) try { sess.community.stopConfirmationChecker(); } catch { /* ignore */ }
      if (sess.manager)   try { sess.manager.shutdown(); } catch { /* ignore */ }
      if (sess.client) {
        try { sess.client.autoRelogin = false; } catch { /* ignore */ }
        try { sess.client.gamesPlayed([]); } catch { /* ignore */ }
        try { sess.client.logOff(); } catch { /* ignore */ }
      }
    }
    process.exit(0);
  });

  log('info', 'server_starting', { version: VERSION, port: PORT });
  await migrateLegacy();

  app.listen(PORT, '0.0.0.0', () => log('info', 'server_listening', { port: PORT }));

  for (const account of loadAccounts()) {
    if (!account.enabled || account.role === 'disabled') continue;
    const sess = getSession(account.account_id);
    if (wantsOnline(account.account_id)) {
      await tryLogin(account.account_id).catch(err =>
        accountLog(account.account_id, 'error', 'initial_login_error', { error: err.message })
      );
    } else {
      sess.status = 'offline';
      accountLog(account.account_id, 'info', 'auto_login_skipped_manual_disconnect', {});
    }
  }

  setInterval(() => schedulerTick().catch(err => log('error', 'scheduler_error', { error: err.message })), 60 * 1000);
  log('info', 'server_ready', { version: VERSION });
}

main().catch(err => { console.error('Fatal startup error:', err); process.exit(1); });
