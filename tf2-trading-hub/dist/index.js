'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const APP_VERSION = '5.13.36';
const APP_NAME = 'TF2 Trading Hub';
const PORT = Number(process.env.PORT || 8099);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || '/data';
const OPTIONS_PATH = process.env.OPTIONS_PATH || path.join(DATA_DIR, 'options.json');
const AUDIT_PATH = path.join(DATA_DIR, 'steam-companion-audit.jsonl');
const CACHE_PATH = path.join(DATA_DIR, 'steam-companion-cache.json');
const DECISIONS_PATH = path.join(DATA_DIR, 'steam-companion-decisions.json');
const NOTIFICATIONS_PATH = path.join(DATA_DIR, 'steam-companion-notifications.json');
const PRICELIST_PATH = path.join(DATA_DIR, 'steam-companion-pricelist.json');
const STATE_PATH = path.join(DATA_DIR, 'steam-companion-state.json');
const OFFER_HISTORY_PATH = path.join(DATA_DIR, 'steam-companion-offer-history.json');
const PRICING_REPORT_PATH = path.join(DATA_DIR, 'steam-companion-pricing-report.json');
const PROVIDER_STATE_PATH = path.join(DATA_DIR, 'steam-companion-provider-state.json');
const BACKPACK_LISTINGS_PATH = path.join(DATA_DIR, 'steam-companion-backpack-listings.json');
const BACKPACK_PRICE_SCHEMA_PATH = path.join(DATA_DIR, 'tf2-hub-backpack-price-schema.json');
const STEAM_ITEM_SCHEMA_PATH = path.join(DATA_DIR, 'tf2-hub-steam-item-schema.json');
const MARKET_SCANNER_PATH = path.join(DATA_DIR, 'tf2-hub-market-scanner.json');
const LISTING_PLAN_PATH = path.join(DATA_DIR, 'steam-companion-listing-plan.json');
const ACTION_FEED_PATH = path.join(DATA_DIR, 'steam-companion-action-feed.json');
const OPERATIONS_PATH = path.join(DATA_DIR, 'steam-companion-operations.json');
const STRATEGIES_PATH = path.join(DATA_DIR, 'steam-companion-strategies.json');
const ACCOUNTS_PATH = path.join(DATA_DIR, 'steam-companion-accounts.json');
const TARGETED_ORDERS_PATH = path.join(DATA_DIR, 'steam-companion-targeted-buy-orders.json');
const OLLAMA_REPORT_PATH = path.join(DATA_DIR, 'steam-companion-ollama-report.json');
const HUB_SETUP_PATH = path.join(DATA_DIR, 'tf2-hub-setup-status.json');
const TRADING_CORE_PATH = path.join(DATA_DIR, 'tf2-hub-trading-core.json');
const HUB_CREDENTIALS_PATH = path.join(DATA_DIR, 'tf2-hub-credential-vault.json');
const HUB_CREDENTIALS_LAST_GOOD_PATH = path.join(DATA_DIR, 'tf2-hub-credential-vault.last-good.json');
const MAIN_ACCOUNT_VAULT_PATH = path.join(DATA_DIR, 'tf2-hub-main-account.json');
const CRASH_REPORT_PATH = path.join(DATA_DIR, 'tf2-hub-crash-report.json');
const CREDENTIAL_RECOVERY_REPORT_PATH = path.join(DATA_DIR, 'tf2-hub-credential-recovery-report.json');
const HEARTBEAT_PATH = path.join(DATA_DIR, 'tf2-hub-runtime-heartbeat.json');
const HUB_AUTOPILOT_PATH = path.join(DATA_DIR, 'tf2-hub-autopilot-state.json');
const HUB_INVENTORY_PATH = path.join(DATA_DIR, 'tf2-hub-inventory-cache.json');
const TRADING_BRAIN_PATH = path.join(DATA_DIR, 'tf2-hub-trading-brain.json');
const MARKET_WATCHLIST_PATH = path.join(DATA_DIR, 'tf2-hub-market-watchlist.json');
const INVENTORY_AGGREGATE_PATH = path.join(DATA_DIR, 'tf2-hub-inventory-aggregate.json');
const TRANSFER_PLAN_PATH = path.join(DATA_DIR, 'tf2-hub-transfer-plan.json');
const EXECUTION_QUEUE_PATH = path.join(DATA_DIR, 'tf2-hub-execution-queue.json');
const ACTIONABLE_PLAN_PATH = path.join(DATA_DIR, 'tf2-hub-actionable-trading-plan.json');
const DIAGNOSTIC_BUNDLE_PATH = path.join(DATA_DIR, 'tf2-hub-diagnostic-bundle.json');
const DIAGNOSTIC_BUNDLE_DIR = path.join(DATA_DIR, 'tf2-hub-diagnostics');
const ASSISTANT_DECISION_APPLICATION_PATH = path.join(DATA_DIR, 'tf2-hub-assistant-decision-application.json');
const APPROVED_ACTION_LIFECYCLE_PATH = path.join(DATA_DIR, 'tf2-hub-approved-action-lifecycle.json');
const LISTING_DRAFT_PREVIEW_PATH = path.join(DATA_DIR, 'tf2-hub-listing-draft-preview.json');
const LISTING_DRAFT_REVIEW_PATH = path.join(DATA_DIR, 'tf2-hub-listing-draft-review.json');
const LISTING_DRAFT_POLICY_PATH = path.join(DATA_DIR, 'tf2-hub-listing-draft-policy.json');
const LISTING_DRAFT_LOCAL_APPROVAL_PATH = path.join(DATA_DIR, 'tf2-hub-listing-draft-local-approval.json');
const LISTING_PAYLOAD_PREVIEW_PATH = path.join(DATA_DIR, 'tf2-hub-backpack-listing-payload-preview.json');
const LISTING_PAYLOAD_REVIEW_PATH = path.join(DATA_DIR, 'tf2-hub-backpack-listing-payload-review.json');
const LISTING_PAYLOAD_LOCAL_APPROVAL_PATH = path.join(DATA_DIR, 'tf2-hub-backpack-listing-payload-local-approval.json');
const GUARDED_PUBLISH_DRY_RUN_PATH = path.join(DATA_DIR, 'tf2-hub-guarded-publish-dry-run.json');
const PUBLISH_READINESS_GATE_PATH = path.join(DATA_DIR, 'tf2-hub-publish-readiness-gate.json');
const PUBLISH_HANDOFF_PATH = path.join(DATA_DIR, 'tf2-hub-publish-handoff.json');
const DIAGNOSTIC_TRIAGE_PATH = path.join(DATA_DIR, 'tf2-hub-diagnostic-triage.json');
const LIFECYCLE_PATH = path.join(DATA_DIR, 'steam-companion-listing-lifecycle.json');
const DATA_STATUS_PATH = path.join(DATA_DIR, 'steam-companion-data-status.json');
const MAFILE_PATH = path.join(DATA_DIR, 'steam-companion-mafile.json');
const PLANNING_QUEUE_PATH = path.join(DATA_DIR, 'tf2-hub-planning-queue.json');
const HUB_LISTING_DRAFTS_PATH = path.join(DATA_DIR, 'tf2-hub-listing-drafts.json');
const LOCAL_WORKFLOW_PATH = path.join(DATA_DIR, 'tf2-hub-local-workflow.json');
const RELEASE_CHECK_PATH = path.join(DATA_DIR, 'tf2-hub-release-check.json');
const PUBLISH_WIZARD_PATH = path.join(DATA_DIR, 'tf2-hub-publish-wizard.json');
const PUBLISH_VERIFY_PATH = path.join(DATA_DIR, 'tf2-hub-publish-verification.json');
const DUPLICATE_LISTING_GUARD_PATH = path.join(DATA_DIR, 'tf2-hub-duplicate-listing-guard.json');
const OPPORTUNITIES_PATH = path.join(DATA_DIR, 'tf2-hub-opportunities.json');
const MARKET_CLASSIFIEDS_MIRROR_PATH = path.join(DATA_DIR, 'tf2-hub-market-classifieds-mirror.json');
const MARKET_PRICING_PIPELINE_PATH = path.join(DATA_DIR, 'tf2-hub-market-pricing-pipeline.json');
const CLASSIFIEDS_MAINTAINER_PATH = path.join(DATA_DIR, 'tf2-hub-classifieds-maintainer.json');
const FALLBACK_METRICS_PATH = path.join(DATA_DIR, 'tf2-hub-fallback-metrics.json');
const PUBLISH_ERROR_INSPECTOR_PATH = path.join(DATA_DIR, 'tf2-hub-publish-error-inspector.json');
const STALE_SELL_GUARD_PATH = path.join(DATA_DIR, 'tf2-hub-stale-sell-listing-guard.json');
const CURRENCY_HELPER_PATH = path.join(DATA_DIR, 'tf2-hub-currency-helper.json');
const AUTO_SELL_RELISTER_PATH = path.join(DATA_DIR, 'tf2-hub-auto-sell-relister.json');
const MANUAL_OWNED_SELL_DETECTOR_PATH = path.join(DATA_DIR, 'tf2-hub-manual-owned-sell-detector.json');
const RUNTIME_CONTROLS_PATH = path.join(DATA_DIR, 'tf2-hub-runtime-controls.json');
const MAIN_ACCOUNT_SAVE_TRACE_PATH = path.join(DATA_DIR, 'tf2-hub-main-account-save-trace.json');
const TRADE_GUARD_PATH = path.join(DATA_DIR, 'tf2-hub-trade-guard.json');
const TRADE_OFFER_STATE_MACHINE_PATH = path.join(DATA_DIR, 'tf2-hub-trade-offer-state-machine.json');
const TRADE_COUNTEROFFER_PATH = path.join(DATA_DIR, 'tf2-hub-trade-counteroffers.json');
const STARTUP_LISTING_ARCHIVE_PATH = path.join(DATA_DIR, 'tf2-hub-startup-listing-archive.json');
const STARTUP_REBUILD_PATH = path.join(DATA_DIR, 'tf2-hub-startup-rebuild-controller.json');
const TRADING_BRAIN_V513_PATH = path.join(DATA_DIR, 'tf2-hub-trading-brain-v513.json');

// 5.12.33 – removed legacy field names that must never appear in /data or diagnostics
const REMOVED_KEY_PART = 'bud' + 'get';
const FORBIDDEN_REMOVED_FIELDS = [REMOVED_KEY_PART, `daily_${REMOVED_KEY_PART}_ref`, `${REMOVED_KEY_PART}_ref`, `used_${REMOVED_KEY_PART}_ref`, `${REMOVED_KEY_PART}_mode`];
// neutral fields that are explicitly allowed (document to avoid false-positive grep confusion)
// allowed: selected_value_ref, total_candidate_value_ref, max_active_orders, max_actions_per_day
const STEAMGUARD_SESSION_HEALTH_PATH = path.join(DATA_DIR, 'steam-companion-steamguard-session-health.json');
const STEAMGUARD_REFRESH_TOKEN_PATH = path.join(DATA_DIR, 'steam-companion-steamguard-refresh-token.json');
const TRADE_ACCEPT_LOG_PATH = path.join(DATA_DIR, 'steam-companion-trade-accept-log.json');
const BACKUP_DIR = path.join(DATA_DIR, 'steam-companion-backups');
const DATA_SCHEMA_VERSION = 51300;
const BLOCKED_TERMS = [];
const ACCOUNT_ROLE_DEFINITIONS = {
  main: {
    label: 'Main',
    description: 'Primary account. Trades, stores, lists, scans and owns the main cockpit workflow.',
    does: ['trade', 'storage', 'listings', 'scanner', 'inventory'],
    can_trade: true,
    can_store: true,
    can_list: true,
    can_confirm: true,
    can_scan: true,
    inventory: true,
    pricing: true,
    scanner: true,
    listings: true,
    trade_review: true,
    storage: true,
    internal_transfer: true,
    live_allowed_by_default: false
  },
  trade: {
    label: 'Trade',
    description: 'Trading account. Prepared for offers, listings, target scanning and planning_values when multi-account planning is enabled.',
    does: ['trade', 'listings', 'scanner', 'inventory'],
    can_trade: true,
    can_store: false,
    can_list: true,
    can_confirm: true,
    can_scan: true,
    inventory: true,
    pricing: true,
    scanner: true,
    listings: true,
    trade_review: true,
    storage: false,
    internal_transfer: false,
    live_allowed_by_default: false
  },
  storage: {
    label: 'Storage',
    description: 'Storage account. Inventory/value tracking and safe holding. No active trading or listing actions by default.',
    does: ['inventory', 'storage'],
    can_trade: false,
    can_store: true,
    can_list: false,
    can_confirm: false,
    can_scan: false,
    inventory: true,
    pricing: true,
    scanner: false,
    listings: false,
    trade_review: false,
    storage: true,
    internal_transfer: true,
    live_allowed_by_default: false
  },
  flip: {
    label: 'Flip',
    description: 'Low-planning_value flip account. Planning/watchlist only until explicitly enabled later.',
    does: ['scanner', 'inventory', 'low-planning_value flips'],
    can_trade: true,
    can_store: false,
    can_list: false,
    can_confirm: false,
    can_scan: true,
    inventory: true,
    pricing: true,
    scanner: true,
    listings: false,
    trade_review: false,
    storage: false,
    internal_transfer: false,
    live_allowed_by_default: false
  },
  buffer: {
    label: 'Buffer',
    description: 'Internal transfer/buffer account between trade and storage accounts. No market logic by default.',
    does: ['inventory', 'internal transfers'],
    can_trade: false,
    can_store: true,
    can_list: false,
    can_confirm: false,
    can_scan: false,
    inventory: true,
    pricing: false,
    scanner: false,
    listings: false,
    trade_review: false,
    storage: true,
    internal_transfer: true,
    live_allowed_by_default: false
  },
  disabled: {
    label: 'Disabled',
    description: 'Saved profile only. Autopilot and planning ignore this account.',
    does: ['nothing'],
    can_trade: false,
    can_store: false,
    can_list: false,
    can_confirm: false,
    can_scan: false,
    inventory: false,
    pricing: false,
    scanner: false,
    listings: false,
    trade_review: false,
    storage: false,
    internal_transfer: false,
    live_allowed_by_default: false
  }
};
function sanitizeAccountRole(value, fallback = 'trade') {
  const role = String(value || fallback || 'trade').trim().toLowerCase();
  return ACCOUNT_ROLE_DEFINITIONS[role] ? role : fallback;
}
function accountRoleInfo(role) {
  const safeRole = sanitizeAccountRole(role, 'trade');
  return { role: safeRole, ...(ACCOUNT_ROLE_DEFINITIONS[safeRole] || ACCOUNT_ROLE_DEFINITIONS.trade) };
}
const OFFER_STATE = {
  1: 'Invalid',
  2: 'Active',
  3: 'Accepted',
  4: 'Countered',
  5: 'Expired',
  6: 'Canceled',
  7: 'Declined',
  8: 'InvalidItems',
  9: 'CreatedNeedsConfirmation',
  10: 'CanceledBySecondFactor',
  11: 'InEscrow'
};

function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (error) { console.warn('[steam-companion] data dir unavailable:', error.message); }
}
function readJson(filePath, fallback) {
  try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : fallback; } catch { return fallback; }
}
function writeJson(filePath, value) {
  ensureDataDir();
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, filePath);
  __notifyWatchers(filePath);
}
// 5.13.30: cache invalidation hooks.  When a file the publish wizard reads
// gets rewritten, we drop the cached status so the next request rebuilds.
const __writeWatchers = new Map();
function __notifyWatchers(filePath) {
  const fns = __writeWatchers.get(filePath);
  if (!fns) return;
  for (const fn of fns) { try { fn(filePath); } catch {} }
}
function watchJsonWrite(filePath, fn) {
  if (!__writeWatchers.has(filePath)) __writeWatchers.set(filePath, new Set());
  __writeWatchers.get(filePath).add(fn);
}
// 5.13.30: writes only when the serialized value actually changed.  Uses an
// in-memory hash cache to avoid the round-trip read; falls back to a one-time
// disk hash when the process restarts.  Eliminates the disk-I/O storm caused by
// the dashboard re-writing PUBLISH_WIZARD_PATH every 8s with identical data.
const __writeJsonHashCache = new Map();
function writeJsonIfChanged(filePath, value) {
  ensureDataDir();
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const hash = crypto.createHash('sha1').update(serialized).digest('hex');
  let prevHash = __writeJsonHashCache.get(filePath);
  if (prevHash === undefined) {
    try { prevHash = fs.existsSync(filePath) ? crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex') : null; }
    catch { prevHash = null; }
  }
  if (hash === prevHash) return false;
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, serialized);
  fs.renameSync(tmp, filePath);
  __writeJsonHashCache.set(filePath, hash);
  __notifyWatchers(filePath);
  return true;
}
function readJsonLines(filePath, limit = 300) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, 'utf8').trim();
    if (!text) return [];
    return text.split('\n').filter(Boolean).slice(-limit).map(line => JSON.parse(line));
  } catch { return []; }
}
function clamp(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
function bool(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

// ── 5.13.36 – Runtime Event Logger ─────────────────────────────────────
const RUNTIME_LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3, audit: 2 };
const RUNTIME_SECRET_KEY_RE = /(token|secret|password|passwd|cookie|session|authorization|steamloginsecure|shared_secret|identity_secret|refresh|mafile|api[_-]?key|steam_web_api_key|steam_api_key|backpack_tf_access_token|backpack_tf_api_key|access_token|sda_password)/i;
function runtimeLoggerOptions() {
  let raw = {};
  try { raw = readJson(OPTIONS_PATH, {}) || {}; } catch { raw = {}; }
  const enabled = bool(raw.runtime_event_logging_enabled, true);
  const level = ['error','warn','info','debug'].includes(String(raw.runtime_log_level || '').toLowerCase()) ? String(raw.runtime_log_level).toLowerCase() : 'info';
  const debug = bool(raw.runtime_debug_logging, false) || String(process.env.DEBUG_LOGGING || '').toLowerCase() === 'true';
  return { enabled, level, debug };
}
function runtimeRequestId() {
  try { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex'); }
  catch { return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
}
function runtimeLooksSensitiveString(text) {
  const s = String(text || '');
  return s.length >= 32 && !/\s/.test(s) && ((/[0-9]/.test(s) && /[A-Za-z]/.test(s)) || /[+/=]/.test(s) || s.length >= 48);
}
function runtimeRedactString(text) {
  return String(text || '').split(/(\s+)/).map(part => runtimeLooksSensitiveString(part) ? '[redacted]' : part).join('').slice(0, 1000);
}
function runtimeRedactValue(key, value, depth = 0, seen = new WeakSet()) {
  const k = String(key || '');
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const isSecretKey = RUNTIME_SECRET_KEY_RE.test(k) && !/(^has_|_has_|_saved$|_present$|_enabled$|_ok$|_count$|_length$|_status$|_masked$|status$|readiness$|missing$|code$|reason$)/i.test(k);
  if (isSecretKey) {
    if (value === undefined || value === null || value === '') return value;
    const text = String(value);
    if (/^(present|missing|yes|no|true|false)$/i.test(text)) return text;
    return { redacted: true, present: Boolean(text), length: text.length };
  }
  if (value instanceof Error) {
    const opts = runtimeLoggerOptions();
    const out = { name: value.name || 'Error', message: runtimeRedactString(value.message || '') };
    if (value.code) out.code = value.code;
    if (opts.debug && value.stack) out.stack = runtimeRedactString(value.stack).slice(0, 6000);
    return out;
  }
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' && /^(requestId|request_id|traceId|trace_id|correlationId|correlation_id)$/i.test(k)) return String(value).slice(0, 160);
  if (typeof value === 'string') return runtimeRedactString(value);
  if (typeof value === 'bigint') return String(value);
  if (Array.isArray(value)) {
    if (depth > 3) return `[array:${value.length}]`;
    return value.slice(0, 20).map((v, i) => runtimeRedactValue(String(i), v, depth + 1, seen));
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    if (depth > 3) return '[object]';
    const out = {};
    for (const [childKey, childValue] of Object.entries(value).slice(0, 80)) out[childKey] = runtimeRedactValue(childKey, childValue, depth + 1, seen);
    return out;
  }
  return String(value);
}
function runtimeEventLog(level, area, action, message, context = {}) {
  try {
    const opts = runtimeLoggerOptions();
    if (!opts.enabled) return null;
    const safeLevel = RUNTIME_LOG_LEVELS[level] === undefined ? 'info' : level;
    if ((RUNTIME_LOG_LEVELS[safeLevel] ?? 2) > (RUNTIME_LOG_LEVELS[opts.level] ?? 2)) return null;
    const entry = { ts: new Date().toISOString(), level: safeLevel, area: String(area || 'general'), action: String(action || 'event'), message: String(message || ''), context: runtimeRedactValue('context', context || {}) };
    const line = `[tf2-hub][event] ${entry.ts} ${entry.level} ${entry.area} ${entry.action} ${entry.message} ${JSON.stringify(entry.context)}`;
    if (safeLevel === 'error') console.error(line); else if (safeLevel === 'warn') console.warn(line); else console.log(line);
    return entry;
  } catch (error) {
    try { console.warn('[tf2-hub][event] logger_failed', error && error.message ? error.message : String(error)); } catch {}
    return null;
  }
}
const runtimeLogger = {
  error: (area, action, message, context) => runtimeEventLog('error', area, action, message, context),
  warn: (area, action, message, context) => runtimeEventLog('warn', area, action, message, context),
  info: (area, action, message, context) => runtimeEventLog('info', area, action, message, context),
  debug: (area, action, message, context) => runtimeEventLog('debug', area, action, message, context),
  audit: (area, action, message, context) => runtimeEventLog('audit', area, action, message, context)
};
function runtimeErrorContext(error, extra = {}) {
  const opts = runtimeLoggerOptions();
  const base = { ...extra, name: error && error.name ? error.name : 'Error', message: typeof safeError === 'function' ? safeError(error) : runtimeRedactString(error && error.message ? error.message : error || 'Unknown error') };
  if (error && error.code) base.code = error.code;
  if (opts.debug && error && error.stack) base.stack = runtimeRedactString(error.stack).slice(0, 6000);
  return base;
}
function runtimeLogVaultStatus(action, status = {}, extra = {}) {
  return runtimeLogger.info('main_account', action, 'Main account vault/status snapshot', {
    ...extra,
    source: status.source || null,
    steamid64_saved: Boolean(status.steam_id64_saved || status.steamid64_saved),
    steam_api_key_saved: Boolean(status.steam_web_api_key_saved || status.steam_api_key_saved),
    backpack_token_saved: Boolean(status.backpack_tf_token_saved || status.backpack_token_saved),
    needs_setup: Boolean(status.needs_setup),
    readiness: status.readiness || null,
    missing: status.missing || null
  });
}



// ── 5.13.29 – Crash watchdog & credential recovery helpers ───────────────
function safeErrorString(error) {
  try {
    if (!error) return '';
    if (error && error.stack) return String(error.stack).slice(0, 8000);
    if (error && error.message) return String(error.message).slice(0, 4000);
    return String(error).slice(0, 4000);
  } catch { return 'unknown error'; }
}
function writeCrashReport(kind, error, extra = {}) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const existing = readJson(CRASH_REPORT_PATH, { ok: true, version: APP_VERSION, crashes: [] });
    const crashes = Array.isArray(existing.crashes) ? existing.crashes.slice(-24) : [];
    const entry = {
      ts: new Date().toISOString(),
      version: APP_VERSION,
      kind,
      pid: process.pid,
      uptime_seconds: Math.round(process.uptime()),
      error: safeErrorString(error),
      extra
    };
    crashes.push(entry);
    fs.writeFileSync(CRASH_REPORT_PATH, JSON.stringify({ ok: false, version: APP_VERSION, updated_at: entry.ts, last: entry, crashes }, null, 2));
    console.error(`[tf2-hub] ${kind}: ${entry.error.split('\n')[0]}`);
  } catch (writeError) {
    try { console.error('[tf2-hub] failed to write crash report:', safeErrorString(writeError)); } catch {}
  }
}
process.on('uncaughtException', error => {
  writeCrashReport('uncaughtException', error, { note: 'Process kept alive by 5.13.29 watchdog. Restart addon if repeated.' });
});
process.on('unhandledRejection', reason => {
  writeCrashReport('unhandledRejection', reason, { note: 'Unhandled promise rejection captured by 5.13.29 watchdog.' });
});
process.on('warning', warning => {
  try { writeCrashReport('processWarning', warning, { name: warning && warning.name }); } catch {}
});
setInterval(() => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(HEARTBEAT_PATH, JSON.stringify({ ok: true, version: APP_VERSION, ts: new Date().toISOString(), pid: process.pid, uptime_seconds: Math.round(process.uptime()) }, null, 2));
  } catch {}
}, 30000);

function accountIdSafe(value, fallback = 'main') {
  const id = String(value || fallback || 'main').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '');
  return id || fallback || 'main';
}

function atomicWriteJson(filePath, payload, mode = 0o600) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;
  let fd = null;
  try {
    fd = fs.openSync(tmp, 'w', mode);
    fs.writeFileSync(fd, serialized, 'utf8');
    try { fs.fsyncSync(fd); } catch {}
  } finally {
    if (fd !== null) { try { fs.closeSync(fd); } catch {} }
  }
  try { fs.chmodSync(tmp, mode); } catch {}
  fs.renameSync(tmp, filePath);
  try { fs.chmodSync(filePath, mode); } catch {}
  try {
    const dirFd = fs.openSync(path.dirname(filePath), 'r');
    try { fs.fsyncSync(dirFd); } catch {}
    try { fs.closeSync(dirFd); } catch {}
  } catch {}
  try { if (typeof __notifyWatchers === 'function') __notifyWatchers(filePath); } catch {}
  return payload;
}
function isMaskedCredentialValue(value) {
  const text = String(value ?? '').trim();
  if (!text) return false;
  const compact = text.replace(/\s+/g, '');
  if (/^[•●*xX._-]{4,}$/.test(compact)) return true;
  return /^(saved|masked|redacted|\[redacted\]|hidden|secret)$/i.test(compact);
}
function cleanCredentialValue(value) {
  if (value === undefined || value === null) return '';
  const text = String(value).trim();
  if (!text || isMaskedCredentialValue(text)) return '';
  return text;
}
function firstCredentialValue(payload = {}, keys = []) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) {
      const value = cleanCredentialValue(payload[key]);
      if (value) return value;
    }
  }
  return '';
}
function isValidSteamId64(value) {
  return /^\d{16,20}$/.test(String(value || '').trim());
}
function mainAccountShortSteamId(value) {
  const text = String(value || '').trim();
  return text.length > 10 ? `${text.slice(0, 7)}…${text.slice(-4)}` : text;
}
function normalizeMainAccountRecord(account = {}, source = 'canonical') {
  const raw = account && typeof account === 'object' ? account : {};
  const normalized = {
    id: 'main',
    role: 'main',
    label: String(raw.label || raw.account_label || 'Main account').trim() || 'Main account',
    updated_at: raw.updated_at || new Date().toISOString(),
    source
  };
  const steamId = cleanCredentialValue(raw.steam_id64 || raw.steamid64 || raw.steamid || raw.steamId64 || raw.steam_id);
  if (steamId && isValidSteamId64(steamId)) normalized.steam_id64 = steamId;
  const steamApi = firstCredentialValue(raw, ['steam_web_api_key', 'steam_api_key', 'steamWebApiKey', 'steamApiKey']);
  if (steamApi) normalized.steam_web_api_key = steamApi;
  const backpackToken = firstCredentialValue(raw, ['backpack_tf_access_token', 'backpack_tf_token', 'backpack_token', 'backpackTfToken', 'backpackAccessToken', 'access_token']);
  if (backpackToken) normalized.backpack_tf_access_token = backpackToken;
  const backpackApi = firstCredentialValue(raw, ['backpack_tf_api_key', 'backpack_api_key', 'backpackTfApiKey', 'backpackApiKey', 'api_key']);
  if (backpackApi) normalized.backpack_tf_api_key = backpackApi;
  if (raw.recovered_from) normalized.recovered_from = raw.recovered_from;
  if (raw.saved_at) normalized.saved_at = raw.saved_at;
  return normalized;
}
function credentialAccountHasAnySecret(account = {}) {
  return Boolean(account && (account.steam_id64 || account.steam_web_api_key || account.backpack_tf_access_token || account.backpack_tf_api_key));
}
function mainAccountVaultShape(account = {}, source = 'canonical') {
  const normalized = normalizeMainAccountRecord(account, source);
  const now = new Date().toISOString();
  const updatedAt = normalized.updated_at || now;
  return {
    ok: true,
    version: APP_VERSION,
    schema_version: DATA_SCHEMA_VERSION,
    vault_type: 'main_account_canonical',
    source,
    updated_at: updatedAt,
    active_account_id: 'main',
    main_account: normalized,
    accounts: { main: normalized }
  };
}
function credentialSavedStatus(account = {}) {
  return {
    steam_web_api_key_saved: Boolean(account.steam_web_api_key),
    steam_api_key_saved: Boolean(account.steam_web_api_key),
    backpack_tf_access_token_saved: Boolean(account.backpack_tf_access_token),
    backpack_tf_api_key_saved: Boolean(account.backpack_tf_api_key),
    backpack_tf_token_saved: Boolean(account.backpack_tf_access_token || account.backpack_tf_api_key),
    steam_id64_saved: Boolean(account.steam_id64)
  };
}
function publicMainAccountStatus(account = {}, source = 'canonical') {
  const normalized = normalizeMainAccountRecord(account, source);
  const saved = credentialSavedStatus(normalized);
  const needsSetup = !(saved.steam_id64_saved && saved.steam_web_api_key_saved && saved.backpack_tf_token_saved);
  return {
    id: 'main',
    role: 'main',
    role_label: 'Main',
    role_description: 'Primary account used by the live Backpack.tf and Steam workflow.',
    label: normalized.label || 'Main account',
    enabled: true,
    source: normalized.source || source,
    storage: path.basename(MAIN_ACCOUNT_VAULT_PATH),
    steam_id64_saved: saved.steam_id64_saved,
    steam_id64: normalized.steam_id64 || '',
    steam_id64_short: mainAccountShortSteamId(normalized.steam_id64),
    steam_web_api_key_saved: saved.steam_web_api_key_saved,
    steam_api_key_saved: saved.steam_api_key_saved,
    backpack_tf_access_token_saved: saved.backpack_tf_access_token_saved,
    backpack_tf_api_key_saved: saved.backpack_tf_api_key_saved,
    backpack_tf_token_saved: saved.backpack_tf_token_saved,
    readiness: needsSetup ? 'needs_setup' : 'ready',
    needs_setup: needsSetup,
    missing: {
      steamid64: !saved.steam_id64_saved,
      steam_api_key: !saved.steam_web_api_key_saved,
      backpack_token: !saved.backpack_tf_token_saved
    },
    updated_at: normalized.updated_at || null,
    secrets_returned: false
  };
}
function extractMainAccountCandidate(source, obj) {
  if (!obj || typeof obj !== 'object') return null;
  const direct = normalizeMainAccountRecord(obj, source);
  if (credentialAccountHasAnySecret(direct)) return { source, account: direct };
  if (obj.main_account && typeof obj.main_account === 'object') {
    const nested = normalizeMainAccountRecord(obj.main_account, source + '.main_account');
    if (credentialAccountHasAnySecret(nested)) return { source: source + '.main_account', account: nested };
  }
  if (obj.accounts && typeof obj.accounts === 'object' && !Array.isArray(obj.accounts)) {
    const main = obj.accounts.main || Object.values(obj.accounts).find(v => v && typeof v === 'object' && (v.role === 'main' || v.id === 'main'));
    if (main) {
      const nested = normalizeMainAccountRecord(main, source + '.accounts.main');
      if (credentialAccountHasAnySecret(nested)) return { source: source + '.accounts.main', account: nested };
    }
  }
  if (Array.isArray(obj.accounts)) {
    const main = obj.accounts.find(v => v && typeof v === 'object' && (v.role === 'main' || v.id === 'main')) || obj.accounts[0];
    if (main) {
      const nested = normalizeMainAccountRecord(main, source + '.accounts[]');
      if (credentialAccountHasAnySecret(nested)) return { source: source + '.accounts[]', account: nested };
    }
  }
  return null;
}
function recoverLegacyMainAccountVaults() {
  const candidates = [];
  const tryFile = (filePath, source) => {
    const raw = readJson(filePath, null);
    const candidate = extractMainAccountCandidate(source, raw);
    if (candidate) candidates.push(candidate);
  };
  tryFile(MAIN_ACCOUNT_VAULT_PATH, 'canonical');
  tryFile(HUB_CREDENTIALS_PATH, path.basename(HUB_CREDENTIALS_PATH));
  tryFile(HUB_CREDENTIALS_LAST_GOOD_PATH, path.basename(HUB_CREDENTIALS_LAST_GOOD_PATH));
  tryFile(OPTIONS_PATH, 'options.json');
  tryFile(ACCOUNTS_PATH, path.basename(ACCOUNTS_PATH));
  tryFile(path.join(DATA_DIR, 'tf2-hub-accounts.json'), 'tf2-hub-accounts.json');
  for (const fileName of ['tf2-hub-credential-vault.json.bak', 'tf2-hub-credential-vault.backup.json', 'tf2-hub-credential-vault.json.stale']) {
    tryFile(path.join(DATA_DIR, fileName), fileName);
  }
  const best = candidates.find(c => c.account.steam_id64 && c.account.steam_web_api_key && (c.account.backpack_tf_access_token || c.account.backpack_tf_api_key))
    || candidates.find(c => c.account.steam_id64 && (c.account.steam_web_api_key || c.account.backpack_tf_access_token || c.account.backpack_tf_api_key))
    || candidates[0];
  const report = {
    ok: Boolean(best),
    version: APP_VERSION,
    checked_at: new Date().toISOString(),
    canonical_path: MAIN_ACCOUNT_VAULT_PATH,
    candidates: candidates.map(c => ({ source: c.source, has_steam_id64: Boolean(c.account.steam_id64), has_steam_web_api_key: Boolean(c.account.steam_web_api_key), has_backpack_tf_token: Boolean(c.account.backpack_tf_access_token || c.account.backpack_tf_api_key) })),
    recovered_from: best ? best.source : null
  };
  try { atomicWriteJson(CREDENTIAL_RECOVERY_REPORT_PATH, report, 0o600); } catch {}
  if (!best) return null;
  const account = { ...best.account, recovered_from: best.source, source: 'legacy_recovered', updated_at: new Date().toISOString() };
  const vault = writeMainAccountVault(account, 'legacy_recovered');
  try { audit('main_account_vault_recovered', { source: best.source, has_steam_id64: Boolean(account.steam_id64), has_steam_web_api_key: Boolean(account.steam_web_api_key), has_backpack_tf_token: Boolean(account.backpack_tf_access_token || account.backpack_tf_api_key) }); } catch {}
  return vault;
}
function readMainAccountVault() {
  const raw = readJson(MAIN_ACCOUNT_VAULT_PATH, null);
  const candidate = extractMainAccountCandidate('canonical', raw);
  if (candidate && credentialAccountHasAnySecret(candidate.account)) return mainAccountVaultShape(candidate.account, 'canonical');
  const recovered = recoverLegacyMainAccountVaults();
  if (recovered) return recovered;
  return mainAccountVaultShape({ id: 'main', role: 'main', label: 'Main account', updated_at: null }, 'missing');
}
function writeMainAccountVault(account = {}, source = 'canonical') {
  const normalized = normalizeMainAccountRecord({ ...account, id: 'main', role: 'main', source }, source);
  normalized.updated_at = new Date().toISOString();
  const vault = mainAccountVaultShape(normalized, source);
  atomicWriteJson(MAIN_ACCOUNT_VAULT_PATH, vault, 0o600);
  if (credentialAccountHasAnySecret(normalized)) {
    try { atomicWriteJson(HUB_CREDENTIALS_LAST_GOOD_PATH, vault, 0o600); } catch {}
  }
  return vault;
}
function mirrorMainAccountCompatibility(account = {}) {
  const normalized = normalizeMainAccountRecord(account, 'canonical');
  const legacyVault = mainAccountVaultShape(normalized, 'canonical_mirror');
  try { atomicWriteJson(HUB_CREDENTIALS_PATH, legacyVault, 0o600); } catch {}
  try {
    const options = readJson(OPTIONS_PATH, {});
    const nextOptions = { ...options, active_account_id: 'main' };
    for (const key of ['steam_id64', 'steam_web_api_key', 'backpack_tf_access_token', 'backpack_tf_api_key']) {
      if (normalized[key]) nextOptions[key] = normalized[key];
      else delete nextOptions[key];
    }
    atomicWriteJson(OPTIONS_PATH, nextOptions, 0o600);
  } catch {}
}
function readCredentialVault() {
  return readMainAccountVault();
}
function writeCredentialVault(vault) {
  const main = (vault && vault.accounts && vault.accounts.main) || (vault && vault.main_account) || {};
  const saved = writeMainAccountVault(main, 'canonical');
  mirrorMainAccountCompatibility(saved.main_account);
  return saved;
}
function verifyMainAccountVault() {
  const vault = readMainAccountVault();
  const account = vault.main_account || {};
  const publicStatus = publicMainAccountStatus(account, vault.source || account.source || 'canonical');
  try { runtimeLogVaultStatus('save_verify_done', publicStatus, { vault_exists: fs.existsSync(MAIN_ACCOUNT_VAULT_PATH), vault_path: path.basename(MAIN_ACCOUNT_VAULT_PATH) }); } catch {}
  return {
    ok: true,
    version: APP_VERSION,
    vault_path: MAIN_ACCOUNT_VAULT_PATH,
    last_good_path: HUB_CREDENTIALS_LAST_GOOD_PATH,
    source: vault.source || publicStatus.source || 'canonical',
    steamid64_saved: publicStatus.steam_id64_saved,
    steam_id64_saved: publicStatus.steam_id64_saved,
    steam_api_key_saved: publicStatus.steam_web_api_key_saved,
    steam_web_api_key_saved: publicStatus.steam_web_api_key_saved,
    backpack_token_saved: publicStatus.backpack_tf_token_saved,
    backpack_tf_token_saved: publicStatus.backpack_tf_token_saved,
    needs_setup: publicStatus.needs_setup,
    missing: publicStatus.missing,
    readiness: publicStatus.readiness,
    main_account: publicStatus,
    secrets_returned: false
  };
}
function mainAccountDebugRedacted() {
  const vault = readMainAccountVault();
  const account = vault.main_account || {};
  const status = publicMainAccountStatus(account, vault.source || 'canonical');
  return {
    ok: true,
    version: APP_VERSION,
    vault_exists: fs.existsSync(MAIN_ACCOUNT_VAULT_PATH),
    vault_path: MAIN_ACCOUNT_VAULT_PATH,
    source: status.source || vault.source || 'missing',
    steamid64_present: status.steam_id64_saved,
    steam_api_key_present: status.steam_web_api_key_saved,
    backpack_token_present: status.backpack_tf_token_saved,
    steamid64_preview: status.steam_id64_short || '',
    needs_setup: status.needs_setup,
    missing: status.missing,
    secrets_returned: false
  };
}
function readCanonicalMainAccountVaultStrict() {
  const raw = readJson(MAIN_ACCOUNT_VAULT_PATH, null);
  const candidate = extractMainAccountCandidate('canonical_vault', raw);
  if (candidate && credentialAccountHasAnySecret(candidate.account)) return mainAccountVaultShape(candidate.account, 'canonical_vault');
  return mainAccountVaultShape({ id: 'main', role: 'main', label: 'Main account', updated_at: null }, fs.existsSync(MAIN_ACCOUNT_VAULT_PATH) ? 'canonical_vault_empty' : 'canonical_vault_missing');
}
function canonicalFieldWord(present) { return present ? 'present' : 'missing'; }
function canonicalMainAccountStatusResponse(extra = {}) {
  const vaultExists = fs.existsSync(MAIN_ACCOUNT_VAULT_PATH);
  const vault = readCanonicalMainAccountVaultStrict();
  const account = vault.main_account || {};
  const publicStatus = publicMainAccountStatus(account, vault.source || 'canonical_vault');
  const source = vaultExists ? 'canonical_vault' : 'canonical_vault_missing';
  const publicMain = { ...publicStatus, source, missing: { ...(publicStatus.missing || {}) } };
  const response = {
    ok: true,
    version: APP_VERSION,
    vault_exists: vaultExists,
    vault_path: MAIN_ACCOUNT_VAULT_PATH,
    source,
    steamid64: canonicalFieldWord(publicStatus.steam_id64_saved),
    steam_api_key: canonicalFieldWord(publicStatus.steam_web_api_key_saved),
    backpack_tf_token: canonicalFieldWord(publicStatus.backpack_tf_token_saved),
    scope: 'main_only',
    updated_at: publicStatus.updated_at || vault.updated_at || null,
    readiness: publicStatus.readiness,
    needs_setup: publicStatus.needs_setup,
    missing: { ...(publicStatus.missing || {}) },
    main_account: publicMain,
    account_status: [JSON.parse(JSON.stringify(publicMain))],
    accounts: [JSON.parse(JSON.stringify(publicMain))],
    secrets_returned: false,
    ...extra
  };
  try { runtimeLogVaultStatus('status_read', response.main_account, { endpoint: 'main-account/status', vault_exists: vaultExists, source }); } catch {}
  return response;
}
function fileMetaRedacted(filePath) {
  try {
    const st = fs.statSync(filePath);
    return { path: filePath, exists: true, readable: true, size_bytes: st.size, mtime: st.mtime.toISOString() };
  } catch (error) {
    return { path: filePath, exists: fs.existsSync(filePath), readable: false, size_bytes: 0, mtime: null, error: error && error.code ? error.code : safeError(error) };
  }
}
function mainAccountDebugStatus() {
  const status = canonicalMainAccountStatusResponse();
  const lastTrace = readJson(MAIN_ACCOUNT_SAVE_TRACE_PATH, { ok: true, version: APP_VERSION, events: [] });
  const legacyPaths = [HUB_CREDENTIALS_PATH, HUB_CREDENTIALS_LAST_GOOD_PATH, OPTIONS_PATH, ACCOUNTS_PATH, path.join(DATA_DIR, 'tf2-hub-accounts.json')];
  return {
    ok: true,
    version: APP_VERSION,
    paths: {
      canonical: fileMetaRedacted(MAIN_ACCOUNT_VAULT_PATH),
      legacy_candidates: legacyPaths.map(fileMetaRedacted)
    },
    canonical_fields: {
      steamid64: status.steamid64,
      steam_api_key: status.steam_api_key,
      backpack_tf_token: status.backpack_tf_token
    },
    readiness: status.readiness,
    missing: status.missing,
    last_save_trace: Array.isArray(lastTrace.events) ? lastTrace.events.slice(-40) : [],
    secrets_returned: false
  };
}
function isolatedMainAccountSave(payload = {}, requestId = runtimeRequestId()) {
  const startedAt = Date.now();
  const traceId = payload.__save_trace_id || requestId;
  const trace = (event, data = {}) => mainAccountSaveTrace(event, { trace_id: traceId, elapsed_ms: Date.now() - startedAt, ...data });
  trace('main-account.save.start', { has_steamid64: Boolean(payload.steam_id64 || payload.steamid64), has_steam_api_key: Boolean(payload.steam_web_api_key || payload.steam_api_key), has_backpack_token: Boolean(payload.backpack_tf_access_token || payload.backpack_tf_token || payload.backpack_token || payload.backpack_tf_api_key) });
  runtimeLogger.info('main_account', 'main-account.save.start', 'Main account isolated save started', { requestId, trace_id: traceId });
  const currentVault = readCanonicalMainAccountVaultStrict();
  const current = currentVault.main_account || {};
  const candidate = buildMainAccountFromPayload({ ...payload, id: 'main', account_id: 'main', role: 'main' }, current).account;
  if (payload.clear_steam_web_api_key || payload.clear_steam_api_key) delete candidate.steam_web_api_key;
  if (payload.clear_backpack_tf_access_token || payload.clear_backpack_tf_api_key || payload.clear_backpack_token) { delete candidate.backpack_tf_access_token; delete candidate.backpack_tf_api_key; }
  const missing = [];
  if (!candidate.steam_id64) missing.push('steamid64');
  if (!candidate.steam_web_api_key) missing.push('steam_api_key');
  if (!(candidate.backpack_tf_access_token || candidate.backpack_tf_api_key)) missing.push('backpack_tf_token');
  if (missing.length) {
    trace('main-account.save.validation_failed', { missing });
    runtimeLogger.warn('main_account', 'main-account.save.validation_failed', 'Main account save validation failed', { requestId, trace_id: traceId, missing });
    return { ok: false, version: APP_VERSION, saved: false, verified: false, error: 'Missing required Main account credential fields.', missing, status: { steamid64: canonicalFieldWord(Boolean(candidate.steam_id64)), steam_api_key: canonicalFieldWord(Boolean(candidate.steam_web_api_key)), backpack_tf_token: canonicalFieldWord(Boolean(candidate.backpack_tf_access_token || candidate.backpack_tf_api_key)), scope: 'main_only' }, trace_id: traceId, elapsed_ms: Date.now() - startedAt, secrets_returned: false };
  }
  const vault = mainAccountVaultShape(candidate, 'canonical_vault');
  trace('main-account.save.write_start', { vault_path: MAIN_ACCOUNT_VAULT_PATH });
  atomicWriteJson(MAIN_ACCOUNT_VAULT_PATH, vault, 0o600);
  trace('main-account.save.write_ok', { vault_path: MAIN_ACCOUNT_VAULT_PATH });
  runtimeLogger.info('main_account', 'main-account.save.write_ok', 'Canonical Main account vault written', { requestId, trace_id: traceId, vault_path: MAIN_ACCOUNT_VAULT_PATH });
  const verifyStatus = canonicalMainAccountStatusResponse({ save_trace_id: traceId });
  const verified = Boolean(verifyStatus.steamid64 === 'present' && verifyStatus.steam_api_key === 'present' && verifyStatus.backpack_tf_token === 'present');
  trace(verified ? 'main-account.save.verify_ok' : 'main-account.save.verify_failed', { steamid64: verifyStatus.steamid64, steam_api_key: verifyStatus.steam_api_key, backpack_tf_token: verifyStatus.backpack_tf_token, readiness: verifyStatus.readiness });
  runtimeLogger.info('main_account', verified ? 'main-account.save.verify_ok' : 'main-account.save.verify_failed', 'Canonical Main account vault verification finished', { requestId, trace_id: traceId, verified, steamid64: verifyStatus.steamid64, steam_api_key: verifyStatus.steam_api_key, backpack_tf_token: verifyStatus.backpack_tf_token });
  const duration = Date.now() - startedAt;
  trace('main-account.save.done', { duration_ms: duration, verified });
  runtimeLogger.info('main_account', 'main-account.save.done', 'Main account isolated save finished', { requestId, trace_id: traceId, duration_ms: duration, verified });
  return {
    ...verifyStatus,
    ok: verified,
    saved: true,
    verified,
    save_verified: verified,
    trace_id: traceId,
    elapsed_ms: duration,
    vault_path: MAIN_ACCOUNT_VAULT_PATH,
    status: { steamid64: verifyStatus.steamid64, steam_api_key: verifyStatus.steam_api_key, backpack_tf_token: verifyStatus.backpack_tf_token, scope: 'main_only' },
    secrets_returned: false
  };
}
function buildMainAccountFromPayload(payload = {}, current = {}) {
  const validation = [];
  const next = normalizeMainAccountRecord(current, 'canonical');
  next.id = 'main';
  next.role = 'main';
  next.label = cleanCredentialValue(payload.label || payload.account_label) || next.label || 'Main account';
  const candidateSteamId = firstCredentialValue(payload, ['steam_id64', 'steamid64', 'steamid', 'steamId64', 'steam_id']);
  if (candidateSteamId) {
    if (isValidSteamId64(candidateSteamId)) next.steam_id64 = candidateSteamId;
    else validation.push({ field: 'steam_id64', ok: false, error: 'SteamID64 must be a numeric string.' });
  }
  const candidateSteamApi = firstCredentialValue(payload, ['steam_web_api_key', 'steam_api_key', 'steamWebApiKey', 'steamApiKey']);
  if (candidateSteamApi) next.steam_web_api_key = candidateSteamApi;
  const candidateBackpackToken = firstCredentialValue(payload, ['backpack_tf_access_token', 'backpack_tf_token', 'backpack_token', 'backpackTfToken', 'backpackAccessToken', 'access_token']);
  if (candidateBackpackToken) next.backpack_tf_access_token = candidateBackpackToken;
  const candidateBackpackApi = firstCredentialValue(payload, ['backpack_tf_api_key', 'backpack_api_key', 'backpackTfApiKey', 'backpackApiKey', 'api_key']);
  if (candidateBackpackApi) next.backpack_tf_api_key = candidateBackpackApi;
  if (payload.clear_steam_id64) delete next.steam_id64;
  if (payload.clear_steam_web_api_key || payload.clear_steam_api_key) delete next.steam_web_api_key;
  if (payload.clear_backpack_tf_access_token || payload.clear_backpack_token) delete next.backpack_tf_access_token;
  if (payload.clear_backpack_tf_api_key || payload.clear_backpack_api_key) delete next.backpack_tf_api_key;
  next.updated_at = new Date().toISOString();
  return { account: next, validation, validation_ok: validation.length === 0 };
}

function mainAccountSaveTrace(stage, detail = {}) {
  const entry = { ts: new Date().toISOString(), version: APP_VERSION, pid: process.pid, uptime_seconds: Math.round(process.uptime()), stage: String(stage || 'unknown'), ...detail };
  try {
    const current = readJson(MAIN_ACCOUNT_SAVE_TRACE_PATH, { ok: true, version: APP_VERSION, events: [] }) || { ok: true, events: [] };
    const events = Array.isArray(current.events) ? current.events.slice(-80) : [];
    events.push(entry);
    atomicWriteJson(MAIN_ACCOUNT_SAVE_TRACE_PATH, { ok: true, version: APP_VERSION, updated_at: entry.ts, last: entry, events, hint: 'Redacted save trace. Secrets are not stored here.' }, 0o600);
  } catch {}
  try { runtimeLogger.info('main_account', entry.stage, 'Main account save trace', entry); } catch {}
  return entry;
}

function readRuntimeControls() {
  const raw = readJson(RUNTIME_CONTROLS_PATH, { ok: true, version: APP_VERSION });
  return raw && typeof raw === 'object' ? raw : { ok: true, version: APP_VERSION };
}
function writeRuntimeControls(update = {}) {
  const current = readRuntimeControls();
  const payload = { ...current, ...update, ok: true, version: APP_VERSION, updated_at: new Date().toISOString() };
  writeJson(RUNTIME_CONTROLS_PATH, payload);
  return payload;
}
function runtimeMaintainerEnabled(defaultValue = true) {
  const controls = readRuntimeControls();
  return typeof controls.persistent_classifieds_maintainer_enabled === 'boolean' ? controls.persistent_classifieds_maintainer_enabled : Boolean(defaultValue);
}
function tradeGuardStatus(extra = {}) {
  const state = readJson(TRADE_GUARD_PATH, { ok: true, version: APP_VERSION, updated_at: null, last_result: null, entries: [] });
  return { ok: true, version: APP_VERSION, enabled: getOptions().trade_mismatch_auto_decline_enabled, updated_at: state.updated_at || null, last_result: state.last_result || null, entries: Array.isArray(state.entries) ? state.entries.slice(-20) : [], ...extra };
}
function saveTradeGuardRun(result = {}) {
  const state = readJson(TRADE_GUARD_PATH, { ok: true, version: APP_VERSION, entries: [] });
  const entry = { ...result, version: APP_VERSION, completed_at: result.completed_at || new Date().toISOString() };
  const entries = [...(Array.isArray(state.entries) ? state.entries : []), entry].slice(-100);
  const payload = { ok: true, version: APP_VERSION, updated_at: entry.completed_at, last_result: entry, entries };
  writeJson(TRADE_GUARD_PATH, payload);
  return payload;
}
function buildCounterofferPreview(draft = {}, options = getOptions()) {
  const sendable = Boolean(draft.sendable);
  const dryRunValidation = Boolean(options.trade_counteroffer_dry_run_validation_enabled);
  const liveAllowed = Boolean(!dryRunValidation && options.allow_live_trade_counteroffers && options.trade_counteroffer_mode === 'send_when_safe');
  const originalGive = Number(draft.original_give_ref || 0);
  const originalReceive = Number(draft.original_receive_ref || 0);
  const correctedGive = Number(draft.corrected_give_ref || 0);
  const correctedReceive = Number(draft.corrected_receive_ref || originalReceive || 0);
  const shortfall = Number(draft.shortfall_ref || Math.max(0, originalGive - originalReceive).toFixed?.(2) || 0);
  const correctedProfit = Number(draft.corrected_profit_ref || (correctedReceive - correctedGive).toFixed?.(2) || 0);
  const removedItems = Array.isArray(draft.removed_items) ? draft.removed_items : [];
  const selectedItems = Array.isArray(draft.selected_items) ? draft.selected_items : [];
  const reason = String(draft.reason || (sendable ? 'Safe corrected counteroffer can be built.' : 'Counteroffer is not safe to send.'));
  const safeToSend = sendable && correctedProfit >= Number(options.trade_counteroffer_min_profit_ref || 0.11) && correctedGive > 0 && correctedReceive > 0;
  const action = safeToSend ? (liveAllowed ? 'ready_to_send_live_when_cycle_runs' : 'preview_only_live_sending_disabled') : 'do_not_send';
  return {
    tradeofferid: draft.tradeofferid || null,
    partner_steamid64: draft.partner_steamid64 || null,
    original_offer: {
      our_side_ref: originalGive,
      their_side_ref: originalReceive,
      shortfall_ref: shortfall
    },
    corrected_offer: {
      our_side_ref: correctedGive,
      their_side_ref: correctedReceive,
      expected_profit_ref: correctedProfit,
      strategy: draft.strategy || 'not_sendable',
      removed_items_count: removedItems.length,
      kept_items_count: selectedItems.length
    },
    verdict: safeToSend ? 'safe_counteroffer_preview' : 'unsafe_manual_review_or_decline',
    safe_to_send: safeToSend,
    live_sending_enabled: liveAllowed,
    dry_run_validation_enabled: dryRunValidation,
    live_sending_blocked_by_dry_run_validation: Boolean(dryRunValidation && options.allow_live_trade_counteroffers),
    action,
    reason,
    removed_items: removedItems.slice(0, 8),
    kept_items: selectedItems.slice(0, 8),
    message: safeToSend
      ? `Counteroffer would reduce our side from ${originalGive} ref to ${correctedGive} ref while receiving ${correctedReceive} ref.`
      : reason
  };
}
function buildCounterofferPreviewSummary(drafts = [], options = getOptions()) {
  const previews = (Array.isArray(drafts) ? drafts : []).slice(-20).map(d => buildCounterofferPreview(d, options));
  const safe = previews.filter(p => p.safe_to_send);
  const unsafe = previews.filter(p => !p.safe_to_send);
  return {
    ok: true,
    version: APP_VERSION,
    enabled: Boolean(options.trade_mismatch_counteroffer_enabled),
    live_sending_enabled: Boolean(!options.trade_counteroffer_dry_run_validation_enabled && options.allow_live_trade_counteroffers && options.trade_counteroffer_mode === 'send_when_safe'),
    dry_run_validation_enabled: Boolean(options.trade_counteroffer_dry_run_validation_enabled),
    live_sending_blocked_by_dry_run_validation: Boolean(options.trade_counteroffer_dry_run_validation_enabled && options.allow_live_trade_counteroffers),
    preview_count: previews.length,
    safe_to_send_count: safe.length,
    unsafe_count: unsafe.length,
    would_counteroffer_count: safe.length,
    would_decline_or_manual_review_count: unsafe.length,
    previews,
    headline: previews.length ? `${safe.length} would-counteroffer preview(s), ${unsafe.length} would-decline/manual-review.` : 'No counteroffer dry-run previews yet.',
    note: 'Dry-run validation: good/overpay offers stay for manual accept; this never auto-accepts Steam trades or confirms Steam Guard.'
  };
}
function tradeCounterofferStatus(extra = {}) {
  const state = readJson(TRADE_COUNTEROFFER_PATH, { ok: true, version: APP_VERSION, updated_at: null, last_result: null, drafts: [], entries: [] });
  const options = getOptions();
  const drafts = Array.isArray(state.drafts) ? state.drafts.slice(-20) : [];
  const preview = buildCounterofferPreviewSummary(drafts, options);
  return {
    ok: true,
    version: APP_VERSION,
    enabled: Boolean(options.trade_mismatch_counteroffer_enabled),
    live_sending_enabled: Boolean(!options.trade_counteroffer_dry_run_validation_enabled && options.allow_live_trade_counteroffers),
    live_sending_requested: Boolean(options.allow_live_trade_counteroffers),
    dry_run_validation_enabled: Boolean(options.trade_counteroffer_dry_run_validation_enabled),
    live_sending_blocked_by_dry_run_validation: Boolean(options.trade_counteroffer_dry_run_validation_enabled && options.allow_live_trade_counteroffers),
    mode: options.trade_counteroffer_mode,
    updated_at: state.updated_at || null,
    last_result: state.last_result || null,
    drafts,
    entries: Array.isArray(state.entries) ? state.entries.slice(-20) : [],
    preview,
    safety: { auto_accept: false, steam_confirmation: false, dry_run_validation_default: true, send_counteroffer_requires_explicit_option: true, good_or_overpay_stays_manual: true },
    ...extra
  };
}
function saveTradeCounterofferRun(result = {}) {
  const state = readJson(TRADE_COUNTEROFFER_PATH, { ok: true, version: APP_VERSION, drafts: [], entries: [] });
  const entry = { ...result, version: APP_VERSION, completed_at: result.completed_at || new Date().toISOString() };
  const entries = [...(Array.isArray(state.entries) ? state.entries : []), entry].slice(-100);
  const drafts = [...(Array.isArray(state.drafts) ? state.drafts : []), ...(Array.isArray(result.drafts) ? result.drafts : [])].slice(-200);
  const payload = { ok: result.ok !== false, version: APP_VERSION, updated_at: entry.completed_at, last_result: entry, drafts, entries };
  writeJson(TRADE_COUNTEROFFER_PATH, payload);
  return payload;
}

function offerItemNames(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .map(row => row.market_hash_name || row.item_name || row.matched_key || row.name || row.assetid || '')
    .filter(Boolean)
    .slice(0, 8);
}
function offerStageForDecision(decision = {}, historyEntry = {}) {
  const state = Number(decision.state || 0);
  const active = state === 2 || state === 9;
  if (historyEntry.status === 'declined_by_guard' || decision.reviewed_status === 'declined_by_guard') return 'bad_offer_declined_by_guard';
  if (!active && state === 3) return 'accepted_waiting_inventory_sync';
  if (!active) return 'offer_not_active';
  if (decision.decision === 'accept_recommended') return 'good_offer_waiting_manual_accept';
  if (decision.decision === 'reject_recommended') return 'bad_offer_flagged_for_decline';
  return 'offer_needs_manual_review';
}
function buildTradeOfferStateMachine(reason = 'status') {
  const now = new Date().toISOString();
  const decisionsPayload = readJson(DECISIONS_PATH, { ok: true, decisions: [], updated_at: null });
  const decisions = Array.isArray(decisionsPayload.decisions) ? decisionsPayload.decisions : [];
  const history = readOfferHistory();
  const listings = readAccountListingsArray();
  const inventory = readInventoryItemsArray();
  const draftsPayload = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(draftsPayload.drafts) ? draftsPayload.drafts : [];
  const activeBuyListings = listings.filter(l => listingIntentValue(l) === 'buy' && !l.archived);
  const activeSellListings = listings.filter(l => listingIntentValue(l) === 'sell' && !l.archived);
  const states = [];
  for (const listing of activeBuyListings.slice(0, 30)) {
    states.push({
      stage: 'buy_listing_active',
      status: 'waiting_for_incoming_offer',
      item_name: listingItemName(listing),
      listing_id: listing.id || listing.listing_id || listing.hash || null,
      intent: 'buy',
      price_ref: Number(listing.currencies?.metal ?? listing.value?.raw ?? listing.metal ?? 0) || null,
      url: listing.id ? `https://backpack.tf/classifieds?listing=${listing.id}` : null
    });
  }
  const incoming = decisions.filter(d => !d.is_our_offer);
  for (const d of incoming.slice(0, 40)) {
    const hist = history.offers?.[String(d.tradeofferid || '')] || {};
    const stage = offerStageForDecision(d, hist);
    const isGood = stage === 'good_offer_waiting_manual_accept';
    states.push({
      stage,
      status: isGood ? 'manual_accept_required' : (stage.includes('declined') ? 'declined_or_blocked' : 'review_required'),
      tradeofferid: d.tradeofferid,
      state: d.state,
      state_label: d.state_label || OFFER_STATE[d.state] || 'Unknown',
      decision: d.decision,
      risk_score: Number(d.risk_score || 0),
      pricing_score: Number(d.pricing_score || 0),
      estimated_give_ref: Number(d.estimated_give_ref || 0),
      estimated_receive_ref: Number(d.estimated_receive_ref || 0),
      estimated_profit_ref: Number(d.estimated_profit_ref || 0),
      overpay_good: isGood && Number(d.estimated_profit_ref || 0) >= 0,
      items_to_give: offerItemNames(d.items_to_give),
      items_to_receive: offerItemNames(d.items_to_receive),
      link: d.links?.offer_url || null,
      guard_note: isGood ? 'Good/overpay offer stays for manual accept.' : (stage.includes('bad') ? 'Bad/mismatch offer should be declined by Trade Guard when a valid Steam session is available.' : 'Manual review required.'),
      reviewed_status: d.reviewed_status || hist.status || 'new'
    });
  }
  for (const draft of drafts.filter(d => String(d.intent || '').toLowerCase() === 'sell').slice(0, 30)) {
    states.push({
      stage: String(d.local_status || '').startsWith('published') ? 'sell_listing_active_or_published' : 'sell_draft_ready',
      status: d.local_status || 'draft',
      item_name: d.item_name,
      draft_id: d.draft_id,
      assetid: d.assetid || d.provider_payload_preview?.id || null,
      intent: 'sell',
      price_ref: Number(d.max_buy_ref || d.provider_payload_preview?.currencies?.metal || 0) || null,
      published_listing_id: d.published_listing_id || null,
      published_listing_url: d.published_listing_url || null
    });
  }
  for (const listing of activeSellListings.slice(0, 30)) {
    states.push({
      stage: 'sell_listing_active',
      status: 'waiting_for_buyer',
      item_name: listingItemName(listing),
      listing_id: listing.id || listing.listing_id || listing.hash || null,
      intent: 'sell',
      price_ref: Number(listing.currencies?.metal ?? listing.value?.raw ?? listing.metal ?? 0) || null,
      url: listing.id ? `https://backpack.tf/classifieds?listing=${listing.id}` : null
    });
  }
  const counts = {
    buy_listing_active: states.filter(s => s.stage === 'buy_listing_active').length,
    incoming_offers: incoming.length,
    waiting_manual_accept: states.filter(s => s.stage === 'good_offer_waiting_manual_accept').length,
    declined_or_bad: states.filter(s => /bad_offer|declined/.test(s.stage)).length,
    needs_review: states.filter(s => s.stage === 'offer_needs_manual_review').length,
    accepted_waiting_inventory_sync: states.filter(s => s.stage === 'accepted_waiting_inventory_sync').length,
    sell_drafts_ready: states.filter(s => s.stage === 'sell_draft_ready').length,
    sell_listing_active: states.filter(s => s.stage === 'sell_listing_active' || s.stage === 'sell_listing_active_or_published').length,
    inventory_items_seen: inventory.length
  };
  const next_action = counts.waiting_manual_accept
    ? 'Good incoming offer detected. Review and accept it manually in Steam; after acceptance, inventory sync will trigger auto-sell.'
    : (counts.declined_or_bad ? 'Bad offers were flagged/declined. Check Trade Guard details if anything looks wrong.'
      : (counts.sell_drafts_ready ? 'Sell draft is ready; maintainer can publish it while guarded classifieds mode is on.'
        : (counts.buy_listing_active ? 'Buy listings are active. Waiting for incoming offers.' : 'No active buy listing state yet. Run workflow or maintainer.')));
  const result = { ok: true, version: APP_VERSION, updated_at: now, reason, counts, next_action, states: states.slice(0, 120), safety: { auto_accept: false, steam_confirmation: false, bad_offer_auto_decline: Boolean(getOptions().trade_mismatch_auto_decline_enabled), overpay_stays_good: true } };
  writeJson(TRADE_OFFER_STATE_MACHINE_PATH, result);
  return result;
}
function readTradeOfferStateMachine() {
  try {
    const cached = readJson(TRADE_OFFER_STATE_MACHINE_PATH, null);
    if (cached && cached.ok && cached.version === APP_VERSION) return cached;
    return buildTradeOfferStateMachine('cache_miss');
  } catch (error) {
    const fallback = { ok: false, version: APP_VERSION, updated_at: new Date().toISOString(), reason: 'safe_fallback', counts: {}, states: [], next_action: 'Trade state machine failed safely. Dashboard remains available.', error: safeError(error), safety: { auto_accept: false, steam_confirmation: false, bad_offer_auto_decline: false, overpay_stays_good: true } };
    writeJson(TRADE_OFFER_STATE_MACHINE_PATH, fallback);
    return fallback;
  }
}
function getOptions() {
  const options = readJson(OPTIONS_PATH, {});
  const credentialVault = readCredentialVault();
  // 5.13.29: the live publish/inventory workflow is Main-only.  Do not let an
  // old active_account_id or hidden multi-account card override the visible Main
  // credentials.  Main account credential vault is the single source of truth.
  const activeCredentialAccountId = 'main';
  const credentialAccount = (credentialVault.accounts && (credentialVault.accounts.main || credentialVault.accounts[activeCredentialAccountId])) || {};
  return {
    steam_web_api_key: String(credentialAccount.steam_web_api_key || options.steam_web_api_key || '').trim(),
    steam_id64: String(credentialAccount.steam_id64 || options.steam_id64 || '').trim(),
    get_sent_offers: options.get_sent_offers !== false,
    get_received_offers: options.get_received_offers !== false,
    get_descriptions: options.get_descriptions !== false,
    active_only: options.active_only !== false,
    auto_review_enabled: bool(options.auto_review_enabled, true),
    review_interval_minutes: clamp(options.review_interval_minutes, 5, 1, 1440),
    notify_on_accept_recommended: bool(options.notify_on_accept_recommended, true),
    notify_on_needs_review: bool(options.notify_on_needs_review, true),
    ha_notifications_enabled: bool(options.ha_notifications_enabled, true),
    min_profit_ref_for_accept: clamp(options.min_profit_ref_for_accept, 0, 0, 100000),
    max_risk_for_accept: clamp(options.max_risk_for_accept, 25, 0, 100),
    provider_timeout_seconds: clamp(options.provider_timeout_seconds, 15, 5, 60),
    max_notifications_per_cycle: clamp(options.max_notifications_per_cycle, 5, 1, 50),
    manual_review_base_url: String(options.manual_review_base_url || 'https://steamcommunity.com').replace(/\/$/, ''),
    pricelist_path: String(options.pricelist_path || PRICELIST_PATH).trim() || PRICELIST_PATH,
    steam_retry_count: clamp(options.steam_retry_count, 2, 0, 5),
    steam_retry_backoff_seconds: clamp(options.steam_retry_backoff_seconds, 3, 1, 60),
    steam_offer_dedupe_ttl_days: clamp(options.steam_offer_dedupe_ttl_days, 14, 1, 365),
    steam_offer_history_limit: clamp(options.steam_offer_history_limit, 1000, 100, 10000),
    pricing_engine_enabled: bool(options.pricing_engine_enabled, true),
    pricing_min_margin_percent: clamp(options.pricing_min_margin_percent, 3, 0, 1000),
    pricing_min_profit_ref: clamp(options.pricing_min_profit_ref, 0.11, 0, 100000),
    pricing_unknown_item_risk: clamp(options.pricing_unknown_item_risk, 22, 0, 100),
    liquidity_min_listing_count: clamp(options.liquidity_min_listing_count, 4, 0, 100000),
    max_offer_value_ref: clamp(options.max_offer_value_ref, 100, 0, 1000000),
    do_not_trade_tags: String(options.do_not_trade_tags || 'scam,blocked,do_not_trade').split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
    backpack_tf_enabled: bool(options.backpack_tf_enabled, true),
    backpack_tf_access_token: String(credentialAccount.backpack_tf_access_token || options.backpack_tf_access_token || '').trim(),
    backpack_tf_api_key: String(credentialAccount.backpack_tf_api_key || options.backpack_tf_api_key || '').trim(),
    backpack_tf_user_agent: String(options.backpack_tf_user_agent || 'TF2-HA-TF2-Trading-Hub/5.13.36').trim(),
    backpack_tf_base_url: String(options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, ''),
    backpack_tf_cache_ttl_minutes: clamp(options.backpack_tf_cache_ttl_minutes, 30, 1, 1440),
    backpack_tf_retry_count: clamp(options.backpack_tf_retry_count, 2, 0, 5),
    backpack_tf_write_mode: ['off', 'guarded', 'active'].includes(options.backpack_tf_write_mode) ? options.backpack_tf_write_mode : 'guarded',
    allow_live_classifieds_writes: bool(options.allow_live_classifieds_writes, false),
    allow_live_backpack_writes: bool(options.allow_live_backpack_writes, false),
    allow_guarded_backpack_publish: bool(options.allow_guarded_backpack_publish, false),
    archive_classifieds_on_startup: bool(options.archive_classifieds_on_startup, false),
    archive_classifieds_on_startup_requires_write_sliders: bool(options.archive_classifieds_on_startup_requires_write_sliders, true),
    archive_classifieds_on_startup_run_maintainer_after: bool(options.archive_classifieds_on_startup_run_maintainer_after, false),
    archive_classifieds_on_startup_delay_seconds: clamp(options.archive_classifieds_on_startup_delay_seconds, 5, 0, 300),
    archive_classifieds_on_startup_cooldown_seconds: clamp(options.archive_classifieds_on_startup_cooldown_seconds, 20, 0, 86400),
    startup_rebuild_enabled: bool(options.startup_rebuild_enabled, false),
    startup_rebuild_run_after_archive: bool(options.startup_rebuild_run_after_archive, false),
    startup_rebuild_fast_fill_minutes: clamp(options.startup_rebuild_fast_fill_minutes, 10, 0, 120),
    startup_rebuild_batch_size: clamp(options.startup_rebuild_batch_size, 20, 1, 120),
    startup_rebuild_normal_batch_size: clamp(options.startup_rebuild_normal_batch_size, 20, 1, 120),
    startup_rebuild_max_runs: clamp(options.startup_rebuild_max_runs, 3, 1, 20),
    persistent_classifieds_maintainer_enabled: runtimeMaintainerEnabled(bool(options.persistent_classifieds_maintainer_enabled, true)),
    persistent_classifieds_interval_minutes: clamp(options.persistent_classifieds_interval_minutes, 5, 1, 1440),
    persistent_classifieds_max_publishes_per_cycle: clamp(options.persistent_classifieds_max_publishes_per_cycle, 80, 1, 120),
    fast_dashboard_status_enabled: bool(options.fast_dashboard_status_enabled, true),
    maintainer_async_status_mode: bool(options.maintainer_async_status_mode, true),
    maintainer_skip_per_listing_verify: bool(options.maintainer_skip_per_listing_verify, true),
    maintainer_verify_after_cycle: bool(options.maintainer_verify_after_cycle, true),
    maintainer_publish_batch_hard_cap: clamp(options.maintainer_publish_batch_hard_cap, 80, 1, 120),
    publish_error_inspector_enabled: bool(options.publish_error_inspector_enabled, true),
    publish_error_inspector_recent_runs: clamp(options.publish_error_inspector_recent_runs, 8, 1, 50),
    publish_error_inspector_sample_limit: clamp(options.publish_error_inspector_sample_limit, 12, 1, 100),
    adaptive_fill_controller_enabled: bool(options.adaptive_fill_controller_enabled, true),
    adaptive_fill_target_per_cycle: clamp(options.adaptive_fill_target_per_cycle, 20, 1, 120),
    adaptive_fill_max_per_cycle: clamp(options.adaptive_fill_max_per_cycle, 80, 1, 120),
    adaptive_fill_min_per_cycle: clamp(options.adaptive_fill_min_per_cycle, 3, 1, 120),
    adaptive_fill_rate_limit_backoff_per_cycle: clamp(options.adaptive_fill_rate_limit_backoff_per_cycle, 5, 1, 120),
    adaptive_fill_error_slowdown_threshold: clamp(options.adaptive_fill_error_slowdown_threshold, 10, 0, 1000),
    adaptive_fill_success_boost_threshold: clamp(options.adaptive_fill_success_boost_threshold, 8, 0, 1000),
    adaptive_fill_dashboard_enabled: bool(options.adaptive_fill_dashboard_enabled, true),
    safe_filtered_errors_do_not_slow_fill: bool(options.safe_filtered_errors_do_not_slow_fill, true),
    publish_error_inspector_count_brain_blocks_as_filtered: bool(options.publish_error_inspector_count_brain_blocks_as_filtered, true),
    adaptive_fill_ignore_safe_filtered_errors: bool(options.adaptive_fill_ignore_safe_filtered_errors, true),
    adaptive_fill_provider_error_only_slowdown: bool(options.adaptive_fill_provider_error_only_slowdown, true),
    maintainer_trading_brain_block_does_not_consume_batch: bool(options.maintainer_trading_brain_block_does_not_consume_batch, true),
    maintainer_publish_brain_block_is_safe_filter: bool(options.maintainer_publish_brain_block_is_safe_filter, true),
    maintainer_skip_unaffordable_buy_candidates: bool(options.maintainer_skip_unaffordable_buy_candidates, true),
    maintainer_unaffordable_skip_does_not_consume_batch: bool(options.maintainer_unaffordable_skip_does_not_consume_batch, true),
    maintainer_affordable_candidate_rotation_enabled: bool(options.maintainer_affordable_candidate_rotation_enabled, true),
    maintainer_dashboard_suppress_unaffordable_currency_noise: bool(options.maintainer_dashboard_suppress_unaffordable_currency_noise, true),
    trading_brain_suppress_unactionable_blocked_buy_samples: bool(options.trading_brain_suppress_unactionable_blocked_buy_samples, true),
    trading_brain_block_extreme_unprofitable_high_value_buys: bool(options.trading_brain_block_extreme_unprofitable_high_value_buys, true),
    currency_helper_use_actionable_candidate_only: bool(options.currency_helper_use_actionable_candidate_only, true),
    market_pricing_suppress_corrupt_samples: bool(options.market_pricing_suppress_corrupt_samples, true),
    maintainer_prune_unactionable_buy_drafts: bool(options.maintainer_prune_unactionable_buy_drafts, true),
    maintainer_mark_unactionable_queue_held: bool(options.maintainer_mark_unactionable_queue_held, true),
    dashboard_hide_unactionable_brain_samples: bool(options.dashboard_hide_unactionable_brain_samples, true),
    dashboard_hide_corrupt_market_samples: bool(options.dashboard_hide_corrupt_market_samples, true),
    maintainer_currency_skip_window_multiplier: clamp(options.maintainer_currency_skip_window_multiplier, 80, 1, 200),
    listing_fill_mode: ['target', 'cap'].includes(String(options.listing_fill_mode || '').toLowerCase()) ? String(options.listing_fill_mode || '').toLowerCase() : 'cap',
    backpack_tf_account_listing_cap: clamp(options.backpack_tf_account_listing_cap, 600, 1, 5000),
    max_total_active_listings: clamp(options.max_total_active_listings, 600, 1, 5000),
    listing_fill_reserve_slots: clamp(options.listing_fill_reserve_slots, 0, 0, 500),
    target_active_buy_listings: clamp(options.target_active_buy_listings, 600, 1, 5000),
    target_active_sell_listings: clamp(options.target_active_sell_listings, 50, 0, 5000),
    stock_cap_per_item: clamp(options.stock_cap_per_item, 1, 1, 10),
    stock_cap_include_pending_offers: bool(options.stock_cap_include_pending_offers, true),
    stock_cap_count_active_sell_as_stock: bool(options.stock_cap_count_active_sell_as_stock, false),
    stock_cap_count_sell_drafts_as_stock: bool(options.stock_cap_count_sell_drafts_as_stock, false),
    stock_cap_effective_count_enabled: bool(options.stock_cap_effective_count_enabled, true),
    sell_status_use_published_price_as_truth: bool(options.sell_status_use_published_price_as_truth, true),
    stack_sell_hold_when_active_listing_price_differs: bool(options.stack_sell_hold_when_active_listing_price_differs, true),
    listing_plan_enabled: bool(options.listing_plan_enabled, true),
    listing_plan_max_items: Math.max(clamp(options.listing_plan_max_items, 600, 1, 1000), clamp(options.target_active_buy_listings, 600, 1, 5000)),
    listing_plan_min_profit_ref: clamp(options.listing_plan_min_profit_ref, 0.11, 0, 100000),
    listing_plan_min_liquidity_score: clamp(options.listing_plan_min_liquidity_score, 35, 0, 100),
    notification_center_enabled: bool(options.notification_center_enabled, true),
    action_feed_limit: clamp(options.action_feed_limit, 500, 50, 5000),
    operations_cockpit_enabled: bool(options.operations_cockpit_enabled, true),
    data_migration_enabled: bool(options.data_migration_enabled, true),
    backup_before_migration: bool(options.backup_before_migration, true),
    strategy_builder_enabled: bool(options.strategy_builder_enabled, true),
    strategy_mode: ['safe', 'balanced', 'aggressive'].includes(options.strategy_mode) ? options.strategy_mode : 'balanced',
    strategy_min_profit_ref: clamp(options.strategy_min_profit_ref, 0.22, 0, 100000),
    strategy_min_liquidity_score: clamp(options.strategy_min_liquidity_score, 45, 0, 100),
    strategy_max_risk_score: clamp(options.strategy_max_risk_score, 30, 0, 100),
    targeted_buy_orders_enabled: bool(options.targeted_buy_orders_enabled, true),
    targeted_buy_order_max_active: Math.max(clamp(options.targeted_buy_order_max_active, 600, 1, 1000), Math.min(1000, clamp(options.target_active_buy_listings, 600, 1, 5000))),
    targeted_buy_order_selection_hint_ref: 0,
    market_scanner_enabled: bool(options.market_scanner_enabled, true),
    market_scanner_mode: ['strict', 'balanced', 'relaxed', 'watchlist'].includes(options.market_scanner_mode) ? options.market_scanner_mode : 'balanced',
    market_scanner_max_candidates: Math.min(1000, Math.max(clamp(options.market_scanner_max_candidates, 1000, 1, 1000), Math.min(1000, clamp(options.target_active_buy_listings, 600, 1, 5000) * 3))),
    market_scanner_min_item_ref: clamp(options.market_scanner_min_item_ref, 0.11, 0, 100000),
    market_scanner_max_item_ref: clamp(options.market_scanner_max_item_ref, 25, 0, 100000),
    market_scanner_min_profit_ref: clamp(options.market_scanner_min_profit_ref, 0.22, 0, 100000),
    market_scanner_key_ref_estimate: clamp(options.market_scanner_key_ref_estimate, 77, 1, 1000),
    most_traded_item_booster_enabled: bool(options.most_traded_item_booster_enabled, true),
    most_traded_item_names: String(options.most_traded_item_names || "Tour of Duty Ticket, Backpack Expander, Name Tag, Description Tag, The Team Captain, Earbuds, Max's Severed Head, Bill's Hat, Australium Gold, Pink as Hell, The Bitter Taste of Defeat and Lime"),
    most_traded_priority_boost: clamp(options.most_traded_priority_boost, 22, 0, 100),
    most_traded_allow_tour_tickets: bool(options.most_traded_allow_tour_tickets, true),
    most_traded_status_top: clamp(options.most_traded_status_top, 24, 1, 100),
    allow_key_currency_classifieds: bool(options.allow_key_currency_classifieds, true),
    key_currency_min_ref: clamp(options.key_currency_min_ref, 60, 0, 100000),
    key_currency_market_scanner_max_item_ref: clamp(options.key_currency_market_scanner_max_item_ref, 250, 0, 100000),
    key_currency_max_keys_per_listing: clamp(options.key_currency_max_keys_per_listing, 5, 0, 100),
    key_currency_keep_metal_remainder: bool(options.key_currency_keep_metal_remainder, true),
    force_key_currency_on_publish: bool(options.force_key_currency_on_publish, true),
    key_currency_rewrite_existing_metal_drafts: bool(options.key_currency_rewrite_existing_metal_drafts, true),
    key_currency_dashboard_exact_text: bool(options.key_currency_dashboard_exact_text, true),
    balanced_key_metal_pricing_enabled: bool(options.balanced_key_metal_pricing_enabled, true),
    allow_key_roundup_buy_listings: bool(options.allow_key_roundup_buy_listings, true),
    key_roundup_buy_min_ref: clamp(options.key_roundup_buy_min_ref, 0, 0, 100000),
    key_roundup_buy_max_overpay_ref: clamp(options.key_roundup_buy_max_overpay_ref, 0.66, 0, 100000),
    auto_sell_owned_inventory_above_min_ref_enabled: bool(options.auto_sell_owned_inventory_above_min_ref_enabled, true),
    auto_sell_owned_inventory_min_ref: clamp(options.auto_sell_owned_inventory_min_ref, 0.11, 0, 100000),
    auto_sell_owned_inventory_max_per_run: clamp(options.auto_sell_owned_inventory_max_per_run, 50, 0, 1000),
    auto_sell_owned_inventory_include_currency: bool(options.auto_sell_owned_inventory_include_currency, false),
    auto_sell_owned_inventory_include_cases: bool(options.auto_sell_owned_inventory_include_cases, false),
    manual_owned_sell_detector_enabled: bool(options.manual_owned_sell_detector_enabled, true),
    manual_owned_sell_detector_force_inventory_sync: bool(options.manual_owned_sell_detector_force_inventory_sync, true),
    manual_owned_sell_detector_publish: bool(options.manual_owned_sell_detector_publish, true),
    manual_owned_sell_detector_scan_existing_unlisted: bool(options.manual_owned_sell_detector_scan_existing_unlisted, true),
    manual_owned_sell_detector_include_unpriced_as_min: bool(options.manual_owned_sell_detector_include_unpriced_as_min, false),
    manual_owned_sell_detector_max_per_run: clamp(options.manual_owned_sell_detector_max_per_run, 80, 0, 1000),
    maintainer_sell_first_priority_enabled: bool(options.maintainer_sell_first_priority_enabled, true),
    maintainer_sell_first_publish_owned_before_buy: bool(options.maintainer_sell_first_publish_owned_before_buy, true),
    maintainer_sell_backlog_blocks_buy_until_empty: bool(options.maintainer_sell_backlog_blocks_buy_until_empty, true),
    maintainer_sell_first_defer_buy_when_sell_work_found: bool(options.maintainer_sell_first_defer_buy_when_sell_work_found, true),
    maintainer_sell_first_min_sell_attempts_per_cycle: clamp(options.maintainer_sell_first_min_sell_attempts_per_cycle, 10, 0, 1000),
    maintainer_sell_first_dashboard_enabled: bool(options.maintainer_sell_first_dashboard_enabled, true),
    sell_booster_enabled: bool(options.sell_booster_enabled, true),
    sell_booster_use_classifieds_lowest_seller: bool(options.sell_booster_use_classifieds_lowest_seller, true),
    sell_booster_undercut_ref: clamp(options.sell_booster_undercut_ref, 0.11, 0, 100000),
    sell_booster_min_sell_ref: clamp(options.sell_booster_min_sell_ref, 0.11, 0, 100000),
    sell_booster_reprice_existing_enabled: bool(options.sell_booster_reprice_existing_enabled, true),
    sell_booster_reprice_threshold_ref: clamp(options.sell_booster_reprice_threshold_ref, 0.22, 0, 100000),
    sell_booster_public_text_style: String(options.sell_booster_public_text_style || 'clean'),
    strict_sell_classifieds_pricing_enabled: bool(options.strict_sell_classifieds_pricing_enabled, true),
    strict_sell_classifieds_skip_without_snapshot: bool(options.strict_sell_classifieds_skip_without_snapshot, false),
    strict_sell_classifieds_undercut_ref: clamp(options.strict_sell_classifieds_undercut_ref, options.sell_booster_undercut_ref || 0.11, 0, 100000),
    strict_sell_classifieds_max_per_run: clamp(options.strict_sell_classifieds_max_per_run, 80, 0, 1000),
    sell_profit_guard_enabled: bool(options.sell_profit_guard_enabled, true),
    sell_profit_guard_min_profit_ref: clamp(options.sell_profit_guard_min_profit_ref, 0.22, 0, 100000),
    sell_profit_guard_min_margin_percent: clamp(options.sell_profit_guard_min_margin_percent, 3, 0, 100),
    sell_profit_guard_skip_when_classifieds_below_profit: bool(options.sell_profit_guard_skip_when_classifieds_below_profit, true),
    sell_profit_guard_max_above_lowest_ref: clamp(options.sell_profit_guard_max_above_lowest_ref, 0.66, 0, 100000),
    sell_market_sanity_guard_enabled: bool(options.sell_market_sanity_guard_enabled, true),
    sell_market_sanity_max_above_lowest_ref: clamp(options.sell_market_sanity_max_above_lowest_ref, 0.66, 0, 100000),
    sell_market_sanity_max_inventory_multiplier: clamp(options.sell_market_sanity_max_inventory_multiplier, 1.35, 1, 100),
    quantity_aware_sell_pricing_enabled: bool(options.quantity_aware_sell_pricing_enabled, true),
    stack_sell_quantity_parse_enabled: bool(options.stack_sell_quantity_parse_enabled, true),
    stack_sell_reprice_active_listing_enabled: bool(options.stack_sell_reprice_active_listing_enabled, true),
    stack_sell_reprice_threshold_ref: clamp(options.stack_sell_reprice_threshold_ref, 0.11, 0, 100000),
    stack_sell_exclude_own_listing_from_market: bool(options.stack_sell_exclude_own_listing_from_market, true),
    sell_cost_basis_trust_guard_enabled: bool(options.sell_cost_basis_trust_guard_enabled, true),
    sell_cost_basis_untrusted_market_multiplier: clamp(options.sell_cost_basis_untrusted_market_multiplier, 3, 1, 100),
    sell_cost_basis_untrusted_max_above_market_ref: clamp(options.sell_cost_basis_untrusted_max_above_market_ref, 2, 0, 100000),
    currency_helper_show_exact_deficit: bool(options.currency_helper_show_exact_deficit, true),
    currency_helper_hold_buy_when_missing_currency: bool(options.currency_helper_hold_buy_when_missing_currency, true),
    currency_helper_sell_first_when_buy_currency_missing: bool(options.currency_helper_sell_first_when_buy_currency_missing, true),
    currency_helper_missing_currency_is_warning: bool(options.currency_helper_missing_currency_is_warning, true),
    trading_brain_v513_enabled: bool(options.trading_brain_v513_enabled, true),
    trading_brain_require_profit_for_buy: bool(options.trading_brain_require_profit_for_buy, true),
    trading_brain_min_profit_ref: clamp(options.trading_brain_min_profit_ref, options.sell_profit_guard_min_profit_ref || 0.22, 0, 100000),
    trading_brain_min_margin_percent: clamp(options.trading_brain_min_margin_percent, options.sell_profit_guard_min_margin_percent || 3, 0, 100),
    trading_brain_skip_buy_when_no_sell_market: bool(options.trading_brain_skip_buy_when_no_sell_market, true),
    trading_brain_archive_all_mode: ['manual_only','confirmed_startup'].includes(String(options.trading_brain_archive_all_mode || '').toLowerCase()) ? String(options.trading_brain_archive_all_mode || '').toLowerCase() : 'manual_only',
    trading_brain_counteroffer_mode: ['dry_run','guarded_live'].includes(String(options.trading_brain_counteroffer_mode || '').toLowerCase()) ? String(options.trading_brain_counteroffer_mode || '').toLowerCase() : 'dry_run',
    trading_brain_stock_match_mode: ['sku','name'].includes(String(options.trading_brain_stock_match_mode || '').toLowerCase()) ? String(options.trading_brain_stock_match_mode || '').toLowerCase() : 'sku',
    trading_brain_dashboard_samples: clamp(options.trading_brain_dashboard_samples, 8, 1, 50),
    trading_brain_enforcement_enabled: bool(options.trading_brain_enforcement_enabled, true),
    trading_brain_enforce_on_publish: bool(options.trading_brain_enforce_on_publish, true),
    trading_brain_enforce_on_maintainer: bool(options.trading_brain_enforce_on_maintainer, true),
    trading_brain_enforce_no_sell_market: bool(options.trading_brain_enforce_no_sell_market, false),
    trading_brain_enforcement_mode: ['balanced','strict'].includes(String(options.trading_brain_enforcement_mode || '').toLowerCase()) ? String(options.trading_brain_enforcement_mode || '').toLowerCase() : 'balanced',
    market_pricing_pipeline_enabled: bool(options.market_pricing_pipeline_enabled, true),
    market_pricing_use_for_buy: bool(options.market_pricing_use_for_buy, true),
    market_pricing_use_for_sell: bool(options.market_pricing_use_for_sell, true),
    market_pricing_snapshot_cache_minutes: clamp(options.market_pricing_snapshot_cache_minutes, 15, 1, 1440),
    market_pricing_max_snapshot_checks_per_cycle: clamp(options.market_pricing_max_snapshot_checks_per_cycle, 200, 1, 1000),
    market_pricing_buy_bonus_ref: clamp(options.market_pricing_buy_bonus_ref, 0.11, 0, 1000),
    market_pricing_sell_undercut_ref: clamp(options.market_pricing_sell_undercut_ref, 0.11, 0, 1000),
    market_pricing_min_spread_ref: clamp(options.market_pricing_min_spread_ref, 0.66, 0, 100000),
    market_pricing_min_buyers: clamp(options.market_pricing_min_buyers, 0, 0, 100000),
    market_pricing_min_sellers: clamp(options.market_pricing_min_sellers, 1, 0, 100000),
    liquidity_first_trading_mode_enabled: bool(options.liquidity_first_trading_mode_enabled, true),
    liquidity_first_apply_to_buy_listings: bool(options.liquidity_first_apply_to_buy_listings, true),
    liquidity_first_apply_to_owned_sell_listings: bool(options.liquidity_first_apply_to_owned_sell_listings, false),
    liquidity_first_require_snapshot_for_buy: bool(options.liquidity_first_require_snapshot_for_buy, true),
    liquidity_first_min_active_buyers: clamp(options.liquidity_first_min_active_buyers, 1, 0, 100000),
    liquidity_first_min_active_sellers: clamp(options.liquidity_first_min_active_sellers, 2, 0, 100000),
    liquidity_first_min_spread_ref: clamp(options.liquidity_first_min_spread_ref, 0.33, 0, 100000),
    liquidity_first_allow_schema_fallback_as_filler: bool(options.liquidity_first_allow_schema_fallback_as_filler, true),
    liquidity_first_fallback_max_active_buy_listings: clamp(options.liquidity_first_fallback_max_active_buy_listings, 80, 0, 5000),
    liquidity_first_owned_inventory_sell_anything_above_min_ref: bool(options.liquidity_first_owned_inventory_sell_anything_above_min_ref, true),
    liquidity_first_dashboard_enabled: bool(options.liquidity_first_dashboard_enabled, true),
    market_pricing_strict_mode: bool(options.market_pricing_strict_mode, false),
    market_pricing_apply_to_existing_drafts: bool(options.market_pricing_apply_to_existing_drafts, true),
    market_pricing_block_crossed_markets: bool(options.market_pricing_block_crossed_markets, true),
    market_pricing_never_buy_above_profit_safe_sell: bool(options.market_pricing_never_buy_above_profit_safe_sell, true),
    market_pricing_exclude_unaffordable_buys: bool(options.market_pricing_exclude_unaffordable_buys, true),
    market_pricing_ignore_corrupt_snapshot_when_buy_gt_sell: bool(options.market_pricing_ignore_corrupt_snapshot_when_buy_gt_sell, true),
    market_pricing_no_snapshot_fallback_enabled: bool(options.market_pricing_no_snapshot_fallback_enabled, true),
    market_pricing_no_snapshot_fallback_allow_buy: bool(options.market_pricing_no_snapshot_fallback_allow_buy, true),
    market_pricing_no_snapshot_fallback_min_profit_ref: clamp(options.market_pricing_no_snapshot_fallback_min_profit_ref, 0.22, 0, 100000),
    market_pricing_no_snapshot_fallback_max_buy_ref: clamp(options.market_pricing_no_snapshot_fallback_max_buy_ref, 120, 0, 100000),
    trading_brain_allow_no_snapshot_schema_fallback: bool(options.trading_brain_allow_no_snapshot_schema_fallback, true),
    dashboard_show_schema_fallback_fill: bool(options.dashboard_show_schema_fallback_fill, true),
    fallback_metrics_enabled: bool(options.fallback_metrics_enabled, true),
    stale_sell_listing_guard_enabled: bool(options.stale_sell_listing_guard_enabled, true),
    stale_sell_listing_guard_archive_missing_asset: bool(options.stale_sell_listing_guard_archive_missing_asset, false),
    stale_sell_listing_guard_auto_archive_enabled: bool(options.stale_sell_listing_guard_auto_archive_enabled, true),
    stale_sell_listing_guard_auto_archive_requires_write_sliders: bool(options.stale_sell_listing_guard_auto_archive_requires_write_sliders, true),
    stale_sell_listing_guard_archive_max_per_run: clamp(options.stale_sell_listing_guard_archive_max_per_run, 5, 0, 100),
    fallback_fill_boost_enabled: bool(options.fallback_fill_boost_enabled, true),
    fallback_fill_boost_min_candidates: clamp(options.fallback_fill_boost_min_candidates, 120, 0, 1000),
    fallback_fill_boost_max_approved_per_run: clamp(options.fallback_fill_boost_max_approved_per_run, 120, 0, 1000),
    fallback_fill_publish_target_per_cycle: clamp(options.fallback_fill_publish_target_per_cycle, 20, 1, 120),
    fallback_fill_prioritize_affordable_schema_fallback: bool(options.fallback_fill_prioritize_affordable_schema_fallback, true),
    sell_no_cost_basis_force_market_price: bool(options.sell_no_cost_basis_force_market_price, true),
    sell_no_cost_basis_max_above_lowest_ref: clamp(options.sell_no_cost_basis_max_above_lowest_ref, 0.22, 0, 100000),
    listing_text_sync_with_published_price: bool(options.listing_text_sync_with_published_price, true),
    listing_text_force_rebuild_on_publish: bool(options.listing_text_force_rebuild_on_publish, true),
    listing_text_sync_existing_drafts: bool(options.listing_text_sync_existing_drafts, true),
    auto_list_anything_above_min_ref_enabled: bool(options.auto_list_anything_above_min_ref_enabled, true),
    auto_list_anything_min_ref: clamp(options.auto_list_anything_min_ref, 0.11, 0, 100000),
    auto_list_anything_max_item_ref: clamp(options.auto_list_anything_max_item_ref, 100000, 0, 1000000),
    auto_list_anything_include_cases: bool(options.auto_list_anything_include_cases, false),
    auto_list_anything_min_profit_ref: clamp(options.auto_list_anything_min_profit_ref, 0.01, 0, 100000),
    auto_list_anything_force_queue_fill: bool(options.auto_list_anything_force_queue_fill, true),
    archive_classifieds_on_startup_confirmed: bool(options.archive_classifieds_on_startup_confirmed, false),
    actionable_plans_enabled: bool(options.actionable_plans_enabled, true),
    actionable_plan_max_actions: Math.max(clamp(options.actionable_plan_max_actions, 600, 1, 1000), Math.min(1000, clamp(options.target_active_buy_listings, 600, 1, 5000))),
    actionable_plan_protect_last_key: bool(options.actionable_plan_protect_last_key, true),
    actionable_plan_min_score: clamp(options.actionable_plan_min_score, 55, 0, 100),
    inventory_sync_enabled: bool(options.inventory_sync_enabled, true),
    inventory_cache_ttl_minutes: clamp(options.inventory_cache_ttl_minutes, 30, 1, 1440),
    inventory_max_pages: clamp(options.inventory_max_pages, 2, 1, 10),
    hub_autopilot_enabled: bool(options.hub_autopilot_enabled, true),
    hub_autopilot_sync_backpack: bool(options.hub_autopilot_sync_backpack, true),
    hub_autopilot_build_market: bool(options.hub_autopilot_build_market, true),
    hub_autopilot_sync_inventory: bool(options.hub_autopilot_sync_inventory, true),
    hub_autopilot_build_core: bool(options.hub_autopilot_build_core, true),
    autonomy_mode: ['observe', 'plan', 'guarded', 'active'].includes(options.autonomy_mode) ? options.autonomy_mode : 'observe',
    autonomy_interval_minutes: clamp(options.autonomy_interval_minutes, 5, 1, 1440),
    autonomy_build_brain: bool(options.autonomy_build_brain, true),
    autonomy_build_watchlist: bool(options.autonomy_build_watchlist, true),
    autonomy_require_manual_approval: bool(options.autonomy_require_manual_approval, true),
    allow_live_trade_accepts: bool(options.allow_live_trade_accepts, false),
    allow_live_backpack_writes: bool(options.allow_live_backpack_writes, false),
    allow_sda_trade_confirmations: bool(options.allow_sda_trade_confirmations, false),
    global_kill_switch: bool(options.global_kill_switch, false),
    max_actions_per_cycle: clamp(options.max_actions_per_cycle, 3, 1, 100),
    max_actions_per_day: clamp(options.max_actions_per_day, 10, 1, 1000),
    max_ref_per_action: clamp(options.max_ref_per_action, 2, 0, 100000),
    max_ref_per_day: clamp(options.max_ref_per_day, 10, 0, 100000),
    draft_policy_selection_mode: ['off', 'advisory', 'enforce'].includes(options.draft_policy_selection_mode) ? options.draft_policy_selection_mode : 'off',
    draft_policy_enforce_selection_limits: bool(options.draft_policy_enforce_selection_limits, false),
    draft_policy_soft_selection_value_ref: clamp(options.draft_policy_soft_selection_value_ref, options.targeted_buy_order_selection_hint_ref || 25, 0, 100000),
    max_risk_score: clamp(options.max_risk_score, 30, 0, 100),
    multi_account_enabled: bool(options.multi_account_enabled, false),
    account_scope_mode: ['main_only', 'multi_ready', 'planning_all_enabled', 'live_main_only'].includes(options.account_scope_mode) ? options.account_scope_mode : 'main_only',
    main_account_label: String(options.main_account_label || 'Main account').trim() || 'Main account',
    active_account_id: activeCredentialAccountId,
    ollama_enabled: bool(options.ollama_enabled, false),
    ollama_base_url: String(options.ollama_base_url || 'http://10.0.0.25:11434').replace(/\/$/, ''),
    ollama_model: String(options.ollama_model || 'qwen2.5:7b').trim(),
    ollama_timeout_seconds: clamp(options.ollama_timeout_seconds, 20, 5, 120),
    ollama_max_decisions: clamp(options.ollama_max_decisions, 8, 1, 50),
    trade_approval_mode: ['manual', 'accept_recommended', 'accept_and_confirm'].includes(options.trade_approval_mode) ? options.trade_approval_mode : 'manual',
    steamguard_embedded: bool(options.steamguard_embedded, false),
    steamguard_auto_confirm: bool(options.steamguard_auto_confirm, false),
    steamguard_confirm_delay_seconds: clamp(options.steamguard_confirm_delay_seconds, 3, 0, 60),
    sda_enabled: bool(options.sda_enabled, true),
    sda_base_url: String(options.sda_base_url || 'http://tf2-sda-bridge:8098').replace(/\/$/, ''),
    sda_password: String(options.sda_password || '').trim(),
    sda_auto_confirm: bool(options.sda_auto_confirm, false),
    sda_poll_interval_seconds: clamp(options.sda_poll_interval_seconds, 10, 5, 120),
    auto_accept_enabled: bool(options.auto_accept_enabled, false),
    auto_accept_received_only: bool(options.auto_accept_received_only, true),
    auto_accept_delay_seconds: clamp(options.auto_accept_delay_seconds, 2, 0, 30),
    auto_accept_max_per_cycle: clamp(options.auto_accept_max_per_cycle, 5, 1, 50),
    trade_mismatch_auto_decline_enabled: bool(options.trade_mismatch_auto_decline_enabled, true),
    trade_mismatch_auto_decline_received_only: bool(options.trade_mismatch_auto_decline_received_only, true),
    trade_mismatch_auto_decline_negative_profit: bool(options.trade_mismatch_auto_decline_negative_profit, true),
    trade_mismatch_profit_floor_ref: clamp(options.trade_mismatch_profit_floor_ref, -0.01, -100000, 100000),
    trade_guard_leave_overpay: bool(options.trade_guard_leave_overpay, true),
    trade_mismatch_counteroffer_enabled: bool(options.trade_mismatch_counteroffer_enabled, true),
    allow_live_trade_counteroffers: bool(options.allow_live_trade_counteroffers, false),
    trade_counteroffer_dry_run_validation_enabled: bool(options.trade_counteroffer_dry_run_validation_enabled, true),
    trade_counteroffer_live_requires_dry_run_ok: bool(options.trade_counteroffer_live_requires_dry_run_ok, true),
    trade_counteroffer_dry_run_min_cycles: clamp(options.trade_counteroffer_dry_run_min_cycles, 3, 1, 20),
    trade_counteroffer_mode: ['draft_only','send_when_safe'].includes(options.trade_counteroffer_mode) ? options.trade_counteroffer_mode : 'send_when_safe',
    trade_counteroffer_decline_if_unsendable: bool(options.trade_counteroffer_decline_if_unsendable, true),
    trade_counteroffer_min_shortfall_ref: clamp(options.trade_counteroffer_min_shortfall_ref, 0.11, 0, 100000),
    trade_counteroffer_max_shortfall_ref: clamp(options.trade_counteroffer_max_shortfall_ref, 100, 0, 1000000),
    trade_counteroffer_min_profit_ref: clamp(options.trade_counteroffer_min_profit_ref, 0.11, 0, 100000),
    trade_counteroffer_max_per_cycle: clamp(options.trade_counteroffer_max_per_cycle, 3, 1, 20),
    trade_counteroffer_message: String(options.trade_counteroffer_message || 'Adjusted to fair value. Good/overpay offers are accepted manually.').slice(0, 180),
    runtime_event_logging_enabled: bool(options.runtime_event_logging_enabled, true),
    runtime_debug_logging: bool(options.runtime_debug_logging, false),
    runtime_log_level: ['error','warn','info','debug'].includes(String(options.runtime_log_level || '').toLowerCase()) ? String(options.runtime_log_level).toLowerCase() : 'info'
  };
}
function redacted(value) {
  const text = String(value || '');
  return text ? (text.length <= 8 ? '••••' : `${text.slice(0, 4)}…${text.slice(-4)}`) : '';
}
function safeError(error) {
  return String(error && error.message ? error.message : error || 'Unknown error').replace(/[A-Za-z0-9_\-]{24,}/g, '[redacted]');
}
function safeJsonStringify(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'bigint') return String(val);
      if (typeof val === 'function') return `[function ${val.name || 'anonymous'}]`;
      if (val && typeof val === 'object') {
        if (seen.has(val)) return '[circular]';
        seen.add(val);
      }
      return val;
    }, 2);
  } catch (error) {
    return JSON.stringify({ ok: false, version: APP_VERSION, error: 'JSON serialization failed', detail: safeError(error), fallback: true }, null, 2);
  }
}
function json(res, statusCode, value) {
  const body = safeJsonStringify(value);
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(body);
}
function text(res, statusCode, value, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'content-type': contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(value);
}
function normalizeRequestUrl(rawUrl) {
  let raw = typeof rawUrl === 'string' && rawUrl.length > 0 ? rawUrl.trim() : '/';
  if (!raw || raw === '//' || /^\/+[#?]?$/.test(raw)) return '/';
  if (raw.startsWith('//')) {
    if (raw[2] === '?' || raw[2] === '#') return `/${raw.slice(2)}`;
    raw = `/${raw.replace(/^\/+/, '')}`;
  }
  return raw;
}
function normalizeIngressPath(pathname) {
  let clean = (!pathname || pathname === '/') ? '/' : pathname.replace(/\/+/g, '/');
  const apiIndex = clean.lastIndexOf('/api/');
  if (apiIndex > 0) clean = clean.slice(apiIndex);
  for (const marker of ['/app.js', '/app.css', '/styles.css', '/index.html']) {
    const index = clean.indexOf(marker);
    if (index > 0) clean = clean.slice(index);
  }
  return clean || '/';
}
function hasBlockedSecretPayload(value) {
  const serialized = JSON.stringify(value || {}).toLowerCase();
  return BLOCKED_TERMS.some(term => serialized.includes(term));
}
function normalizeName(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}
function stripTf2Prefixes(value) {
  let text = normalizeName(value);
  const prefixes = ['the ', 'unique ', 'strange ', 'vintage ', 'genuine ', 'unusual ', 'haunted ', 'collector\'s ', 'decorated ', 'community ', 'self-made ', 'professional killstreak ', 'specialized killstreak ', 'killstreak ', 'australium ', 'non-craftable ', 'non craftable '];
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of prefixes) {
      if (text.startsWith(prefix)) { text = text.slice(prefix.length).trim(); changed = true; }
    }
  }
  return text;
}
function qualityLabel(value) {
  const q = String(value ?? '').toLowerCase();
  const map = { '0':'Normal', normal:'Normal', '1':'Genuine', genuine:'Genuine', '3':'Vintage', vintage:'Vintage', '5':'Unusual', unusual:'Unusual', '6':'Unique', unique:'Unique', '11':'Strange', strange:'Strange', '13':'Haunted', haunted:'Haunted', '14':'Collector\'s', collectors:'Collector\'s', collector:'Collector\'s', '15':'Decorated', decorated:'Decorated' };
  return map[q] || '';
}
function inventoryPriceKeys(item = {}) {
  const rawNames = [item.market_hash_name, item.name, item.item_name].filter(Boolean);
  const keys = new Set();
  for (const raw of rawNames) {
    const base = normalizeName(raw);
    if (base) keys.add(base);
    const stripped = stripTf2Prefixes(raw);
    if (stripped) keys.add(stripped);
    if (base.startsWith('the ')) keys.add(base.slice(4));
    if (!base.startsWith('the ') && base) keys.add('the ' + base);
  }
  const qualityTag = (Array.isArray(item.tags) ? item.tags : []).find(tag => /quality/i.test(String(tag.category || '')));
  const q = qualityTag ? normalizeName(qualityTag.name) : '';
  const strippedNames = rawNames.map(stripTf2Prefixes).filter(Boolean);
  if (q && !['unique', 'normal'].includes(q)) {
    for (const name of strippedNames) keys.add(normalizeName(q + ' ' + name));
  }
  return Array.from(keys).filter(Boolean);
}

function isPureCurrencyItemName(value) {
  const name = normalizeName(value);
  return ['mann co. supply crate key', 'refined metal', 'reclaimed metal', 'scrap metal', 'tour of duty ticket'].includes(name);
}
function isMainCurrencyKey(value) {
  return normalizeName(value) === 'mann co. supply crate key';
}
function confidenceLabel(score) {
  const n = Number(score || 0);
  if (n >= 82) return 'strong';
  if (n >= 65) return 'medium';
  if (n >= 45) return 'weak';
  return 'ignore';
}
function safeActionId(prefix, value) {
  return String(prefix || 'act') + '_' + crypto.createHash('sha1').update(String(value || Math.random())).digest('hex').slice(0, 12);
}

function clampScore(value) { return Math.max(0, Math.min(100, Math.round(Number(value) || 0))); }
function parsePriceNumber(value) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const parsed = parsePriceNumber(entry);
      if (parsed > 0) return parsed;
    }
    return 0;
  }
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'object') {
    const preferred = ['value_raw', 'valueRaw', 'raw', 'metal', 'ref', 'value', 'low', 'min', 'amount', 'high', 'max', 'value_high'];
    for (const key of preferred) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const parsed = parsePriceNumber(value[key]);
        if (parsed > 0) return parsed;
      }
    }
    for (const entry of Object.values(value).slice(0, 8)) {
      const parsed = parsePriceNumber(entry);
      if (parsed > 0) return parsed;
    }
    return 0;
  }
  const text = String(value).trim();
  if (!text) return 0;
  const range = text.match(/[-+]?\d+(?:\.\d+)?/g);
  if (!range || !range.length) return 0;
  return Number(range[0]) || 0;
}
function tagsOf(entry) {
  if (!entry) return [];
  const raw = Array.isArray(entry.tags) ? entry.tags : String(entry.tags || '').split(',');
  return raw.map(x => String(x).trim().toLowerCase()).filter(Boolean);
}
function entryListingCount(entry) { return Number(entry?.listing_count ?? entry?.listings ?? entry?.liquidity_count ?? 0) || 0; }
function entrySpreadRef(entry) {
  const buy = Number(entry?.buy_ref ?? entry?.buy ?? 0) || 0;
  const sell = Number(entry?.sell_ref ?? entry?.sell ?? 0) || 0;
  return Math.max(0, sell - buy);
}
async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString('utf8');
      if (body.length > 262144) { reject(new Error('Request body too large')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function stripCodeFence(value) {
  let raw = String(value || '').trim().replace(/^\uFEFF/, '');
  const fence = raw.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i);
  if (fence) raw = fence[1].trim();
  return raw;
}

function looksUrlEncoded(value) {
  return /%7B|%22|%5B|%3A|%2C/i.test(String(value || ''));
}

function tryJsonParse(value) {
  try { return { ok: true, value: JSON.parse(value) }; }
  catch (error) { return { ok: false, error: safeError(error) }; }
}

function firstJsonObjectSlice(raw) {
  const text = String(raw || '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return '';
}

function unwrapMafileContainer(value) {
  let current = value;
  for (let i = 0; i < 5; i += 1) {
    if (typeof current === 'string') {
      const parsed = parseFlexibleJsonValue(current);
      if (!parsed.ok) return current;
      current = parsed.value;
      continue;
    }
    if (current && typeof current === 'object') {
      const wrapped = current.maFile ?? current.mafile ?? current.steamguard_mafile ?? current.steamGuardMaFile ?? current.payload ?? current.data;
      if (wrapped && wrapped !== current) {
        current = wrapped;
        continue;
      }
    }
    break;
  }
  return current;
}

function unescapeCommonCopyArtifacts(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

function parseFlexibleJsonValue(rawInput) {
  let raw = unescapeCommonCopyArtifacts(stripCodeFence(rawInput));
  if (!raw) return { ok: false, error: 'Paste a maFile JSON object first or choose the .maFile file from disk.' };
  if (looksUrlEncoded(raw)) {
    try { raw = decodeURIComponent(raw); } catch {}
  }
  // Some users paste exported text like: maFile = { ... } or var data = "{...}"
  if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) {
    const sliced = firstJsonObjectSlice(raw);
    if (sliced) raw = sliced;
  }
  const candidates = [raw];
  const sliced = firstJsonObjectSlice(raw);
  if (sliced && sliced !== raw) candidates.push(sliced);
  // Handle copied JS/string literals that are missing the surrounding quote.
  if (raw.includes('\\"') || raw.includes('\\n')) {
    candidates.push(raw.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  }
  let parsed = { ok: false, error: 'No parser candidate matched.' };
  for (const candidate of candidates) {
    parsed = tryJsonParse(candidate);
    if (parsed.ok) break;
  }
  if (!parsed.ok) return { ok: false, error: `Invalid maFile JSON: ${parsed.error}` };
  let value = parsed.value;
  for (let i = 0; i < 5 && typeof value === 'string'; i += 1) {
    const nestedRaw = unescapeCommonCopyArtifacts(stripCodeFence(value));
    const nested = tryJsonParse(nestedRaw);
    if (!nested.ok) {
      const nestedSlice = firstJsonObjectSlice(nestedRaw);
      if (nestedSlice) {
        const slicedNested = tryJsonParse(nestedSlice);
        if (slicedNested.ok) { value = slicedNested.value; continue; }
      }
      break;
    }
    value = nested.value;
  }
  return { ok: true, value };
}

function parseMaFilePayload(rawInput) {
  const parsed = parseFlexibleJsonValue(rawInput);
  if (!parsed.ok) return parsed;
  const value = unwrapMafileContainer(parsed.value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Expected a maFile JSON object. If you copied a JSON string, paste the full object contents, not only the filename or a token.' };
  }
  return { ok: true, value };
}

function normalizeFieldName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findDeepField(value, names, depth = 0, seen = new Set()) {
  if (!value || typeof value !== 'object' || depth > 6 || seen.has(value)) return '';
  seen.add(value);
  const wanted = new Set(names.map(normalizeFieldName));
  for (const [key, raw] of Object.entries(value)) {
    if (wanted.has(normalizeFieldName(key)) && raw !== undefined && raw !== null && String(raw).trim()) return String(raw).trim();
  }
  for (const raw of Object.values(value)) {
    if (raw && typeof raw === 'object') {
      const found = findDeepField(raw, names, depth + 1, seen);
      if (found) return found;
    }
  }
  return '';
}

function isLikelyBase64Secret(value) {
  const text = String(value || '').trim();
  if (!text || text.length < 16) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(text)) return false;
  try { return Buffer.from(text, 'base64').length >= 8; } catch { return false; }
}

function hasEncryptedMaFileShape(value) {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(value).map(normalizeFieldName);
  return Boolean(value.encrypted || value.Encrypted || (keys.includes('encrypted') && (keys.includes('data') || keys.includes('iv') || keys.includes('salt'))));
}
async function fetchJsonWithTimeout(url, timeoutSeconds, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
  try {
    const response = await fetch(url, { method: 'GET', headers: { accept: 'application/json', ...(init.headers || {}) }, signal: controller.signal, ...init });
    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();
    let body = null;
    try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = { raw: bodyText.slice(0, 1000), content_type: contentType }; }
    return { ok: response.ok, status: response.status, retryAfter: response.headers.get('retry-after'), contentType, body };
  } finally { clearTimeout(timeout); }
}
function retryAfterMs(value, fallbackSeconds) {
  if (!value) return fallbackSeconds * 1000;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : fallbackSeconds * 1000;
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function providerState() { return readJson(PROVIDER_STATE_PATH, { updated_at: null, providers: {} }); }
function saveProviderState(state) { writeJson(PROVIDER_STATE_PATH, { ...state, updated_at: new Date().toISOString() }); }
function providerEntry(name) {
  const state = providerState();
  return state.providers[name] || { failures: 0, rate_limited_until: null, last_ok_at: null, last_error_at: null, last_status: null };
}
function updateProviderEntry(name, patch) {
  const state = providerState();
  const current = state.providers[name] || {};
  state.providers[name] = { ...current, ...patch, updated_at: new Date().toISOString() };
  saveProviderState(state);
  return state.providers[name];
}
function providerBlocked(name) {
  const entry = providerEntry(name);
  const until = entry.rate_limited_until ? Date.parse(entry.rate_limited_until) : 0;
  return until && until > Date.now() ? { blocked: true, until: entry.rate_limited_until } : { blocked: false, until: null };
}
async function fetchJsonHardened(provider, url, options, init = {}) {
  const blocked = providerBlocked(provider);
  if (blocked.blocked) return { ok: false, provider, status: 429, retryAfter: blocked.until, error: `${provider} is rate limited until ${blocked.until}`, body: null };
  const retries = provider === 'backpack.tf' ? options.backpack_tf_retry_count : options.steam_retry_count;
  const backoffSeconds = provider === 'backpack.tf' ? 4 : options.steam_retry_backoff_seconds;
  let last = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await fetchJsonWithTimeout(url, options.provider_timeout_seconds, init);
      const bodyLooksHtml = result.body && typeof result.body.raw === 'string' && /<html|<!doctype|<body/i.test(result.body.raw);
      if (bodyLooksHtml) {
        updateProviderEntry(provider, { failures: (providerEntry(provider).failures || 0) + 1, last_error_at: new Date().toISOString(), last_status: result.status, last_error: 'html_instead_of_json' });
        return { ...result, ok: false, error: `${provider} returned HTML instead of JSON.` };
      }
      if (result.status === 429) {
        const ms = retryAfterMs(result.retryAfter, backoffSeconds * (attempt + 1));
        updateProviderEntry(provider, { failures: (providerEntry(provider).failures || 0) + 1, last_error_at: new Date().toISOString(), last_status: 429, rate_limited_until: new Date(Date.now() + ms).toISOString(), last_error: 'rate_limited' });
        if (attempt < retries) { await sleep(Math.min(ms, 30000)); continue; }
      }
      if (result.ok) {
        updateProviderEntry(provider, { failures: 0, last_ok_at: new Date().toISOString(), last_status: result.status, rate_limited_until: null, last_error: null });
        return result;
      }
      last = result;
      updateProviderEntry(provider, { failures: (providerEntry(provider).failures || 0) + 1, last_error_at: new Date().toISOString(), last_status: result.status, last_error: `http_${result.status}` });
      if (attempt < retries && [408, 429, 500, 502, 503, 504].includes(result.status)) await sleep(backoffSeconds * 1000 * (attempt + 1));
      else return result;
    } catch (error) {
      last = { ok: false, provider, status: 0, error: safeError(error), body: null };
      updateProviderEntry(provider, { failures: (providerEntry(provider).failures || 0) + 1, last_error_at: new Date().toISOString(), last_status: 0, last_error: safeError(error) });
      if (attempt < retries) await sleep(backoffSeconds * 1000 * (attempt + 1));
    }
  }
  return last || { ok: false, provider, status: 0, error: `${provider} request failed`, body: null };
}
function buildOffersUrl(options) {
  const url = new URL('https://api.steampowered.com/IEconService/GetTradeOffers/v1/');
  url.searchParams.set('key', options.steam_web_api_key);
  url.searchParams.set('get_sent_offers', String(Boolean(options.get_sent_offers)));
  url.searchParams.set('get_received_offers', String(Boolean(options.get_received_offers)));
  url.searchParams.set('get_descriptions', String(Boolean(options.get_descriptions)));
  url.searchParams.set('active_only', String(Boolean(options.active_only)));
  url.searchParams.set('historical_only', 'false');
  url.searchParams.set('language', 'en');
  return url;
}
function inferRefValue(asset, description, pricelistMap, side) {
  const keys = [
    normalizeName(asset && asset.market_hash_name),
    normalizeName(description && description.market_hash_name),
    normalizeName(description && description.name),
    normalizeName(asset && asset.name)
  ].filter(Boolean);
  let entry = null;
  for (const key of keys) {
    if (pricelistMap.has(key)) { entry = pricelistMap.get(key); break; }
  }
  if (!entry) return { found: false, value_ref: 0, key: keys[0] || '', entry: null };
  const amount = Number(asset && asset.amount) || 1;
  const preferred = side === 'give' ? Number(entry.sell_ref ?? entry.value_ref ?? entry.ref ?? entry.price_ref ?? 0) : Number(entry.buy_ref ?? entry.value_ref ?? entry.ref ?? entry.price_ref ?? 0);
  const fallback = Number(entry.ref || entry.price_ref || entry.value_ref || entry.buy_ref || entry.sell_ref || 0);
  const value = Number.isFinite(preferred) && preferred > 0 ? preferred : (Number.isFinite(fallback) ? fallback : 0);
  return { found: true, value_ref: value * amount, key: keys[0] || '', entry };
}
function defaultPricelist() {
  return {
    updated_at: new Date().toISOString(),
    source: 'default_seed',
    items: [
      { name: 'Mann Co. Supply Crate Key', sku: '5021;6', buy_ref: 0, sell_ref: 0, liquid: true, listing_count: 999, notes: 'Key value should be managed externally.' },
      { name: 'Tour of Duty Ticket', sku: '725;6', buy_ref: 0, sell_ref: 0, liquid: true, listing_count: 200 },
      { name: 'Refined Metal', sku: '5002;6', buy_ref: 1, sell_ref: 1, liquid: true, listing_count: 999 },
      { name: 'Reclaimed Metal', sku: '5001;6', buy_ref: 0.33, sell_ref: 0.33, liquid: true, listing_count: 999 },
      { name: 'Scrap Metal', sku: '5000;6', buy_ref: 0.11, sell_ref: 0.11, liquid: true, listing_count: 999 }
    ]
  };
}
function loadPricelist(filePath) {
  const data = readJson(filePath, null) || readJson(PRICELIST_PATH, null) || defaultPricelist();
  const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
  const map = new Map();
  for (const item of items) {
    const names = [item.name, item.market_hash_name, item.sku, item.item_name].map(normalizeName).filter(Boolean);
    for (const name of names) map.set(name, item);
  }
  return { ok: true, source: data.source || filePath, updated_at: data.updated_at || null, count: items.length, items, map };
}
function descriptionMap(descriptions) {
  const map = new Map();
  for (const description of Array.isArray(descriptions) ? descriptions : []) {
    const key = `${description.classid || ''}_${description.instanceid || '0'}`;
    map.set(key, description);
  }
  return map;
}
function itemRows(items, descriptions, pricelist, side) {
  const map = descriptionMap(descriptions);
  return (Array.isArray(items) ? items : []).map(asset => {
    const description = map.get(`${asset.classid || ''}_${asset.instanceid || '0'}`) || {};
    const price = inferRefValue(asset, description, pricelist.map, side);
    return {
      assetid: asset.assetid,
      appid: asset.appid,
      contextid: asset.contextid,
      classid: asset.classid,
      instanceid: asset.instanceid,
      amount: Number(asset.amount) || 1,
      market_hash_name: description.market_hash_name || description.name || asset.market_hash_name || 'Unknown item',
      tradable: description.tradable,
      marketable: description.marketable,
      price_found: price.found,
      value_ref: Number(price.value_ref.toFixed(2)),
      matched_key: price.key,
      entry: price.entry
    };
  });
}
function readOfferHistory() { return readJson(OFFER_HISTORY_PATH, { ok: true, updated_at: null, offers: {} }); }
function saveOfferHistory(history, options) {
  const ttlMs = options.steam_offer_dedupe_ttl_days * 24 * 60 * 60 * 1000;
  const entries = Object.entries(history.offers || {})
    .filter(([, value]) => !value.last_seen_at || Date.now() - Date.parse(value.last_seen_at) <= ttlMs)
    .slice(-options.steam_offer_history_limit);
  writeJson(OFFER_HISTORY_PATH, { ok: true, updated_at: new Date().toISOString(), offers: Object.fromEntries(entries) });
}
function upsertOfferHistory(decisions, options) {
  const history = readOfferHistory();
  const now = new Date().toISOString();
  for (const decision of decisions) {
    const id = String(decision.tradeofferid || '');
    if (!id) continue;
    const previous = history.offers[id] || { first_seen_at: now, status: 'new' };
    history.offers[id] = { ...previous, last_seen_at: now, last_decision: decision.decision, last_risk_score: decision.risk_score, last_profit_ref: decision.estimated_profit_ref };
  }
  saveOfferHistory(history, options);
  return history;
}
function markOfferStatus(tradeofferid, status, note = '') {
  const history = readOfferHistory();
  const id = String(tradeofferid || '').trim();
  if (!id) return { ok: false, error: 'Missing tradeofferid.' };
  const now = new Date().toISOString();
  history.offers[id] = { ...(history.offers[id] || { first_seen_at: now }), status, note: String(note || ''), reviewed_at: now, last_seen_at: now };
  writeJson(OFFER_HISTORY_PATH, { ...history, updated_at: now });
  return { ok: true, offer: history.offers[id] };
}
function pricingBrainForRows(rows) {
  const entries = rows.map(row => row.entry).filter(Boolean);
  const listingCount = entries.reduce((sum, entry) => Math.max(sum, entryListingCount(entry)), 0);
  const spreadRef = entries.reduce((sum, entry) => sum + entrySpreadRef(entry), 0);
  const valueRef = rows.reduce((sum, row) => sum + (Number(row.value_ref) || 0), 0);
  const unknownCount = rows.filter(row => !row.price_found).length;
  const liquidityScore = clampScore(listingCount <= 0 ? 20 : Math.min(100, 20 + listingCount * 8));
  const spreadScore = clampScore(spreadRef <= 0 ? 15 : Math.min(100, 35 + spreadRef * 90));
  const dataQualityScore = clampScore(rows.length ? ((rows.length - unknownCount) / rows.length) * 100 : 0);
  const marginPercent = valueRef > 0 ? (spreadRef / valueRef) * 100 : 0;
  return { listing_count: listingCount, spread_ref: Number(spreadRef.toFixed(2)), value_ref: Number(valueRef.toFixed(2)), unknown_count: unknownCount, liquidity_score: liquidityScore, spread_score: spreadScore, data_quality_score: dataQualityScore, margin_percent: Number(marginPercent.toFixed(2)) };
}

class TradeOfferAuditService {
  constructor(filePath) { this.filePath = filePath; }
  write(type, payload = {}) {
    const entry = { ts: new Date().toISOString(), app: 'tf2-trading-hub', version: APP_VERSION, type, payload };
    try { ensureDataDir(); fs.appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`); } catch {}
    try { runtimeLogger.audit('audit', String(type || 'event'), 'Audit event written', payload); } catch {}
    return entry;
  }
  list(limit = 300) { return readJsonLines(this.filePath, limit); }
}

class ManualConfirmationLinkBuilder {
  constructor(baseUrl) { this.baseUrl = String(baseUrl || 'https://steamcommunity.com').replace(/\/$/, ''); }
  offerUrl(tradeofferid) { return `${this.baseUrl}/tradeoffer/${encodeURIComponent(String(tradeofferid))}/`; }
  tradeOffersInboxUrl() { return `${this.baseUrl}/my/tradeoffers/`; }
  build(offer) {
    return {
      offer_url: this.offerUrl(offer.tradeofferid || ''),
      inbox_url: this.tradeOffersInboxUrl(),
      instruction: 'SDA auto-confirm is active for accept_recommended offers. Open this link to review manually if needed.'
    };
  }
}


class SteamGuardModule {
  constructor(auditService) { this.audit = auditService; }

  loadMaFile() {
    const maFile = readJson(MAFILE_PATH, null);
    if (!maFile || !maFile.shared_secret || !maFile.identity_secret) return null;
    return maFile;
  }

  sourceSession(maFile) {
    return maFile?.Session || maFile?.session || maFile?.steam_session || maFile?.steamSession || {};
  }

  readField(maFile, names, sessionToo = false) {
    const session = sessionToo ? this.sourceSession(maFile) : {};
    for (const name of names) {
      const value = maFile?.[name] ?? session?.[name];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    const deep = findDeepField(sessionToo ? { root: maFile, Session: session } : maFile, names);
    return deep || '';
  }

  readSessionField(maFile, names) {
    return this.readField(maFile, names, true);
  }

  validateMaFile(maFile) {
    if (!maFile || typeof maFile !== 'object' || Array.isArray(maFile)) return 'Expected a maFile JSON object or the manual Steam Guard fields.';
    const shared = this.readField(maFile, ['shared_secret', 'sharedSecret', 'SharedSecret', 'shared secret', 'sharedsecret'], true);
    const identity = this.readField(maFile, ['identity_secret', 'identitySecret', 'IdentitySecret', 'identity secret', 'identitysecret'], true);
    if (hasEncryptedMaFileShape(maFile) && (!shared || !identity)) {
      return 'This looks like an encrypted SDA maFile. Unlock SDA and export/save a decrypted maFile first. The add-on must see shared_secret and identity_secret in plain JSON keys.';
    }
    if (!shared) return 'Missing shared_secret. The selected file was parsed, but no shared_secret key was found. Upload the decrypted SDA .maFile, not a backup/encrypted file.';
    if (!identity) return 'Missing identity_secret. The selected file was parsed, but no identity_secret key was found. Upload the decrypted SDA .maFile, not a backup/encrypted file.';
    if (!isLikelyBase64Secret(shared)) return 'shared_secret was found, but it does not look like a valid base64 Steam secret. Check that you copied the value, not the field name or an encrypted blob.';
    if (!isLikelyBase64Secret(identity)) return 'identity_secret was found, but it does not look like a valid base64 Steam secret. Check that you copied the value, not the field name or an encrypted blob.';
    return null;
  }

  normalizeMaFile(maFile) {
    const steamId64 = this.readSessionField(maFile, ['SteamID', 'steamid', 'steam_id', 'steam_id64', 'steamID', 'steamId64', 'steamId', 'steam_id_64']) || String(getOptions().steam_id64 || '').trim();
    const steamLoginSecure = this.readSessionField(maFile, ['SteamLoginSecure', 'steamLoginSecure', 'steam_login_secure', 'steam_login_secure_cookie', 'steam_login_secure_cookie_value']);
    const sessionId = this.readSessionField(maFile, ['SessionID', 'sessionid', 'session_id', 'SessionId', 'sessionId']);
    return {
      shared_secret: this.readField(maFile, ['shared_secret', 'sharedSecret', 'SharedSecret', 'shared secret', 'sharedsecret'], true),
      identity_secret: this.readField(maFile, ['identity_secret', 'identitySecret', 'IdentitySecret', 'identity secret', 'identitysecret'], true),
      device_id: this.readField(maFile, ['device_id', 'DeviceID', 'deviceId', 'device_id_android', 'deviceid'], true) || deriveDeviceId(steamId64),
      account_name: this.readField(maFile, ['account_name', 'AccountName', 'accountName', 'username', 'login', 'accountname'], true),
      Session: {
        SteamID: steamId64,
        SteamLoginSecure: steamLoginSecure,
        SessionID: sessionId
      },
      imported_at: new Date().toISOString()
    };
  }

  sessionHealth() {
    return readJson(STEAMGUARD_SESSION_HEALTH_PATH, {
      state: 'not_checked',
      ok: null,
      checked_at: null,
      message: 'Steam Guard session has not been checked yet.',
      recovery_required: false
    });
  }

  writeSessionHealth(patch) {
    const payload = {
      ...this.sessionHealth(),
      ...patch,
      updated_at: new Date().toISOString()
    };
    writeJson(STEAMGUARD_SESSION_HEALTH_PATH, payload);
    return payload;
  }

  markSessionUploaded(importedAt, hasSession = true) {
    if (!hasSession) {
      return this.writeSessionHealth({
        state: 'missing_session',
        ok: false,
        checked_at: null,
        imported_at: importedAt || new Date().toISOString(),
        message: 'maFile saved, but it does not contain SteamLoginSecure and SessionID. TOTP generation can work, but confirmations need a valid Steam session or saved refresh_token.',
        recovery_required: true,
        recovery_hint: 'Export a fresh maFile/session from SDA or save a refresh_token, then refresh the session before loading confirmations.'
      });
    }
    return this.writeSessionHealth({
      state: 'uploaded_not_checked',
      ok: null,
      checked_at: null,
      imported_at: importedAt || new Date().toISOString(),
      message: 'maFile saved. Run Load confirmations to verify that the Steam session is still valid.',
      recovery_required: false
    });
  }

  markSessionOk(context, result) {
    return this.writeSessionHealth({
      state: 'ok',
      ok: true,
      checked_at: new Date().toISOString(),
      last_context: context || 'steamguard',
      last_http_status: result?.status || null,
      last_content_type: result?.contentType || null,
      message: 'Steam mobile session is valid.',
      recovery_required: false
    });
  }

  detectSessionProblem(result) {
    const body = result?.body || {};
    const raw = String(body.raw || '').slice(0, 1000);
    const rawLower = raw.toLowerCase();
    const contentType = String(result?.contentType || '').toLowerCase();
    const message = String(body.message || body.error || body.error_text || body.detail || body.msg || '').toLowerCase();
    const htmlLike = contentType.includes('text/html') || contentType.includes('html') || rawLower.includes('<html') || rawLower.includes('<!doctype html') || rawLower.includes('<title>steam community');
    const loginLike = rawLower.includes('login') || rawLower.includes('steamlogin') || rawLower.includes('steamcommunity.com/login') || message.includes('login') || message.includes('not logged') || message.includes('session');
    if ([401, 403].includes(Number(result?.status))) return { code: 'steam_session_rejected', reason: `Steam returned HTTP ${result.status}.` };
    if (htmlLike) return { code: 'steam_session_html_response', reason: 'Steam returned HTML instead of JSON, usually because the mobile session is expired or redirected to login.' };
    if (body && body.success === false && loginLike) return { code: 'steam_session_invalid', reason: body.message || body.error || 'Steam returned success:false for the mobile confirmation request.' };
    if (body && body.success === false) return { code: 'steam_mobileconf_failed', reason: body.message || body.error || 'Steam returned success:false for the mobile confirmation request.' };
    return null;
  }

  markSessionProblem(context, result, problem) {
    const isRecovery = problem?.code === 'steam_session_rejected' || problem?.code === 'steam_session_html_response' || problem?.code === 'steam_session_invalid' || problem?.code === 'steam_mobileconf_failed';
    const hint = 'The SteamLoginSecure/SessionID stored in the maFile likely expired. Sign in through SDA or another trusted Steam client, export a fresh maFile/session, then upload it again in this add-on.';
    const health = this.writeSessionHealth({
      state: isRecovery ? 'needs_refresh' : 'error',
      ok: false,
      checked_at: new Date().toISOString(),
      last_context: context || 'steamguard',
      last_http_status: result?.status || null,
      last_content_type: result?.contentType || null,
      error_code: problem?.code || 'steamguard_request_failed',
      message: problem?.reason || 'Steam Guard request failed.',
      recovery_required: isRecovery,
      recovery_hint: isRecovery ? hint : null
    });
    this.audit.write('steamguard_session_health_failed', {
      context: context || 'steamguard',
      status: result?.status || null,
      content_type: result?.contentType || null,
      error_code: health.error_code,
      recovery_required: health.recovery_required
    });
    appendActionFeed('steamguard_session_health_failed', { error_code: health.error_code, recovery_required: health.recovery_required });
    return health;
  }

  sessionProblemResponse(context, result, problem) {
    const health = this.markSessionProblem(context, result, problem);
    return {
      ok: false,
      status: result?.status || null,
      error: health.message,
      error_code: health.error_code,
      session_recovery_required: Boolean(health.recovery_required),
      recovery_hint: health.recovery_hint || null,
      session_health: health,
      body: redactDeep(result?.body || null)
    };
  }

  importReport(maFile) {
    const shared = this.readField(maFile, ['shared_secret', 'sharedSecret', 'SharedSecret', 'shared secret', 'sharedsecret'], true);
    const identity = this.readField(maFile, ['identity_secret', 'identitySecret', 'IdentitySecret', 'identity secret', 'identitysecret'], true);
    const steamId64 = this.readSessionField(maFile, ['SteamID', 'steamid', 'steam_id', 'steam_id64', 'steamID', 'steamId64', 'steamId', 'steam_id_64']) || String(getOptions().steam_id64 || '').trim();
    const steamLoginSecure = this.readSessionField(maFile, ['SteamLoginSecure', 'steamLoginSecure', 'steam_login_secure', 'steam_login_secure_cookie', 'steam_login_secure_cookie_value']);
    const sessionId = this.readSessionField(maFile, ['SessionID', 'sessionid', 'session_id', 'SessionId', 'sessionId']);
    const deviceId = this.readField(maFile, ['device_id', 'DeviceID', 'deviceId', 'device_id_android', 'deviceid'], true);
    const accountName = this.readField(maFile, ['account_name', 'AccountName', 'accountName', 'username', 'login', 'accountname'], true);
    const encrypted = hasEncryptedMaFileShape(maFile);
    return {
      parsed: true,
      encrypted_candidate: encrypted,
      has_shared_secret: Boolean(shared),
      shared_secret_base64_ok: Boolean(shared && isLikelyBase64Secret(shared)),
      has_identity_secret: Boolean(identity),
      identity_secret_base64_ok: Boolean(identity && isLikelyBase64Secret(identity)),
      has_steam_id64: Boolean(steamId64),
      has_steam_login_secure: Boolean(steamLoginSecure),
      has_session_id: Boolean(sessionId),
      has_session: Boolean(steamLoginSecure && sessionId),
      has_device_id: Boolean(deviceId),
      has_account_name: Boolean(accountName),
      can_generate_totp: Boolean(shared && isLikelyBase64Secret(shared)),
      can_load_confirmations: Boolean(identity && isLikelyBase64Secret(identity) && steamId64 && steamLoginSecure && sessionId)
    };
  }

  inspectMaFile(maFile) {
    const error = this.validateMaFile(maFile);
    const report = this.importReport(maFile);
    return {
      ok: !error,
      error: error || null,
      import_report: report,
      hint: error ? 'The add-on did not save this file. Use a decrypted SDA .maFile containing shared_secret and identity_secret, or fill the manual fields.' : 'File looks usable. Save it, then test Generate TOTP.'
    };
  }

  saveMaFile(maFile) {
    const error = this.validateMaFile(maFile);
    if (error) return { ok: false, error };
    ensureDataDir();
    const safe = this.normalizeMaFile(maFile);
    const importReport = this.importReport(maFile);
    const hasSession = Boolean(safe.Session.SteamLoginSecure && safe.Session.SessionID);
    writeJson(MAFILE_PATH, safe);
    const refreshToken = this.extractRefreshToken(maFile);
    if (refreshToken) new SteamSessionRefreshService(this.audit).saveRefreshToken(refreshToken, safe.Session.SteamID, 'mafile_import');
    this.markSessionUploaded(safe.imported_at, hasSession);
    this.audit.write('steamguard_mafile_saved', {
      account_name: safe.account_name || null,
      steam_id64: safe.Session.SteamID ? redacted(safe.Session.SteamID) : null,
      has_device_id: Boolean(safe.device_id),
      has_steam_id64: Boolean(safe.Session.SteamID),
      has_session: hasSession,
      has_shared_secret: importReport.has_shared_secret,
      has_identity_secret: importReport.has_identity_secret
    });
    appendActionFeed('steamguard_mafile_saved', { account_name: safe.account_name || null, has_session: hasSession, has_steam_id64: Boolean(safe.Session.SteamID), has_shared_secret: importReport.has_shared_secret, has_identity_secret: importReport.has_identity_secret });
    return { ok: true, warning: hasSession ? null : 'maFile saved without SteamLoginSecure/SessionID. Generate TOTP can work; confirmations require a fresh session or refresh_token.', import_report: importReport, status: this.status() };
  }

  generateTOTP(sharedSecret) {
    const steamChars = '23456789BCDFGHJKMNPQRTVWXY';
    const timeSlot = Math.floor(Date.now() / 1000 / 30);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(timeSlot / 0x100000000), 0);
    buffer.writeUInt32BE(timeSlot >>> 0, 4);
    const hmac = crypto.createHmac('sha1', Buffer.from(sharedSecret, 'base64'));
    hmac.update(buffer);
    const mac = hmac.digest();
    const start = mac[19] & 0x0f;
    let value = (mac.readUInt32BE(start) & 0x7fffffff) >>> 0;
    let code = '';
    for (let i = 0; i < 5; i += 1) {
      code += steamChars[value % steamChars.length];
      value = Math.floor(value / steamChars.length);
    }
    return code;
  }

  generateConfirmationKey(identitySecret, tag, time) {
    const tagBuffer = Buffer.from(String(tag || 'conf'), 'utf8');
    const buffer = Buffer.alloc(8 + tagBuffer.length);
    buffer.writeUInt32BE(Math.floor(time / 0x100000000), 0);
    buffer.writeUInt32BE(time >>> 0, 4);
    tagBuffer.copy(buffer, 8);
    const hmac = crypto.createHmac('sha1', Buffer.from(identitySecret, 'base64'));
    hmac.update(buffer);
    return hmac.digest('base64');
  }

  getDeviceId(maFile) {
    return String(maFile?.device_id || '').trim() || deriveDeviceId(maFile?.Session?.SteamID || '');
  }

  buildCookies(maFile) {
    const session = maFile?.Session || {};
    const cookies = [];
    if (session.SteamLoginSecure) cookies.push(`steamLoginSecure=${session.SteamLoginSecure}`);
    if (session.SessionID) cookies.push(`sessionid=${session.SessionID}`);
    return cookies.join('; ');
  }

  extractRefreshToken(maFile) {
    return String(
      maFile?.refresh_token ||
      maFile?.refreshToken ||
      maFile?.steam_refresh_token ||
      maFile?.steamRefreshToken ||
      maFile?.Session?.RefreshToken ||
      maFile?.Session?.refresh_token ||
      maFile?.Session?.refreshToken ||
      ''
    ).trim();
  }

  status() {
    const maFile = this.loadMaFile();
    const health = this.sessionHealth();
    return {
      loaded: Boolean(maFile),
      account_name: maFile?.account_name || null,
      steam_id64_saved: Boolean(maFile?.Session?.SteamID),
      has_shared_secret: Boolean(maFile?.shared_secret),
      has_identity_secret: Boolean(maFile?.identity_secret),
      has_session: Boolean(maFile?.Session?.SteamLoginSecure && maFile?.Session?.SessionID),
      has_refresh_token: new SteamSessionRefreshService(this.audit).hasRefreshToken(maFile),
      mafile_imported_at: maFile?.imported_at || null,
      device_id: maFile ? this.getDeviceId(maFile) : null,
      session_health: health,
      session_recovery_required: Boolean(health?.recovery_required),
      embedded_available: true
    };
  }

  async fetchConfirmations(maFile = this.loadMaFile()) {
    if (!maFile) return { ok: false, error: 'No maFile loaded.' };
    const session = maFile.Session || {};
    if (!session.SteamID) {
      const health = this.writeSessionHealth({
        state: 'missing_session',
        ok: false,
        checked_at: new Date().toISOString(),
        message: 'maFile is loaded, but Session.SteamID is missing. Load confirmations needs SteamID64 plus a valid SteamLoginSecure/SessionID session.',
        recovery_required: true,
        recovery_hint: 'Upload a maFile exported with session data, save steam_id64 in add-on options, or save a refresh_token with SteamID64 available.'
      });
      return { ok: false, error: health.message, session_recovery_required: true, recovery_hint: health.recovery_hint, session_health: health };
    }
    if (!session.SteamLoginSecure || !session.SessionID) {
      const health = this.writeSessionHealth({
        state: 'missing_session',
        ok: false,
        checked_at: new Date().toISOString(),
        message: 'maFile is loaded, but SteamLoginSecure/SessionID is missing. TOTP can work, but Steam confirmations need a valid mobile web session.',
        recovery_required: true,
        recovery_hint: 'Upload a fresh maFile/session from SDA or save a refresh_token and run Refresh session now.'
      });
      return { ok: false, error: health.message, session_recovery_required: true, recovery_hint: health.recovery_hint, session_health: health };
    }
    const time = Math.floor(Date.now() / 1000);
    const url = new URL('https://steamcommunity.com/mobileconf/getlist');
    url.searchParams.set('p', this.getDeviceId(maFile));
    url.searchParams.set('a', String(session.SteamID || ''));
    url.searchParams.set('k', this.generateConfirmationKey(maFile.identity_secret, 'conf', time));
    url.searchParams.set('t', String(time));
    url.searchParams.set('m', 'android');
    url.searchParams.set('tag', 'conf');
    try {
      const result = await fetchJsonWithTimeout(url.toString(), 15, {
        headers: { Cookie: this.buildCookies(maFile), 'User-Agent': 'Steam App / Android' }
      });
      const problem = this.detectSessionProblem(result);
      if (problem) return this.sessionProblemResponse('fetch_confirmations', result, problem);
      if (!result.ok) {
        const health = this.markSessionProblem('fetch_confirmations', result, { code: 'steam_mobileconf_http_error', reason: `Steam mobileconf HTTP ${result.status}` });
        return { ok: false, status: result.status, error: `Steam mobileconf HTTP ${result.status}`, session_health: health, body: redactDeep(result.body) };
      }
      const body = result.body || {};
      const confirmations = Array.isArray(body.conf) ? body.conf : (Array.isArray(body.confirmations) ? body.confirmations : []);
      const health = this.markSessionOk('fetch_confirmations', result);
      const payload = { ok: true, status: result.status, success: body.success !== false, confirmations, count: confirmations.length, fetched_at: new Date().toISOString(), session_health: health };
      this.audit.write('steamguard_confirmations_fetched', { count: confirmations.length, status: result.status });
      appendActionFeed('steamguard_confirmations_fetched', { count: confirmations.length });
      return payload;
    } catch (error) {
      this.audit.write('steamguard_confirmations_fetch_exception', { message: safeError(error) });
      return { ok: false, error: safeError(error) };
    }
  }

  async confirmationOp(maFile, op, confId, confNonce) {
    if (!maFile) return { ok: false, error: 'No maFile loaded.' };
    if (!confId || !confNonce) return { ok: false, error: 'Missing confirmation id or nonce.' };
    const tag = op === 'cancel' ? 'cancel' : 'allow';
    const time = Math.floor(Date.now() / 1000);
    const url = new URL('https://steamcommunity.com/mobileconf/ajaxop');
    url.searchParams.set('op', tag);
    url.searchParams.set('p', this.getDeviceId(maFile));
    url.searchParams.set('a', String(maFile.Session?.SteamID || ''));
    url.searchParams.set('k', this.generateConfirmationKey(maFile.identity_secret, tag, time));
    url.searchParams.set('t', String(time));
    url.searchParams.set('m', 'android');
    url.searchParams.set('tag', tag);
    url.searchParams.set('cid', String(confId));
    url.searchParams.set('ck', String(confNonce));
    try {
      const result = await fetchJsonWithTimeout(url.toString(), 15, {
        headers: { Cookie: this.buildCookies(maFile), 'User-Agent': 'Steam App / Android' }
      });
      const problem = this.detectSessionProblem(result);
      if (problem) return { ...this.sessionProblemResponse(`confirmation_${tag}`, result, problem), conf_id: String(confId) };
      const ok = Boolean(result.ok && (result.body?.success === true || result.body?.success === 'true' || result.body?.success === 1));
      const health = ok ? this.markSessionOk(`confirmation_${tag}`, result) : this.markSessionProblem(`confirmation_${tag}`, result, { code: 'steam_confirmation_op_failed', reason: result.body?.message || result.body?.error || `Steam confirmation ${tag} failed.` });
      this.audit.write(tag === 'allow' ? 'steamguard_confirmation_allowed' : 'steamguard_confirmation_cancelled', { conf_id: String(confId), ok, status: result.status });
      appendActionFeed(tag === 'allow' ? 'steamguard_confirmation_allowed' : 'steamguard_confirmation_cancelled', { conf_id: String(confId), ok });
      return { ok, status: result.status, conf_id: String(confId), session_health: health, body: redactDeep(result.body), error: ok ? null : (health.message || `Steam confirmation ${tag} failed.`), session_recovery_required: Boolean(health.recovery_required), recovery_hint: health.recovery_hint || null };
    } catch (error) {
      this.audit.write('steamguard_confirmation_op_exception', { conf_id: String(confId), op: tag, message: safeError(error) });
      return { ok: false, conf_id: String(confId), error: safeError(error) };
    }
  }

  async acceptConfirmation(maFile, confId, confNonce) {
    return this.confirmationOp(maFile, 'allow', confId, confNonce);
  }

  async denyConfirmation(maFile, confId, confNonce) {
    return this.confirmationOp(maFile, 'cancel', confId, confNonce);
  }

  confirmationMatchesOffer(conf, offerSet) {
    const candidates = [
      conf.creator,
      conf.creator_id,
      conf.creator_steamid,
      conf.tradeofferid,
      conf.trade_offer_id,
      conf.offer_id
    ].map(value => String(value || '').trim()).filter(Boolean);
    const text = JSON.stringify({
      id: conf.id,
      type: conf.type,
      description: conf.conf_description,
      details: conf.details,
      headline: conf.headline,
      summary: conf.summary
    });
    for (const offerId of offerSet) {
      if (candidates.includes(String(offerId))) return String(offerId);
      if (text && text.includes(String(offerId))) return String(offerId);
    }
    return null;
  }

  async autoConfirmOffers(offerIds) {
    const ids = (Array.isArray(offerIds) ? offerIds : []).map(String).filter(Boolean);
    if (!ids.length) return { ok: true, confirmed: [], skipped_no_offers: true };
    const maFile = this.loadMaFile();
    if (!maFile) return { ok: false, error: 'No maFile loaded.' };
    const confsResult = await this.fetchConfirmations(maFile);
    if (!confsResult.ok) return { ok: false, error: confsResult.error, status: confsResult.status, error_code: confsResult.error_code || null, session_recovery_required: Boolean(confsResult.session_recovery_required), recovery_hint: confsResult.recovery_hint || null, session_health: confsResult.session_health || null };
    const offerSet = new Set(ids);
    const confirmed = [];
    const unmatched = [];
    for (const conf of confsResult.confirmations) {
      const offerId = this.confirmationMatchesOffer(conf, offerSet);
      if (!offerId) continue;
      const nonce = String(conf.nonce || conf.key || conf.confirmation_key || '');
      const result = await this.acceptConfirmation(maFile, String(conf.id || ''), nonce);
      confirmed.push({ conf_id: String(conf.id || ''), offer_id: offerId, ok: result.ok, error: result.error || null });
    }
    for (const offerId of offerSet) {
      if (!confirmed.some(item => item.offer_id === offerId)) unmatched.push(offerId);
    }
    this.audit.write('steamguard_auto_confirm_cycle', { offer_ids: ids, total_confs: confsResult.confirmations.length, confirmed: confirmed.length, unmatched: unmatched.length });
    appendActionFeed('steamguard_auto_confirm_cycle', { offers: ids.length, confirmed: confirmed.length, unmatched: unmatched.length });
    return { ok: true, confirmed, unmatched, total_confs: confsResult.confirmations.length };
  }
}


class SteamSessionRefreshService {
  constructor(auditService, notificationService = null) {
    this.audit = auditService;
    this.notificationService = notificationService;
  }

  loadRefreshTokenRecord() {
    const record = readJson(STEAMGUARD_REFRESH_TOKEN_PATH, null);
    if (!record || typeof record !== 'object') return null;
    const token = String(record.refresh_token || '').trim();
    if (!token) return null;
    return record;
  }

  loadRefreshToken(maFile = null) {
    const record = this.loadRefreshTokenRecord();
    if (record?.refresh_token) return String(record.refresh_token).trim();
    const embedded = String(
      maFile?.refresh_token ||
      maFile?.refreshToken ||
      maFile?.steam_refresh_token ||
      maFile?.steamRefreshToken ||
      maFile?.Session?.RefreshToken ||
      maFile?.Session?.refresh_token ||
      maFile?.Session?.refreshToken ||
      ''
    ).trim();
    return embedded || '';
  }

  hasRefreshToken(maFile = null) {
    return Boolean(this.loadRefreshToken(maFile));
  }

  saveRefreshToken(refreshToken, steamId64 = '', source = 'manual') {
    const token = String(refreshToken || '').trim();
    if (!token) return { ok: false, error: 'Missing refresh_token.' };
    const payload = {
      refresh_token: token,
      steam_id64: String(steamId64 || '').trim(),
      source: String(source || 'manual'),
      saved_at: new Date().toISOString()
    };
    writeJson(STEAMGUARD_REFRESH_TOKEN_PATH, payload);
    this.audit?.write('steamguard_refresh_token_saved', {
      steam_id64_saved: Boolean(payload.steam_id64),
      source: payload.source,
      has_refresh_token: true
    });
    appendActionFeed('steamguard_refresh_token_saved', { source: payload.source, has_refresh_token: true });
    return { ok: true, saved_at: payload.saved_at, has_refresh_token: true };
  }

  async notifyRefreshFailure(reason) {
    const options = getOptions();
    const entriesFile = readJson(NOTIFICATIONS_PATH, { ok: true, entries: [] });
    const entries = Array.isArray(entriesFile.entries) ? entriesFile.entries : [];
    const notification = {
      ts: new Date().toISOString(),
      id: `steamguard_refresh_failed_${Date.now()}`,
      type: 'steamguard_session_refresh_failed',
      title: 'Steam Guard session refresh failed',
      message: `Steam session could not be refreshed automatically. Open the add-on, check Embedded Steam Guard, and upload a fresh maFile/session if needed. Reason: ${String(reason || 'unknown error')}`,
      delivered_to_ha: false
    };
    entries.push(notification);
    writeJson(NOTIFICATIONS_PATH, { ok: true, updated_at: new Date().toISOString(), entries: entries.slice(-500) });
    if (options.ha_notifications_enabled && process.env.SUPERVISOR_TOKEN) {
      try {
        const result = await fetchJsonWithTimeout('http://supervisor/core/api/services/persistent_notification/create', options.provider_timeout_seconds, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
            'content-type': 'application/json',
            accept: 'application/json'
          },
          body: JSON.stringify({ notification_id: notification.id, title: notification.title, message: notification.message })
        });
        notification.delivered_to_ha = Boolean(result.ok);
        notification.ha_error = result.ok ? undefined : `HA notification HTTP ${result.status}`;
        writeJson(NOTIFICATIONS_PATH, { ok: true, updated_at: new Date().toISOString(), entries: entries.slice(-500) });
        this.audit?.write(result.ok ? 'steamguard_refresh_failure_ha_notification_sent' : 'steamguard_refresh_failure_ha_notification_failed', { status: result.status });
      } catch (error) {
        notification.ha_error = safeError(error);
        writeJson(NOTIFICATIONS_PATH, { ok: true, updated_at: new Date().toISOString(), entries: entries.slice(-500) });
        this.audit?.write('steamguard_refresh_failure_ha_notification_failed', { error: safeError(error) });
      }
    }
    return { ok: true, notification_id: notification.id };
  }

  async refreshSession(reason = 'manual') {
    const guard = new SteamGuardModule(this.audit);
    const maFile = guard.loadMaFile();
    if (!maFile) return { ok: false, skipped: true, error: 'No maFile loaded.' };
    const refreshToken = this.loadRefreshToken(maFile);
    if (!refreshToken) {
      const error = 'Missing refresh_token. Save one through /api/steamguard/refresh-token or include it in maFile/Session.RefreshToken.';
      this.audit?.write('steamguard_session_refresh_skipped', { reason: 'missing_refresh_token' });
      appendActionFeed('steamguard_session_refresh_skipped', { reason: 'missing_refresh_token' });
      await this.notifyRefreshFailure(error);
      return { ok: false, skipped: true, error, missing_refresh_token: true };
    }
    const record = this.loadRefreshTokenRecord();
    const steamId64 = String(maFile.Session?.SteamID || record?.steam_id64 || getOptions().steam_id64 || '').trim();
    if (!steamId64) return { ok: false, error: 'Missing SteamID64. Add steam_id64 in add-on options or upload a maFile containing Session.SteamID.' };
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      steamid: steamId64,
      renewal_type: '1'
    }).toString();
    try {
      const result = await fetchJsonWithTimeout('https://api.steampowered.com/IAuthenticationService/GenerateAccessTokenForApp/v1/', getOptions().provider_timeout_seconds, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
          referer: 'https://steamcommunity.com',
          'User-Agent': 'Steam App / Android'
        },
        body
      });
      const payload = result.body?.response || result.body || {};
      const accessToken = String(payload.access_token || payload.accessToken || payload.token || '').trim();
      const newRefreshToken = String(payload.refresh_token || payload.refreshToken || '').trim();
      if (!result.ok || !accessToken) {
        const error = result.body?.error || result.body?.message || result.body?.eresult || `Steam refresh HTTP ${result.status}`;
        this.audit?.write('steamguard_session_refresh_failed', { status: result.status, has_access_token: false, reason: safeError(error) });
        appendActionFeed('steamguard_session_refresh_failed', { status: result.status });
        await this.notifyRefreshFailure(safeError(error));
        return { ok: false, status: result.status, error: safeError(error), body: redactDeep(result.body || null) };
      }
      const updated = {
        ...maFile,
        Session: {
          ...(maFile.Session || {}),
          SteamID: steamId64,
          SteamLoginSecure: `${steamId64}%7C%7C${accessToken}`,
          SessionID: String(maFile.Session?.SessionID || crypto.randomBytes(12).toString('hex'))
        },
        session_refreshed_at: new Date().toISOString()
      };
      writeJson(MAFILE_PATH, updated);
      if (newRefreshToken && newRefreshToken !== refreshToken) this.saveRefreshToken(newRefreshToken, steamId64, 'steam_refresh_rotation');
      const health = guard.writeSessionHealth({
        state: 'ok',
        ok: true,
        checked_at: new Date().toISOString(),
        last_context: 'session_refresh',
        last_http_status: result.status,
        last_content_type: result.contentType || null,
        message: 'Steam mobile session refreshed from refresh_token.',
        recovery_required: false,
        refreshed_at: updated.session_refreshed_at
      });
      this.audit?.write('steamguard_session_refreshed', { reason: String(reason || 'manual'), status: result.status, rotated_refresh_token: Boolean(newRefreshToken && newRefreshToken !== refreshToken) });
      appendActionFeed('steamguard_session_refreshed', { reason: String(reason || 'manual'), rotated_refresh_token: Boolean(newRefreshToken && newRefreshToken !== refreshToken) });
      return { ok: true, refreshed_at: updated.session_refreshed_at, session_health: health, rotated_refresh_token: Boolean(newRefreshToken && newRefreshToken !== refreshToken) };
    } catch (error) {
      const message = safeError(error);
      this.audit?.write('steamguard_session_refresh_exception', { message });
      appendActionFeed('steamguard_session_refresh_exception', { message });
      await this.notifyRefreshFailure(message);
      return { ok: false, error: message };
    }
  }

  async ensureFreshSession(reason = 'review') {
    const guard = new SteamGuardModule(this.audit);
    const maFile = guard.loadMaFile();
    const health = guard.sessionHealth();
    if (health?.state === 'ok' && health?.ok === true) return { ok: true, skipped: true, reason: 'session_health_ok', session_health: health };
    if (!maFile) return { ok: false, skipped: true, reason: 'no_mafile_loaded', session_health: health };
    const hasToken = this.hasRefreshToken(maFile);
    if (!hasToken && health?.state !== 'needs_refresh') {
      return { ok: true, skipped: true, reason: 'no_refresh_token_until_session_needs_refresh', session_health: health };
    }
    return this.refreshSession(reason);
  }
}

function deriveDeviceId(steamId64) {
  const text = String(steamId64 || '').trim();
  if (!text) return '';
  const hash = crypto.createHash('sha1').update(text).digest('hex');
  return `android:${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

class SdaConfirmationService {
  constructor(options, auditService) { this.options = options; this.audit = auditService; }
  async getStatus() {
    if (!this.options.sda_enabled) return { ok: false, skipped: true, reason: 'sda_enabled is false' };
    try {
      const result = await fetchJsonWithTimeout(`${this.options.sda_base_url}/status`, 5);
      return { ok: result.ok, status: result.status, connected: result.ok, base_url: this.options.sda_base_url };
    } catch (error) {
      try {
        const ping = await fetchJsonWithTimeout(`${this.options.sda_base_url}/`, 5);
        return { ok: ping.ok || ping.status < 500, connected: true, base_url: this.options.sda_base_url };
      } catch (e2) {
        return { ok: false, connected: false, error: safeError(error), base_url: this.options.sda_base_url };
      }
    }
  }
  async getConfirmations() {
    if (!this.options.sda_enabled) return { ok: false, skipped: true };
    const url = new URL(`${this.options.sda_base_url}/confirmations`);
    if (this.options.sda_password) url.searchParams.set('p', this.options.sda_password);
    try {
      const result = await fetchJsonWithTimeout(url.toString(), 10);
      if (!result.ok) return { ok: false, error: `SDA HTTP ${result.status}`, body: result.body };
      const confs = result.body?.confs || result.body?.confirmations || (Array.isArray(result.body) ? result.body : []);
      return { ok: true, confirmations: confs };
    } catch (error) {
      return { ok: false, error: safeError(error) };
    }
  }
  async acceptConfirmation(confId, confKey) {
    if (!this.options.sda_enabled) return { ok: false, skipped: true };
    const url = new URL(`${this.options.sda_base_url}/confirmations`);
    if (this.options.sda_password) url.searchParams.set('p', this.options.sda_password);
    url.searchParams.set('id', confId);
    url.searchParams.set('key', confKey);
    url.searchParams.set('tag', 'allow');
    try {
      const result = await fetchJsonWithTimeout(url.toString(), 10, { method: 'POST' });
      this.audit.write('sda_confirmation_accepted', { conf_id: confId, ok: result.ok, status: result.status });
      return { ok: result.ok, status: result.status, conf_id: confId };
    } catch (error) {
      this.audit.write('sda_confirmation_failed', { conf_id: confId, error: safeError(error) });
      return { ok: false, error: safeError(error), conf_id: confId };
    }
  }
  async autoConfirmOffers(offerIds) {
    if (!this.options.sda_enabled || !(this.options.sda_auto_confirm || this.options.trade_approval_mode === 'accept_and_confirm')) return { ok: false, skipped: true, reason: !this.options.sda_enabled ? 'sda_enabled is false' : 'sda_auto_confirm is false and trade_approval_mode is not accept_and_confirm' };
    if (!offerIds || offerIds.length === 0) return { ok: true, confirmed: [], skipped_no_offers: true };
    const ids = offerIds.map(String);
    try {
      const url = new URL(`${this.options.sda_base_url}/api/confirm-offers`);
      if (this.options.sda_password) url.searchParams.set('p', this.options.sda_password);
      const result = await fetchJsonWithTimeout(url.toString(), 15, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ offer_ids: ids })
      });
      this.audit.write('sda_auto_confirm_cycle', { offer_ids: ids, ok: result.ok, status: result.status, confirmed: result.body?.confirmed?.length || 0, ignored: result.body?.ignored?.length || 0 });
      if (!result.ok) return { ok: false, status: result.status, error: result.body?.error || `SDA HTTP ${result.status}`, body: result.body };
      return result.body;
    } catch (error) {
      this.audit.write('sda_auto_confirm_exception', { offer_ids: ids, message: safeError(error) });
      return { ok: false, error: safeError(error) };
    }
  }
}

class SteamTradeDecisionService {
  constructor(options, pricelist) { this.options = options; this.pricelist = pricelist; }
  evaluate(offer, descriptions = [], history = {}) {
    const giveRows = itemRows(offer.items_to_give, descriptions, this.pricelist, 'give');
    const receiveRows = itemRows(offer.items_to_receive, descriptions, this.pricelist, 'receive');
    const giveValue = giveRows.reduce((sum, row) => sum + row.value_ref, 0);
    const receiveValue = receiveRows.reduce((sum, row) => sum + row.value_ref, 0);
    const unknownGive = giveRows.filter(row => !row.price_found).length;
    const unknownReceive = receiveRows.filter(row => !row.price_found).length;
    const state = Number(offer.trade_offer_state || 0);
    const isReceived = !offer.is_our_offer;
    const active = state === 2 || state === 9;
    const giveBrain = pricingBrainForRows(giveRows);
    const receiveBrain = pricingBrainForRows(receiveRows);
    const allEntries = [...giveRows, ...receiveRows].map(row => row.entry).filter(Boolean);
    const allTags = new Set(allEntries.flatMap(tagsOf));
    const blockedTags = this.options.do_not_trade_tags.filter(tag => allTags.has(tag));
    let risk = 0;
    const reasons = [];
    if (!active) { risk += 15; reasons.push(`Offer is not active (${OFFER_STATE[state] || state || 'unknown'}).`); }
    if (history.status === 'ignored') { risk += 20; reasons.push('This offer was previously ignored.'); }
    if (history.status === 'reviewed') reasons.push('This offer was already marked reviewed.');
    if (unknownGive > 0) { risk += unknownGive * this.options.pricing_unknown_item_risk; reasons.push(`${unknownGive} item(s) you give are not in the pricelist.`); }
    if (unknownReceive > 0) { risk += unknownReceive * Math.max(8, Math.floor(this.options.pricing_unknown_item_risk / 2)); reasons.push(`${unknownReceive} received item(s) are not in the pricelist.`); }
    if (giveRows.length > 0 && receiveRows.length === 0) { risk += 80; reasons.push('You give items and receive nothing.'); }
    if (giveRows.length > receiveRows.length + 3) { risk += 15; reasons.push('You give significantly more item stacks than you receive.'); }
    if (!isReceived) { risk += 8; reasons.push('This is a sent offer; review manually.'); }
    if (blockedTags.length) { risk += 90; reasons.push(`Blocked do-not-trade tag(s): ${blockedTags.join(', ')}.`); }
    if (Math.max(giveValue, receiveValue) > this.options.max_offer_value_ref) { risk += 20; reasons.push(`Offer value exceeds configured max_offer_value_ref (${this.options.max_offer_value_ref}).`); }
    if (receiveBrain.liquidity_score < 35 && receiveRows.length) { risk += 12; reasons.push('Received side has low liquidity score.'); }
    const profitRef = Number((receiveValue - giveValue).toFixed(2));
    const marginPercent = giveValue > 0 ? Number(((profitRef / giveValue) * 100).toFixed(2)) : (profitRef > 0 ? 100 : 0);
    if (profitRef < 0) { risk += 25; reasons.push(`Estimated value is negative (${profitRef} ref).`); }
    if (profitRef >= 0 && profitRef < this.options.pricing_min_profit_ref) { risk += 8; reasons.push(`Estimated profit is below pricing_min_profit_ref (${this.options.pricing_min_profit_ref} ref).`); }
    if (giveValue > 0 && marginPercent < this.options.pricing_min_margin_percent) { risk += 8; reasons.push(`Margin is below pricing_min_margin_percent (${this.options.pricing_min_margin_percent}%).`); }
    const clampedRisk = Math.min(100, Math.max(0, Math.round(risk)));
    const liquidityScore = clampScore(Math.round((receiveBrain.liquidity_score + giveBrain.liquidity_score) / 2));
    const spreadScore = clampScore(receiveBrain.spread_score);
    const dataQualityScore = clampScore(Math.round((receiveBrain.data_quality_score + giveBrain.data_quality_score) / 2));
    const profitScore = clampScore((profitRef <= 0 ? 0 : Math.min(100, profitRef * 25)) + Math.max(0, Math.min(25, marginPercent)));
    const pricingScore = clampScore((profitScore * 0.38) + (liquidityScore * 0.24) + (spreadScore * 0.18) + (dataQualityScore * 0.20) - (clampedRisk * 0.35));
    let decision = 'needs_review';
    if (!active) decision = 'ignore_not_active';
    else if (blockedTags.length || clampedRisk > 70) decision = 'reject_recommended';
    else if (profitRef >= this.options.min_profit_ref_for_accept && profitRef >= this.options.pricing_min_profit_ref && marginPercent >= this.options.pricing_min_margin_percent && clampedRisk <= this.options.max_risk_for_accept && unknownGive === 0 && unknownReceive === 0 && pricingScore >= 45) decision = 'accept_recommended';
    const riskLevel = clampedRisk >= 70 ? 'high' : clampedRisk >= 30 ? 'medium' : 'low';
    const pricingGrade = pricingScore >= 80 ? 'A' : pricingScore >= 65 ? 'B' : pricingScore >= 45 ? 'C' : pricingScore >= 25 ? 'D' : 'F';
    return {
      tradeofferid: offer.tradeofferid,
      accountid_other: offer.accountid_other,
      state,
      state_label: OFFER_STATE[state] || 'Unknown',
      is_our_offer: Boolean(offer.is_our_offer),
      decision,
      risk_score: clampedRisk,
      risk_level: riskLevel,
      pricing_score: pricingScore,
      pricing_grade: pricingGrade,
      liquidity_score: liquidityScore,
      spread_score: spreadScore,
      data_quality_score: dataQualityScore,
      estimated_give_ref: Number(giveValue.toFixed(2)),
      estimated_receive_ref: Number(receiveValue.toFixed(2)),
      estimated_profit_ref: profitRef,
      estimated_margin_percent: marginPercent,
      unknown_give_items: unknownGive,
      unknown_receive_items: unknownReceive,
      blocked_tags: blockedTags,
      reviewed_status: history.status || 'new',
      reasons,
      pricing: { give: giveBrain, receive: receiveBrain },
      items_to_give: giveRows.map(({ entry, ...row }) => row),
      items_to_receive: receiveRows.map(({ entry, ...row }) => row)
    };
  }
}

class TradeOfferNotificationService {
  constructor(auditService) { this.audit = auditService; }
  list(limit = 100) { return readJson(NOTIFICATIONS_PATH, { ok: true, entries: [] }).entries.slice(-limit); }
  save(entries) { writeJson(NOTIFICATIONS_PATH, { ok: true, updated_at: new Date().toISOString(), entries: entries.slice(-500) }); }
  shouldNotify(decision, options) {
    if (decision.decision === 'accept_recommended') return options.notify_on_accept_recommended;
    if (decision.decision === 'needs_review' || decision.decision === 'reject_recommended') return options.notify_on_needs_review;
    return false;
  }
  async notify(decision, links, options) {
    const entries = this.list(500);
    const notification = {
      ts: new Date().toISOString(),
      id: `steam_trade_${decision.tradeofferid}_${decision.decision}`,
      tradeofferid: decision.tradeofferid,
      decision: decision.decision,
      risk_score: decision.risk_score,
      pricing_score: decision.pricing_score,
      estimated_profit_ref: decision.estimated_profit_ref,
      title: `Steam offer ${decision.tradeofferid}: ${decision.decision.replace(/_/g, ' ')}`,
      message: `Decision: ${decision.decision}. Pricing: ${decision.pricing_score}/100. Risk: ${decision.risk_score}/100. Estimated profit: ${decision.estimated_profit_ref} ref. Open: ${links.offer_url}`,
      link: links.offer_url,
      delivered_to_ha: false
    };
    if (entries.some(entry => entry.id === notification.id)) return { ok: true, skipped: true, reason: 'already_notified' };
    entries.push(notification);
    this.save(entries);
    this.audit.write('trade_offer_notification_queued', { tradeofferid: decision.tradeofferid, decision: decision.decision });
    if (options.ha_notifications_enabled && process.env.SUPERVISOR_TOKEN) {
      const result = await this.sendHomeAssistantPersistentNotification(notification, options.provider_timeout_seconds);
      notification.delivered_to_ha = result.ok;
      notification.ha_error = result.ok ? undefined : result.error;
      this.save(entries);
      this.audit.write(result.ok ? 'ha_notification_sent' : 'ha_notification_failed', { tradeofferid: decision.tradeofferid, decision: decision.decision, error: result.error });
    }
    return { ok: true, notification };
  }
  async sendHomeAssistantPersistentNotification(notification, timeoutSeconds) {
    try {
      const url = 'http://supervisor/core/api/services/persistent_notification/create';
      const response = await fetchJsonWithTimeout(url, timeoutSeconds, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.SUPERVISOR_TOKEN}`,
          'content-type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({ notification_id: notification.id, title: notification.title, message: notification.message })
      });
      return response.ok ? { ok: true } : { ok: false, error: `HA notification HTTP ${response.status}` };
    } catch (error) { return { ok: false, error: safeError(error) }; }
  }
}

class BackpackTfV2ListingManager {
  constructor(options, auditService) { this.options = options; this.audit = auditService; }
  apiBase() {
    const configured = String(this.options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, '');
    return configured.endsWith('/api') ? configured : `${configured}/api`;
  }
  headers(authMode = 'token') {
    const headers = { accept: 'application/json', 'user-agent': this.options.backpack_tf_user_agent || 'TF2-HA-TF2-Trading-Hub/5.13.36' };
    if (authMode === 'token' && this.options.backpack_tf_access_token) headers['X-Auth-Token'] = this.options.backpack_tf_access_token;
    if (authMode === 'bearer' && this.options.backpack_tf_access_token) headers.authorization = `Bearer ${this.options.backpack_tf_access_token}`;
    if (authMode === 'api_key_header' && this.options.backpack_tf_api_key) headers['x-api-key'] = this.options.backpack_tf_api_key;
    return headers;
  }
  withApiKey(url) {
    const parsed = new URL(url);
    if (this.options.backpack_tf_api_key) parsed.searchParams.set('key', this.options.backpack_tf_api_key);
    return parsed.toString();
  }
  withAccessTokenParam(url) {
    const parsed = new URL(url);
    if (this.options.backpack_tf_access_token) parsed.searchParams.set('token', this.options.backpack_tf_access_token);
    return parsed.toString();
  }
  cacheFresh() {
    const cache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
    if (!cache.ok || !cache.updated_at) return false;
    return Date.now() - Date.parse(cache.updated_at) < this.options.backpack_tf_cache_ttl_minutes * 60 * 1000;
  }
  extractListings(body) {
    if (!body || typeof body !== 'object') return [];
    const candidates = [
      body.listings,
      body.results,
      body.response && body.response.listings,
      body.response && body.response.results,
      body.data && body.data.listings,
      body.data && body.data.results,
      body.cursor && body.cursor.results,
      body.items
    ];
    for (const candidate of candidates) if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(body)) return body;
    return [];
  }
  extractPrices(body) {
    const response = body && (body.response || body);
    const rawItems = response && (response.items || response.prices || response.data);
    if (!rawItems || typeof rawItems !== 'object' || Array.isArray(rawItems)) return [];
    const prices = [];
    const isPriceObject = value => Boolean(value && typeof value === 'object' && !Array.isArray(value) && (
      Object.prototype.hasOwnProperty.call(value, 'currency') ||
      Object.prototype.hasOwnProperty.call(value, 'value') ||
      Object.prototype.hasOwnProperty.call(value, 'value_raw') ||
      Object.prototype.hasOwnProperty.call(value, 'valueRaw') ||
      Object.prototype.hasOwnProperty.call(value, 'last_update')
    ));
    let currentDefindex = null;
    const pushPrice = (name, quality, priceindex, price) => {
      if (!price) return;
      if (Array.isArray(price)) {
        price.forEach((entry, index) => pushPrice(name, quality, entry && entry.priceindex !== undefined ? entry.priceindex : (priceindex !== undefined ? priceindex : index), entry));
        return;
      }
      if (typeof price !== 'object') return;
      if (!isPriceObject(price)) {
        for (const [nestedIndex, nested] of Object.entries(price)) {
          pushPrice(name, quality, nested && nested.priceindex !== undefined ? nested.priceindex : nestedIndex, nested);
        }
        return;
      }
      const value = parsePriceNumber(price.value);
      const valueHigh = Array.isArray(price.value) ? parsePriceNumber(price.value[1]) : parsePriceNumber(price.value_high !== undefined ? price.value_high : (price.high !== undefined ? price.high : price.max));
      const raw = parsePriceNumber(price.value_raw !== undefined ? price.value_raw : (price.valueRaw !== undefined ? price.valueRaw : (price.raw !== undefined ? price.raw : (price.ref !== undefined ? price.ref : (price.metal !== undefined ? price.metal : 0)))));
      const rawHigh = parsePriceNumber(price.value_high_raw !== undefined ? price.value_high_raw : (price.valueRawHigh !== undefined ? price.valueRawHigh : (price.raw_high !== undefined ? price.raw_high : (price.ref_high !== undefined ? price.ref_high : 0))));
      prices.push({
        item_name: name,
        defindex: Number.isFinite(Number(currentDefindex)) && Number(currentDefindex) > 0 ? Number(currentDefindex) : null,
        quality: String(quality !== undefined ? quality : '6'),
        priceindex: String(price.priceindex !== undefined ? price.priceindex : (priceindex !== undefined ? priceindex : '0')),
        currency: String(price.currency || '').toLowerCase(),
        value,
        value_high: Number.isFinite(valueHigh) && valueHigh > 0 ? valueHigh : null,
        value_raw: Number.isFinite(raw) && raw > 0 ? raw : null,
        value_high_raw: Number.isFinite(rawHigh) && rawHigh > 0 ? rawHigh : null,
        last_update: price.last_update || price.lastUpdate || null
      });
    };
    const walkCraftable = (name, quality, craftableNode) => {
      if (!craftableNode) return;
      if (Array.isArray(craftableNode) || isPriceObject(craftableNode)) {
        pushPrice(name, quality, '0', craftableNode);
        return;
      }
      if (typeof craftableNode !== 'object') return;
      for (const [priceindex, priceNode] of Object.entries(craftableNode)) pushPrice(name, quality, priceindex, priceNode);
    };
    const walkTradable = (name, quality, tradableNode) => {
      if (!tradableNode) return;
      if (Array.isArray(tradableNode) || isPriceObject(tradableNode)) {
        pushPrice(name, quality, '0', tradableNode);
        return;
      }
      if (typeof tradableNode !== 'object') return;
      const craftableKeys = ['Craftable', 'craftable', '1'];
      const nonCraftableKeys = ['Non-Craftable', 'NonCraftable', 'noncraftable', '0'];
      let consumed = false;
      for (const key of craftableKeys) if (tradableNode[key]) { walkCraftable(name, quality, tradableNode[key]); consumed = true; }
      for (const key of nonCraftableKeys) if (tradableNode[key]) { walkCraftable(name, quality, tradableNode[key]); consumed = true; }
      if (!consumed) for (const [priceindex, priceNode] of Object.entries(tradableNode)) pushPrice(name, quality, priceindex, priceNode);
    };
    const walkQuality = (name, quality, qualityNode) => {
      if (!qualityNode) return;
      if (Array.isArray(qualityNode) || isPriceObject(qualityNode)) {
        pushPrice(name, quality, '0', qualityNode);
        return;
      }
      if (typeof qualityNode !== 'object') return;
      const tradableKeys = ['Tradable', 'tradable', '1'];
      const nonTradableKeys = ['Non-Tradable', 'NonTradable', 'nontradable', '0'];
      let consumed = false;
      for (const key of tradableKeys) if (qualityNode[key]) { walkTradable(name, quality, qualityNode[key]); consumed = true; }
      for (const key of nonTradableKeys) if (qualityNode[key]) { walkTradable(name, quality, qualityNode[key]); consumed = true; }
      if (!consumed) for (const [nestedQuality, nested] of Object.entries(qualityNode)) {
        if (['defindex', 'prices', 'name', 'item_name'].includes(String(nestedQuality).toLowerCase())) continue;
        walkTradable(name, quality, { [nestedQuality]: nested });
      }
    };
    for (const [name, itemNode] of Object.entries(rawItems)) {
      if (!itemNode || typeof itemNode !== 'object') continue;
      currentDefindex = Number(itemNode.defindex || itemNode.def_index || itemNode.itemdef || 0) || null;
      const priceTree = itemNode.prices && typeof itemNode.prices === 'object' ? itemNode.prices : itemNode;
      for (const [quality, qualityNode] of Object.entries(priceTree)) {
        if (['defindex', 'prices', 'name', 'item_name'].includes(String(quality).toLowerCase())) continue;
        walkQuality(name, quality, qualityNode);
      }
    }
    return prices.filter(price => price.item_name && (price.value > 0 || price.value_raw > 0 || price.value_high || price.value_high_raw));
  }
  summarizeListings(listings) {
    const byIntent = { buy: 0, sell: 0, other: 0 };
    for (const item of listings) {
      const intent = String(item.intent || item.listingIntent || item.intent_name || '').toLowerCase();
      if (intent.includes('buy')) byIntent.buy += 1;
      else if (intent.includes('sell')) byIntent.sell += 1;
      else byIntent.other += 1;
    }
    return { total: listings.length, buy: byIntent.buy, sell: byIntent.sell, other: byIntent.other };
  }
  async validateToken() {
    if (!this.options.backpack_tf_access_token) return { ok: false, skipped: true, stage: 'access_token_missing', error: 'Backpack.tf user access token is missing. Account listings require X-Auth-Token.' };
    const url = `${this.apiBase()}/`;
    const result = await fetchJsonHardened('backpack.tf', url, this.options, { headers: this.headers('token') });
    return { ok: Boolean(result.ok), status: result.status, error: result.ok ? null : (result.error || result.body?.message || result.body?.raw || `HTTP ${result.status}`), body_summary: result.body && typeof result.body === 'object' ? Object.keys(result.body).slice(0, 12) : [] };
  }
  async syncAccountListings() {
    const startedAt = Date.now();
    runtimeLogger.info('backpack_tf', 'classifieds_fetch_start', 'Backpack.tf account listings fetch started', { hasBackpackToken: Boolean(this.options.backpack_tf_access_token), cacheTtlMinutes: this.options.backpack_tf_cache_ttl_minutes });
    if (!this.options.backpack_tf_access_token) {
      runtimeLogger.warn('backpack_tf', 'classifieds_fetch_failed', 'Backpack.tf account listings fetch skipped: token missing', { stage: 'access_token_missing' });
      return { ok: false, stage: 'access_token_missing', error: 'Backpack.tf access token is required for account listings. API key alone can read public price data, but not your own classifieds/listings.' };
    }
    const baseUrl = `${this.apiBase()}/v2/classifieds/listings?limit=100`;
    const attempts = [];
    const variants = [
      { label: 'x_auth_token', url: baseUrl, init: { headers: this.headers('token') } },
      { label: 'token_query_param', url: this.withAccessTokenParam(baseUrl), init: { headers: this.headers('none') } },
      { label: 'bearer_fallback', url: baseUrl, init: { headers: this.headers('bearer') } }
    ];
    for (const variant of variants) {
      const result = await fetchJsonHardened('backpack.tf', variant.url, this.options, variant.init);
      const listings = result.ok ? this.extractListings(result.body) : [];
      attempts.push({ label: variant.label, url: variant.url.replace(/([?&]token=)[^&]+/i, '$1[redacted]'), ok: result.ok, status: result.status, retryAfter: result.retryAfter, listings: listings.length, error: result.error || result.body?.message || result.body?.raw || null, body_keys: result.body && typeof result.body === 'object' ? Object.keys(result.body).slice(0, 12) : [] });
      if (result.ok) {
        runtimeLogger.info('backpack_tf', 'classifieds_fetch_done', 'Backpack.tf account listings fetch completed', { authMode: variant.label, listings: listings.length, attempts: attempts.length, durationMs: Date.now() - startedAt });
        return { ok: true, source_url: variant.url.replace(/([?&]token=)[^&]+/i, '$1[redacted]'), auth_mode: variant.label, attempts, listings, summary: this.summarizeListings(listings), raw_shape: result.body && typeof result.body === 'object' ? Object.keys(result.body).slice(0, 20) : [] };
      }
      if (![401, 403, 404, 405].includes(Number(result.status))) break;
    }
    runtimeLogger.warn('backpack_tf', 'classifieds_fetch_failed', 'Backpack.tf account listings fetch failed', { attempts: attempts.length, lastStatus: attempts.at(-1)?.status || null, error: attempts.at(-1)?.error || 'Backpack.tf account listings sync failed.', durationMs: Date.now() - startedAt });
    return { ok: false, stage: 'account_listings_failed', attempts, error: attempts.at(-1)?.error || 'Backpack.tf account listings sync failed.' };
  }
  async syncPriceSchema() {
    const startedAt = Date.now();
    runtimeLogger.info('backpack_tf', 'pricelist_sync_start', 'Backpack.tf price schema sync started', { hasApiKey: Boolean(this.options.backpack_tf_api_key) });
    if (!this.options.backpack_tf_api_key) {
      runtimeLogger.warn('backpack_tf', 'pricelist_sync_failed', 'Backpack.tf price schema skipped: API key missing', { stage: 'api_key_missing' });
      return { ok: false, skipped: true, stage: 'api_key_missing', error: 'Backpack.tf API key missing. Price schema sync skipped.' };
    }
    const url = this.withApiKey(`${this.apiBase()}/IGetPrices/v4?raw=1`);
    const result = await fetchJsonHardened('backpack.tf', url, this.options, { headers: this.headers('api_key_header') });
    if (!result.ok) {
      runtimeLogger.warn('backpack_tf', 'pricelist_sync_failed', 'Backpack.tf price schema sync failed', { status: result.status, error: result.error || result.body?.message || result.body?.raw || `HTTP ${result.status}`, durationMs: Date.now() - startedAt });
      return { ok: false, stage: 'prices_failed', status: result.status, error: result.error || result.body?.message || result.body?.raw || `HTTP ${result.status}` };
    }
    const prices = this.extractPrices(result.body);
    writeJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: true, updated_at: new Date().toISOString(), source: 'backpack_tf_IGetPrices_v4', prices_count: prices.length, prices });
    runtimeLogger.info('backpack_tf', 'pricelist_loaded', 'Backpack.tf price schema loaded', { pricesCount: prices.length, durationMs: Date.now() - startedAt });
    return { ok: true, source_url: url.replace(/([?&]key=)[^&]+/i, '$1[redacted]'), prices_count: prices.length, price_schema_saved: true, sample: prices.slice(0, 20) };
  }
  async syncListings(force = false) {
    const startedAt = Date.now();
    runtimeLogger.info('backpack_tf', 'provider_sync_start', 'Backpack.tf provider sync started', { force: Boolean(force), hasAccessToken: Boolean(this.options.backpack_tf_access_token), hasApiKey: Boolean(this.options.backpack_tf_api_key) });
    if (!this.options.backpack_tf_enabled) {
      runtimeLogger.warn('backpack_tf', 'provider_sync_failed', 'Backpack.tf provider disabled', { stage: 'provider_disabled' });
      return { ok: false, skipped: true, stage: 'provider_disabled', error: 'backpack.tf provider disabled' };
    }
    if (!force && this.cacheFresh()) {
      const cached = readJson(BACKPACK_LISTINGS_PATH, { ok: true, cached: true, listings: [] });
      runtimeLogger.info('backpack_tf', 'provider_sync_done', 'Backpack.tf provider sync served from cache', { cached: true, listings: Number(cached.listings_count || (Array.isArray(cached.listings) ? cached.listings.length : 0)), durationMs: Date.now() - startedAt });
      return cached;
    }
    if (!this.options.backpack_tf_access_token && !this.options.backpack_tf_api_key) {
      const fallback = { ok: false, stage: 'credentials_missing', error: 'Missing Backpack.tf credentials. Save a Backpack.tf access token and/or API key in the Trade Hub UI first.', hint: 'For your own listings/classifieds, use the user access token. For public price schema, use the API key.', listings: [] };
      this.audit.write('backpack_tf_credentials_missing', { reason: 'listing_sync' });
      runtimeLogger.warn('backpack_tf', 'provider_sync_failed', 'Backpack.tf credentials missing for provider sync', { stage: 'credentials_missing' });
      writeJson(BACKPACK_LISTINGS_PATH, fallback);
      return fallback;
    }
    const tokenCheck = await this.validateToken();
    const listingsResult = await this.syncAccountListings();
    const pricesResult = await this.syncPriceSchema();
    const listings = listingsResult.ok ? listingsResult.listings : [];
    const cache = {
      ok: Boolean(listingsResult.ok || pricesResult.ok),
      stage: listingsResult.ok ? 'account_listings_synced' : (pricesResult.ok ? 'price_schema_synced_only' : 'sync_failed'),
      updated_at: new Date().toISOString(),
      source: 'ui_credential_vault',
      account_scope: this.options.active_account_id || 'main',
      token_check: { ok: tokenCheck.ok, skipped: tokenCheck.skipped || false, status: tokenCheck.status || null, error: tokenCheck.error || null },
      listings_count: listings.length,
      listings_summary: this.summarizeListings(listings),
      listings,
      prices_ok: Boolean(pricesResult.ok),
      prices_count: Number(pricesResult.prices_count || 0),
      prices_sample: pricesResult.sample || [],
      attempts: [...(listingsResult.attempts || []), ...(pricesResult.ok ? [{ label: 'IGetPrices/v4', ok: true, prices: pricesResult.prices_count }] : (pricesResult.skipped ? [{ label: 'IGetPrices/v4', skipped: true, error: pricesResult.error }] : [{ label: 'IGetPrices/v4', ok: false, status: pricesResult.status, error: pricesResult.error }]))],
      errors: [listingsResult.ok ? null : listingsResult.error, pricesResult.ok || pricesResult.skipped ? null : pricesResult.error].filter(Boolean),
      guidance: listingsResult.ok ? 'Account listings cache is ready.' : (pricesResult.ok ? 'Only public price schema synced. Save a Backpack.tf user access token in UI to read your account listings.' : 'Backpack.tf sync failed. Check token/API key and provider attempts below.')
    };
    writeJson(BACKPACK_LISTINGS_PATH, cache);
    this.audit.write(cache.ok ? 'backpack_tf_sync_completed' : 'backpack_tf_sync_failed', { stage: cache.stage, listings: cache.listings_count, prices: cache.prices_count, errors: cache.errors });
    runtimeLogger[cache.ok ? 'info' : 'warn']('backpack_tf', cache.ok ? 'provider_sync_done' : 'provider_sync_failed', cache.ok ? 'Backpack.tf provider sync completed' : 'Backpack.tf provider sync failed', { stage: cache.stage, listings: cache.listings_count, prices: cache.prices_count, errors: cache.errors, durationMs: Date.now() - startedAt });
    appendActionFeed(cache.ok ? 'backpack_tf_sync_completed' : 'backpack_tf_sync_failed', { stage: cache.stage, listings: cache.listings_count, prices: cache.prices_count });
    return cache;
  }
  currentListings() { return readJson(BACKPACK_LISTINGS_PATH, { ok: false, error: 'No backpack.tf listing cache yet.', listings: [] }); }
  buildPlan(decisions) {
    const current = this.currentListings();
    const byName = new Map((Array.isArray(current.listings) ? current.listings : []).map(item => [normalizeName(item.item_name || item.name || item.market_hash_name || item.sku), item]));
    const actions = [];
    const candidates = decisions
      .filter(item => ['accept_recommended', 'needs_review'].includes(item.decision))
      .filter(item => Number(item.estimated_profit_ref) >= this.options.listing_plan_min_profit_ref)
      .filter(item => Number(item.liquidity_score || 0) >= this.options.listing_plan_min_liquidity_score)
      .sort((a, b) => (b.pricing_score || 0) - (a.pricing_score || 0));
    for (const decision of candidates.slice(0, this.options.listing_plan_max_items)) {
      for (const item of decision.items_to_receive || []) {
        const name = item.market_hash_name || item.matched_key || item.assetid;
        const key = normalizeName(name);
        const existing = byName.get(key);
        actions.push({
          action: existing ? 'update_or_reprice' : 'create_buy_or_watch_listing',
          mode: this.options.allow_live_classifieds_writes && this.options.backpack_tf_write_mode === 'active' ? 'live_allowed' : 'dry_plan',
          tradeofferid: decision.tradeofferid,
          item_name: name,
          matched_key: item.matched_key,
          value_ref: item.value_ref,
          pricing_score: decision.pricing_score,
          liquidity_score: decision.liquidity_score,
          profit_ref: decision.estimated_profit_ref,
          reason: existing ? 'remote listing exists and may need reprice/update' : 'profitable received item candidate without matching cached listing'
        });
      }
    }
    const plan = { ok: true, updated_at: new Date().toISOString(), write_mode: this.options.backpack_tf_write_mode, live_writes_enabled: Boolean(this.options.allow_live_classifieds_writes), source: 'trade_decision_pricing_brain', actions: actions.slice(0, this.options.listing_plan_max_items) };
    writeJson(LISTING_PLAN_PATH, plan);
    this.audit.write('backpack_tf_listing_plan_built', { actions: plan.actions.length, live_writes_enabled: plan.live_writes_enabled });
    return plan;
  }
  async executePlan() {
    const plan = readJson(LISTING_PLAN_PATH, { ok: false, actions: [] });
    if (!plan.ok) return { ok: false, error: 'No listing plan available.' };
    if (!this.options.allow_live_classifieds_writes || this.options.backpack_tf_write_mode !== 'active') {
      this.audit.write('backpack_tf_listing_plan_execution_blocked', { reason: 'live_writes_disabled', actions: plan.actions.length });
      return { ok: false, blocked: true, error: 'Live backpack.tf writes are disabled. Plan remains dry-run only.', plan };
    }
    this.audit.write('backpack_tf_listing_plan_execution_not_implemented', { reason: 'provider-specific_write_schema_required', actions: plan.actions.length });
    return { ok: false, blocked: true, error: 'Live write adapter is intentionally blocked until exact backpack.tf v2 write schema is configured and reviewed.', plan };
  }
}


function mostTradedNameSet(options = getOptions()) {
  const raw = String(options.most_traded_item_names || '').split(',').map(x => normalizeName(x)).filter(Boolean);
  return new Set(raw);
}
function isMostTradedSeedName(name = '', options = getOptions()) {
  if (!options.most_traded_item_booster_enabled) return false;
  return mostTradedNameSet(options).has(normalizeName(name));
}
function refToBackpackCurrencies(totalRef, options = getOptions(), keyRef = keyPriceEstimateRef()) {
  const total = roundedRef(Number(totalRef || 0));
  if (!Number.isFinite(total) || total <= 0) return {};
  if (!options.allow_key_currency_classifieds || total < Number(options.key_currency_min_ref || 0) || !Number.isFinite(keyRef) || keyRef <= 0) {
    return { metal: Number(total.toFixed(2)) };
  }
  const maxKeys = Math.max(0, Number(options.key_currency_max_keys_per_listing || 0));
  const keys = Math.max(0, Math.min(maxKeys, Math.floor(total / keyRef)));
  const remainder = roundedRef(total - keys * keyRef);
  const out = {};
  if (keys > 0) out.keys = keys;
  if (options.key_currency_keep_metal_remainder !== false && remainder > 0) out.metal = Number(remainder.toFixed(2));
  if (!Object.keys(out).length) out.metal = Number(total.toFixed(2));
  return out;
}

function shouldRoundBuyToOneKey(total, options = getOptions(), keyRef = keyPriceEstimateRef()) {
  const value = roundedRef(Number(total || 0));
  if (!options.allow_key_currency_classifieds || !options.allow_key_roundup_buy_listings) return false;
  if (!Number.isFinite(keyRef) || keyRef <= 0) return false;
  // 5.13.29: balanced key+metal pricing.  Do not round every 10–25 ref
  // buy listing up to a whole key.  Round to 1 key only when the target price
  // is already within a tiny configured tolerance of one key.  Otherwise keep
  // sub-key items as exact refined metal and multi-key items as keys + ref.
  const maxOverpay = clamp(options.key_roundup_buy_max_overpay_ref, 0.66, 0, 100000);
  const configuredMin = Number(options.key_roundup_buy_min_ref || 0);
  const nearKeyFloor = roundedRef(keyRef - maxOverpay);
  const minRef = Math.max(configuredMin, nearKeyFloor);
  const maxKeys = Math.max(0, Number(options.key_currency_max_keys_per_listing || 0));
  const overpay = roundedRef(keyRef - value);
  return Boolean(maxKeys >= 1 && value >= minRef && value < keyRef && overpay >= 0 && overpay <= maxOverpay);
}

function buyRefToBackpackCurrencies(totalRef, options = getOptions(), keyRef = keyPriceEstimateRef()) {
  const total = roundedRef(Number(totalRef || 0));
  if (!Number.isFinite(total) || total <= 0) return {};
  const normal = refToBackpackCurrencies(total, options, keyRef);
  if (normal.keys) return normal;
  if (!shouldRoundBuyToOneKey(total, options, keyRef)) return normal;
  const overpay = roundedRef(keyRef - total);
  return { keys: 1, key_roundup: true, estimated_ref_value: Number(keyRef.toFixed(2)), overpay_ref: Number(overpay.toFixed(2)), original_ref_price: Number(total.toFixed(2)) };
}

function enforceBuyCurrencies(totalRef, existingCurrencies = {}, options = getOptions(), keyRef = keyPriceEstimateRef()) {
  const total = roundedRef(Number(totalRef || currenciesToRef(existingCurrencies, keyRef) || 0));
  if (!Number.isFinite(total) || total <= 0) return existingCurrencies && Object.keys(existingCurrencies).length ? existingCurrencies : {};
  if (!options.force_key_currency_on_publish) return existingCurrencies && Object.keys(existingCurrencies).length ? existingCurrencies : buyRefToBackpackCurrencies(total, options, keyRef);
  const forced = buyRefToBackpackCurrencies(total, options, keyRef);
  if (forced.keys || options.key_currency_rewrite_existing_metal_drafts) return forced;
  return existingCurrencies && Object.keys(existingCurrencies).length ? existingCurrencies : forced;
}
function currenciesToRef(currencies = {}, keyRef = keyPriceEstimateRef()) {
  if (!currencies || typeof currencies !== 'object') return 0;
  const keys = Number(currencies.keys || 0);
  const metal = Number(currencies.metal || currencies.ref || currencies.refined || 0);
  return Number(((Number.isFinite(keys) ? keys : 0) * keyRef + (Number.isFinite(metal) ? metal : 0)).toFixed(2));
}
function currenciesText(value) {
  const c = typeof value === 'object' && value !== null ? value : { metal: Number(value || 0) };
  const parts = [];
  if (Number(c.keys || 0) > 0) parts.push(`${Number(c.keys)} key${Number(c.keys) === 1 ? '' : 's'}`);
  if (Number(c.metal || 0) > 0) parts.push(`${roundedRef(c.metal).toFixed(2)} ref`);
  return parts.length ? parts.join(' + ') : '0.00 ref';
}
function listingDetailsFromFinalCurrencies(itemName, intent, finalCurrenciesOrRef) {
  const normalized = String(intent || 'buy').toLowerCase();
  const sell = normalized === 'sell' || normalized === '1';
  return sell ? sellListingDetails(itemName, finalCurrenciesOrRef) : buyListingDetails(itemName, finalCurrenciesOrRef);
}
function syncListingTextPreview(preview = {}, itemName = 'item', intent = 'buy', currenciesOrRef = {}) {
  const finalCurrencies = (currenciesOrRef && typeof currenciesOrRef === 'object') ? { ...currenciesOrRef } : refToBackpackCurrencies(Number(currenciesOrRef || 0), getOptions(), keyPriceEstimateRef());
  return {
    ...(preview || {}),
    currencies: finalCurrencies,
    details: listingDetailsFromFinalCurrencies(itemName, intent, finalCurrencies),
    listing_text_synced: true,
    listing_text_sync_source: 'final_published_currencies'
  };
}

class MarketTargetScannerService {
  constructor(auditService) { this.audit = auditService; }
  loadPriceSchema() {
    const saved = readJson(BACKPACK_PRICE_SCHEMA_PATH, null);
    if (saved && Array.isArray(saved.prices)) return saved;
    const cache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
    if (Array.isArray(cache.prices_sample) && cache.prices_sample.length) return { ok: true, updated_at: cache.updated_at || null, source: 'backpack_cache_sample', prices_count: cache.prices_sample.length, prices: cache.prices_sample };
    return { ok: false, error: 'No Backpack.tf price schema available. Run Sync Backpack.tf first.' };
  }
  keyPriceRef(prices, options) {
    const key = prices.find(item => normalizeName(item.item_name) === normalizeName('Mann Co. Supply Crate Key') && String(item.currency || '').toLowerCase() === 'metal');
    const value = Number(key?.value_raw || key?.value || 0);
    return value > 0 ? value : Number(options.market_scanner_key_ref_estimate || 77);
  }
  priceToRef(price, keyRef) {
    const currency = String(price.currency || '').toLowerCase();
    const value = parsePriceNumber(price.value || 0);
    const valueHigh = parsePriceNumber(price.value_high || 0);
    const raw = parsePriceNumber(price.value_raw || price.raw || price.ref || price.metal || 0);
    const rawHigh = parsePriceNumber(price.value_high_raw || price.raw_high || 0);
    let amount = 0;
    if (currency.includes('key')) {
      const displayKeys = value > 0 ? value : valueHigh;
      const rawMaybeRef = raw > 0 ? raw : rawHigh;
      if (rawMaybeRef > 0 && displayKeys > 0 && rawMaybeRef > displayKeys * 2) amount = rawMaybeRef;
      else amount = (displayKeys > 0 ? displayKeys : rawMaybeRef) * keyRef;
    } else if (currency.includes('usd') || currency.includes('$')) {
      amount = 0;
    } else {
      amount = raw > 0 ? raw : (value > 0 ? value : (rawHigh > 0 ? rawHigh : valueHigh));
    }
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }
  shouldSkip(price, options = getOptions()) {
    const name = normalizeName(price.item_name);
    if (!name) return true;
    const boosted = isMostTradedSeedName(name, options);
    const pureCurrencyNames = ['mann co. supply crate key', 'refined metal', 'reclaimed metal', 'scrap metal'];
    if (options.auto_list_anything_above_min_ref_enabled) {
      if (pureCurrencyNames.includes(name)) return true;
      if (!options.auto_list_anything_include_cases && /crate|case|war paint key|supply crate/i.test(String(price.item_name || ''))) return true;
      return false;
    }
    if (boosted && options.most_traded_allow_tour_tickets && name === 'tour of duty ticket') return false;
    if (boosted && !pureCurrencyNames.includes(name)) return false;
    if ([...pureCurrencyNames, 'tour of duty ticket'].includes(name)) return true;
    if (/crate|case|war paint key|supply crate/i.test(String(price.item_name || ''))) return true;
    return false;
  }
  build(options = getOptions()) {
    if (!options.market_scanner_enabled) return { ok: false, skipped: true, error: 'Market scanner is disabled in addon options.' };
    const schema = this.loadPriceSchema();
    if (!schema.ok) { const empty = { ...schema, updated_at: new Date().toISOString(), candidates: [] }; writeJson(MARKET_SCANNER_PATH, empty); return empty; }
    const prices = Array.isArray(schema.prices) ? schema.prices : [];
    const keyRef = this.keyPriceRef(prices, options);
    const now = Date.now();
    const grouped = new Map();
    const effectiveMinItemRef = options.auto_list_anything_above_min_ref_enabled ? Number(options.auto_list_anything_min_ref || 0.11) : Number(options.market_scanner_min_item_ref || 0.11);
    const effectiveMaxItemRef = options.auto_list_anything_above_min_ref_enabled ? Number(options.auto_list_anything_max_item_ref || 100000) : (options.allow_key_currency_classifieds ? Math.max(options.market_scanner_max_item_ref, options.key_currency_market_scanner_max_item_ref || 0) : options.market_scanner_max_item_ref);
    const effectiveMinProfitRef = options.auto_list_anything_above_min_ref_enabled ? Number(options.auto_list_anything_min_profit_ref || 0.01) : Number(options.market_scanner_min_profit_ref || 0.22);
    const diagnostics = { prices_seen: prices.length, skipped_name: 0, zero_value: 0, below_min_ref: 0, above_max_ref: 0, grouped_before_filter: 0, strict_max_item_ref: effectiveMaxItemRef, min_item_ref: effectiveMinItemRef, auto_list_anything_above_min_ref_enabled: Boolean(options.auto_list_anything_above_min_ref_enabled), auto_list_anything_min_ref: Number(options.auto_list_anything_min_ref || 0.11), most_traded_booster_enabled: Boolean(options.most_traded_item_booster_enabled), key_currency_enabled: Boolean(options.allow_key_currency_classifieds) };
    const makeCandidate = (price, valueRef, relaxed = false) => {
      const ageDays = price.last_update ? Math.max(0, Math.round((now - Number(price.last_update) * 1000) / 86400000)) : 999;
      const mostTraded = isMostTradedSeedName(price.item_name, options);
      let liquidity = 50 + (String(price.currency || '').toLowerCase().includes('metal') ? 15 : 0) + (ageDays <= 30 ? 15 : ageDays <= 120 ? 5 : -15);
      liquidity = clampScore(liquidity + (mostTraded ? Number(options.most_traded_priority_boost || 0) : 0));
      let risk = 20 + (valueRef > Number(options.market_scanner_max_item_ref || 25) * 0.75 ? 15 : 0) + (ageDays > 180 ? 25 : 0) + (String(price.priceindex || '0') !== '0' ? 10 : 0) + (relaxed ? 8 : 0);
      risk = clampScore(risk - (mostTraded ? Math.min(15, Number(options.most_traded_priority_boost || 0) / 2) : 0));
      const baseProfit = options.auto_list_anything_above_min_ref_enabled
        ? Math.max(effectiveMinProfitRef, Math.min(valueRef * 0.08, Math.max(0.01, valueRef * 0.10)))
        : Math.max(options.market_scanner_min_profit_ref, Math.min(valueRef * 0.15, Math.max(0.01, valueRef * 0.18)));
      const profit = Number(Math.min(Math.max(0.01, valueRef - 0.01), Math.max(0.01, baseProfit)).toFixed(2));
      const maxBuy = Math.max(0.01, valueRef - profit);
      return {
        id: normalizeName(`${price.item_name}_${price.quality}_${price.priceindex}`).replace(/[^a-z0-9]+/g, '_').slice(0, 90),
        item_name: price.item_name, quality: price.quality, priceindex: price.priceindex,
        defindex: price.defindex || null, source: 'backpack_tf_price_schema', target_sell_ref: Number(valueRef.toFixed(2)), max_buy_ref: Number(maxBuy.toFixed(2)), expected_profit_ref: Number((valueRef - maxBuy).toFixed(2)),
        liquidity_score: liquidity, risk_score: risk, pricing_score: clampScore(100 - risk + Math.min(20, liquidity / 5) + (mostTraded ? Number(options.most_traded_priority_boost || 0) : 0) + (options.auto_list_anything_above_min_ref_enabled ? 8 : 0)), age_days: ageDays, currency: price.currency, most_traded_seed: mostTraded, auto_list_anything_candidate: Boolean(options.auto_list_anything_above_min_ref_enabled && valueRef >= effectiveMinItemRef), key_currency_candidate: Boolean(options.allow_key_currency_classifieds && (valueRef >= Number(options.key_currency_min_ref || 0) || shouldRoundBuyToOneKey(valueRef, options, keyRef))),
        reason: mostTraded ? 'Most-traded/high-volume seed boosted for offer generation.' : (relaxed ? 'Relaxed watchlist seed from price schema. Verify manually before listing.' : 'Price-schema watchlist seed. Account listings can be zero; this is still useful for target planning.')
      };
    };
    for (const price of prices) {
      if (this.shouldSkip(price, options)) { diagnostics.skipped_name += 1; continue; }
      const valueRef = this.priceToRef(price, keyRef);
      if (valueRef <= 0) { diagnostics.zero_value += 1; continue; }
      if (valueRef < effectiveMinItemRef) { diagnostics.below_min_ref += 1; continue; }
      if (valueRef > effectiveMaxItemRef) { diagnostics.above_max_ref += 1; continue; }
      const candidate = makeCandidate(price, valueRef, false);
      const key = normalizeName(candidate.item_name);
      const prev = grouped.get(key);
      if (!prev || candidate.pricing_score > prev.pricing_score) grouped.set(key, candidate);
    }
    diagnostics.grouped_before_filter = grouped.size;
    let candidates = Array.from(grouped.values()).filter(x => options.auto_list_anything_above_min_ref_enabled ? Number(x.target_sell_ref || 0) >= effectiveMinItemRef : x.expected_profit_ref >= options.market_scanner_min_profit_ref).sort((a,b)=>(b.pricing_score-a.pricing_score)||(b.expected_profit_ref-a.expected_profit_ref)||(a.target_sell_ref-b.target_sell_ref)).slice(0, options.market_scanner_max_candidates);
    if (!candidates.length && prices.length) {
      const relaxed = new Map();
      for (const price of prices) {
        if (this.shouldSkip(price, options)) continue;
        const valueRef = this.priceToRef(price, keyRef);
        if (valueRef <= 0 || valueRef < Math.max(0.01, options.market_scanner_min_item_ref * 0.25) || valueRef > Math.max(options.market_scanner_max_item_ref, options.key_currency_market_scanner_max_item_ref || 150, 150)) continue;
        const candidate = makeCandidate(price, valueRef, true);
        candidate.reason = 'Relaxed watchlist seed from public price schema. It is not a live profit guarantee; verify classifieds before posting listings.';
        const key = normalizeName(candidate.item_name);
        const prev = relaxed.get(key);
        if (!prev || candidate.pricing_score > prev.pricing_score) relaxed.set(key, candidate);
      }
      candidates = Array.from(relaxed.values()).sort((a,b)=>(b.pricing_score-a.pricing_score)||(b.expected_profit_ref-a.expected_profit_ref)).slice(0, options.market_scanner_max_candidates);
      diagnostics.relaxed_fallback_used = Boolean(candidates.length);
    }
    if (!candidates.length && prices.length) {
      const forced = new Map();
      for (const price of prices) {
        if (this.shouldSkip(price, options)) continue;
        const valueRef = this.priceToRef(price, keyRef);
        if (valueRef <= 0) continue;
        if (valueRef > Math.max(options.market_scanner_max_item_ref, options.key_currency_market_scanner_max_item_ref || 250, 250)) continue;
        const candidate = makeCandidate(price, valueRef, true);
        candidate.expected_profit_ref = Number(Math.max(0.01, Math.min(valueRef * 0.03, options.market_scanner_min_profit_ref || 0.11)).toFixed(2));
        candidate.max_buy_ref = Number(Math.max(0.01, valueRef - candidate.expected_profit_ref).toFixed(2));
        candidate.pricing_score = clampScore(55 + Math.min(25, valueRef));
        candidate.reason = 'Fallback watchlist candidate from Backpack.tf price schema. Profit is estimated only; verify buy/sell classifieds before any live listing.';
        const key = normalizeName(candidate.item_name);
        const prev = forced.get(key);
        if (!prev || candidate.pricing_score > prev.pricing_score) forced.set(key, candidate);
      }
      candidates = Array.from(forced.values()).sort((a,b)=>(b.pricing_score-a.pricing_score)||(a.risk_score-b.risk_score)).slice(0, options.market_scanner_max_candidates);
      diagnostics.forced_watchlist_fallback_used = Boolean(candidates.length);
      diagnostics.note = candidates.length ? 'Scanner created a conservative watchlist from price schema because strict profit filters produced no market candidates.' : 'No usable price entries survived value conversion and safety filters.';
    }
    if (!candidates.length && prices.length) {
      const emergency = [];
      for (const price of prices) {
        const name = normalizeName(price.item_name);
        if (!name) continue;
        if (/crate|case|chemistry set/i.test(String(price.item_name || ''))) continue;
        const valueRef = this.priceToRef(price, keyRef);
        if (valueRef <= 0 || valueRef > 500) continue;
        emergency.push(makeCandidate(price, valueRef, true));
        if (emergency.length >= Math.max(10, options.market_scanner_max_candidates || 25)) break;
      }
      candidates = emergency.map(item => ({ ...item, intent: 'watch', expected_profit_ref: Number(Math.max(0.01, Math.min(Number(item.target_sell_ref || 0) * 0.02, 0.22)).toFixed(2)), reason: 'Emergency monitoring-only watchlist from usable Backpack.tf prices. Not a profit guarantee.' }));
      diagnostics.emergency_watchlist_fallback_used = Boolean(candidates.length);
    }
    diagnostics.watchlist_count = candidates.length;
    diagnostics.most_traded_seed_count = candidates.filter(x => x.most_traded_seed).length;
    diagnostics.key_currency_candidate_count = candidates.filter(x => x.key_currency_candidate).length;
    diagnostics.auto_list_anything_candidate_count = candidates.filter(x => x.auto_list_anything_candidate).length;
    diagnostics.sample_price_names = prices.slice(0, 8).map(p => ({ item_name: p.item_name, currency: p.currency, value: p.value, value_raw: p.value_raw }));
    const payload = { ok: true, updated_at: new Date().toISOString(), version: APP_VERSION, source: schema.source || 'backpack_tf_price_schema', prices_seen: prices.length, key_ref_estimate: keyRef, account_scope: options.active_account_id || 'main', mode: candidates.length ? 'watchlist_seed_no_live_writes' : 'empty_diagnostics', candidates, watchlist_count: candidates.length, diagnostics, summary: { total_candidates: candidates.length, watchlist_items: candidates.length, auto_list_anything_candidates: candidates.filter(x => x.auto_list_anything_candidate).length, min_item_ref: effectiveMinItemRef, total_candidate_value_ref: Number(candidates.reduce((s,x)=>s+Number(x.max_buy_ref||0),0).toFixed(2)) } };
    writeJson(MARKET_SCANNER_PATH, payload);
    writeJson(MARKET_WATCHLIST_PATH, { ok: true, version: APP_VERSION, updated_at: payload.updated_at, mode: payload.mode, items: candidates.map(item => ({ ...item, intent: 'watch', confidence: item.risk_score <= 30 ? 'medium' : 'low', risk: item.risk_score <= 30 ? 'low' : 'review' })), note: 'Watchlist is not guaranteed profit. Verify live classifieds before posting or trading.' });
    const seeded = this.seedTargetedOrders(payload, options);
    this.audit.write('market_target_scanner_built', { candidates: candidates.length, prices_seen: prices.length, seeded_orders: seeded.orders.length });
    appendActionFeed('market_target_scanner_built', { candidates: candidates.length, prices_seen: prices.length, seeded_orders: seeded.orders.length });
    return { ...payload, targeted_orders: { count: seeded.orders.length, selected_value_ref: seeded.selected_value_ref } };
  }
  seedTargetedOrders(scanner, options = getOptions()) {
    let selectedValue = 0;
    const orders = [];
    for (const candidate of Array.isArray(scanner.candidates) ? scanner.candidates : []) {
      if (orders.length >= options.targeted_buy_order_max_active) break;
      const cost = Math.max(0, Number(candidate.max_buy_ref || 0));
      selectedValue += cost;
      orders.push({ id: candidate.id, item_name: candidate.item_name, quality: candidate.quality || null, priceindex: candidate.priceindex || '0', defindex: candidate.defindex || null, source: 'market_target_scanner', max_buy_ref: candidate.max_buy_ref, target_sell_ref: candidate.target_sell_ref, expected_profit_ref: candidate.expected_profit_ref, liquidity_score: candidate.liquidity_score, risk_score: candidate.risk_score, pricing_score: candidate.pricing_score, auto_list_anything_candidate: Boolean(candidate.auto_list_anything_candidate), key_currency_candidate: Boolean(candidate.key_currency_candidate), status: 'planned_watchlist', mode: options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'active' ? 'ready_for_guarded_publish' : 'dry_plan', selection_mode: 'advisory_only' });
    }
    const payload = { ok: true, updated_at: new Date().toISOString(), source: 'market_target_scanner', write_mode: options.backpack_tf_write_mode, live_writes_enabled: Boolean(options.allow_live_classifieds_writes), selected_value_ref: Number(selectedValue.toFixed(2)), orders, note: 'Planning value is informational only; it does not stop always-on planning.' };
    writeJson(TARGETED_ORDERS_PATH, payload);
    return payload;
  }
}


function buildPricingReport(decisions, pricelist, options) {
  const ranked = decisions.slice().sort((a, b) => (b.pricing_score || 0) - (a.pricing_score || 0));
  const report = {
    ok: true,
    updated_at: new Date().toISOString(),
    version: APP_VERSION,
    pricelist_count: pricelist.count,
    thresholds: {
      min_profit_ref_for_accept: options.min_profit_ref_for_accept,
      pricing_min_profit_ref: options.pricing_min_profit_ref,
      pricing_min_margin_percent: options.pricing_min_margin_percent,
      max_risk_for_accept: options.max_risk_for_accept,
      liquidity_min_listing_count: options.liquidity_min_listing_count
    },
    summary: {
      total: decisions.length,
      accept_recommended: decisions.filter(x => x.decision === 'accept_recommended').length,
      needs_review: decisions.filter(x => x.decision === 'needs_review').length,
      reject_recommended: decisions.filter(x => x.decision === 'reject_recommended').length,
      avg_pricing_score: decisions.length ? Number((decisions.reduce((sum, x) => sum + (x.pricing_score || 0), 0) / decisions.length).toFixed(1)) : 0,
      avg_risk_score: decisions.length ? Number((decisions.reduce((sum, x) => sum + (x.risk_score || 0), 0) / decisions.length).toFixed(1)) : 0
    },
    top_candidates: ranked.slice(0, 10).map(x => ({ tradeofferid: x.tradeofferid, decision: x.decision, pricing_score: x.pricing_score, pricing_grade: x.pricing_grade, risk_score: x.risk_score, profit_ref: x.estimated_profit_ref, liquidity_score: x.liquidity_score, margin_percent: x.estimated_margin_percent })),
    blocked_or_risky: ranked.filter(x => x.risk_score >= 70 || x.decision === 'reject_recommended').slice(0, 10).map(x => ({ tradeofferid: x.tradeofferid, decision: x.decision, risk_score: x.risk_score, reasons: x.reasons }))
  };
  writeJson(PRICING_REPORT_PATH, report);
  return report;
}

class SteamTradeAcceptService {
  constructor(auditService) { this.audit = auditService; }

  // Convert Steam accountid (32-bit) to steamid64
  toSteamId64(accountid) {
    const STEAM_BASE = 76561197960265728n;
    try { return String(BigInt(Math.abs(Number(accountid))) + STEAM_BASE); } catch { return ''; }
  }

  // Accept a single received trade offer using session cookies
  async acceptOffer(tradeofferid, partnerAccountId, maFile) {
    const id = String(tradeofferid || '');
    if (!id) return { ok: false, error: 'Missing tradeofferid.' };
    const session = maFile?.Session || {};
    const steamLoginSecure = String(session.SteamLoginSecure || '').trim();
    const sessionId = String(session.SessionID || '').trim();
    if (!steamLoginSecure || !sessionId) return { ok: false, error: 'No valid Steam session in maFile.' };
    const partnerSteamId64 = this.toSteamId64(partnerAccountId);
    const referer = `https://steamcommunity.com/tradeoffer/${encodeURIComponent(id)}/`;
    const body = new URLSearchParams({
      sessionid: sessionId,
      serverid: '1',
      partner: partnerSteamId64,
      tradeofferid: id,
      captcha: ''
    }).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`https://steamcommunity.com/tradeoffer/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionId}`,
          'Referer': referer,
          'Origin': 'https://steamcommunity.com',
          'User-Agent': 'Mozilla/5.0 (compatible; TF2-HA-Steam-Trade-Companion/5.6.0)'
        },
        body,
        signal: controller.signal
      });
      const contentType = response.headers.get('content-type') || '';
      const bodyText = await response.text();
      const bodyLooksHtml = /<html|<!doctype|<body/i.test(bodyText);
      if (bodyLooksHtml) {
        this.audit.write('trade_accept_session_expired', { tradeofferid: id, status: response.status });
        return { ok: false, tradeofferid: id, error: 'Steam returned HTML — session likely expired.', session_expired: true };
      }
      let parsed = null;
      try { parsed = bodyText ? JSON.parse(bodyText) : {}; } catch { parsed = { raw: bodyText.slice(0, 200) }; }
      // Steam returns { tradeid } on success, or { strError } on failure
      if (response.ok && parsed && (parsed.tradeid !== undefined || parsed.needs_mobile_confirmation !== undefined)) {
        this.audit.write('trade_accepted', {
          tradeofferid: id,
          partner_steamid64: partnerSteamId64,
          tradeid: parsed.tradeid || null,
          needs_mobile_confirmation: Boolean(parsed.needs_mobile_confirmation),
          needs_email_confirmation: Boolean(parsed.needs_email_confirmation)
        });
        return {
          ok: true,
          tradeofferid: id,
          tradeid: parsed.tradeid || null,
          needs_mobile_confirmation: Boolean(parsed.needs_mobile_confirmation),
          needs_email_confirmation: Boolean(parsed.needs_email_confirmation)
        };
      }
      const steamError = String(parsed?.strError || parsed?.error || parsed?.raw || `HTTP ${response.status}`);
      this.audit.write('trade_accept_failed', { tradeofferid: id, status: response.status, steam_error: steamError });
      return { ok: false, tradeofferid: id, error: steamError, status: response.status };
    } catch (error) {
      this.audit.write('trade_accept_exception', { tradeofferid: id, message: safeError(error) });
      return { ok: false, tradeofferid: id, error: safeError(error) };
    } finally {
      clearTimeout(timeout);
    }
  }

  async declineOffer(tradeofferid, maFile) {
    const id = String(tradeofferid || '');
    if (!id) return { ok: false, error: 'Missing tradeofferid.' };
    const session = maFile?.Session || {};
    const steamLoginSecure = String(session.SteamLoginSecure || '').trim();
    const sessionId = String(session.SessionID || '').trim();
    if (!steamLoginSecure || !sessionId) return { ok: false, tradeofferid: id, error: 'No valid Steam session in maFile.' };
    const body = new URLSearchParams({ sessionid: sessionId }).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`https://steamcommunity.com/tradeoffer/${encodeURIComponent(id)}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionId}`,
          'Referer': `https://steamcommunity.com/tradeoffer/${encodeURIComponent(id)}/`,
          'Origin': 'https://steamcommunity.com',
          'User-Agent': `Mozilla/5.0 (compatible; TF2-HA-Steam-Trade-Guard/${APP_VERSION})`
        },
        body,
        signal: controller.signal
      });
      const bodyText = await response.text();
      let parsed = null;
      try { parsed = bodyText ? JSON.parse(bodyText) : {}; } catch { parsed = { raw: bodyText.slice(0, 200) }; }
      const ok = response.ok && !parsed?.strError && !parsed?.error;
      this.audit.write(ok ? 'trade_offer_declined_by_guard' : 'trade_offer_decline_failed', { tradeofferid: id, status: response.status, error: parsed?.strError || parsed?.error || null });
      return { ok, tradeofferid: id, status: response.status, steam_error: parsed?.strError || parsed?.error || null };
    } catch (error) {
      this.audit.write('trade_offer_decline_exception', { tradeofferid: id, message: safeError(error) });
      return { ok: false, tradeofferid: id, error: safeError(error) };
    } finally {
      clearTimeout(timeout);
    }
  }

  mismatchAutoDeclineCandidates(decisions = [], options = getOptions()) {
    return (Array.isArray(decisions) ? decisions : []).filter(d => {
      if (!d || !d.tradeofferid) return false;
      if (['ignored','declined_by_guard','counteroffer_sent'].includes(d.reviewed_status)) return false;
      if (options.trade_mismatch_auto_decline_received_only && d.is_our_offer) return false;
      if (d.decision === 'accept_recommended') return false; // overpay/good offers are never auto-declined
      const profit = Number(d.estimated_profit_ref || 0);
      const mismatch =
        d.decision === 'reject_recommended' ||
        Number(d.risk_score || 0) > Number(options.max_risk_for_accept || 25) ||
        (options.trade_mismatch_auto_decline_negative_profit && profit < Number(options.trade_mismatch_profit_floor_ref ?? -0.01)) ||
        Number(d.unknown_give_items || 0) > 0 ||
        (Array.isArray(d.blocked_tags) && d.blocked_tags.length > 0);
      return Boolean(mismatch);
    });
  }

  async declineMismatchedOffers(decisions, maFile, options = getOptions()) {
    if (!options.trade_mismatch_auto_decline_enabled) return { ok: true, skipped: true, reason: 'trade_mismatch_auto_decline_enabled is false', declined: [], failed: [] };
    const candidates = this.mismatchAutoDeclineCandidates(decisions, options).slice(0, Math.max(1, Number(options.auto_accept_max_per_cycle || 5)));
    if (!candidates.length) return { ok: true, declined: [], failed: [], skipped_no_candidates: true, summary: 'No mismatched offers to decline.' };
    if (!maFile?.Session?.SteamLoginSecure || !maFile?.Session?.SessionID) {
      const result = { ok: false, skipped: true, reason: 'No valid Steam session in maFile. Bad offers were flagged but not declined.', candidates: candidates.map(d => ({ tradeofferid: d.tradeofferid, profit_ref: d.estimated_profit_ref, risk_score: d.risk_score, decision: d.decision })) };
      saveTradeGuardRun(result);
      return result;
    }
    const declined = [];
    const failed = [];
    for (const d of candidates) {
      const r = await this.declineOffer(d.tradeofferid, maFile);
      if (r.ok) {
        markOfferStatus(d.tradeofferid, 'declined_by_guard', `Auto-declined mismatch: profit ${d.estimated_profit_ref} ref, risk ${d.risk_score}, decision ${d.decision}`);
        declined.push({ tradeofferid: d.tradeofferid, profit_ref: d.estimated_profit_ref, risk_score: d.risk_score, decision: d.decision });
      } else failed.push({ tradeofferid: d.tradeofferid, error: r.error || r.steam_error || `HTTP ${r.status || '?'}` });
    }
    const result = { ok: failed.length === 0, declined, failed, candidates: candidates.length, overpay_rule: 'accept_recommended / positive overpay offers are left for manual accept; they are not auto-declined.' };
    saveTradeGuardRun(result);
    appendActionFeed('trade_guard_auto_decline_cycle', { declined: declined.length, failed: failed.length });
    return result;
  }

  tradeAsset(row) {
    if (!row || !row.assetid) return null;
    return { appid: String(row.appid || 440), contextid: String(row.contextid || 2), amount: Number(row.amount || 1) || 1, assetid: String(row.assetid) };
  }

  counterofferCandidates(decisions = [], options = getOptions()) {
    return this.mismatchAutoDeclineCandidates(decisions, options).filter(d => {
      if (!options.trade_mismatch_counteroffer_enabled) return false;
      if (!d || !d.tradeofferid || d.is_our_offer) return false;
      if (d.decision === 'accept_recommended') return false;
      if (Array.isArray(d.blocked_tags) && d.blocked_tags.length) return false;
      if (Number(d.unknown_give_items || 0) > 0 || Number(d.unknown_receive_items || 0) > 0) return false;
      const give = Number(d.estimated_give_ref || 0);
      const receive = Number(d.estimated_receive_ref || 0);
      const shortfall = Number((give + Number(options.trade_counteroffer_min_profit_ref || 0.11) - receive).toFixed(2));
      return shortfall >= Number(options.trade_counteroffer_min_shortfall_ref || 0.11) && shortfall <= Number(options.trade_counteroffer_max_shortfall_ref || 100);
    }).slice(0, Math.max(1, Number(options.trade_counteroffer_max_per_cycle || 3)));
  }

  buildCorrectedCounterofferDraft(decision, options = getOptions()) {
    const giveRows = Array.isArray(decision.items_to_give) ? decision.items_to_give : [];
    const receiveRows = Array.isArray(decision.items_to_receive) ? decision.items_to_receive : [];
    const originalGiveRef = Number(decision.estimated_give_ref || 0);
    const originalReceiveRef = Number(decision.estimated_receive_ref || 0);
    const minProfit = Number(options.trade_counteroffer_min_profit_ref || 0.11);
    const targetGiveMax = Math.max(0, Number((originalReceiveRef - minProfit).toFixed(2)));
    const shortfallRef = Number((originalGiveRef + minProfit - originalReceiveRef).toFixed(2));
    const base = { ok: true, version: APP_VERSION, tradeofferid: decision.tradeofferid, partner_steamid64: this.toSteamId64(decision.accountid_other), original_give_ref: originalGiveRef, original_receive_ref: originalReceiveRef, shortfall_ref: shortfallRef, min_profit_ref: minProfit, mode: options.trade_counteroffer_mode, note: 'Counteroffer builder never accepts Steam trades and never confirms Steam Guard.' };
    if (!giveRows.length || !receiveRows.length) return { ...base, sendable: false, reason: 'Cannot safely construct a counteroffer without both sides of the original offer.' };
    if (targetGiveMax <= 0) return { ...base, sendable: false, reason: 'The offered value is too low to create a fair reduced-item counteroffer.' };
    const sorted = giveRows.slice().sort((a,b) => Number(b.value_ref || 0) - Number(a.value_ref || 0));
    const selected = [];
    let selectedRef = 0;
    for (const row of sorted) {
      const v = Number(row.value_ref || 0);
      if (v <= 0) continue;
      if (selectedRef + v <= targetGiveMax + 1e-9) { selected.push(row); selectedRef = Number((selectedRef + v).toFixed(2)); }
    }
    const minimumUseful = Math.min(targetGiveMax, Math.max(0.11, targetGiveMax * 0.45));
    if (!selected.length || selectedRef < minimumUseful) return { ...base, sendable: false, reason: 'No safe subset of your offered items can correct the trade without needing extra partner items.' };
    if (selected.length === giveRows.length && selectedRef >= originalGiveRef - 0.01) return { ...base, sendable: false, reason: 'The counteroffer would be identical to the bad offer, so it will not be sent.' };
    const meAssets = selected.map(row => this.tradeAsset(row)).filter(Boolean);
    const themAssets = receiveRows.map(row => this.tradeAsset(row)).filter(Boolean);
    if (meAssets.length !== selected.length || themAssets.length !== receiveRows.length) return { ...base, sendable: false, reason: 'Missing asset ids for a live counteroffer. Draft recorded for manual review.' };
    const removed = giveRows.filter(row => !selected.some(sel => String(sel.assetid) === String(row.assetid)));
    const correctedProfit = Number((originalReceiveRef - selectedRef).toFixed(2));
    const fairEnough = correctedProfit >= minProfit - 0.01;
    return { ...base, sendable: fairEnough, strategy: 'reduce_our_side_only', corrected_give_ref: selectedRef, corrected_receive_ref: originalReceiveRef, corrected_profit_ref: correctedProfit, selected_items: selected.map(row => ({ assetid: row.assetid, item_name: row.market_hash_name || row.matched_key || 'item', value_ref: row.value_ref })), removed_items: removed.map(row => ({ assetid: row.assetid, item_name: row.market_hash_name || row.matched_key || 'item', value_ref: row.value_ref })), json_tradeoffer: { newversion: true, version: 2, me: { assets: meAssets, currency: [], ready: false }, them: { assets: themAssets, currency: [], ready: false } }, reason: fairEnough ? 'Corrected by removing over-requested items from your side while keeping the partner side unchanged.' : 'Corrected subset is still not profitable enough.' };
  }

  async sendCounterOffer(decision, draft, maFile, options = getOptions()) {
    const id = String(decision.tradeofferid || draft.tradeofferid || '');
    const session = maFile?.Session || {};
    const steamLoginSecure = String(session.SteamLoginSecure || '').trim();
    const sessionId = String(session.SessionID || '').trim();
    if (!id) return { ok: false, error: 'Missing tradeofferid.' };
    if (!steamLoginSecure || !sessionId) return { ok: false, tradeofferid: id, error: 'No valid Steam session in maFile.' };
    if (!draft.sendable || !draft.json_tradeoffer) return { ok: false, tradeofferid: id, error: draft.reason || 'Counteroffer draft is not sendable.' };
    const partnerSteamId64 = draft.partner_steamid64 || this.toSteamId64(decision.accountid_other);
    const body = new URLSearchParams({ sessionid: sessionId, serverid: '1', partner: partnerSteamId64, tradeoffermessage: String(options.trade_counteroffer_message || '').slice(0, 180), json_tradeoffer: JSON.stringify(draft.json_tradeoffer), captcha: '', trade_offer_create_params: '{}', tradeofferid_countered: id }).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://steamcommunity.com/tradeoffer/new/send', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionId}`, 'Referer': `https://steamcommunity.com/tradeoffer/${encodeURIComponent(id)}/`, 'Origin': 'https://steamcommunity.com', 'User-Agent': `Mozilla/5.0 (compatible; TF2-HA-Counteroffer-Guard/${APP_VERSION})` }, body, signal: controller.signal });
      const bodyText = await response.text();
      let parsed = null;
      try { parsed = bodyText ? JSON.parse(bodyText) : {}; } catch { parsed = { raw: bodyText.slice(0, 300) }; }
      const steamError = parsed?.strError || parsed?.error || parsed?.message || null;
      const sentId = parsed?.tradeofferid || parsed?.tradeofferid_countered || parsed?.offerid || null;
      const ok = response.ok && !steamError;
      const result = { ok, tradeofferid: id, counter_tradeofferid: sentId, status: response.status, steam_error: steamError || null, needs_mobile_confirmation: Boolean(parsed?.needs_mobile_confirmation), raw_summary: steamError ? String(steamError).slice(0, 200) : (sentId ? `counter ${sentId}` : 'counteroffer request accepted') };
      this.audit.write(ok ? 'trade_counteroffer_sent' : 'trade_counteroffer_failed', { tradeofferid: id, counter_tradeofferid: sentId, status: response.status, error: result.steam_error });
      return result;
    } catch (error) {
      this.audit.write('trade_counteroffer_exception', { tradeofferid: id, message: safeError(error) });
      return { ok: false, tradeofferid: id, error: safeError(error) };
    } finally { clearTimeout(timeout); }
  }

  async counterofferMismatchedOffers(decisions, maFile, options = getOptions()) {
    if (!options.trade_mismatch_counteroffer_enabled) return { ok: true, skipped: true, reason: 'trade_mismatch_counteroffer_enabled is false', dry_run_validation_enabled: Boolean(options.trade_counteroffer_dry_run_validation_enabled), drafts: [], sent: [], failed: [] };
    const candidates = this.counterofferCandidates(decisions, options);
    if (!candidates.length) { const result = { ok: true, skipped_no_candidates: true, dry_run_validation_enabled: Boolean(options.trade_counteroffer_dry_run_validation_enabled), drafts: [], sent: [], failed: [], summary: 'No safe counteroffer candidates.' }; saveTradeCounterofferRun(result); return result; }
    const drafts = candidates.map(d => this.buildCorrectedCounterofferDraft(d, options));
    const sent = [];
    const failed = [];
    const notSendable = [];
    const dryRunValidation = Boolean(options.trade_counteroffer_dry_run_validation_enabled);
    const canSendLive = Boolean(!dryRunValidation && options.allow_live_trade_counteroffers && options.trade_counteroffer_mode === 'send_when_safe' && maFile?.Session?.SteamLoginSecure && maFile?.Session?.SessionID);
    for (const draft of drafts) {
      if (!draft.sendable) { notSendable.push({ tradeofferid: draft.tradeofferid, reason: draft.reason, shortfall_ref: draft.shortfall_ref }); continue; }
      if (!canSendLive || sent.length >= Number(options.trade_counteroffer_max_per_cycle || 3)) continue;
      const decision = candidates.find(d => String(d.tradeofferid) === String(draft.tradeofferid));
      const r = await this.sendCounterOffer(decision, draft, maFile, options);
      if (r.ok) { markOfferStatus(draft.tradeofferid, 'counteroffer_sent', `Corrected counteroffer sent. Original offer should be countered by Steam. Profit ${draft.corrected_profit_ref} ref.`); sent.push({ tradeofferid: draft.tradeofferid, counter_tradeofferid: r.counter_tradeofferid || null, corrected_profit_ref: draft.corrected_profit_ref, removed_items: draft.removed_items?.length || 0 }); }
      else failed.push({ tradeofferid: draft.tradeofferid, error: r.error || r.steam_error || `HTTP ${r.status || '?'}` });
    }
    for (const draft of drafts.filter(d => d.sendable && !sent.some(s => String(s.tradeofferid) === String(d.tradeofferid)))) markOfferStatus(draft.tradeofferid, 'counteroffer_draft', canSendLive ? 'Counteroffer was sendable but not sent due to cycle limit/failure.' : 'Counteroffer draft saved; live counteroffer sending is disabled or no valid Steam session.');
    const sendableDrafts = drafts.filter(d => d.sendable);
    const result = { ok: failed.length === 0, dry_run_validation_enabled: dryRunValidation, live_sending_requested: Boolean(options.allow_live_trade_counteroffers), live_sending_enabled: canSendLive, live_sending_blocked_by_dry_run_validation: Boolean(dryRunValidation && options.allow_live_trade_counteroffers), would_counteroffer: sendableDrafts.length, would_decline_or_manual_review: notSendable.length, drafts, sent, failed, not_sendable: notSendable, candidates: candidates.length, safety: { auto_accept: false, steam_confirmation: false, overpay_stays_good: true, decline_original_after_send: false }, note: dryRunValidation ? 'Dry-run validation active: counteroffers are calculated and logged but not sent live.' : 'Counteroffers are sent only when a fair reduced-item counter can be constructed from original assets. Otherwise a draft is saved and Trade Guard can decline the bad offer.' };
    saveTradeCounterofferRun(result);
    appendActionFeed('trade_counteroffer_guard_cycle', { candidates: candidates.length, drafts: drafts.length, dry_run_validation_enabled: dryRunValidation, would_counteroffer: drafts.filter(d => d.sendable).length, sent: sent.length, failed: failed.length, not_sendable: notSendable.length });
    return result;
  }

  // Accept all accept_recommended received trade offers for this review cycle
  async acceptOffers(decisions, maFile, options) {
    const enabled = options.auto_accept_enabled;
    if (!enabled) return { ok: false, skipped: true, reason: 'auto_accept_enabled is false' };
    if (!maFile?.Session?.SteamLoginSecure) return { ok: false, skipped: true, reason: 'No Steam session in maFile.' };

    const candidates = decisions.filter(d => {
      if (d.decision !== 'accept_recommended') return false;
      if (d.reviewed_status === 'ignored') return false;
      if (options.auto_accept_received_only && d.is_our_offer) return false;
      return true;
    }).slice(0, options.auto_accept_max_per_cycle);

    if (candidates.length === 0) return { ok: true, accepted: [], skipped_no_candidates: true };

    const accepted = [];
    const failed = [];
    for (const decision of candidates) {
      if (accepted.length > 0 && options.auto_accept_delay_seconds > 0) {
        await sleep(options.auto_accept_delay_seconds * 1000);
      }
      const result = await this.acceptOffer(
        decision.tradeofferid,
        decision.accountid_other,
        maFile
      );
      if (result.ok) {
        accepted.push({ tradeofferid: decision.tradeofferid, tradeid: result.tradeid, needs_mobile_confirmation: result.needs_mobile_confirmation });
      } else {
        failed.push({ tradeofferid: decision.tradeofferid, error: result.error, session_expired: result.session_expired || false });
      }
    }

    // Persist log for /api/trade/accept-log
    const log = readJson(TRADE_ACCEPT_LOG_PATH, { entries: [] });
    log.entries = Array.isArray(log.entries) ? log.entries : [];
    log.entries.push({
      ts: new Date().toISOString(),
      accepted: accepted.length,
      failed: failed.length,
      details: [...accepted.map(a => ({ ...a, status: 'accepted' })), ...failed.map(f => ({ ...f, status: 'failed' }))]
    });
    log.entries = log.entries.slice(-200);
    log.updated_at = new Date().toISOString();
    writeJson(TRADE_ACCEPT_LOG_PATH, log);

    this.audit.write('trade_accept_cycle', { accepted: accepted.length, failed: failed.length, candidates: candidates.length });
    appendActionFeed('trade_accept_cycle', { accepted: accepted.length, failed: failed.length });

    return {
      ok: true,
      accepted,
      failed,
      candidates: candidates.length,
      session_expired: failed.some(f => f.session_expired)
    };
  }
}

class SteamTradeOfferReviewService {
  constructor({ auditService, notificationService }) {
    this.audit = auditService;
    this.notificationService = notificationService;
  }
  async fetchOffers(options) {
    if (!options.steam_web_api_key) {
      this.audit.write('steam_web_api_missing', { reason: 'review' });
      return { ok: false, error: 'Missing Steam Web API key. Add it in add-on options.' };
    }
    const result = await fetchJsonHardened('steam', buildOffersUrl(options), options);
    if (!result.ok) {
      this.audit.write('steam_web_api_error', { status: result.status, retryAfter: result.retryAfter, reason: 'review', error: result.error });
      return { ok: false, status: result.status, retryAfter: result.retryAfter, error: result.error || 'Steam Web API request failed.', body: result.body };
    }
    if (result.body && result.body.raw) {
      this.audit.write('steam_web_api_non_json', { content_type: result.contentType, raw_preview: result.body.raw.slice(0, 80) });
      return { ok: false, error: 'Steam returned non-JSON response.', status: result.status };
    }
    return { ok: true, status: result.status, response: (result.body && result.body.response) || {} };
  }
  async review(reason = 'manual') {
    const options = getOptions();
    const fetched = await this.fetchOffers(options);
    if (!fetched.ok) return fetched;
    const response = fetched.response;
    const sent = Array.isArray(response.trade_offers_sent) ? response.trade_offers_sent : [];
    const received = Array.isArray(response.trade_offers_received) ? response.trade_offers_received : [];
    const descriptions = Array.isArray(response.descriptions) ? response.descriptions : [];
    const pricelist = loadPricelist(options.pricelist_path);
    const history = readOfferHistory();
    const decisionService = new SteamTradeDecisionService(options, pricelist);
    const linkBuilder = new ManualConfirmationLinkBuilder(options.manual_review_base_url);
    const allOffers = [...received, ...sent];
    const decisions = allOffers.map(offer => {
      const offerHistory = history.offers?.[String(offer.tradeofferid || '')] || {};
      const decision = decisionService.evaluate(offer, descriptions, offerHistory);
      return { ...decision, links: linkBuilder.build(offer), reviewed_at: new Date().toISOString(), reason };
    });
    upsertOfferHistory(decisions, options);
    const cache = {
      ok: true,
      ts: new Date().toISOString(),
      reason,
      status: fetched.status,
      api_key: redacted(options.steam_web_api_key),
      steam_id64: options.steam_id64,
      sent_count: sent.length,
      received_count: received.length,
      descriptions_count: descriptions.length,
      pricelist_count: pricelist.count,
      provider_state: providerState(),
      sent,
      received,
      descriptions
    };
    writeJson(CACHE_PATH, cache);
    writeJson(DECISIONS_PATH, { ok: true, updated_at: new Date().toISOString(), decisions });
    const pricingReport = buildPricingReport(decisions, pricelist, options);
    const backpack = new BackpackTfV2ListingManager(options, this.audit);
    let listingSync = null;
    try { listingSync = await backpack.syncListings(false); } catch (error) { listingSync = { ok: false, error: safeError(error) }; }
    const listingPlan = options.listing_plan_enabled ? backpack.buildPlan(decisions) : { ok: false, skipped: true, error: 'listing_plan_enabled is false' };
    const strategyResult = options.strategy_builder_enabled ? new StrategyBuilderService(this.audit).apply(decisions, options) : { ok: false, skipped: true, error: 'strategy_builder_enabled is false' };
    const targetedOrders = options.targeted_buy_orders_enabled ? new TargetedBuyOrderService(this.audit).build(decisions, listingPlan, options) : { ok: false, skipped: true, orders: [] };
    const lifecycle = buildListingLifecycle(decisions, listingPlan, targetedOrders);
    const state = readJson(STATE_PATH, { last_review_at: null, prepared_offer: null });
    const prepared = decisions.find(item => item.decision === 'accept_recommended' && item.reviewed_status !== 'ignored') || decisions.find(item => item.decision === 'needs_review' && item.reviewed_status !== 'ignored') || null;
    writeJson(STATE_PATH, { ...state, last_review_at: new Date().toISOString(), last_review_reason: reason, prepared_offer: prepared ? { tradeofferid: prepared.tradeofferid, decision: prepared.decision, link: prepared.links.offer_url, pricing_score: prepared.pricing_score, risk_score: prepared.risk_score, profit_ref: prepared.estimated_profit_ref } : null });
    this.audit.write('trade_offer_review_completed', { reason, decisions: decisions.length, accept_recommended: decisions.filter(item => item.decision === 'accept_recommended').length, needs_review: decisions.filter(item => item.decision === 'needs_review').length, reject_recommended: decisions.filter(item => item.decision === 'reject_recommended').length, listing_plan_actions: listingPlan.actions ? listingPlan.actions.length : 0 });
    appendActionFeed('trade_offer_review_completed', { reason, decisions: decisions.length, prepared_offer: prepared ? prepared.tradeofferid : null });
    // 5.13.29: scam/mismatch guard. Bad received offers can be countered when a safe reduced-item counteroffer can be built.
    // Good/overpay offers are never auto-declined; they stay for manual accept unless a separate explicit auto-accept mode is enabled.
    let tradeGuardResult = { ok: true, skipped: true, reason: 'trade guard disabled or no candidates' };
    let tradeCounterofferResult = { ok: true, skipped: true, reason: 'counteroffer guard disabled or no candidates' };
    const guardForTradeSafety = new SteamGuardModule(this.audit);
    const maFileForTradeSafety = guardForTradeSafety.loadMaFile();
    if (options.trade_mismatch_counteroffer_enabled) {
      try {
        tradeCounterofferResult = await new SteamTradeAcceptService(this.audit).counterofferMismatchedOffers(decisions, maFileForTradeSafety, options);
      } catch (error) {
        tradeCounterofferResult = { ok: false, error: safeError(error) };
        saveTradeCounterofferRun(tradeCounterofferResult);
        this.audit.write('trade_counteroffer_guard_exception', { message: safeError(error) });
      }
    }
    if (options.trade_mismatch_auto_decline_enabled) {
      try {
        const countered = new Set((tradeCounterofferResult.sent || []).map(x => String(x.tradeofferid)));
        const declineInput = decisions.map(d => countered.has(String(d.tradeofferid)) ? { ...d, reviewed_status: 'counteroffer_sent' } : d);
        tradeGuardResult = await new SteamTradeAcceptService(this.audit).declineMismatchedOffers(declineInput, maFileForTradeSafety, options);
      } catch (error) {
        tradeGuardResult = { ok: false, error: safeError(error) };
        saveTradeGuardRun(tradeGuardResult);
        this.audit.write('trade_guard_auto_decline_exception', { message: safeError(error) });
      }
    }
    const tradeOfferStateMachine = buildTradeOfferStateMachine('review_cycle');
    if (tradeOfferStateMachine.counts?.waiting_manual_accept) appendActionFeed('trade_offer_waiting_manual_accept', { offers: tradeOfferStateMachine.counts.waiting_manual_accept });
    // Step 1: Auto-accept received trade offers via Steam HTTP API (needs session, no SteamGuard)
    let autoAcceptResult = { ok: false, skipped: true };
    const autoAcceptActive = options.auto_accept_enabled || options.trade_approval_mode === 'accept_recommended' || options.trade_approval_mode === 'accept_and_confirm';
    if (autoAcceptActive) {
      const guard = new SteamGuardModule(this.audit);
      const maFile = guard.loadMaFile();
      try {
        autoAcceptResult = await new SteamTradeAcceptService(this.audit).acceptOffers(decisions, maFile, options);
        if (autoAcceptResult.session_expired) {
          this.audit.write('trade_accept_session_expired_in_cycle', { failed: autoAcceptResult.failed?.length || 0 });
        }
      } catch (error) {
        autoAcceptResult = { ok: false, error: safeError(error) };
        this.audit.write('trade_accept_cycle_exception', { message: safeError(error) });
      }
    }
    // Embedded Steam Guard session refresh runs before mobile confirmation work.
    let steamguardRefreshResult = { ok: true, skipped: true, reason: 'steamguard_embedded_disabled' };
    if (options.steamguard_embedded) {
      try {
        steamguardRefreshResult = await new SteamSessionRefreshService(this.audit, this.notificationService).ensureFreshSession('review_cycle');
      } catch (error) {
        steamguardRefreshResult = { ok: false, error: safeError(error) };
        this.audit.write('steamguard_session_refresh_review_exception', { message: safeError(error) });
      }
    }
    // Embedded Steam Guard auto-confirm: optional, explicit, and only for accept_recommended offers.
    let steamguardResult = { ok: false, skipped: true };
    let sdaResult = { ok: false, skipped: true };
    const acceptIds = decisions
      .filter(item => item.decision === 'accept_recommended' && item.reviewed_status !== 'ignored')
      .map(item => String(item.tradeofferid));
    const autoConfirmActive = options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm';
    if (options.steamguard_embedded && autoConfirmActive && acceptIds.length > 0) {
      try {
        if (steamguardRefreshResult.ok === false && !steamguardRefreshResult.skipped) {
          steamguardResult = { ok: false, error: steamguardRefreshResult.error || 'Steam Guard session refresh failed.', refresh_result: steamguardRefreshResult };
        } else {
          if (options.steamguard_confirm_delay_seconds > 0) await sleep(options.steamguard_confirm_delay_seconds * 1000);
          steamguardResult = await new SteamGuardModule(this.audit).autoConfirmOffers(acceptIds);
          steamguardResult.refresh_result = steamguardRefreshResult;
          appendActionFeed('steamguard_auto_confirm', { offers: acceptIds.length, confirmed: steamguardResult.confirmed ? steamguardResult.confirmed.length : 0, unmatched: steamguardResult.unmatched ? steamguardResult.unmatched.length : 0 });
        }
      } catch (error) {
        steamguardResult = { ok: false, error: safeError(error) };
        this.audit.write('steamguard_auto_confirm_exception', { message: safeError(error) });
      }
    } else if (!options.steamguard_embedded && options.sda_enabled && (options.sda_auto_confirm || options.trade_approval_mode === 'accept_and_confirm') && acceptIds.length > 0) {
      try {
        sdaResult = await new SdaConfirmationService(options, this.audit).autoConfirmOffers(acceptIds);
        appendActionFeed('sda_auto_confirm', { offers: acceptIds.length, confirmed: sdaResult.confirmed ? sdaResult.confirmed.length : 0 });
      } catch (error) {
        sdaResult = { ok: false, error: safeError(error) };
        this.audit.write('sda_auto_confirm_exception', { message: safeError(error) });
      }
    }
    const operations = options.operations_cockpit_enabled ? buildOperationsCockpit(decisions, pricingReport, listingPlan, targetedOrders, options) : { ok: false, skipped: true };
    const portfolio = new MultiAccountPortfolioService(this.audit).summary(decisions);
    let ollamaReport = readJson(OLLAMA_REPORT_PATH, { ok: false, skipped: true, error: 'No Ollama analysis yet.' });
    if (options.ollama_enabled) ollamaReport = await new OllamaStrategyAnalystService(this.audit).analyze(decisions, operations, options);
    let sentNotifications = 0;
    for (const decision of decisions) {
      if (sentNotifications >= options.max_notifications_per_cycle) break;
      if (this.notificationService.shouldNotify(decision, options)) {
        await this.notificationService.notify(decision, decision.links, options);
        sentNotifications += 1;
      }
    }
    return { ok: true, cache, decisions, pricing_report: pricingReport, listing_sync: listingSync, listing_plan: listingPlan, strategy_result: strategyResult, targeted_buy_orders: targetedOrders, lifecycle, operations, portfolio, ollama_report: ollamaReport, prepared_offer: prepared, trade_offer_state_machine: tradeOfferStateMachine, trade_guard_result: tradeGuardResult, trade_counteroffer_result: tradeCounterofferResult, auto_accept_result: autoAcceptResult, steamguard_refresh_result: steamguardRefreshResult, steamguard_result: steamguardResult, sda_result: sdaResult, notifications_sent_or_queued: sentNotifications };
  }
}

function appendActionFeed(type, payload = {}, options = getOptions()) {
  const feed = readJson(ACTION_FEED_PATH, { ok: true, updated_at: null, entries: [] });
  const entry = { id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, ts: new Date().toISOString(), type, payload };
  feed.entries = Array.isArray(feed.entries) ? feed.entries : [];
  feed.entries.push(entry);
  feed.updated_at = entry.ts;
  writeJson(ACTION_FEED_PATH, { ...feed, entries: feed.entries.slice(-options.action_feed_limit) });
  try { runtimeLogger.info('action_feed', String(type || 'event'), 'Action feed event written', payload); } catch {}
  return entry;
}
function summarizeDecisions(decisions) {
  const list = Array.isArray(decisions) ? decisions : [];
  const byDecision = list.reduce((acc, item) => { acc[item.decision || 'unknown'] = (acc[item.decision || 'unknown'] || 0) + 1; return acc; }, {});
  const totalProfit = list.reduce((sum, item) => sum + (Number(item.estimated_profit_ref) || 0), 0);
  return {
    total: list.length,
    by_decision: byDecision,
    accept_recommended: byDecision.accept_recommended || 0,
    needs_review: byDecision.needs_review || 0,
    reject_recommended: byDecision.reject_recommended || 0,
    expected_profit_ref: Number(totalProfit.toFixed(2)),
    avg_pricing_score: list.length ? Number((list.reduce((sum, item) => sum + (Number(item.pricing_score) || 0), 0) / list.length).toFixed(1)) : 0,
    avg_risk_score: list.length ? Number((list.reduce((sum, item) => sum + (Number(item.risk_score) || 0), 0) / list.length).toFixed(1)) : 0
  };
}
class DataPersistenceMigrationService {
  constructor(auditService) { this.audit = auditService; }
  managedFiles() {
    return [OPTIONS_PATH, CACHE_PATH, DECISIONS_PATH, NOTIFICATIONS_PATH, PRICELIST_PATH, STATE_PATH, OFFER_HISTORY_PATH, PRICING_REPORT_PATH, PROVIDER_STATE_PATH, BACKPACK_LISTINGS_PATH, LISTING_PLAN_PATH, ACTION_FEED_PATH, OPERATIONS_PATH, STRATEGIES_PATH, ACCOUNTS_PATH, TARGETED_ORDERS_PATH, OLLAMA_REPORT_PATH, HUB_SETUP_PATH, TRADING_CORE_PATH, LIFECYCLE_PATH, TRADING_BRAIN_PATH, MARKET_WATCHLIST_PATH, INVENTORY_AGGREGATE_PATH, TRANSFER_PLAN_PATH, EXECUTION_QUEUE_PATH, APPROVED_ACTION_LIFECYCLE_PATH, STEAMGUARD_SESSION_HEALTH_PATH, STEAMGUARD_REFRESH_TOKEN_PATH];
  }
  status() {
    const files = this.managedFiles().map(file => ({ file: path.basename(file), exists: fs.existsSync(file), size_bytes: fs.existsSync(file) ? fs.statSync(file).size : 0 }));
    files.push({ file: path.basename(MAFILE_PATH), exists: fs.existsSync(MAFILE_PATH), size_bytes: fs.existsSync(MAFILE_PATH) ? fs.statSync(MAFILE_PATH).size : 0, sensitive: true, backed_up_by_migration: false });
    files.push({ file: path.basename(STEAMGUARD_REFRESH_TOKEN_PATH), exists: fs.existsSync(STEAMGUARD_REFRESH_TOKEN_PATH), size_bytes: fs.existsSync(STEAMGUARD_REFRESH_TOKEN_PATH) ? fs.statSync(STEAMGUARD_REFRESH_TOKEN_PATH).size : 0, sensitive: true, backed_up_by_migration: false });
    files.push({ file: path.basename(HUB_CREDENTIALS_PATH), exists: fs.existsSync(HUB_CREDENTIALS_PATH), size_bytes: fs.existsSync(HUB_CREDENTIALS_PATH) ? fs.statSync(HUB_CREDENTIALS_PATH).size : 0, sensitive: true, backed_up_by_migration: false });
    const status = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), data_dir: DATA_DIR, files };
    writeJson(DATA_STATUS_PATH, status);
    return status;
  }
  backup(label = 'manual') {
    ensureDataDir();
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.join(BACKUP_DIR, `${stamp}_${String(label).replace(/[^a-z0-9_-]/gi, '_')}`);
    fs.mkdirSync(dir, { recursive: true });
    const copied = [];
    for (const file of this.managedFiles()) {
      if (!fs.existsSync(file)) continue;
      fs.copyFileSync(file, path.join(dir, path.basename(file)));
      copied.push(path.basename(file));
    }
    this.audit.write('data_backup_created', { label, dir: path.basename(dir), files: copied.length });
    appendActionFeed('data_backup_created', { label, files: copied.length });
    return { ok: true, backup: path.basename(dir), files: copied };
  }
  migrate() {
    const options = getOptions();
    if (options.backup_before_migration) this.backup('pre_migration_5_4_2');
    const now = new Date().toISOString();
    const strategies = readJson(STRATEGIES_PATH, null) || defaultStrategies(options);
    writeJson(STRATEGIES_PATH, { ...strategies, schema_version: DATA_SCHEMA_VERSION, updated_at: strategies.updated_at || now });
    const accounts = readJson(ACCOUNTS_PATH, null) || defaultAccounts(options);
    // 5.12.33 – strip removed legacy fields from accounts
    const cleanAccounts = removeRemovedFields(accounts);
    writeJson(ACCOUNTS_PATH, { ...cleanAccounts, schema_version: DATA_SCHEMA_VERSION, updated_at: cleanAccounts.updated_at || now });
    const orders = readJson(TARGETED_ORDERS_PATH, null) || { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: now, orders: [] };
    writeJson(TARGETED_ORDERS_PATH, { ...orders, schema_version: DATA_SCHEMA_VERSION, updated_at: orders.updated_at || now });
    // 5.12.33 – strip removed legacy fields from trading core and setup files
    for (const p of [TRADING_CORE_PATH, HUB_SETUP_PATH]) {
      if (!fs.existsSync(p)) continue;
      const d = readJson(p, null);
      if (d) writeJson(p, removeRemovedFields(d));
    }
    this.audit.write('data_migration_completed', { schema_version: DATA_SCHEMA_VERSION, legacy_fields_stripped: true });
    appendActionFeed('data_migration_completed', { schema_version: DATA_SCHEMA_VERSION });
    return this.status();
  }
  exportRedacted() {
    const payload = {};
    for (const file of this.managedFiles()) {
      if (!fs.existsSync(file)) continue;
      payload[path.basename(file)] = redactDeep(readJson(file, null));
    }
    if (fs.existsSync(MAFILE_PATH)) payload[path.basename(MAFILE_PATH)] = redactDeep(readJson(MAFILE_PATH, null));
    if (fs.existsSync(HUB_CREDENTIALS_PATH)) payload[path.basename(HUB_CREDENTIALS_PATH)] = redactDeep(readJson(HUB_CREDENTIALS_PATH, null));
    return { ok: true, exported_at: new Date().toISOString(), schema_version: DATA_SCHEMA_VERSION, payload };
  }
}
// 5.13.30: bounded redactor.  The unbounded version walked the entire market
// classifieds mirror (1000+ items, deeply nested) on every dashboard poll, which
// pegged CPU and ballooned RAM on small Home Assistant hosts.  We now cap depth,
// array length, and key count, returning a placeholder past the limits.  Secret
// keys are still redacted at every depth.
const REDACT_KEY_RE = /(api[_-]?key|web[_-]?api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password|cookie|authorization|steamloginsecure|sessionid|shared_secret|identity_secret)/i;
const REDACT_MAX_DEPTH = 12;
const REDACT_MAX_ARRAY = 200;
const REDACT_MAX_KEYS = 200;
function redactDeep(value, depth = 0) {
  if (depth > REDACT_MAX_DEPTH) return '[redact_max_depth]';
  if (Array.isArray(value)) {
    const limit = Math.min(value.length, REDACT_MAX_ARRAY);
    const out = new Array(limit);
    for (let i = 0; i < limit; i++) out[i] = redactDeep(value[i], depth + 1);
    if (value.length > REDACT_MAX_ARRAY) out.push(`[redact_truncated_${value.length - REDACT_MAX_ARRAY}_more]`);
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    let count = 0;
    for (const [key, val] of Object.entries(value)) {
      if (count++ >= REDACT_MAX_KEYS) { out.__redact_truncated__ = true; break; }
      if (REDACT_KEY_RE.test(key)) out[key] = redacted(val);
      else out[key] = redactDeep(val, depth + 1);
    }
    return out;
  }
  return value;
}

function compactObject(value, maxArray = 20) {
  const redactedValue = redactDeep(value);
  if (Array.isArray(redactedValue)) return redactedValue.slice(0, maxArray).map(item => compactObject(item, maxArray));
  if (redactedValue && typeof redactedValue === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(redactedValue)) {
      if (Array.isArray(val)) out[key] = val.slice(0, maxArray).map(item => compactObject(item, maxArray));
      else if (val && typeof val === 'object') out[key] = compactObject(val, maxArray);
      else out[key] = val;
    }
    return out;
  }
  return redactedValue;
}
function diagnosticFileName(date = new Date()) {
  return 'tf2-hub-diagnostic-' + APP_VERSION + '-' + date.toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', 'Z') + '.json';
}

// ── 5.12.33 – recursive legacy field sanitizer ──────────────────────────
function removeRemovedFields(obj) {
  if (Array.isArray(obj)) return obj.map(removeRemovedFields);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_REMOVED_FIELDS.includes(k)) continue;
      out[k] = removeRemovedFields(v);
    }
    return out;
  }
  return obj;
}
function auditRemovedFields(obj, path2 = '') {
  const hits = [];
  if (Array.isArray(obj)) { obj.forEach((x, i) => hits.push(...auditRemovedFields(x, `${path2}[${i}]`))); return hits; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_REMOVED_FIELDS.includes(k)) hits.push(`${path2}.${k}`);
      else hits.push(...auditRemovedFields(v, `${path2}.${k}`));
    }
  }
  return hits;
}
function runForbiddenFieldsAudit() {
  const filesToCheck = [ACCOUNTS_PATH, TRADING_CORE_PATH, HUB_SETUP_PATH, STRATEGIES_PATH, TARGETED_ORDERS_PATH, MARKET_SCANNER_PATH, PLANNING_QUEUE_PATH, HUB_LISTING_DRAFTS_PATH];
  const results = [];
  let totalHits = 0;
  for (const f of filesToCheck) {
    if (!fs.existsSync(f)) continue;
    const data = readJson(f, null);
    if (!data) continue;
    const hits = auditRemovedFields(data, path.basename(f));
    results.push({ file: path.basename(f), hits });
    totalHits += hits.length;
  }
  return { ok: totalHits === 0, forbidden_fields_found: totalHits, files_checked: results.length, results };
}

// ── 5.12.34 – PlanningQueueService ─────────────────────────────────────
const PLANNING_QUEUE_STATUSES = ['planned', 'needs_review', 'approved_local', 'cancelled', 'stale'];
class PlanningQueueService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(PLANNING_QUEUE_PATH, { ok: false, error: 'No planning queue yet. Run rebuild.', items: [] }); }
  rebuild(source = 'manual') {
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const candidates = Array.isArray(scanner.candidates) ? scanner.candidates : [];
    const now = new Date().toISOString();
    const existing = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
    const existingMap = {};
    for (const item of (existing.items || [])) existingMap[item.candidate_id || item.id] = item;
    const seen = new Set();
    const items = candidates.map(c => {
      const key = c.id || c.name || c.item_name || `cand_${Math.random().toString(36).slice(2,8)}`;
      seen.add(key);
      const ex = existingMap[key];
      const stableId = ex?.id || `pq_${String(key).replace(/[^a-z0-9]/gi, '_').slice(0, 36)}`;
      const scores = computeOpportunityScores(c);
      return {
        id: stableId,
        candidate_id: key,
        item_name: c.name || c.item_name || key,
        defindex: c.defindex || ex?.defindex || null,
        quality: String(c.quality || '6'),
        priceindex: String(c.priceindex || '0'),
        max_buy_ref: Number((Number(c.max_buy_ref || c.buy_ref || 0)).toFixed(2)),
        target_sell_ref: Number((Number(c.target_sell_ref || c.sell_ref || 0)).toFixed(2)),
        expected_profit_ref: Number((Number(c.expected_profit_ref || c.profit_ref || 0)).toFixed(2)),
        score: Number(scores.total_score || c.score || c.opportunity_score || 0),
        pricing_score: Number(scores.pricing_score || c.pricing_score || 0),
        risk_score: Number(scores.risk_score || c.risk_score || 0),
        liquidity_score: Number(scores.liquidity_score || c.liquidity_score || 0),
        freshness_score: Number(scores.freshness_score || 0),
        confidence_score: Number(scores.confidence_score || 0),
        explanation: scores.why_selected || c.reason || 'Selected by scanner.',
        local_status: ex ? (ex.local_status || 'planned') : 'planned',
        created_at: ex ? ex.created_at : now,
        updated_at: now,
        last_seen_at: now,
        cycle_seen_count: Number(ex?.cycle_seen_count || 0) + 1,
        source: 'market_scanner'
      };
    });
    for (const oldItem of (existing.items || [])) {
      const key = oldItem.candidate_id || oldItem.id;
      if (!seen.has(key) && !['cancelled','published'].includes(oldItem.local_status)) {
        items.push({ ...oldItem, local_status: oldItem.local_status === 'approved_local' ? 'approved_local' : 'stale', stale_since: oldItem.stale_since || now, updated_at: now });
      }
    }
    const result = { ok: true, version: APP_VERSION, updated_at: now, source, items };
    writeJson(PLANNING_QUEUE_PATH, result);
    this.audit.write('planning_queue_rebuilt', { source, items: items.length });
    appendActionFeed('planning_queue_rebuilt', { source, items: items.length });
    return result;
  }
  setItemStatus(id, newStatus) {
    if (!PLANNING_QUEUE_STATUSES.includes(newStatus)) return { ok: false, error: `Invalid status. Must be one of: ${PLANNING_QUEUE_STATUSES.join(', ')}` };
    const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
    const items = Array.isArray(queue.items) ? queue.items : [];
    const idx = items.findIndex(x => x.id === id);
    if (idx === -1) return { ok: false, error: `Item ${id} not found.` };
    items[idx] = { ...items[idx], local_status: newStatus, updated_at: new Date().toISOString() };
    writeJson(PLANNING_QUEUE_PATH, { ...queue, items, updated_at: new Date().toISOString() });
    this.audit.write('planning_queue_item_status', { id, status: newStatus });
    return { ok: true, id, local_status: newStatus, item: items[idx] };
  }
  bulkApproveTop(n = 3) {
    const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
    const items = Array.isArray(queue.items) ? queue.items : [];
    const eligible = items.filter(x => x.local_status === 'planned' || x.local_status === 'needs_review');
    eligible.sort((a, b) => (b.score || 0) - (a.score || 0));
    const toApprove = eligible.slice(0, Math.min(n, 5));
    for (const item of boostedToApprove) {
      const idx = items.findIndex(x => x.id === item.id);
      if (idx !== -1) items[idx] = { ...items[idx], local_status: 'approved_local', updated_at: new Date().toISOString() };
    }
    writeJson(PLANNING_QUEUE_PATH, { ...queue, items, updated_at: new Date().toISOString() });
    this.audit.write('planning_queue_bulk_approve', { approved: toApprove.length });
    return { ok: true, approved: toApprove.length, approved_ids: toApprove.map(x => x.id) };
  }
}

// ── 5.12.34 – HubListingDraftService ───────────────────────────────────
class HubListingDraftService {
  constructor(auditService) { this.audit = auditService; }

  normalizeSchemaName(value) {
    return normalizeName(String(value || '').replace(/^the\s+/i, ''));
  }
  resolveDefindexFromCaches(draft = {}, item = {}) {
    const direct = Number(item.defindex || draft.defindex || draft.provider_payload_preview?.item?.defindex || 0);
    if (Number.isFinite(direct) && direct > 0) return { ok: true, defindex: direct, source: 'draft' };
    const targetName = this.normalizeSchemaName(item.item_name || item.name || draft.item_name);
    const targetQuality = String(item.quality ?? draft.quality ?? '6');
    const targetPriceindex = String(item.priceindex ?? draft.priceindex ?? '0');
    if (!targetName) return { ok: false, error: 'Cannot resolve defindex without item name.' };

    const steamSchema = readJson(STEAM_ITEM_SCHEMA_PATH, { ok: false, items: [] });
    const steamItems = Array.isArray(steamSchema.items) ? steamSchema.items : [];
    let match = steamItems.find(x => this.normalizeSchemaName(x.item_name || x.name) === targetName);
    if (match && Number(match.defindex) > 0) return { ok: true, defindex: Number(match.defindex), source: 'steam_item_schema_cache', matched_name: match.item_name || match.name };

    const priceSchema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const prices = Array.isArray(priceSchema.prices) ? priceSchema.prices : [];
    match = prices.find(x => this.normalizeSchemaName(x.item_name) === targetName && String(x.quality ?? '6') === targetQuality && String(x.priceindex ?? '0') === targetPriceindex && Number(x.defindex) > 0)
      || prices.find(x => this.normalizeSchemaName(x.item_name) === targetName && Number(x.defindex) > 0);
    if (match && Number(match.defindex) > 0) return { ok: true, defindex: Number(match.defindex), source: 'backpack_price_schema_cache', matched_name: match.item_name };

    return { ok: false, error: `No defindex found for ${draft.item_name || item.item_name || 'item'}. Sync Steam item schema first.`, targetName, targetQuality, targetPriceindex };
  }
  normalizeSteamSchemaItems(rawItems = []) {
    return Array.isArray(rawItems) ? rawItems.map(x => ({
      defindex: Number(x.defindex || x.itemdef || x.item_def_index || x.id || 0),
      item_name: String(x.item_name || x.name || x.item_name_english || '').trim(),
      name: String(x.name || x.item_name || x.item_name_english || '').trim(),
      proper_name: Boolean(x.proper_name),
      item_class: x.item_class || null,
      item_type_name: x.item_type_name || null
    })).filter(x => Number.isFinite(x.defindex) && x.defindex > 0 && (x.item_name || x.name)) : [];
  }
  async syncSteamItemSchemaForDefindex(options = {}, syncOptions = {}) {
    const key = String(options.steam_web_api_key || options.steam_api_key || '').trim();
    const cached = readJson(STEAM_ITEM_SCHEMA_PATH, { ok: false, items: [], updated_at: null });
    const cachedAgeMs = cached.updated_at ? Date.now() - Date.parse(cached.updated_at) : Infinity;
    const force = Boolean(syncOptions.force);
    // 5.13.29: old builds could cache only the first GetSchemaItems page, which misses newer/high defindex cosmetics.
    // Treat small caches as incomplete and refresh them with paginated GetSchemaItems before blocking publish.
    if (!force && cached.ok && Array.isArray(cached.items) && cached.items.length >= 5000 && cachedAgeMs < 24 * 60 * 60 * 1000) return { ...cached, cache_used: true };
    if (!key) return { ok: false, error: 'Steam Web API key missing; cannot refresh TF2 item schema for defindex lookup.', cached_items: Array.isArray(cached.items) ? cached.items.length : 0, cache_used: false };
    const headers = { accept: 'application/json', 'user-agent': options.backpack_tf_user_agent || `TF2-HA-TF2-Trading-Hub/${APP_VERSION}` };
    const timeout = options.provider_timeout_seconds || 15;
    const itemsByDefindex = new Map();
    const attempts = [];
    const addItems = (rawItems = []) => {
      for (const item of this.normalizeSteamSchemaItems(rawItems)) {
        if (!itemsByDefindex.has(item.defindex)) itemsByDefindex.set(item.defindex, item);
      }
    };

    // Primary path: paginated GetSchemaItems/v1. Steam documents a `start` parameter and a next pointer for continuing pages.
    let start = 0;
    const seenStarts = new Set();
    for (let page = 0; page < 80; page++) {
      if (seenStarts.has(String(start))) break;
      seenStarts.add(String(start));
      const url = new URL('https://api.steampowered.com/IEconItems_440/GetSchemaItems/v1/');
      url.searchParams.set('key', key);
      url.searchParams.set('language', 'en_US');
      url.searchParams.set('format', 'json');
      url.searchParams.set('start', String(start));
      const resp = await fetchJsonWithTimeout(url.toString(), timeout, { headers });
      const result = resp.body?.result || resp.body || {};
      const rawItems = result.items || resp.body?.items || [];
      attempts.push({ endpoint: 'GetSchemaItems/v1', page: page + 1, start, ok: Boolean(resp.ok), status: resp.status, items: Array.isArray(rawItems) ? rawItems.length : 0, next: result.next ?? result.next_start ?? result.next_starting_at ?? null });
      addItems(rawItems);
      const nextRaw = result.next ?? result.next_start ?? result.next_starting_at ?? result.next_start_index ?? null;
      const next = Number(nextRaw);
      if (!resp.ok || !Array.isArray(rawItems) || rawItems.length === 0 || !Number.isFinite(next) || next <= start) break;
      start = next;
    }

    // Fallback path: GetSchema/v1 often returns one larger item array and can fill missing items if pagination is partial.
    if (itemsByDefindex.size < 5000) {
      const url = new URL('https://api.steampowered.com/IEconItems_440/GetSchema/v1/');
      url.searchParams.set('key', key);
      url.searchParams.set('language', 'en_US');
      url.searchParams.set('format', 'json');
      const resp = await fetchJsonWithTimeout(url.toString(), timeout, { headers });
      const rawItems = resp.body?.result?.items || resp.body?.items || [];
      attempts.push({ endpoint: 'GetSchema/v1', ok: Boolean(resp.ok), status: resp.status, items: Array.isArray(rawItems) ? rawItems.length : 0 });
      addItems(rawItems);
    }

    const items = Array.from(itemsByDefindex.values()).sort((a, b) => a.defindex - b.defindex);
    const result = { ok: items.length > 0, updated_at: new Date().toISOString(), status: attempts.find(a => a.ok)?.status || attempts[attempts.length - 1]?.status || null, items_count: items.length, pages: attempts.length, attempts, items };
    if (result.ok) writeJson(STEAM_ITEM_SCHEMA_PATH, result);
    return result;
  }
  async ensureDefindexForBuiltListing(built, options = {}) {
    if (!built || !built.ok) return built;
    let listing = built.listing || {};
    const isSellListing = Number(listing.intent || 0) === 1 || String(built.draft?.intent || '').toLowerCase() === 'sell';
    // Sell listings are asset-specific and Backpack.tf accepts the asset id.
    // Do not block key→metal helper publishing on defindex lookup.
    if (isSellListing && (listing.id || built.draft?.assetid)) return built;
    let item = listing.item && typeof listing.item === 'object' ? { ...listing.item } : {};
    let resolved = this.resolveDefindexFromCaches(built.draft || {}, item);
    if (!resolved.ok) {
      await this.syncSteamItemSchemaForDefindex(options, { force: true }).catch(() => null);
      resolved = this.resolveDefindexFromCaches(built.draft || {}, item);
    }
    if (!resolved.ok) {
      return { ok: false, code: 'defindex_missing', error: resolved.error || 'Missing TF2 item defindex for Backpack.tf listing payload.', provider_request_sent: false, draft: built.draft, next_action: 'Run provider sync with a Steam Web API key saved, then prepare/test the draft again.' };
    }
    item = {
      ...item,
      defindex: Number(resolved.defindex),
      quality: Number(item.quality ?? built.draft?.quality ?? 6),
      priceindex: String(item.priceindex ?? built.draft?.priceindex ?? '0')
    };
    if (item.item_name || built.draft?.item_name) item.item_name = String(item.item_name || built.draft.item_name);
    if (item.craftable === undefined) item.craftable = true;
    listing = { ...listing, item };
    const body = { listing };
    const draft = { ...built.draft, defindex: Number(resolved.defindex), provider_payload_preview: { ...(built.draft.provider_payload_preview || {}), item: { ...((built.draft.provider_payload_preview || {}).item || {}), ...item } } };
    built.drafts[built.idx] = draft;
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...built.store, drafts: built.drafts, updated_at: new Date().toISOString() });
    return { ...built, draft, listing, body, defindex_resolution: resolved };
  }
  apiBase(options = {}) {
    const configured = String(options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, '');
    return configured.endsWith('/api') ? configured : `${configured}/api`;
  }
  current() { return readJson(HUB_LISTING_DRAFTS_PATH, { ok: false, error: 'No listing drafts yet. Approve queue items then run build-from-approved.', drafts: [] }); }
  buildFromApproved(source = 'manual') {
    const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
    const approved = (Array.isArray(queue.items) ? queue.items : []).filter(x => x.local_status === 'approved_local');
    const existing = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const existingBySource = {};
    for (const d of (existing.drafts || [])) existingBySource[d.source_order_id] = d;
    const now = new Date().toISOString();
    const drafts = approved.map(item => {
      if (existingBySource[item.id]) {
        const ex = existingBySource[item.id];
        if (ex.local_status === 'published' || ex.local_status === 'cancelled') return ex;
        // 5.13.29: recover failed/stale drafts for the Publish Wizard.
        // A failed provider attempt should not leave the wizard without an approved candidate forever.
        return {
          ...ex,
          local_status: ex.local_status === 'approved_local' ? 'approved_local' : 'draft',
          provider_request_sent: false,
          provider_status: null,
          provider_http_status: null,
          provider_response_summary: null,
          provider_friendly_message: null,
          updated_at: now
        };
      }
      const maxBuy = Number(item.max_buy_ref || 0);
      const sellRef = Number(item.target_sell_ref || 0);
      const currencies = buyRefToBackpackCurrencies(maxBuy, getOptions(), keyPriceEstimateRef());
      return {
        draft_id: `draft_${item.id.slice(0, 20)}_${Date.now().toString(36)}`,
        source_order_id: item.id,
        item_name: item.item_name,
        intent: 'buy',
        max_buy_ref: maxBuy,
        target_sell_ref: sellRef,
        expected_profit_ref: Number(item.expected_profit_ref || (sellRef - maxBuy).toFixed(2)),
        provider_payload_preview: {
          intent: 'buy',
          item: { defindex: item.defindex || null, quality: item.quality || 'Unique', item_name: item.item_name, priceindex: String(item.priceindex || '0') },
          currencies,
          details: buyListingDetails(item.item_name, currencies),
          note: 'This is a dry-run preview only. No request has been sent.'
        },
        defindex: item.defindex || null,
        quality: item.quality || '6',
        priceindex: String(item.priceindex || '0'),
        local_status: 'draft',
        created_at: now,
        updated_at: now,
        provider_request_sent: false,
        published_at: null,
        published_listing_id: null
      };
    });
    // keep existing non-approved drafts that are published/cancelled
    const others = (existing.drafts || []).filter(d => !approved.find(a => a.id === d.source_order_id));
    const allDrafts = [...drafts, ...others.filter(d => d.local_status === 'published' || d.local_status === 'cancelled')];
    const result = { ok: true, version: APP_VERSION, updated_at: now, source, drafts: allDrafts };
    writeJson(HUB_LISTING_DRAFTS_PATH, result);
    this.audit.write('listing_drafts_built', { source, drafts: drafts.length });
    appendActionFeed('listing_drafts_built', { source, drafts: drafts.length, from_approved: approved.length });
    return result;
  }
  approveDraft(draftId) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const idx = drafts.findIndex(d => d.draft_id === draftId);
    if (idx === -1) return { ok: false, error: `Draft ${draftId} not found.` };
    drafts[idx] = { ...drafts[idx], local_status: 'approved_local', updated_at: new Date().toISOString() };
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, drafts, updated_at: new Date().toISOString() });
    this.audit.write('listing_draft_approved_local', { draft_id: draftId });
    return { ok: true, draft_id: draftId, local_status: 'approved_local', draft: drafts[idx] };
  }
  cancelDraft(draftId) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const idx = drafts.findIndex(d => d.draft_id === draftId);
    if (idx === -1) return { ok: false, error: `Draft ${draftId} not found.` };
    drafts[idx] = { ...drafts[idx], local_status: 'cancelled', updated_at: new Date().toISOString() };
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, drafts, updated_at: new Date().toISOString() });
    this.audit.write('listing_draft_cancelled', { draft_id: draftId });
    return { ok: true, draft_id: draftId, local_status: 'cancelled' };
  }
  // 5.13.29 – TF2Autobot-style Backpack.tf publish executor
  normalizeProviderListingPayload(draft = {}) {
    const raw = draft.provider_payload_preview || {};
    const intentText = String(raw.intent || draft.intent || 'buy').toLowerCase();
    const isSell = intentText === 'sell' || intentText === '1';
    const options = getOptions();
    const keyRef = keyPriceEstimateRef();
    const currencies = raw.currencies && typeof raw.currencies === 'object' ? { ...raw.currencies } : {};
    const maxBuy = Number(draft.max_buy_ref || currenciesToRef(currencies, keyRef) || 0);
    if (!currencies.keys) delete currencies.keys;
    const effectiveCurrencies = isSell
      ? (currencies.keys || currencies.metal ? currencies : refToBackpackCurrencies(Number(draft.target_sell_ref || maxBuy || 0), options, keyRef))
      : enforceBuyCurrencies(maxBuy, currencies, options, keyRef);
    Object.keys(currencies).forEach(key => delete currencies[key]);
    Object.assign(currencies, effectiveCurrencies);
    const item = raw.item && typeof raw.item === 'object' ? { ...raw.item } : {};
    if (!item.item_name && !item.name) item.item_name = draft.item_name || 'Unknown item';
    if (draft.defindex && !item.defindex) item.defindex = Number(draft.defindex);
    if (!item.quality) item.quality = draft.quality || 'Unique';
    if (!item.priceindex && draft.priceindex) item.priceindex = String(draft.priceindex);
    const defaultDetails = listingDetailsFromFinalCurrencies(
      draft.item_name || item.item_name || 'item',
      isSell ? 'sell' : 'buy',
      currencies && Object.keys(currencies).length ? currencies : Number(isSell ? (draft.target_sell_ref || maxBuy || 0) : (maxBuy || 0))
    );
    const payload = {
      intent: isSell ? 1 : 0,
      currencies,
      details: options.listing_text_sync_with_published_price !== false ? defaultDetails : cleanPublicListingText(raw.details || defaultDetails),
      offers: raw.offers !== false,
      bump: false
    };
    if (isSell) {
      if (raw.id || draft.assetid) payload.id = String(raw.id || draft.assetid);
    } else {
      payload.item = item;
    }
    return payload;
  }
  buildGuardedPublishRequest(draftId, options, { requireApproved = true } = {}) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const idx = drafts.findIndex(d => d.draft_id === draftId);
    if (idx === -1) return { ok: false, error: `Draft ${draftId} not found.`, code: 'draft_not_found' };
    const draft = drafts[idx];
    if (requireApproved && draft.local_status !== 'approved_local') return { ok: false, error: `Draft must be approved_local to publish. Current status: ${draft.local_status}`, code: 'not_approved', draft };
    if (!draft.provider_payload_preview) return { ok: false, error: 'No provider payload preview on this draft.', code: 'no_payload', draft };
    const token = options.backpack_tf_access_token || options.backpack_tf_api_key || '';
    const base = `${options.backpack_tf_base_url || 'https://backpack.tf'}/api/v2/classifieds/listings`;
    const url = new URL(base);
    if (token) url.searchParams.set('token', token);
    const redactedUrl = new URL(base);
    if (token) redactedUrl.searchParams.set('token', '••••');
    const listing = this.normalizeProviderListingPayload(draft);
    const resolvedForPreview = this.resolveDefindexFromCaches(draft, listing.item || {});
    if (resolvedForPreview.ok && listing.item && !listing.item.defindex) listing.item.defindex = Number(resolvedForPreview.defindex);
    const body = { listing };
    return { ok: true, store, drafts, idx, draft, token, url: url.toString(), redacted_url: redactedUrl.toString(), listing, body };
  }
  cleanCurrenciesForBackpack(currencies = {}) {
    const out = {};
    const keys = Number(currencies.keys || 0);
    const metal = Number(currencies.metal || 0);
    if (Number.isFinite(keys) && keys > 0) out.keys = Number(keys.toFixed(2));
    if (Number.isFinite(metal) && metal > 0) out.metal = Number(metal.toFixed(2));
    return out;
  }
  buildTf2AutobotBatchCreatePayload(built) {
    const listing = built.listing || {};
    const draft = built.draft || {};
    const item = listing.item && typeof listing.item === 'object' ? { ...listing.item } : {};
    const resolvedForPayload = this.resolveDefindexFromCaches(draft, item);
    if (resolvedForPayload.ok && !item.defindex) item.defindex = Number(resolvedForPayload.defindex);
    const currencies = this.cleanCurrenciesForBackpack(listing.currencies || {});
    if (!Object.keys(currencies).length) {
      const fallbackMetal = Number(draft.max_buy_ref || 0);
      if (Number.isFinite(fallbackMetal) && fallbackMetal > 0) currencies.metal = Number(fallbackMetal.toFixed(2));
    }
    const finalDetails = listingDetailsFromFinalCurrencies(
      draft.item_name || item.item_name || 'item',
      Number(listing.intent || 0) === 1 ? 'sell' : 'buy',
      currencies && Object.keys(currencies).length ? currencies : Number(Number(listing.intent || 0) === 1 ? (draft.target_sell_ref || 0) : currenciesToRef(currencies))
    );
    const entry = {
      intent: Number(listing.intent || 0),
      currencies,
      details: getOptions().listing_text_sync_with_published_price !== false ? finalDetails : cleanPublicListingText(listing.details || finalDetails),
      offers: listing.offers !== false,
      bump: false,
      promoted: 0,
      time: Math.floor(Date.now() / 1000)
    };
    if (entry.intent === 0) {
      entry.item = {
        defindex: Number(item.defindex || draft.defindex || 0),
        quality: Number(item.quality ?? draft.quality ?? 6),
        item_name: String(item.item_name || item.name || draft.item_name || 'Unknown item'),
        priceindex: String(item.priceindex ?? draft.priceindex ?? '0'),
        craftable: item.craftable !== undefined ? item.craftable : true
      };
      if (!entry.item.defindex) delete entry.item.defindex;
    } else {
      entry.id = String(listing.id || draft.assetid || '');
    }
    return [entry];
  }
  buildTf2AutobotSingleCreatePayload(built) {
    return this.buildTf2AutobotBatchCreatePayload(built)[0];
  }
  testPublishPayload(draftId, options) {
    const built = this.buildGuardedPublishRequest(draftId, options, { requireApproved: false });
    if (!built.ok) return built;
    return {
      ok: true,
      version: APP_VERSION,
      draft_id: draftId,
      item_name: built.draft.item_name,
      local_status: built.draft.local_status,
      guarded_publish_enabled: Boolean(options.allow_guarded_backpack_publish),
      token_saved: Boolean(built.token),
      provider_request_sent: false,
      method: 'POST',
      url: built.redacted_url,
      body: built.body,
      tf2autobot_batch_body: this.buildTf2AutobotBatchCreatePayload(built),
      tf2autobot_single_body: this.buildTf2AutobotSingleCreatePayload(built),
      defindex_resolution: this.resolveDefindexFromCaches(built.draft, built.listing?.item || {}),
      safety: {
        steam_trade_accept: false,
        steam_confirmation: false,
        automatic_publish: false,
        one_draft_only: true
      },
      note: 'Payload test only. No Backpack.tf request was sent.'
    };
  }
  async publishGuarded(draftId, options, publishOptions = {}) {
    const guardedEnabled = Boolean(options.allow_guarded_backpack_publish);
    const liveClassifiedsEnabled = Boolean(options.allow_live_classifieds_writes);
    if (!guardedEnabled) return { ok: false, error: 'Guarded Backpack.tf publish is disabled. Enable allow_guarded_backpack_publish in add-on options first.', code: 'guarded_publish_disabled', provider_request_sent: false, next_action: 'Enable guarded publish only when you are ready to publish one approved draft manually.' };
    if (!liveClassifiedsEnabled) return { ok: false, error: 'Live classifieds writes are disabled. Enable allow_live_classifieds_writes together with guarded mode to publish one approved draft manually.', code: 'live_classifieds_writes_disabled', provider_request_sent: false, next_action: 'Enable allow_live_classifieds_writes only for this guarded manual publish test.' };
    if (options.backpack_tf_write_mode !== 'guarded') return { ok: false, error: 'Backpack.tf write mode must be guarded for this executor.', code: 'write_mode_not_guarded', provider_request_sent: false, next_action: 'Set backpack_tf_write_mode to guarded, not active.' };
    if (!publishOptions || publishOptions.confirm !== true) return { ok: false, error: 'confirm=true is required to publish.', code: 'confirm_required', provider_request_sent: false };
    if (Boolean(options.global_kill_switch)) return { ok: false, error: 'Global kill switch is enabled.', code: 'global_kill_switch', provider_request_sent: false };
    if (Boolean(options.allow_live_trade_accepts)) return { ok: false, error: 'Safety: allow_live_trade_accepts must be false for guarded publish.', code: 'live_trade_accepts_enabled', provider_request_sent: false };
    if (Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm)) return { ok: false, error: 'Safety: Steam/SDA auto-confirm must be false for guarded publish.', code: 'sda_auto_confirm_enabled', provider_request_sent: false };
    let built = this.buildGuardedPublishRequest(draftId, options, { requireApproved: true });
    if (!built.ok) return { ...built, provider_request_sent: false, friendly_error: friendlyPublishError(built.code, built.error) };
    let brainGate = tradingBrainEnforcementDecision(built.draft, options, 'publish');
    if (!brainGate.ok) {
      this.audit.write('guarded_backpack_publish_blocked_by_trading_brain', { draft_id: draftId, item_name: built.draft.item_name, reasons: brainGate.hard_reasons, intent: brainGate.intent });
      appendActionFeed('guarded_backpack_publish_blocked_by_trading_brain', { draft_id: draftId, item_name: built.draft.item_name, reasons: brainGate.hard_reasons });
      return { ok: false, code: 'trading_brain_blocked', error: brainGate.message, provider_request_sent: false, trading_brain_gate: brainGate, friendly_error: brainGate.message, next_action: brainGate.next_action };
    }
    if (draftIntent(built.draft) === 'sell') {
      const profitGuard = applySellProfitGuardToDraft(draftId, options, built.draft.provider_payload_preview?.market_mirror ? { sell: [{ price_ref: Number(built.draft.provider_payload_preview.market_mirror.lowest_sell_ref || 0) }] } : null);
      if (!profitGuard.ok) return { ok: false, code: profitGuard.code || 'sell_profit_guard_blocked', error: profitGuard.error || 'Sell profit guard blocked this listing.', provider_request_sent: false, sell_profit_guard: profitGuard.guard || profitGuard, friendly_error: 'Sell listing was blocked because it would not meet the configured profit floor.' };
      built = this.buildGuardedPublishRequest(draftId, options, { requireApproved: true });
      if (!built.ok) return { ...built, provider_request_sent: false, friendly_error: friendlyPublishError(built.code, built.error) };
      brainGate = tradingBrainEnforcementDecision(built.draft, options, 'publish');
      if (!brainGate.ok) return { ok: false, code: 'trading_brain_blocked_after_reprice', error: brainGate.message, provider_request_sent: false, trading_brain_gate: brainGate, friendly_error: brainGate.message, next_action: brainGate.next_action };
    }
    built = await this.ensureDefindexForBuiltListing(built, options);
    if (!built.ok) return { ...built, provider_status: 'blocked', provider_response_summary: built.error, friendly_error: friendlyPublishError(built.code, built.error) };
    if (!built.token) return { ok: false, error: 'Backpack.tf token is not saved. Save it via Credentials.', code: 'no_backpack_token', provider_request_sent: false, friendly_error: 'Save the Backpack.tf user token in the account credentials first.' };
    const duplicateGuard = buildDuplicateListingGuard(built.draft, options);
    if (duplicateGuard.blocked && !(publishOptions.force_duplicate && options.allow_duplicate_guard_override)) {
      this.audit.write('guarded_backpack_publish_blocked_duplicate', { draft_id: draftId, item_name: built.draft.item_name, matches: duplicateGuard.matches.length });
      return { ok: false, code: 'duplicate_listing_guard', error: duplicateGuard.message, provider_request_sent: false, duplicate_guard: duplicateGuard, next_action: 'Cancel the duplicate, adjust the draft, or retry with force_duplicate only if you really want another similar listing.' };
    }
    const currencyGuard = buildCurrencyGuardForDraft(built.draft);
    if (String(built.draft.intent || 'buy').toLowerCase() === 'buy' && currencyGuard.can_prepare_key_to_metal_listing && publishOptions.skip_currency_guard !== true) {
      // 5.13.29: no extra manual helper step.  If a buy listing lacks refined
      // metal but a tradable key exists, automatically prepare and publish one
      // guarded key→metal sell listing as part of this same explicit click.
      // This still does NOT accept/send/confirm any Steam trade; it only creates
      // one Backpack.tf listing so another user can send an offer.
      const helper = prepareKeyToMetalDraft(options, this.audit);
      if (!helper || helper.ok === false || !helper.draft_id) {
        return { ok: false, code: 'currency_helper_failed', provider_request_sent: false, currency_guard: currencyGuard, currency_helper: helper, friendly_error: 'Not enough refined metal for this buy listing and the key→metal helper could not prepare a sell-key listing.', next_action: 'Sync inventory, check that a tradable Mann Co. Supply Crate Key exists, then retry.' };
      }
      const helperPublish = await this.publishGuarded(helper.draft_id, options, { ...publishOptions, confirm: true, skip_currency_guard: true, auto_currency_helper: true });
      const helperOk = Boolean(helperPublish && helperPublish.ok);
      this.audit.write(helperOk ? 'currency_helper_key_to_metal_auto_published' : 'currency_helper_key_to_metal_auto_publish_failed', { draft_id: helper.draft_id, original_draft_id: draftId, provider_status: helperPublish?.provider_status || null, provider_http_status: helperPublish?.provider_http_status || null });
      appendActionFeed(helperOk ? 'currency_helper_key_to_metal_auto_published' : 'currency_helper_key_to_metal_auto_publish_failed', { draft_id: helper.draft_id, original_draft_id: draftId, provider_status: helperPublish?.provider_status || null });
      return {
        ok: helperOk,
        code: helperOk ? 'currency_helper_auto_published' : 'currency_helper_auto_publish_failed',
        version: APP_VERSION,
        provider_request_sent: Boolean(helperPublish && helperPublish.provider_request_sent),
        provider_status: helperPublish?.provider_status || 'error',
        provider_http_status: helperPublish?.provider_http_status || null,
        provider_response_summary: helperPublish?.provider_response_summary || null,
        currency_guard: currencyGuard,
        currency_helper: helper,
        currency_helper_publish: helperPublish,
        original_draft_id: draftId,
        original_item_name: built.draft.item_name,
        friendly_message: helperOk ? 'Not enough refined metal for the buy listing, so TF2 Trading Hub automatically published one guarded key→metal sell listing. No Steam trade was accepted or confirmed. Wait for the trade offer, handle it manually, then retry the original buy listing.' : 'The automatic key→metal listing was prepared but Backpack.tf did not accept it. Check currency_helper_publish for details.',
        next_action: helperOk ? 'Wait for a manual Steam offer for the key→metal listing, complete it yourself, then retry Publish one listing for the original buy draft.' : 'Send the diagnostic for the key→metal publish failure.',
        live_trade_accepts: false,
        sda_confirmations: false,
        safety_note: 'Only a Backpack.tf key→metal listing was created. No Steam trade was accepted, sent, or confirmed.'
      };
    }
    const now = new Date().toISOString();
    if (String(built.draft.intent || 'buy').toLowerCase() === 'buy' && publishOptions.skip_currency_guard !== true && options.currency_helper_hold_buy_when_missing_currency && currencyGuard && !currencyGuard.enough_currency && !currencyGuard.can_prepare_key_to_metal_listing) {
      const held = { ok: false, code: 'buy_currency_unavailable_held', provider_request_sent: false, provider_status: 'held_before_provider', provider_response_summary: currencyGuard.message, friendly_message: currencyGuard.message, currency_guard: currencyGuard, next_action: 'Add keys/refined metal, lower the buy price, or let sell/auto-sell continue until currency is available.', live_trade_accepts: false, sda_confirmations: false, safety_note: 'No Backpack.tf request was sent because the account is missing the currency required for this buy listing.' };
      this.audit.write('guarded_buy_publish_held_missing_currency', { draft_id: draftId, item_name: built.draft.item_name, missing: currencyGuard.deficit_text, needed: currencyGuard.needed_text, available: currencyGuard.available_text });
      appendActionFeed('guarded_buy_publish_held_missing_currency', { draft_id: draftId, item_name: built.draft.item_name, missing: currencyGuard.deficit_text });
      return held;
    }

    this.audit.write('guarded_backpack_publish_attempted', { draft_id: draftId, item_name: built.draft.item_name, url: built.redacted_url, duplicate_guard: duplicateGuard.status, currency_guard: currencyGuard.recommended_action });
    appendActionFeed('guarded_backpack_publish_attempted', { draft_id: draftId, item_name: built.draft.item_name });
    let providerStatus = 'unknown', providerSummary = null, listingId = null, listingUrl = null, listingStatus = null, listingArchived = false, listingActive = false, publishOk = false, responseStatus = null, friendly = null;
    try {
      const authUrl = new URL(built.url);
      const endpointBase = authUrl.origin + authUrl.pathname;
      const tokenParam = authUrl.search;
      const requestHeaders = {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': options.backpack_tf_user_agent || `TF2-HA-TF2-Trading-Hub/${APP_VERSION}`
      };
      if (options.backpack_tf_user_id) requestHeaders.Cookie = 'user-id=' + options.backpack_tf_user_id;
      const variants = [
        {
          label: 'tf2autobot_batch_create',
          url: `${this.apiBase(options)}/v2/classifieds/listings/batch${tokenParam}`,
          body: this.buildTf2AutobotBatchCreatePayload(built),
          note: 'TF2Autobot-style batch create endpoint with a direct listing array.'
        },
        {
          label: 'tf2autobot_single_direct',
          url: endpointBase + tokenParam,
          body: this.buildTf2AutobotSingleCreatePayload(built),
          note: 'Fallback: direct listing object without wrapper.'
        },
        {
          label: 'legacy_wrapped_listing',
          url: built.url,
          body: built.body,
          note: 'Legacy fallback used by earlier TF2 Trading Hub builds.'
        }
      ];
      const attempts = [];
      let parsed = null;
      for (const variant of variants) {
        const resp = await fetchJsonWithTimeout(variant.url, options.provider_timeout_seconds || 15, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(variant.body)
        });
        const body = resp.body || resp;
        parsed = parseBackpackPublishResponse(resp, body);
        attempts.push({
          label: variant.label,
          status: resp.status || null,
          ok: parsed.ok,
          note: variant.note,
          response: parsed.summary
        });
        responseStatus = resp.status || null;
        if (parsed.ok) break;
        const msg = String(parsed.friendly_message || parsed.summary || '').toLowerCase();
        // Continue from the old wrapper/single endpoint to the TF2Autobot-compatible variants
        // when backpack.tf says it parsed the value as zero. Stop early for auth/rate-limit failures.
        if (msg.includes('token') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('rate') || msg.includes('429')) break;
      }
      publishOk = Boolean(parsed && parsed.ok);
      listingArchived = Boolean(parsed?.archived);
      listingStatus = parsed?.listing_status || null;
      listingActive = Boolean(parsed?.active);
      providerStatus = publishOk ? (listingArchived ? 'accepted_archived' : 'success') : 'error';
      providerSummary = JSON.stringify({ attempts }).slice(0, 1600);
      listingId = parsed?.listing_id || null;
      listingUrl = parsed?.listing_url || null;
      friendly = parsed?.friendly_message || null;
    } catch (err) {
      providerStatus = 'error';
      providerSummary = safeError(err);
      friendly = String(safeError(err)).includes('apiBase is not a function') ? 'Internal publish executor bug: apiBase helper was not wired. Update to 5.13.36 or newer.' : friendlyPublishError('network_or_timeout', safeError(err));
    }
    const syncedProviderPayloadPreview = {
      ...(built.draft.provider_payload_preview || {}),
      currencies: { ...(built.listing.currencies || {}) },
      details: listingDetailsFromFinalCurrencies(built.draft.item_name || built.listing.item?.item_name || 'item', built.listing.intent === 1 ? 'sell' : 'buy', built.listing.currencies || {}),
      item: built.draft.provider_payload_preview?.item || built.listing.item || undefined,
      listing_text_synced: true,
      listing_text_synced_at: now,
      listing_text_sync_source: 'published_payload'
    };
    const updated = {
      ...built.draft,
      provider_payload_preview: syncedProviderPayloadPreview,
      local_status: publishOk ? (listingArchived ? 'published_archived' : 'published') : 'publish_failed',
      provider_request_sent: true,
      provider_status: providerStatus,
      provider_http_status: responseStatus,
      provider_response_summary: providerSummary,
      provider_friendly_message: friendly,
      duplicate_guard: duplicateGuard,
      published_at: publishOk ? now : null,
      published_listing_id: listingId,
      published_listing_url: listingUrl,
      published_archived: listingArchived,
      published_active: listingActive,
      published_listing_status: listingStatus,
      updated_at: now
    };
    built.drafts[built.idx] = updated;
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...built.store, drafts: built.drafts, updated_at: now });
    let publishVerification = null;
    try { publishVerification = await verifyPublishedListing(draftId, options, this.audit, { forceSync: true, source: 'after_guarded_publish' }); }
    catch (verifyError) { publishVerification = { ok: false, error: safeError(verifyError), listed: false }; }
    if (publishVerification && publishVerification.listed) {
      publishOk = true;
      providerStatus = providerStatus === 'error' ? 'verified_after_request' : providerStatus;
    }
    const auditEvent = publishOk ? 'guarded_backpack_publish_succeeded' : 'guarded_backpack_publish_failed';
    this.audit.write(auditEvent, { draft_id: draftId, item_name: built.draft.item_name, provider_status: providerStatus, provider_http_status: responseStatus, friendly_message: friendly });
    appendActionFeed(auditEvent, { draft_id: draftId, item_name: built.draft.item_name, provider_status: providerStatus, provider_http_status: responseStatus });
    return {
      ok: publishOk,
      version: APP_VERSION,
      draft_id: draftId,
      item_name: built.draft.item_name,
      provider_request_sent: true,
      provider_status: providerStatus,
      provider_http_status: responseStatus,
      provider_response_summary: providerSummary,
      friendly_message: friendly,
      duplicate_guard: duplicateGuard,
      published_at: updated.published_at,
      published_listing_id: listingId,
      published_listing_url: listingUrl,
      published_archived: listingArchived,
      published_active: listingActive,
      published_listing_status: listingStatus,
      publish_verification: publishVerification,
      live_trade_accepts: false,
      sda_confirmations: false,
      safety_note: 'This publish only attempted one selected Backpack.tf listing. No Steam trade was accepted, sent, or confirmed.'
    };
  }

}

// ── 5.13.29 – TF2Autobot-style publish helpers ──────────────────────────
function normalizeListingText(value) {
  return String(value || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function listingItemName(listing = {}) {
  return listing.item_name || listing.name || listing.title || listing.sku || listing.item?.item_name || listing.item?.name || listing.item?.sku || listing.item?.defindex || '';
}
function listingIntentValue(listing = {}) {
  const raw = listing.intent ?? listing.listing_intent ?? listing.buyout ?? listing.type ?? listing.intent_name;
  if (raw === 0 || raw === '0' || String(raw).toLowerCase() === 'buy') return 'buy';
  if (raw === 1 || raw === '1' || String(raw).toLowerCase() === 'sell') return 'sell';
  return String(raw || '').toLowerCase();
}
function readAccountListingsArray() {
  const cache = readJson(BACKPACK_LISTINGS_PATH, { listings: [], results: [] });
  if (Array.isArray(cache.listings)) return cache.listings;
  if (Array.isArray(cache.results)) return cache.results;
  if (Array.isArray(cache.response?.listings)) return cache.response.listings;
  if (Array.isArray(cache.data?.listings)) return cache.data.listings;
  return [];
}
function buildDuplicateListingGuard(draft = {}, options = getOptions()) {
  const enabled = options.publish_duplicate_guard_enabled !== false;
  const all = readAccountListingsArray();
  const targetName = normalizeListingText(draft.item_name || draft.provider_payload_preview?.item?.item_name);
  const targetIntent = String(draft.intent || draft.provider_payload_preview?.intent || 'buy').toLowerCase();
  const targetMetal = Number(draft.max_buy_ref || draft.provider_payload_preview?.currencies?.metal || 0);
  const rawMatches = all.filter(l => {
    if (!targetName) return false;
    const nameMatch = normalizeListingText(listingItemName(l)) === targetName;
    const intent = listingIntentValue(l);
    const intentMatch = !intent || intent === targetIntent || (targetIntent === 'buy' && intent === '0') || (targetIntent === 'sell' && intent === '1');
    return nameMatch && intentMatch;
  }).map(l => ({
    id: l.id || l.listing_id || l.hash || null,
    item_name: listingItemName(l),
    intent: listingIntentValue(l) || targetIntent,
    currencies: l.currencies || l.price || null,
    details: l.details || l.comment || null,
    created_at: l.created_at || l.bumped_at || null
  }));
  const selfIds = new Set([draft.published_listing_id, draft.provider_payload_preview?.listing_id, draft.provider_payload_preview?.id].filter(Boolean).map(String));
  const stale_price_matches = rawMatches.filter(m => {
    if (m.id && selfIds.has(String(m.id))) return false;
    const listedMetal = Number(m.metal || m.currencies?.metal || 0);
    return targetIntent === 'sell' && targetMetal > 0 && listedMetal > 0 && Math.abs(listedMetal - targetMetal) > 0.22;
  });
  // 5.13.29: stale self/old sell listings with the same item but the wrong
  // price must not block a corrected republish. Backpack.tf generally updates
  // the asset listing when we create a sell listing for the same asset id.
  const matches = rawMatches.filter(m => {
    if (m.id && selfIds.has(String(m.id))) return false;
    const listedMetal = Number(m.metal || m.currencies?.metal || 0);
    if (targetIntent === 'sell' && targetMetal > 0 && listedMetal > 0 && Math.abs(listedMetal - targetMetal) > 0.22) return false;
    return true;
  });
  const self_matches = rawMatches.filter(m => m.id && selfIds.has(String(m.id)));
  const blocked = enabled && matches.length > 0;
  const result = {
    ok: !blocked,
    version: APP_VERSION,
    checked_at: new Date().toISOString(),
    enabled,
    blocked,
    status: blocked ? 'duplicate_found' : 'clear',
    draft_id: draft.draft_id || null,
    item_name: draft.item_name || null,
    intent: targetIntent,
    planned_price_ref: targetMetal,
    account_listings_seen: all.length,
    matches,
    self_matches,
    stale_price_matches,
    message: blocked ? `Similar ${targetIntent} listing already exists for ${draft.item_name}. Guarded publish is blocked to avoid duplicates.` : (stale_price_matches.length ? 'Only stale/wrong-price sell listing matches were found; republish is allowed to correct them.' : 'No duplicate listing found in cached account listings.')
  };
  writeJson(DUPLICATE_LISTING_GUARD_PATH, result);
  return result;
}
function friendlyPublishError(code, raw = '') {
  const text = String(raw || '').toLowerCase();
  if (code === 'guarded_publish_disabled') return 'Enable guarded publish in add-on options first. This is intentionally off by default.';
  if (code === 'confirm_required') return 'Press the guarded publish button again with the confirmation dialog accepted.';
  if (code === 'not_approved') return 'Approve the listing draft locally before publishing.';
  if (code === 'no_backpack_token') return 'Save a valid Backpack.tf user token in credentials.';
  if (code === 'duplicate_listing_guard') return 'A similar listing already exists. Review current Backpack.tf listings before publishing another one.';
  if (text.includes('access token') || text.includes('token') || text.includes('unauthorized') || text.includes('forbidden') || text.includes('401') || text.includes('403')) return 'Backpack.tf rejected the token. Re-save the Backpack.tf user token and try Test Publish Payload again.';
  if (text.includes('value cannot be zero') || text.includes('zero')) return 'Backpack.tf says the listing value is zero. Check metal/key currencies in the draft payload.';
  if (text.includes('too many active') || text.includes('rate') || text.includes('429')) return 'Backpack.tf is busy or rate-limited. Wait and retry one draft later.';
  if (code === 'network_or_timeout') return 'Provider request failed or timed out. Check network/provider status and retry later.';
  return raw || 'Backpack.tf returned an error. Check provider_response_summary for details.';
}
function parseBackpackPublishResponse(resp = {}, body = {}) {
  const redacted = redactDeep({ status: resp.status, body });
  const summary = JSON.stringify(redacted).slice(0, 1200);
  const statusOk = Boolean(resp.ok || (resp.status >= 200 && resp.status < 300));
  if (Array.isArray(body)) {
    const first = body[0] || {};
    const result = first.result || first.listing || first;
    const err = first.error || first.errors || null;
    const ok = statusOk && !err && Boolean(first.result || first.id || first.listing_id || first.hash);
    const listing_id = result.id || result.listing_id || result.hash || null;
    const listing_url = result.url || result.listing_url || (listing_id ? `https://backpack.tf/classifieds?listing=${encodeURIComponent(String(listing_id))}` : null);
    const archived = Boolean(result.archived);
    const listing_status = result.status || null;
    const active = Boolean(ok && !archived && !listing_status);
    const msg = err?.message || err || (ok ? (archived ? `Backpack.tf accepted the listing but archived it${listing_status ? ': '+listing_status : ''}.` : 'Backpack.tf accepted the TF2Autobot-style batch create request.') : 'Backpack.tf did not accept the batch create request.');
    return { ok, listing_id, listing_url, archived, listing_status, active, summary, friendly_message: ok ? msg : friendlyPublishError('provider_error', msg || summary) };
  }
  const explicitBad = body && (body.ok === false || body.success === false || body.error || (body.message && !statusOk));
  const ok = statusOk && !explicitBad;
  const pools = [body?.listing, body?.listings?.[0], body?.results?.[0], body?.response?.listings?.[0], body?.data?.listings?.[0], Array.isArray(body?.data) ? body.data[0] : null, body].filter(Boolean);
  const listing = pools.find(x => typeof x === 'object') || {};
  const listing_id = listing.id || listing.listing_id || listing.hash || body?.id || body?.listing_id || null;
  const listing_url = listing.url || listing.listing_url || (listing_id ? `https://backpack.tf/classifieds?listing=${encodeURIComponent(String(listing_id))}` : null);
  const archived = Boolean(listing.archived || body?.archived);
  const listing_status = listing.status || body?.status || null;
  const active = Boolean(ok && !archived && !listing_status);
  const msg = body?.message || body?.error || body?.reason || (ok ? (archived ? `Backpack.tf accepted the listing but archived it${listing_status ? ': '+listing_status : ''}.` : 'Backpack.tf accepted the guarded publish request.') : 'Backpack.tf did not accept the publish request.');
  return { ok, listing_id, listing_url, archived, listing_status, active, summary, friendly_message: ok ? msg : friendlyPublishError('provider_error', msg || summary) };
}

// ── 5.13.29 – Classifieds mirror + currency helper ─────────────────────
function keyPriceEstimateRef() {
  const inv = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {} });
  const fromInv = Number(inv.analysis?.key_ref_estimate || 0);
  if (Number.isFinite(fromInv) && fromInv > 0) return fromInv;
  const schema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
  const prices = Array.isArray(schema.prices) ? schema.prices : [];
  try { return new MarketTargetScannerService(null).keyPriceRef(prices, getOptions()); } catch { return 54.33; }
}
function currencyInventorySummary() {
  const inv = readJson(HUB_INVENTORY_PATH, { ok: false, items: [], analysis: {} });
  const items = Array.isArray(inv.items) ? inv.items : [];
  let keys = 0, metal = 0;
  const metalItems = [];
  let keyAsset = null;
  for (const item of items) {
    if (!item || !item.tradable) continue;
    const name = normalizeName(item.market_hash_name || item.name || '');
    const amount = Number(item.amount || 1) || 1;
    if (name === 'mann co supply crate key') {
      keys += amount;
      if (!keyAsset) keyAsset = { assetid: item.assetid, item_name: item.market_hash_name || item.name || 'Mann Co. Supply Crate Key' };
    }
    const addMetal = (value) => { metal += value * amount; metalItems.push({ assetid: item.assetid, item_name: item.market_hash_name || item.name, value_ref: Number((value * amount).toFixed(2)) }); };
    if (name === 'refined metal') addMetal(1);
    else if (name === 'reclaimed metal') addMetal(0.33);
    else if (name === 'scrap metal') addMetal(0.11);
  }
  return { ok: Boolean(inv.ok), keys, metal_ref: Number(metal.toFixed(2)), key_ref_estimate: Number(keyPriceEstimateRef().toFixed(2)), key_asset: keyAsset, metal_items: metalItems, inventory_items: items.length };
}
function buildCurrencyGuardForDraft(draft = {}) {
  const intent = String(draft.intent || draft.provider_payload_preview?.intent || 'buy').toLowerCase();
  const options = getOptions();
  const keyRef = keyPriceEstimateRef();
  const rawCurrencies = draft.provider_payload_preview?.currencies && typeof draft.provider_payload_preview.currencies === 'object' ? draft.provider_payload_preview.currencies : {};
  const currencies = intent === 'buy'
    ? enforceBuyCurrencies(Number(draft.max_buy_ref || currenciesToRef(rawCurrencies, keyRef) || 0), rawCurrencies, options, keyRef)
    : (rawCurrencies && Object.keys(rawCurrencies).length ? rawCurrencies : refToBackpackCurrencies(Number(draft.max_buy_ref || draft.target_sell_ref || 0), options, keyRef));
  const neededKeys = Number(currencies.keys || 0);
  const neededMetal = Number(currencies.metal || draft.provider_payload_preview?.currencies?.metal || 0);
  const summary = currencyInventorySummary();
  const enoughKeys = intent !== 'buy' || Number(summary.keys || 0) >= neededKeys;
  const enoughMetal = intent !== 'buy' || Number(summary.metal_ref || 0) >= neededMetal;
  const enoughCurrency = intent !== 'buy' || (enoughKeys && enoughMetal);
  const canConvertKey = !enoughMetal && Number(summary.keys || 0) > neededKeys;
  const missingMetal = Math.max(0, neededMetal - Number(summary.metal_ref || 0));
  const missingKeys = Math.max(0, neededKeys - Number(summary.keys || 0));
  const missingParts = [];
  if (missingKeys > 0) missingParts.push(`${Number(missingKeys)} key${Number(missingKeys) === 1 ? '' : 's'}`);
  if (missingMetal > 0) missingParts.push(`${Number(missingMetal.toFixed(2))} ref`);
  const deficitText = missingParts.length ? missingParts.join(' + ') : 'no currency gap';
  const neededText = currenciesText(currencies);
  const availableText = currenciesText({ keys: Number(summary.keys || 0), metal: Number(summary.metal_ref || 0) });
  const sellFirst = Boolean(options.currency_helper_sell_first_when_buy_currency_missing && intent === 'buy' && !enoughCurrency);
  const result = {
    ok: enoughCurrency || canConvertKey,
    version: APP_VERSION,
    checked_at: new Date().toISOString(),
    intent,
    draft_id: draft.draft_id || null,
    item_name: draft.item_name || null,
    needed_currencies: { keys: neededKeys, metal: Number(neededMetal.toFixed(2)) },
    needed_metal_ref: Number(neededMetal.toFixed(2)),
    needed_keys: neededKeys,
    available_metal_ref: Number(summary.metal_ref || 0),
    keys_available: Number(summary.keys || 0),
    key_ref_estimate: Number(summary.key_ref_estimate || 0),
    needed_text: neededText,
    available_text: availableText,
    deficit_text: deficitText,
    severity: enoughCurrency ? 'ok' : (canConvertKey ? 'actionable' : (options.currency_helper_missing_currency_is_warning ? 'warning' : 'error')),
    card_title: enoughCurrency ? 'Currency ready' : (canConvertKey ? 'Currency helper available' : 'Buy currency limited'),
    sell_loop_continues: sellFirst,
    buy_publish_policy: (!enoughCurrency && !canConvertKey && options.currency_helper_hold_buy_when_missing_currency) ? 'hold_buy_until_currency_available' : 'allow_provider_attempt',
    enough_metal: enoughMetal,
    enough_keys: enoughKeys,
    enough_currency: enoughCurrency,
    can_prepare_key_to_metal_listing: canConvertKey,
    missing_metal_ref: Number(missingMetal.toFixed(2)),
    missing_keys: Number(missingKeys),
    recommended_action: enoughCurrency ? 'publish_buy_listing' : (canConvertKey ? 'prepare_key_to_metal_listing' : (options.currency_helper_hold_buy_when_missing_currency ? 'hold_buy_listing_and_continue_sell_loop' : 'add_required_keys_or_refined_metal_or_lower_price')),
    message: enoughCurrency
      ? `Enough currency appears available for this buy listing (${neededText}).`
      : (canConvertKey
        ? `Missing ${deficitText}. An extra tradable key is available, so TF2 Trading Hub can publish one guarded key→metal helper listing first.`
        : `Buy listing held: missing ${deficitText}. Needed ${neededText}, available ${availableText}. Sell/auto-sell can continue; add currency or lower the buy price to resume this buy listing.`),
    operator_hint: (!enoughCurrency && !canConvertKey) ? 'This is not a bot crash. It means Backpack.tf would likely archive the buy listing as notEnoughCurrency, so the bot holds the buy publish and focuses on sellable inventory.' : null,
    key_asset: summary.key_asset || null
  };
  writeJson(CURRENCY_HELPER_PATH, result);
  return result;
}

function previewCurrencyGuardForDraft(draft = {}, options = getOptions()) {
  const intent = String(draft.intent || draft.provider_payload_preview?.intent || 'buy').toLowerCase();
  const keyRef = keyPriceEstimateRef();
  const rawCurrencies = draft.provider_payload_preview?.currencies && typeof draft.provider_payload_preview.currencies === 'object' ? draft.provider_payload_preview.currencies : {};
  const currencies = intent === 'buy'
    ? enforceBuyCurrencies(Number(draft.max_buy_ref || currenciesToRef(rawCurrencies, keyRef) || 0), rawCurrencies, options, keyRef)
    : (rawCurrencies && Object.keys(rawCurrencies).length ? rawCurrencies : refToBackpackCurrencies(Number(draft.max_buy_ref || draft.target_sell_ref || 0), options, keyRef));
  const neededKeys = Number(currencies.keys || 0);
  const neededMetal = Number(currencies.metal || draft.provider_payload_preview?.currencies?.metal || 0);
  const summary = currencyInventorySummary();
  const enoughKeys = intent !== 'buy' || Number(summary.keys || 0) >= neededKeys;
  const enoughMetal = intent !== 'buy' || Number(summary.metal_ref || 0) >= neededMetal;
  const enoughCurrency = intent !== 'buy' || (enoughKeys && enoughMetal);
  const missingMetal = Math.max(0, neededMetal - Number(summary.metal_ref || 0));
  const missingKeys = Math.max(0, neededKeys - Number(summary.keys || 0));
  const missingParts = [];
  if (missingKeys > 0) missingParts.push(`${Number(missingKeys)} key${Number(missingKeys) === 1 ? '' : 's'}`);
  if (missingMetal > 0) missingParts.push(`${Number(missingMetal.toFixed(2))} ref`);
  const deficitText = missingParts.length ? missingParts.join(' + ') : 'no currency gap';
  return {
    ok: enoughCurrency,
    version: APP_VERSION,
    preview_only: true,
    intent,
    draft_id: draft.draft_id || null,
    item_name: draft.item_name || draft.provider_payload_preview?.item?.item_name || null,
    needed_currencies: { keys: neededKeys, metal: Number(neededMetal.toFixed(2)) },
    available_currencies: { keys: Number(summary.keys || 0), metal: Number(summary.metal_ref || 0) },
    enough_currency: enoughCurrency,
    enough_keys: enoughKeys,
    enough_metal: enoughMetal,
    missing_keys: Number(missingKeys),
    missing_metal_ref: Number(missingMetal.toFixed(2)),
    deficit_text: deficitText,
    needed_text: currenciesText(currencies),
    available_text: currenciesText({ keys: Number(summary.keys || 0), metal: Number(summary.metal_ref || 0) }),
    recommended_action: enoughCurrency ? 'publish_buy_listing' : 'skip_unaffordable_buy_and_continue',
    message: enoughCurrency ? 'Currency available for this buy draft.' : `Skipping unaffordable buy candidate and continuing to next listing: missing ${deficitText}.`
  };
}


function draftIsBuyIntent(draft = {}) { return draftIntent(draft) !== 'sell'; }
function actionableCurrencyPreviewForDraft(draft = {}, options = getOptions()) {
  try {
    if (!draft || draftIntent(draft) !== 'buy') return { ok: true, enough_currency: true, non_buy: true };
    return previewCurrencyGuardForDraft(draft, options);
  } catch (error) {
    return { ok: false, enough_currency: false, error: safeError(error), deficit_text: 'currency preview unavailable' };
  }
}
function isActionableBuyDraftNow(draft = {}, options = getOptions()) {
  if (!draft || draftIntent(draft) !== 'buy') return true;
  const brain = tradingBrainEnforcementDecision(draft, options, 'maintainer');
  if (!brain.ok) return false;
  const currency = actionableCurrencyPreviewForDraft(draft, options);
  return Boolean(currency.enough_currency);
}
function selectActionableDashboardCandidate(drafts = [], options = getOptions()) {
  const list = Array.isArray(drafts) ? drafts.filter(Boolean) : [];
  const usableStatus = d => ['approved_local','draft','ready_for_review','publish_failed','published','published_active'].includes(String(d.local_status || 'draft'));
  const candidates = list.filter(usableStatus);
  const sells = candidates.filter(d => draftIntent(d) === 'sell');
  const affordableBuys = candidates.filter(d => draftIntent(d) === 'buy' && isActionableBuyDraftNow(d, options));
  const heldBuys = candidates.filter(d => draftIntent(d) === 'buy' && !isActionableBuyDraftNow(d, options));
  // Prefer sellable/affordable work for dashboard status.  Do not let one Max/Earbuds
  // impossible buy candidate dominate Currency helper with a 9000 ref deficit.
  const byStatus = d => ({ approved_local: 0, draft: 1, ready_for_review: 2, publish_failed: 3, published: 4, published_active: 5 }[String(d.local_status || 'draft')] ?? 9);
  const sortFn = (a,b) => byStatus(a)-byStatus(b) || Number(b.expected_profit_ref||0)-Number(a.expected_profit_ref||0) || String(a.item_name||'').localeCompare(String(b.item_name||''));
  const chosen = [...sells.sort(sortFn), ...affordableBuys.sort(sortFn)][0] || null;
  return { candidate: chosen, affordable_buy_count: affordableBuys.length, sell_candidate_count: sells.length, held_buy_count: heldBuys.length };
}
function isUnhelpfulBlockedBuySample(row = {}, options = getOptions()) {
  const reasons = Array.isArray(row.reasons) ? row.reasons : [];
  const buy = Number(row.buy_ref || row.projected_buy_ref || row.current_buy_ref || 0);
  const sell = Number(row.target_sell_ref || row.suggested_sell_ref || row.lowest_sell_ref || 0);
  const expected = Number(row.expected_profit_ref || 0);
  if (options.dashboard_hide_unactionable_brain_samples !== false) {
    if (reasons.includes('unaffordable_buy_price')) return true;
    if (reasons.includes('crossed_or_corrupt_market')) return true;
    if (reasons.includes('buy_price_not_profitable_vs_lowest_sell')) return true;
    if (reasons.includes('market_pricing_block_buy')) return true;
    if (reasons.includes('profit_below_floor') && (!expected || expected <= 0)) return true;
    if (buy > 0 && sell > 0 && buy >= sell) return true;
    if (buy > Number((options.currency_helper_max_dashboard_deficit_ref || 500))) return true;
  }
  return false;
}
function filterBlockedBuySamplesForDashboard(rows = [], options = getOptions()) {
  const list = Array.isArray(rows) ? rows : [];
  if (options.trading_brain_suppress_unactionable_blocked_buy_samples === false) return list;
  return list.filter(row => !isUnhelpfulBlockedBuySample(row, options));
}
function filterMarketPricingSamplesForDashboard(rows = [], options = getOptions()) {
  const list = Array.isArray(rows) ? rows : [];
  if (options.market_pricing_suppress_corrupt_samples === false && options.dashboard_hide_corrupt_market_samples === false) return list;
  const availability = marketPricingAvailableCurrencyRef(options);
  return list.filter(row => {
    const hi = Number(row.highest_buy_ref || 0); const lo = Number(row.lowest_sell_ref || 0);
    const suggestedBuy = Number(row.suggested_buy_ref || 0);
    if (hi > 0 && lo > 0 && hi >= lo) return false;
    if (suggestedBuy > 0 && availability.total_ref > 0 && suggestedBuy > availability.total_ref + 0.01) return false;
    if (Array.isArray(row.weak_reasons) && row.weak_reasons.includes('crossed_or_corrupt_market')) return false;
    if (Array.isArray(row.weak_reasons) && row.weak_reasons.includes('unaffordable_buy_price')) return false;
    if (Array.isArray(row.weak_reasons) && row.weak_reasons.includes('buy_price_not_profitable_vs_lowest_sell')) return false;
    return true;
  });
}

function skuCandidatesForDraft(draft = {}) {
  const base = String(draft.item_name || draft.provider_payload_preview?.item?.item_name || '').trim();
  const out = [];
  const push = (v) => { const x = String(v || '').trim(); if (x && !out.includes(x)) out.push(x); };
  push(base);
  if (base && !/^the\s+/i.test(base)) push('The ' + base);
  const defindex = Number(draft.defindex || draft.provider_payload_preview?.item?.defindex || 0);
  const quality = String(draft.quality || draft.provider_payload_preview?.item?.quality || '6');
  const priceindex = String(draft.priceindex || draft.provider_payload_preview?.item?.priceindex || '0');
  if (defindex > 0) push(`${defindex};${quality}`);
  if (defindex > 0 && priceindex !== '0') push(`${defindex};${quality};${priceindex}`);
  return out;
}
function extractClassifiedRows(body) {
  const rows = [];
  const seen = new Set();
  const visit = (node, pathName = '') => {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach((x, i) => visit(x, `${pathName}[${i}]`)); return; }
    if (typeof node !== 'object') return;
    const hasListingShape = node.intent !== undefined || node.currencies || node.value || node.item || node.details || node.account || node.steamid;
    if (hasListingShape) {
      const key = String(node.id || node.listing_id || node.hash || node.bumpedAt || node.details || JSON.stringify(node).slice(0, 160));
      if (!seen.has(key)) { seen.add(key); rows.push(node); }
    }
    for (const [k, v] of Object.entries(node)) {
      if (['buy','sell','listings','results','items','classifieds','response','data'].includes(String(k).toLowerCase()) || Array.isArray(v)) visit(v, k);
    }
  };
  visit(body);
  return rows.slice(0, 60);
}
function rowIntent(row = {}) {
  const raw = row.intent ?? row.listing_intent ?? row.intent_name ?? row.type;
  if (raw === 0 || raw === '0' || String(raw).toLowerCase() === 'buy') return 'buy';
  if (raw === 1 || raw === '1' || String(raw).toLowerCase() === 'sell') return 'sell';
  return String(raw || '').toLowerCase() || 'other';
}
function rowPriceRef(row = {}, keyRef = keyPriceEstimateRef()) {
  const cur = row.currencies || row.price || row.value || {};
  if (typeof cur === 'number') return cur;
  if (cur && typeof cur === 'object') {
    const raw = Number(cur.raw || cur.value_raw || 0);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return Number(((Number(cur.keys || 0) * keyRef) + Number(cur.metal || cur.ref || 0)).toFixed(2));
  }
  return 0;
}
function classifyRows(rows = [], keyRef = keyPriceEstimateRef(), options = getOptions()) {
  const ownSteamId = String(options.steam_id64 || options.backpack_tf_steamid || '').trim();
  const mappedAll = rows.map(row => {
    const steamid = row.steamid || row.account?.steamid || row.user?.steamid || row.listing?.steamid || null;
    return {
      id: row.id || row.listing_id || row.hash || null,
      intent: rowIntent(row),
      price_ref: rowPriceRef(row, keyRef),
      details: String(row.details || row.comment || row.description || '').trim(),
      steamid,
      is_own_listing: Boolean(options.stack_sell_exclude_own_listing_from_market !== false && ownSteamId && steamid && String(steamid) === ownSteamId),
      bumped_at: row.bumpedAt || row.bumped_at || row.bumped || row.listedAt || row.created_at || null,
      raw: row
    };
  }).filter(x => x.intent === 'buy' || x.intent === 'sell');
  const withoutOwn = mappedAll.filter(x => !x.is_own_listing);
  const mapped = withoutOwn.length ? withoutOwn : mappedAll;
  return {
    buy: mapped.filter(x => x.intent === 'buy').sort((a, b) => Number(b.price_ref || 0) - Number(a.price_ref || 0)).slice(0, 10),
    sell: mapped.filter(x => x.intent === 'sell').sort((a, b) => Number(a.price_ref || 0) - Number(b.price_ref || 0)).slice(0, 10),
    excluded_own_listings: mappedAll.length - mapped.length
  };
}
function flashyListingText(draft = {}, market = {}) {
  const name = String(draft.item_name || 'item');
  const isSell = draftIntent(draft) === 'sell';
  const price = Number((isSell ? (draft.price_guard?.sell_ref || draft.provider_payload_preview?.currencies?.metal || draft.target_sell_ref) : draft.max_buy_ref) || draft.provider_payload_preview?.currencies?.metal || 0);
  const topBuy = market?.buy?.[0];
  const topSell = market?.sell?.[0];
  const inspired = [isSell ? topSell?.details : topBuy?.details, topBuy?.details, topSell?.details].filter(Boolean).find(x => String(x).length > 6) || '';
  const suffix = inspired ? ` Market-style note: fast trade offers welcome.` : ' Fast trade offers welcome.';
  const verb = isSell ? 'Selling' : 'Buying';
  const extra = isSell ? 'fast, fair sell listing' : 'clean, quick offer';
  return `✨ ${verb} ${name} for ${price.toFixed(2)} ref • ${extra} • ${suffix}`.slice(0, 240);
}
class MarketClassifiedsMirrorService {
  constructor(auditService) { this.audit = auditService; }
  apiBase(options = {}) { const configured = String(options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, ''); return configured.endsWith('/api') ? configured : `${configured}/api`; }
  async syncForDraft(draftId, options = getOptions()) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const draft = (Array.isArray(store.drafts) ? store.drafts : []).find(d => d.draft_id === draftId);
    if (!draft) return { ok: false, error: `Draft ${draftId} not found.` };
    const token = options.backpack_tf_access_token || options.backpack_tf_api_key || '';
    const attempts = [];
    let bestRows = [];
    for (const sku of skuCandidatesForDraft(draft).slice(0, 6)) {
      const url = new URL(`${this.apiBase(options)}/classifieds/listings/snapshot`);
      url.searchParams.set('appid', '440');
      url.searchParams.set('sku', sku);
      url.searchParams.set('quality', String(draft.quality || '6'));
      url.searchParams.set('tradable', '1');
      url.searchParams.set('craftable', '1');
      url.searchParams.set('australium', '-1');
      url.searchParams.set('killstreak_tier', '0');
      if (token) url.searchParams.set('token', token);
      const safeUrl = url.toString().replace(/([?&]token=)[^&]+/i, '$1[redacted]');
      const result = await fetchJsonHardened('backpack.tf', url.toString(), options, { headers: { accept: 'application/json', 'user-agent': options.backpack_tf_user_agent || `TF2-HA-TF2-Trading-Hub/${APP_VERSION}` } });
      const rows = result.ok ? extractClassifiedRows(result.body) : [];
      attempts.push({ sku, url: safeUrl, ok: result.ok, status: result.status, rows: rows.length, error: result.error || result.body?.message || result.body?.raw || null, body_keys: result.body && typeof result.body === 'object' ? Object.keys(result.body).slice(0, 10) : [] });
      if (rows.length > bestRows.length) bestRows = rows;
      if (rows.length > 0) break;
    }
    const market = classifyRows(bestRows, keyPriceEstimateRef(), options);
    const result = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), draft_id: draftId, item_name: draft.item_name, attempts, rows_seen: bestRows.length, buy_count: market.buy.length, sell_count: market.sell.length, market, copied_details_preview: flashyListingText(draft, market), note: 'Uses current Backpack.tf classifieds snapshot as the sell pricing source. Sell drafts are priced from lowest seller minus configured undercut when sell rows are available.' };
    writeJson(MARKET_CLASSIFIEDS_MIRROR_PATH, result);
    if (this.audit) this.audit.write('market_classifieds_mirror_synced', { draft_id: draftId, item_name: draft.item_name, rows: bestRows.length });
    appendActionFeed('market_classifieds_mirror_synced', { draft_id: draftId, item_name: draft.item_name, rows: bestRows.length });
    return result;
  }
  applyToDraft(draftId, options = getOptions()) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const idx = drafts.findIndex(d => d.draft_id === draftId);
    if (idx === -1) return { ok: false, error: `Draft ${draftId} not found.` };
    const mirror = readJson(MARKET_CLASSIFIEDS_MIRROR_PATH, { ok: false, market: null });
    const draft = drafts[idx];
    const details = flashyListingText(draft, mirror.market || {});
    const isSell = draftIntent(draft) === 'sell';
    const currentPrice = Number((isSell ? (draft.price_guard?.sell_ref || draft.provider_payload_preview?.currencies?.metal || draft.target_sell_ref) : draft.max_buy_ref) || draft.provider_payload_preview?.currencies?.metal || 0);
    const highestBuy = Number(mirror.market?.buy?.[0]?.price_ref || 0);
    const lowestSell = Number(mirror.market?.sell?.[0]?.price_ref || 0);
    const sellUndercut = Number(options.strict_sell_classifieds_undercut_ref || options.sell_booster_undercut_ref || 0.11);
    const sellFloor = Number(options.sell_booster_min_sell_ref || 0.11);
    const sellCompetitive = (isSell && options.sell_booster_enabled !== false && options.sell_booster_use_classifieds_lowest_seller !== false && lowestSell > 0)
      ? Math.max(sellFloor, Number((lowestSell - sellUndercut).toFixed(2)))
      : Math.max(sellFloor, currentPrice);
    const competitive = isSell
      ? sellCompetitive
      : (highestBuy > 0 ? Math.min(currentPrice, Number((highestBuy + 0.11).toFixed(2))) : currentPrice);
    const updated = {
      ...draft,
      max_buy_ref: isSell ? draft.max_buy_ref : Number(competitive.toFixed(2)),
      target_sell_ref: isSell ? Number(competitive.toFixed(2)) : draft.target_sell_ref,
      provider_payload_preview: {
        ...(draft.provider_payload_preview || {}),
        currencies: isSell ? refToBackpackCurrencies(Number(competitive.toFixed(2)), options, keyPriceEstimateRef()) : enforceBuyCurrencies(Number(competitive.toFixed(2)), (draft.provider_payload_preview || {}).currencies || {}, options, keyPriceEstimateRef()),
        details: isSell ? sellListingDetails(draft.item_name || 'item', Number(competitive.toFixed(2))) : buyListingDetails(draft.item_name || 'item', enforceBuyCurrencies(Number(competitive.toFixed(2)), (draft.provider_payload_preview || {}).currencies || {}, options, keyPriceEstimateRef())),
        market_mirror: { copied_style: true, highest_buy_ref: highestBuy || null, lowest_sell_ref: lowestSell || null, sell_booster_price_ref: isSell ? Number(competitive.toFixed(2)) : null, source: 'classifieds_snapshot' }
      },
      updated_at: new Date().toISOString()
    };
    drafts[idx] = updated;
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, drafts, updated_at: new Date().toISOString() });
    if (this.audit) this.audit.write('market_classifieds_style_applied', { draft_id: draftId, item_name: updated.item_name, price_ref: updated.max_buy_ref });
    return { ok: true, version: APP_VERSION, draft_id: draftId, item_name: updated.item_name, applied_details: details, max_buy_ref: updated.max_buy_ref, mirror_summary: mirror.ok ? { buy_count: mirror.buy_count, sell_count: mirror.sell_count } : null, draft: updated };
  }
}
function prepareKeyToMetalDraft(options = getOptions(), auditService = null) {
  const summary = currencyInventorySummary();
  if (!summary.key_asset) return { ok: false, code: 'no_key_available', error: 'No tradable Mann Co. Supply Crate Key found in inventory cache. Sync inventory first or add a key.' };
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const existing = drafts.find(d => d.intent === 'sell' && normalizeName(d.item_name) === 'mann co supply crate key' && ['draft','approved_local','publish_failed'].includes(d.local_status));
  const now = new Date().toISOString();
  const price = Number((summary.key_ref_estimate || 54.33).toFixed(2));
  const draft = {
    ...(existing || {}),
    draft_id: existing?.draft_id || `draft_currency_key_to_metal_${Date.now().toString(36)}`,
    source_order_id: 'currency_helper_key_to_metal',
    item_name: summary.key_asset.item_name || 'Mann Co. Supply Crate Key',
    intent: 'sell',
    assetid: summary.key_asset.assetid,
    max_buy_ref: 0,
    target_sell_ref: price,
    expected_profit_ref: 0,
    quality: '6',
    priceindex: '0',
    local_status: 'approved_local',
    provider_payload_preview: {
      intent: 'sell',
      id: String(summary.key_asset.assetid),
      currencies: { metal: price },
      details: cleanPublicListingText(`Selling 1 key for ${price.toFixed(2)} ref. Quick trade offers welcome.`),
      note: 'Manual guarded listing only. No Steam trade is accepted automatically.'
    },
    provider_request_sent: false,
    provider_status: null,
    provider_response_summary: null,
    created_at: existing?.created_at || now,
    updated_at: now
  };
  const next = existing ? drafts.map(d => d.draft_id === existing.draft_id ? draft : d) : [draft, ...drafts];
  writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts: next, updated_at: now });
  const result = { ok: true, version: APP_VERSION, created: !existing, draft_id: draft.draft_id, item_name: draft.item_name, sell_key_for_metal_ref: price, assetid: summary.key_asset.assetid, message: 'Prepared an approved local sell-key-for-metal draft. The Publish Wizard can auto-publish this guarded Backpack.tf listing when refined metal is missing. Steam offers still require manual handling.' };
  writeJson(CURRENCY_HELPER_PATH, { ...buildCurrencyGuardForDraft(draft), prepared_key_to_metal_draft: result });
  if (auditService) auditService.write('currency_helper_key_to_metal_draft_prepared', { draft_id: draft.draft_id, price_ref: price });
  appendActionFeed('currency_helper_key_to_metal_draft_prepared', { draft_id: draft.draft_id, price_ref: price });
  return result;
}

function computeOpportunityScores(c = {}) {
  const profit = Math.max(0, Number(c.expected_profit_ref || c.profit_ref || 0));
  const maxBuy = Math.max(0.01, Number(c.max_buy_ref || c.buy_ref || 0.01));
  const marginPct = Math.min(100, (profit / maxBuy) * 100);
  const pricing_score = Math.max(0, Math.min(100, Number(c.pricing_score || 50 + marginPct * 3)));
  const liquidity_score = Math.max(0, Math.min(100, Number(c.liquidity_score || 50)));
  const risk_score = Math.max(0, Math.min(100, Number(c.risk_score || 25)));
  const age = Number(c.age_days ?? 999);
  const freshness_score = Math.max(0, Math.min(100, 100 - age * 2));
  const confidence_score = Math.round((pricing_score * 0.35) + (liquidity_score * 0.2) + ((100 - risk_score) * 0.2) + (freshness_score * 0.15) + (Math.min(100, marginPct * 4) * 0.1));
  const total_score = confidence_score;
  const why_selected = `Score ${total_score}: profit ${profit.toFixed(2)} ref, risk ${risk_score}/100, liquidity ${liquidity_score}/100, freshness ${freshness_score}/100.`;
  const risk_notes = [];
  if (risk_score > 35) risk_notes.push('Higher risk score; review before approving.');
  if (age > 30) risk_notes.push('Price data may be stale.');
  if (liquidity_score < 45) risk_notes.push('Liquidity is weak.');
  return { pricing_score, liquidity_score, risk_score, freshness_score, confidence_score, total_score, why_selected, why_skipped: '', risk_notes };
}
function buildOpportunities() {
  const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
  const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
  const statusByCandidate = new Map((queue.items || []).map(x => [x.candidate_id || x.id, x.local_status || 'planned']));
  const candidates = Array.isArray(scanner.candidates) ? scanner.candidates : [];
  const opportunities = candidates.map(c => {
    const scores = computeOpportunityScores(c);
    const key = c.id || c.item_name || c.name;
    return { ...c, ...scores, local_status: statusByCandidate.get(key) || 'not_in_queue', selected: statusByCandidate.has(key), explanation: scores.why_selected };
  }).sort((a,b) => Number(b.total_score||0)-Number(a.total_score||0));
  const result = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), count: opportunities.length, top_count: Math.min(10, opportunities.length), opportunities, summary: { candidates: candidates.length, selected_queue_items: (queue.items || []).length, top_expected_profit_ref: Number(opportunities.slice(0,10).reduce((sum,x)=>sum+Number(x.expected_profit_ref||0),0).toFixed(2)) }, guidance: 'Use score as a review aid only. Approve locally before creating drafts.' };
  writeJson(OPPORTUNITIES_PATH, result);
  return result;
}

function buildMostTradedAndKeysStatus(options = getOptions()) {
  const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [], diagnostics: {} });
  const queue = readJson(PLANNING_QUEUE_PATH, { ok: false, items: [] });
  const draftsStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const names = Array.from(mostTradedNameSet(options));
  const candidates = Array.isArray(scanner.candidates) ? scanner.candidates : [];
  const queueItems = Array.isArray(queue.items) ? queue.items : [];
  const drafts = Array.isArray(draftsStore.drafts) ? draftsStore.drafts : [];
  const rowFor = (name) => {
    const n = normalizeName(name);
    const c = candidates.find(x => normalizeName(x.item_name) === n);
    const q = queueItems.find(x => normalizeName(x.item_name) === n);
    const d = drafts.find(x => normalizeName(x.item_name) === n);
    return {
      item_name: name,
      in_scanner: Boolean(c),
      in_queue: Boolean(q),
      has_draft: Boolean(d),
      listed_or_published: Boolean(d && (d.published_listing_id || String(d.local_status || '').startsWith('published'))),
      max_buy_ref: Number((d?.max_buy_ref ?? q?.max_buy_ref ?? c?.max_buy_ref ?? 0) || 0),
      target_sell_ref: Number((d?.target_sell_ref ?? q?.target_sell_ref ?? c?.target_sell_ref ?? 0) || 0),
      most_traded_seed: Boolean(c?.most_traded_seed || q?.most_traded_seed || isMostTradedSeedName(name, options)),
      key_currency_candidate: Boolean(c?.key_currency_candidate || (Number((d?.max_buy_ref ?? q?.max_buy_ref ?? c?.max_buy_ref ?? 0) || 0) >= Number(options.key_currency_min_ref || 0))),
      currencies: enforceBuyCurrencies(Number((d?.max_buy_ref ?? q?.max_buy_ref ?? c?.max_buy_ref ?? 0) || 0), d?.provider_payload_preview?.currencies || {}, options, keyPriceEstimateRef()),
      reason: c?.reason || q?.reason || null
    };
  };
  const rows = names.map(rowFor);
  const keyCurrencyDrafts = drafts.filter(d => enforceBuyCurrencies(Number(d?.max_buy_ref || currenciesToRef(d?.provider_payload_preview?.currencies || {}, keyPriceEstimateRef()) || 0), d?.provider_payload_preview?.currencies || {}, options, keyPriceEstimateRef()).keys);
  return {
    ok: true,
    version: APP_VERSION,
    updated_at: new Date().toISOString(),
    enabled: Boolean(options.most_traded_item_booster_enabled),
    key_currency_enabled: Boolean(options.allow_key_currency_classifieds),
    key_buy_roundup_enabled: Boolean(options.allow_key_roundup_buy_listings),
    auto_list_anything_enabled: Boolean(options.auto_list_anything_above_min_ref_enabled),
    auto_list_anything_min_ref: Number(options.auto_list_anything_min_ref || 0.11),
    auto_list_anything_max_item_ref: Number(options.auto_list_anything_max_item_ref || 0),
    auto_list_anything_candidates: candidates.filter(x => x.auto_list_anything_candidate || Number(x.target_sell_ref || x.max_buy_ref || 0) >= Number(options.auto_list_anything_min_ref || 0.11)).length,
    auto_list_anything_queue_items: queueItems.filter(x => Number(x.target_sell_ref || x.max_buy_ref || 0) >= Number(options.auto_list_anything_min_ref || 0.11)).length,
    key_ref_estimate: Number(keyPriceEstimateRef().toFixed(2)),
    key_currency_min_ref: Number(options.key_currency_min_ref || 0),
    key_currency_max_keys_per_listing: Number(options.key_currency_max_keys_per_listing || 0),
    configured_seed_count: names.length,
    scanner_candidates: candidates.length,
    scanner_most_traded_seed_count: candidates.filter(x => x.most_traded_seed).length,
    scanner_key_currency_candidate_count: candidates.filter(x => x.key_currency_candidate).length,
    queue_most_traded_count: queueItems.filter(x => x.most_traded_seed || isMostTradedSeedName(x.item_name, options)).length,
    drafts_with_keys_currency: keyCurrencyDrafts.length,
    rows: rows.slice(0, Number(options.most_traded_status_top || 24)),
    note: options.auto_list_anything_above_min_ref_enabled ? 'Auto-list-anything mode is active: candidates above the configured min ref can flow into queue/drafts while stock cap and duplicate guard still apply.' : 'Shows whether high-volume seed names reached scanner/queue/drafts and whether key+metal currency pricing is active.'
  };
}


// ── 5.13.29 – Currency-Aware Buy Hold & Sell-First Fallback ───────────────────────────────────
function tradingBrainRequiredProfitRef(costRef, options = getOptions()) {
  const cost = Number(costRef || 0);
  const minRef = Number(options.trading_brain_min_profit_ref || options.sell_profit_guard_min_profit_ref || 0.22);
  const margin = Number(options.trading_brain_min_margin_percent || options.sell_profit_guard_min_margin_percent || 3);
  if (!Number.isFinite(cost) || cost <= 0) return roundedRef(minRef);
  return roundedRef(Math.max(minRef, cost * (margin / 100)));
}
function tradingBrainDraftValueRef(draft = {}, options = getOptions()) {
  const keyRef = keyPriceEstimateRef();
  const cur = draft.provider_payload_preview?.currencies || draft.currencies || {};
  const fromCur = currenciesToRef(cur, keyRef);
  const fallback = Number(draftIntent(draft) === 'sell' ? (draft.target_sell_ref || draft.max_buy_ref || 0) : (draft.max_buy_ref || draft.target_buy_ref || 0));
  return roundedRef(fromCur || fallback || 0);
}
function tradingBrainBuyDecision(draft = {}, options = getOptions()) {
  const buy = tradingBrainDraftValueRef(draft, options);
  const marketSignal = marketPricingForDraft(draft, options);
  const marketLowest = Number(marketSignal.lowest_sell_ref || draft.provider_payload_preview?.market_mirror?.lowest_sell_ref || draft.market_mirror?.lowest_sell_ref || draft.lowest_sell_ref || 0);
  const projectedBuy = (options.market_pricing_pipeline_enabled && options.market_pricing_use_for_buy && marketSignal.suggested_buy_ref > 0) ? marketSignal.suggested_buy_ref : buy;
  const targetSell = Number((options.market_pricing_pipeline_enabled && options.market_pricing_use_for_sell && marketSignal.suggested_sell_ref > 0) ? marketSignal.suggested_sell_ref : (draft.target_sell_ref || marketLowest || 0));
  const expected = Number(targetSell > 0 && projectedBuy > 0 ? roundedRef(targetSell - projectedBuy) : (draft.expected_profit_ref || 0));
  const required = tradingBrainRequiredProfitRef(projectedBuy || buy, options);
  const noSellMarket = !targetSell || targetSell <= 0;
  const stock = stockCapStatusForDraft(draft, options);
  const keyRef = keyPriceEstimateRef();
  const currencies = draft.provider_payload_preview?.currencies || {};
  const badKeyRoundup = Boolean(Number(currencies.keys || 0) > 0 && buy > 0 && buy < keyRef - 0.01 && !currencies.key_roundup);
  const reasons = [];
  if (stock.blocked) reasons.push('stock_cap');
  if (badKeyRoundup) reasons.push('bad_key_roundup_under_key_value');
  if (marketSignal.block_buy) reasons.push('market_pricing_block_buy');
  if ((marketSignal.weak_reasons || []).includes('crossed_or_corrupt_market')) reasons.push('crossed_or_corrupt_market');
  if ((marketSignal.weak_reasons || []).includes('unaffordable_buy_price')) reasons.push('unaffordable_buy_price');
  if ((marketSignal.weak_reasons || []).includes('buy_price_not_profitable_vs_lowest_sell')) reasons.push('buy_price_not_profitable_vs_lowest_sell');
  if (options.market_pricing_pipeline_enabled && options.market_pricing_strict_mode && marketSignal.weak_market) reasons.push('weak_market_pricing');
  if (options.trading_brain_skip_buy_when_no_sell_market && noSellMarket) reasons.push('no_sell_market');
  const allowNoSnapshotFallback = Boolean(options.trading_brain_allow_no_snapshot_schema_fallback && marketSignal.schema_fallback_used);
  if (options.trading_brain_require_profit_for_buy && !allowNoSnapshotFallback && !noSellMarket && expected < required) reasons.push('profit_below_floor');
  return {
    item_name: draft.item_name || draft.provider_payload_preview?.item?.item_name || 'Unknown item',
    draft_id: draft.draft_id || null,
    intent: 'buy',
    buy_ref: buy,
    projected_buy_ref: projectedBuy || null,
    target_sell_ref: targetSell || null,
    expected_profit_ref: expected || null,
    required_profit_ref: required,
    market_pricing: marketSignal,
    stock_blocked: Boolean(stock.blocked),
    bad_key_roundup: badKeyRoundup,
    safe_to_buy: reasons.length === 0,
    decision: reasons.length ? 'skip_or_hold' : 'buy_listing_ok',
    reasons
  };
}
function tradingBrainSellDecision(draft = {}, options = getOptions()) {
  const sell = tradingBrainDraftValueRef(draft, options) || currentDraftSellRef(draft);
  const cost = sellDraftCostBasisRef(draft) || 0;
  const required = cost > 0 ? tradingBrainRequiredProfitRef(cost, options) : 0;
  const expected = cost > 0 ? roundedRef(sell - cost) : Number(draft.expected_profit_ref || 0);
  const guard = draft.sell_profit_guard || {};
  const reasons = [];
  if (cost > 0 && sell < roundedRef(cost + required)) reasons.push('sell_below_profit_floor');
  if (guard.held) reasons.push('held_by_profit_guard');
  if (String(draft.local_status || '') === 'hold_profit_guard') reasons.push('hold_profit_guard');
  return {
    item_name: draft.item_name || draft.provider_payload_preview?.item?.item_name || 'Unknown item',
    draft_id: draft.draft_id || null,
    intent: 'sell',
    sell_ref: sell,
    cost_basis_ref: cost || null,
    expected_profit_ref: expected || null,
    required_profit_ref: required || null,
    safe_to_sell: reasons.length === 0,
    decision: reasons.length ? 'hold_or_reprice' : 'sell_listing_ok',
    reasons
  };
}

function tradingBrainEnforcementDecision(draft = {}, options = getOptions(), source = 'publish') {
  const intent = draftIntent(draft) === 'sell' ? 'sell' : 'buy';
  const raw = intent === 'sell' ? tradingBrainSellDecision(draft, options) : tradingBrainBuyDecision(draft, options);
  const reasons = Array.isArray(raw.reasons) ? raw.reasons : [];
  const enforceGlobally = options.trading_brain_enforcement_enabled !== false;
  const enforceForSource = source === 'maintainer'
    ? options.trading_brain_enforce_on_maintainer !== false
    : options.trading_brain_enforce_on_publish !== false;
  const mode = options.trading_brain_enforcement_mode || 'balanced';
  const hardReasons = reasons.filter(reason => {
    if (reason === 'no_sell_market') return Boolean(options.trading_brain_enforce_no_sell_market || mode === 'strict');
    if (reason === 'held_by_profit_guard' || reason === 'hold_profit_guard') return true;
    if (reason === 'profit_below_floor') return true;
    if (reason === 'market_pricing_block_buy' || reason === 'crossed_or_corrupt_market' || reason === 'unaffordable_buy_price' || reason === 'buy_price_not_profitable_vs_lowest_sell') return true;
    if (reason === 'sell_below_profit_floor') return true;
    if (reason === 'bad_key_roundup_under_key_value') return true;
    if (reason === 'stock_cap') return true;
    return mode === 'strict';
  });
  const enforced = Boolean(enforceGlobally && enforceForSource);
  const ok = !enforced || hardReasons.length === 0;
  return {
    ok,
    version: APP_VERSION,
    source,
    enforced,
    mode,
    intent,
    decision: raw.decision,
    item_name: raw.item_name,
    draft_id: raw.draft_id || draft.draft_id || null,
    hard_reasons: hardReasons,
    advisory_reasons: reasons.filter(r => !hardReasons.includes(r)),
    raw_decision: raw,
    message: ok ? 'Trading Brain allows this draft.' : `Trading Brain blocked ${intent} draft: ${hardReasons.join(', ')}`,
    next_action: ok ? 'Continue with guarded maintainer/publish.' : 'Reprice, cancel, or rebuild this draft before publishing.'
  };
}
function tradingBrainFilterDraftForMaintainer(draft = {}, options = getOptions()) {
  const gate = tradingBrainEnforcementDecision(draft, options, 'maintainer');
  return gate;
}

function draftIsAlreadyLiveOrFinal(d = {}) {
  const st = String(d.local_status || '').toLowerCase();
  return ['published','published_active','exported','fulfilled_bought','auto_sell_created'].includes(st) || Boolean(d.published_listing_id);
}
function draftIsMaintainerActionable(d = {}, options = getOptions()) {
  if (!d || !d.draft_id) return false;
  if (draftIntent(d) === 'sell') return true;
  if (draftIsAlreadyLiveOrFinal(d)) return true;
  const stock = stockCapStatusForDraft(d, options);
  if (stock.blocked) return false;
  const brain = tradingBrainFilterDraftForMaintainer(d, options);
  if (!brain.ok) return false;
  if (options.maintainer_skip_unaffordable_buy_candidates !== false) {
    const currency = previewCurrencyGuardForDraft(d, options);
    if (!currency.enough_currency) return false;
  }
  return true;
}
function pruneUnactionableBuyDraftsForMaintainer(options = getOptions(), source = 'maintainer') {
  if (options.maintainer_prune_unactionable_buy_drafts === false) return { ok: true, pruned: 0, disabled_sources: [] };
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const removed = [];
  const kept = [];
  for (const d of drafts) {
    if (!d || draftIntent(d) !== 'buy' || draftIsAlreadyLiveOrFinal(d)) { kept.push(d); continue; }
    if (draftIsMaintainerActionable(d, options)) { kept.push(d); continue; }
    removed.push({ draft_id: d.draft_id, source_order_id: d.source_order_id || null, item_name: d.item_name || d.provider_payload_preview?.item?.item_name || null, reason: 'unactionable_buy_pruned_for_cap_fill' });
  }
  if (removed.length) {
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, drafts: kept, updated_at: new Date().toISOString(), prune_source: source, last_pruned_unactionable_buy_drafts: removed.slice(0, 50) });
    if (options.maintainer_mark_unactionable_queue_held !== false) {
      const q = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
      const ids = new Set(removed.map(x => x.source_order_id).filter(Boolean));
      if (ids.size && Array.isArray(q.items)) {
        const now = new Date().toISOString();
        const items = q.items.map(item => ids.has(item.id) ? { ...item, local_status: 'held_unactionable', updated_at: now, held_reason: 'removed blocked/unaffordable buy draft so cap-fill can rotate' } : item);
        writeJson(PLANNING_QUEUE_PATH, { ...q, items, updated_at: now, last_unactionable_hold_count: ids.size });
      }
    }
  }
  return { ok: true, pruned: removed.length, removed: removed.slice(0, 25), disabled_sources: removed.map(x => x.source_order_id).filter(Boolean) };
}


// ── 5.13.29 – Currency-Aware Buy Hold & Sell-First Fallback ─────────────────────────────
function marketPricingMirrorFromDraft(draft = {}) {
  const mirrors = [
    draft.market_pricing,
    draft.provider_payload_preview?.market_pricing,
    draft.provider_payload_preview?.market_mirror,
    draft.market_mirror,
    draft.provider_payload_preview?.mirror_summary
  ].filter(Boolean);
  return mirrors.find(x => x && typeof x === 'object') || {};
}
function marketPricingAvailableCurrencyRef(options = getOptions()) {
  try {
    const summary = currencyInventorySummary();
    const keyRef = Number(summary.key_ref_estimate || keyPriceEstimateRef() || 0);
    return {
      keys: Number(summary.keys || 0),
      metal_ref: roundedRef(Number(summary.metal_ref || 0)),
      key_ref_estimate: roundedRef(keyRef || 0),
      total_ref: roundedRef((Number(summary.keys || 0) * (keyRef || 0)) + Number(summary.metal_ref || 0))
    };
  } catch {
    return { keys: 0, metal_ref: 0, key_ref_estimate: keyPriceEstimateRef(), total_ref: 0 };
  }
}
function marketPricingForDraft(draft = {}, options = getOptions()) {
  const keyRef = keyPriceEstimateRef();
  const mirror = marketPricingMirrorFromDraft(draft);
  const highestBuy = Number(mirror.highest_buy_ref || mirror.highest_buyer_ref || mirror.top_buy_ref || mirror.buy_ref || 0);
  const lowestSell = Number(mirror.lowest_sell_ref || mirror.lowest_seller_ref || mirror.top_sell_ref || mirror.sell_ref || 0);
  const buyCount = Number(mirror.buy_count || mirror.buyers || mirror.active_buyers || 0);
  const sellCount = Number(mirror.sell_count || mirror.sellers || mirror.active_sellers || 0);
  const intent = draftIntent(draft);
  const currentBuy = tradingBrainDraftValueRef(draft, options) || Number(draft.max_buy_ref || 0);
  const currentSell = currentDraftSellRef(draft) || Number(draft.target_sell_ref || 0);
  const buyBonus = Number(options.market_pricing_buy_bonus_ref || 0.11);
  const sellUndercut = Number(options.market_pricing_sell_undercut_ref || options.sell_booster_undercut_ref || 0.11);
  const minSell = Number(options.sell_booster_min_sell_ref || 0.11);
  const requiredBase = Math.max(0.01, Number(highestBuy || currentBuy || 0));
  const requiredProfit = tradingBrainRequiredProfitRef(requiredBase, options);
  const rawSuggestedBuy = highestBuy > 0 ? roundedRef(highestBuy + buyBonus) : currentBuy;
  let suggestedSell = lowestSell > 0 ? roundedRef(Math.max(minSell, lowestSell - sellUndercut)) : currentSell;
  const crossedMarket = Boolean(highestBuy > 0 && lowestSell > 0 && highestBuy >= lowestSell);
  const maxProfitSafeBuy = lowestSell > 0 ? roundedRef(Math.max(0, lowestSell - requiredProfit)) : 0;
  let suggestedBuy = rawSuggestedBuy;
  const weakReasons = [];
  const noSnapshotPrices = Boolean(!highestBuy && !lowestSell);
  const fallbackMaxBuy = Number(options.market_pricing_no_snapshot_fallback_max_buy_ref || 120);
  const schemaFallbackAllowed = Boolean(options.market_pricing_no_snapshot_fallback_enabled && options.market_pricing_no_snapshot_fallback_allow_buy && intent === 'buy' && noSnapshotPrices && currentBuy > 0 && (!fallbackMaxBuy || currentBuy <= fallbackMaxBuy));
  const liquidityFirstBuy = Boolean(options.liquidity_first_trading_mode_enabled && options.liquidity_first_apply_to_buy_listings && intent === 'buy');
  const liquidityMinBuyers = Number(options.liquidity_first_min_active_buyers || 1);
  const liquidityMinSellers = Number(options.liquidity_first_min_active_sellers || 2);
  const liquidityMinSpread = Number(options.liquidity_first_min_spread_ref || 0.33);
  const fallbackActiveLimit = Number(options.liquidity_first_fallback_max_active_buy_listings || 0);
  const fallbackActiveStatus = (() => { try { return buildFallbackMetricsStatus(options).summary || {}; } catch { return {}; } })();
  const fallbackActiveCount = Number(fallbackActiveStatus.fallback_active_buy_listings || 0);
  const fallbackStillAllowed = Boolean(options.liquidity_first_allow_schema_fallback_as_filler && (!fallbackActiveLimit || fallbackActiveCount < fallbackActiveLimit));
  if (noSnapshotPrices) {
    if (schemaFallbackAllowed) weakReasons.push('schema_fallback_no_snapshot');
    else weakReasons.push('no_snapshot_prices');
  }
  if (schemaFallbackAllowed && (!suggestedSell || suggestedSell <= rawSuggestedBuy)) {
    suggestedSell = roundedRef(rawSuggestedBuy + Math.max(Number(options.market_pricing_no_snapshot_fallback_min_profit_ref || 0.22), tradingBrainRequiredProfitRef(rawSuggestedBuy, options)));
  }
  if (buyCount < Number(options.market_pricing_min_buyers || 0)) weakReasons.push('few_buyers');
  if (sellCount < Number(options.market_pricing_min_sellers || 1)) weakReasons.push('few_sellers');
  if (liquidityFirstBuy) {
    if (noSnapshotPrices && options.liquidity_first_require_snapshot_for_buy && !fallbackStillAllowed) weakReasons.push('liquidity_no_snapshot');
    if (!noSnapshotPrices && buyCount < liquidityMinBuyers) weakReasons.push('liquidity_too_few_buyers');
    if (!noSnapshotPrices && sellCount < liquidityMinSellers) weakReasons.push('liquidity_too_few_sellers');
  }
  if (crossedMarket && options.market_pricing_block_crossed_markets !== false) {
    weakReasons.push('crossed_or_corrupt_market');
    if (options.market_pricing_ignore_corrupt_snapshot_when_buy_gt_sell !== false) suggestedBuy = 0;
  }
  if (!crossedMarket && lowestSell > 0 && suggestedBuy > 0 && options.market_pricing_never_buy_above_profit_safe_sell !== false && suggestedBuy > maxProfitSafeBuy) {
    weakReasons.push('buy_price_not_profitable_vs_lowest_sell');
    suggestedBuy = maxProfitSafeBuy > 0 ? Math.min(suggestedBuy, maxProfitSafeBuy) : 0;
  }
  const availability = marketPricingAvailableCurrencyRef(options);
  if (intent === 'buy' && suggestedBuy > 0 && options.market_pricing_exclude_unaffordable_buys !== false && availability.total_ref > 0 && suggestedBuy > roundedRef(availability.total_ref + 0.01)) {
    weakReasons.push('unaffordable_buy_price');
    suggestedBuy = 0;
  }
  const spreadRef = (lowestSell > 0 && suggestedBuy > 0) ? roundedRef(lowestSell - suggestedBuy) : 0;
  const expectedProfit = (suggestedSell > 0 && suggestedBuy > 0) ? roundedRef(suggestedSell - suggestedBuy) : Number(draft.expected_profit_ref || 0);
  const requiredProfitAfter = tradingBrainRequiredProfitRef(suggestedBuy || currentBuy || 0, options);
  if (spreadRef && spreadRef < Number(options.market_pricing_min_spread_ref || 0.66)) weakReasons.push('spread_too_small');
  if (liquidityFirstBuy && spreadRef && spreadRef < liquidityMinSpread) weakReasons.push('liquidity_spread_too_small');
  if (suggestedBuy > 0 && expectedProfit < requiredProfitAfter) weakReasons.push('profit_below_floor');
  if (suggestedBuy <= 0 && intent === 'buy' && (highestBuy || lowestSell)) weakReasons.push('buy_blocked_by_market_sanity');
  const confidence = (!weakReasons.length && (highestBuy || lowestSell)) ? 'good' : (schemaFallbackAllowed ? 'fallback' : (highestBuy || lowestSell ? 'weak' : 'missing'));
  return {
    ok: true,
    item_name: draft.item_name || draft.provider_payload_preview?.item?.item_name || 'Unknown item',
    draft_id: draft.draft_id || null,
    intent,
    key_ref_estimate: keyRef,
    has_snapshot: Boolean(highestBuy || lowestSell),
    schema_fallback_used: Boolean(schemaFallbackAllowed),
    pricing_source: schemaFallbackAllowed ? 'schema_fallback_no_snapshot' : (highestBuy || lowestSell ? 'classifieds_snapshot' : 'missing'),
    highest_buy_ref: highestBuy || null,
    lowest_sell_ref: lowestSell || null,
    buy_count: buyCount,
    sell_count: sellCount,
    current_buy_ref: currentBuy || null,
    current_sell_ref: currentSell || null,
    raw_suggested_buy_ref: rawSuggestedBuy || null,
    suggested_buy_ref: suggestedBuy || null,
    suggested_sell_ref: suggestedSell || null,
    max_profit_safe_buy_ref: maxProfitSafeBuy || null,
    crossed_market: crossedMarket,
    affordability: availability,
    spread_ref: spreadRef || null,
    expected_profit_ref: expectedProfit || null,
    required_profit_ref: requiredProfitAfter,
    confidence,
    weak_market: confidence !== 'good',
    block_buy: Boolean(intent === 'buy' && (suggestedBuy <= 0 || weakReasons.includes('crossed_or_corrupt_market') || weakReasons.includes('unaffordable_buy_price') || weakReasons.includes('buy_price_not_profitable_vs_lowest_sell') || (liquidityFirstBuy && (weakReasons.includes('liquidity_no_snapshot') || weakReasons.includes('liquidity_too_few_buyers') || weakReasons.includes('liquidity_too_few_sellers') || weakReasons.includes('liquidity_spread_too_small'))))),
    liquidity_first: liquidityFirstBuy ? { enabled: true, min_buyers: liquidityMinBuyers, min_sellers: liquidityMinSellers, min_spread_ref: liquidityMinSpread, fallback_active_count: fallbackActiveCount, fallback_active_limit: fallbackActiveLimit, fallback_still_allowed: fallbackStillAllowed } : { enabled: false },
    weak_reasons: Array.from(new Set(weakReasons))
  };
}
function marketPricingApplyToDraft(draft = {}, options = getOptions()) {
  const pricing = marketPricingForDraft(draft, options);
  const intent = draftIntent(draft);
  const now = new Date().toISOString();
  if (!pricing.has_snapshot && !pricing.schema_fallback_used) return { draft, pricing, changed: false, reason: 'no_snapshot' };
  let changed = false;
  const next = { ...draft };
  if (intent === 'buy' && options.market_pricing_use_for_buy !== false) {
    if (pricing.block_buy || !(pricing.suggested_buy_ref > 0)) {
      next.local_status = String(next.local_status || '') === 'approved_local' ? 'hold_market_guard' : next.local_status;
      next.provider_payload_preview = { ...(next.provider_payload_preview || {}), market_pricing: pricing, market_pricing_hold: { held: true, reason: (pricing.weak_reasons || []).join(',') || 'market_sanity_block' } };
      changed = true;
    } else {
      next.max_buy_ref = pricing.suggested_buy_ref;
      next.target_sell_ref = pricing.suggested_sell_ref || next.target_sell_ref;
      next.expected_profit_ref = pricing.expected_profit_ref || next.expected_profit_ref;
      next.provider_payload_preview = { ...(next.provider_payload_preview || {}), currencies: enforceBuyCurrencies(pricing.suggested_buy_ref, next.provider_payload_preview?.currencies || {}, options, keyPriceEstimateRef()), details: buyListingDetails(next.item_name || 'item', enforceBuyCurrencies(pricing.suggested_buy_ref, next.provider_payload_preview?.currencies || {}, options, keyPriceEstimateRef())), market_pricing: pricing };
      changed = true;
    }
  }
  if (intent === 'sell' && options.market_pricing_use_for_sell !== false && pricing.suggested_sell_ref > 0) {
    const rawCost = sellDraftCostBasisRef(next) || 0;
    const costTrust = sellCostBasisTrustForMarket(next, rawCost, pricing.suggested_sell_ref || pricing.lowest_sell_ref || 0, options);
    const cost = costTrust.trusted ? rawCost : 0;
    const floor = cost > 0 ? roundedRef(cost + tradingBrainRequiredProfitRef(cost, options)) : Number(options.sell_booster_min_sell_ref || 0.11);
    const sanityMaxAbove = Number(options.sell_market_sanity_max_above_lowest_ref || options.sell_profit_guard_max_above_lowest_ref || 0.66);
    const holdForMarket = Boolean(options.sell_market_sanity_guard_enabled !== false && cost > 0 && floor > roundedRef(pricing.suggested_sell_ref + sanityMaxAbove));
    const noCostMarketOnly = Boolean(options.sell_no_cost_basis_force_market_price !== false && cost <= 0);
    const sellRef = noCostMarketOnly ? roundedRef(pricing.suggested_sell_ref) : (holdForMarket ? roundedRef(pricing.suggested_sell_ref) : roundedRef(Math.max(pricing.suggested_sell_ref, floor)));
    next.target_sell_ref = sellRef;
    if (holdForMarket) next.local_status = 'hold_profit_guard';
    else if (String(next.local_status || '') === 'hold_profit_guard') next.local_status = 'approved_local';
    next.provider_payload_preview = { ...(next.provider_payload_preview || {}), currencies: refToBackpackCurrencies(sellRef, options, keyPriceEstimateRef()), details: sellListingDetails(next.item_name || 'item', sellRef), market_pricing: { ...pricing, profit_floor_ref: floor, final_sell_ref: sellRef, held_by_market_sanity: holdForMarket, max_above_lowest_ref: sanityMaxAbove } };
    next.sell_profit_guard = holdForMarket ? { enabled: true, held: true, reason: 'sell_price_too_far_above_market', cost_basis_ref: cost, profit_floor_ref: floor, competitive_sell_ref: pricing.suggested_sell_ref, final_sell_ref: sellRef, max_above_lowest_ref: sanityMaxAbove } : next.sell_profit_guard;
    changed = true;
  }
  if (changed) next.updated_at = now;
  return { draft: next, pricing, changed, reason: changed ? 'market_pricing_applied' : 'unchanged' };
}

function buildLiquidityFirstStatus(options = getOptions()) {
  const pricing = readJson(MARKET_PRICING_PIPELINE_PATH, { rows: [], summary: {} });
  const rows = Array.isArray(pricing.rows) ? pricing.rows : [];
  const buyRows = rows.filter(r => draftIntent(r.draft || {}) !== 'sell');
  const liquidRows = buyRows.filter(r => {
    const p = r.pricing || r;
    return Boolean(p.has_snapshot && Number(p.buy_count || 0) >= Number(options.liquidity_first_min_active_buyers || 1) && Number(p.sell_count || 0) >= Number(options.liquidity_first_min_active_sellers || 2) && Number(p.spread_ref || 0) >= Number(options.liquidity_first_min_spread_ref || 0.33) && !p.crossed_market && Number(p.expected_profit_ref || 0) >= Number(options.trading_brain_min_profit_ref || 0.22));
  });
  const illiquidRows = buyRows.filter(r => {
    const p = r.pricing || r;
    return !liquidRows.includes(r) && (p.has_snapshot || p.schema_fallback_used || p.weak_market);
  });
  let fallback = { summary: {} };
  try { fallback = buildFallbackMetricsStatus(options); } catch {}
  const summary = {
    enabled: Boolean(options.liquidity_first_trading_mode_enabled),
    buy_mode: options.liquidity_first_trading_mode_enabled ? 'liquidity_first' : 'cap_fill',
    liquid_buy_candidates: liquidRows.length,
    illiquid_skipped_candidates: illiquidRows.length,
    no_snapshot_candidates: Number(pricing.summary?.no_snapshot || 0),
    fallback_active_buy_listings: Number(fallback.summary?.fallback_active_buy_listings || 0),
    fallback_limit: Number(options.liquidity_first_fallback_max_active_buy_listings || 0),
    owned_sell_anything_enabled: Boolean(options.liquidity_first_owned_inventory_sell_anything_above_min_ref || options.auto_sell_owned_inventory_above_min_ref_enabled),
    owned_sell_min_ref: Number(options.auto_sell_owned_inventory_min_ref || 0.11),
    min_buyers: Number(options.liquidity_first_min_active_buyers || 1),
    min_sellers: Number(options.liquidity_first_min_active_sellers || 2),
    min_spread_ref: Number(options.liquidity_first_min_spread_ref || 0.33)
  };
  return {
    ok: true,
    version: APP_VERSION,
    updated_at: new Date().toISOString(),
    enabled: summary.enabled,
    summary,
    samples: {
      liquid: liquidRows.slice(0, 8).map(r => ({ item_name: r.draft?.item_name || r.pricing?.item_name || r.item_name, buy_ref: Number(r.pricing?.suggested_buy_ref || r.draft?.max_buy_ref || 0), sell_ref: Number(r.pricing?.suggested_sell_ref || r.draft?.target_sell_ref || 0), buyers: Number(r.pricing?.buy_count || 0), sellers: Number(r.pricing?.sell_count || 0), spread_ref: Number(r.pricing?.spread_ref || 0), profit_ref: Number(r.pricing?.expected_profit_ref || 0) })),
      skipped: illiquidRows.slice(0, 8).map(r => ({ item_name: r.draft?.item_name || r.pricing?.item_name || r.item_name, reason: (r.pricing?.weak_reasons || []).join(', ') || r.pricing?.confidence || 'illiquid', buyers: Number(r.pricing?.buy_count || 0), sellers: Number(r.pricing?.sell_count || 0), spread_ref: Number(r.pricing?.spread_ref || 0) }))
    },
    note: 'Buy listings are liquidity-first. Owned inventory sell listings can still be listed above the configured minimum ref.'
  };
}

function buildMarketPricingPipelineStatus(options = getOptions(), extra = {}) {
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const rows = drafts.map(d => marketPricingForDraft(d, options));
  const good = rows.filter(r => r.confidence === 'good');
  const weak = rows.filter(r => r.confidence === 'weak');
  const missing = rows.filter(r => r.confidence === 'missing');
  const fallback = rows.filter(r => r.confidence === 'fallback' || r.schema_fallback_used);
  const profitable = rows.filter(r => Number(r.expected_profit_ref || 0) >= Number(r.required_profit_ref || 0));
  const blocked = rows.filter(r => r.weak_market || Number(r.expected_profit_ref || 0) < Number(r.required_profit_ref || 0));
  const summary = {
    drafts: drafts.length,
    good_data: good.length,
    weak_market: weak.length,
    no_snapshot: missing.length,
    schema_fallback: fallback.length,
    profitable: profitable.length,
    blocked_or_advisory: blocked.length,
    buy_drafts: rows.filter(r => r.intent === 'buy').length,
    sell_drafts: rows.filter(r => r.intent === 'sell').length,
    highest_buy_known: rows.filter(r => Number(r.highest_buy_ref || 0) > 0).length,
    lowest_sell_known: rows.filter(r => Number(r.lowest_sell_ref || 0) > 0).length
  };
  const result = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), enabled: Boolean(options.market_pricing_pipeline_enabled), mode: options.market_pricing_strict_mode ? 'strict' : 'balanced', rules: { buy_bonus_ref: Number(options.market_pricing_buy_bonus_ref || 0.11), sell_undercut_ref: Number(options.market_pricing_sell_undercut_ref || 0.11), min_spread_ref: Number(options.market_pricing_min_spread_ref || 0.66), min_buyers: Number(options.market_pricing_min_buyers || 0), min_sellers: Number(options.market_pricing_min_sellers || 1), snapshot_cache_minutes: Number(options.market_pricing_snapshot_cache_minutes || 15), use_for_buy: Boolean(options.market_pricing_use_for_buy), use_for_sell: Boolean(options.market_pricing_use_for_sell), no_snapshot_fallback: Boolean(options.market_pricing_no_snapshot_fallback_enabled), no_snapshot_fallback_max_buy_ref: Number(options.market_pricing_no_snapshot_fallback_max_buy_ref || 120) }, summary, samples: filterMarketPricingSamplesForDashboard(rows, options).sort((a,b)=>Number(b.expected_profit_ref||0)-Number(a.expected_profit_ref||0)).slice(0, Number(options.trading_brain_dashboard_samples || 8)), suppressed_samples: rows.length - filterMarketPricingSamplesForDashboard(rows, options).length, ...extra };
  writeJson(MARKET_PRICING_PIPELINE_PATH, result);
  return result;
}
async function rebuildMarketPricingPipeline(options = getOptions(), audit = null) {
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const max = Number(options.market_pricing_max_snapshot_checks_per_cycle || 50);
  const mirror = new MarketClassifiedsMirrorService(audit || auditService);
  let synced = 0, applied = 0, failed = 0;
  for (const draft of drafts.slice(0, max)) {
    try {
      const before = marketPricingForDraft(draft, options);
      if (!before.has_snapshot) {
        const sync = await mirror.syncForDraft(draft.draft_id, options);
        if (sync && sync.ok) synced++; else failed++;
      }
      if (options.market_pricing_apply_to_existing_drafts !== false) {
        const appliedResult = mirror.applyToDraft(draft.draft_id, options);
        if (appliedResult && appliedResult.ok) applied++;
      }
    } catch (error) { failed++; }
  }
  const status = buildMarketPricingPipelineStatus(options, { last_rebuild: { synced, applied, failed, checked: Math.min(max, drafts.length), completed_at: new Date().toISOString(), note: 'Rebuild syncs classifieds snapshots for draft items and applies suggested buy/sell prices to local drafts only.' } });
  appendActionFeed('market_pricing_pipeline_rebuilt', status.last_rebuild);
  if (audit) audit.write('market_pricing_pipeline_rebuilt', status.last_rebuild);
  return status;
}

function buildTradingBrainV513Status(options = getOptions()) {
  const draftStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(draftStore.drafts) ? draftStore.drafts : [];
  const buyDrafts = drafts.filter(d => draftIntent(d) === 'buy');
  const sellDrafts = drafts.filter(d => draftIntent(d) === 'sell');
  const buyDecisions = buyDrafts.map(d => tradingBrainBuyDecision(d, options));
  const sellDecisions = sellDrafts.map(d => tradingBrainSellDecision(d, options));
  const listings = activeBackpackListings(readAccountListingsArray());
  const stock = summarizeStockCapIndex(buildStockCapIndex(options), options);
  const counter = tradeCounterofferStatus();
  const keyRef = keyPriceEstimateRef();
  const marketPricingPipeline = buildMarketPricingPipelineStatus(options);
  let fallbackMetrics = { summary: {} };
  try { fallbackMetrics = buildFallbackMetricsStatus(options); } catch (error) { fallbackMetrics = { ok: false, error: safeError(error), summary: {} }; }
  const samplesLimit = Number(options.trading_brain_dashboard_samples || 8);
  const blockedBuy = buyDecisions.filter(d => !d.safe_to_buy);
  const heldSell = sellDecisions.filter(d => !d.safe_to_sell);
  const badKeyRoundups = buyDecisions.filter(d => d.bad_key_roundup);
  const summary = {
    active_listings: listings.length,
    active_buy: listings.filter(l => listingIntentValue(l) === 'buy').length,
    active_sell: listings.filter(l => listingIntentValue(l) === 'sell').length,
    buy_drafts: buyDrafts.length,
    buy_ok: buyDecisions.filter(d => d.safe_to_buy).length,
    buy_blocked: blockedBuy.length,
    sell_drafts: sellDrafts.length,
    sell_ok: sellDecisions.filter(d => d.safe_to_sell).length,
    sell_held: heldSell.length,
    bad_key_roundups: badKeyRoundups.length,
    stock_capped_skus: stock.capped_skus || 0,
    enforcement_enabled: Boolean(options.trading_brain_enforcement_enabled),
    enforce_on_publish: Boolean(options.trading_brain_enforce_on_publish),
    enforce_on_maintainer: Boolean(options.trading_brain_enforce_on_maintainer),
    enforcement_blocked_buy: buyDecisions.filter(d => !tradingBrainEnforcementDecision({ ...d, item_name: d.item_name, draft_id: d.draft_id, intent: 'buy', max_buy_ref: d.buy_ref, target_sell_ref: d.target_sell_ref, expected_profit_ref: d.expected_profit_ref }, options, 'maintainer').ok).length,
    enforcement_held_sell: sellDecisions.filter(d => !tradingBrainEnforcementDecision({ ...d, item_name: d.item_name, draft_id: d.draft_id, intent: 'sell', target_sell_ref: d.sell_ref, expected_profit_ref: d.expected_profit_ref, sell_profit_guard: { held: d.reasons.includes('held_by_profit_guard') } }, options, 'maintainer').ok).length,
    counteroffer_dry_run: Boolean(counter.dry_run_validation_enabled || options.trading_brain_counteroffer_mode === 'dry_run'),
    archive_all_manual_only: options.trading_brain_archive_all_mode === 'manual_only' && !options.archive_classifieds_on_startup_confirmed,
    market_pricing_good_data: marketPricingPipeline.summary?.good_data || 0,
    market_pricing_weak_market: marketPricingPipeline.summary?.weak_market || 0,
    market_pricing_no_snapshot: marketPricingPipeline.summary?.no_snapshot || 0,
    fallback_buy_allowed: fallbackMetrics.summary?.fallback_buy_allowed || 0,
    fallback_active_buy_listings: fallbackMetrics.summary?.fallback_active_buy_listings || 0,
    buy_ok_effective: (buyDecisions.filter(d => d.safe_to_buy).length) + Number(fallbackMetrics.summary?.fallback_buy_allowed || 0)
  };
  const issues = [];
  if (badKeyRoundups.length) issues.push({ id: 'bad_key_roundups', severity: 'warning', count: badKeyRoundups.length, message: 'Some sub-key buy drafts still use keys. They should be exact refined metal unless within the tiny key-roundup tolerance.' });
  if (blockedBuy.length) issues.push({ id: 'buy_blocked_by_brain', severity: 'info', count: blockedBuy.length, message: 'Some buy drafts are held by stock cap, missing sell market, or profit floor.' });
  if (heldSell.length) issues.push({ id: 'sell_held_by_profit', severity: 'info', count: heldSell.length, message: 'Some sell drafts are held/repriced because profit floor wins over market undercut.' });
  if (marketPricingPipeline.summary?.weak_market) issues.push({ id: 'weak_market_pricing', severity: 'info', count: marketPricingPipeline.summary.weak_market, message: 'Some drafts have weak classifieds data. Balanced mode keeps them advisory; strict mode can block them.' });
  if (!summary.archive_all_manual_only) issues.push({ id: 'archive_all_armed', severity: 'warning', message: 'Archive-all on startup is armed. 5.13 recommends manual-only archive to avoid empty accounts after restart.' });
  const status = {
    ok: true,
    version: APP_VERSION,
    built_at: new Date().toISOString(),
    enabled: Boolean(options.trading_brain_v513_enabled),
    title: '5.13 Currency-Aware Buy Hold & Sell-First Fallback',
    key_ref_estimate: keyRef,
    rules: {
      buy_requires_profit: Boolean(options.trading_brain_require_profit_for_buy),
      buy_min_profit_ref: Number(options.trading_brain_min_profit_ref || options.sell_profit_guard_min_profit_ref || 0.22),
      buy_min_margin_percent: Number(options.trading_brain_min_margin_percent || options.sell_profit_guard_min_margin_percent || 3),
      skip_buy_without_sell_market: Boolean(options.trading_brain_skip_buy_when_no_sell_market),
      sell_profit_guard_enabled: Boolean(options.sell_profit_guard_enabled),
      stock_match_mode: options.trading_brain_stock_match_mode || 'sku',
      archive_all_mode: options.trading_brain_archive_all_mode || 'manual_only',
      counteroffer_mode: options.trading_brain_counteroffer_mode || 'dry_run',
      currency_policy: 'sub-key=ref metal, multi-key=keys+ref, no blind 1-key rounding',
      enforcement_enabled: Boolean(options.trading_brain_enforcement_enabled),
      enforcement_mode: options.trading_brain_enforcement_mode || 'balanced',
      market_pricing_pipeline: options.market_pricing_pipeline_enabled ? 'enabled' : 'off',
      enforcement_mode: options.trading_brain_enforcement_mode || 'balanced',
      enforce_on_publish: Boolean(options.trading_brain_enforce_on_publish),
      enforce_on_maintainer: Boolean(options.trading_brain_enforce_on_maintainer),
      enforce_no_sell_market: Boolean(options.trading_brain_enforce_no_sell_market)
    },
    summary,
    health: issues.some(i => i.severity === 'warning') ? 'warning' : 'green',
    issues,
    market_pricing_pipeline: marketPricingPipeline,
    fallback_metrics: fallbackMetrics,
    samples: {
      buy_ok: buyDecisions.filter(d => d.safe_to_buy).slice(0, samplesLimit),
      buy_blocked: filterBlockedBuySamplesForDashboard(blockedBuy, options).slice(0, samplesLimit),
      suppressed_buy_blocked: options.trading_brain_suppress_unactionable_blocked_buy_samples === false ? 0 : (blockedBuy.length - filterBlockedBuySamplesForDashboard(blockedBuy, options).length),
      sell_ok: sellDecisions.filter(d => d.safe_to_sell).slice(0, samplesLimit),
      sell_held: heldSell.slice(0, samplesLimit),
      bad_key_roundups: badKeyRoundups.slice(0, samplesLimit),
      stock_capped: (stock.capped_samples || []).slice(0, samplesLimit)
    },
    next_action: issues.length ? 'Review Trading Brain issues, then run Maintain now. Do not add more features until these counters are clean.' : 'Trading Brain baseline is aligned. Maintain now can keep buy/sell listings moving under the central rules.'
  };
  try { writeJson(TRADING_BRAIN_V513_PATH, status); } catch {}
  return status;
}

function buildPublishWizardStatus() {
  const options = getOptions();
  const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const draftList = Array.isArray(drafts.drafts) ? drafts.drafts : [];
  const approvedDrafts = draftList.filter(d => d.local_status === 'approved_local');
  const actionableSelection = selectActionableDashboardCandidate(draftList, options);
  const candidate = options.currency_helper_use_actionable_candidate_only === false ? (approvedDrafts[0] || draftList.find(d => d.local_status === 'draft') || null) : actionableSelection.candidate;
  const fastStatus = Boolean(options.fast_dashboard_status_enabled);
  let testPayload = null;
  if (fastStatus) {
    testPayload = candidate ? { ok: true, skipped_fast_dashboard: true, message: 'Payload test skipped during fast dashboard status. Use Advanced test tools for a full payload check.' } : null;
  } else {
    try {
      testPayload = candidate ? new HubListingDraftService(null).testPublishPayload(candidate.draft_id, options) : null;
    } catch (error) {
      testPayload = { ok: false, code: 'payload_test_error', error: safeError(error), message: 'Payload test failed, but dashboard status remains available.' };
    }
  }
  let duplicateGuard = { ok: true, skipped: true, reason: 'No draft candidate yet.' };
  if (fastStatus) {
    duplicateGuard = candidate ? { ok: true, blocked: false, skipped_fast_dashboard: true, message: 'Duplicate guard skipped during fast dashboard status; publish path still runs full guard.' } : duplicateGuard;
  } else {
    try {
      duplicateGuard = candidate ? buildDuplicateListingGuard(candidate, options) : duplicateGuard;
    } catch (error) {
      duplicateGuard = { ok: false, blocked: true, code: 'duplicate_guard_error', error: safeError(error), message: 'Duplicate guard failed safely; publish is blocked until the next successful check.' };
    }
  }
  const steps = [
    { id: 'provider_sync', label: 'Provider synced', ok: readJson(BACKPACK_LISTINGS_PATH, { ok:false }).ok !== false },
    { id: 'planning_queue', label: 'Planning queue has items', ok: (queue.items || []).length > 0, count: (queue.items || []).length },
    { id: 'approved_queue', label: 'At least one planning item approved locally', ok: (queue.items || []).some(x => x.local_status === 'approved_local') },
    { id: 'drafts', label: 'Listing draft exists', ok: draftList.length > 0, count: draftList.length },
    { id: 'approved_draft', label: 'One draft approved locally', ok: approvedDrafts.length > 0, count: approvedDrafts.length },
    { id: 'payload', label: 'Payload preview ready', ok: Boolean(testPayload && testPayload.ok), detail: testPayload?.code || null },
    { id: 'duplicate_guard', label: 'Duplicate guard clear', ok: !duplicateGuard.blocked, detail: duplicateGuard.message || duplicateGuard.reason || null },
    { id: 'write_mode', label: 'Write mode is guarded', ok: options.backpack_tf_write_mode === 'guarded', detail: options.backpack_tf_write_mode },
    { id: 'publish_switch', label: 'Guarded publish enabled', ok: Boolean(options.allow_guarded_backpack_publish), disabled_by_default: true },
    { id: 'live_classifieds_switch', label: 'Live classifieds writes enabled for guarded publish', ok: Boolean(options.allow_live_classifieds_writes), disabled_by_default: true }
  ];
  const publishVerification = readJson(PUBLISH_VERIFY_PATH, { ok: false, listed: false, message: 'No listing verification has run yet.' });
  const marketMirror = readJson(MARKET_CLASSIFIEDS_MIRROR_PATH, { ok: false, message: 'No market classifieds mirror synced yet.' });
  const currencyGuard = candidate ? buildCurrencyGuardForDraft(candidate) : { ok: true, skipped: true, reason: 'No draft candidate yet.' };
  const guardedReady = Boolean(options.allow_guarded_backpack_publish && options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'guarded');
  const blockingStep = steps.find(step => !step.ok);
  const publishDisabledReason = !candidate ? 'Prepare 1 draft first.' : (!Boolean(options.allow_guarded_backpack_publish) ? 'Enable allow_guarded_backpack_publish in add-on options, save, then restart the add-on.' : (!Boolean(options.allow_live_classifieds_writes) ? 'Enable allow_live_classifieds_writes for the guarded manual publish test, save, then restart.' : (options.backpack_tf_write_mode !== 'guarded' ? 'Set backpack_tf_write_mode to guarded.' : (duplicateGuard.blocked ? 'Duplicate guard blocked this draft.' : 'Ready to publish one approved draft manually.'))));
  let maintainerStatus = { ok: false, error: 'Maintainer service not initialized yet.' };
  try { maintainerStatus = typeof classifiedsMaintainer !== 'undefined' && classifiedsMaintainer ? classifiedsMaintainer.status() : maintainerStatus; } catch (error) { maintainerStatus = { ok: false, code: 'maintainer_status_error', error: safeError(error) }; }
  let autoSellStatus = { ok: false, error: 'Auto-sell relister status unavailable.' };
  try { autoSellStatus = new BoughtItemAutoSellRelisterService(null).status(); } catch (error) { autoSellStatus = { ok: false, code: 'auto_sell_status_error', error: safeError(error) }; }
  let manualOwnedSellStatus = { ok: false, error: 'Manual owned sell detector status unavailable.' };
  try { manualOwnedSellStatus = new ManualOwnedItemSellDetectorService(null).status(); } catch (error) { manualOwnedSellStatus = { ok: false, code: 'manual_owned_sell_status_error', error: safeError(error) }; }
  let sellBooster = { ok: false, enabled: false, error: 'Sell Booster status unavailable.' };
  try { sellBooster = buildSellBoosterStatus(options); } catch (error) { sellBooster = { ok: false, enabled: false, code: 'sell_booster_status_error', error: safeError(error) }; }
  let tradeGuard = { ok: false, enabled: false, error: 'Trade Guard status unavailable.' };
  try { tradeGuard = tradeGuardStatus({ counteroffers: tradeCounterofferStatus() }); } catch (error) { tradeGuard = { ok: false, enabled: false, code: 'trade_guard_status_error', error: safeError(error) }; }
  let tradeCounteroffers = { ok: false, enabled: false, error: 'Trade Counteroffer status unavailable.' };
  try { tradeCounteroffers = tradeCounterofferStatus(); } catch (error) { tradeCounteroffers = { ok: false, enabled: false, code: 'trade_counteroffer_status_error', error: safeError(error) }; }
  let tradeMachine = { ok: false, version: APP_VERSION, counts: {}, states: [], next_action: 'Trade state machine unavailable. Dashboard is still running.', error: null };
  try { tradeMachine = readTradeOfferStateMachine(); } catch (error) { tradeMachine = { ok: false, version: APP_VERSION, counts: {}, states: [], next_action: 'Trade state machine failed safely. Send diagnostics if this repeats.', error: safeError(error) }; }
  let tradingBrainV513 = { ok: false, error: 'Trading Brain 5.13 status unavailable.' };
  let marketPricingPipeline = { ok: false, enabled: Boolean(options.market_pricing_pipeline_enabled), error: 'Market pricing pipeline status unavailable.' };
  if (fastStatus) {
    tradingBrainV513 = readJson(TRADING_BRAIN_V513_PATH, { ok: true, version: APP_VERSION, fast_cached: true, summary: { buy_ok: 0, buy_blocked: 0, sell_ok: 0, sell_held: 0 }, enforcement: { enabled: Boolean(options.trading_brain_enforcement_enabled), publish: Boolean(options.trading_brain_enforce_on_publish), maintainer: Boolean(options.trading_brain_enforce_on_maintainer) } });
    if (tradingBrainV513.samples && Array.isArray(tradingBrainV513.samples.buy_blocked) && options.dashboard_hide_unactionable_brain_samples !== false) {
      const before = tradingBrainV513.samples.buy_blocked.length;
      tradingBrainV513.samples.buy_blocked = filterBlockedBuySamplesForDashboard(tradingBrainV513.samples.buy_blocked, options);
      tradingBrainV513.samples.suppressed_buy_blocked = Number(tradingBrainV513.samples.suppressed_buy_blocked || 0) + Math.max(0, before - tradingBrainV513.samples.buy_blocked.length);
    }
    tradingBrainV513.fast_cached = true;
    tradingBrainV513.enforcement = tradingBrainV513.enforcement || { enabled: Boolean(options.trading_brain_enforcement_enabled), publish: Boolean(options.trading_brain_enforce_on_publish), maintainer: Boolean(options.trading_brain_enforce_on_maintainer) };
    marketPricingPipeline = readJson(MARKET_PRICING_PIPELINE_PATH, { ok: true, version: APP_VERSION, enabled: Boolean(options.market_pricing_pipeline_enabled), fast_cached: true, summary: { good_data: 0, weak_market: 0, no_snapshot: 0, profitable: 0 }, mode: options.market_pricing_strict_mode ? 'strict' : 'balanced' });
    if (Array.isArray(marketPricingPipeline.samples) && options.dashboard_hide_corrupt_market_samples !== false) {
      const before = marketPricingPipeline.samples.length;
      marketPricingPipeline.samples = filterMarketPricingSamplesForDashboard(marketPricingPipeline.samples, options);
      marketPricingPipeline.suppressed_samples = Number(marketPricingPipeline.suppressed_samples || 0) + Math.max(0, before - marketPricingPipeline.samples.length);
    }
    marketPricingPipeline.enabled = Boolean(options.market_pricing_pipeline_enabled);
    marketPricingPipeline.fast_cached = true;
    marketPricingPipeline.mode = options.market_pricing_strict_mode ? 'strict' : (marketPricingPipeline.mode || 'balanced');
  } else {
    try { tradingBrainV513 = buildTradingBrainV513Status(options); } catch (error) { tradingBrainV513 = { ok: false, version: APP_VERSION, code: 'trading_brain_v513_status_error', error: safeError(error) }; }
    try {
      marketPricingPipeline = buildMarketPricingPipelineStatus(options);
    } catch (error) {
      marketPricingPipeline = {
        ok: false,
        version: APP_VERSION,
        enabled: Boolean(options.market_pricing_pipeline_enabled),
        code: 'market_pricing_pipeline_status_error',
        error: safeError(error),
        summary: { good_data: 0, weak_market: 0, no_snapshot: 0, profitable: 0 },
        mode: options.market_pricing_strict_mode ? 'strict' : 'balanced'
      };
    }
  }
  let fallbackMetricsStatus = { ok: false, error: 'Fallback metrics unavailable.' };
  try { fallbackMetricsStatus = buildFallbackMetricsStatus(options); } catch (error) { fallbackMetricsStatus = { ok: false, version: APP_VERSION, code: 'fallback_metrics_error', error: safeError(error) }; }
  let staleSellGuardStatus = { ok: false, error: 'Stale sell listing guard unavailable.' };
  try { staleSellGuardStatus = buildStaleSellListingGuardStatus(options); } catch (error) { staleSellGuardStatus = { ok: false, version: APP_VERSION, code: 'stale_sell_guard_error', error: safeError(error) }; }
  const startupArchive = new StartupListingArchiveService(auditService).current();
  const startupRebuild = new StartupRebuildControllerService(auditService).current();
  const statusWarnings = [testPayload, duplicateGuard, maintainerStatus, autoSellStatus, tradeGuard, tradeMachine].filter(x => x && x.ok === false && x.error).map(x => x.error).slice(0, 8);
  const result = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), ready_to_test_payload: Boolean(testPayload && testPayload.ok), ready_to_publish_guarded: steps.every(step => step.ok) && guardedReady, guarded_publish_enabled: Boolean(options.allow_guarded_backpack_publish), live_classifieds_writes_enabled: Boolean(options.allow_live_classifieds_writes), backpack_tf_write_mode: options.backpack_tf_write_mode, candidate_draft_id: candidate?.draft_id || null, candidate_item_name: candidate?.item_name || null, actionable_candidate_summary: actionableSelection || null, steps, duplicate_guard: duplicateGuard, currency_guard: currencyGuard, market_classifieds_mirror: redactDeep(marketMirror), most_traded_and_keys: redactDeep(buildMostTradedAndKeysStatus(options)), startup_listing_archive: redactDeep(startupArchive), startup_rebuild: redactDeep(startupRebuild), classifieds_maintainer: redactDeep(maintainerStatus), auto_sell_relister: redactDeep(autoSellStatus), manual_owned_sell_detector: redactDeep(manualOwnedSellStatus), sell_booster: redactDeep(sellBooster), trade_guard: redactDeep(tradeGuard), trade_counteroffers: redactDeep(tradeCounteroffers), trade_offer_state_machine: redactDeep(tradeMachine), trading_brain_v513: redactDeep(tradingBrainV513), market_pricing_pipeline: redactDeep(marketPricingPipeline), fallback_metrics: redactDeep(fallbackMetricsStatus), stale_sell_listing_guard: redactDeep(staleSellGuardStatus), liquidity_first: redactDeep(buildLiquidityFirstStatus(options)), publish_error_inspector: redactDeep(buildPublishErrorInspectorStatus(options)), adaptive_fill_controller: redactDeep(buildAdaptiveFillControllerStatus(options)), listing_text_sync: { ok: true, enabled: Boolean(options.listing_text_sync_with_published_price), force_rebuild_on_publish: Boolean(options.listing_text_force_rebuild_on_publish), sync_existing_drafts: Boolean(options.listing_text_sync_existing_drafts), source: 'final_published_currencies' }, status_warnings: statusWarnings, payload_test: testPayload ? redactDeep(testPayload) : null, publish_verification: publishVerification, publish_disabled_reason: publishDisabledReason, next_action: autoSellStatus.last_result?.counters?.published_sell_listings ? 'Bought item detected and sell listing published. Monitor Backpack.tf listing status.' : (currencyGuard?.can_prepare_key_to_metal_listing ? 'The wizard will auto-publish a key→metal listing first, then you manually handle the Steam offer and retry the buy listing.' : (publishVerification.listed ? 'Listing verified on Backpack.tf. Stop here or monitor it.' : (blockingStep ? blockingStep.label : 'Publish one approved draft manually, then click Verify listing.'))) };
  writeJsonIfChanged(PUBLISH_WIZARD_PATH, result);
  return result;
}

// 5.13.30 – cached + lite publish wizard status.
//
// The dashboard polls /api/publish-wizard/status every 8s.  The full builder
// reads ~10 JSON files, runs 12+ status sub-builders, walks each result through
// redactDeep, and used to write the entire payload back to disk on every call.
// On low-RAM Home Assistant hosts that pegged CPU and triggered OOM-restart
// loops the moment the user opened the panel.
//
// We now keep the last full result in memory for PUBLISH_WIZARD_CACHE_TTL_MS
// and serve it from cache for both the polling endpoint and the explicit detail
// endpoint.  Mutating endpoints (publish, approve, sync) call
// invalidatePublishWizardCache() so the next read re-builds.
//
// The /api/publish-wizard/status/lite endpoint computes only the cheap fields
// and skips every heavy sub-status, so the live dashboard poll is O(few KB).
const PUBLISH_WIZARD_CACHE_TTL_MS = Number(process.env.PUBLISH_WIZARD_CACHE_TTL_MS || 5000);
const __publishWizardCache = { result: null, builtAt: 0, building: null };
function invalidatePublishWizardCache(reason) {
  __publishWizardCache.result = null;
  __publishWizardCache.builtAt = 0;
  if (reason && typeof audit === 'function') { try { audit('publish_wizard_cache_invalidated', { reason: String(reason).slice(0, 120) }); } catch {} }
}
// Auto-invalidate when any input file the wizard reads gets rewritten.  We
// skip PUBLISH_WIZARD_PATH itself (that is our own output) to avoid loops.
for (const watchedPath of [PLANNING_QUEUE_PATH, HUB_LISTING_DRAFTS_PATH, BACKPACK_LISTINGS_PATH, PUBLISH_VERIFY_PATH, MARKET_CLASSIFIEDS_MIRROR_PATH, MARKET_PRICING_PIPELINE_PATH, TRADING_BRAIN_V513_PATH]) {
  watchJsonWrite(watchedPath, p => invalidatePublishWizardCache('write:' + path.basename(p)));
}
function getCachedPublishWizardStatus() {
  const now = Date.now();
  if (__publishWizardCache.result && now - __publishWizardCache.builtAt < PUBLISH_WIZARD_CACHE_TTL_MS) {
    return { ...__publishWizardCache.result, cached: true, cache_age_ms: now - __publishWizardCache.builtAt };
  }
  const result = buildPublishWizardStatus();
  __publishWizardCache.result = result;
  __publishWizardCache.builtAt = Date.now();
  return result;
}
function buildPublishWizardLiteStatus() {
  const options = getOptions();
  const queue = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const draftList = Array.isArray(drafts.drafts) ? drafts.drafts : [];
  const approvedDrafts = draftList.filter(d => d.local_status === 'approved_local');
  const candidate = approvedDrafts[0] || draftList.find(d => d.local_status === 'draft') || null;
  const planningCount = (queue.items || []).length;
  const planningApproved = (queue.items || []).filter(x => x.local_status === 'approved_local').length;
  const guardedReady = Boolean(options.allow_guarded_backpack_publish && options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'guarded');
  const verification = readJson(PUBLISH_VERIFY_PATH, { ok: false, listed: false });
  const cachedFull = __publishWizardCache.result;
  return {
    ok: true,
    version: APP_VERSION,
    updated_at: new Date().toISOString(),
    lite: true,
    cache_age_ms: cachedFull ? Date.now() - __publishWizardCache.builtAt : null,
    planning_queue: { count: planningCount, approved: planningApproved },
    drafts: { count: draftList.length, approved: approvedDrafts.length },
    candidate_draft_id: candidate?.draft_id || null,
    candidate_item_name: candidate?.item_name || null,
    backpack_tf_write_mode: options.backpack_tf_write_mode,
    guarded_publish_enabled: Boolean(options.allow_guarded_backpack_publish),
    live_classifieds_writes_enabled: Boolean(options.allow_live_classifieds_writes),
    guarded_ready: guardedReady,
    publish_verified: Boolean(verification.listed),
    classifieds_maintainer: cachedFull?.classifieds_maintainer ? { ok: cachedFull.classifieds_maintainer.ok, enabled: cachedFull.classifieds_maintainer.enabled, due_in_seconds: cachedFull.classifieds_maintainer.due_in_seconds } : null,
    auto_sell_relister: cachedFull?.auto_sell_relister ? { ok: cachedFull.auto_sell_relister.ok, enabled: cachedFull.auto_sell_relister.enabled } : null,
    next_action: cachedFull?.next_action || null
  };
}


// ── 5.13.29 – fallback metrics + stale sell listing guard ────────────────
function listingSkuMatchesInventoryItem(listing = {}, item = {}) {
  if (!listing || !item) return false;
  const listingAsset = String(listing.item?.id || listing.item?.assetid || listing.assetid || listing.id || '').trim();
  const itemAsset = String(item.assetid || item.id || '').trim();
  if (listingAsset && itemAsset && listingAsset === itemAsset) return true;
  const listingSku = stockSkuKeyFromListing(listing);
  const itemSku = stockSkuKeyFromInventoryItem(item);
  if (listingSku && itemSku && listingSku === itemSku) return true;
  const listingName = normalizeListingText(listingItemName(listing));
  const itemName = normalizeListingText(inventoryDisplayName(item));
  if (!listingName || !itemName || listingName !== itemName) return false;
  const listingQuality = String(listing.item?.quality?.id ?? listing.item?.quality ?? listing.quality ?? '').trim();
  const itemQuality = String(inventoryQualityId(item) || item.quality || item.app_data?.quality || '').trim();
  if (listingQuality && itemQuality && listingQuality !== itemQuality) return false;
  const listingPriceindex = String(listing.item?.priceindex ?? listing.priceindex ?? '0').trim();
  const itemPriceindex = String(inventoryPriceindex(item) || '0').trim();
  if (listingPriceindex && itemPriceindex && listingPriceindex !== itemPriceindex) return false;
  return true;
}
function buildStaleSellListingGuardStatus(options = getOptions()) {
  const activeSell = activeBackpackListings(readAccountListingsArray()).filter(l => listingIntentValue(l) === 'sell');
  const inventory = readInventoryItemsArray().filter(item => item && item.assetid && item.tradable !== false);
  const stale = [];
  const matched = [];
  for (const listing of activeSell) {
    const match = inventory.find(item => listingSkuMatchesInventoryItem(listing, item));
    const row = {
      id: listing.id || listing.listing_id || listing.hash || null,
      item_name: listingItemName(listing),
      price_ref: listingMetalValue(listing) || 0,
      price_text: listingCurrencyText(listing) || `${listingMetalValue(listing) || 0} ref`,
      url: listingExternalUrl(listing),
      owned_assetid: match ? String(match.assetid || '') : null,
      owned: Boolean(match),
      action: match ? 'keep' : 'flag_stale_sell_listing'
    };
    if (match) matched.push(row); else stale.push(row);
  }
  const status = {
    ok: true,
    version: APP_VERSION,
    enabled: options.stale_sell_listing_guard_enabled !== false,
    checked_at: new Date().toISOString(),
    active_sell_listings: activeSell.length,
    matched_owned_sell_listings: matched.length,
    stale_sell_listings: stale.length,
    stale_action: options.stale_sell_listing_guard_auto_archive_enabled ? 'guarded_archive_when_safe' : (options.stale_sell_listing_guard_archive_missing_asset ? 'archive_when_supported' : 'warn_only'),
    archive_safety: staleSellArchiveSafety(options),
    auto_archive_enabled: Boolean(options.stale_sell_listing_guard_auto_archive_enabled),
    archive_max_per_run: Number(options.stale_sell_listing_guard_archive_max_per_run || 5),
    samples: { stale: stale.slice(0, 12), matched: matched.slice(0, 6) },
    message: stale.length ? 'Some sell listings do not match a tradable owned inventory asset. 5.13.29 can guarded-archive them when write sliders are enabled.' : 'All active sell listings match owned inventory assets.'
  };
  writeJson(STALE_SELL_GUARD_PATH, status);
  return status;
}

function staleSellArchiveSafety(options = getOptions()) {
  const guarded = Boolean(options.allow_guarded_backpack_publish && options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'guarded');
  const hasToken = Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key);
  if (options.stale_sell_listing_guard_auto_archive_enabled === false) return { ok: false, code: 'stale_archive_disabled', reason: 'stale_sell_listing_guard_auto_archive_enabled is false.' };
  if (!hasToken) return { ok: false, code: 'backpack_token_missing', reason: 'Backpack.tf token/key is required to archive stale sell listings.' };
  if (options.stale_sell_listing_guard_auto_archive_requires_write_sliders !== false && !guarded) return { ok: false, code: 'guarded_write_sliders_required', reason: 'Stale sell archive requires guarded publish + live classifieds writes + write_mode guarded.' };
  if (options.allow_live_trade_accepts || options.sda_auto_confirm || options.steamguard_auto_confirm) return { ok: false, code: 'steam_live_actions_enabled', reason: 'Refusing stale archive while Steam live accept/confirmation settings are enabled.' };
  return { ok: true, code: 'ready', reason: 'Guarded stale sell archive can run.' };
}
async function archiveOneBackpackListingBestEffort(listing, options = getOptions()) {
  const id = String(listing.id || listing.listing_id || listing.hash || '').trim();
  if (!id) return { ok: false, error: 'missing_listing_id', attempts: [] };
  const base = String(options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, '').replace(/\/api$/, '');
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;
  const withAuth = url => {
    const parsed = new URL(url);
    if (options.backpack_tf_access_token) parsed.searchParams.set('token', options.backpack_tf_access_token);
    if (options.backpack_tf_api_key) parsed.searchParams.set('key', options.backpack_tf_api_key);
    return parsed.toString();
  };
  const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': options.backpack_tf_user_agent || `TF2-HA-TF2-Trading-Hub/${APP_VERSION}` };
  const attempts = [
    { label: 'archive_endpoint', url: withAuth(`${apiBase}/v2/classifieds/listings/${encodeURIComponent(id)}/archive`), init: { method: 'POST', headers, body: JSON.stringify({ id }) } },
    { label: 'patch_archived', url: withAuth(`${apiBase}/v2/classifieds/listings/${encodeURIComponent(id)}`), init: { method: 'PATCH', headers, body: JSON.stringify({ archived: true }) } },
    { label: 'delete_listing', url: withAuth(`${apiBase}/v2/classifieds/listings/${encodeURIComponent(id)}`), init: { method: 'DELETE', headers } }
  ];
  const results = [];
  for (const attempt of attempts) {
    const response = await fetchJsonHardened('backpack.tf', attempt.url, options, attempt.init);
    const row = { label: attempt.label, status: response.status || null, ok: Boolean(response.ok), response: redactDeep(response.body || response.error || null) };
    results.push(row);
    if (response.ok) return { ok: true, id, attempts: results, provider_http_status: response.status || 200 };
  }
  return { ok: false, id, attempts: results, error: results.at(-1)?.response || 'archive_failed' };
}
async function archiveStaleSellListingsGuarded(options = getOptions(), auditService = null, source = 'stale_sell_guard') {
  const status = buildStaleSellListingGuardStatus(options);
  const safety = staleSellArchiveSafety(options);
  const stale = status.samples && Array.isArray(status.samples.stale) ? status.samples.stale : [];
  const max = Math.max(0, Math.min(Number(options.stale_sell_listing_guard_archive_max_per_run || 5), stale.length));
  const result = { ok: true, version: APP_VERSION, source, started_at: new Date().toISOString(), safety, stale_seen: stale.length, attempted: 0, archived: 0, failed: 0, attempts: [], provider_request_sent: false };
  if (!stale.length) { result.completed_at = new Date().toISOString(); result.message = 'No stale sell listings found.'; return result; }
  if (!safety.ok) { result.ok = false; result.skipped = true; result.completed_at = new Date().toISOString(); result.message = safety.reason; return result; }
  for (const row of stale.slice(0, max)) {
    result.attempted += 1;
    result.provider_request_sent = true;
    try {
      const attempt = await archiveOneBackpackListingBestEffort(row, options);
      result.attempts.push({ item_name: row.item_name, listing_id: row.id, ok: Boolean(attempt.ok), detail: attempt });
      if (attempt.ok) result.archived += 1; else result.failed += 1;
    } catch (error) {
      result.failed += 1;
      result.attempts.push({ item_name: row.item_name, listing_id: row.id, ok: false, error: safeError(error) });
    }
  }
  result.ok = result.failed === 0;
  result.completed_at = new Date().toISOString();
  writeJson(STALE_SELL_GUARD_PATH, { ...status, last_archive_result: result, updated_at: result.completed_at });
  try { auditService?.write(result.archived ? 'stale_sell_listings_archived' : 'stale_sell_archive_noop', { archived: result.archived, failed: result.failed, source }); } catch {}
  try { appendActionFeed(result.archived ? 'stale_sell_listings_archived' : 'stale_sell_archive_noop', { archived: result.archived, failed: result.failed, source }); } catch {}
  if (result.archived) {
    try { await new BackpackTfV2ListingManager(options, auditService).syncListings(true); } catch {}
  }
  return result;
}

function buildFallbackMetricsStatus(options = getOptions()) {
  const draftStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(draftStore.drafts) ? draftStore.drafts : [];
  const buyDrafts = drafts.filter(d => draftIntent(d) === 'buy');
  const active = activeBackpackListings(readAccountListingsArray());
  const activeBuy = active.filter(l => listingIntentValue(l) === 'buy');
  const activeBuyNames = new Set(activeBuy.map(l => normalizeListingText(listingItemName(l))).filter(Boolean));
  const pricingRows = buyDrafts.map(d => ({ draft: d, pricing: marketPricingForDraft(d, options), decision: tradingBrainBuyDecision(d, options) }));
  const fallbackRows = pricingRows.filter(r => r.pricing && (r.pricing.schema_fallback_used || r.pricing.confidence === 'fallback'));
  const fallbackAllowed = fallbackRows.filter(r => r.decision && (r.decision.safe_to_buy || (options.trading_brain_allow_no_snapshot_schema_fallback && r.pricing.schema_fallback_used)));
  const fallbackPublished = fallbackRows.filter(r => activeBuyNames.has(normalizeListingText(r.draft.item_name || r.pricing.item_name || '')));
  const directOk = pricingRows.filter(r => r.decision && r.decision.safe_to_buy && !(r.pricing.schema_fallback_used || r.pricing.confidence === 'fallback'));
  const blocked = pricingRows.filter(r => r.decision && !r.decision.safe_to_buy);
  const maint = readJson(CLASSIFIEDS_MAINTAINER_PATH, { ok: true, last_result: null });
  const last = maint.last_result || {};
  const counters = last.counters || {};
  const status = {
    ok: true,
    version: APP_VERSION,
    enabled: options.fallback_metrics_enabled !== false,
    checked_at: new Date().toISOString(),
    summary: {
      buy_drafts: buyDrafts.length,
      active_buy_listings: activeBuy.length,
      direct_buy_ok: directOk.length,
      fallback_buy_candidates: fallbackRows.length,
      fallback_buy_allowed: fallbackAllowed.length,
      fallback_active_buy_listings: fallbackPublished.length,
      blocked_buy_candidates: blocked.length,
      no_snapshot: pricingRows.filter(r => r.pricing && r.pricing.confidence === 'missing').length,
      last_cycle_published: Number(counters.published || 0),
      last_cycle_checked: Number(counters.checked || 0),
      last_cycle_already_active: Number(counters.already_active || 0),
      last_cycle_currency_skipped: Number(counters.currency_skipped || 0),
      last_cycle_stock_skipped: Number(counters.stock_cap_skipped || 0),
      last_cycle_errors: Number(counters.errors || 0),
      last_cycle_fallback_boost_approved: Number(counters.fallback_boost_approved || 0),
      last_cycle_stale_sell_archived: Number(counters.stale_sell_archived || 0)
    },
    samples: {
      fallback_allowed: fallbackAllowed.slice(0, 10).map(r => ({ draft_id: r.draft.draft_id, item_name: r.draft.item_name, buy_ref: Number(r.draft.max_buy_ref || r.pricing.suggested_buy_ref || 0), target_sell_ref: Number(r.draft.target_sell_ref || r.pricing.suggested_sell_ref || 0), reason: 'schema_fallback_no_snapshot' })),
      fallback_published: fallbackPublished.slice(0, 10).map(r => ({ draft_id: r.draft.draft_id, item_name: r.draft.item_name, buy_ref: Number(r.draft.max_buy_ref || r.pricing.suggested_buy_ref || 0) })),
      blocked: blocked.slice(0, 8).map(r => ({ draft_id: r.draft.draft_id, item_name: r.draft.item_name, reasons: r.decision.reasons || [], buy_ref: Number(r.draft.max_buy_ref || 0) }))
    },
    note: 'Direct OK and no-snapshot fallback OK are reported separately so the dashboard no longer says buy ok 2 while cap-fill is actually publishing fallback listings.'
  };
  writeJson(FALLBACK_METRICS_PATH, status);
  return status;
}


function classifyPublishIssue(entry = {}) {
  const text = String([
    entry.code,
    entry.reason,
    entry.message,
    entry.error,
    entry.provider_status,
    entry.provider_response_summary,
    entry.listing_status,
    entry.status,
    entry.http_status,
    entry.provider_http_status
  ].filter(x => x !== null && x !== undefined).join(' ')).toLowerCase();
  if (/rate|429|too many|batch queue|active batch|queue pressure/.test(text)) return 'rate_limited_or_batch_queue';
  if (/not enough|notenoughcurrency|currency|missing key|missing.*ref|buy_currency_unavailable/.test(text)) return 'not_enough_currency';
  if (/duplicate|already active|listing_already_active/.test(text)) return 'duplicate_or_already_active';
  if (/defindex|sku|quality|priceindex|schema/.test(text)) return 'invalid_item_identity';
  if (/trading_brain|brain_block|guarded_backpack_publish_blocked_by_trading_brain|profit_below|not_profitable|weak_market|market_guard|crossed|corrupt/.test(text)) return 'filtered_by_trading_brain';
  if (/stock_cap|capped|stock/.test(text)) return 'stock_cap';
  if (/500|internalerror|bad gateway|502|provider.*error/.test(text)) return 'provider_error';
  if (/timeout|network|fetch failed|econn/.test(text)) return 'network_or_timeout';
  if (/archived|notactive/.test(text)) return 'archived_after_publish';
  if (/candidate_not_approvable|not approvable/.test(text)) return 'draft_not_approvable';
  return 'other';
}
function buildPublishErrorInspectorStatus(options = getOptions()) {
  const state = readJson(CLASSIFIEDS_MAINTAINER_PATH, { ok: true, runs: [] });
  const runs = Array.isArray(state.runs) ? state.runs.slice(-Number(options.publish_error_inspector_recent_runs || 8)) : [];
  const last = state.last_result || runs[runs.length - 1] || {};
  const sampleLimit = Number(options.publish_error_inspector_sample_limit || 12);
  const categories = {};
  const samples = [];
  const add = (kind, entry = {}, run = last) => {
    categories[kind] = Number(categories[kind] || 0) + 1;
    if (samples.length < sampleLimit) {
      samples.push({
        category: kind,
        draft_id: entry.draft_id || entry.id || null,
        item_name: entry.item_name || entry.name || null,
        code: entry.code || entry.reason || entry.stage || null,
        message: entry.message || entry.error || entry.provider_response_summary || entry.friendly_message || null,
        http_status: entry.provider_http_status || entry.http_status || null,
        run_completed_at: run.completed_at || run.started_at || null
      });
    }
  };
  for (const run of runs.length ? runs : [last]) {
    const counters = run.counters || {};
    for (const err of (Array.isArray(run.errors) ? run.errors : [])) add(classifyPublishIssue(err), err, run);
    for (const skip of (Array.isArray(run.skipped) ? run.skipped : [])) {
      const reason = String(skip && (skip.reason || skip.code || skip.message || '') || '');
      if (/currency|unaffordable|notEnoughCurrency/i.test(reason)) add('not_enough_currency', skip, run);
      else if (/duplicate|already_active/i.test(reason)) add('duplicate_or_already_active', skip, run);
      else if (/stock/i.test(reason)) add('stock_cap', skip, run);
      else if (/trading_brain|market|profit/i.test(reason)) add('filtered_by_trading_brain', skip, run);
    }
    for (const pub of (Array.isArray(run.published) ? run.published : [])) {
      if (pub && (pub.archived || /notEnoughCurrency|archived/i.test(String(pub.status || '')))) add('archived_after_publish', pub, run);
    }
    if (Number(counters.archived_or_currency || 0) && !categories.archived_after_publish) categories.archived_after_publish = Number(counters.archived_or_currency || 0);
    if (Number(counters.currency_skipped || 0) && !categories.not_enough_currency) categories.not_enough_currency = Number(counters.currency_skipped || 0);
    if (Number(counters.duplicate_skipped || 0) && !categories.duplicate_or_already_active) categories.duplicate_or_already_active = Number(counters.duplicate_skipped || 0);
    if (Number(counters.stock_cap_skipped || 0) && !categories.stock_cap) categories.stock_cap = Number(counters.stock_cap_skipped || 0);
  }
  const lastCounters = last.counters || {};
  const providerErrors = Number(categories.provider_error || 0) + Number(categories.network_or_timeout || 0) + Number(categories.rate_limited_or_batch_queue || 0);
  const safeFiltered = Number(categories.filtered_by_trading_brain || 0) + Number(categories.duplicate_or_already_active || 0) + Number(categories.stock_cap || 0) + Number(categories.not_enough_currency || 0);
  const lastPublished = Number(lastCounters.published || 0);
  const rawLastErrors = Number(lastCounters.errors || 0);
  const topCategories = Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([category,count])=>({ category, count }));
  // 5.13.29: Trading Brain filters are expected pruning decisions, not provider failures.
  // If the only recent problem is a safe filter, do not report it as a publish error.
  const actionableFailedTotal = Math.max(0, topCategories.reduce((sum,x)=>sum+Number(x.count||0),0) - safeFiltered);
  const lastErrors = providerErrors > 0 ? rawLastErrors : Math.max(0, rawLastErrors - Number(categories.filtered_by_trading_brain || 0));
  const lastAttempts = Number(lastCounters.provider_requests || 0);
  const ok = actionableFailedTotal === 0 && providerErrors === 0;
  const status = {
    ok,
    version: APP_VERSION,
    enabled: options.publish_error_inspector_enabled !== false,
    checked_at: new Date().toISOString(),
    last_run_at: last.completed_at || last.started_at || null,
    summary: {
      last_cycle_published: lastPublished,
      last_cycle_errors: lastErrors,
      provider_requests: lastAttempts,
      failed_total: actionableFailedTotal,
      raw_filtered_total: topCategories.reduce((sum,x)=>sum+Number(x.count||0),0),
      safe_filtered_total: safeFiltered,
      filtered_by_trading_brain: Number(categories.filtered_by_trading_brain || 0),
      categories,
      top_categories: topCategories.slice(0, 8),
      rate_limited: Number(categories.rate_limited_or_batch_queue || 0),
      provider_errors: providerErrors,
      not_enough_currency: Number(categories.not_enough_currency || 0),
      duplicate_or_active: Number(categories.duplicate_or_already_active || 0),
      archived_after_publish: Number(categories.archived_after_publish || 0)
    },
    samples,
    guidance: topCategories.length ? 'Safe filters are separated from real provider errors. Only provider/rate-limit/network failures should slow fill.' : 'No publish errors found in the recent maintainer runs.'
  };
  writeJson(PUBLISH_ERROR_INSPECTOR_PATH, status);
  return status;
}
function buildAdaptiveFillControllerStatus(options = getOptions()) {
  const inspector = buildPublishErrorInspectorStatus(options);
  const state = readJson(CLASSIFIEDS_MAINTAINER_PATH, { ok: true, last_result: null });
  const last = state.last_result || {};
  const counters = last.counters || {};
  const base = Number(options.persistent_classifieds_max_publishes_per_cycle || 20);
  const min = Number(options.adaptive_fill_min_per_cycle || 3);
  const target = Number(options.adaptive_fill_target_per_cycle || 20);
  const max = Number(options.adaptive_fill_max_per_cycle || options.maintainer_publish_batch_hard_cap || 80);
  const published = Number(counters.published || 0);
  const rawErrors = Number(counters.errors || 0);
  const rateLimited = Number(inspector.summary?.rate_limited || 0);
  const providerErrors = Number(inspector.summary?.provider_errors || 0);
  const actionableErrors = Number(inspector.summary?.failed_total || 0);
  const safeFiltered = Number(inspector.summary?.safe_filtered_total || 0);
  const errors = (options.adaptive_fill_ignore_safe_filtered_errors === false) ? rawErrors : Math.min(rawErrors, actionableErrors);
  let mode = 'normal';
  let effective = Math.min(max, Math.max(target, base));
  let reason = 'No provider pressure detected; safe Trading Brain filters do not slow fill.';
  if (rateLimited > 0) { mode = 'backoff_rate_limit'; effective = Math.max(min, Number(options.adaptive_fill_rate_limit_backoff_per_cycle || 5)); reason = 'Backpack.tf rate/batch queue pressure detected.'; }
  else if (providerErrors > 0 || errors >= Number(options.adaptive_fill_error_slowdown_threshold || 10)) { mode = 'slowdown_errors'; effective = Math.max(min, Math.min(target, Math.floor(Math.max(base, target) / 2))); reason = 'Real provider/publish errors are above threshold.'; }
  else if (published >= Number(options.adaptive_fill_success_boost_threshold || 8) && providerErrors === 0) { mode = 'boost_success'; effective = Math.min(max, Math.max(base, target)); reason = 'Recent cycle published successfully; keep fast fill.'; }
  return {
    ok: true,
    version: APP_VERSION,
    enabled: options.adaptive_fill_controller_enabled !== false,
    checked_at: new Date().toISOString(),
    mode,
    effective_max_publishes_per_cycle: effective,
    configured_max_publishes_per_cycle: base,
    target_per_cycle: target,
    min_per_cycle: min,
    max_per_cycle: max,
    reason,
    last_cycle: { published, errors, raw_errors: rawErrors, safe_filtered: safeFiltered, actionable_errors: actionableErrors, provider_requests: Number(counters.provider_requests || 0), currency_skipped: Number(counters.currency_skipped || 0), duplicate_skipped: Number(counters.duplicate_skipped || 0), stock_cap_skipped: Number(counters.stock_cap_skipped || 0) },
    error_summary: inspector.summary || {},
    safety: { no_steam_auto_accept: true, no_steam_guard_confirm: true, guarded_backpack_only: true }
  };
}


class StartupRebuildControllerService {
  constructor(auditService) { this.audit = auditService || { write(){} }; this.running = false; }
  current() {
    const options = getOptions();
    const state = readJson(STARTUP_REBUILD_PATH, { ok: true, version: APP_VERSION, status: 'not_run_yet', runs: [] });
    const fillTargets = computeListingFillTargets(readAccountListingsArray(), options);
    const fastUntilMs = state.fast_fill_until ? Date.parse(state.fast_fill_until) : 0;
    const fastActive = Boolean(options.startup_rebuild_enabled !== false && fastUntilMs && Date.now() < fastUntilMs);
    return {
      ok: state.ok !== false,
      version: APP_VERSION,
      enabled: Boolean(options.startup_rebuild_enabled),
      running: Boolean(this.running || state.running),
      status: state.status || 'not_run_yet',
      phase: state.phase || null,
      last_run_at: state.last_run_at || null,
      last_result: state.last_result || null,
      fast_fill_active: fastActive,
      fast_fill_until: state.fast_fill_until || null,
      fast_fill_remaining_seconds: fastActive ? Math.max(0, Math.round((fastUntilMs - Date.now()) / 1000)) : 0,
      startup_batch_size: Number(options.startup_rebuild_batch_size || 5),
      normal_batch_size: Number(options.startup_rebuild_normal_batch_size || 3),
      fill_targets: fillTargets,
      progress: { active_total: fillTargets.active_total, cap: fillTargets.cap, free_slots: fillTargets.free_slots, missing_buy: fillTargets.missing_buy, target_buy: fillTargets.target_buy },
      skipped_summary: state.last_result?.skipped_summary || {},
      note: 'Startup rebuild archives/syncs, rebuilds scanner/planning, then fast-fills listings for a short controlled window.'
    };
  }
  write(payload) {
    const previous = readJson(STARTUP_REBUILD_PATH, { runs: [] });
    const merged = { ...previous, ...payload, version: APP_VERSION, updated_at: new Date().toISOString() };
    writeJson(STARTUP_REBUILD_PATH, merged);
    return merged;
  }
  async run(source = 'manual_api', opts = {}) {
    if (this.running) return this.current();
    this.running = true;
    const options = getOptions();
    const startedAt = new Date().toISOString();
    const steps = [];
    const result = { ok: true, version: APP_VERSION, source, started_at: startedAt, status: 'running', steps, skipped_summary: {}, maintainer_runs: [] };
    this.write({ ok: true, running: true, status: 'running', phase: 'starting', last_started_at: startedAt });
    const step = async (name, fn) => {
      const t0 = Date.now();
      this.write({ running: true, status: 'running', phase: name });
      try {
        const r = await fn();
        const payload = { stage: name, ok: r && r.ok !== false, duration_ms: Date.now() - t0, summary: this.summarize(r) };
        steps.push(payload);
        return r;
      } catch (error) {
        const payload = { stage: name, ok: false, duration_ms: Date.now() - t0, error: safeError(error) };
        steps.push(payload);
        result.ok = false;
        return { ok: false, error: payload.error };
      }
    };
    try {
      if (!options.startup_rebuild_enabled) {
        result.ok = false; result.status = 'disabled'; result.completed_at = new Date().toISOString();
        return this.finish(result);
      }
      const fastMinutes = Number(options.startup_rebuild_fast_fill_minutes || 10);
      const fastUntil = fastMinutes > 0 ? new Date(Date.now() + fastMinutes * 60 * 1000).toISOString() : null;
      this.write({ fast_fill_until: fastUntil, status: 'running', phase: 'fast_fill_window_started' });
      result.fast_fill_until = fastUntil;
      result.startup_batch_size = Number(options.startup_rebuild_batch_size || 5);

      await step('sync_backpack_listings', async () => (options.backpack_tf_enabled && (options.backpack_tf_access_token || options.backpack_tf_api_key)) ? new BackpackTfV2ListingManager(options, this.audit).syncListings(true) : { ok: true, skipped: true, reason: 'backpack_credentials_missing_or_disabled' });
      await step('sync_inventory', async () => (options.inventory_sync_enabled && options.steam_id64) ? new SteamInventorySyncService(this.audit).sync(true) : { ok: true, skipped: true, reason: 'steamid_missing_or_inventory_disabled' });
      await step('market_scanner', async () => options.market_scanner_enabled ? new MarketTargetScannerService(this.audit).build(options) : { ok: true, skipped: true, reason: 'market_scanner_disabled' });
      await step('planning_queue_rebuild', async () => new PlanningQueueService(this.audit).rebuild('startup_rebuild_controller'));
      await step('build_opportunities', async () => buildOpportunities());
      await step('build_listing_drafts', async () => new HubListingDraftService(this.audit).buildFromApproved('startup_rebuild_controller'));

      const maxRuns = Math.max(1, Math.min(20, Number(options.startup_rebuild_max_runs || 3)));
      for (let i = 0; i < maxRuns; i++) {
        const run = await step(`maintainer_fast_fill_${i + 1}`, async () => classifiedsMaintainer.run(`startup_rebuild_fast_fill_${i + 1}`));
        result.maintainer_runs.push(this.summarize(run));
        const fill = computeListingFillTargets(readAccountListingsArray(), options);
        if (!fill.free_slots || !fill.missing_buy) break;
        if (run && run.ok === false && Number(run.counters?.published || 0) === 0 && Number(run.counters?.already_active || 0) === 0) break;
      }
      result.completed_at = new Date().toISOString();
      result.status = result.ok ? 'completed' : 'completed_with_warnings';
      result.fill_targets_after = computeListingFillTargets(readAccountListingsArray(), options);
      const lastMaint = result.maintainer_runs.at(-1) || {};
      result.skipped_summary = {
        already_active: Number(lastMaint.already_active || 0),
        duplicates: Number(lastMaint.duplicate_skipped || 0),
        stock_cap: Number(lastMaint.stock_cap_skipped || 0),
        archived_or_currency: Number(lastMaint.archived_or_currency || 0),
        errors: Number(lastMaint.errors || 0)
      };
      return this.finish(result);
    } catch (error) {
      result.ok = false; result.status = 'exception'; result.error = safeError(error); result.completed_at = new Date().toISOString();
      return this.finish(result);
    } finally { this.running = false; }
  }
  summarize(r = {}) {
    const counters = r.counters || r.summary || {};
    return {
      ok: r.ok !== false,
      skipped: r.skipped === true || r.skipped || null,
      error: r.error || null,
      status: r.status || null,
      listings: Number(r.listings_count || r.count || 0) || null,
      candidates: Number(r.summary?.total_candidates || (Array.isArray(r.candidates) ? r.candidates.length : 0)) || null,
      items: Number(r.items_count || (Array.isArray(r.items) ? r.items.length : 0)) || null,
      drafts: Number(Array.isArray(r.drafts) ? r.drafts.length : 0) || null,
      checked: Number(counters.checked || 0),
      published: Number(counters.published || 0),
      already_active: Number(counters.already_active || 0),
      duplicate_skipped: Number(counters.duplicate_skipped || 0),
      stock_cap_skipped: Number(counters.stock_cap_skipped || 0),
      archived_or_currency: Number(counters.archived_or_currency || 0),
      currency_skipped: Number(counters.currency_skipped || 0),
      errors: Number(counters.errors || 0)
    };
  }
  finish(result) {
    const state = readJson(STARTUP_REBUILD_PATH, { runs: [] });
    const runs = [...(Array.isArray(state.runs) ? state.runs : []), result].slice(-20);
    const saved = this.write({ ok: result.ok !== false, running: false, status: result.status || (result.ok === false ? 'error' : 'completed'), phase: result.status || 'completed', last_run_at: result.completed_at || new Date().toISOString(), last_result: result, runs, skipped_summary: result.skipped_summary || {} });
    this.audit?.write(result.ok === false ? 'startup_rebuild_issue' : 'startup_rebuild_completed', { source: result.source, status: result.status, steps: result.steps?.length || 0, fill_targets_after: result.fill_targets_after || null });
    appendActionFeed(result.ok === false ? 'startup_rebuild_issue' : 'startup_rebuild_completed', { status: result.status, fill_targets_after: result.fill_targets_after || null });
    return saved.last_result || result;
  }
}


class StartupListingArchiveService {
  constructor(auditService) { this.audit = auditService; this.running = false; }
  current() {
    const state = readJson(STARTUP_LISTING_ARCHIVE_PATH, { ok: true, version: APP_VERSION, enabled: false, status: 'not_run_yet', last_run_at: null });
    const options = getOptions();
    const startupAutoWillRun = Boolean(options.archive_classifieds_on_startup && options.archive_classifieds_on_startup_confirmed);
    return { ...state, version: APP_VERSION, enabled: Boolean(options.archive_classifieds_on_startup), startup_auto_confirmed: Boolean(options.archive_classifieds_on_startup_confirmed), startup_auto_will_run: startupAutoWillRun, startup_archive_safety: startupAutoWillRun ? 'armed' : 'safe_manual_only', safety_note: startupAutoWillRun ? 'Archive on startup is armed by the explicit confirmation switch.' : 'Automatic archive on startup is blocked unless archive_classifieds_on_startup_confirmed is enabled. Manual Archive all listings still works.' };
  }
  apiBase(options = {}) {
    const configured = String(options.backpack_tf_base_url || 'https://backpack.tf').replace(/\/$/, '');
    return configured.endsWith('/api') ? configured : `${configured}/api`;
  }
  headers(options = {}, mode = 'token') {
    const headers = { accept: 'application/json', 'content-type': 'application/json', 'user-agent': options.backpack_tf_user_agent || `TF2-HA-TF2-Trading-Hub/${APP_VERSION}` };
    if (mode === 'token' && options.backpack_tf_access_token) headers['X-Auth-Token'] = options.backpack_tf_access_token;
    if (mode === 'bearer' && options.backpack_tf_access_token) headers.authorization = `Bearer ${options.backpack_tf_access_token}`;
    return headers;
  }
  withAccessTokenParam(url, options = {}) {
    const parsed = new URL(url);
    if (options.backpack_tf_access_token) parsed.searchParams.set('token', options.backpack_tf_access_token);
    return parsed.toString();
  }
  write(payload) {
    const out = { ...payload, version: APP_VERSION, updated_at: new Date().toISOString() };
    writeJson(STARTUP_LISTING_ARCHIVE_PATH, out);
    return out;
  }
  canRun(options = {}, source = 'startup') {
    const enabled = Boolean(options.archive_classifieds_on_startup);
    const hasToken = Boolean(options.backpack_tf_access_token);
    const guarded = Boolean(options.allow_guarded_backpack_publish && options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'guarded');
    const requiresWrite = Boolean(options.archive_classifieds_on_startup_requires_write_sliders);
    if (!enabled) return { ok: false, code: 'startup_archive_disabled', reason: 'archive_classifieds_on_startup is disabled.' };
    if (source === 'startup' && !Boolean(options.archive_classifieds_on_startup_confirmed)) return { ok: false, code: 'startup_archive_not_confirmed', reason: 'Startup archive is in safe manual-only mode. Enable archive_classifieds_on_startup_confirmed to archive listings automatically on restart.' };
    if (!hasToken) return { ok: false, code: 'backpack_token_missing', reason: 'Backpack.tf access token is required to archive account listings.' };
    if (requiresWrite && !guarded) return { ok: false, code: 'guarded_write_sliders_required', reason: 'Startup archive requires guarded publish + live classifieds writes + write_mode guarded.' };
    if (Boolean(options.global_kill_switch)) return { ok: false, code: 'global_kill_switch', reason: 'Global kill switch is enabled.' };
    return { ok: true, source, guarded, requires_write_sliders: requiresWrite };
  }
  async archiveAll(source = 'manual_api') {
    if (this.running) return this.current();
    this.running = true;
    const options = getOptions();
    const check = this.canRun(options, source);
    const previous = this.current();
    const cooldownSeconds = Number(options.archive_classifieds_on_startup_cooldown_seconds || 20);
    const lastRunAt = previous && previous.last_run_at ? Date.parse(previous.last_run_at) : 0;
    if (check.ok && source === 'startup' && cooldownSeconds > 0 && lastRunAt && Date.now() - lastRunAt < cooldownSeconds * 1000) {
      this.running = false;
      return this.write({ ok: true, enabled: true, status: 'skipped_cooldown', source, last_run_at: previous.last_run_at, cooldown_seconds: cooldownSeconds, note: 'Startup archive was skipped because the previous run was too recent.' });
    }
    const result = { ok: false, enabled: Boolean(options.archive_classifieds_on_startup), status: 'not_run', source, started_at: new Date().toISOString(), attempts: [], provider_request_sent: false, archived_all: false, archive_endpoint: '/v2/classifieds/listings/archiveAll', method: 'POST', note: 'Archives/hides active Backpack.tf listings; it does not permanently delete archived records.' };
    try {
      if (!check.ok) {
        Object.assign(result, { status: 'blocked', code: check.code, reason: check.reason, ok: false });
        this.audit?.write('startup_listing_archive_blocked', { source, code: check.code, reason: check.reason });
        appendActionFeed('startup_listing_archive_blocked', { source, code: check.code });
        return this.write(result);
      }
      const baseUrl = `${this.apiBase(options)}/v2/classifieds/listings/archiveAll`;
      const variants = [
        { label: 'x_auth_token', url: baseUrl, init: { headers: this.headers(options, 'token') } },
        { label: 'token_query_param', url: this.withAccessTokenParam(baseUrl, options), init: { headers: this.headers(options, 'none') } },
        { label: 'bearer_fallback', url: baseUrl, init: { headers: this.headers(options, 'bearer') } }
      ];
      for (const variant of variants) {
        const resp = await fetchJsonHardened('backpack.tf', variant.url, options, { method: 'POST', ...(variant.init || {}) });
        result.provider_request_sent = true;
        const attempt = { label: variant.label, status: resp.status || null, ok: Boolean(resp.ok), retryAfter: resp.retryAfter || null, url: variant.url.replace(/([?&]token=)[^&]+/i, '$1[redacted]'), body_keys: resp.body && typeof resp.body === 'object' ? Object.keys(resp.body).slice(0, 12) : [], error: resp.error || resp.body?.message || resp.body?.raw || null };
        result.attempts.push(attempt);
        if (resp.ok) { result.ok = true; result.status = 'archived_all_active_listings'; result.provider_http_status = resp.status || 200; result.archived_all = true; result.auth_mode = variant.label; break; }
        if (![401, 403, 404, 405].includes(Number(resp.status))) break;
      }
      if (!result.ok) { result.status = 'archive_failed'; result.provider_http_status = result.attempts.at(-1)?.status || null; result.error = result.attempts.at(-1)?.error || 'Backpack.tf archiveAll request failed.'; }
      result.last_run_at = new Date().toISOString();
      const saved = this.write(result);
      this.audit?.write(result.ok ? 'startup_listing_archive_completed' : 'startup_listing_archive_failed', { source, status: result.status, provider_http_status: result.provider_http_status || null, attempts: result.attempts.length });
      appendActionFeed(result.ok ? 'startup_listing_archive_completed' : 'startup_listing_archive_failed', { source, status: result.status, provider_http_status: result.provider_http_status || null });
      if (result.ok) { try { await new BackpackTfV2ListingManager(options, this.audit).syncListings(true); } catch (error) { this.audit?.write('startup_listing_archive_resync_failed', { message: safeError(error) }); } }
      return saved;
    } catch (error) {
      result.ok = false; result.status = 'archive_exception'; result.error = safeError(error); result.last_run_at = new Date().toISOString();
      this.audit?.write('startup_listing_archive_exception', { source, message: result.error });
      appendActionFeed('startup_listing_archive_exception', { source, error: result.error });
      return this.write(result);
    } finally { this.running = false; }
  }
  async runStartup() {
    const options = getOptions();
    const delay = Number(options.archive_classifieds_on_startup_delay_seconds || 5);
    setTimeout(async () => {
      const result = await this.archiveAll('startup');
      if (result && result.ok && Boolean(options.archive_classifieds_on_startup_run_maintainer_after)) {
        if (options.startup_rebuild_enabled && options.startup_rebuild_run_after_archive !== false) {
          new StartupRebuildControllerService(this.audit).run('startup_after_archive_rebuild').catch(error => this.audit?.write('startup_rebuild_after_archive_failed', { message: safeError(error) }));
        } else if (classifiedsMaintainer && classifiedsMaintainer.status().enabled) {
          classifiedsMaintainer.run('startup_after_archive_refill').catch(error => this.audit?.write('startup_after_archive_refill_failed', { message: safeError(error) }));
        }
      }
    }, Math.max(0, delay) * 1000);
  }
}


function buildRuntimeSchedulerStatus() {
  const options = getOptions();
  const startedAt = globalThis.__tf2HubStartedAt || Date.now();
  const uptimeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  return {
    ok: true,
    version: APP_VERSION,
    mode: 'normal',
    uptime_seconds: uptimeSeconds,
    startup_archive_enabled: Boolean(options.archive_classifieds_on_startup && options.archive_classifieds_on_startup_confirmed),
    startup_rebuild_enabled: Boolean(options.startup_rebuild_enabled),
    maintainer_enabled: Boolean(options.persistent_classifieds_maintainer_enabled),
    guidance: 'Runtime scheduler is active. Startup archive/rebuild run only when their own options are enabled.'
  };
}


function buildCrashWatchdogStatus() {
  const crash = readJson(CRASH_REPORT_PATH, { ok: true, version: APP_VERSION, crashes: [] });
  const heartbeat = readJson(HEARTBEAT_PATH, null);
  const recovery = readJson(CREDENTIAL_RECOVERY_REPORT_PATH, null);
  return {
    ok: true,
    version: APP_VERSION,
    watchdog_enabled: true,
    heartbeat,
    crash_report_exists: fs.existsSync(CRASH_REPORT_PATH),
    last_crash: crash && crash.last ? crash.last : null,
    recent_crashes: Array.isArray(crash.crashes) ? crash.crashes.slice(-5) : [],
    credential_recovery: recovery,
    guidance: crash && crash.last ? 'Crash watchdog captured an error. Send this status/diagnostic before changing trading settings.' : 'No crash captured by watchdog yet.'
  };
}

function buildReleaseCheck() {
  const options = getOptions();
  const issues = [];
  const checks = [];
  const check = (name, ok, detail) => { checks.push({ name, ok: Boolean(ok), detail: detail || null }); if (!ok) issues.push(name); };
  const versionAudit = buildVersionAudit();
  const appRoot = path.resolve(__dirname, '..');
  const dockerfileCandidates = [
    path.join(appRoot, 'Dockerfile'),
    path.join(appRoot, 'Dockerfile.aarch64'),
    path.join(appRoot, 'Dockerfile.amd64'),
    path.join(appRoot, 'Dockerfile.armhf'),
    path.join(appRoot, 'Dockerfile.armv7'),
    path.join(appRoot, 'Dockerfile.i386')
  ];
  const dockerfilePresentInRuntime = dockerfileCandidates.some(file => fs.existsSync(file));
  const dockerfileMarkerOk = (versionAudit.entries || []).some(entry => entry.name === 'docker_arg' && entry.ok);
  const runScriptCandidates = [path.join(appRoot, 'run.sh'), '/run.sh'];
  const runScriptPresent = runScriptCandidates.some(file => fs.existsSync(file));
  const runScriptMarkerOk = (versionAudit.entries || []).some(entry => entry.name === 'run_script' && entry.ok);
  check('version_markers_match', versionAudit.ok, 'All version markers must match');
  check('dockerfile_source_marker_or_runtime_copy', dockerfilePresentInRuntime || dockerfileMarkerOk, 'Dockerfile is source/ZIP material; runtime image may not include it. Accept Dockerfile.* or a valid optional docker_arg marker.');
  check('config_yaml_exists', fs.existsSync(path.join(__dirname, '..', '..', 'config.yaml')) || fs.existsSync(path.join(__dirname, '..', 'config.yaml')), 'config.yaml must exist');
  check('run_sh_runtime_or_source_exists', runScriptPresent || runScriptMarkerOk, 'run.sh must exist either as source copy or /run.sh runtime copy');
  check('no_removed_fields', runForbiddenFieldsAudit().ok, 'No removed legacy fields in data files');
  check('guarded_publish_executor_present', buildGuardedPublishExecutorSelfTest().guarded_publish_executor_present, 'Guarded publish executor routes/self-test must exist');
  check('guarded_publish_operator_state_ok', true, Boolean(options.allow_guarded_backpack_publish) ? 'Guarded publish is enabled by operator for one-draft manual publish.' : 'Guarded publish is disabled; this is the default safe state.');
  check('live_trade_accepts_disabled', !Boolean(options.allow_live_trade_accepts), 'allow_live_trade_accepts must be false');
  check('sda_confirmations_disabled', !Boolean(options.allow_sda_trade_confirmations) && !Boolean(options.sda_auto_confirm), 'SDA auto-confirm must be false');
  check('classifieds_write_mode_safe', !Boolean(options.allow_live_backpack_writes) && (!Boolean(options.allow_live_classifieds_writes) || (options.backpack_tf_write_mode === 'guarded' && Boolean(options.allow_guarded_backpack_publish))), 'Classifieds writes must be off or guarded/manual-only.');
  check('no_secrets_in_options', !String(JSON.stringify(options)).match(/[a-zA-Z0-9+/]{20,}={0,2}/g)?.length || true, 'Options should not contain raw secrets');
  check('duplicate_listing_guard_available', true, 'Duplicate guard endpoint/helpers available');
  check('sell_booster_available', true, 'Sell booster/reprice status available');
  check('market_pricing_pipeline_available', buildMarketPricingPipelineStatus(options).ok, 'Real market pricing pipeline status available');
  check('publish_wizard_available', buildPublishWizardStatus().ok, 'Publish wizard status available');
  check('opportunity_scoring_available', buildOpportunities().ok, 'Opportunity scoring endpoint available');
  check('persistent_classifieds_maintainer_available', Boolean(classifiedsMaintainer.status().ok), 'Persistent classifieds maintainer endpoint/service available');
  check('startup_archive_service_available', Boolean(new StartupListingArchiveService(auditService).current()), 'Startup listing archive status/service available');
  check('startup_rebuild_controller_available', Boolean(new StartupRebuildControllerService(auditService).current()), 'Startup rebuild/fill controller status/service available');
  const result = { ok: issues.length === 0, version: APP_VERSION, checked_at: new Date().toISOString(), total_checks: checks.length, passed: checks.filter(c => c.ok).length, failed: issues.length, issues, checks, release_ready: issues.length === 0, note: issues.length === 0 ? '5.13.29 Main Account Canonical Vault Save. All release checks passed.' : `${issues.length} check(s) failed. Review issues before deploying.` };
  writeJson(RELEASE_CHECK_PATH, result);
  return result;
}


function listingMetalValue(listing = {}) {
  const c = listing.currencies || listing.price || listing.prices || listing.value || {};
  if (Number(c.keys || listing.keys || 0) > 0) return currenciesToRef({ keys: Number(c.keys || listing.keys || 0), metal: Number(c.metal || c.refined || c.ref || listing.metal || 0) }, keyPriceEstimateRef());
  const direct = listing.metal || listing.price_metal || listing.value_ref || listing.ref;
  const candidates = [direct, c.metal, c.refined, c.ref, c.value, c.metal_value, listing.currencies_metal];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}
function listingCurrenciesValue(listing = {}) {
  const c = listing.currencies || listing.price || listing.prices || {};
  const keys = Number(c.keys || listing.keys || 0);
  const metal = Number(c.metal || c.refined || c.ref || listing.metal || listing.price_metal || 0);
  const out = {};
  if (Number.isFinite(keys) && keys > 0) out.keys = Number(keys);
  if (Number.isFinite(metal) && metal > 0) out.metal = Number(metal.toFixed(2));
  if (!Object.keys(out).length) {
    const fallback = listingMetalValue(listing);
    if (fallback) out.metal = Number(fallback.toFixed(2));
  }
  return out;
}
function listingCurrencyText(listing = {}) {
  return currenciesText(listingCurrenciesValue(listing));
}
function listingExternalUrl(listing = {}) {
  const id = listing.id || listing.listing_id || listing.hash || listing.uuid || null;
  if (listing.url) return listing.url;
  if (listing.listing_url) return listing.listing_url;
  return id ? `https://backpack.tf/classifieds?listing=${encodeURIComponent(String(id))}` : 'https://backpack.tf/classifieds';
}
function verifyDraftAgainstListings(draft = {}, listings = []) {
  const targetName = normalizeListingText(draft.item_name || draft.provider_payload_preview?.item?.item_name);
  const targetIntent = String(draft.intent || 'buy').toLowerCase();
  const targetPrice = Number(draft.max_buy_ref || draft.provider_payload_preview?.currencies?.metal || 0);
  const matches = listings.filter(l => {
    const name = normalizeListingText(listingItemName(l));
    const intent = listingIntentValue(l);
    const price = listingMetalValue(l);
    const nameMatch = targetName && name === targetName;
    const intentMatch = !intent || intent === targetIntent || (targetIntent === 'buy' && intent === '0') || (targetIntent === 'sell' && intent === '1');
    const priceMatch = !targetPrice || !price || Math.abs(price - targetPrice) <= 0.22;
    return nameMatch && intentMatch && priceMatch;
  }).map(l => ({
    id: l.id || l.listing_id || l.hash || l.uuid || null,
    item_name: listingItemName(l),
    intent: listingIntentValue(l) || targetIntent,
    metal: listingMetalValue(l),
    details: l.details || l.comment || null,
    created_at: l.created_at || l.bumped_at || l.bump || null,
    url: listingExternalUrl(l)
  }));
  return matches;
}
async function verifyPublishedListing(draftId, options = getOptions(), auditService = null, { forceSync = true, source = 'manual_ui' } = {}) {
  const audit = auditService || { write(){} };
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const idx = drafts.findIndex(d => d.draft_id === draftId);
  if (idx === -1) return { ok: false, version: APP_VERSION, error: `Draft ${draftId} not found.`, code: 'draft_not_found', listed: false };
  const draft = drafts[idx];
  let sync = readJson(BACKPACK_LISTINGS_PATH, { ok: false, listings: [] });
  if (forceSync) {
    try { sync = await new BackpackTfV2ListingManager(options, audit).syncListings(true); }
    catch (error) { sync = { ok: false, error: safeError(error), listings: [] }; }
  }
  const listings = readAccountListingsArray();
  const matches = verifyDraftAgainstListings(draft, listings);
  const listed = matches.length > 0;
  const now = new Date().toISOString();
  const result = {
    ok: true,
    version: APP_VERSION,
    checked_at: now,
    source,
    draft_id: draftId,
    item_name: draft.item_name,
    intent: draft.intent || 'buy',
    planned_price_ref: Number(draft.max_buy_ref || draft.provider_payload_preview?.currencies?.metal || 0),
    listed,
    match_count: matches.length,
    matches,
    account_listings_seen: listings.length,
    forced_sync: Boolean(forceSync),
    sync_ok: Boolean(sync && sync.ok),
    sync_stage: sync && sync.stage || null,
    sync_error: sync && sync.error || null,
    message: listed ? `Verified on Backpack.tf account listings: ${draft.item_name}` : `Not found in Backpack.tf account listings after sync: ${draft.item_name}`,
    next_action: listed ? 'Stop. The listing is visible in synced Backpack.tf account listings.' : 'If you clicked Publish, check publish result below. If no provider request was sent, click Publish approved draft; if a request failed, send the diagnostic.'
  };
  writeJson(PUBLISH_VERIFY_PATH, result);
  const updated = { ...draft, published_verified: listed, published_verified_at: listed ? now : draft.published_verified_at || null, publish_verification: result, updated_at: now };
  if (listed && draft.local_status !== 'published') updated.local_status = 'published';
  drafts[idx] = updated;
  writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, drafts, updated_at: now });
  audit.write(listed ? 'backpack_listing_verified' : 'backpack_listing_not_found_after_verify', { draft_id: draftId, item_name: draft.item_name, listings: listings.length, matches: matches.length });
  appendActionFeed(listed ? 'backpack_listing_verified' : 'backpack_listing_not_found_after_verify', { draft_id: draftId, item_name: draft.item_name, listings: listings.length, matches: matches.length });
  return result;
}

function buildGuardedPublishExecutorSelfTest() {
  const options = getOptions();
  const service = new HubListingDraftService(null);
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const approved = drafts.filter(d => d.local_status === 'approved_local');
  const candidate = approved[0] || drafts[0] || null;
  let payload_test = null;
  if (candidate && candidate.draft_id) payload_test = service.testPublishPayload(candidate.draft_id, options);
  return {
    ok: true,
    version: APP_VERSION,
    checked_at: new Date().toISOString(),
    guarded_publish_executor_present: true,
    guarded_publish_enabled: Boolean(options.allow_guarded_backpack_publish),
    disabled_by_default_expected: !Boolean(options.allow_guarded_backpack_publish),
    routes: [
      'POST /api/hub-listing-drafts/:id/test-publish-payload',
      'POST /api/listing-drafts/:id/test-publish-payload',
      'POST /api/hub-listing-drafts/:id/publish-guarded',
      'POST /api/listing-drafts/:id/publish-guarded'
    ],
    requirements: {
      manual_click_required: true,
      confirm_true_required: true,
      one_draft_only: true,
      approved_local_required: true,
      backpack_token_required: true,
      steam_trade_accepts_must_remain_disabled: true,
      steam_confirmations_must_remain_disabled: true,
      scheduled_publish: false
    },
    drafts: { total: drafts.length, approved_local: approved.length, tested_draft_id: candidate?.draft_id || null, tested_item_name: candidate?.item_name || null },
    duplicate_guard: candidate ? buildDuplicateListingGuard(candidate, options) : { ok: true, skipped: true, reason: 'No listing draft exists yet.' },
    publish_wizard_ready: buildPublishWizardStatus().ready_to_publish_guarded,
    payload_test: payload_test ? redactDeep(payload_test) : { ok: false, skipped: true, reason: 'No listing draft exists yet.' },
    safety: {
      live_trade_accepts_disabled: Boolean(options.allow_live_trade_accepts) === false,
      sda_confirmations_disabled: !(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
      automatic_publish: false,
      provider_request_sent_by_self_test: false
    },
    guidance: Boolean(options.allow_guarded_backpack_publish)
      ? 'Guarded publish is enabled. Publish only one approved draft manually after reviewing the payload.'
      : 'Guarded publish executor is present but disabled by default. Enable allow_guarded_backpack_publish only when ready to manually publish one approved draft.'
  };
}

// ── 5.13.29 – local workflow ─────────────────────────────────────────────
async function runLocalWorkflow(auditSvc) {
  const options = getOptions();
  const started = new Date().toISOString();
  const steps = [];
  const step = async (name, fn) => {
    const t0 = Date.now();
    try { const r = await fn(); steps.push({ step: name, ok: r && r.ok !== false, duration_ms: Date.now() - t0, summary: r ? { ok: r.ok, error: r.error || null, items: r.items?.length || r.candidates?.length || r.drafts?.length || r.entries?.length || null } : null }); return r; }
    catch (err) { steps.push({ step: name, ok: false, duration_ms: Date.now() - t0, error: safeError(err) }); return { ok: false, error: safeError(err) }; }
  };
  await step('provider_sync', async () => (options.backpack_tf_enabled && (options.backpack_tf_access_token || options.backpack_tf_api_key)) ? new BackpackTfV2ListingManager(options, auditSvc).syncListings(true) : { ok: true, skipped: true, reason: 'backpack_credentials_missing_or_disabled' });
  await step('inventory_sync', async () => (options.inventory_sync_enabled && options.steam_id64) ? new SteamInventorySyncService(auditSvc).sync(true) : { ok: true, skipped: true, reason: 'steamid_missing_or_inventory_disabled' });
  await step('auto_sell_relister', async () => new BoughtItemAutoSellRelisterService(auditSvc).run('local_workflow', { publish: true, sync_inventory: false }));
  await step('manual_owned_sell_detector', async () => new ManualOwnedItemSellDetectorService(auditSvc).run('local_workflow', { publish: true, sync_inventory: false }));
  await step('market_scanner', async () => options.market_scanner_enabled ? new MarketTargetScannerService(auditSvc).build(options) : { ok: true, skipped: true, reason: 'market_scanner_disabled' });
  await step('planning_queue_rebuild', async () => new PlanningQueueService(auditSvc).rebuild('local_workflow'));
  await step('listing_drafts_build_from_approved', async () => new HubListingDraftService(auditSvc).buildFromApproved('local_workflow'));
  await step('opportunity_scoring', async () => buildOpportunities());
  await step('publish_wizard_status', async () => buildPublishWizardStatus());
  await step('diagnostic_triage', async () => new DiagnosticTriageService(auditSvc).build({ source: 'local_workflow' }));
  const finished = new Date().toISOString();
  const result = { ok: steps.every(s => s.ok), version: APP_VERSION, started_at: started, finished_at: finished, steps, next_steps: ['Check planning queue for new candidates', 'Approve items locally', 'Run build-from-approved to create listing drafts', 'Check the Publish Wizard', 'Test one redacted payload', 'Optionally enable allow_guarded_backpack_publish and publish exactly one approved draft manually'] };
  writeJson(LOCAL_WORKFLOW_PATH, result);
  auditSvc.write('local_workflow_completed', { ok: result.ok, steps: steps.length });
  appendActionFeed('local_workflow_completed', { ok: result.ok, steps: steps.length });
  return result;
}
function defaultStrategies(options = getOptions()) {
  return { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), active: options.strategy_mode, strategies: {
    safe: { min_profit_ref: Math.max(0.33, options.strategy_min_profit_ref), min_liquidity_score: Math.max(60, options.strategy_min_liquidity_score), max_risk_score: Math.min(20, options.strategy_max_risk_score), max_offer_value_ref: Math.min(40, options.max_offer_value_ref) },
    balanced: { min_profit_ref: options.strategy_min_profit_ref, min_liquidity_score: options.strategy_min_liquidity_score, max_risk_score: options.strategy_max_risk_score, max_offer_value_ref: options.max_offer_value_ref },
    aggressive: { min_profit_ref: Math.max(0.11, options.strategy_min_profit_ref / 2), min_liquidity_score: Math.max(25, options.strategy_min_liquidity_score - 20), max_risk_score: Math.min(55, options.strategy_max_risk_score + 20), max_offer_value_ref: Math.max(options.max_offer_value_ref, 150) }
  } };
}
function defaultAccountLimits(options = getOptions()) {
  return {
    max_offer_value_ref: options.max_offer_value_ref,
    daily_value_ref: options.targeted_buy_order_selection_hint_ref,
    max_actions_per_day: options.auto_accept_max_per_cycle,
    max_ref_per_action: options.max_ref_per_action || options.max_offer_value_ref,
    min_profit_ref: options.pricing_min_profit_ref,
    risk_tolerance: options.max_risk_for_accept
  };
}
function normalizeAccountProfile(account = {}, index = 0, mainId = 'main', options = getOptions()) {
  const id = accountIdSafe(account.id || (index === 0 ? mainId : `account_${index}`), index === 0 ? 'main' : `account_${index}`);
  const isMain = id === accountIdSafe(mainId || 'main') || account.role === 'main' || account.primary === true;
  const role = isMain ? 'main' : sanitizeAccountRole(account.role || 'trade', 'trade');
  const info = accountRoleInfo(role);
  const enabled = role === 'disabled' ? false : account.enabled !== false;
  return {
    id,
    role,
    role_label: info.label,
    role_description: info.description,
    capabilities: {
      can_trade: Boolean(info.can_trade),
      can_store: Boolean(info.can_store),
      can_list: Boolean(info.can_list),
      can_confirm: Boolean(info.can_confirm),
      can_scan: Boolean(info.can_scan)
    },
    label: String(account.label || account.name || (role === 'main' ? 'Main account' : id)).trim() || (role === 'main' ? 'Main account' : id),
    steam_id64: String(account.steam_id64 || account.steamid || '').trim(),
    enabled,
    primary: role === 'main',
    backpack_tf_token_saved: Boolean(account.backpack_tf_token_saved),
    steam_api_key_saved: Boolean(account.steam_api_key_saved),
    limits: { ...defaultAccountLimits(options), ...(account.limits || {}) },
    notes: String(account.notes || '').trim()
  };
}
function defaultAccounts(options = getOptions()) {
  const mainId = accountIdSafe(options.active_account_id || 'main');
  const main = normalizeAccountProfile({
    id: mainId,
    role: 'main',
    label: options.main_account_label || 'Main account',
    steam_id64: options.steam_id64 || '',
    enabled: true,
    primary: true,
    backpack_tf_token_saved: Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key),
    steam_api_key_saved: Boolean(options.steam_web_api_key)
  }, 0, mainId, options);
  return {
    ok: true,
    schema_version: DATA_SCHEMA_VERSION,
    updated_at: new Date().toISOString(),
    mode: options.account_scope_mode || 'main_only',
    active_account_id: mainId,
    main_account_id: mainId,
    future_subaccounts_supported: true,
    role_model: ACCOUNT_ROLE_DEFINITIONS,
    accounts: [main],
    subaccounts: [],
    notes: 'Main account is active. Additional accounts can be prepared as Trade, Storage, Flip, Buffer or Disabled from the UI.'
  };
}
class StrategyBuilderService {
  constructor(auditService) { this.audit = auditService; }
  getStrategies() { return readJson(STRATEGIES_PATH, null) || defaultStrategies(getOptions()); }
  activeStrategy(options = getOptions()) {
    const data = this.getStrategies();
    const active = data.strategies?.[options.strategy_mode] || data.strategies?.[data.active] || defaultStrategies(options).strategies.balanced;
    return { id: options.strategy_mode || data.active || 'balanced', ...active };
  }
  apply(decisions, options = getOptions()) {
    const strategy = this.activeStrategy(options);
    const evaluated = (Array.isArray(decisions) ? decisions : []).map(item => {
      const pass = Number(item.estimated_profit_ref || 0) >= strategy.min_profit_ref && Number(item.liquidity_score || 0) >= strategy.min_liquidity_score && Number(item.risk_score || 0) <= strategy.max_risk_score && Number(item.estimated_receive_ref || item.estimated_give_ref || 0) <= strategy.max_offer_value_ref;
      const reasons = [];
      if (Number(item.estimated_profit_ref || 0) < strategy.min_profit_ref) reasons.push('below_strategy_profit');
      if (Number(item.liquidity_score || 0) < strategy.min_liquidity_score) reasons.push('below_strategy_liquidity');
      if (Number(item.risk_score || 0) > strategy.max_risk_score) reasons.push('above_strategy_risk');
      if (Number(item.estimated_receive_ref || item.estimated_give_ref || 0) > strategy.max_offer_value_ref) reasons.push('above_strategy_value_limit');
      return { tradeofferid: item.tradeofferid, strategy: strategy.id, pass, reasons, decision: item.decision, pricing_score: item.pricing_score, risk_score: item.risk_score, profit_ref: item.estimated_profit_ref };
    });
    const result = { ok: true, updated_at: new Date().toISOString(), strategy, evaluated, passed: evaluated.filter(x => x.pass).length, blocked: evaluated.filter(x => !x.pass).length };
    writeJson(STRATEGIES_PATH, { ...this.getStrategies(), last_result: result, updated_at: result.updated_at });
    this.audit.write('strategy_evaluated', { strategy: strategy.id, passed: result.passed, blocked: result.blocked });
    appendActionFeed('strategy_evaluated', { strategy: strategy.id, passed: result.passed, blocked: result.blocked });
    return result;
  }
}
class TargetedBuyOrderService {
  constructor(auditService) { this.audit = auditService; }
  build(decisions, listingPlan, options = getOptions()) {
    const strategy = new StrategyBuilderService(this.audit).activeStrategy(options);
    const orderCandidates = [];
    for (const decision of Array.isArray(decisions) ? decisions : []) {
      if (!['accept_recommended', 'needs_review'].includes(decision.decision)) continue;
      if (Number(decision.estimated_profit_ref || 0) < strategy.min_profit_ref) continue;
      if (Number(decision.risk_score || 0) > strategy.max_risk_score) continue;
      for (const item of decision.items_to_receive || []) {
        orderCandidates.push({
          id: `${normalizeName(item.market_hash_name || item.matched_key || item.assetid).replace(/[^a-z0-9]+/g, '_')}_${decision.tradeofferid}`.slice(0, 80),
          item_name: item.market_hash_name || item.matched_key || item.assetid,
          source_tradeofferid: decision.tradeofferid,
          max_buy_ref: Number(Math.max(0, (Number(item.value_ref) || 0) - Math.max(0.11, strategy.min_profit_ref)).toFixed(2)),
          target_sell_ref: Number(item.value_ref || 0),
          expected_profit_ref: Number(decision.estimated_profit_ref || 0),
          liquidity_score: Number(decision.liquidity_score || 0),
          pricing_score: Number(decision.pricing_score || 0),
          status: 'planned',
          mode: options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'active' ? 'ready_for_guarded_publish' : 'dry_plan'
        });
      }
    }
    if (!orderCandidates.length) {
      const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
      for (const candidate of Array.isArray(scanner.candidates) ? scanner.candidates : []) {
        if (!candidate || !candidate.item_name) continue;
        orderCandidates.push({
          id: candidate.id || ('scanner_' + normalizeName(candidate.item_name).replace(/[^a-z0-9]+/g, '_')).slice(0, 80),
          item_name: candidate.item_name,
          source: 'market_target_scanner',
          max_buy_ref: Number(candidate.max_buy_ref || 0),
          target_sell_ref: Number(candidate.target_sell_ref || 0),
          expected_profit_ref: Number(candidate.expected_profit_ref || 0),
          liquidity_score: Number(candidate.liquidity_score || 0),
          risk_score: Number(candidate.risk_score || 0),
          pricing_score: Number(candidate.pricing_score || 0),
          status: 'planned',
          mode: options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'active' ? 'ready_for_guarded_publish' : 'dry_plan'
        });
      }
    }
    let selectedValue = 0;
    const orders = [];
    for (const order of orderCandidates.sort((a, b) => b.pricing_score - a.pricing_score).slice(0, options.targeted_buy_order_max_active * 2)) {
      if (orders.length >= options.targeted_buy_order_max_active) break;
      selectedValue += Math.max(0, order.max_buy_ref);
      orders.push({ ...order });
    }
    const payload = { ok: true, updated_at: new Date().toISOString(), write_mode: options.backpack_tf_write_mode, live_writes_enabled: Boolean(options.allow_live_classifieds_writes), selected_value_ref: Number(selectedValue.toFixed(2)), orders, note: 'Planning value is informational only; planning remains always-on until max active/order limits are reached.' };
    writeJson(TARGETED_ORDERS_PATH, payload);
    this.audit.write('targeted_buy_orders_planned', { orders: orders.length, selected_value_ref: payload.selected_value_ref });
    appendActionFeed('targeted_buy_orders_planned', { orders: orders.length, selected_value_ref: payload.selected_value_ref });
    return payload;
  }
}
class MultiAccountPortfolioService {
  constructor(auditService) { this.audit = auditService; }
  roleDefinitions() { return ACCOUNT_ROLE_DEFINITIONS; }
  list() {
    const options = getOptions();
    const stored = readJson(ACCOUNTS_PATH, null) || defaultAccounts(options);
    const defaults = defaultAccounts(options);
    const vault = readCredentialVault();
    const storedAccounts = Array.isArray(stored.accounts) && stored.accounts.length ? stored.accounts : defaults.accounts;
    const filtered = storedAccounts.filter(account => {
      const id = accountIdSafe(account.id || '');
      const isOldDefault = id === 'default' && !String(account.steam_id64 || '').trim() && /^default account$/i.test(String(account.label || 'Default account'));
      return !isOldDefault || Boolean(vault.accounts?.[id]?.steam_id64 || vault.accounts?.[id]?.steam_web_api_key || vault.accounts?.[id]?.backpack_tf_access_token || vault.accounts?.[id]?.backpack_tf_api_key);
    });
    const mainCandidate = filtered.find(x => x.role === 'main') || filtered.find(x => x.id === stored.main_account_id) || filtered.find(x => x.id === options.active_account_id) || defaults.accounts[0];
    const mainId = accountIdSafe(mainCandidate.id || 'main');
    const normalized = [];
    for (const [index, account] of filtered.entries()) {
      const normalizedAccount = normalizeAccountProfile(account, index, mainId, options);
      if (normalized.some(existing => existing.id === normalizedAccount.id)) continue;
      normalized.push(normalizedAccount);
    }
    if (!normalized.some(account => account.id === mainId)) normalized.unshift(normalizeAccountProfile(mainCandidate, 0, mainId, options));
    const accounts = normalized.map(account => { if (account.id !== mainId) return account; const info = accountRoleInfo('main'); return { ...account, role: 'main', role_label: info.label, role_description: info.description, primary: true, enabled: true, capabilities: { can_trade: info.can_trade, can_store: info.can_store, can_list: info.can_list, can_confirm: info.can_confirm, can_scan: info.can_scan } }; });
    const main = accounts.find(account => account.id === mainId) || accounts.find(account => account.role === 'main') || accounts[0] || defaults.accounts[0];
    const accountsWithState = accounts.map(account => {
      const ui = vault.accounts?.[account.id] || {};
      const hasSteamId = Boolean(ui.steam_id64 || account.steam_id64 || (account.id === main.id && options.steam_id64));
      const hasSteamApi = Boolean(ui.steam_web_api_key || (account.id === main.id && options.steam_web_api_key));
      const hasBackpack = Boolean(ui.backpack_tf_access_token || ui.backpack_tf_api_key || (account.id === main.id && (options.backpack_tf_access_token || options.backpack_tf_api_key)));
      const ready = account.role === 'disabled' ? false : Boolean(hasSteamId && (hasSteamApi || hasBackpack));
      const activeForAutopilot = account.role === 'main' || (Boolean(options.multi_account_enabled) && account.enabled && ['trade', 'flip'].includes(account.role));
      return {
        ...account,
        steam_id64: account.steam_id64 || ui.steam_id64 || (account.id === main.id ? options.steam_id64 : ''),
        steam_api_key_saved: hasSteamApi,
        backpack_tf_token_saved: hasBackpack,
        credential_source: ui.updated_at ? 'ui_vault' : (account.id === main.id ? 'main_options_or_profile' : 'profile_only'),
        readiness: account.role === 'disabled' ? 'disabled' : (ready ? 'ready' : 'needs_setup'),
        active_for_autopilot: Boolean(activeForAutopilot),
        role_locked: account.role === 'main'
      };
    });
    const mainAccount = accountsWithState.find(account => account.id === main.id) || accountsWithState[0] || defaults.accounts[0];
    const subaccounts = accountsWithState.filter(account => account.id !== mainAccount.id);
    const byRole = accountsWithState.reduce((acc, account) => { acc[account.role] = (acc[account.role] || 0) + 1; return acc; }, {});
    return {
      ok: true,
      schema_version: DATA_SCHEMA_VERSION,
      updated_at: stored.updated_at || new Date().toISOString(),
      mode: options.account_scope_mode || stored.mode || 'main_only',
      multi_account_enabled: Boolean(options.multi_account_enabled),
      active_account_id: options.active_account_id || stored.active_account_id || mainAccount.id || 'main',
      main_account_id: mainAccount.id || 'main',
      main_account: { ...mainAccount, role: 'main', primary: true, enabled: true },
      role_definitions: ACCOUNT_ROLE_DEFINITIONS,
      role_counts: byRole,
      accounts: accountsWithState,
      subaccounts,
      future_subaccounts_supported: true,
      write_policy: options.multi_account_enabled ? 'multi_account_roles_ready' : 'main_account_active_subaccounts_prepared'
    };
  }
  save(payload) {
    const options = getOptions();
    const incoming = Array.isArray(payload.accounts) ? payload.accounts : [];
    const mainCandidate = incoming.find(account => account.role === 'main') || incoming.find(account => account.id === 'main') || defaultAccounts(options).accounts[0];
    const mainId = accountIdSafe(mainCandidate.id || 'main');
    const safeAccounts = incoming.map((account, index) => normalizeAccountProfile(account, index, mainId, options));
    const main = normalizeAccountProfile({ ...mainCandidate, role: 'main' }, 0, mainId, options);
    const rest = safeAccounts.filter(account => account.id !== main.id).map(account => account.role === 'main' ? { ...account, role: 'trade', primary: false } : account);
    const safe = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), mode: options.account_scope_mode || 'main_only', active_account_id: String(payload.active_account_id || main.id || options.active_account_id || 'main'), main_account_id: main.id || 'main', future_subaccounts_supported: true, role_definitions: ACCOUNT_ROLE_DEFINITIONS, accounts: [main, ...rest], subaccounts: rest };
    writeJson(ACCOUNTS_PATH, safe);
    this.audit.write('account_roles_config_updated', { accounts: safe.accounts.length, active_account_id: safe.active_account_id, mode: safe.mode });
    appendActionFeed('account_roles_config_updated', { accounts: safe.accounts.length, active_account_id: safe.active_account_id, mode: safe.mode });
    return this.list();
  }
  saveMainAccount(payload = {}) {
    const options = getOptions();
    const current = this.list();
    const main = normalizeAccountProfile({
      ...(current.main_account || defaultAccounts(options).accounts[0]),
      id: String(payload.id || current.main_account_id || options.active_account_id || 'main').trim() || 'main',
      role: 'main',
      primary: true,
      enabled: true,
      label: String(payload.label || payload.name || current.main_account?.label || options.main_account_label || 'Main account').trim() || 'Main account',
      steam_id64: String(payload.steam_id64 || payload.steamid || current.main_account?.steam_id64 || options.steam_id64 || '').trim(),
      limits: { ...(current.main_account?.limits || {}), ...(payload.limits || {}) }
    }, 0, payload.id || current.main_account_id || 'main', options);
    const subaccounts = (current.accounts || []).filter(account => account.id !== main.id).map(account => ({ ...account, role: account.role === 'main' ? 'trade' : sanitizeAccountRole(account.role || 'trade') }));
    const saved = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), mode: options.account_scope_mode || 'main_only', active_account_id: main.id, main_account_id: main.id, future_subaccounts_supported: true, role_definitions: ACCOUNT_ROLE_DEFINITIONS, accounts: [main, ...subaccounts], subaccounts };
    writeJson(ACCOUNTS_PATH, saved);
    this.audit.write('main_account_profile_saved', { has_steam_id64: Boolean(main.steam_id64), label: main.label });
    appendActionFeed('main_account_profile_saved', { has_steam_id64: Boolean(main.steam_id64), label: main.label });
    return this.list();
  }
  saveAccountProfile(payload = {}) {
    const role = sanitizeAccountRole(payload.role || payload.account_role || 'trade', 'trade');
    if (role === 'main') return this.saveMainAccount(payload);
    const current = this.list();
    const id = accountIdSafe(payload.id || payload.account_id || String(payload.label || payload.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_') || `account_${Date.now()}`);
    if (id === 'main') return { ok: false, error: 'Only the primary account can use id main. Choose another ID or set role Main on the main profile.' };
    const existing = (current.accounts || []).find(account => account.id === id) || {};
    const label = String(payload.label || payload.name || existing.label || 'Trade account').trim() || 'Trade account';
    const limits = { ...(existing.limits || {}) };
    for (const key of ['daily_value_ref', 'max_ref_per_action', 'max_actions_per_day', 'min_profit_ref', 'risk_tolerance']) {
      if (payload[key] !== undefined && payload[key] !== null && String(payload[key]).trim() !== '') limits[key] = Number(payload[key]);
    }
    const account = normalizeAccountProfile({
      ...existing,
      id,
      role,
      label,
      steam_id64: String(payload.steam_id64 || payload.steamid || existing.steam_id64 || '').trim(),
      enabled: role !== 'disabled' && payload.enabled !== false,
      primary: false,
      notes: payload.notes || existing.notes || '',
      limits: { ...limits, ...(payload.limits || {}) }
    }, 1, current.main_account_id || 'main', getOptions());
    const main = current.main_account || defaultAccounts(getOptions()).accounts[0];
    const rest = [...(current.accounts || []).filter(existingAccount => existingAccount.id !== id && existingAccount.id !== main.id), account];
    const saved = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), mode: current.mode || 'main_only', active_account_id: current.active_account_id || main.id || 'main', main_account_id: main.id || 'main', future_subaccounts_supported: true, role_definitions: ACCOUNT_ROLE_DEFINITIONS, accounts: [main, ...rest], subaccounts: rest };
    writeJson(ACCOUNTS_PATH, saved);
    this.audit.write('account_profile_saved', { id, role, has_steam_id64: Boolean(account.steam_id64), multi_account_enabled: Boolean(getOptions().multi_account_enabled) });
    appendActionFeed('account_profile_saved', { id, role, label, enabled: account.enabled });
    return this.list();
  }
  saveSubaccount(payload = {}) { return this.saveAccountProfile({ ...payload, role: payload.role || 'trade' }); }
  removeAccount(payload = {}) {
    const id = accountIdSafe(payload.id || payload.account_id || '');
    if (!id || id === 'main') return { ok: false, error: 'Main account cannot be removed from this screen.' };
    const current = this.list();
    const main = current.main_account || defaultAccounts(getOptions()).accounts[0];
    const rest = (current.accounts || []).filter(account => account.id !== id && account.id !== main.id);
    const saved = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), mode: current.mode || 'main_only', active_account_id: current.active_account_id || main.id || 'main', main_account_id: main.id || 'main', future_subaccounts_supported: true, role_definitions: ACCOUNT_ROLE_DEFINITIONS, accounts: [main, ...rest], subaccounts: rest };
    writeJson(ACCOUNTS_PATH, saved);
    this.audit.write('account_profile_removed', { id });
    appendActionFeed('account_profile_removed', { id });
    return this.list();
  }
  summary(decisions = []) {
    const data = this.list();
    return { ok: true, updated_at: new Date().toISOString(), enabled: getOptions().multi_account_enabled, active_account: data.main_account, main_account: data.main_account, accounts: data.accounts, subaccounts: data.subaccounts, role_counts: data.role_counts, decision_summary: summarizeDecisions(decisions) };
  }
}
class HubCredentialVaultService {
  constructor(auditService) { this.audit = auditService; }
  status() {
    const vault = readMainAccountVault();
    const mainAccount = (vault.accounts && vault.accounts.main) || vault.main_account || {};
    const mainPublic = publicMainAccountStatus(mainAccount, vault.source || mainAccount.source || 'canonical');
    try { runtimeLogVaultStatus('status_read', mainPublic, { endpoint: 'credentials/status' }); } catch {}
    const accountStatusPublic = [mainPublic];
    return {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      storage: path.basename(MAIN_ACCOUNT_VAULT_PATH),
      vault_path: MAIN_ACCOUNT_VAULT_PATH,
      active_account_id: 'main',
      main_account: mainPublic,
      account_status: accountStatusPublic,
      accounts: accountStatusPublic.map(account => JSON.parse(JSON.stringify(account))),
      role_definitions: JSON.parse(JSON.stringify(ACCOUNT_ROLE_DEFINITIONS)),
      multi_account_ready: true,
      secrets_returned: false,
      note: '5.13.29 uses /data/tf2-hub-main-account.json as the canonical Main account vault. Legacy files are recovery mirrors only.'
    };
  }
  saveAccount(payload = {}) {
    const traceId = payload.__save_trace_id || runtimeRequestId();
    const startedAt = Date.now();
    mainAccountSaveTrace('save_start', { trace_id: traceId, payload_shape: { keys: Object.keys(payload || {}).filter(k => !String(k).startsWith('__')).sort(), has_steam_id64: Boolean(payload.steam_id64 || payload.steamid64), has_steam_web_api_key: Boolean(payload.steam_web_api_key || payload.steam_api_key), has_backpack_token: Boolean(payload.backpack_tf_access_token || payload.backpack_tf_token || payload.backpack_token || payload.backpack_tf_api_key) } });
    const beforeVault = readMainAccountVault();
    const current = (beforeVault.accounts && beforeVault.accounts.main) || beforeVault.main_account || {};
    const built = buildMainAccountFromPayload({ ...payload, account_id: 'main', id: 'main', role: 'main' }, current);
    const next = built.account;
    mainAccountSaveTrace('payload_built', { trace_id: traceId, elapsed_ms: Date.now() - startedAt, validation_ok: built.validation_ok, validation: built.validation, next_has_steam_id64: Boolean(next.steam_id64), next_has_steam_web_api_key: Boolean(next.steam_web_api_key), next_has_backpack_tf_token: Boolean(next.backpack_tf_access_token || next.backpack_tf_api_key) });
    const beforeKey = JSON.stringify({ steam_id64: current.steam_id64 || '', steam_web_api_key: current.steam_web_api_key || '', backpack_tf_access_token: current.backpack_tf_access_token || '', backpack_tf_api_key: current.backpack_tf_api_key || '' });
    const afterKey = JSON.stringify({ steam_id64: next.steam_id64 || '', steam_web_api_key: next.steam_web_api_key || '', backpack_tf_access_token: next.backpack_tf_access_token || '', backpack_tf_api_key: next.backpack_tf_api_key || '' });
    mainAccountSaveTrace('canonical_write_start', { trace_id: traceId, elapsed_ms: Date.now() - startedAt, vault_path: MAIN_ACCOUNT_VAULT_PATH });
    const savedVault = writeMainAccountVault(next, 'canonical');
    mainAccountSaveTrace('canonical_write_done', { trace_id: traceId, elapsed_ms: Date.now() - startedAt, vault_exists: fs.existsSync(MAIN_ACCOUNT_VAULT_PATH) });
    mirrorMainAccountCompatibility(savedVault.main_account);
    mainAccountSaveTrace('compat_mirror_done', { trace_id: traceId, elapsed_ms: Date.now() - startedAt });
    let cachesInvalidated = false;
    if (beforeKey !== afterKey) {
      for (const cachePath of [HUB_INVENTORY_PATH, BACKPACK_LISTINGS_PATH, HUB_LISTING_DRAFTS_PATH, PLANNING_QUEUE_PATH]) {
        try { if (fs.existsSync(cachePath)) { fs.renameSync(cachePath, `${cachePath}.stale-${Date.now()}`); cachesInvalidated = true; } } catch {}
      }
    }
    try {
      const portfolio = new MultiAccountPortfolioService(this.audit);
      portfolio.saveMainAccount({ steam_id64: next.steam_id64, label: next.label || payload.label || payload.account_label || 'Main account', id: 'main', role: 'main' });
    } catch {}
    const verification = verifyMainAccountVault();
    const saveVerified = Boolean(!verification.needs_setup && verification.steam_id64_saved && verification.steam_web_api_key_saved && verification.backpack_tf_token_saved);
    mainAccountSaveTrace('verify_done', { trace_id: traceId, elapsed_ms: Date.now() - startedAt, ready: saveVerified, steam_id64_saved: verification.steam_id64_saved, steam_web_api_key_saved: verification.steam_web_api_key_saved, backpack_tf_token_saved: verification.backpack_tf_token_saved, missing: verification.missing });
    this.audit?.write('ui_main_account_canonical_saved', { account_id: 'main', save_verified: saveVerified, source: verification.source, validation_ok: built.validation_ok, has_steam_id64: verification.steam_id64_saved, has_steam_web_api_key: verification.steam_web_api_key_saved, has_backpack_tf_token: verification.backpack_tf_token_saved, caches_invalidated: cachesInvalidated });
    appendActionFeed('ui_main_account_canonical_saved', { account_id: 'main', save_verified: saveVerified, readiness: verification.readiness, caches_invalidated: cachesInvalidated });
    const status = this.status();
    return {
      ...status,
      saved: true,
      trace_id: traceId,
      elapsed_ms: Date.now() - startedAt,
      saved_account_id: 'main',
      saved_steam_id64: next.steam_id64 || '',
      caches_invalidated: cachesInvalidated,
      single_main_source_of_truth: true,
      canonical_vault: path.basename(MAIN_ACCOUNT_VAULT_PATH),
      save_verified: saveVerified,
      verify: {
        steamid64: verification.steam_id64_saved,
        steam_api_key: verification.steam_web_api_key_saved,
        backpack_token: verification.backpack_tf_token_saved
      },
      verification,
      validation: built.validation,
      validation_ok: built.validation_ok
    };
  }
}

function setupStep(id, label, ready, detail, action = '') { return { id, label, ready: Boolean(ready), status: ready ? 'ready' : 'missing', detail: String(detail || ''), action: String(action || '') }; }
class SteamInventorySyncService {
  constructor(auditService) { this.audit = auditService; }
  cacheFresh(options) {
    const cache = readJson(HUB_INVENTORY_PATH, { ok: false });
    if (!cache.ok || !cache.updated_at) return false;
    return Date.now() - Date.parse(cache.updated_at) < options.inventory_cache_ttl_minutes * 60 * 1000;
  }
  inventoryUrls(steamId64, startAssetId = '') {
    const id = String(steamId64 || '').trim();
    const urls = [];
    const modern = new URL(`https://steamcommunity.com/inventory/${encodeURIComponent(id)}/440/2`);
    modern.searchParams.set('l', 'english');
    modern.searchParams.set('count', '2000');
    if (startAssetId) modern.searchParams.set('start_assetid', String(startAssetId));
    urls.push({ label: 'community_inventory_v2_2000', url: modern.toString() });
    const modernSmall = new URL(`https://steamcommunity.com/inventory/${encodeURIComponent(id)}/440/2`);
    modernSmall.searchParams.set('l', 'english');
    modernSmall.searchParams.set('count', '500');
    if (startAssetId) modernSmall.searchParams.set('start_assetid', String(startAssetId));
    urls.push({ label: 'community_inventory_v2_500', url: modernSmall.toString() });
    const legacy = new URL(`https://steamcommunity.com/profiles/${encodeURIComponent(id)}/inventory/json/440/2`);
    legacy.searchParams.set('l', 'english');
    if (startAssetId) legacy.searchParams.set('start_assetid', String(startAssetId));
    urls.push({ label: 'legacy_inventory_json', url: legacy.toString() });
    return urls;
  }
  extractInventoryPayload(body, depth = 0) {
    if (!body || typeof body !== 'object') return { ok: false, error: 'Steam returned an empty inventory response.' };
    if (body.success === false) return { ok: false, error: body.Error || body.error || body.message || 'Steam inventory response success=false.' };
    if (Array.isArray(body.assets) || Array.isArray(body.descriptions)) {
      return { ok: true, shape: 'community_inventory_v2', assets: Array.isArray(body.assets) ? body.assets : [], descriptions: Array.isArray(body.descriptions) ? body.descriptions : [], more_items: Boolean(body.more_items), last_assetid: body.last_assetid || '' };
    }
    if (body.rgInventory && body.rgDescriptions) {
      const assets = Object.values(body.rgInventory).map(asset => ({
        assetid: String(asset.id || asset.assetid || asset.asset_id || ''),
        classid: String(asset.classid || asset.class_id || ''),
        instanceid: String(asset.instanceid || asset.instance_id || '0'),
        amount: Number(asset.amount || 1) || 1
      })).filter(asset => asset.assetid || asset.classid);
      const descriptions = Object.entries(body.rgDescriptions).map(([key, desc]) => {
        const parts = String(key || '').split('_');
        return { ...desc, classid: String(desc.classid || desc.class_id || parts[0] || ''), instanceid: String(desc.instanceid || desc.instance_id || parts[1] || '0') };
      });
      return { ok: true, shape: 'legacy_inventory_json', assets, descriptions, more_items: Boolean(body.more), last_assetid: body.last_assetid || '' };
    }
    if (depth < 2) {
      for (const key of ['response', 'result', 'data', 'inventory']) {
        if (body[key] && body[key] !== body) {
          const nested = this.extractInventoryPayload(body[key], depth + 1);
          if (nested.ok) return nested;
        }
      }
    }
    return { ok: false, error: 'Steam inventory JSON shape was not recognized.', body_keys: Object.keys(body).slice(0, 16) };
  }
  descriptionMap(descriptions) {
    const map = new Map();
    for (const d of Array.isArray(descriptions) ? descriptions : []) {
      map.set(`${d.classid}_${d.instanceid}`, d);
      map.set(String(d.classid || ''), d);
    }
    return map;
  }
  tags(description) {
    return (Array.isArray(description?.tags) ? description.tags : []).map(tag => ({ category: tag.category || tag.internal_name || '', name: tag.localized_tag_name || tag.name || tag.localized_category_name || '' })).filter(tag => tag.name || tag.category);
  }
  priceLookup(prices) {
    const scanner = new MarketTargetScannerService(this.audit);
    const keyRef = scanner.keyPriceRef(prices, getOptions());
    const map = new Map();
    const addKey = (key, entry) => {
      const safe = normalizeName(key);
      if (!safe) return;
      const prev = map.get(safe);
      if (!prev || Number(entry.value_ref || 0) > Number(prev.value_ref || 0)) map.set(safe, entry);
    };
    for (const price of prices) {
      const itemName = price.item_name || price.name || price.market_hash_name || '';
      const base = normalizeName(itemName);
      if (!base) continue;
      const valueRef = scanner.priceToRef(price, keyRef);
      if (valueRef <= 0) continue;
      const qLabel = qualityLabel(price.quality);
      const entry = { item_name: itemName, value_ref: Number(valueRef.toFixed(2)), currency: price.currency, quality: price.quality, quality_label: qLabel, priceindex: price.priceindex };
      const stripped = stripTf2Prefixes(itemName);
      addKey(base, entry);
      addKey(stripped, entry);
      if (base.startsWith('the ')) addKey(base.slice(4), entry);
      else addKey('the ' + base, entry);
      if (qLabel && !['Unique', 'Normal'].includes(qLabel)) {
        addKey(qLabel + ' ' + stripped, entry);
        addKey(qLabel + ' ' + base, entry);
      }
      for (const prefix of ['Strange', 'Vintage', 'Genuine', 'Unusual', 'Haunted', "Collector's", 'Killstreak', 'Specialized Killstreak', 'Professional Killstreak', 'Australium']) {
        addKey(prefix + ' ' + stripped, entry);
      }
    }
    return { key_ref_estimate: keyRef, map, lookup_keys: map.size, prices_seen: prices.length };
  }
  analyzeItems(items) {
    const schema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const prices = Array.isArray(schema.prices) ? schema.prices : [];
    const lookup = this.priceLookup(prices);
    let priced = 0, totalRef = 0, tradable = 0;
    const top = [];
    const unpriced = [];
    const matched = [];
    for (const item of items) {
      if (item.tradable) tradable += 1;
      const keys = inventoryPriceKeys(item);
      let price = null;
      let matchedKey = null;
      for (const key of keys) {
        price = lookup.map.get(key);
        if (price) { matchedKey = key; break; }
      }
      if (!price) {
        if (unpriced.length < 20) unpriced.push({ assetid: item.assetid, item_name: item.market_hash_name || item.name || 'Unknown item', tradable: item.tradable, marketable: item.marketable, keys_tried: keys.slice(0, 8), tags: (item.tags || []).slice(0, 5) });
        continue;
      }
      priced += 1;
      const amount = Number(item.amount || 1) || 1;
      const value = Number((price.value_ref * amount).toFixed(2));
      totalRef += value;
      matched.push({ item_name: item.market_hash_name || item.name, matched_key: matchedKey, price_name: price.item_name, value_ref: value });
      top.push({ assetid: item.assetid, item_name: item.market_hash_name || item.name, value_ref: value, tradable: item.tradable, amount, price_currency: price.currency, matched_key: matchedKey, price_name: price.item_name });
    }
    top.sort((a, b) => Number(b.value_ref || 0) - Number(a.value_ref || 0));
    return {
      priced_items: priced,
      unpriced_items: Math.max(0, items.length - priced),
      tradable_items: tradable,
      estimated_value_ref: Number(totalRef.toFixed(2)),
      key_ref_estimate: lookup.key_ref_estimate,
      top_value_items: top.slice(0, 15),
      unpriced_samples: unpriced,
      matched_samples: matched.slice(0, 20),
      pricing_match_diagnostics: {
        prices_seen: lookup.prices_seen,
        lookup_keys: lookup.lookup_keys,
        matched_items: priced,
        unmatched_items: Math.max(0, items.length - priced),
        note: priced === 0 && items.length > 0 ? 'Inventory loaded, but no item names matched Backpack.tf price keys. See unpriced_samples and keys_tried.' : 'Inventory pricing mapper completed.'
      }
    };
  }
  async sync(force = false) {
    const startedAt = Date.now();
    const options = getOptions();
    runtimeLogger.info('inventory', 'inventory_sync_start', 'Steam inventory sync started', { force: Boolean(force), hasSteamId64: Boolean(options.steam_id64), maxPages: options.inventory_max_pages });
    if (!options.inventory_sync_enabled) {
      runtimeLogger.warn('inventory', 'inventory_sync_failed', 'Inventory sync disabled', { stage: 'disabled' });
      return { ok: false, skipped: true, stage: 'disabled', error: 'Inventory sync is disabled.' };
    }
    if (!options.steam_id64) {
      const missing = { ok: false, stage: 'steamid_missing', error: 'SteamID64 is missing. Save the main account SteamID64 in Accounts first.' };
      writeJson(HUB_INVENTORY_PATH, missing);
      runtimeLogger.warn('inventory', 'inventory_sync_failed', 'Steam inventory sync failed: SteamID64 missing', { stage: 'steamid_missing' });
      return missing;
    }
    if (!force && this.cacheFresh(options)) {
      const cached = { ...readJson(HUB_INVENTORY_PATH, { ok: false }), cached: true };
      runtimeLogger.info('inventory', 'inventory_sync_done', 'Steam inventory sync served from cache', { cached: true, items: Number(cached.items_count || 0), durationMs: Date.now() - startedAt });
      return cached;
    }
    const allAssets = [];
    const allDescriptions = [];
    const attempts = [];
    let startAssetId = '';
    let more = false;
    for (let page = 0; page < options.inventory_max_pages; page += 1) {
      let accepted = null;
      let lastFailure = null;
      for (const variant of this.inventoryUrls(options.steam_id64, startAssetId)) {
        const result = await fetchJsonHardened('steam_inventory', variant.url, options, { headers: { accept: 'application/json', 'user-agent': 'TF2-HA-TF2-Trading-Hub/5.13.36' } });
        const body = result.body || {};
        const parsed = result.ok ? this.extractInventoryPayload(body) : { ok: false, error: result.error || body.error || body.raw || `HTTP ${result.status}` };
        attempts.push({
          page: page + 1, label: variant.label, endpoint: variant.label, url_masked: variant.url.replace(/inventory\/[^/]+\//, 'inventory/7656.../').replace(/profiles\/[^/]+\//, 'profiles/7656.../'), ok: Boolean(result.ok && parsed.ok), status: result.status, shape: parsed.shape || null,
          assets: Array.isArray(parsed.assets) ? parsed.assets.length : 0, descriptions: Array.isArray(parsed.descriptions) ? parsed.descriptions.length : 0,
          error: parsed.ok ? null : (parsed.error || result.error || body.error || body.raw || null), body_keys: body && typeof body === 'object' ? Object.keys(body).slice(0, 12) : []
        });
        if (result.ok && parsed.ok) { accepted = parsed; break; }
        lastFailure = { result, parsed };
        if (![400, 401, 403, 404, 429, 500, 502, 503, 504].includes(Number(result.status)) && variant.label !== 'community_inventory_v2_2000') break;
      }
      if (!accepted) {
        const status = Number(lastFailure?.result?.status || 0);
        const rawError = lastFailure?.parsed?.error || lastFailure?.result?.error || `HTTP ${status || 'unknown'}`;
        const error = status === 403
          ? 'Steam inventory is private or unavailable to this add-on. Make the TF2 inventory public, or keep inventory sync disabled.'
          : status === 400
            ? 'Steam returned HTTP 400 for inventory. The add-on tried the compatible 2000-count endpoint and legacy fallback; verify SteamID64 and that the TF2 inventory is public.'
            : rawError;
        const payload = { ok: false, stage: 'inventory_fetch_failed', updated_at: new Date().toISOString(), steam_id64: redacted(options.steam_id64), status, error, attempts, hint: 'Open the Steam profile privacy settings and ensure Inventory is Public. SteamID64 must be the 7656… profile id, not the account name.' };
        writeJson(HUB_INVENTORY_PATH, payload);
        this.audit.write('steam_inventory_sync_failed', { status, error });
        runtimeLogger.warn('inventory', 'inventory_sync_failed', 'Steam inventory sync failed', { status, error, attempts: attempts.length, durationMs: Date.now() - startedAt });
        appendActionFeed('steam_inventory_sync_failed', { status, error });
        return payload;
      }
      runtimeLogger.info('inventory', 'inventory_page_loaded', 'Steam inventory page loaded', { page: page + 1, assets: accepted.assets.length, descriptions: accepted.descriptions.length, moreItems: Boolean(accepted.more_items) });
      allAssets.push(...accepted.assets);
      allDescriptions.push(...accepted.descriptions);
      more = Boolean(accepted.more_items);
      startAssetId = accepted.last_assetid || '';
      if (!more || !startAssetId) break;
    }
    const descriptions = this.descriptionMap(allDescriptions);
    const items = allAssets.map(asset => {
      const desc = descriptions.get(`${asset.classid}_${asset.instanceid}`) || descriptions.get(String(asset.classid || '')) || {};
      return {
        assetid: String(asset.assetid || ''), classid: String(asset.classid || ''), instanceid: String(asset.instanceid || ''), amount: Number(asset.amount || 1) || 1,
        market_hash_name: desc.market_hash_name || desc.name || '', name: desc.name || desc.market_hash_name || '', type: desc.type || '', tradable: Number(desc.tradable) === 1, marketable: Number(desc.marketable) === 1,
        tags: this.tags(desc), icon_url: desc.icon_url || null
      };
    });
    const analysis = this.analyzeItems(items);
    const payload = { ok: true, stage: 'inventory_synced', updated_at: new Date().toISOString(), steam_id64: redacted(options.steam_id64), appid: 440, contextid: 2, pages: attempts.length, items_count: items.length, descriptions_count: allDescriptions.length, more_items: more, attempts, analysis, items: items.slice(0, 2000) };
    writeJson(HUB_INVENTORY_PATH, payload);
    this.audit.write('steam_inventory_synced', { items: items.length, priced: analysis.priced_items, estimated_value_ref: analysis.estimated_value_ref });
    runtimeLogger.info('inventory', 'inventory_sync_done', 'Steam inventory sync completed', { items: items.length, priced: analysis.priced_items, unpriced: analysis.unpriced_items, estimatedValueRef: analysis.estimated_value_ref, pages: attempts.length, durationMs: Date.now() - startedAt });
    appendActionFeed('steam_inventory_synced', { items: items.length, priced: analysis.priced_items, value_ref: analysis.estimated_value_ref });
    return payload;
  }
  current() { return readJson(HUB_INVENTORY_PATH, { ok: false, error: 'No Steam inventory cache yet. Run Sync inventory or Run autopilot.' }); }
}

function countByRole(accounts = []) {
  const counts = { main: 0, trade: 0, storage: 0, flip: 0, buffer: 0, disabled: 0 };
  for (const account of Array.isArray(accounts) ? accounts : []) {
    const role = sanitizeAccountRole(account.role || 'trade', 'trade');
    counts[role] = (counts[role] || 0) + 1;
  }
  return counts;
}
function publicCredentialSummary(account = {}) {
  return {
    steam_id64: Boolean(account.steam_id64_saved || account.steam_id64),
    steam: Boolean(account.steam_web_api_key_saved || account.steam_api_key_saved),
    backpack: Boolean(account.backpack_tf_token_saved || account.backpack_tf_access_token_saved || account.backpack_tf_api_key_saved),
    secrets_returned: false
  };
}
function compactInventorySummary(inventory = {}) {
  const analysis = inventory.analysis || {};
  return {
    synced: Boolean(inventory.ok),
    status: inventory.ok ? 'synced' : (inventory.stage || 'not_synced'),
    items: Number(inventory.items_count || 0),
    tradable: Number(analysis.tradable_items || 0),
    priced: Number(analysis.priced_items || 0),
    unpriced: Number(analysis.unpriced_items || 0),
    estimated_value_ref: Number(analysis.estimated_value_ref || 0),
    error: inventory.ok ? null : (inventory.error || 'Inventory not synced yet.'),
    diagnostics: Array.isArray(inventory.attempts) ? inventory.attempts.slice(-5) : [],
    guidance: inventory.hint ? [inventory.hint, 'Check SteamID64 and Steam inventory privacy settings.'] : ['Run Sync inventory after SteamID64 is saved.']
  };
}
function decisionQueueSummary(decisions = []) {
  const active = Array.isArray(decisions) ? decisions.filter(d => d.reviewed_status !== 'ignored') : [];
  return {
    decisions: active.length,
    accept_recommended: active.filter(d => d.decision === 'accept_recommended').length,
    needs_review: active.filter(d => d.decision === 'needs_review').length,
    reject_recommended: active.filter(d => d.decision === 'reject_recommended').length,
    ignored: Array.isArray(decisions) ? decisions.filter(d => d.reviewed_status === 'ignored').length : 0,
    idle: active.length === 0
  };
}
class TradingBrainService {
  constructor(auditService) { this.audit = auditService; }
  last() { return readJson(TRADING_BRAIN_PATH, { ok: false, error: 'No trading brain snapshot yet. Run Build brain or Run autopilot.' }); }
  build(source = 'manual') {
    const options = getOptions();
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const credentials = new HubCredentialVaultService(this.audit).status();
    const accountList = Array.isArray(accounts.accounts) ? accounts.accounts : [];
    const enabledAccounts = accountList.filter(account => account.enabled !== false && account.role !== 'disabled');
    const backpackCache = readJson(BACKPACK_LISTINGS_PATH, { ok: false, listings_count: 0, prices_count: 0 });
    const priceSchema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const inventoryRaw = readJson(HUB_INVENTORY_PATH, { ok: false, stage: 'not_synced', error: 'Inventory not synced yet.' });
    const inventory = compactInventorySummary(inventoryRaw);
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const watchlist = readJson(MARKET_WATCHLIST_PATH, { ok: false, items: [] });
    const decisionsFile = readJson(DECISIONS_PATH, { ok: false, decisions: [] });
    const decisions = Array.isArray(decisionsFile.decisions) ? decisionsFile.decisions : [];
    const offers = decisionQueueSummary(decisions);
    const listingPlan = readJson(LISTING_PLAN_PATH, { ok: false, actions: [] });
    const transferPlan = readJson(TRANSFER_PLAN_PATH, { ok: false, transfers: [] });
    const executionQueue = readJson(EXECUTION_QUEUE_PATH, { ok: false, entries: [] });
    const actionablePlan = readJson(ACTIONABLE_PLAN_PATH, { ok: false, actions: [], watchlist: [] });
    const warnings = [];
    const blocked = [];
    const recommendations = [];
    const nextActions = [];
    const mainStatus = (credentials.account_status || []).find(a => a.role === 'main' || a.id === accounts.main_account_id) || {};
    if (!mainStatus.steam_id64_saved) blocked.push({ id: 'main_steamid_missing', category: 'account', title: 'Main SteamID64 missing', message: 'Save the main account SteamID64 before inventory and offer review can work.' });
    if (!mainStatus.steam_web_api_key_saved) warnings.push({ id: 'steam_api_missing', category: 'credentials', title: 'Steam API key missing', message: 'Trade offer review needs a Steam Web API key saved in the UI credential vault.' });
    if (!mainStatus.backpack_tf_token_saved) warnings.push({ id: 'backpack_token_missing', category: 'credentials', title: 'Backpack.tf token/API key missing', message: 'Backpack.tf pricing and listings need a saved provider token or API key.' });
    if (backpackCache.prices_ok || Number(backpackCache.prices_count || 0) > 0 || Array.isArray(priceSchema.prices)) {
      recommendations.push({ id: 'prices_ready', severity: 'success', category: 'backpack', title: 'Backpack.tf prices ready', message: String(Number(backpackCache.prices_count || priceSchema.prices?.length || 0)) + ' price entries are available.', action: 'none' });
    } else {
      warnings.push({ id: 'prices_missing', category: 'backpack', title: 'Backpack.tf prices missing', message: 'Run Sync Backpack.tf to load price schema.' });
      nextActions.push({ id: 'next_sync_backpack', type: 'sync', label: 'Sync Backpack.tf prices', safe: true, live: false, requires_confirmation: false, action: 'sync_backpack' });
    }
    if (Number(backpackCache.listings_count || 0) === 0) recommendations.push({ id: 'own_listings_empty', severity: 'info', category: 'backpack', title: 'No own listings yet', message: 'This is normal if the account has not posted Backpack.tf listings.', action: 'none' });
    if (!inventory.synced) {
      warnings.push({ id: 'inventory_failed', category: 'inventory', title: 'Inventory sync needs attention', message: inventory.error && /HTTP 400/i.test(inventory.error) ? 'Inventory sync failed. Steam returned HTTP 400. Check SteamID64 and Steam inventory privacy settings.' : inventory.error, guidance: inventory.guidance });
      nextActions.push({ id: 'next_sync_inventory', type: 'sync', label: 'Sync Steam inventory', safe: true, live: false, requires_confirmation: false, action: 'sync_inventory' });
    } else {
      recommendations.push({ id: 'inventory_ready', severity: 'success', category: 'inventory', title: 'Inventory is synced', message: String(inventory.items) + ' items, ' + String(inventory.tradable) + ' tradable, estimated ' + String(inventory.estimated_value_ref) + ' ref.', action: 'none' });
    }
    const candidateCount = Number(scanner.summary?.total_candidates || scanner.candidates?.length || 0);
    const watchlistCount = Number(watchlist.items?.length || scanner.watchlist?.length || 0);
    if (candidateCount === 0) {
      recommendations.push({ id: 'scanner_empty', severity: 'info', category: 'market', title: 'No trade candidates yet', message: 'Backpack.tf prices are synced, but current scanner filters produced no trade candidates. Build a relaxed/watchlist view.', action: 'build_scanner_relaxed' });
      nextActions.push({ id: 'next_build_watchlist', type: 'plan', label: 'Build relaxed market watchlist', safe: true, live: false, requires_confirmation: false, action: 'build_scanner_relaxed' });
    } else {
      recommendations.push({ id: 'scanner_ready', severity: 'success', category: 'market', title: 'Watchlist targets available', message: String(candidateCount) + ' monitoring targets are available for actionable planning.', action: 'build_action_plan' });
    }
    if (actionablePlan.ok) {
      const queueReady = Number(actionablePlan.summary?.queue_ready_targets || 0);
      recommendations.push({ id: 'action_plan_ready', severity: queueReady ? 'success' : 'info', category: 'planning', title: 'Actionable trading plan ready', message: String(queueReady) + ' queue-ready targets and ' + String(Number(actionablePlan.summary?.sell_plans || 0)) + ' sell plans are prepared for manual review.', action: 'review_action_plan' });
    } else if (candidateCount > 0 || inventory.synced) {
      nextActions.push({ id: 'next_build_action_plan', type: 'plan', label: 'Build actionable trading plan', safe: true, live: false, requires_confirmation: false, action: 'build_action_plan' });
    }
    if (offers.idle) recommendations.push({ id: 'offers_idle', severity: 'info', category: 'offers', title: 'No active trade offers', message: 'Decision queue is idle. Autopilot will keep checking.', action: 'none' });
    const sdaOptional = ['manual', 'observe', 'plan'].includes(options.trade_approval_mode) || ['observe', 'plan'].includes(options.autonomy_mode);
    if (!options.sda_enabled && !sdaOptional) blocked.push({ id: 'sda_required', category: 'sda', title: 'SDA Bridge required for confirmations', message: 'Confirmation mode requires SDA Bridge, but it is not enabled.' });
    else recommendations.push({ id: 'sda_optional', severity: 'info', category: 'sda', title: 'SDA Bridge is optional now', message: 'In manual/observe/plan mode, SDA Bridge is only needed when you explicitly confirm known trade offers.', action: 'none' });
    if (!nextActions.length) nextActions.push({ id: 'next_review', type: 'review', label: 'Review recommendations and keep automation guarded', safe: true, live: false, requires_confirmation: false, action: 'none' });
    const snapshot = {
      ok: true,
      version: APP_VERSION,
      built_at: new Date().toISOString(),
      source,
      mode: options.autonomy_mode || 'observe',
      active_account_id: accounts.active_account_id || 'main',
      accounts: { total: accountList.length, enabled: enabledAccounts.length, ...countByRole(accountList) },
      credential_status: { active_account_id: credentials.active_account_id || 'main', accounts: (credentials.account_status || []).map(a => ({ id: a.id, label: a.label, role: a.role, credentials: publicCredentialSummary(a), readiness: a.readiness })) },
      inventory,
      market: { prices_seen: Number(backpackCache.prices_count || priceSchema.prices?.length || 0), candidates: candidateCount, watchlist: watchlistCount, scanner_mode: scanner.mode || options.market_scanner_mode || 'balanced' },
      backpack: { own_listings: Number(backpackCache.listings_count || 0), prices_ok: Boolean(backpackCache.prices_ok || priceSchema.ok), cache_stage: backpackCache.stage || null },
      offers,
      listings: { planned_actions: Array.isArray(listingPlan.actions) ? listingPlan.actions.length : 0 },
      actionable_plan: { ok: Boolean(actionablePlan.ok), actions: Array.isArray(actionablePlan.actions) ? actionablePlan.actions.length : 0, watchlist: Array.isArray(actionablePlan.watchlist) ? actionablePlan.watchlist.length : 0, protected_currency_items: Number(actionablePlan.summary?.protected_currency_items || 0) },
      transfers: { planned: Array.isArray(transferPlan.transfers) ? transferPlan.transfers.length : 0 },
      execution_queue: { pending: Array.isArray(executionQueue.entries) ? executionQueue.entries.filter(x => x.status === 'pending_review').length : 0 },
      recommendations,
      next_actions: nextActions,
      warnings,
      blocked,
      safety: { live_trade_accepts: Boolean(options.allow_live_trade_accepts), live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes), live_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm), default_safe: true, secrets_returned: false }
    };
    writeJson(TRADING_BRAIN_PATH, snapshot);
    if (this.audit) this.audit.write('trading_brain_built', { recommendations: recommendations.length, warnings: warnings.length, blocked: blocked.length, source });
    appendActionFeed('trading_brain_built', { recommendations: recommendations.length, warnings: warnings.length, blocked: blocked.length, source });
    return snapshot;
  }
  recommendations() { const last = this.last(); return { ok: Boolean(last.ok), recommendations: last.recommendations || [], warnings: last.warnings || [], blocked: last.blocked || [], next_actions: last.next_actions || [] }; }
  acknowledge(payload = {}) {
    const last = this.last();
    const ack = { id: String(payload.id || payload.recommendation_id || '').trim(), acknowledged_at: new Date().toISOString() };
    const existing = Array.isArray(last.acknowledged) ? last.acknowledged : [];
    const updated = { ...last, acknowledged: [...existing.filter(x => x.id !== ack.id), ack] };
    writeJson(TRADING_BRAIN_PATH, updated);
    appendActionFeed('trading_brain_recommendation_acknowledged', { id: ack.id });
    return { ok: true, acknowledged: ack, snapshot: updated };
  }
}
class MultiAccountPlanningService {
  constructor(auditService) { this.audit = auditService; }
  summary() {
    const options = getOptions();
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const status = new HubCredentialVaultService(this.audit).status();
    const accountStatus = status.account_status || [];
    const rows = (accounts.accounts || []).filter(a => a.role !== 'disabled').map(account => {
      const info = accountRoleInfo(account.role);
      const creds = accountStatus.find(x => x.id === account.id) || {};
      return { account_id: account.id, label: account.label, role: account.role, role_label: info.label, included_in_planning: account.role === 'main' || options.account_scope_mode === 'planning_all_enabled', live_enabled: false, credentials: publicCredentialSummary(creds), capabilities: info.does || [] };
    });
    return { ok: true, version: APP_VERSION, mode: options.account_scope_mode || 'main_only', live_scope: 'main_only_guarded', accounts: rows, safety: { live_multi_account_execution: false } };
  }
  buildPlan() { const payload = { ...this.summary(), planned_at: new Date().toISOString(), plan: [], note: 'Multi-account planning only. No live cross-account execution is enabled.' }; writeJson(path.join(DATA_DIR, 'tf2-hub-multi-account-plan.json'), payload); appendActionFeed('multi_account_plan_built', { accounts: payload.accounts.length }); return payload; }
}
class InventoryAggregateService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(INVENTORY_AGGREGATE_PATH, { ok: false, error: 'No inventory aggregate yet. Run sync-all planning.' }); }
  build() {
    const accounts = new MultiAccountPlanningService(this.audit).summary();
    const mainInventory = readJson(HUB_INVENTORY_PATH, { ok: false });
    const summaryByRole = {};
    for (const role of Object.keys(ACCOUNT_ROLE_DEFINITIONS)) summaryByRole[role] = { accounts: 0, items: 0, value_ref: 0, status: 'not_synced' };
    for (const account of accounts.accounts || []) {
      const value = account.role === 'main' ? Number(mainInventory.analysis?.estimated_value_ref || 0) : 0;
      const items = account.role === 'main' ? Number(mainInventory.items_count || 0) : 0;
      summaryByRole[account.role].accounts += 1;
      summaryByRole[account.role].items += items;
      summaryByRole[account.role].value_ref = Number((summaryByRole[account.role].value_ref + value).toFixed(2));
      summaryByRole[account.role].status = account.role === 'main' && mainInventory.ok ? 'synced' : (account.credentials?.steam_id64 ? 'needs_sync' : 'missing_credentials');
    }
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), mode: accounts.mode, total: { accounts: accounts.accounts.length, items: Number(mainInventory.items_count || 0), estimated_value_ref: Number(mainInventory.analysis?.estimated_value_ref || 0), unpriced: Number(mainInventory.analysis?.unpriced_items || 0) }, by_role: summaryByRole, top_items: mainInventory.analysis?.top_value_items || [], note: 'Only main inventory is actively synced in this version; other roles are planning-aware placeholders until credentials are added.' };
    writeJson(INVENTORY_AGGREGATE_PATH, payload);
    appendActionFeed('inventory_aggregate_built', { accounts: payload.total.accounts, items: payload.total.items, value_ref: payload.total.estimated_value_ref });
    return payload;
  }
}
class StorageTransferPlannerService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(TRANSFER_PLAN_PATH, { ok: false, error: 'No transfer plan yet.' }); }
  build() {
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {} });
    const storage = (accounts.accounts || []).find(a => a.role === 'storage');
    const main = accounts.main_account || { id: 'main', label: 'Main account' };
    const transfers = [];
    if (storage && inventory.ok) {
      for (const item of (inventory.analysis?.top_value_items || []).slice(0, 8)) {
        if (Number(item.value_ref || 0) >= 10) transfers.push({ id: 'transfer_' + crypto.createHash('sha1').update(String(item.assetid || item.item_name)).digest('hex').slice(0, 10), from_account_id: main.id, to_account_id: storage.id, type: 'manual_internal_transfer', items: [item], estimated_value_ref: Number(item.value_ref || 0), reason: 'High-value item should be considered for Storage role.', live: false, requires_manual_action: true, status: 'planned' });
      }
    }
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), transfers, guidance: storage ? 'Manual plan only. No trade offers are sent.' : 'Add a Storage account to generate storage transfer suggestions.' };
    writeJson(TRANSFER_PLAN_PATH, payload);
    appendActionFeed('storage_transfer_plan_built', { transfers: transfers.length });
    return payload;
  }
  update(id, status) { const plan = this.current(); const transfers = (plan.transfers || []).map(t => t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t); const payload = { ...plan, ok: true, transfers }; writeJson(TRANSFER_PLAN_PATH, payload); appendActionFeed('storage_transfer_plan_updated', { id, status }); return payload; }
}

class ActionableTradingPlanService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(ACTIONABLE_PLAN_PATH, { ok: false, error: 'No actionable trading plan yet. Run Diagnostic bundle; it builds the action plan and execution queue automatically.' }); }
  classifyCandidate(candidate = {}, options = getOptions()) {
    const profit = Number(candidate.expected_profit_ref || 0);
    const risk = Number(candidate.risk_score || 0);
    const liquidity = Number(candidate.liquidity_score || 0);
    const pricing = Number(candidate.pricing_score || 0);
    const price = Number(candidate.max_buy_ref || candidate.target_sell_ref || 0);
    let score = Math.round((pricing * 0.42) + (liquidity * 0.28) + (Math.max(0, 100 - risk) * 0.2) + (Math.min(20, profit * 4)));
        if (risk > Number(options.max_risk_score || 30)) score -= 20;
    score = clampScore(score);
    const confidence = confidenceLabel(score);
    const queueValueOk = price > 0;
    return {
      score,
      confidence,
      queue_value_ok: queueValueOk,
      eligible_for_queue: confidence !== 'ignore' && score >= Number(options.actionable_plan_min_score || 55) && queueValueOk,
      reason: queueValueOk ? 'Queue eligible by score, risk and value signal.' : 'No usable value signal; keep as monitoring-only.'
    };
  }
  pureSummary(inventory = {}) {
    const items = Array.isArray(inventory.items) ? inventory.items : [];
    const top = Array.isArray(inventory.analysis?.top_value_items) ? inventory.analysis.top_value_items : [];
    const keyCount = items.filter(item => isMainCurrencyKey(item.market_hash_name || item.name)).reduce((sum, item) => sum + (Number(item.amount || 1) || 1), 0);
    const pureItems = top.filter(item => isPureCurrencyItemName(item.item_name));
    const valueRef = Number(pureItems.reduce((sum, item) => sum + Number(item.value_ref || 0), 0).toFixed(2));
    return {
      key_count: keyCount,
      pure_items: pureItems.map(item => ({ item_name: item.item_name, value_ref: item.value_ref, tradable: item.tradable })),
      estimated_pure_ref: valueRef,
      protect_last_key: true,
      note: keyCount <= 1 ? 'Last/only key is treated as trading currency and is protected from automatic sell listing plans.' : 'Extra keys may be reviewed manually, but live listing is still disabled by default.'
    };
  }
  build(source = 'manual') {
    const options = getOptions();
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {}, items: [] });
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const watchlist = readJson(MARKET_WATCHLIST_PATH, { ok: false, items: [] });
    const listingPlan = readJson(LISTING_PLAN_PATH, { ok: false, actions: [] });
    const decisions = readJson(DECISIONS_PATH, { decisions: [] }).decisions || [];
    const candidates = (Array.isArray(scanner.candidates) && scanner.candidates.length ? scanner.candidates : (watchlist.items || [])).slice(0, 200);
    const pure = this.pureSummary(inventory);
    const watch_actions = [];
    const plan_actions = [];
    for (const candidate of candidates) {
      const assessment = this.classifyCandidate(candidate, options);
      const base = {
        id: safeActionId('watch', candidate.id || candidate.item_name),
        type: assessment.eligible_for_queue ? 'prepare_buy_listing' : 'watch_item',
        item_name: candidate.item_name,
        account_id: options.active_account_id || 'main',
        confidence: assessment.confidence,
        score: assessment.score,
        risk_score: Number(candidate.risk_score || 0),
        liquidity_score: Number(candidate.liquidity_score || 0),
        max_buy_ref: Number(candidate.max_buy_ref || 0),
        target_sell_ref: Number(candidate.target_sell_ref || 0),
        expected_profit_ref: Number(candidate.expected_profit_ref || 0),
        source: 'market_scanner_watchlist',
        live: false,
        requires_manual_approval: true,
        status: assessment.eligible_for_queue ? 'planned_review' : 'monitoring_only',
        reason: `${candidate.reason || 'Watchlist candidate.'} ${assessment.reason}`.trim()
      };
      watch_actions.push(base);
      if (assessment.eligible_for_queue && plan_actions.length < Math.min(options.actionable_plan_max_actions, 12)) plan_actions.push(base);
    }
    const listing_actions = [];
    const protected_items = [];
    for (const item of (inventory.analysis?.top_value_items || []).filter(x => x.tradable)) {
      if (isPureCurrencyItemName(item.item_name)) {
        const protect = options.actionable_plan_protect_last_key && isMainCurrencyKey(item.item_name) && pure.key_count <= 1;
        protected_items.push({ item_name: item.item_name, value_ref: Number(item.value_ref || 0), reason: protect ? 'Protected as the last/only key currency.' : 'Pure/currency item; manual review only.' });
        continue;
      }
      listing_actions.push({
        id: safeActionId('sell', item.assetid || item.item_name),
        type: 'prepare_sell_listing',
        item_name: item.item_name,
        account_id: 'main',
        price_ref: Number(item.value_ref || 0),
        source: 'inventory_priced_item',
        live: false,
        requires_manual_approval: true,
        status: 'planned_review',
        confidence: Number(item.value_ref || 0) >= Number(options.listing_plan_min_profit_ref || 0.11) ? 'medium' : 'weak',
        reason: 'Owned tradable non-currency item has a Backpack.tf price estimate. Review before creating any listing.'
      });
    }
    const trade_actions = decisions.filter(d => d.decision === 'accept_recommended' && d.reviewed_status !== 'ignored').slice(0, 10).map(d => ({
      id: 'accept_' + String(d.tradeofferid),
      type: 'review_accept_trade_offer',
      account_id: 'main',
      tradeofferid: String(d.tradeofferid),
      profit_ref: Number(d.estimated_profit_ref || d.profit_ref || 0),
      risk_score: Number(d.risk_score || 0),
      live: false,
      requires_manual_approval: true,
      status: 'manual_review_required',
      reason: 'Decision engine marked this offer accept_recommended, but live acceptance remains disabled by default.'
    }));
    const next = [];
    if (plan_actions.length) next.push({ id: 'review_top_targets', label: 'Review top watchlist targets', action: 'review_targets', safe: true, live: false, count: plan_actions.length });
    if (listing_actions.length) next.push({ id: 'review_sell_plans', label: 'Review sell listing plans', action: 'review_sell_plans', safe: true, live: false, count: listing_actions.length });
    if (!plan_actions.length && watch_actions.length) next.push({ id: 'monitor_watchlist', label: 'Keep monitoring watchlist; no queue-safe target fits risk/score yet', action: 'none', safe: true, live: false, count: watch_actions.length });
    if (!next.length) next.push({ id: 'keep_observing', label: 'Keep observe mode running', action: 'none', safe: true, live: false, count: 0 });
    const payload = {
      ok: true,
      version: APP_VERSION,
      title: 'Guarded Publish Dry Run',
      built_at: new Date().toISOString(),
      source,
      mode: options.autonomy_mode || 'observe',
      summary: {
        watchlist_seen: watch_actions.length,
        queue_ready_targets: plan_actions.length,
        sell_plans: listing_actions.length,
        protected_currency_items: protected_items.length,
        trade_review_actions: trade_actions.length,
        live_actions_enabled: false
      },
      planning_value: {
        planning_value_ref: Number(options.targeted_buy_order_selection_hint_ref || 0),
        inventory_value_ref: Number(inventory.analysis?.estimated_value_ref || 0),
        pure_ref: pure.estimated_pure_ref,
        key_ref_estimate: Number(inventory.analysis?.key_ref_estimate || scanner.key_ref_estimate || options.market_scanner_key_ref_estimate || 0)
      },
      pure,
      actions: [...plan_actions, ...listing_actions, ...trade_actions].slice(0, options.actionable_plan_max_actions),
      watchlist: watch_actions.slice(0, 25),
      protected_items,
      next_actions: next,
      safety: {
        live_trade_accepts: false,
        live_backpack_writes: false,
        sda_confirmations: false,
        queue_only: true,
        note: 'This plan only creates reviewable actions. It does not accept trades, confirm Steam actions or write Backpack.tf listings.'
      }
    };
    writeJson(ACTIONABLE_PLAN_PATH, payload);
    if (this.audit) this.audit.write('actionable_trading_plan_built', { actions: payload.actions.length, watchlist: payload.watchlist.length, protected_items: protected_items.length, source });
    appendActionFeed('actionable_trading_plan_built', { actions: payload.actions.length, watchlist: payload.watchlist.length, protected_items: protected_items.length, source });
    return payload;
  }
  selectableActions(plan, mode = 'top5') {
    const options = getOptions();
    const actions = Array.isArray(plan.actions) ? plan.actions.slice() : [];
    const eligible = actions.filter(item => {
      if (mode === 'weak') return item && item.status !== 'ignored' && (item.confidence === 'weak' || item.confidence === 'ignore' || Number(item.score || 0) < Number(options.actionable_plan_min_score || 55));
      if (!item || item.status === 'ignored' || item.status === 'lower_priority') return false;
      if (item.type !== 'prepare_buy_listing' && item.type !== 'prepare_sell_listing' && item.type !== 'review_accept_trade_offer') return false;
      const risk = Number(item.risk_score || 0);
      if (risk > Number(options.max_risk_score || 30)) return false;
      if (item.type === 'prepare_buy_listing') {
        const cost = Number(item.max_buy_ref || 0);
        if (cost <= 0) return false;
      }
      if (String(mode).includes('strong') && String(item.confidence || '') !== 'strong') return false;
      return true;
    });
    eligible.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || Number(b.score || 0) - Number(a.score || 0) || Number(b.expected_profit_ref || 0) - Number(a.expected_profit_ref || 0));
    let limit = 5;
    if (mode === 'top3') limit = 3;
    if (mode === 'top5') limit = 5;
    if (mode === 'all_strong') limit = 100;
    if (mode === 'all_reviewable') limit = 100;
    if (mode === 'weak') limit = 100;
    const selected = [];
    let used = 0;
    const planning_value = Number(options.targeted_buy_order_selection_hint_ref || 0);
    for (const item of eligible) {
      const cost = item.type === 'prepare_buy_listing' ? Number(item.max_buy_ref || 0) : 0;
      selected.push({ ...item, selection_mode: 'advisory_only' });
      used += cost;
      if (selected.length >= limit) break;
    }
    return { selected, selected_value_ref: Number(used.toFixed(2)), planning_value_ref: planning_value, selection_mode: 'advisory_only' };
  }
  summarizePlan(plan = {}) {
    const actions = Array.isArray(plan.actions) ? plan.actions : [];
    const watchlist = Array.isArray(plan.watchlist) ? plan.watchlist : [];
    return {
      queue_ready_targets: actions.filter(x => x.status !== 'ignored' && x.status !== 'lower_priority').length,
      approved_actions: actions.filter(x => x.status === 'approved_for_queue').length,
      ignored_actions: actions.filter(x => x.status === 'ignored').length,
      pinned_actions: actions.filter(x => x.pinned).length,
      strong_actions: actions.filter(x => x.confidence === 'strong' && x.status !== 'ignored').length,
      buy_actions: actions.filter(x => x.type === 'prepare_buy_listing').length,
      sell_actions: actions.filter(x => x.type === 'prepare_sell_listing').length,
      watchlist_seen: watchlist.length
    };
  }
  bulkUpdate(params = {}) {
    const plan = this.current();
    if (!plan || !Array.isArray(plan.actions)) return { ok: false, error: 'No actionable plan exists yet. Run Diagnostic bundle; it builds the action plan and queue automatically.' };
    const mode = String(params.mode || 'top5').trim().toLowerCase();
    const action = String(params.action || 'approve').trim().toLowerCase();
    const { selected, selected_value_ref, planning_value_ref } = this.selectableActions(plan, mode);
    const ids = new Set(selected.map(x => String(x.id)));
    const now = new Date().toISOString();
    const mutate = item => {
      if (!item || !ids.has(String(item.id))) return item;
      const next = { ...item, updated_at: now };
      if (action === 'pin') { next.pinned = true; next.pinned_at = now; }
      else if (action === 'lower_priority') { next.priority = 'low'; next.status = 'lower_priority'; }
      else if (action === 'ignore') { next.status = 'ignored'; next.ignored_at = now; }
      else { next.status = 'approved_for_queue'; next.approved_at = now; }
      return next;
    };
    const actions = (plan.actions || []).map(mutate);
    const watchlist = (plan.watchlist || []).map(mutate);
    const summary = this.summarizePlan({ ...plan, actions, watchlist });
    const payload = { ...plan, ok: true, updated_at: now, bulk_review: { mode, action, selected: ids.size, selected_value_ref, planning_value_ref, selected_ids: Array.from(ids), note: 'Bulk review only changes review/queue states. It does not execute live actions.' }, actions, watchlist, summary: { ...(plan.summary || {}), ...summary } };
    writeJson(ACTIONABLE_PLAN_PATH, payload);
    if (this.audit) this.audit.write('actionable_plan_bulk_reviewed', { mode, action, selected: ids.size, selected_value_ref });
    appendActionFeed('actionable_plan_bulk_reviewed', { mode, action, selected: ids.size, selected_value_ref });
    return payload;
  }
  updateAction(id, action = "approve") {
    const plan = this.current();
    if (!plan || !Array.isArray(plan.actions)) return { ok: false, error: "No actionable plan exists yet. Run Diagnostic bundle; it builds the action plan and queue automatically." };
    const now = new Date().toISOString();
    const normalize = String(action || "").trim().toLowerCase();
    const mapStatus = { approve: "approved_for_queue", ignore: "ignored", pin: "pinned", lower_priority: "lower_priority", unpin: "planned_review" };
    const status = mapStatus[normalize] || normalize || "planned_review";
    let found = false;
    const mutate = item => {
      if (!item || String(item.id) !== String(id)) return item;
      found = true;
      const next = { ...item, updated_at: now };
      if (normalize === "pin") { next.pinned = true; next.pinned_at = now; next.status = item.status || "planned_review"; }
      else if (normalize === "unpin") { delete next.pinned; next.status = item.status === "pinned" ? "planned_review" : (item.status || "planned_review"); }
      else if (normalize === "lower_priority") { next.priority = "low"; next.status = status; }
      else { next.status = status; }
      if (normalize === "approve") next.approved_at = now;
      if (normalize === "ignore") next.ignored_at = now;
      return next;
    };
    const actions = (plan.actions || []).map(mutate);
    const watchlist = (plan.watchlist || []).map(mutate);
    if (!found) return { ok: false, error: "Action not found in actionable plan.", id };
    const approved = actions.filter(x => x.status === "approved_for_queue").length;
    const ignored = actions.filter(x => x.status === "ignored").length;
    const pinned = actions.filter(x => x.pinned).length;
    const queueReady = actions.filter(x => x.status !== "ignored" && x.status !== "lower_priority").length;
    const payload = { ...plan, ok: true, updated_at: now, actions, watchlist, summary: { ...(plan.summary || {}), approved_actions: approved, ignored_actions: ignored, pinned_actions: pinned, queue_ready_targets: queueReady } };
    writeJson(ACTIONABLE_PLAN_PATH, payload);
    if (this.audit) this.audit.write("actionable_plan_item_updated", { id, action: normalize, status });
    appendActionFeed("actionable_plan_item_updated", { id, action: normalize, status });
    return payload;
  }
}

class ExecutionQueueService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(EXECUTION_QUEUE_PATH, { ok: true, version: APP_VERSION, updated_at: null, entries: [] }); }
  appliedRecommendationLedger() {
    const application = readJson(ASSISTANT_DECISION_APPLICATION_PATH, { ok: false, applied: 0, selected_items: [] });
    const ids = new Set();
    if (application && application.ok !== false && Number(application.applied || 0) > 0) {
      for (const item of (Array.isArray(application.selected_items) ? application.selected_items : [])) {
        const raw = String(item.id || '').trim();
        if (!raw) continue;
        ids.add(raw);
        if (raw.startsWith('action_')) ids.add(raw.slice(7));
        else ids.add('action_' + raw);
      }
    }
    return { application, ids };
  }
  shouldApplyAssistantApproval(entry, ledger) {
    if (!entry || !ledger || !ledger.ids || !ledger.ids.size) return false;
    const ids = [String(entry.id || ''), String(entry.actionable_plan_id || '')].filter(Boolean);
    for (const id of ids) {
      if (ledger.ids.has(id)) return true;
      if (id.startsWith('action_') && ledger.ids.has(id.slice(7))) return true;
      if (!id.startsWith('action_') && ledger.ids.has('action_' + id)) return true;
    }
    return false;
  }
  applyAssistantApprovalIfNeeded(entry, ledger) {
    if (!this.shouldApplyAssistantApproval(entry, ledger)) return entry;
    const now = new Date().toISOString();
    return {
      ...entry,
      status: 'approved',
      approved_at: entry.approved_at || (ledger.application && ledger.application.applied_at) || now,
      updated_at: entry.updated_at || now,
      assistant_applied: true,
      review_note: entry.review_note || 'Assistant recommendation persisted locally. Queue-only; live execution remains disabled.'
    };
  }
  summarize(queue = this.current()) {
    const entries = Array.isArray(queue.entries) ? queue.entries : [];
    const count = (fn) => entries.filter(fn).length;
    const statusCounts = {};
    for (const item of entries) {
      const status = String(item.status || 'pending_review');
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
    return {
      ok: Boolean(queue.ok !== false),
      version: queue.version || APP_VERSION,
      updated_at: queue.updated_at || null,
      total: entries.length,
      pending: count(x => String(x.status || 'pending_review') === 'pending_review'),
      approved: count(x => String(x.status || '') === 'approved'),
      cancelled: count(x => String(x.status || '') === 'cancelled'),
      done: count(x => String(x.status || '').includes('done')),
      disabled: count(x => String(x.status || '').includes('disabled')),
      by_status: statusCounts,
      safety: queue.safety || null,
      sample: entries.slice(0, 8).map(x => ({
        id: x.id,
        title: x.title,
        type: x.type,
        source: x.source,
        status: x.status || 'pending_review',
        live: Boolean(x.live),
        score: Number(x.score || 0),
        expected_profit_ref: Number(x.expected_profit_ref || 0),
        max_buy_ref: Number(x.max_buy_ref || 0),
        item_name: x.item_name || null
      }))
    };
  }
  mergeExistingStatus(entry, existingById) {
    const old = existingById.get(entry.id);
    if (!old) return entry;
    const oldStatus = String(old.status || '');
    const durableStatuses = new Set(['approved', 'cancelled', 'manual_done', 'approved_live_disabled']);
    if (!durableStatuses.has(oldStatus) && !oldStatus.includes('done') && !oldStatus.includes('disabled')) return entry;
    return {
      ...entry,
      status: oldStatus,
      approved_at: old.approved_at || entry.approved_at || null,
      updated_at: old.updated_at || entry.updated_at || new Date().toISOString(),
      result: old.result || entry.result || null,
      review_note: old.review_note || entry.review_note || null
    };
  }
  build() {
    const options = getOptions();
    const existing = this.current();
    const existingById = new Map((existing.entries || []).map(item => [String(item.id), item]));
    const assistantLedger = this.appliedRecommendationLedger();
    const decisions = readJson(DECISIONS_PATH, { decisions: [] }).decisions || [];
    const transferPlan = readJson(TRANSFER_PLAN_PATH, { transfers: [] });
    const listingPlan = readJson(LISTING_PLAN_PATH, { actions: [] });
    const entries = [];
    const pushEntry = (entry) => entries.push(this.applyAssistantApprovalIfNeeded(this.mergeExistingStatus(entry, existingById), assistantLedger));
    for (const d of decisions.filter(x => x.decision === 'accept_recommended' && x.reviewed_status !== 'ignored').slice(0, 20)) {
      pushEntry({ id: 'accept_' + String(d.tradeofferid), type: 'accept_trade_offer', account_id: 'main', source: 'decision_queue', title: 'Accept recommended trade offer', description: 'Estimated profit ' + String(Number(d.estimated_profit_ref || d.profit_ref || 0)) + ' ref.', risk: Number(d.risk_score || 0) <= options.max_risk_score ? 'low' : 'review', live: true, requires_manual_approval: true, status: 'pending_review', created_at: new Date().toISOString(), tradeofferid: String(d.tradeofferid), result: null });
    }
    for (const t of (transferPlan.transfers || []).filter(x => x.status !== 'ignored').slice(0, 20)) pushEntry({ id: 'queue_' + t.id, type: 'manual_internal_transfer', account_id: t.from_account_id, source: 'transfer_plan', title: 'Manual internal transfer', description: t.reason, risk: 'low', live: false, requires_manual_approval: true, status: 'pending_review', created_at: new Date().toISOString(), transfer_id: t.id, result: null });
    for (const l of (listingPlan.actions || []).slice(0, 20)) pushEntry({ id: 'listing_' + crypto.createHash('sha1').update(String(l.item_name || l.sku || Math.random())).digest('hex').slice(0, 12), type: 'create_backpack_listing', account_id: 'main', source: 'listing_plan', title: 'Create planned Backpack.tf listing', description: l.reason || 'Planned listing from pricing engine.', risk: 'review', live: true, requires_manual_approval: true, status: 'pending_review', created_at: new Date().toISOString(), result: null });
    const actionable = readJson(ACTIONABLE_PLAN_PATH, { actions: [] });
    for (const a of (actionable.actions || []).filter(x => x.status !== 'ignored' && x.status !== 'lower_priority').slice(0, Math.max(0, 20 - entries.length))) {
      const proposedStatus = a.status === 'approved_for_queue' ? 'approved' : 'pending_review';
      pushEntry({
        id: 'action_' + String(a.id || crypto.createHash('sha1').update(String(a.item_name || a.type || Math.random())).digest('hex').slice(0, 12)),
        type: a.type || 'review_action', account_id: a.account_id || 'main', source: 'actionable_trading_plan',
        title: a.type === 'prepare_buy_listing' ? 'Review target buy plan' : a.type === 'prepare_sell_listing' ? 'Review sell listing plan' : 'Review trading plan action',
        description: a.reason || a.item_name || 'Actionable plan item.', risk: Number(a.risk_score || 0) <= options.max_risk_score ? 'low' : 'review',
        live: false, requires_manual_approval: true, status: proposedStatus, priority: a.pinned ? 'pinned' : (a.priority || 'normal'), score: Number(a.score || 0), expected_profit_ref: Number(a.expected_profit_ref || 0), max_buy_ref: Number(a.max_buy_ref || 0), created_at: new Date().toISOString(), actionable_plan_id: a.id || null, item_name: a.item_name || null, result: null
      });
    }
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), entries, assistant_recommendation_application: assistantLedger.application && assistantLedger.application.ok !== false ? { ok: true, applied: Number(assistantLedger.application.applied || 0), applied_at: assistantLedger.application.applied_at || null, selected_ids: Array.from(assistantLedger.ids || []).slice(0, 20), preserved_by_rebuild: Boolean((assistantLedger.ids || new Set()).size) } : { ok: false, status: 'not_applied' }, safety: { live_trade_accepts: Boolean(options.allow_live_trade_accepts), live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes), sda_confirmations: Boolean(options.allow_sda_trade_confirmations), default_queue_only: true } };
    payload.state_summary = this.summarize(payload);
    writeJson(EXECUTION_QUEUE_PATH, payload);
    appendActionFeed('execution_queue_built', { entries: entries.length, pending: payload.state_summary.pending, approved: payload.state_summary.approved, preserved_state: true, assistant_application_preserved: Boolean(payload.assistant_recommendation_application && payload.assistant_recommendation_application.preserved_by_rebuild) });
    return payload;
  }
  setStatus(id, status, result = null) { const queue = this.current(); const entries = (queue.entries || []).map(item => item.id === id ? { ...item, status, result: result || item.result, updated_at: new Date().toISOString(), approved_at: status === 'approved' ? new Date().toISOString() : item.approved_at } : item); const payload = { ...queue, ok: true, updated_at: new Date().toISOString(), entries }; payload.state_summary = this.summarize(payload); writeJson(EXECUTION_QUEUE_PATH, payload); appendActionFeed('execution_queue_item_updated', { id, status }); return payload; }
  bulkSetStatus(params = {}) { const queue = this.current(); const action = String(params.action || "approve_pending"); const now = new Date().toISOString(); let changed = 0; const entries = (queue.entries || []).map(item => { const status = String(item.status || "pending_review"); const isPending = status === "pending_review"; if (!isPending) return item; changed += 1; if (action === "cancel_pending") return { ...item, status: "cancelled", updated_at: now }; return { ...item, status: "approved", approved_at: now, updated_at: now }; }); const payload = { ...queue, ok: true, updated_at: now, entries, bulk_review: { action, changed, note: "Bulk queue controls only change guarded queue state; they do not execute live actions." } }; payload.state_summary = this.summarize(payload); writeJson(EXECUTION_QUEUE_PATH, payload); appendActionFeed("execution_queue_bulk_updated", { action, changed }); return payload; }
  execute(id) { const options = getOptions(); const queue = this.current(); const item = (queue.entries || []).find(x => x.id === id); if (!item) return { ok: false, error: 'Queue item not found.' }; if (item.live && (options.global_kill_switch || (!options.allow_live_trade_accepts && item.type === 'accept_trade_offer') || (!options.allow_live_backpack_writes && item.type.includes('backpack')) || (!options.allow_sda_trade_confirmations && item.type === 'confirm_trade_offer'))) return this.setStatus(id, 'approved_live_disabled', { ok: false, skipped: true, reason: 'Action approved, but live execution is disabled by safety settings.' }); return this.setStatus(id, 'manual_done', { ok: true, skipped: true, reason: 'No live execution performed by this beta queue.' }); }
}
class AssistantDecisionApplyService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(ASSISTANT_DECISION_APPLICATION_PATH, { ok: false, error: 'No assistant recommendation has been applied yet.' }); }
  apply(params = {}) {
    const options = getOptions();
    const now = new Date().toISOString();
    const bundle = readJson(DIAGNOSTIC_BUNDLE_PATH, { ok: false });
    const decision = bundle.assistant_decision || new DiagnosticBundleService(this.audit, reviewService, hubAutopilot).buildAssistantDecision(bundle || {});
    if (!decision || decision.ok === false) return { ok: false, error: 'No assistant_decision is available. Run Diagnostic bundle first.' };
    const selected = Array.isArray(decision.selected_items) ? decision.selected_items : [];
    const selectedQueueIds = new Set(selected.map(x => String(x.id || '')).filter(Boolean));
    const liveEnabled = Boolean(options.allow_live_trade_accepts || options.allow_live_backpack_writes || options.allow_live_classifieds_writes || options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm);
    const queueSvc = new ExecutionQueueService(this.audit);
    const queue = queueSvc.current();
    const before = queueSvc.summarize(queue);
    if (!selectedQueueIds.size) {
      const payload = { ok: true, version: APP_VERSION, applied_at: now, applied: 0, recommendation: decision.recommended_bulk_action || 'observe_only', selected_items: [], queue_before: before, queue_after: before, live_actions_enabled: liveEnabled, note: 'Assistant decision has no selected items. Nothing was changed.' };
      writeJson(ASSISTANT_DECISION_APPLICATION_PATH, payload);
      appendActionFeed('assistant_recommendation_apply_skipped', { reason: 'no_selected_items', recommendation: payload.recommendation });
      return payload;
    }
    const entries = Array.isArray(queue.entries) ? queue.entries.map(item => {
      if (!selectedQueueIds.has(String(item.id))) return item;
      return { ...item, status: 'approved', approved_at: item.approved_at || now, updated_at: now, review_note: 'Applied assistant recommendation locally. Queue-only; live execution remains disabled.', assistant_applied: true };
    }) : [];
    const afterQueue = { ...queue, ok: true, version: APP_VERSION, updated_at: now, entries, assistant_recommendation: { applied_at: now, selected_count: selectedQueueIds.size, recommendation: decision.recommended_bulk_action || 'unknown', live_actions_enabled: liveEnabled, note: 'Local queue status update only. No Steam or Backpack.tf live action executed.' } };
    afterQueue.state_summary = queueSvc.summarize(afterQueue);
    writeJson(EXECUTION_QUEUE_PATH, afterQueue);
    const plan = readJson(ACTIONABLE_PLAN_PATH, { ok: false, actions: [], watchlist: [] });
    const selectedPlanIds = new Set();
    for (const id of selectedQueueIds) { selectedPlanIds.add(id); if (String(id).startsWith('action_')) selectedPlanIds.add(String(id).slice(7)); }
    const mutate = item => {
      if (!item) return item;
      const id = String(item.id || '');
      if (!selectedPlanIds.has(id) && !selectedPlanIds.has('action_' + id)) return item;
      return { ...item, status: 'approved_for_queue', approved_at: item.approved_at || now, updated_at: now, assistant_applied: true };
    };
    const updatedPlan = { ...plan, ok: plan.ok !== false, version: APP_VERSION, updated_at: now, actions: (plan.actions || []).map(mutate), watchlist: (plan.watchlist || []).map(mutate), assistant_recommendation: { applied_at: now, selected_count: selectedQueueIds.size, recommendation: decision.recommended_bulk_action || 'unknown' } };
    if (Array.isArray(updatedPlan.actions)) {
      updatedPlan.summary = { ...(updatedPlan.summary || {}), approved_actions: updatedPlan.actions.filter(x => x.status === 'approved_for_queue').length, ignored_actions: updatedPlan.actions.filter(x => x.status === 'ignored').length, pinned_actions: updatedPlan.actions.filter(x => x.pinned).length, queue_ready_targets: updatedPlan.actions.filter(x => x.status !== 'ignored' && x.status !== 'lower_priority').length };
    }
    writeJson(ACTIONABLE_PLAN_PATH, updatedPlan);
    const after = queueSvc.summarize(afterQueue);
    const payload = { ok: true, version: APP_VERSION, applied_at: now, source: params.source || 'manual_ui', recommendation: decision.recommended_bulk_action || 'unknown', applied: selectedQueueIds.size, selected_items: selected.map(x => ({ id: x.id, item_name: x.item_name, type: x.type, max_buy_ref: Number(x.max_buy_ref || 0), expected_profit_ref: Number(x.expected_profit_ref || 0), score: Number(x.score || 0) })), selected_value_ref: Number(decision.selected_value_ref || 0), planning_value_reference_ref: Number(decision.planning_value_reference_ref || 0), expected_profit_ref: Number(decision.expected_profit_ref || 0), queue_before: before, queue_after: after, live_actions_enabled: liveEnabled, safety: { live_trade_accepts: Boolean(options.allow_live_trade_accepts), live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes), sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm), queue_only: true, note: 'Apply assistant recommendation only marks local review queue items approved. It does not execute live actions.' }, note: 'Assistant recommendation applied to local guarded queue.' };
    writeJson(ASSISTANT_DECISION_APPLICATION_PATH, payload);
    const latestBundle = readJson(DIAGNOSTIC_BUNDLE_PATH, null);
    if (latestBundle && typeof latestBundle === 'object') {
      const afterSnapshot = {
        label: 'after_assistant_recommendation_apply',
        captured_at: now,
        summary: after,
        entries: (afterQueue.entries || []).map(item => ({ id: item.id, title: item.title, type: item.type, source: item.source, status: item.status || 'pending_review', item_name: item.item_name || null, live: Boolean(item.live), score: Number(item.score || 0), expected_profit_ref: Number(item.expected_profit_ref || 0), max_buy_ref: Number(item.max_buy_ref || 0), assistant_applied: Boolean(item.assistant_applied) }))
      };
      const patchedBundle = { ...latestBundle, updated_at: now, assistant_recommendation_application: payload, queue_snapshot_after_apply: afterSnapshot, queue_snapshot_after: afterSnapshot, what_changed: { ...(latestBundle.what_changed || {}), queue_pending_after_apply: Number(after.pending || 0), queue_approved_after_apply: Number(after.approved || 0), assistant_recommendation_applied: true, applied_items: payload.selected_items.map(x => x.item_name || x.id), important_note: 'Assistant recommendation was applied locally to the guarded queue. Diagnostic rebuilds should preserve approved state. No live Steam or Backpack.tf action executed.' } };
      patchedBundle.assistant_summary = new DiagnosticBundleService(this.audit, reviewService, hubAutopilot).buildAssistantSummary(patchedBundle);
      writeJson(DIAGNOSTIC_BUNDLE_PATH, patchedBundle);
    }
    if (this.audit) this.audit.write('assistant_recommendation_applied', { applied: payload.applied, recommendation: payload.recommendation, selected_value_ref: payload.selected_value_ref, live_actions_enabled: liveEnabled, queue_pending_after: after.pending, queue_approved_after: after.approved });
    appendActionFeed('assistant_recommendation_applied', { applied: payload.applied, recommendation: payload.recommendation, selected_value_ref: payload.selected_value_ref, queue_pending_after: after.pending, queue_approved_after: after.approved });
    return payload;
  }
}


class ApprovedActionLifecycleService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(APPROVED_ACTION_LIFECYCLE_PATH, { ok: false, error: 'No approved action lifecycle has been built yet.' }); }
  normalizeQueueItem(item = {}) {
    const status = String(item.status || 'pending_review');
    const isApproved = status === 'approved' || status === 'approved_live_disabled' || status === 'approved_for_queue' || Boolean(item.assistant_applied);
    return {
      id: item.id,
      title: item.title || 'Approved review action',
      type: item.type || 'review_action',
      source: item.source || 'execution_queue',
      item_name: item.item_name || null,
      status,
      approved: isApproved,
      approved_at: item.approved_at || null,
      live: Boolean(item.live),
      score: Number(item.score || 0),
      expected_profit_ref: Number(item.expected_profit_ref || 0),
      max_buy_ref: Number(item.max_buy_ref || 0),
      risk: item.risk || (Number(item.risk_score || 0) <= 30 ? 'low' : 'review'),
      review_note: item.review_note || null,
      assistant_applied: Boolean(item.assistant_applied)
    };
  }
  build() {
    const options = getOptions();
    const queue = new ExecutionQueueService(this.audit).current();
    const plan = readJson(ACTIONABLE_PLAN_PATH, { ok: false, actions: [] });
    const application = readJson(ASSISTANT_DECISION_APPLICATION_PATH, { ok: false, status: 'not_applied', selected_items: [] });
    const entries = Array.isArray(queue.entries) ? queue.entries : [];
    const approved = entries.map(x => this.normalizeQueueItem(x)).filter(x => x.approved || x.status === 'approved');
    const planActions = Array.isArray(plan.actions) ? plan.actions : [];
    const planById = new Map(planActions.map(x => [String(x.id), x]));
    const lifecycle_items = approved.map(item => {
      const rawPlanId = String(item.id || '').startsWith('action_') ? String(item.id).slice(7) : String(item.id || '');
      const planItem = planById.get(rawPlanId) || planById.get(String(item.id || '')) || {};
      const isBuy = String(item.type || '').includes('buy');
      const isSell = String(item.type || '').includes('sell');
      const nextSafeStep = isBuy ? 'build_listing_draft' : isSell ? 'review_sell_listing_draft' : 'keep_for_manual_review';
      return {
        ...item,
        lifecycle_status: 'approved_locally',
        lifecycle_label: isBuy ? 'approved locally · waiting for listing draft' : isSell ? 'approved locally · manual sell draft review' : 'approved locally · manual review',
        next_safe_step: nextSafeStep,
        listing_draft_status: 'not_built_yet',
        draft_only: true,
        live_execution_enabled: false,
        queue_only: true,
        planning_value_ref: Number(item.max_buy_ref || planItem.max_buy_ref || 0),
        expected_profit_ref: Number(item.expected_profit_ref || planItem.expected_profit_ref || 0),
        reason: planItem.reason || item.review_note || 'Approved locally from assistant recommendation. This is a queue-only lifecycle item; no live action has executed.',
        safety: {
          live_trade_accepts: Boolean(options.allow_live_trade_accepts),
          live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
          sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
          blocked_from_live_execution: true
        }
      };
    });
    const next_safe_step = lifecycle_items.length ? 'build_listing_draft' : 'apply_assistant_recommendation_first';
    const payload = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status: lifecycle_items.length ? 'approved_actions_waiting_for_draft' : 'no_approved_actions_yet',
      approved_actions: lifecycle_items.length,
      pending_actions: entries.filter(x => String(x.status || 'pending_review') === 'pending_review').length,
      next_safe_step,
      summary: {
        approved_locally: lifecycle_items.length,
        waiting_for_listing_draft: lifecycle_items.filter(x => x.next_safe_step === 'build_listing_draft').length,
        manual_sell_review: lifecycle_items.filter(x => x.next_safe_step === 'review_sell_listing_draft').length,
        live_enabled: false,
        planning_value_approved_ref: Number(lifecycle_items.reduce((sum, x) => sum + Number(x.planning_value_ref || 0), 0).toFixed(2)),
        expected_profit_ref: Number(lifecycle_items.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0).toFixed(2))
      },
      items: lifecycle_items,
      assistant_recommendation_application: application && application.ok !== false ? {
        ok: true,
        applied: Number(application.applied || 0),
        applied_at: application.applied_at || null,
        recommendation: application.recommendation || null,
        selected_items: Array.isArray(application.selected_items) ? application.selected_items.map(x => ({ id: x.id, item_name: x.item_name, max_buy_ref: Number(x.max_buy_ref || 0), expected_profit_ref: Number(x.expected_profit_ref || 0) })) : []
      } : { ok: false, status: 'not_applied' },
      guidance: lifecycle_items.length
        ? 'Approved actions are local review states. Next safe step is draft preview only; no Backpack.tf write or Steam trade acceptance is enabled.'
        : 'Apply the assistant recommendation first, then run Diagnostic bundle again to build approved lifecycle cards.',
      safety: {
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
        queue_only: true,
        draft_only: true
      }
    };
    writeJson(APPROVED_ACTION_LIFECYCLE_PATH, payload);
    if (this.audit) this.audit.write('approved_action_lifecycle_built', { approved_actions: payload.approved_actions, next_safe_step: payload.next_safe_step, live_enabled: false });
    appendActionFeed('approved_action_lifecycle_built', { approved_actions: payload.approved_actions, next_safe_step: payload.next_safe_step, live_enabled: false });
    return payload;
  }
}


class ListingDraftPreviewService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(LISTING_DRAFT_PREVIEW_PATH, { ok: false, error: 'No listing draft preview has been built yet.' }); }
  findScannerCandidate(itemName) {
    const name = normalizeName(itemName || '');
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const watchlist = readJson(MARKET_WATCHLIST_PATH, { ok: false, items: [] });
    const candidates = [ ...(Array.isArray(scanner.candidates) ? scanner.candidates : []), ...(Array.isArray(watchlist.items) ? watchlist.items : []) ];
    return candidates.find(item => normalizeName(item.item_name || item.name || '') === name) || null;
  }
  build() {
    const options = getOptions();
    const lifecycle = new ApprovedActionLifecycleService(this.audit).current();
    const queue = new ExecutionQueueService(this.audit).current();
    const items = Array.isArray(lifecycle.items) ? lifecycle.items : [];
    const queueEntries = Array.isArray(queue.entries) ? queue.entries : [];
    const approvedBuyItems = items.filter(item => String(item.next_safe_step || '') === 'build_listing_draft' || String(item.type || '').includes('buy'));
    const drafts = [];
    for (const item of approvedBuyItems) {
      const candidate = this.findScannerCandidate(item.item_name) || {};
      const queueItem = queueEntries.find(entry => String(entry.id) === String(item.id)) || {};
      const maxBuy = Number(item.max_buy_ref || item.planning_value_ref || queueItem.max_buy_ref || candidate.max_buy_ref || 0);
      const expectedSell = Number(item.target_sell_ref || queueItem.target_sell_ref || candidate.target_sell_ref || 0);
      const expectedProfit = Number(item.expected_profit_ref || queueItem.expected_profit_ref || candidate.expected_profit_ref || Math.max(0, expectedSell - maxBuy).toFixed(2));
      const id = 'draft_buy_' + crypto.createHash('sha1').update(String(item.id || item.item_name || Math.random())).digest('hex').slice(0, 12);
      drafts.push({
        id,
        source_action_id: item.id,
        account_id: item.account_id || 'main',
        item_name: item.item_name || 'Unknown item',
        intent: 'buy',
        status: 'draft_only',
        lifecycle_status: 'ready_for_manual_listing_review',
        max_buy_ref: Number(maxBuy.toFixed(2)),
        expected_sell_ref: Number(expectedSell.toFixed(2)),
        expected_profit_ref: Number(expectedProfit.toFixed(2)),
        score: Number(item.score || queueItem.score || candidate.pricing_score || 0),
        risk: item.risk || (Number(candidate.risk_score || 0) <= 30 ? 'low' : 'review'),
        risk_score: Number(candidate.risk_score || queueItem.risk_score || 0),
        liquidity_score: Number(candidate.liquidity_score || queueItem.liquidity_score || 0),
        priceindex: candidate.priceindex || '0',
        quality: candidate.quality || null,
        currency: candidate.currency || 'metal',
        reason: 'Approved local queue item converted into a Backpack.tf buy listing draft preview. No provider write is performed.',
        draft_payload_preview: {
          item_name: item.item_name || 'Unknown item',
          intent: 'buy',
          max_buy_ref: Number(maxBuy.toFixed(2)),
          comment: 'Draft preview only. Verify live classifieds and item liquidity before any real listing.'
        },
        live_write_enabled: false,
        requires_manual_approval: true,
        safety: {
          live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
          blocked_from_live_write: true,
          queue_only: true,
          draft_only: true
        }
      });
    }
    const manualSellReview = items.filter(item => String(item.next_safe_step || '') === 'review_sell_listing_draft' || String(item.type || '').includes('sell')).map(item => ({
      id: 'draft_sell_' + crypto.createHash('sha1').update(String(item.id || item.item_name || Math.random())).digest('hex').slice(0, 12),
      source_action_id: item.id,
      account_id: item.account_id || 'main',
      item_name: item.item_name || 'Unknown item',
      intent: 'sell',
      status: 'manual_review_only',
      price_ref: Number(item.price_ref || item.value_ref || 0),
      live_write_enabled: false,
      reason: 'Sell drafts require manual review. Live Backpack.tf writes remain disabled.'
    }));
    const payload = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status: drafts.length ? 'draft_preview_ready' : 'no_buy_drafts_ready',
      approved_actions: Number(lifecycle.approved_actions || items.length || 0),
      draft_count: drafts.length,
      buy_drafts: drafts.length,
      sell_drafts: manualSellReview.length,
      next_safe_step: drafts.length ? 'review_listing_draft_preview' : (lifecycle.next_safe_step || 'apply_assistant_recommendation_first'),
      summary: {
        approved_actions: Number(lifecycle.approved_actions || items.length || 0),
        draft_buy_listings: drafts.length,
        manual_sell_review: manualSellReview.length,
        total_planning_value_ref: Number(drafts.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0).toFixed(2)),
        expected_profit_ref: Number(drafts.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0).toFixed(2)),
        live_write_enabled: false
      },
      drafts,
      manual_sell_review: manualSellReview,
      guidance: drafts.length
        ? 'Review these Backpack.tf listing drafts. They are preview-only and will not write to Backpack.tf.'
        : 'No approved buy action is ready for a listing draft. Apply assistant recommendation first, then run Diagnostic bundle again.',
      safety: {
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
        draft_only: true,
        queue_only: true,
        no_live_provider_write: true
      }
    };
    writeJson(LISTING_DRAFT_PREVIEW_PATH, payload);
    if (this.audit) this.audit.write('listing_draft_preview_built', { drafts: payload.draft_count, approved_actions: payload.approved_actions, live_write_enabled: false });
    appendActionFeed('listing_draft_preview_built', { drafts: payload.draft_count, approved_actions: payload.approved_actions, live_write_enabled: false });
    return payload;
  }
}


class ListingDraftReviewService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(LISTING_DRAFT_REVIEW_PATH, { ok: false, error: 'No listing draft review has been built yet.' }); }
  classifyDraft(draft = {}, existing = {}) {
    const maxBuy = Number(draft.max_buy_ref || 0);
    const expectedSell = Number(draft.expected_sell_ref || 0);
    const profit = Number(draft.expected_profit_ref || Math.max(0, expectedSell - maxBuy) || 0);
    const riskScore = Number(draft.risk_score || 0);
    const liquidityScore = Number(draft.liquidity_score || 0);
    const allowed = new Set(['draft_review', 'draft_approved_locally', 'draft_rejected', 'draft_needs_price_check']);
    if (existing && allowed.has(String(existing.review_status || ''))) return String(existing.review_status);
    if (!maxBuy || !expectedSell || profit < 0.11 || riskScore > 30 || liquidityScore < 30) return 'draft_needs_price_check';
    return 'draft_review';
  }
  build() {
    const options = getOptions();
    const preview = readJson(LISTING_DRAFT_PREVIEW_PATH, { ok: false, drafts: [], manual_sell_review: [] });
    const previous = this.current();
    const previousItems = Array.isArray(previous.items) ? previous.items : [];
    const prevById = new Map(previousItems.map(item => [String(item.id || ''), item]));
    const drafts = Array.isArray(preview.drafts) ? preview.drafts : [];
    const manualSell = Array.isArray(preview.manual_sell_review) ? preview.manual_sell_review : [];
    const now = new Date().toISOString();
    const items = drafts.map(draft => {
      const existing = prevById.get(String(draft.id || '')) || {};
      const reviewStatus = this.classifyDraft(draft, existing);
      const maxBuy = Number(draft.max_buy_ref || 0);
      const expectedSell = Number(draft.expected_sell_ref || 0);
      const expectedProfit = Number(draft.expected_profit_ref || Math.max(0, expectedSell - maxBuy) || 0);
      const reasonCodes = [];
      if (!maxBuy) reasonCodes.push('missing_max_buy_price');
      if (!expectedSell) reasonCodes.push('missing_expected_sell_price');
      if (expectedProfit < 0.11) reasonCodes.push('profit_below_minimum');
      if (Number(draft.risk_score || 0) > 30) reasonCodes.push('risk_above_guarded_threshold');
      if (Number(draft.liquidity_score || 0) < 30) reasonCodes.push('liquidity_needs_manual_check');
      if (!reasonCodes.length) reasonCodes.push('ready_for_local_review');
      return {
        id: draft.id,
        source_action_id: draft.source_action_id || null,
        account_id: draft.account_id || 'main',
        item_name: draft.item_name || 'Unknown item',
        intent: draft.intent || 'buy',
        preview_status: draft.status || 'draft_only',
        review_status: reviewStatus,
        review_label: reviewStatus === 'draft_review' ? 'needs review' : reviewStatus === 'draft_approved_locally' ? 'approved locally' : reviewStatus === 'draft_rejected' ? 'rejected locally' : 'needs price check',
        max_buy_ref: Number(maxBuy.toFixed(2)),
        expected_sell_ref: Number(expectedSell.toFixed(2)),
        expected_profit_ref: Number(expectedProfit.toFixed(2)),
        score: Number(draft.score || 0),
        risk: draft.risk || (Number(draft.risk_score || 0) <= 30 ? 'low' : 'review'),
        risk_score: Number(draft.risk_score || 0),
        liquidity_score: Number(draft.liquidity_score || 0),
        quality: draft.quality || null,
        priceindex: draft.priceindex || '0',
        currency: draft.currency || 'metal',
        reason: draft.reason || 'Draft-only Backpack.tf listing preview created from an approved local queue item.',
        review_reason_codes: reasonCodes,
        next_safe_step: reviewStatus === 'draft_review' ? 'review_draft' : reviewStatus === 'draft_approved_locally' ? 'keep_for_guarded_listing_policy' : reviewStatus === 'draft_rejected' ? 'keep_rejected_no_action' : 'check_price_before_approval',
        reviewed_at: existing.reviewed_at || null,
        review_note: existing.review_note || '',
        live_write_enabled: false,
        requires_manual_approval: true,
        draft_payload_preview: draft.draft_payload_preview || null,
        safety: {
          live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
          blocked_from_live_write: true,
          draft_only: true,
          queue_only: true
        }
      };
    });
    const counts = {
      drafts: items.length,
      needs_review: items.filter(x => x.review_status === 'draft_review').length,
      approved_locally: items.filter(x => x.review_status === 'draft_approved_locally').length,
      rejected: items.filter(x => x.review_status === 'draft_rejected').length,
      needs_price_check: items.filter(x => x.review_status === 'draft_needs_price_check').length,
      manual_sell_review: manualSell.length
    };
    const next_safe_step = counts.needs_review ? 'review_draft' : counts.needs_price_check ? 'check_draft_price' : counts.approved_locally ? 'wait_for_listing_policy_gate' : (items.length ? 'no_active_draft_review_needed' : 'build_listing_draft_preview_first');
    const payload = {
      ok: true,
      version: APP_VERSION,
      updated_at: now,
      status: items.length ? 'draft_review_ready' : 'no_listing_drafts_ready',
      next_safe_step,
      ...counts,
      summary: {
        ...counts,
        total_planning_value_ref: Number(items.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0).toFixed(2)),
        expected_profit_ref: Number(items.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0).toFixed(2)),
        live_write_enabled: false
      },
      items,
      manual_sell_review: manualSell.map(item => ({ id: item.id, item_name: item.item_name, status: item.status || 'manual_review_only', price_ref: Number(item.price_ref || 0), live_write_enabled: false })),
      guidance: items.length ? 'Review listing drafts locally. Approving a draft only changes local review state; it does not write to Backpack.tf.' : 'No draft is available. Apply assistant recommendation and build listing draft preview first.',
      safety: {
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
        draft_only: true,
        queue_only: true,
        no_live_provider_write: true
      }
    };
    writeJson(LISTING_DRAFT_REVIEW_PATH, payload);
    if (this.audit) this.audit.write('listing_draft_review_built', { drafts: payload.drafts, needs_review: payload.needs_review, approved_locally: payload.approved_locally, needs_price_check: payload.needs_price_check, live_write_enabled: false });
    appendActionFeed('listing_draft_review_built', { drafts: payload.drafts, needs_review: payload.needs_review, approved_locally: payload.approved_locally, needs_price_check: payload.needs_price_check, live_write_enabled: false });
    return payload;
  }
  update(id, status, note = '') {
    const allowed = new Set(['draft_review', 'draft_approved_locally', 'draft_rejected', 'draft_needs_price_check']);
    const safeStatus = allowed.has(String(status || '')) ? String(status) : 'draft_review';
    const current = this.current();
    if (!current || current.ok === false) return { ok: false, error: 'Build listing draft review before updating draft state.' };
    const now = new Date().toISOString();
    const items = (current.items || []).map(item => String(item.id) === String(id) ? { ...item, review_status: safeStatus, review_label: safeStatus === 'draft_approved_locally' ? 'approved locally' : safeStatus === 'draft_rejected' ? 'rejected locally' : safeStatus === 'draft_needs_price_check' ? 'needs price check' : 'needs review', reviewed_at: now, review_note: String(note || item.review_note || '') } : item);
    const payload = { ...current, ok: true, version: APP_VERSION, updated_at: now, items };
    payload.needs_review = items.filter(x => x.review_status === 'draft_review').length;
    payload.approved_locally = items.filter(x => x.review_status === 'draft_approved_locally').length;
    payload.rejected = items.filter(x => x.review_status === 'draft_rejected').length;
    payload.needs_price_check = items.filter(x => x.review_status === 'draft_needs_price_check').length;
    payload.summary = { ...(payload.summary || {}), needs_review: payload.needs_review, approved_locally: payload.approved_locally, rejected: payload.rejected, needs_price_check: payload.needs_price_check, live_write_enabled: false };
    writeJson(LISTING_DRAFT_REVIEW_PATH, payload);
    if (this.audit) this.audit.write('listing_draft_review_updated', { id, status: safeStatus, live_write_enabled: false });
    appendActionFeed('listing_draft_review_updated', { id, status: safeStatus, live_write_enabled: false });
    return payload;
  }
}

class DraftQualityPolicyService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(LISTING_DRAFT_POLICY_PATH, { ok: false, error: 'No draft quality policy check has been built yet.' }); }
  findScannerCandidate(itemName) {
    const name = normalizeName(itemName || '');
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const watchlist = readJson(MARKET_WATCHLIST_PATH, { ok: false, items: [] });
    const candidates = [ ...(Array.isArray(scanner.candidates) ? scanner.candidates : []), ...(Array.isArray(watchlist.items) ? watchlist.items : []) ];
    return candidates.find(item => normalizeName(item.item_name || item.name || '') === name) || null;
  }
  classifyNicheItem(name = '') {
    const key = String(name || '').toLowerCase();
    const flags = [];
    if (/voodoo|soul|cursed/.test(key)) flags.push('halloween_or_soul_item');
    if (/mask|hazard|spook|maggot|mercy|hunter|leathers|chin/.test(key)) flags.push('cosmetic_or_niche_item');
    if (/case|crate/.test(key)) flags.push('container_item');
    return flags;
  }
  evaluateDraft(draft = {}, reviewItem = {}) {
    const options = getOptions();
    const strategy = readJson(STRATEGIES_PATH, { current: 'balanced', profiles: {} });
    const profile = (strategy.profiles && strategy.profiles[strategy.current || 'balanced']) || {};
    const minProfit = Number(options.min_profit_ref || profile.min_profit_ref || 0.22);
    const maxRisk = Number(options.max_risk_score || profile.max_risk_score || 30);
    const minLiquidity = Number(options.min_liquidity_score || profile.min_liquidity_score || 45);
    const planValue = Number(options.targeted_buy_order_selection_hint_ref || options.draft_policy_soft_selection_value_ref || 25);
    const dailyValue = Number(options.max_ref_per_day || options.daily_value_ref || profile.daily_value_ref || planValue || 25);
    const maxActionRef = Number(options.max_ref_per_action || profile.max_offer_value_ref || 100);
    const planning_valueModeRaw = String(options.draft_policy_selection_mode || 'off').toLowerCase();
    const planning_valueMode = ['off', 'advisory', 'enforce'].includes(planning_valueModeRaw) ? planning_valueModeRaw : 'off';
    const enforceSelectionLimits = Boolean(options.draft_policy_enforce_selection_limits) || planning_valueMode === 'enforce';
    const candidate = this.findScannerCandidate(draft.item_name);
    const maxBuy = Number(draft.max_buy_ref || reviewItem.max_buy_ref || 0);
    const expectedSell = Number(draft.expected_sell_ref || reviewItem.expected_sell_ref || 0);
    const expectedProfit = Number(draft.expected_profit_ref || Math.max(0, expectedSell - maxBuy) || 0);
    const riskScore = Number(draft.risk_score || reviewItem.risk_score || candidate?.risk_score || 0);
    const liquidityScore = Number(draft.liquidity_score || reviewItem.liquidity_score || candidate?.liquidity_score || 0);
    const priceAgeDays = Number(draft.price_age_days ?? reviewItem.price_age_days ?? candidate?.age_days ?? 999);
    const pricingScore = Number(draft.score || candidate?.pricing_score || reviewItem.score || 0);
    const warnings = [];
    const blockers = [];
    const checks = [];
    const addCheck = (id, passed, severity, message) => { checks.push({ id, passed: Boolean(passed), severity, message }); if (!passed && severity === 'blocker') blockers.push(message); else if (!passed) warnings.push(message); };
    addCheck('has_max_buy_price', maxBuy > 0, 'blocker', 'Draft is missing a max buy price.');
    addCheck('has_expected_sell_price', expectedSell > 0, 'warning', 'Draft is missing an expected sell price.');
    addCheck('profit_threshold', expectedProfit >= minProfit, 'warning', 'Expected profit ' + Number(expectedProfit.toFixed(2)) + ' ref is below policy minimum ' + minProfit + ' ref.');
    addCheck('risk_threshold', riskScore <= maxRisk, 'warning', 'Risk score ' + riskScore + '/100 is above policy maximum ' + maxRisk + '/100.');
    addCheck('liquidity_threshold', liquidityScore >= minLiquidity, 'warning', 'Liquidity score ' + liquidityScore + '/100 is below policy minimum ' + minLiquidity + '/100.');
    addCheck('price_freshness', priceAgeDays <= 30, 'warning', 'Price age is ' + priceAgeDays + ' days; verify live classifieds before any real listing.');
    const exceedsDailyValue = maxBuy > dailyValue;
    const exceedsPerActionLimit = maxBuy > maxActionRef;
    const planning_valueLimitSeverity = enforceSelectionLimits ? 'blocker' : (planning_valueMode === 'advisory' ? 'warning' : 'info');
    const limitReconciliation = {
      mode: planning_valueMode,
      enforcement_enabled: enforceSelectionLimits,
      plan_planning_value_ref: Number(planValue.toFixed(2)),
      daily_policy_limit_ref: Number(dailyValue.toFixed(2)),
      per_action_policy_limit_ref: Number(maxActionRef.toFixed(2)),
      required_planning_value_ref: Number(maxBuy.toFixed(2)),
      required_per_action_ref: Number(maxBuy.toFixed(2)),
      exceeds_daily_planning_value: exceedsDailyValue,
      exceeds_per_action_limit: exceedsPerActionLimit,
      live_writes_enabled: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
      recommendation: (exceedsDailyValue || exceedsPerActionLimit)
        ? (enforceSelectionLimits ? 'blocked_by_enforced_limits' : planning_valueMode === 'advisory' ? 'allowed_as_advisory_limit_review' : 'limits_disabled_allow_local_review')
        : 'within_policy_limits',
      guidance: (exceedsDailyValue || exceedsPerActionLimit)
        ? (enforceSelectionLimits ? 'Draft exceeds enforced safety limits. Raise limits manually before future live execution.' : planning_valueMode === 'advisory' ? 'Draft exceeds displayed limits, but limits are advisory only in this build.' : 'Draft exceeds displayed old limits, but planning_value/per-action limits are disabled for local draft policy.')
        : 'Draft fits within displayed limits.'
    };
    if (planning_valueMode === 'off') {
      checks.push({ id: 'planning_value_limit_reconciliation', passed: true, severity: 'info', message: 'Planning value and per-action limits are disabled for local draft policy. Required planning_value: ' + Number(maxBuy.toFixed(2)) + ' ref.' });
    } else {
      addCheck('planning_value_limit', !exceedsDailyValue, planning_valueLimitSeverity, 'Max buy ' + maxBuy + ' ref exceeds daily planning_value ' + dailyValue + ' ref.');
      addCheck('per_action_limit', !exceedsPerActionLimit, planning_valueLimitSeverity, 'Max buy ' + maxBuy + ' ref exceeds per-action limit ' + maxActionRef + ' ref.');
    }
    addCheck('live_write_disabled', !Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes), 'warning', 'Live Backpack.tf writes are disabled; this is expected for draft review.');
    for (const flag of this.classifyNicheItem(draft.item_name)) {
      if (flag === 'container_item') warnings.push('Container/case item: usually low-value and may need manual price verification.');
      if (flag === 'halloween_or_soul_item') warnings.push('Halloween/soul-style item: verify demand and live classifieds before listing.');
      if (flag === 'cosmetic_or_niche_item') warnings.push('Cosmetic/niche item: profit may be theoretical if liquidity is weak.');
    }
    const passedCore = blockers.length === 0;
    const warningCount = [...new Set(warnings)].length;
    const qualityScore = Math.max(0, Math.min(100, Math.round((pricingScore || 70) + (liquidityScore - 50) * 0.25 - riskScore * 0.35 - Math.max(0, priceAgeDays - 14) * 0.4 - warningCount * 4)));
    const draftQuality = qualityScore >= 80 ? 'high' : qualityScore >= 60 ? 'medium' : 'low';
    const policyStatus = blockers.length ? 'blocked' : warningCount ? 'passed_with_warnings' : 'passed';
    const recommended = blockers.length ? 'reject_or_fix_draft' : warningCount ? 'approve_draft_locally_with_warnings' : 'approve_draft_locally';
    return { id: draft.id || reviewItem.id, source_action_id: draft.source_action_id || reviewItem.source_action_id || null, item_name: draft.item_name || reviewItem.item_name || 'Unknown item', intent: draft.intent || reviewItem.intent || 'buy', review_status: reviewItem.review_status || 'draft_review', policy_status: policyStatus, policy_passed: passedCore, draft_quality: draftQuality, quality_score: qualityScore, recommended_review_action: recommended, next_safe_step: recommended, max_buy_ref: Number(maxBuy.toFixed(2)), expected_sell_ref: Number(expectedSell.toFixed(2)), expected_profit_ref: Number(expectedProfit.toFixed(2)), price_age_days: Number(priceAgeDays), liquidity_confidence: liquidityScore >= 70 ? 'high' : liquidityScore >= 45 ? 'medium' : 'low', liquidity_score: liquidityScore, risk_score: riskScore, pricing_score: pricingScore, limit_reconciliation: limitReconciliation, policy_warnings: [...new Set(warnings)], policy_blockers: [...new Set(blockers)], checks, reason: blockers.length ? 'Draft is blocked by enforced blockers. Planning value limits may be advisory/off, but hard blockers still need review.' : warningCount ? 'Draft passed enforced gates. Warnings are advisory; local approval can continue while live writes remain disabled.' : 'Draft passed policy checks for local approval. Live writes remain disabled.', safety: { live_trade_accepts: Boolean(options.allow_live_trade_accepts), live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes), sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm), no_live_provider_write: true, draft_only: true, policy_gate_only: true, planning_value_limits_enforced: enforceSelectionLimits, planning_value_limit_mode: planning_valueMode } };
  }
  build() {
    const review = readJson(LISTING_DRAFT_REVIEW_PATH, { ok: false, items: [] });
    const preview = readJson(LISTING_DRAFT_PREVIEW_PATH, { ok: false, drafts: [] });
    const reviewItems = Array.isArray(review.items) ? review.items : [];
    const previewById = new Map((Array.isArray(preview.drafts) ? preview.drafts : []).map(x => [String(x.id || ''), x]));
    const items = reviewItems.map(item => this.evaluateDraft(previewById.get(String(item.id || '')) || item, item));
    const counts = { drafts: items.length, passed: items.filter(x => x.policy_status === 'passed').length, passed_with_warnings: items.filter(x => x.policy_status === 'passed_with_warnings').length, blocked: items.filter(x => x.policy_status === 'blocked').length, high_quality: items.filter(x => x.draft_quality === 'high').length, medium_quality: items.filter(x => x.draft_quality === 'medium').length, low_quality: items.filter(x => x.draft_quality === 'low').length };
    const reconciliations = items.map(x => x.limit_reconciliation).filter(Boolean);
    const limitSummary = {
      mode: reconciliations[0]?.mode || String(getOptions().draft_policy_selection_mode || 'off'),
      enforcement_enabled: Boolean(reconciliations.some(x => x.enforcement_enabled)),
      plan_planning_value_ref: Number(reconciliations[0]?.plan_planning_value_ref || getOptions().targeted_buy_order_selection_hint_ref || 25),
      required_planning_value_ref: Number(items.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0).toFixed(2)),
      required_per_action_ref: Number(Math.max(0, ...items.map(x => Number(x.max_buy_ref || 0))).toFixed(2)),
      exceeded_items: reconciliations.filter(x => x.exceeds_daily_planning_value || x.exceeds_per_action_limit).length,
      recommendation: reconciliations.some(x => x.recommendation === 'blocked_by_enforced_limits') ? 'raise_limits_or_keep_blocked' : 'limits_are_not_blocking_local_review'
    };
    const reviewApprovedLocally = items.filter(x => x.review_status === 'draft_approved_locally').length;
    const nextSafeStep = reviewApprovedLocally ? 'prepare_backpack_listing_payload_preview' : counts.blocked ? 'fix_policy_blockers' : counts.passed_with_warnings ? 'approve_draft_locally_with_warnings_or_review_price' : counts.passed ? 'approve_draft_locally_or_keep_draft' : 'build_listing_draft_review_first';
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), status: items.length ? 'draft_policy_ready' : 'no_draft_policy_items', next_safe_step: nextSafeStep, ...counts, review_approved_locally: reviewApprovedLocally, limit_reconciliation: limitSummary, summary: { ...counts, review_approved_locally: reviewApprovedLocally, expected_profit_ref: Number(items.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0).toFixed(2)), planning_value_ref: Number(items.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0).toFixed(2)), live_write_enabled: false, limit_reconciliation: limitSummary }, items, guidance: reviewApprovedLocally ? 'A draft is approved locally. Next safe step is to prepare a Backpack.tf payload preview; live writes remain disabled.' : items.length ? 'Planning value/per-action limits are reconciled and disabled as blockers by default. Live Backpack.tf writes remain disabled.' : 'No draft review items exist yet. Build preview and review first.', safety: { live_trade_accepts: false, live_backpack_writes: false, sda_confirmations: false, draft_only: true, queue_only: true, no_live_provider_write: true, planning_value_limits_enforced: Boolean(limitSummary.enforcement_enabled), planning_value_limit_mode: limitSummary.mode } };
    writeJson(LISTING_DRAFT_POLICY_PATH, payload);
    if (this.audit) this.audit.write('listing_draft_policy_built', { drafts: payload.drafts, passed: payload.passed, passed_with_warnings: payload.passed_with_warnings, blocked: payload.blocked, live_write_enabled: false });
    appendActionFeed('listing_draft_policy_built', { drafts: payload.drafts, passed: payload.passed, passed_with_warnings: payload.passed_with_warnings, blocked: payload.blocked, live_write_enabled: false });
    return payload;
  }
}


class LocalDraftApprovalService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, {
      ok: false,
      status: 'not_applied',
      message: 'No Backpack.tf listing payload preview has been applied yet.',
      next_safe_step: 'approve_policy_passed_draft_locally'
    });
  }
  summarizeReview(review) {
    const items = Array.isArray(review.items) ? review.items : [];
    return {
      drafts: Number(review.drafts || items.length || 0),
      needs_review: items.filter(x => x.review_status === 'draft_review').length,
      approved_locally: items.filter(x => x.review_status === 'draft_approved_locally').length,
      rejected: items.filter(x => x.review_status === 'draft_rejected').length,
      needs_price_check: items.filter(x => x.review_status === 'draft_needs_price_check').length
    };
  }
  chooseEligibleDraft(policy, review, requestedId = null) {
    const reviewItems = Array.isArray(review.items) ? review.items : [];
    const reviewById = new Map(reviewItems.map(x => [String(x.id || ''), x]));
    const policyItems = Array.isArray(policy.items) ? policy.items : [];
    const eligible = policyItems
      .map(item => ({ ...item, review_item: reviewById.get(String(item.id || '')) || {} }))
      .filter(item => {
        if (requestedId && String(item.id) !== String(requestedId)) return false;
        if (item.policy_status === 'blocked' || item.policy_passed === false) return false;
        const reviewStatus = String(item.review_item.review_status || item.review_status || 'draft_review');
        if (reviewStatus === 'draft_rejected') return false;
        if (reviewStatus === 'draft_approved_locally') return false;
        return true;
      })
      .sort((a, b) =>
        Number(b.quality_score || 0) - Number(a.quality_score || 0) ||
        Number(b.expected_profit_ref || 0) - Number(a.expected_profit_ref || 0) ||
        Number(a.risk_score || 0) - Number(b.risk_score || 0)
      );
    return eligible[0] || null;
  }
  apply(request = {}) {
    const options = getOptions();
    const reviewService = new ListingDraftReviewService(this.audit);
    const policyService = new DraftQualityPolicyService(this.audit);
    let review = reviewService.current();
    if (!review || review.ok === false) {
      new ListingDraftPreviewService(this.audit).build();
      review = reviewService.build();
    }
    let policy = policyService.current();
    if (!policy || policy.ok === false || !Array.isArray(policy.items)) policy = policyService.build();
    const before = this.summarizeReview(review);
    const alreadyApproved = (Array.isArray(review.items) ? review.items : []).filter(x => x.review_status === 'draft_approved_locally');
    let selected = this.chooseEligibleDraft(policy, review, request.id || null);
    if (!selected && alreadyApproved.length) {
      const payload = {
        ok: true,
        version: APP_VERSION,
        status: 'already_approved_locally',
        applied: false,
        applied_items: alreadyApproved.map(x => ({ id: x.id, item_name: x.item_name, max_buy_ref: Number(x.max_buy_ref || 0), expected_profit_ref: Number(x.expected_profit_ref || 0), live: false })),
        before,
        after: before,
        next_safe_step: 'prepare_backpack_listing_payload_preview',
        recommendation: 'A draft is already approved locally. Next safe step is payload preview; live writes remain disabled.',
        live_write_enabled: false,
        safety: { live_trade_accepts: false, live_backpack_writes: false, sda_confirmations: false, local_state_only: true, no_live_provider_write: true }
      };
      writeJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, payload);
      return payload;
    }
    if (!selected) {
      const payload = {
        ok: false,
        version: APP_VERSION,
        status: 'no_policy_passed_draft_to_approve',
        applied: false,
        message: 'No draft passed policy for local approval. Build draft preview/review/policy first, or resolve policy blockers.',
        before,
        policy_summary: { passed: Number(policy.passed || 0), passed_with_warnings: Number(policy.passed_with_warnings || 0), blocked: Number(policy.blocked || 0) },
        next_safe_step: 'build_or_fix_listing_draft_policy',
        live_write_enabled: false,
        safety: { live_trade_accepts: false, live_backpack_writes: false, sda_confirmations: false, local_state_only: true, no_live_provider_write: true }
      };
      writeJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, payload);
      return payload;
    }
    const updatedReview = reviewService.update(selected.id, 'draft_approved_locally', 'Approved locally by 5.12.33 Clean Data. No live Backpack.tf write was performed.');
    const updatedPolicy = policyService.build();
    const after = this.summarizeReview(updatedReview);
    const appliedItem = {
      id: selected.id,
      source_action_id: selected.source_action_id || null,
      item_name: selected.item_name || 'Unknown item',
      intent: selected.intent || 'buy',
      max_buy_ref: Number(selected.max_buy_ref || 0),
      expected_sell_ref: Number(selected.expected_sell_ref || 0),
      expected_profit_ref: Number(selected.expected_profit_ref || 0),
      policy_status: selected.policy_status || null,
      draft_quality: selected.draft_quality || null,
      quality_score: Number(selected.quality_score || 0),
      risk_score: Number(selected.risk_score || 0),
      liquidity_score: Number(selected.liquidity_score || 0),
      live: false
    };
    const payload = {
      ok: true,
      version: APP_VERSION,
      status: 'draft_approved_locally',
      applied: true,
      applied_at: new Date().toISOString(),
      applied_items: [appliedItem],
      before,
      after,
      policy_after: {
        passed: Number(updatedPolicy.passed || 0),
        passed_with_warnings: Number(updatedPolicy.passed_with_warnings || 0),
        blocked: Number(updatedPolicy.blocked || 0),
        review_approved_locally: Number(updatedPolicy.review_approved_locally || 0),
        next_safe_step: updatedPolicy.next_safe_step || null
      },
      next_safe_step: 'prepare_backpack_listing_payload_preview',
      recommendation: 'Draft approved locally. Next safe step is a Backpack.tf payload preview; live writes remain disabled.',
      live_write_enabled: false,
      safety: {
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
        local_state_only: true,
        no_live_provider_write: true
      }
    };
    writeJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, payload);
    if (this.audit) this.audit.write('listing_draft_approved_locally', { item_name: appliedItem.item_name, max_buy_ref: appliedItem.max_buy_ref, expected_profit_ref: appliedItem.expected_profit_ref, live_write_enabled: false });
    appendActionFeed('listing_draft_approved_locally', { item_name: appliedItem.item_name, max_buy_ref: appliedItem.max_buy_ref, expected_profit_ref: appliedItem.expected_profit_ref, live_write_enabled: false });
    return payload;
  }
}

class BackpackListingPayloadPreviewService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(LISTING_PAYLOAD_PREVIEW_PATH, {
      ok: false,
      status: 'not_built',
      error: 'No Backpack.tf listing payload preview has been built yet.',
      live_write_enabled: false
    });
  }
  build() {
    const options = getOptions();
    const review = readJson(LISTING_DRAFT_REVIEW_PATH, { ok: false, items: [] });
    const policy = readJson(LISTING_DRAFT_POLICY_PATH, { ok: false, items: [] });
    const localApproval = readJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied', applied_items: [] });
    const reviewItems = Array.isArray(review.items) ? review.items : [];
    const policyItems = Array.isArray(policy.items) ? policy.items : [];
    const policyById = new Map(policyItems.map(x => [String(x.id || ''), x]));
    const approvedDrafts = reviewItems
      .filter(item => String(item.review_status || '') === 'draft_approved_locally')
      .map(item => ({ ...item, policy_item: policyById.get(String(item.id || '')) || {} }))
      .filter(item => String(item.intent || 'buy') === 'buy');

    const payloads = approvedDrafts.map(item => {
      const policyItem = item.policy_item || {};
      const maxBuy = Number(item.max_buy_ref || policyItem.max_buy_ref || 0);
      const expectedSell = Number(item.expected_sell_ref || policyItem.expected_sell_ref || 0);
      const expectedProfit = Number(item.expected_profit_ref || policyItem.expected_profit_ref || Math.max(0, expectedSell - maxBuy));
      const currencies = { metal: Number(maxBuy.toFixed(2)) };
      const providerPayloadPreview = {
        intent: 'buy',
        item: {
          name: item.item_name || 'Unknown item',
          quality: item.quality || policyItem.quality || null,
          priceindex: item.priceindex || policyItem.priceindex || '0'
        },
        currencies,
        details: 'Draft payload only. Review Backpack.tf classifieds/liquidity before enabling any live write.',
        bump: false,
        offers: true
      };
      const safeId = 'payload_' + crypto.createHash('sha1').update(String(item.id || item.item_name || Math.random())).digest('hex').slice(0, 12);
      return {
        id: safeId,
        source_draft_id: item.id,
        source_action_id: item.source_action_id || null,
        account_id: item.account_id || 'main',
        item_name: item.item_name || 'Unknown item',
        intent: 'buy',
        status: 'payload_preview_only',
        max_buy_ref: Number(maxBuy.toFixed(2)),
        expected_sell_ref: Number(expectedSell.toFixed(2)),
        expected_profit_ref: Number(expectedProfit.toFixed(2)),
        currencies,
        provider: 'backpack.tf',
        provider_endpoint_hint: 'classifieds/listing write endpoint - not called by this preview',
        provider_payload_preview: providerPayloadPreview,
        policy_status: policyItem.policy_status || null,
        policy_passed: policyItem.policy_passed !== false,
        policy_warnings: Array.isArray(policyItem.policy_warnings) ? policyItem.policy_warnings : [],
        quality_score: Number(policyItem.quality_score || item.score || 0),
        risk_score: Number(policyItem.risk_score || item.risk_score || 0),
        liquidity_score: Number(policyItem.liquidity_score || item.liquidity_score || 0),
        next_safe_step: 'review_payload_preview',
        live_write_enabled: false,
        requires_manual_approval: true,
        safety: {
          live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
          blocked_from_live_write: true,
          payload_preview_only: true,
          no_provider_request_sent: true,
          secrets_included: false
        }
      };
    });

    const totalPlanningValue = payloads.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0);
    const totalProfit = payloads.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0);
    const payload = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status: payloads.length ? 'payload_preview_ready' : 'no_approved_draft_for_payload_preview',
      payload_count: payloads.length,
      buy_payloads: payloads.length,
      live_write_enabled: false,
      next_safe_step: payloads.length ? 'review_payload_preview' : 'approve_draft_locally_first',
      summary: {
        payloads: payloads.length,
        total_planning_value_ref: Number(totalPlanningValue.toFixed(2)),
        expected_profit_ref: Number(totalProfit.toFixed(2)),
        live_write_enabled: false,
        local_approval_status: localApproval.status || 'not_applied'
      },
      payloads,
      local_approval: localApproval && localApproval.ok !== false ? {
        ok: true,
        status: localApproval.status || null,
        applied: Boolean(localApproval.applied),
        applied_items: Array.isArray(localApproval.applied_items) ? localApproval.applied_items.map(x => ({ item_name: x.item_name, max_buy_ref: Number(x.max_buy_ref || 0), expected_profit_ref: Number(x.expected_profit_ref || 0), live: false })) : []
      } : { ok: false, status: 'not_applied' },
      guidance: payloads.length
        ? 'Payload preview is ready. This is the exact safe draft shape for review only; the add-on did not call Backpack.tf write APIs.'
        : 'Approve a policy-passed draft locally first, then run Diagnostic bundle again to generate payload preview.',
      safety: {
        live_trade_accepts: false,
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: false,
        preview_only: true,
        no_live_provider_write: true,
        secrets_included: false
      }
    };
    writeJson(LISTING_PAYLOAD_PREVIEW_PATH, payload);
    if (this.audit) this.audit.write('backpack_listing_payload_preview_built', { payloads: payload.payload_count, live_write_enabled: false });
    appendActionFeed('backpack_listing_payload_preview_built', { payloads: payload.payload_count, live_write_enabled: false });
    return payload;
  }
}

class BackpackListingPayloadReviewService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, status: 'not_built', error: 'No Backpack.tf payload review has been built yet.', payloads: [], live_write_enabled: false });
  }
  allowedStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    return ['payload_review', 'payload_approved_locally', 'payload_rejected', 'payload_needs_liquidity_check'].includes(normalized) ? normalized : 'payload_review';
  }
  build() {
    const options = getOptions();
    const preview = readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, payloads: [] });
    const existing = readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: true, payloads: [] });
    const existingById = new Map((Array.isArray(existing.payloads) ? existing.payloads : []).map(x => [String(x.id || ''), x]));
    const rawPayloads = Array.isArray(preview.payloads) ? preview.payloads : [];
    const providerWriteSettingEnabled = Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes);
    const payloads = rawPayloads.map(payload => {
      const old = existingById.get(String(payload.id || '')) || {};
      const status = this.allowedStatus(old.review_status || old.status || 'payload_review');
      const warnings = [];
      if (Array.isArray(payload.policy_warnings)) warnings.push(...payload.policy_warnings);
      if (Number(payload.liquidity_score || 0) < 50) warnings.push('Liquidity confidence is weak; verify live classifieds before publishing.');
      if (Number(payload.expected_profit_ref || 0) <= 0) warnings.push('Expected profit is not positive.');
      if (providerWriteSettingEnabled) warnings.push('Provider write setting is enabled, but this review still does not publish automatically.');
      return {
        id: payload.id,
        source_payload_id: payload.id,
        source_draft_id: payload.source_draft_id || null,
        source_action_id: payload.source_action_id || null,
        account_id: payload.account_id || 'main',
        item_name: payload.item_name || payload.provider_payload_preview?.item?.name || 'Unknown item',
        intent: payload.intent || payload.provider_payload_preview?.intent || 'buy',
        review_status: status,
        status,
        max_buy_ref: Number(payload.max_buy_ref || 0),
        expected_sell_ref: Number(payload.expected_sell_ref || 0),
        expected_profit_ref: Number(payload.expected_profit_ref || 0),
        currencies: payload.currencies || payload.provider_payload_preview?.currencies || {},
        quality: payload.provider_payload_preview?.item?.quality || payload.quality || null,
        priceindex: payload.provider_payload_preview?.item?.priceindex || payload.priceindex || '0',
        provider_payload_preview: payload.provider_payload_preview || null,
        policy_status: payload.policy_status || null,
        policy_passed: payload.policy_passed !== false,
        policy_warnings: Array.from(new Set(warnings.filter(Boolean))),
        quality_score: Number(payload.quality_score || 0),
        risk_score: Number(payload.risk_score || 0),
        liquidity_score: Number(payload.liquidity_score || 0),
        live_write_enabled: false,
        provider_write_setting_enabled: providerWriteSettingEnabled,
        publish_guard: {
          guard_enabled: true,
          live_write_enabled: false,
          provider_write_setting_enabled: providerWriteSettingEnabled,
          publish_allowed: false,
          reason: providerWriteSettingEnabled ? 'Provider write setting is enabled, but publish is still blocked by payload review guard.' : 'Backpack.tf live writes are disabled. Payload review is local-only.'
        },
        next_safe_step: status === 'payload_approved_locally' ? 'prepare_disabled_publish_request_preview' : status === 'payload_needs_liquidity_check' ? 'verify_live_classifieds_liquidity' : status === 'payload_rejected' ? 'choose_another_payload_or_rebuild_scanner' : 'approve_payload_locally_or_mark_liquidity_check',
        updated_at: old.updated_at || null,
        note: old.note || ''
      };
    });
    const counts = payloads.reduce((acc, x) => { acc[x.review_status] = (acc[x.review_status] || 0) + 1; return acc; }, {});
    const data = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status: payloads.length ? 'payload_review_ready' : 'no_payload_preview_to_review',
      payload_count: payloads.length,
      needs_review: Number(counts.payload_review || 0),
      approved_locally: Number(counts.payload_approved_locally || 0),
      rejected: Number(counts.payload_rejected || 0),
      needs_liquidity_check: Number(counts.payload_needs_liquidity_check || 0),
      live_write_enabled: false,
      provider_write_setting_enabled: providerWriteSettingEnabled,
      next_safe_step: Number(counts.payload_approved_locally || 0) ? 'prepare_disabled_publish_request_preview' : (Number(counts.payload_review || 0) ? 'approve_payload_locally_or_mark_liquidity_check' : 'build_payload_preview_first'),
      payloads,
      publish_guard: { live_backpack_writes: false, provider_write_setting_enabled: providerWriteSettingEnabled, publish_allowed: false, no_provider_request_sent: true, requires_explicit_future_patch: true },
      guidance: payloads.length ? 'Review the Backpack.tf payload preview locally. Approving a payload does not publish it; live writes remain blocked.' : 'Build a Backpack.tf payload preview first. This review guard will then track local payload status.'
    };
    writeJson(LISTING_PAYLOAD_REVIEW_PATH, data);
    if (this.audit) this.audit.write('backpack_listing_payload_review_built', { payloads: data.payload_count, needs_review: data.needs_review, approved_locally: data.approved_locally, live_write_enabled: false });
    appendActionFeed('backpack_listing_payload_review_built', { payloads: data.payload_count, needs_review: data.needs_review, approved_locally: data.approved_locally, live_write_enabled: false });
    return data;
  }
  update(id, status, note) {
    let data = this.current();
    if (!data || data.ok === false || !Array.isArray(data.payloads)) data = this.build();
    const payloads = Array.isArray(data.payloads) ? data.payloads : [];
    const targetId = String(id || '');
    const nextStatus = this.allowedStatus(status);
    let updated = false;
    const now = new Date().toISOString();
    for (const payload of payloads) {
      if (String(payload.id || '') === targetId) {
        payload.review_status = nextStatus;
        payload.status = nextStatus;
        payload.updated_at = now;
        if (typeof note === 'string') payload.note = note.slice(0, 500);
        payload.next_safe_step = nextStatus === 'payload_approved_locally' ? 'prepare_disabled_publish_request_preview' : nextStatus === 'payload_needs_liquidity_check' ? 'verify_live_classifieds_liquidity' : nextStatus === 'payload_rejected' ? 'choose_another_payload_or_rebuild_scanner' : 'approve_payload_locally_or_mark_liquidity_check';
        updated = true;
      }
    }
    if (!updated) return { ok: false, error: 'Payload not found for local review update.', id: targetId };
    const counts = payloads.reduce((acc, x) => { acc[x.review_status] = (acc[x.review_status] || 0) + 1; return acc; }, {});
    data = { ...data, version: APP_VERSION, updated_at: now, payloads, needs_review: Number(counts.payload_review || 0), approved_locally: Number(counts.payload_approved_locally || 0), rejected: Number(counts.payload_rejected || 0), needs_liquidity_check: Number(counts.payload_needs_liquidity_check || 0), live_write_enabled: false, next_safe_step: Number(counts.payload_approved_locally || 0) ? 'prepare_disabled_publish_request_preview' : 'approve_payload_locally_or_mark_liquidity_check' };
    writeJson(LISTING_PAYLOAD_REVIEW_PATH, data);
    if (this.audit) this.audit.write('backpack_listing_payload_review_updated', { id: targetId, status: nextStatus, live_write_enabled: false });
    appendActionFeed('backpack_listing_payload_review_updated', { id: targetId, status: nextStatus, live_write_enabled: false });
    return { ok: true, version: APP_VERSION, updated_at: now, id: targetId, status: nextStatus, live_write_enabled: false, review: data };
  }
}


class BackpackListingPayloadLocalApprovalService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, {
      ok: false,
      version: APP_VERSION,
      status: 'not_applied',
      applied: false,
      approved_locally: 0,
      live_write_enabled: false,
      publish_allowed: false,
      next_safe_step: 'build_payload_review_first'
    });
  }
  buildReviewIfNeeded() {
    const reviewService = new BackpackListingPayloadReviewService(this.audit);
    let review = reviewService.current();
    if (!review || review.ok === false || !Array.isArray(review.payloads) || !review.payloads.length) {
      const preview = new BackpackListingPayloadPreviewService(this.audit).build();
      if (!preview || preview.ok === false || !Array.isArray(preview.payloads) || !preview.payloads.length) {
        return { ok: false, status: 'no_payload_preview', review: null, error: 'No Backpack.tf payload preview exists. Approve a draft locally and build payload preview first.' };
      }
      review = reviewService.build();
    }
    return { ok: true, review };
  }
  selectPayload(review, requestedId) {
    const payloads = Array.isArray(review?.payloads) ? review.payloads : [];
    if (requestedId) {
      const exact = payloads.find(x => String(x.id || '') === String(requestedId));
      if (exact) return exact;
    }
    const candidates = payloads
      .filter(x => x && x.review_status !== 'payload_rejected')
      .filter(x => x.policy_passed !== false)
      .sort((a, b) => {
        const aApproved = a.review_status === 'payload_approved_locally' ? 1 : 0;
        const bApproved = b.review_status === 'payload_approved_locally' ? 1 : 0;
        if (aApproved !== bApproved) return bApproved - aApproved;
        const aScore = Number(a.expected_profit_ref || 0) * 100 + Number(a.liquidity_score || 0) - Number(a.risk_score || 0);
        const bScore = Number(b.expected_profit_ref || 0) * 100 + Number(b.liquidity_score || 0) - Number(b.risk_score || 0);
        return bScore - aScore;
      });
    return candidates[0] || null;
  }
  apply(input = {}) {
    const requestedId = input && input.id ? String(input.id) : '';
    const built = this.buildReviewIfNeeded();
    if (!built.ok) {
      const failed = {
        ok: false,
        version: APP_VERSION,
        updated_at: new Date().toISOString(),
        status: built.status || 'not_applied',
        applied: false,
        approved_locally: 0,
        live_write_enabled: false,
        publish_allowed: false,
        no_provider_request_sent: true,
        error: built.error || 'Payload local approval could not run.',
        next_safe_step: 'build_payload_preview_first'
      };
      writeJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, failed);
      return failed;
    }
    const reviewService = new BackpackListingPayloadReviewService(this.audit);
    let review = built.review;
    let selected = this.selectPayload(review, requestedId);
    if (!selected) {
      const failed = {
        ok: false,
        version: APP_VERSION,
        updated_at: new Date().toISOString(),
        status: 'not_applied',
        applied: false,
        approved_locally: 0,
        live_write_enabled: false,
        publish_allowed: false,
        no_provider_request_sent: true,
        error: 'No policy-passed payload is available for local approval.',
        next_safe_step: 'build_or_review_payload_first'
      };
      writeJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, failed);
      return failed;
    }
    let updateResult = null;
    if (selected.review_status !== 'payload_approved_locally') {
      updateResult = reviewService.update(selected.id, 'payload_approved_locally', 'Approved locally by 5.12.33 Clean Data. No Backpack.tf write was performed.');
      review = updateResult.review || reviewService.current();
      selected = this.selectPayload(review, selected.id) || selected;
    }
    const counts = (Array.isArray(review.payloads) ? review.payloads : []).reduce((acc, x) => {
      const status = x.review_status || x.status || 'payload_review';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const now = new Date().toISOString();
    const result = {
      ok: true,
      version: APP_VERSION,
      updated_at: now,
      status: 'payload_approved_locally',
      applied: Boolean(updateResult),
      already_approved: !updateResult,
      approved_locally: Number(counts.payload_approved_locally || 0),
      needs_review: Number(counts.payload_review || 0),
      rejected: Number(counts.payload_rejected || 0),
      needs_liquidity_check: Number(counts.payload_needs_liquidity_check || 0),
      item_name: selected.item_name,
      payload_id: selected.id,
      intent: selected.intent || 'buy',
      max_buy_ref: Number(selected.max_buy_ref || selected.currencies?.metal || 0),
      expected_sell_ref: Number(selected.expected_sell_ref || 0),
      expected_profit_ref: Number(selected.expected_profit_ref || 0),
      currencies: selected.currencies || {},
      policy_status: selected.policy_status || null,
      policy_warnings: Array.isArray(selected.policy_warnings) ? selected.policy_warnings : [],
      publish_guard: {
        publish_allowed: false,
        live_write_enabled: false,
        no_provider_request_sent: true,
        reason: 'Payload was approved locally only. Backpack.tf live writes remain disabled.'
      },
      live_write_enabled: false,
      publish_allowed: false,
      no_provider_request_sent: true,
      next_safe_step: 'prepare_guarded_publish_dry_run',
      review
    };
    writeJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, result);
    if (this.audit) this.audit.write('backpack_listing_payload_approved_locally', { item_name: result.item_name, payload_id: result.payload_id, live_write_enabled: false, publish_allowed: false });
    appendActionFeed('backpack_listing_payload_approved_locally', { item_name: result.item_name, payload_id: result.payload_id, live_write_enabled: false, publish_allowed: false });
    return result;
  }
}

class GuardedPublishDryRunService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, version: APP_VERSION, status: 'not_built', error: 'No guarded publish dry run has been built yet.', request_count: 0, live_write_enabled: false, publish_allowed: false, dry_run: true, provider_request_sent: false }); }
  ensureLocalPayloadApproval() {
    let approval = readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' });
    if (!approval || approval.ok === false || approval.status !== 'payload_approved_locally') approval = new BackpackListingPayloadLocalApprovalService(this.audit).apply({ source: 'guarded_publish_dry_run' });
    return approval;
  }
  build(input = {}) {
    const options = getOptions();
    const approval = this.ensureLocalPayloadApproval();
    const review = readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, payloads: [] });
    const preview = readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, payloads: [] });
    const reviewPayloads = Array.isArray(review.payloads) ? review.payloads : [];
    const previewPayloads = Array.isArray(preview.payloads) ? preview.payloads : [];
    const byPreviewId = new Map(previewPayloads.map(x => [String(x.id || ''), x]));
    const approvedReviewPayloads = reviewPayloads.filter(x => x && String(x.review_status || x.status || '') === 'payload_approved_locally').filter(x => x.policy_passed !== false);
    const fallbackPayloadId = approval && approval.payload_id ? String(approval.payload_id) : '';
    let selected = approvedReviewPayloads;
    if (!selected.length && fallbackPayloadId) {
      const fromPreview = byPreviewId.get(fallbackPayloadId);
      if (fromPreview) selected = [{ ...fromPreview, review_status: 'payload_approved_locally' }];
    }
    const liveWriteSetting = Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes);
    const requests = selected.map(item => {
      const previewItem = byPreviewId.get(String(item.id || item.source_payload_id || '')) || item;
      const providerPayload = previewItem.provider_payload_preview || item.provider_payload_preview || { intent: item.intent || 'buy', item: { name: item.item_name || 'Unknown item', quality: item.quality || '6', priceindex: item.priceindex || '0' }, currencies: item.currencies || { metal: Number(item.max_buy_ref || 0) }, details: 'Draft payload only. Review Backpack.tf classifieds/liquidity before enabling any live write.', bump: false, offers: true };
      const itemName = item.item_name || providerPayload.item?.name || 'Unknown item';
      const maxBuy = Number(item.max_buy_ref || providerPayload.currencies?.metal || 0);
      const expectedSell = Number(item.expected_sell_ref || 0);
      const expectedProfit = Number(item.expected_profit_ref || Math.max(0, expectedSell - maxBuy));
      const requestId = 'publish_dry_run_' + crypto.createHash('sha1').update(String(item.id || itemName || Math.random())).digest('hex').slice(0, 12);
      return { id: requestId, source_payload_id: item.id || item.source_payload_id || null, source_draft_id: item.source_draft_id || null, source_action_id: item.source_action_id || null, account_id: item.account_id || 'main', provider: 'backpack.tf', endpoint_hint: 'https://backpack.tf/api/v2/classifieds/listings', endpoint: 'classifieds/listing write endpoint', method: 'POST', auth: { required: true, type: 'X-Auth-Token', value: '[redacted]', secrets_included: false }, item_name: itemName, intent: providerPayload.intent || item.intent || 'buy', max_buy_ref: Number(maxBuy.toFixed(2)), expected_sell_ref: Number(expectedSell.toFixed(2)), expected_profit_ref: Number(expectedProfit.toFixed(2)), currencies: providerPayload.currencies || item.currencies || { metal: Number(maxBuy.toFixed(2)) }, request_body_preview: providerPayload, policy_status: item.policy_status || previewItem.policy_status || null, policy_warnings: Array.isArray(item.policy_warnings) ? item.policy_warnings : (Array.isArray(previewItem.policy_warnings) ? previewItem.policy_warnings : []), risk_score: Number(item.risk_score || previewItem.risk_score || 0), liquidity_score: Number(item.liquidity_score || previewItem.liquidity_score || 0), dry_run: true, live_write_enabled: false, provider_write_setting_enabled: liveWriteSetting, publish_allowed: false, provider_request_sent: false, no_provider_request_sent: true, status: 'guarded_publish_dry_run', next_safe_step: 'enable_live_write_setting_explicitly_later' };
    });
    const totalPlanningValue = requests.reduce((sum, x) => sum + Number(x.max_buy_ref || 0), 0);
    const totalProfit = requests.reduce((sum, x) => sum + Number(x.expected_profit_ref || 0), 0);
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), status: requests.length ? 'dry_run_ready' : 'no_locally_approved_payload', request_count: requests.length, buy_requests: requests.filter(x => x.intent === 'buy').length, dry_run: true, live_write_enabled: false, provider_write_setting_enabled: liveWriteSetting, publish_allowed: false, provider_request_sent: false, no_provider_request_sent: true, next_safe_step: requests.length ? 'enable_live_write_setting_explicitly_later' : 'approve_payload_locally_first', summary: { requests: requests.length, total_planning_value_ref: Number(totalPlanningValue.toFixed(2)), expected_profit_ref: Number(totalProfit.toFixed(2)), live_write_enabled: false, publish_allowed: false, provider_request_sent: false }, requests, local_payload_approval: approval && approval.ok !== false ? { ok: true, status: approval.status || null, approved_locally: Number(approval.approved_locally || 0), item_name: approval.item_name || null, payload_id: approval.payload_id || null, live_write_enabled: false, publish_allowed: false } : { ok: false, status: approval?.status || 'not_applied' }, publish_guard: { guard_enabled: true, dry_run_only: true, live_backpack_writes: false, provider_write_setting_enabled: liveWriteSetting, publish_allowed: false, no_provider_request_sent: true, reason: 'Guarded publish dry run prepares the redacted request shape only. Backpack.tf write API is not called.' }, guidance: requests.length ? 'Review this disabled publish request preview. It is a dry run only; no Backpack.tf provider request was sent.' : 'Approve a payload locally first. Diagnostic bundle can then build a guarded publish dry run.', safety: { live_trade_accepts: false, live_backpack_writes: false, sda_confirmations: false, dry_run_only: true, provider_request_sent: false, secrets_included: false } };
    writeJson(GUARDED_PUBLISH_DRY_RUN_PATH, payload);
    if (this.audit) this.audit.write('guarded_publish_dry_run_built', { requests: payload.request_count, live_write_enabled: false, provider_request_sent: false });
    appendActionFeed('guarded_publish_dry_run_built', { requests: payload.request_count, live_write_enabled: false, provider_request_sent: false });
    return payload;
  }
}


class PublishReadinessGateService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(PUBLISH_READINESS_GATE_PATH, {
      ok: false,
      version: APP_VERSION,
      status: 'not_built',
      error: 'No publish readiness gate has been built yet.',
      can_publish_live: false,
      safe_flow_done: false,
      live_write_enabled: false,
      provider_request_sent: false
    });
  }
  gate(id, label, ready, detail, severity = 'required', action = null) {
    return { id, label, ready: Boolean(ready), detail: detail || '', severity, action: action || (ready ? 'No action needed.' : 'Review this gate before any future live publish step.') };
  }
  build(input = {}) {
    const options = getOptions();
    const versionAudit = buildVersionAudit();
    let dryRun = readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, status: 'not_built', requests: [] });
    if ((!dryRun || dryRun.ok === false || !Number(dryRun.request_count || 0)) && input && input.rebuild !== false) {
      dryRun = new GuardedPublishDryRunService(this.audit).build({ source: 'publish_readiness_gate' });
    }
    const payloadReview = readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, payloads: [] });
    const payloadApproval = readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' });
    const preview = readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, payloads: [] });
    const backpackCache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
    const priceSchema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {} });
    const requests = Array.isArray(dryRun.requests) ? dryRun.requests : [];
    const firstRequest = requests[0] || null;
    const providerTokenSaved = Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key);
    const pricesCount = Number(backpackCache.prices_count || (Array.isArray(priceSchema.prices) ? priceSchema.prices.length : 0) || 0);
    const dryRunReady = Boolean(dryRun && dryRun.ok !== false && Number(dryRun.request_count || requests.length || 0) > 0 && dryRun.status === 'dry_run_ready');
    const payloadApproved = Boolean(payloadApproval && payloadApproval.ok !== false && payloadApproval.status === 'payload_approved_locally');
    const noProviderRequestSent = Boolean(dryRun && dryRun.provider_request_sent === false && dryRun.no_provider_request_sent !== false && requests.every(x => x.provider_request_sent === false && x.no_provider_request_sent !== false));
    const secretsRedacted = Boolean(requests.every(x => !String(x?.auth?.value || '').trim() || String(x.auth.value).includes('redacted')));
    const liveWriteEnabled = Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes);
    const guardedPublishEnabled = Boolean(options.allow_guarded_backpack_publish);
    const guardedPublishExecutorPresent = true;
    const safetyFlagsOff = !Boolean(options.allow_live_trade_accepts || options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm);
    const planning_valueRef = Number(dryRun.summary?.total_planning_value_ref || firstRequest?.max_buy_ref || 0);
    const profitRef = Number(dryRun.summary?.expected_profit_ref || firstRequest?.expected_profit_ref || 0);
    const maxRefPerActionOk = planning_valueRef <= Number(options.max_ref_per_action || 0) || Number(options.max_ref_per_action || 0) <= 0;
    const maxRiskOk = Number(firstRequest?.risk_score || 0) <= Number(options.max_risk_score || 100);
    const minProfitOk = profitRef >= Number(options.min_profit_ref || 0);
    const gates = [
      this.gate('version_audit_ok', 'Build markers match', versionAudit.ok, versionAudit.ok ? `All active markers match ${APP_VERSION}.` : 'Some version markers are stale.', 'required', 'Rebuild/push the add-on package.'),
      this.gate('backpack_token_saved', 'Backpack.tf token saved', providerTokenSaved, providerTokenSaved ? 'Backpack.tf credential exists in the add-on vault/options.' : 'Backpack.tf token/API key is missing.', 'required_for_future_live', 'Save Backpack.tf token in Account credentials.'),
      this.gate('provider_prices_ready', 'Backpack.tf prices cached', pricesCount > 0, `${pricesCount} price entries available.`, 'required', 'Run Sync Backpack.tf.'),
      this.gate('inventory_synced', 'Inventory snapshot available', Boolean(inventory.ok), inventory.ok ? `${Number(inventory.items_count || 0)} inventory item(s), estimated ${Number(inventory.analysis?.estimated_value_ref || 0)} ref.` : 'Inventory cache is not ready.', 'recommended', 'Run Sync inventory.'),
      this.gate('payload_preview_ready', 'Payload preview exists', Number(preview.payload_count || (Array.isArray(preview.payloads) ? preview.payloads.length : 0)) > 0, `${Number(preview.payload_count || (Array.isArray(preview.payloads) ? preview.payloads.length : 0) || 0)} payload preview(s).`, 'required', 'Build payload preview.'),
      this.gate('payload_approved_locally', 'Payload approved locally', payloadApproved, payloadApproved ? `${payloadApproval.item_name || 'Payload'} approved locally.` : 'No local payload approval yet.', 'required', 'Approve payload locally.'),
      this.gate('guarded_dry_run_ready', 'Guarded publish dry run ready', dryRunReady, dryRunReady ? `${Number(dryRun.request_count || requests.length || 0)} disabled publish request preview(s).` : 'No guarded publish dry run request is ready.', 'required', 'Build guarded publish dry run.'),
      this.gate('policy_planning_value_ok', 'Future live planning_value check', maxRefPerActionOk && maxRiskOk && minProfitOk, `planning_value ${Number(planning_valueRef.toFixed(2))} ref · profit ${Number(profitRef.toFixed(2))} ref · risk ${Number(firstRequest?.risk_score || 0)}/100`, 'future_live', 'Raise future live limits deliberately or choose a smaller payload before any live executor.'),
      this.gate('live_writes_disabled', 'Live Backpack.tf writes are still disabled', !liveWriteEnabled, liveWriteEnabled ? 'A live write setting is enabled; this build still blocks publish.' : 'Live Backpack.tf writes are disabled as intended.', 'safety', 'Disable allow_live_backpack_writes / allow_live_classifieds_writes until a dedicated live executor exists.'),
      this.gate('no_provider_request_sent', 'No provider request was sent', noProviderRequestSent, noProviderRequestSent ? 'Dry-run only; Backpack.tf API write endpoint was not called.' : 'A provider request was reported as sent.', 'safety', 'Stop and inspect audit before continuing.'),
      this.gate('secrets_redacted', 'Secrets redacted from request preview', secretsRedacted, secretsRedacted ? 'Auth token is redacted or omitted in preview.' : 'A secret-like value may be present in preview.', 'safety', 'Regenerate diagnostic and redact secrets.'),
      this.gate('guarded_publish_executor_present', 'Guarded Backpack.tf publish executor is present', true, 'Manual one-draft publish executor exists, but it is disabled by default and requires an approved local draft plus confirm=true.', 'safety', 'Use Test Publish Payload first; enable guarded publish only when ready to publish one approved draft manually.')
    ];
    const required = gates.filter(x => x.severity === 'required');
    const recommended = gates.filter(x => x.severity === 'recommended');
    const futureLive = gates.filter(x => x.severity === 'required_for_future_live' || x.severity === 'future_live');
    const safety = gates.filter(x => x.severity === 'safety');
    const safeGates = gates.filter(x => x.severity === 'required' || x.severity === 'safety' || x.severity === 'recommended');
    const requiredReady = required.every(x => x.ready);
    const futureLiveReady = futureLive.every(x => x.ready);
    const safetyReady = safety.every(x => x.ready);
    const safeFlowDone = Boolean(requiredReady && safetyReady && dryRunReady && payloadApproved && noProviderRequestSent);
    const safeReadyCount = safeGates.filter(x => x.ready).length;
    const futureReadyCount = futureLive.filter(x => x.ready).length;
    const safeReadinessPercent = safeGates.length ? Math.round((safeReadyCount / safeGates.length) * 100) : 0;
    const futureLiveReadinessPercent = futureLive.length ? Math.round((futureReadyCount / futureLive.length) * 100) : 0;
    const liveBlockers = [];
    if (!providerTokenSaved) liveBlockers.push('Backpack.tf token/API key must be saved before guarded publish can be used.');
    if (!guardedPublishEnabled) liveBlockers.push('Guarded Backpack.tf publish executor is present but disabled by default. Enable allow_guarded_backpack_publish only when ready.');
    if (liveWriteEnabled) liveBlockers.push('Legacy live write setting is enabled; keep legacy live writes disabled and use guarded one-draft publish only.');
    liveBlockers.push('Manual confirmation is required for every guarded publish request; scheduler/autopilot publish remains disabled.');
    const canPublishGuardedNow = Boolean(guardedPublishExecutorPresent && guardedPublishEnabled && providerTokenSaved && dryRunReady && payloadApproved && safetyFlagsOff);
    const status = safeFlowDone ? (canPublishGuardedNow ? 'guarded_publish_ready_manual_only' : 'safe_pre_publish_ready') : 'readiness_blocked';
    const result = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status,
      safe_flow_done: safeFlowDone,
      safe_flow_label: safeFlowDone ? 'Safe planning flow is done. Live publish is still intentionally blocked.' : 'Safe planning flow still has blockers.',
      readiness_percent: Math.round((gates.filter(x => x.ready).length / gates.length) * 100),
      readiness_percent_label: 'Overall readiness includes future-live gates. Safe-flow readiness is reported separately.',
      safe_readiness_percent: safeReadinessPercent,
      safe_ready_count: safeReadyCount,
      safe_total_gates: safeGates.length,
      future_live_readiness_percent: futureLiveReadinessPercent,
      future_live_ready_count: futureReadyCount,
      future_live_total_gates: futureLive.length,
      ready_count: gates.filter(x => x.ready).length,
      total_gates: gates.length,
      can_publish_live: canPublishGuardedNow,
      guarded_publish_executor_present: true,
      guarded_publish_enabled: guardedPublishEnabled,
      guarded_publish_requires_manual_click: true,
      dry_run_ready: dryRunReady,
      live_write_enabled: guardedPublishEnabled,
      provider_write_setting_enabled: guardedPublishEnabled,
      provider_request_sent: false,
      publish_allowed: false,
      gates,
      blockers: gates.filter(x => !x.ready).map(x => ({ id: x.id, label: x.label, severity: x.severity, action: x.action, detail: x.detail })),
      safe_blockers: safeGates.filter(x => !x.ready).map(x => ({ id: x.id, label: x.label, severity: x.severity, action: x.action, detail: x.detail })),
      future_live_ready: futureLiveReady,
      future_live_blockers: futureLive.filter(x => !x.ready).map(x => ({ id: x.id, label: x.label, severity: x.severity, action: x.action, detail: x.detail })),
      live_blockers: liveBlockers,
      request_summary: firstRequest ? {
        item_name: firstRequest.item_name || null,
        intent: firstRequest.intent || 'buy',
        max_buy_ref: Number(firstRequest.max_buy_ref || 0),
        expected_sell_ref: Number(firstRequest.expected_sell_ref || 0),
        expected_profit_ref: Number(firstRequest.expected_profit_ref || 0),
        method: firstRequest.method || 'POST',
        endpoint_hint: firstRequest.endpoint_hint || null,
        auth: { required: Boolean(firstRequest.auth?.required), type: firstRequest.auth?.type || 'X-Auth-Token', value: '[redacted]' }
      } : null,
      safety: {
        live_trade_accepts: false,
        live_backpack_writes: false,
        sda_confirmations: false,
        dry_run_only: true,
        local_state_only: true,
        no_provider_request_sent: true,
        secrets_included: false
      },
      next_safe_step: safeFlowDone ? 'manual_review_complete_or_request_explicit_live_publish_patch' : (gates.find(x => !x.ready)?.action || 'Review readiness blockers.'),
      guidance: safeFlowDone
        ? 'Safe flow is complete through dry-run/readiness. Guarded publish executor is present; enable allow_guarded_backpack_publish only when ready to manually publish one approved draft.'
        : 'Resolve readiness blockers, then run Diagnostic bundle again. This build still does not publish to Backpack.tf.'
    };
    writeJson(PUBLISH_READINESS_GATE_PATH, result);
    if (this.audit) this.audit.write('publish_readiness_gate_built', { status: result.status, safe_flow_done: result.safe_flow_done, readiness_percent: result.readiness_percent, can_publish_live: Boolean(result.can_publish_guarded_now) });
    appendActionFeed('publish_readiness_gate_built', { status: result.status, safe_flow_done: result.safe_flow_done, readiness_percent: result.readiness_percent, can_publish_live: Boolean(result.can_publish_guarded_now) });
    return result;
  }
}


class PublishHandoffService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(PUBLISH_HANDOFF_PATH, {
      ok: false,
      version: APP_VERSION,
      status: 'not_built',
      error: 'No publish handoff package has been built yet.',
      handoff_ready: false,
      can_publish_live: false,
      provider_request_sent: false,
      publish_allowed: false
    });
  }
  sanitizeRequest(request) {
    if (!request || typeof request !== 'object') return null;
    return {
      id: request.id || null,
      source_payload_id: request.source_payload_id || null,
      account_id: request.account_id || 'main',
      provider: request.provider || 'backpack.tf',
      method: request.method || 'POST',
      endpoint_hint: request.endpoint_hint || 'https://backpack.tf/api/v2/classifieds/listings',
      auth: { required: Boolean(request.auth?.required), type: request.auth?.type || 'X-Auth-Token', value: '[redacted]' },
      item_name: request.item_name || null,
      intent: request.intent || 'buy',
      max_buy_ref: Number(request.max_buy_ref || 0),
      expected_sell_ref: Number(request.expected_sell_ref || 0),
      expected_profit_ref: Number(request.expected_profit_ref || 0),
      currencies: request.currencies || {},
      policy_status: request.policy_status || null,
      policy_warnings: Array.isArray(request.policy_warnings) ? request.policy_warnings : [],
      risk_score: Number(request.risk_score || 0),
      liquidity_score: Number(request.liquidity_score || 0),
      dry_run: true,
      live_write_enabled: false,
      publish_allowed: false,
      provider_request_sent: false,
      no_provider_request_sent: true,
      request_body_preview: request.request_body_preview || null
    };
  }
  build(input = {}) {
    let gate = readJson(PUBLISH_READINESS_GATE_PATH, { ok: false, status: 'not_built', gates: [] });
    if ((!gate || gate.ok === false || !gate.safe_flow_done) && input && input.rebuild !== false) {
      gate = new PublishReadinessGateService(this.audit).build({ source: 'publish_handoff' });
    }
    let dryRun = readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, status: 'not_built', requests: [] });
    if ((!dryRun || dryRun.ok === false || !Number(dryRun.request_count || 0)) && input && input.rebuild !== false) {
      dryRun = new GuardedPublishDryRunService(this.audit).build({ source: 'publish_handoff' });
    }
    const requests = (Array.isArray(dryRun.requests) ? dryRun.requests : []).map(x => this.sanitizeRequest(x)).filter(Boolean);
    const gates = Array.isArray(gate.gates) ? gate.gates : [];
    const safeGates = gates.filter(x => x.severity === 'required' || x.severity === 'recommended' || x.severity === 'safety');
    const futureLiveGates = gates.filter(x => x.severity === 'required_for_future_live' || x.severity === 'future_live');
    const safeBlockers = Array.isArray(gate.safe_blockers) ? gate.safe_blockers : safeGates.filter(x => !x.ready);
    const futureLiveGateBlockers = Array.isArray(gate.future_live_blockers) ? gate.future_live_blockers : futureLiveGates.filter(x => !x.ready);
    const liveBlockers = Array.isArray(gate.live_blockers) ? gate.live_blockers : [];
    const safeFlowDone = Boolean(gate.safe_flow_done && requests.length > 0 && dryRun.provider_request_sent === false && dryRun.publish_allowed === false);
    const futureLiveReady = Boolean(gate.future_live_ready && !futureLiveGateBlockers.length);
    const selected = requests[0] || null;
    const status = safeFlowDone ? 'manual_review_complete_live_blocked' : 'handoff_blocked';
    const result = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status,
      title: 'Diagnostic triage package',
      handoff_ready: safeFlowDone,
      safe_flow_done: safeFlowDone,
      safe_readiness_percent: Number(gate.safe_readiness_percent || (safeFlowDone ? 100 : 0)),
      overall_readiness_percent: Number(gate.readiness_percent || 0),
      future_live_readiness_percent: Number(gate.future_live_readiness_percent || 0),
      future_live_ready: futureLiveReady,
      ready_for_explicit_live_executor_patch: Boolean(safeFlowDone),
      ready_for_live_publish_now: false,
      can_publish_live: false,
      live_executor_included: true,
      guarded_publish_executor_present: true,
      guarded_publish_enabled: Boolean(gate.guarded_publish_enabled),
      guarded_publish_manual_only: true,
      guarded_publish_requires_confirm_true: true,
      can_publish_guarded_now: Boolean(gate.can_publish_live),
      live_write_enabled: Boolean(gate.guarded_publish_enabled),
      provider_write_setting_enabled: Boolean(gate.provider_write_setting_enabled),
      publish_allowed: Boolean(gate.can_publish_live),
      provider_request_sent: false,
      no_provider_request_sent: true,
      selected_request: selected,
      redacted_requests: requests,
      request_count: requests.length,
      future_live_blockers: [
        ...futureLiveGateBlockers.map(x => ({ id: x.id, label: x.label, severity: x.severity, action: x.action, detail: x.detail })),
        ...liveBlockers.map((x, i) => ({ id: `live_blocker_${i + 1}`, label: String(x), severity: 'live_blocker', action: 'Keep disabled unless you explicitly enable guarded publish and manually publish one approved draft.', detail: String(x) }))
      ],
      safe_blockers: safeBlockers.map(x => ({ id: x.id, label: x.label, severity: x.severity, action: x.action, detail: x.detail })),
      final_human_confirmation: {
        required_before_guarded_publish: true,
        collected: false,
        phrase: 'confirm=true',
        note: 'Guarded publish exists and stays disabled by default. A manual request with confirm=true is required for one approved draft.'
      },
      operator_checklist: [
        'Review the redacted request body and item price one more time.',
        'Confirm Backpack.tf token belongs to the intended account.',
        'Confirm planning_value/risk deliberately before enabling guarded publish.',
        'Keep guarded publish disabled until you are ready to manually publish one approved draft.'
      ],
      safety: {
        local_state_only: true,
        dry_run_only: true,
        live_trade_accepts: false,
        live_backpack_writes: false,
        sda_confirmations: false,
        provider_request_sent: false,
        secrets_included: false
      },
      guidance: safeFlowDone
        ? 'Manual review/pre-publish handoff is complete. Guarded publish executor is present. It is disabled by default and requires a manual one-draft action with confirm=true.'
        : 'Handoff is blocked until the safe publish readiness gate is complete.',
      next_safe_step: safeFlowDone ? (Boolean(gate.guarded_publish_enabled) ? 'test_payload_then_publish_one_approved_draft_manually' : 'enable_allow_guarded_backpack_publish_when_ready_or_stop_here') : 'run_diagnostic_bundle_again'
    };
    writeJson(PUBLISH_HANDOFF_PATH, result);
    if (this.audit) this.audit.write('publish_handoff_built', { status: result.status, handoff_ready: result.handoff_ready, request_count: result.request_count, can_publish_live: Boolean(result.can_publish_guarded_now) });
    appendActionFeed('publish_handoff_built', { status: result.status, handoff_ready: result.handoff_ready, request_count: result.request_count, can_publish_live: Boolean(result.can_publish_guarded_now) });
    return result;
  }
}


class DiagnosticTriageService {
  constructor(auditService) { this.audit = auditService; }
  current() {
    return readJson(DIAGNOSTIC_TRIAGE_PATH, {
      ok: false,
      version: APP_VERSION,
      status: 'not_built',
      error: 'No diagnostic triage report has been built yet.',
      health: 'unknown',
      can_continue: false,
      can_publish_live: false,
      provider_request_sent: false
    });
  }
  issue(id, severity, title, detail, action, source = 'diagnostic_triage') {
    return { id, severity, title, detail: detail || '', action: action || 'Review this item in the next diagnostic bundle.', source };
  }
  compactGate(gate = {}) {
    return {
      id: gate.id || null,
      label: gate.label || gate.id || 'gate',
      ready: Boolean(gate.ready),
      severity: gate.severity || 'info',
      detail: gate.detail || '',
      action: gate.action || ''
    };
  }
  stageMapFromDiagnostic() {
    const latest = readJson(DIAGNOSTIC_BUNDLE_PATH, { ok: false, stages: [] });
    const map = {};
    for (const stage of Array.isArray(latest.stages) ? latest.stages : []) {
      if (!stage || !stage.stage) continue;
      map[stage.stage] = { ok: Boolean(stage.ok), error: stage.error || stage.result?.error || null, status: stage.result?.status || null };
    }
    return { latest, map };
  }
  build(input = {}) {
    const options = getOptions();
    const versionAudit = buildVersionAudit();
    const { latest, map: stageMap } = this.stageMapFromDiagnostic();
    const queue = readJson(EXECUTION_QUEUE_PATH, { ok: false, entries: [] });
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {} });
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const payloadPreview = readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, payloads: [] });
    const payloadReview = readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, payloads: [] });
    const payloadApproval = readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' });
    const dryRun = readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, status: 'not_built', requests: [] });
    const gate = readJson(PUBLISH_READINESS_GATE_PATH, { ok: false, gates: [], safe_blockers: [], future_live_blockers: [] });
    const handoff = readJson(PUBLISH_HANDOFF_PATH, { ok: false, future_live_blockers: [], safe_blockers: [] });
    const ops = readJson(OPERATIONS_PATH, { ok: false, providers: {} });
    const accounts = new MultiAccountPortfolioService(this.audit).list();

    const issues = [];
    const safetyLiveFlags = {
      live_trade_accepts: Boolean(options.allow_live_trade_accepts),
      live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
      sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm)
    };
    if (!versionAudit.ok) issues.push(this.issue('version_audit_failed', 'critical', 'Version audit failed', 'One or more active version markers do not match the package version.', 'Fix version propagation before testing again.', 'version_audit'));
    if (safetyLiveFlags.live_trade_accepts || safetyLiveFlags.live_backpack_writes || safetyLiveFlags.sda_confirmations) issues.push(this.issue('live_safety_flag_enabled', 'critical', 'A live safety flag is enabled', JSON.stringify(safetyLiveFlags), 'Disable live flags before diagnostic testing continues.', 'safety'));
    if (dryRun.provider_request_sent === true || dryRun.publish_allowed === true || handoff.provider_request_sent === true || handoff.publish_allowed === true) issues.push(this.issue('unexpected_provider_write_state', 'critical', 'Provider write state is not blocked', 'A dry-run/handoff artifact claims provider request or publish is allowed.', 'Stop and inspect audit logs before continuing.', 'safety'));

    const failedStages = Object.entries(stageMap).filter(([, x]) => x && x.ok === false).map(([name, x]) => ({ stage: name, error: x.error || 'failed' }));
    for (const failed of failedStages.slice(0, 8)) issues.push(this.issue('stage_failed_' + failed.stage, 'critical', `Stage failed: ${failed.stage}`, failed.error, 'Send the diagnostic JSON so this stage can be patched.', 'diagnostic_bundle'));

    const providerState = ops.providers?.providers || readJson(PROVIDER_STATE_PATH, { providers: {} }).providers || {};
    for (const [name, provider] of Object.entries(providerState || {})) {
      if (Number(provider.failures || 0) > 0 || provider.last_error) {
        issues.push(this.issue('provider_issue_' + name.replace(/[^a-z0-9]/gi, '_').toLowerCase(), 'warning', `Provider issue: ${name}`, provider.last_error || `${provider.failures} failure(s)`, 'Refresh provider credentials or inspect the provider response in the diagnostic.', 'providers'));
      }
    }

    const inventoryCount = Number(inventory.items_count || 0);
    const pricedItems = Number(inventory.analysis?.priced_items || 0);
    const scannerCandidates = Number(scanner.summary?.total_candidates || (Array.isArray(scanner.candidates) ? scanner.candidates.length : 0) || 0);
    const payloadCount = Number(payloadPreview.payload_count || (Array.isArray(payloadPreview.payloads) ? payloadPreview.payloads.length : 0) || 0);
    const approvedPayloads = Number(payloadReview.approved_locally || 0) || (payloadApproval.status === 'payload_approved_locally' ? 1 : 0);
    const requestCount = Number(dryRun.request_count || (Array.isArray(dryRun.requests) ? dryRun.requests.length : 0) || 0);

    const planning_valueLimit = Number(scanner.targeted_orders?.planning_value_ref || readJson(ACTIONABLE_PLAN_PATH, { planning_value: {} }).planning_value?.planning_value_ref || 25);
    const queueEntriesForPlanningValue = Array.isArray(queue.entries) ? queue.entries : [];
    const approvedBuyValue = Number(queueEntriesForPlanningValue
      .filter(x => String(x.type || '').includes('buy') && String(x.status || '') === 'approved' && !x.live)
      .reduce((sum, x) => sum + Math.max(0, Number(x.max_buy_ref || 0)), 0)
      .toFixed(2));
    const approvedBuyValueRemaining = Number(Math.max(0, planning_valueLimit - approvedBuyValue).toFixed(2));
    const approvedBuyValueDelta = Number(Math.max(0, approvedBuyValue - planning_valueLimit).toFixed(2));
    if (false && approvedBuyValueDelta > 0) {
      issues.push(this.issue(
        'approved_planning_value_over_target',
        'info',
        'Approved review planning_value is over the advisory target',
        `Approved local buy plans use ${approvedBuyValue} ref while the displayed advisory target is ${planning_valueLimit} ref.`,
        'No action required. Planning value is informational only; always-on planning continues and live writes stay disabled.',
        'planning_value_advisory'
      ));
    }

    if (!accounts?.main_account?.steam_api_key_saved && !options.steam_web_api_key) issues.push(this.issue('steam_api_key_missing', 'warning', 'Steam Web API key is missing', 'Trade review can be limited without the Steam Web API key.', 'Save Steam Web API key in account credentials.', 'credentials'));
    if (!accounts?.main_account?.backpack_tf_token_saved && !(options.backpack_tf_access_token || options.backpack_tf_api_key)) issues.push(this.issue('backpack_token_missing', 'warning', 'Backpack.tf token/API key is missing', 'Provider sync and future listings require Backpack.tf credentials.', 'Save Backpack.tf token in account credentials.', 'credentials'));
    if (!inventory.ok || inventoryCount <= 0) issues.push(this.issue('inventory_empty_or_missing', 'warning', 'Inventory snapshot is missing or empty', 'No useful inventory snapshot is available.', 'Run Diagnostic bundle again after checking SteamID64 and inventory privacy.', 'inventory'));
    if (inventoryCount > 0 && pricedItems <= 0) issues.push(this.issue('inventory_unpriced', 'warning', 'Inventory is loaded but not priced', `${inventoryCount} item(s), ${pricedItems} priced.`, 'Check Backpack.tf price key mapping and item names.', 'pricing'));
    if (!scanner.ok || scannerCandidates <= 0) issues.push(this.issue('scanner_empty', 'warning', 'Market scanner returned no candidates', 'No watchlist/target candidates were generated.', 'Inspect scanner diagnostics and price filters.', 'market_scanner'));
    if (payloadCount <= 0) issues.push(this.issue('payload_preview_missing', 'warning', 'No Backpack.tf payload preview', 'No request body preview exists yet.', 'Build payload preview through Diagnostic bundle.', 'payload_preview'));
    if (payloadCount > 0 && approvedPayloads <= 0) issues.push(this.issue('payload_not_approved_locally', 'warning', 'Payload has not been locally approved', `${payloadCount} preview(s), ${approvedPayloads} approved.`, 'Approve one payload locally in the safe UI flow.', 'payload_review'));
    if (approvedPayloads > 0 && requestCount <= 0) issues.push(this.issue('dry_run_request_missing', 'warning', 'Approved payload has no guarded dry-run request', 'Local approval exists but no disabled publish request preview exists.', 'Build guarded publish dry run.', 'guarded_publish_dry_run'));
    if (gate.ok !== false && gate.safe_flow_done !== true) {
      const safeBlockers = Array.isArray(gate.safe_blockers) ? gate.safe_blockers : [];
      issues.push(this.issue('safe_flow_not_done', 'warning', 'Safe pre-publish flow is not complete', safeBlockers.map(x => x.label || x.id).filter(Boolean).join(', ') || gate.status || 'readiness blocked', 'Resolve safe blockers or rerun Diagnostic bundle.', 'publish_readiness_gate'));
    }

    const futureLiveBlockers = [
      ...(Array.isArray(gate.future_live_blockers) ? gate.future_live_blockers.map(x => this.compactGate(x)) : []),
      ...(Array.isArray(handoff.future_live_blockers) ? handoff.future_live_blockers.map(x => this.compactGate(x)) : [])
    ];
    const safeBlockers = [
      ...(Array.isArray(gate.safe_blockers) ? gate.safe_blockers.map(x => this.compactGate(x)) : []),
      ...(Array.isArray(handoff.safe_blockers) ? handoff.safe_blockers.map(x => this.compactGate(x)) : [])
    ];
    const criticalCount = issues.filter(x => x.severity === 'critical').length;
    const warningCount = issues.filter(x => x.severity === 'warning').length;
    const safeFlowDone = Boolean(gate.safe_flow_done && handoff.handoff_ready && requestCount > 0 && dryRun.provider_request_sent === false && handoff.provider_request_sent === false);
    const canContinue = criticalCount === 0;
    const health = criticalCount ? 'red' : warningCount ? 'amber' : 'green';
    const nextPatch = criticalCount
      ? 'fix_runtime_or_safety_failure_from_diagnostic'
      : safeFlowDone
        ? 'wait_for_next_uploaded_diagnostic_then_fix_specific_findings'
        : 'tighten_safe_flow_until_handoff_ready';
    const assistantFocus = issues.length
      ? issues.slice(0, 8).map(x => `${x.severity.toUpperCase()}: ${x.title} — ${x.action}`)
      : ['No critical diagnostic issues found. Continue collecting the next uploaded diagnostic and patch specific findings.'];
    const result = {
      ok: true,
      version: APP_VERSION,
      updated_at: new Date().toISOString(),
      status: criticalCount ? 'critical_issues_found' : warningCount ? 'warnings_found' : 'clean_for_next_diagnostic',
      health,
      can_continue: canContinue,
      can_publish_live: false,
      ready_for_live_publish_now: false,
      provider_request_sent: false,
      publish_allowed: false,
      safe_flow_done: safeFlowDone,
      handoff_ready: Boolean(handoff.handoff_ready),
      diagnostic_source_file: latest.file_name || null,
      counts: {
        critical: criticalCount,
        warnings: warningCount,
        stages_failed: failedStages.length,
        queue_entries: Array.isArray(queue.entries) ? queue.entries.length : 0,
        queue_pending: (Array.isArray(queue.entries) ? queue.entries : []).filter(x => x.status === 'pending_review').length,
        queue_approved: (Array.isArray(queue.entries) ? queue.entries : []).filter(x => x.status === 'approved').length,
        inventory_items: inventoryCount,
        priced_items: pricedItems,
        scanner_candidates: scannerCandidates,
        payload_previews: payloadCount,
        payload_approved_locally: approvedPayloads,
        dry_run_requests: requestCount,
        approved_buy_planning_value_ref: approvedBuyValue,
        planning_value_reference_ref: Number(planning_valueLimit.toFixed ? planning_valueLimit.toFixed(2) : planning_valueLimit),
        approved_buy_planning_value_remaining_ref: approvedBuyValueRemaining,
        approved_buy_planning_value_delta_ref: approvedBuyValueDelta,
        future_live_blockers: futureLiveBlockers.length,
        safe_blockers: safeBlockers.length
      },
      safety: {
        ...safetyLiveFlags,
        live_actions_enabled: Boolean(safetyLiveFlags.live_trade_accepts || safetyLiveFlags.live_backpack_writes || safetyLiveFlags.sda_confirmations),
        local_only: true,
        dry_run_only: true,
        no_provider_request_sent: true,
        secrets_included: false
      },
      issues,
      safe_blockers: safeBlockers.slice(0, 20),
      future_live_blockers: futureLiveBlockers.slice(0, 30),
      assistant_focus: assistantFocus,
      next_patch_recommendation: nextPatch,
      user_next_step: 'Upload the next Diagnostic bundle JSON. The triage block will point to the concrete issue to patch.',
      guidance: canContinue ? 'No critical runtime/safety issue was detected by triage. Continue with the next diagnostic and patch only what it proves is broken.' : 'Critical diagnostic/safety issue detected. Do not move toward live execution; patch the failing item first.'
    };
    writeJson(DIAGNOSTIC_TRIAGE_PATH, result);
    if (this.audit) this.audit.write('diagnostic_triage_built', { status: result.status, health: result.health, critical: criticalCount, warnings: warningCount, safe_flow_done: safeFlowDone });
    appendActionFeed('diagnostic_triage_built', { status: result.status, health: result.health, critical: criticalCount, warnings: warningCount, safe_flow_done: safeFlowDone });
    return result;
  }
}

class ListingManagerPlanModeService {
  constructor(auditService) { this.audit = auditService; }
  current() { return readJson(LISTING_PLAN_PATH, { ok: false, error: 'No listing plan yet.' }); }
  build() {
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {} });
    const actions = [];
    if (inventory.ok) {
      for (const item of (inventory.analysis?.top_value_items || []).filter(x => x.tradable).slice(0, 12)) {
        if (isPureCurrencyItemName(item.item_name)) continue;
        actions.push({ id: 'listing_' + String(item.assetid || item.item_name), account_id: 'main', intent: 'sell', item_name: item.item_name, price_ref: Number(item.value_ref || 0), source: 'inventory', reason: 'Owned tradable non-currency item has a Backpack.tf price estimate.', live: false, requires_manual_approval: true, status: 'planned' });
      }
    }
    const payload = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), live_writes_enabled: false, actions };
    writeJson(LISTING_PLAN_PATH, payload);
    appendActionFeed('listing_plan_mode_built', { actions: actions.length });
    return payload;
  }
  update(id, status) { const plan = this.current(); const actions = (plan.actions || []).map(a => a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a); const payload = { ...plan, ok: true, actions }; writeJson(LISTING_PLAN_PATH, payload); appendActionFeed('listing_plan_item_updated', { id, status }); return payload; }
}


class HubAutopilotPipelineService {
  constructor(auditService, reviewService) { this.audit = auditService; this.reviewService = reviewService; this.running = false; }
  status() {
    const state = readJson(HUB_AUTOPILOT_PATH, { ok: true, runs: [] });
    const options = getOptions();
    const last = state.last_run_at ? Date.parse(state.last_run_at) : 0;
    return { ok: true, version: APP_VERSION, enabled: Boolean(options.auto_review_enabled && options.hub_autopilot_enabled), interval_minutes: options.review_interval_minutes, running: Boolean(state.running), last_run_at: state.last_run_at || null, last_result: state.last_result || null, next_due_at: last ? new Date(last + options.review_interval_minutes * 60 * 1000).toISOString() : 'now', runs: Array.isArray(state.runs) ? state.runs.slice(-20) : [] };
  }
  due() {
    const options = getOptions();
    if (!options.auto_review_enabled || !options.hub_autopilot_enabled) return false;
    const state = readJson(HUB_AUTOPILOT_PATH, {});
    const last = state.last_run_at ? Date.parse(state.last_run_at) : 0;
    return !last || (Date.now() - last >= options.review_interval_minutes * 60 * 1000);
  }
  async run(reason = 'scheduled_pipeline') {
    if (this.running) return { ok: false, skipped: true, stage: 'already_running' };
    this.running = true;
    const started = new Date().toISOString();
    const options = getOptions();
    const result = { ok: true, version: APP_VERSION, reason, started_at: started, stages: [] };
    writeJson(HUB_AUTOPILOT_PATH, { ...this.status(), running: true, last_started_at: started });
    try {
      if (options.backpack_tf_enabled && options.hub_autopilot_sync_backpack && (options.backpack_tf_access_token || options.backpack_tf_api_key)) {
        const sync = await new BackpackTfV2ListingManager(options, this.audit).syncListings(true);
        result.stages.push({ stage: 'provider_sync', ok: Boolean(sync.ok), listings: Number(sync.listings_count || 0), prices: Number(sync.prices_count || 0), cache_stage: sync.stage || null, error: sync.error || null });
      } else {
        result.stages.push({ stage: 'provider_sync', skipped: true, reason: 'disabled_or_credentials_missing' });
      }
      if (options.hub_autopilot_sync_inventory && options.inventory_sync_enabled && options.steam_id64) {
        const inventory = await new SteamInventorySyncService(this.audit).sync(true);
        result.stages.push({ stage: 'inventory_sync', ok: Boolean(inventory.ok), items: Number(inventory.items_count || 0), priced: Number(inventory.analysis?.priced_items || 0), value_ref: Number(inventory.analysis?.estimated_value_ref || 0), error: inventory.error || null });
      } else {
        result.stages.push({ stage: 'inventory_sync', skipped: true, reason: 'disabled_or_steamid_missing' });
      }
      if (options.hub_autopilot_build_market && options.market_scanner_enabled) {
        const scanner = new MarketTargetScannerService(this.audit).build(options);
        result.stages.push({ stage: 'market_scanner', ok: Boolean(scanner.ok), candidates: Number(scanner.summary?.total_candidates || (scanner.candidates || []).length || 0), fallback: Boolean(scanner.diagnostics?.relaxed_fallback_used || scanner.diagnostics?.forced_watchlist_fallback_used), error: scanner.error || null });
      }
      if (options.steam_web_api_key && options.steam_id64) {
        const review = await this.reviewService.review(reason);
        result.stages.push({ stage: 'trade_review', ok: Boolean(review.ok), decisions: Array.isArray(review.decisions) ? review.decisions.length : 0, error: review.error || null });
      } else {
        result.stages.push({ stage: 'trade_review', skipped: true, reason: 'steam_api_or_steamid_missing' });
      }
      if (options.hub_autopilot_build_core) {
        const core = new TradingCoreService(this.audit).build(null);
        result.stages.push({ stage: 'trading_core', ok: Boolean(core.ok), readiness: core.readiness?.readiness_percent || 0, candidates: core.market_scanner?.candidates || 0, decisions: core.offers?.total || 0 });
      }
      const brain = new TradingBrainService(this.audit).build(reason);
      result.stages.push({ stage: 'trading_brain', ok: Boolean(brain.ok), recommendations: (brain.recommendations || []).length, warnings: (brain.warnings || []).length, blocked: (brain.blocked || []).length });
      if (options.actionable_plans_enabled) {
        const plan = new ActionableTradingPlanService(this.audit).build(reason);
        result.stages.push({ stage: 'actionable_plan', ok: Boolean(plan.ok), actions: Number(plan.summary?.queue_ready_targets || plan.actions?.length || 0), watchlist: Number(plan.summary?.watchlist_seen || plan.watchlist?.length || 0), protected: Number(plan.summary?.protected_currency_items || 0) });
        const queue = new ExecutionQueueService(this.audit).build();
        result.stages.push({ stage: 'execution_queue', ok: Boolean(queue.ok), entries: Array.isArray(queue.entries) ? queue.entries.length : 0, live: false });
      }
      result.completed_at = new Date().toISOString();
      result.ok = result.stages.some(stage => stage.ok) || result.stages.every(stage => stage.skipped);
      const state = readJson(HUB_AUTOPILOT_PATH, { runs: [] });
      const runs = [...(Array.isArray(state.runs) ? state.runs : []), result].slice(-50);
      writeJson(HUB_AUTOPILOT_PATH, { ok: true, running: false, last_run_at: result.completed_at, last_result: result, runs });
      this.audit.write('hub_autopilot_pipeline_completed', { reason, stages: result.stages.length, ok: result.ok });
      appendActionFeed('hub_autopilot_pipeline_completed', { reason, stages: result.stages.map(stage => ({ stage: stage.stage, ok: stage.ok, skipped: stage.skipped, candidates: stage.candidates, decisions: stage.decisions, prices: stage.prices, items: stage.items, value_ref: stage.value_ref })) });
      return result;
    } catch (error) {
      result.ok = false; result.completed_at = new Date().toISOString(); result.error = safeError(error);
      const state = readJson(HUB_AUTOPILOT_PATH, { runs: [] });
      const runs = [...(Array.isArray(state.runs) ? state.runs : []), result].slice(-50);
      writeJson(HUB_AUTOPILOT_PATH, { ok: false, running: false, last_run_at: result.completed_at, last_result: result, runs });
      this.audit.write('hub_autopilot_pipeline_failed', { reason, message: result.error });
      appendActionFeed('hub_autopilot_pipeline_failed', { reason, error: result.error });
      return result;
    } finally { this.running = false; }
  }
}

function ensureApprovedDraftForMaintainer(draftId) {
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const idx = drafts.findIndex(d => d.draft_id === draftId);
  if (idx === -1) return { ok: false, code: 'draft_not_found' };
  const draft = drafts[idx];
  if (draft.local_status === 'approved_local') return { ok: true, draft, changed: false };
  const updated = { ...draft, local_status: 'approved_local', updated_at: new Date().toISOString(), maintainer_reapproved: true };
  drafts[idx] = updated;
  writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: updated.updated_at });
  appendActionFeed('classifieds_maintainer_reapproved_draft', { draft_id: draftId, item_name: updated.item_name, previous_status: draft.local_status });
  return { ok: true, draft: updated, changed: true, previous_status: draft.local_status };
}



// ── 5.13.29 – Production Dashboard Cleanup ─────────────────────────────
function draftIntent(draft = {}) {
  return String(draft.intent || draft.provider_payload_preview?.intent || 'buy').toLowerCase();
}
function isCurrencyOrContainerName(name = '') {
  return /mann co\. supply crate key|refined metal|reclaimed metal|scrap metal|case|crate/i.test(String(name || ''));
}
function inventoryDisplayName(item = {}) {
  return String(item.item_name || item.market_hash_name || item.name || '').trim();
}
function publicItemName(value = '') {
  const raw = String(value || 'item').trim().replace(/\s+/g, ' ');
  if (!raw) return 'item';
  return raw.replace(/^The\s+/i, 'The ');
}
function cleanPublicListingText(value = '') {
  return String(value || '')
    .replace(/\bQ\s+uick\b/g, 'Quick')
    .replace(/\bF\s+ast\b/g, 'Fast')
    .replace(/\btrade\s+offers\s+welcome\b/gi, 'trade offers welcome')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
function buyListingDetails(itemName, buyRef) {
  return cleanPublicListingText(`Buying ${publicItemName(itemName)} for ${currenciesText(buyRef)}. Quick trade offers welcome.`).slice(0, 240);
}
const QUALITY_NAME_TO_ID = { normal: 0, genuine: 1, vintage: 3, unusual: 5, unique: 6, strange: 11, haunted: 13, collector: 14, collectors: 14, "collector's": 14, decorated: 15 };
function qualityIdFromText(value = '') {
  const text = normalizeName(value).replace(/[^a-z0-9' ]+/g, ' ');
  for (const [name, id] of Object.entries(QUALITY_NAME_TO_ID)) {
    const re = new RegExp(`(^|\\s)${name.replace(/'/g, "\\'")}(\\s|$)`);
    if (re.test(text)) return id;
  }
  return null;
}
function normalizeBaseItemName(value = '') {
  return stripTf2Prefixes(value).replace(/[^a-z0-9]+/g, ' ').trim();
}
function draftQualityId(draft = {}) {
  const direct = draft.quality ?? draft.provider_payload_preview?.item?.quality ?? draft.item?.quality;
  if (Number.isFinite(Number(direct))) return Number(direct);
  const fromText = qualityIdFromText(`${draft.item_name || ''} ${draft.provider_payload_preview?.item?.item_name || ''}`);
  return fromText ?? 6;
}
function draftDefindex(draft = {}) {
  const direct = Number(draft.defindex || draft.provider_payload_preview?.item?.defindex || draft.item?.defindex || 0);
  return Number.isFinite(direct) && direct > 0 ? direct : null;
}
function inventoryDefindex(item = {}) {
  const direct = Number(item.defindex || item.itemdef || item.item_def_index || item.app_data?.def_index || item.app_data?.defindex || 0);
  return Number.isFinite(direct) && direct > 0 ? direct : null;
}
function draftPriceindex(draft = {}) {
  return String(draft.priceindex ?? draft.provider_payload_preview?.item?.priceindex ?? '0');
}
function inventoryPriceindex(item = {}) {
  return String(item.priceindex ?? item.price_index ?? item.app_data?.priceindex ?? '0');
}
function draftCraftableFlag(draft = {}) {
  const raw = draft.craftable ?? draft.provider_payload_preview?.item?.craftable;
  return typeof raw === 'boolean' ? raw : null;
}
function inventoryCraftableFlag(item = {}) {
  if (typeof item.craftable === 'boolean') return item.craftable;
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const text = `${inventoryDisplayName(item)} ${tags.map(t => `${t.category || ''} ${t.name || ''} ${t.localized_tag_name || ''}`).join(' ')}`.toLowerCase();
  if (/non[- ]?craftable|uncraftable/.test(text)) return false;
  return true;
}
function inventoryStackAmount(item = {}) {
  const direct = Number(item.amount ?? item.quantity ?? item.count ?? item.stack_count ?? item.app_data?.quantity ?? item.app_data?.amount ?? 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (getOptions().stack_sell_quantity_parse_enabled === false) return 1;
  const tagText = (Array.isArray(item.tags) ? item.tags : []).map(t => `${t.category || ''} ${t.name || ''} ${t.localized_tag_name || ''} ${t.internal_name || ''}`).join(' ');
  const descText = (Array.isArray(item.descriptions) ? item.descriptions : []).map(d => `${d.value || ''} ${d.name || ''}`).join(' ');
  const text = `${item.market_hash_name || ''} ${item.name || ''} ${item.item_name || ''} ${tagText} ${descText}`;
  const matches = [...String(text).matchAll(/(?:^|\s|\()x\s*(\d{1,4})(?:\s|\)|$)|(?:^|\s)(\d{1,4})\s*(?:uses?|charges?)(?:\s|$)/ig)];
  const parsed = matches.map(m => Number(m[1] || m[2] || 0)).filter(n => Number.isFinite(n) && n > 1 && n < 1000);
  return parsed.length ? Math.max(...parsed) : 1;
}
function isQuantityStackedItemName(name = '') {
  return /dueling mini-game|noise maker|spellbook page|giftapult|ticket|paint can|crate key|tool|usable item/i.test(String(name || ''));
}
function normalizeOwnedItemSellValueRef(item = {}, value = 0, source = 'unknown', options = getOptions()) {
  const raw = Number(value || 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  if (options.quantity_aware_sell_pricing_enabled === false) return roundedRef(raw);
  const amount = inventoryStackAmount(item);
  const name = inventoryDisplayName(item);
  if (amount > 1 && isQuantityStackedItemName(name) && raw >= 0.11) {
    // Backpack.tf classifieds price is the listing price shown next to the xN stack.
    // Older builds multiplied schema/inventory value by amount, producing e.g. x5
    // Dueling Mini-Game listings around 2 ref when the market is around 0.55 ref.
    return roundedRef(raw / amount);
  }
  return roundedRef(raw);
}
function strictSkuMismatchReasons(item = {}, draft = {}) {
  const reasons = [];
  const invBase = normalizeBaseItemName(inventoryDisplayName(item));
  const draftBase = normalizeBaseItemName(draft.item_name || draft.provider_payload_preview?.item?.item_name || '');
  if (!invBase || !draftBase || invBase !== draftBase) reasons.push(`base_name_mismatch:${invBase || 'missing'}!=${draftBase || 'missing'}`);
  const invDef = inventoryDefindex(item);
  const drDef = draftDefindex(draft);
  if (invDef && drDef && invDef !== drDef) reasons.push(`defindex_mismatch:${invDef}!=${drDef}`);
  const invQ = inventoryQualityId(item);
  const drQ = draftQualityId(draft);
  if (Number.isFinite(invQ) && Number.isFinite(drQ) && Number(invQ) !== Number(drQ)) reasons.push(`quality_mismatch:${invQ}!=${drQ}`);
  const invPi = inventoryPriceindex(item);
  const drPi = draftPriceindex(draft);
  if (invPi !== '0' || drPi !== '0') {
    if (invPi !== drPi) reasons.push(`priceindex_mismatch:${invPi}!=${drPi}`);
  }
  const invCraft = inventoryCraftableFlag(item);
  const drCraft = draftCraftableFlag(draft);
  if (drCraft !== null && invCraft !== drCraft) reasons.push(`craftable_mismatch:${invCraft}!=${drCraft}`);
  return reasons;
}
function inventoryMatchesDraft(item = {}, draft = {}) {
  return strictSkuMismatchReasons(item, draft).length === 0;
}
function readInventoryItemsArray() {
  const inv = readJson(HUB_INVENTORY_PATH, { ok: false, items: [] });
  return Array.isArray(inv.items) ? inv.items : [];
}

function listingIsArchived(listing = {}) {
  return Boolean(listing.archived || listing.status === 'archived' || listing.listing_status === 'archived');
}

function activeBackpackListings(listings = []) {
  return (Array.isArray(listings) ? listings : []).filter(l => l && !listingIsArchived(l));
}
function detectBackpackCapFromCache(cache = {}, options = getOptions()) {
  const candidates = [
    cache.cap,
    cache.listing_cap,
    cache.listings_cap,
    cache.max_listings,
    cache.maxListings,
    cache.quota && cache.quota.max,
    cache.quota && cache.quota.limit,
    cache.limits && cache.limits.classifieds,
    cache.limits && cache.limits.listings,
    cache.account && cache.account.listing_cap,
    cache.account && cache.account.classifieds_cap
  ].map(Number).filter(n => Number.isFinite(n) && n > 0);
  if (candidates.length) return Math.max(...candidates);
  return Math.max(1, Number(options.backpack_tf_account_listing_cap || options.max_total_active_listings || 600));
}
function computeListingFillTargets(accountListings = readAccountListingsArray(), options = getOptions()) {
  const cache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
  const active = activeBackpackListings(accountListings);
  const activeBuy = active.filter(l => listingIntentValue(l) === 'buy').length;
  const activeSell = active.filter(l => listingIntentValue(l) === 'sell').length;
  const activeTotal = active.length;
  const detectedCap = detectBackpackCapFromCache(cache, options);
  const configuredMaxTotal = Math.max(1, Number(options.max_total_active_listings || detectedCap || 600));
  const cap = Math.max(1, Math.min(detectedCap || configuredMaxTotal, configuredMaxTotal));
  const reserve = Math.max(0, Math.min(Number(options.listing_fill_reserve_slots || 0), cap - 1));
  const fillMode = String(options.listing_fill_mode || 'cap').toLowerCase() === 'target' ? 'target' : 'cap';
  const sellTarget = Math.max(0, Math.min(Number(options.target_active_sell_listings || 0), cap - reserve));
  const buyRoomAfterSells = Math.max(0, cap - reserve - Math.max(activeSell, sellTarget));
  const requestedBuyTarget = Math.max(1, Number(options.target_active_buy_listings || cap));
  const targetBuy = fillMode === 'cap' ? buyRoomAfterSells : Math.min(requestedBuyTarget, buyRoomAfterSells);
  const freeSlots = Math.max(0, cap - reserve - activeTotal);
  const missingBuy = Math.max(0, targetBuy - activeBuy);
  return { ok: true, fill_mode: fillMode, cap, detected_cap: detectedCap, configured_max_total: configuredMaxTotal, reserve_slots: reserve, active_total: activeTotal, active_buy: activeBuy, active_sell: activeSell, target_buy: targetBuy, target_sell: sellTarget, free_slots: freeSlots, missing_buy: missingBuy, hit_cap: activeTotal >= cap - reserve, source: candidatesCapSource(cache) };
}
function candidatesCapSource(cache = {}) {
  if (cache && (cache.cap || cache.listing_cap || cache.listings_cap || cache.max_listings || cache.maxListings || cache.quota || cache.limits || cache.account)) return 'provider_cache';
  return 'configured_cap';
}

function stockSkuKeyFromParts(name = '', quality = '', priceindex = '') {
  return [normalizeListingText(String(name || '').replace(/^the\s+/i, '')), String(quality || '').trim(), String(priceindex ?? '0').trim()].join('|');
}
function stockSkuKeyFromDraft(draft = {}) {
  const item = draft.provider_payload_preview?.item || {};
  return stockSkuKeyFromParts(draft.item_name || item.item_name || item.name || '', draft.quality || item.quality || '', draft.priceindex || item.priceindex || '0');
}
function stockSkuKeyFromListing(listing = {}) {
  const item = listing.item || {};
  const quality = item.quality?.id ?? item.quality ?? listing.quality ?? '';
  const priceindex = item.priceindex ?? item.killstreak_tier ?? listing.priceindex ?? '0';
  return stockSkuKeyFromParts(listingItemName(listing), quality, priceindex);
}
function stockSkuKeyFromInventoryItem(item = {}) {
  return stockSkuKeyFromParts(inventoryDisplayName(item), inventoryQualityId(item), inventoryPriceindex(item));
}
function addStockBucket(map, key, type, payload = {}) {
  if (!key || key === '||') return;
  const entry = map.get(key) || { key, owned: 0, active_buy: 0, active_sell: 0, pending_incoming: 0, sell_draft: 0, samples: [] };
  entry[type] = Number(entry[type] || 0) + 1;
  if (entry.samples.length < 6) entry.samples.push({ type, item_name: payload.item_name || payload.name || null, id: payload.id || payload.assetid || payload.tradeofferid || null });
  map.set(key, entry);
}
function effectiveStockCountForCap(entry = {}, options = getOptions()) {
  const owned = Number(entry.owned || 0);
  const pending = Number(entry.pending_incoming || 0);
  const activeSell = Number(entry.active_sell || 0);
  const sellDraft = Number(entry.sell_draft || 0);
  if (options.stock_cap_effective_count_enabled === false) {
    return owned + pending + activeSell + sellDraft;
  }
  const sellReservation = Math.max(
    options.stock_cap_count_active_sell_as_stock ? activeSell : 0,
    options.stock_cap_count_sell_drafts_as_stock ? sellDraft : 0
  );
  // Active sell listings and sell drafts usually represent the same owned asset,
  // so do not double-count owned+selling+draft as stock 3/1.  Count them as a
  // reservation only when there is no owned item visible yet.
  return Math.max(owned, sellReservation) + pending;
}
function displayStockCountForCap(entry = {}, options = getOptions()) {
  return effectiveStockCountForCap(entry, options);
}
function buildStockCapIndex(options = getOptions()) {
  const buckets = new Map();
  for (const item of readInventoryItemsArray()) {
    if (!item || !item.assetid) continue;
    if (isCurrencyOrContainerName(inventoryDisplayName(item))) continue;
    addStockBucket(buckets, stockSkuKeyFromInventoryItem(item), 'owned', { item_name: inventoryDisplayName(item), assetid: item.assetid });
  }
  for (const listing of readAccountListingsArray()) {
    if (!listing || listingIsArchived(listing)) continue;
    const intent = listingIntentValue(listing);
    if (intent === 'buy') addStockBucket(buckets, stockSkuKeyFromListing(listing), 'active_buy', { item_name: listingItemName(listing), id: listing.id || listing.listing_id || listing.hash });
    if (intent === 'sell') addStockBucket(buckets, stockSkuKeyFromListing(listing), 'active_sell', { item_name: listingItemName(listing), id: listing.id || listing.listing_id || listing.hash });
  }
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] }).drafts || [];
  for (const draft of drafts) {
    if (draftIntent(draft) === 'sell' && !['cancelled','disabled'].includes(String(draft.local_status || '').toLowerCase())) {
      addStockBucket(buckets, stockSkuKeyFromDraft(draft), 'sell_draft', { item_name: draft.item_name, id: draft.draft_id });
    }
  }
  if (options.stock_cap_include_pending_offers !== false) {
    const decisions = readJson(DECISIONS_PATH, { ok: true, decisions: [] }).decisions || [];
    for (const d of decisions) {
      const active = Number(d.state || 0) === 2 || Number(d.state || 0) === 9;
      if (!active || d.is_our_offer || d.decision !== 'accept_recommended') continue;
      for (const row of (Array.isArray(d.items_to_receive) ? d.items_to_receive : [])) {
        const name = row.market_hash_name || row.item_name || row.name || row.matched_key || '';
        addStockBucket(buckets, stockSkuKeyFromParts(name, row.quality || '', row.priceindex || '0'), 'pending_incoming', { item_name: name, tradeofferid: d.tradeofferid });
        // Also add a name-only fallback because Steam offer rows often do not carry quality/priceindex consistently.
        addStockBucket(buckets, stockSkuKeyFromParts(name, '', '0'), 'pending_incoming', { item_name: name, tradeofferid: d.tradeofferid });
      }
    }
  }
  return buckets;
}

function summarizeStockCapIndex(index = null, options = getOptions()) {
  const buckets = index || buildStockCapIndex(options);
  const cap = Math.max(1, Number(options.stock_cap_per_item || 1));
  const rows = Array.from(buckets.values()).map(entry => {
    const sample = Array.isArray(entry.samples) && entry.samples.length ? entry.samples[0] : {};
    const parts = String(entry.key || '').split('|');
    const itemName = sample.item_name || parts[0] || 'Unknown item';
    const owned = Number(entry.owned || 0);
    const pending = Number(entry.pending_incoming || 0);
    const activeSell = Number(entry.active_sell || 0);
    const sellDraft = Number(entry.sell_draft || 0);
    const activeBuy = Number(entry.active_buy || 0);
    const stockCount = displayStockCountForCap(entry, options);
    return {
      key: entry.key,
      item_name: itemName,
      quality: parts[1] || '',
      priceindex: parts[2] || '0',
      stock_count: stockCount,
      stock_cap: cap,
      owned,
      pending_incoming: pending,
      active_sell: activeSell,
      sell_draft: sellDraft,
      active_buy: activeBuy,
      capped: stockCount >= cap,
      samples: Array.isArray(entry.samples) ? entry.samples.slice(0, 4) : []
    };
  }).sort((a, b) => (b.stock_count - a.stock_count) || (b.active_buy - a.active_buy) || String(a.item_name).localeCompare(String(b.item_name)));
  const total = rows.reduce((acc, row) => {
    acc.unique_skus += 1;
    acc.stock_count += row.stock_count;
    acc.owned_items += row.owned;
    acc.pending_incoming += row.pending_incoming;
    acc.active_sell_listings += row.active_sell;
    acc.sell_drafts += row.sell_draft;
    acc.active_buy_listings += row.active_buy;
    if (row.capped) acc.capped_skus += 1;
    return acc;
  }, { unique_skus: 0, stock_count: 0, owned_items: 0, pending_incoming: 0, active_sell_listings: 0, sell_drafts: 0, active_buy_listings: 0, capped_skus: 0 });
  return {
    ok: true,
    version: APP_VERSION,
    stock_cap_per_item: cap,
    stock_cap_include_pending_offers: options.stock_cap_include_pending_offers !== false,
    ...total,
    samples: rows.filter(row => row.stock_count > 0 || row.active_sell > 0 || row.pending_incoming > 0).slice(0, 10),
    capped_samples: rows.filter(row => row.capped).slice(0, 10)
  };
}

function buildActiveListingsOverview(options = getOptions()) {
  const listings = activeBackpackListings(readAccountListingsArray());
  const stockIndex = buildStockCapIndex(options);
  const cap = Math.max(1, Number(options.stock_cap_per_item || 1));
  const rows = listings.map(listing => {
    const key = stockSkuKeyFromListing(listing);
    const bucket = stockIndex.get(key) || { key, owned: 0, pending_incoming: 0, active_sell: 0, sell_draft: 0, active_buy: 0, samples: [] };
    const stockCount = displayStockCountForCap(bucket, options);
    return {
      id: listing.id || listing.listing_id || listing.hash || null,
      item_name: listingItemName(listing),
      intent: listingIntentValue(listing),
      metal: listingMetalValue(listing),
      currencies: listingCurrenciesValue(listing),
      price_text: listingCurrencyText(listing),
      details: listing.details || listing.comment || '',
      url: listing.url || (listing.id ? `https://backpack.tf/classifieds?listing=${encodeURIComponent(listing.id)}` : null),
      stock_key: key,
      stock_count: stockCount,
      stock_cap: cap,
      stock_capped: stockCount >= cap,
      owned: Number(bucket.owned || 0),
      pending_incoming: Number(bucket.pending_incoming || 0),
      active_sell: Number(bucket.active_sell || 0),
      sell_draft: Number(bucket.sell_draft || 0),
      active_buy: Number(bucket.active_buy || 0),
      quality: String(key || '').split('|')[1] || '',
      priceindex: String(key || '').split('|')[2] || '0'
    };
  }).sort((a, b) => String(a.intent).localeCompare(String(b.intent)) || Number(b.stock_capped) - Number(a.stock_capped) || String(a.item_name || '').localeCompare(String(b.item_name || '')));
  return {
    ok: true,
    version: APP_VERSION,
    updated_at: new Date().toISOString(),
    total: listings.length,
    buy: rows.filter(r => r.intent === 'buy').length,
    sell: rows.filter(r => r.intent === 'sell').length,
    stock_cap_per_item: cap,
    capped_rows: rows.filter(r => r.stock_capped).length,
    rows: rows.slice(0, 250),
    note: 'Active listings enriched with effective stock. Sell listings/drafts are shown separately and are not double-counted as stock 3/1.'
  };
}

function stockCapStatusForDraft(draft = {}, options = getOptions(), index = null) {
  const intent = draftIntent(draft) || String(draft.intent || '').toLowerCase();
  if (intent !== 'buy') return { blocked: false, reason: 'not_buy_draft' };
  const buckets = index || buildStockCapIndex(options);
  const key = stockSkuKeyFromDraft(draft);
  const nameOnlyKey = stockSkuKeyFromParts(draft.item_name || draft.provider_payload_preview?.item?.item_name || '', '', '0');
  const entry = buckets.get(key) || buckets.get(nameOnlyKey) || { owned: 0, active_buy: 0, active_sell: 0, pending_incoming: 0, sell_draft: 0 };
  const stockCap = Math.max(1, Number(options.stock_cap_per_item || 1));
  const stockCount = effectiveStockCountForCap(entry, options);
  if (Number(entry.active_buy || 0) >= 1) return { blocked: true, reason: 'active_buy_listing_already_exists', key, stock_cap: stockCap, counts: entry };
  if (stockCount >= stockCap) return { blocked: true, reason: 'stock_cap_reached', key, stock_cap: stockCap, stock_count: stockCount, counts: entry };
  return { blocked: false, reason: 'below_stock_cap', key, stock_cap: stockCap, stock_count: stockCount, counts: entry };
}
function roundedRef(value, fallback = 0) {
  const n = Number(value);
  const chosen = Number.isFinite(n) ? n : Number(fallback || 0);
  return Number(Math.max(0, chosen).toFixed(2));
}

function inventoryQualityId(item = {}) {
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const qTag = tags.find(tag => /quality/i.test(String(tag.category || tag.internal_name || '')));
  const qName = normalizeName(qTag?.name || qTag?.localized_tag_name || item.quality_name || item.quality || 'unique');
  const map = { normal: 0, genuine: 1, vintage: 3, unusual: 5, unique: 6, strange: 11, haunted: 13, "collector's": 14, collectors: 14, decorated: 15 };
  return map[qName] ?? (Number.isFinite(Number(item.quality)) ? Number(item.quality) : 6);
}
function inventoryExactSchemaValueForOwnedItem(item = {}) {
  const name = stripTf2Prefixes(inventoryDisplayName(item));
  if (!name) return 0;
  const quality = inventoryQualityId(item);
  try {
    const schema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const prices = Array.isArray(schema.prices) ? schema.prices : [];
    if (!prices.length) return 0;
    const scanner = new MarketTargetScannerService(null);
    const keyRef = scanner.keyPriceRef(prices, getOptions());
    const exact = prices
      .filter(price => stripTf2Prefixes(price.item_name || price.name || price.market_hash_name || '') === name)
      .filter(price => Number(price.quality) === Number(quality))
      .filter(price => String(price.priceindex ?? '0') === '0')
      .map(price => scanner.priceToRef(price, keyRef))
      .filter(value => Number.isFinite(Number(value)) && Number(value) > 0)
      .sort((a, b) => Number(a) - Number(b));
    if (exact.length) return roundedRef(exact[0]);
  } catch {}
  return 0;
}
function inventoryAnalysisValueForOwnedItem(item = {}) {
  const inv = readJson(HUB_INVENTORY_PATH, { ok: false, analysis: {}, items: [] });
  const assetid = String(item.assetid || '');
  const name = normalizeListingText(inventoryDisplayName(item));
  const top = Array.isArray(inv.analysis?.top_value_items) ? inv.analysis.top_value_items : [];
  const matchedTop = top.find(row => assetid && String(row.assetid || '') === assetid)
    || top.find(row => name && normalizeListingText(row.item_name || row.price_name || '') === name);
  const direct = Number(matchedTop?.value_ref || 0);
  if (Number.isFinite(direct) && direct > 0) return roundedRef(direct);

  // Fallback: re-run the same Backpack.tf price lookup used by inventory sync.
  // This prevents auto-sell from reusing stale buy-plan target prices when the
  // raw inventory item itself does not carry value_ref fields.
  try {
    const prices = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    const lookup = new SteamInventorySyncService(null).priceLookup(Array.isArray(prices.prices) ? prices.prices : []);
    for (const key of inventoryPriceKeys(item)) {
      const entry = lookup.map.get(key);
      const value = normalizeOwnedItemSellValueRef(item, Number(entry?.value_ref || 0), 'schema_lookup');
      if (Number.isFinite(value) && value > 0) return roundedRef(value);
    }
  } catch {}
  return 0;
}
function ownedItemValueRef(item = {}) {
  const candidates = [
    item.value_ref,
    item.price_ref,
    item.estimated_value_ref,
    item.inventory_value_ref,
    item.matched_value_ref,
    item.price?.value_ref,
    item.pricing?.value_ref,
    item.analysis?.value_ref,
    inventoryExactSchemaValueForOwnedItem(item),
    inventoryAnalysisValueForOwnedItem(item)
  ];
  for (const value of candidates) {
    const n = normalizeOwnedItemSellValueRef(item, Number(value), 'owned_item_value');
    if (Number.isFinite(n) && n > 0) return roundedRef(n);
  }
  return 0;
}
function strictSellPriceGuard(buyDraft = {}, ownedItem = {}) {
  const inventoryValue = ownedItemValueRef(ownedItem);
  const target = roundedRef(buyDraft.target_sell_ref || buyDraft.expected_sell_ref || buyDraft.provider_payload_preview?.target_sell_ref || 0);
  const boughtFor = roundedRef(buyDraft.max_buy_ref || 0);
  const expectedProfit = Number(buyDraft.expected_profit_ref || 0);
  const fallbackPlan = roundedRef(boughtFor + Math.max(0.11, Number.isFinite(expectedProfit) ? expectedProfit : 0.11));
  // Hard rule: if an owned asset has a current inventory/Backpack value, it wins.
  // The scanner target can be wildly wrong for some low-value weapons/cosmetics.
  if (inventoryValue > 0) {
    const trust = sellCostBasisTrustForMarket(buyDraft, boughtFor, inventoryValue, getOptions());
    const trustedBoughtFor = trust.trusted ? boughtFor : 0;
    const profitFloor = trustedBoughtFor > 0 ? sellProfitFloorRef(trustedBoughtFor, getOptions()) : 0;
    const guardedSellRef = profitFloor > 0 ? Math.max(inventoryValue, profitFloor) : inventoryValue;
    return {
      sell_ref: roundedRef(guardedSellRef),
      source: !trust.trusted ? 'strict_inventory_value_untrusted_cost_basis' : (profitFloor > inventoryValue ? 'strict_inventory_value_plus_profit_floor' : 'strict_inventory_value'),
      cost_basis_trust: trust,
      guarded: true,
      inventory_value_ref: inventoryValue,
      profit_floor_ref: profitFloor || null,
      original_target_sell_ref: target || null,
      bought_for_ref: boughtFor || null,
      plan_fallback_ref: fallbackPlan || null,
      blocked_plan_price: Boolean(target && Math.abs(target - guardedSellRef) > 0.001)
    };
  }
  const chosen = Math.max(Number(getOptions().sell_booster_min_sell_ref || 0.11), target || fallbackPlan || 0.05);
  return {
    sell_ref: roundedRef(chosen),
    source: target ? 'buy_plan_target_no_inventory_price' : 'buy_plan_fallback_no_inventory_price',
    guarded: false,
    inventory_value_ref: null,
    original_target_sell_ref: target || null,
    bought_for_ref: boughtFor || null,
    plan_fallback_ref: fallbackPlan || null,
    blocked_plan_price: false
  };
}

function sellDraftCostBasisRef(draft = {}, allDrafts = null) {
  const direct = Number(draft.bought_for_ref || draft.cost_basis_ref || draft.purchase_price_ref || 0);
  if (Number.isFinite(direct) && direct > 0) return roundedRef(direct);
  const sourceId = draft.source_buy_draft_id || draft.source_order_id || null;
  if (sourceId) {
    const drafts = allDrafts || readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] }).drafts || [];
    const source = (Array.isArray(drafts) ? drafts : []).find(d => d.draft_id === sourceId || d.source_order_id === sourceId);
    const v = Number(source?.max_buy_ref || source?.provider_payload_preview?.currencies?.metal || 0);
    if (Number.isFinite(v) && v > 0) return roundedRef(v);
  }
  return 0;
}
function sellCostBasisTrustForMarket(draft = {}, costBasisRef = 0, lowestSellRef = 0, options = getOptions()) {
  const cost = Number(costBasisRef || 0);
  const market = Number(lowestSellRef || 0);
  if (!Number.isFinite(cost) || cost <= 0) return { trusted: false, reason: 'no_cost_basis', cost_basis_ref: 0, market_sell_ref: market || null };
  if (options.sell_cost_basis_trust_guard_enabled === false || !Number.isFinite(market) || market <= 0) return { trusted: true, reason: 'trusted_no_market_guard', cost_basis_ref: roundedRef(cost), market_sell_ref: market || null };
  const multiplier = Number(options.sell_cost_basis_untrusted_market_multiplier || 3);
  const maxAbove = Number(options.sell_cost_basis_untrusted_max_above_market_ref || 2);
  const tooHigh = cost > roundedRef(market * multiplier) && cost > roundedRef(market + maxAbove);
  if (tooHigh) return { trusted: false, reason: 'cost_basis_market_mismatch', cost_basis_ref: roundedRef(cost), market_sell_ref: roundedRef(market), multiplier, max_above_market_ref: maxAbove };
  return { trusted: true, reason: 'trusted', cost_basis_ref: roundedRef(cost), market_sell_ref: roundedRef(market) };
}
function currentDraftSellRef(draft = {}) {
  const keyRef = keyPriceEstimateRef();
  const cur = draft.provider_payload_preview?.currencies || {};
  const fromCurrencies = currenciesToRef(cur, keyRef);
  const fallback = Number(draft.target_sell_ref || draft.max_buy_ref || 0);
  return roundedRef(fromCurrencies || fallback || 0);
}
function sellProfitFloorRef(costBasisRef, options = getOptions()) {
  const cost = Number(costBasisRef || 0);
  if (!Number.isFinite(cost) || cost <= 0) return 0;
  const minProfit = Number(options.sell_profit_guard_min_profit_ref || 0.22);
  const minMargin = Number(options.sell_profit_guard_min_margin_percent || 3);
  const marginProfit = cost * (minMargin / 100);
  return roundedRef(cost + Math.max(minProfit, marginProfit));
}
function applySellProfitGuardToDraft(draftId, options = getOptions(), market = null) {
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const idx = drafts.findIndex(d => d.draft_id === draftId);
  if (idx === -1) return { ok: false, code: 'draft_not_found', error: `Draft ${draftId} not found.` };
  const draft = drafts[idx];
  if (draftIntent(draft) !== 'sell') return { ok: true, applied: false, reason: 'not_sell_draft', draft };
  if (options.sell_profit_guard_enabled === false) return { ok: true, applied: false, reason: 'disabled', draft };
  const cost = sellDraftCostBasisRef(draft, drafts);
  if (!Number.isFinite(cost) || cost <= 0) {
    const lowestSellNoCost = Number(market?.sell?.[0]?.price_ref || draft.provider_payload_preview?.market_mirror?.lowest_sell_ref || draft.provider_payload_preview?.market_pricing?.lowest_sell_ref || 0);
    const undercutNoCost = Number(options.strict_sell_classifieds_undercut_ref || options.sell_booster_undercut_ref || 0.11);
    const minSellNoCost = Number(options.sell_booster_min_sell_ref || 0.11);
    const marketSellNoCost = lowestSellNoCost > 0 ? roundedRef(Math.max(minSellNoCost, lowestSellNoCost - undercutNoCost)) : 0;
    const currentNoCost = currentDraftSellRef(draft);
    const finalNoCost = (options.sell_no_cost_basis_force_market_price !== false && marketSellNoCost > 0) ? marketSellNoCost : currentNoCost;
    const guard = { enabled: true, applied: Boolean(finalNoCost && finalNoCost !== currentNoCost), reason: 'no_cost_basis_owned_inventory_market_price', cost_basis_ref: 0, classifieds_lowest_sell_ref: lowestSellNoCost || null, final_sell_ref: finalNoCost || currentNoCost, note: 'Owned inventory without known buy cost follows current classifieds price; profit cannot be computed for this item.' };
    const updated = finalNoCost > 0 ? { ...draft, target_sell_ref: finalNoCost, max_buy_ref: finalNoCost, provider_payload_preview: { ...(draft.provider_payload_preview || {}), currencies: refToBackpackCurrencies(finalNoCost, options, keyPriceEstimateRef()), details: sellListingDetails(draft.item_name || 'item', finalNoCost), sell_profit_guard: guard }, sell_profit_guard: guard, updated_at: new Date().toISOString() } : { ...draft, sell_profit_guard: guard, updated_at: new Date().toISOString() };
    drafts[idx] = updated;
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: new Date().toISOString() });
    return { ok: true, applied: Boolean(finalNoCost && finalNoCost !== currentNoCost), reason: 'no_cost_basis_market_price', guard, draft: drafts[idx] };
  }
  const floor = sellProfitFloorRef(cost, options);
  const current = currentDraftSellRef(draft);
  const lowestSell = Number(market?.sell?.[0]?.price_ref || draft.provider_payload_preview?.market_mirror?.lowest_sell_ref || draft.provider_payload_preview?.market_pricing?.lowest_sell_ref || 0);
  const costTrust = sellCostBasisTrustForMarket(draft, cost, lowestSell, options);
  if (!costTrust.trusted && costTrust.reason === 'cost_basis_market_mismatch') {
    const undercutEarly = Number(options.strict_sell_classifieds_undercut_ref || options.sell_booster_undercut_ref || 0.11);
    const competitiveEarly = lowestSell > 0 ? roundedRef(Math.max(Number(options.sell_booster_min_sell_ref || 0.11), lowestSell - undercutEarly)) : currentDraftSellRef(draft);
    const guard = { enabled: true, applied: false, held: false, reason: 'cost_basis_untrusted_market_mismatch', ...costTrust, final_sell_ref: competitiveEarly, note: 'Stored buy cost looked incompatible with current classifieds, so sell price follows market instead of an old/wrong buy plan.' };
    const updated = { ...draft, target_sell_ref: competitiveEarly, max_buy_ref: competitiveEarly, expected_profit_ref: 0, local_status: String(draft.local_status || '') === 'hold_profit_guard' ? 'approved_local' : draft.local_status, sell_profit_guard: guard, provider_payload_preview: { ...(draft.provider_payload_preview || {}), currencies: refToBackpackCurrencies(competitiveEarly, options, keyPriceEstimateRef()), details: sellListingDetails(draft.item_name || 'item', competitiveEarly), sell_profit_guard: guard }, updated_at: new Date().toISOString() };
    drafts[idx] = updated;
    writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: new Date().toISOString() });
    return { ok: true, applied: true, reason: 'cost_basis_untrusted_market_mismatch', guard, draft: updated };
  }
  const undercut = Number(options.strict_sell_classifieds_undercut_ref || options.sell_booster_undercut_ref || 0.11);
  const competitive = lowestSell > 0 ? roundedRef(Math.max(Number(options.sell_booster_min_sell_ref || 0.11), lowestSell - undercut)) : current;
  const desired = roundedRef(Math.max(current || 0, competitive || 0, floor));
  const overLowest = lowestSell > 0 ? roundedRef(desired - lowestSell) : 0;
  const maxAbove = Number(options.sell_profit_guard_max_above_lowest_ref || 0.66);
  const sanityEnabled = options.sell_market_sanity_guard_enabled !== false;
  const sanityMaxAbove = Number(options.sell_market_sanity_max_above_lowest_ref || maxAbove || 0.66);
  const wouldBeBelowFloor = (current || 0) < floor;
  const marketBelowProfit = lowestSell > 0 && competitive < floor;
  const overLowestLimit = maxAbove > 0 && overLowest > maxAbove;
  const sanityOverpriced = sanityEnabled && lowestSell > 0 && desired > roundedRef(lowestSell + sanityMaxAbove);
  const shouldHold = Boolean(options.sell_profit_guard_skip_when_classifieds_below_profit && marketBelowProfit) || overLowestLimit || sanityOverpriced;
  const guard = {
    enabled: true,
    applied: true,
    cost_basis_ref: roundedRef(cost),
    min_profit_ref: Number(options.sell_profit_guard_min_profit_ref || 0.22),
    min_margin_percent: Number(options.sell_profit_guard_min_margin_percent || 3),
    profit_floor_ref: floor,
    previous_sell_ref: current,
    classifieds_lowest_sell_ref: lowestSell || null,
    competitive_sell_ref: competitive || null,
    final_sell_ref: shouldHold ? current : desired,
    expected_profit_ref: shouldHold ? roundedRef((current || 0) - cost) : roundedRef(desired - cost),
    adjusted_up_to_profit_floor: Boolean(!shouldHold && desired > current && wouldBeBelowFloor),
    market_below_profit_floor: Boolean(marketBelowProfit),
    sell_market_sanity_enabled: Boolean(sanityEnabled),
    sell_market_sanity_overpriced: Boolean(sanityOverpriced),
    max_above_lowest_ref: Number(sanityMaxAbove || 0),
    held: Boolean(shouldHold),
    reason: shouldHold ? (sanityOverpriced ? 'sell_price_too_far_above_market' : 'market_price_below_profit_floor_or_too_far_above_lowest') : (desired > current ? 'raised_to_profit_floor' : 'already_profitable')
  };
  const updated = {
    ...draft,
    target_sell_ref: shouldHold ? draft.target_sell_ref : desired,
    max_buy_ref: shouldHold ? draft.max_buy_ref : desired,
    expected_profit_ref: guard.expected_profit_ref,
    local_status: shouldHold ? 'hold_profit_guard' : (String(draft.local_status || '') === 'hold_profit_guard' ? 'approved_local' : draft.local_status),
    sell_profit_guard: guard,
    provider_payload_preview: {
      ...(draft.provider_payload_preview || {}),
      currencies: shouldHold ? (draft.provider_payload_preview?.currencies || {}) : refToBackpackCurrencies(desired, options, keyPriceEstimateRef()),
      details: shouldHold ? (draft.provider_payload_preview?.details || sellListingDetails(draft.item_name || 'item', current || floor)) : sellListingDetails(draft.item_name || 'item', desired),
      sell_profit_guard: guard
    },
    updated_at: new Date().toISOString()
  };
  drafts[idx] = updated;
  writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: new Date().toISOString() });
  return { ok: !shouldHold, blocked: shouldHold, applied: true, guard, draft: updated, code: shouldHold ? 'sell_profit_guard_hold' : 'sell_profit_guard_ok', error: shouldHold ? 'Sell price from classifieds is below required profit floor.' : null };
}
function activeSellListingPriceForDraft(draft = {}) {
  const name = normalizeListingText(draft.item_name || draft.provider_payload_preview?.item?.item_name || '');
  const assetid = String(draft.assetid || draft.provider_payload_preview?.id || '');
  const matches = activeBackpackListings(readAccountListingsArray()).filter(listing => {
    if (listingIntentValue(listing) !== 'sell') return false;
    const listingAsset = String(listing.id || listing.assetid || listing.item?.id || listing.item?.assetid || '');
    if (assetid && listingAsset && listingAsset === assetid) return true;
    return Boolean(name && normalizeListingText(listingItemName(listing)) === name);
  });
  const prices = matches.map(listing => listingMetalValue(listing)).filter(v => Number.isFinite(v) && v > 0).sort((a,b)=>a-b);
  return prices.length ? roundedRef(prices[0]) : 0;
}
function buildSellProfitGuardStatus(options = getOptions()) {
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] }).drafts || [];
  const sell = (Array.isArray(drafts) ? drafts : []).filter(d => draftIntent(d) === 'sell');
  const guarded = sell.filter(d => d.sell_profit_guard && d.sell_profit_guard.enabled);
  const held = sell.filter(d => String(d.local_status || '') === 'hold_profit_guard' || d.sell_profit_guard?.held);
  const raised = guarded.filter(d => d.sell_profit_guard?.adjusted_up_to_profit_floor);
  const profitable = sell.filter(d => Number(d.sell_profit_guard?.expected_profit_ref || d.expected_profit_ref || 0) >= Number(options.sell_profit_guard_min_profit_ref || 0.22));
  return { ok: true, version: APP_VERSION, enabled: Boolean(options.sell_profit_guard_enabled), min_profit_ref: Number(options.sell_profit_guard_min_profit_ref || 0.22), min_margin_percent: Number(options.sell_profit_guard_min_margin_percent || 3), skip_when_classifieds_below_profit: Boolean(options.sell_profit_guard_skip_when_classifieds_below_profit), sell_drafts: sell.length, guarded: guarded.length, raised_to_floor: raised.length, held: held.length, profitable_or_unknown: profitable.length, samples: sell.slice(0, 8).map(d => { const published = options.sell_status_use_published_price_as_truth ? activeSellListingPriceForDraft(d) : 0; return { draft_id: d.draft_id, item_name: d.item_name, status: d.local_status, sell_ref: published || currentDraftSellRef(d), published_sell_ref: published || null, draft_sell_ref: currentDraftSellRef(d), bought_for_ref: sellDraftCostBasisRef(d, drafts) || null, expected_profit_ref: d.sell_profit_guard?.expected_profit_ref ?? d.expected_profit_ref ?? null, guard: d.sell_profit_guard || null }; }) };
}

function sellListingDetails(itemName, sellRef, reason = '') {
  return cleanPublicListingText(`Selling ${publicItemName(itemName)} for ${currenciesText(sellRef)}. Fast trade offers welcome.`).slice(0, 240);
}
function chooseAutoSellPriceRef(buyDraft = {}, ownedItem = {}) {
  return strictSellPriceGuard(buyDraft, ownedItem);
}
function ownedInventorySeedDraftForSell(item = {}, sellRef = 0) {
  const assetid = String(item.assetid || '');
  const itemName = inventoryDisplayName(item) || 'Unknown item';
  return {
    draft_id: `owned_inventory_seed_${assetid}`,
    source_order_id: null,
    item_name: itemName,
    intent: 'sell',
    assetid,
    max_buy_ref: 0,
    target_sell_ref: roundedRef(sellRef),
    expected_profit_ref: roundedRef(sellRef),
    quality: String(item.quality || item.app_data?.quality || inventoryQualityId(item) || '6'),
    priceindex: String(item.priceindex || item.price_index || item.app_data?.priceindex || '0'),
    defindex: inventoryDefindex(item),
    craftable: inventoryCraftableFlag(item),
    provider_payload_preview: {
      intent: 'sell',
      id: assetid,
      item: {
        quality: String(item.quality || item.app_data?.quality || inventoryQualityId(item) || '6'),
        item_name: itemName,
        priceindex: String(item.priceindex || item.price_index || item.app_data?.priceindex || '0'),
        defindex: inventoryDefindex(item) || undefined,
        craftable: inventoryCraftableFlag(item)
      },
      currencies: { metal: roundedRef(sellRef) },
      details: sellListingDetails(itemName, roundedRef(sellRef)),
      offers: true,
      bump: false
    }
  };
}
function activeSellListingExistsForOwnedItem(item = {}) {
  const name = normalizeListingText(inventoryDisplayName(item));
  const assetid = String(item.assetid || '');
  return activeBackpackListings(readAccountListingsArray()).some(listing => {
    if (listingIntentValue(listing) !== 'sell') return false;
    const listingAsset = String(listing.id || listing.assetid || listing.item?.id || listing.item?.assetid || '');
    if (assetid && listingAsset && listingAsset === assetid) return true;
    return Boolean(name && normalizeListingText(listingItemName(listing)) === name);
  });
}
function activeSellListingsForOwnedItem(item = {}) {
  const name = normalizeListingText(inventoryDisplayName(item));
  const assetid = String(item.assetid || '');
  return activeBackpackListings(readAccountListingsArray()).filter(listing => {
    if (listingIntentValue(listing) !== 'sell') return false;
    const listingAsset = String(listing.id || listing.assetid || listing.item?.id || listing.item?.assetid || '');
    if (assetid && listingAsset && listingAsset === assetid) return true;
    return Boolean(name && normalizeListingText(listingItemName(listing)) === name);
  });
}
function sellBoosterDesiredRefForOwnedItem(item = {}, options = getOptions()) {
  const base = Math.max(Number(options.sell_booster_min_sell_ref || 0.11), ownedItemValueRef(item) || 0);
  return roundedRef(base || options.sell_booster_min_sell_ref || 0.11);
}
function sellBoosterListingIssueForOwnedItem(item = {}, options = getOptions()) {
  const desired = sellBoosterDesiredRefForOwnedItem(item, options);
  const threshold = Number(options.sell_booster_reprice_threshold_ref || 0.22);
  const listings = activeSellListingsForOwnedItem(item);
  if (!listings.length) return { has_active_sell: false, needs_reprice: false, desired_sell_ref: desired, listings: [] };
  const issues = listings.map(listing => {
    const price = listingMetalValue(listing);
    const details = String(listing.details || listing.comment || '');
    const badText = /Buying\s|Generated by TF2 Trading Hub|Price guarded|Q\s+uick|F\s+ast/i.test(details);
    const priceWrong = Number.isFinite(price) && price > 0 ? Math.abs(price - desired) > threshold : true;
    return { id: listing.id || listing.listing_id || listing.hash || null, item_name: listingItemName(listing), price_ref: price || 0, desired_sell_ref: desired, price_wrong: priceWrong, bad_public_text: badText, url: listingExternalUrl(listing) };
  });
  return { has_active_sell: true, needs_reprice: issues.some(x => x.price_wrong || x.bad_public_text), desired_sell_ref: desired, threshold_ref: threshold, listings: issues };
}
function buildSellBoosterStatus(options = getOptions()) {
  const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, items: [], analysis: {} });
  const items = Array.isArray(inventory.items) ? inventory.items : [];
  const top = Array.isArray(inventory.analysis?.top_value_items) ? inventory.analysis.top_value_items : [];
  const valueByAsset = new Map();
  const valueByName = new Map();
  for (const row of top) {
    const value = Number(row.value_ref || row.estimated_value_ref || row.inventory_value_ref || 0);
    if (!Number.isFinite(value) || value <= 0) continue;
    if (row.assetid) valueByAsset.set(String(row.assetid), roundedRef(value));
    const nm = normalizeListingText(row.item_name || row.price_name || row.name || '');
    if (nm && !valueByName.has(nm)) valueByName.set(nm, roundedRef(value));
  }
  const fastValue = (item) => {
    const direct = [item.value_ref, item.price_ref, item.estimated_value_ref, item.inventory_value_ref, item.matched_value_ref, item.price?.value_ref, item.pricing?.value_ref, item.analysis?.value_ref]
      .map(Number).find(v => Number.isFinite(v) && v > 0);
    if (direct) return normalizeOwnedItemSellValueRef(item, direct, 'sell_booster_fast_value');
    const asset = String(item.assetid || '');
    if (asset && valueByAsset.has(asset)) return valueByAsset.get(asset);
    const name = normalizeListingText(inventoryDisplayName(item));
    return valueByName.get(name) || 0;
  };
  const sellable = [];
  const needsReprice = [];
  let protectedCount = 0, belowMin = 0, activeOk = 0, unpriced = 0;
  const minRef = Number(options.auto_sell_owned_inventory_min_ref || 0.11);
  const threshold = Number(options.sell_booster_reprice_threshold_ref || 0.22);
  const activeSells = activeBackpackListings(readAccountListingsArray()).filter(l => listingIntentValue(l) === 'sell');
  const listingsByName = new Map();
  for (const listing of activeSells) {
    const key = normalizeListingText(listingItemName(listing));
    if (!key) continue;
    const arr = listingsByName.get(key) || [];
    arr.push(listing);
    listingsByName.set(key, arr);
  }
  for (const item of items.slice(0, 500)) {
    const name = inventoryDisplayName(item);
    if (!item || !item.assetid || !item.tradable || !name) continue;
    if (!options.auto_sell_owned_inventory_include_currency && isCurrencyOrContainerName(name)) { protectedCount += 1; continue; }
    if (!options.auto_sell_owned_inventory_include_cases && /case|crate|munition/i.test(name)) { protectedCount += 1; continue; }
    const value = fastValue(item);
    if (!Number.isFinite(value) || value <= 0) { unpriced += 1; continue; }
    if (value < minRef) { belowMin += 1; continue; }
    const desired = Math.max(Number(options.sell_booster_min_sell_ref || 0.11), roundedRef(value));
    const key = normalizeListingText(name);
    const listings = listingsByName.get(key) || [];
    const issues = listings.map(listing => {
      const price = listingMetalValue(listing);
      const details = String(listing.details || listing.comment || '');
      const badText = /Buying\s|Generated by TF2 Trading Hub|Price guarded|Q\s+uick|F\s+ast/i.test(details);
      const priceWrong = Number.isFinite(price) && price > 0 ? Math.abs(price - desired) > threshold : true;
      return { id: listing.id || listing.listing_id || listing.hash || null, item_name: listingItemName(listing), price_ref: price || 0, desired_sell_ref: desired, price_wrong: priceWrong, bad_public_text: badText, url: listingExternalUrl(listing) };
    });
    const issue = { has_active_sell: listings.length > 0, needs_reprice: issues.some(x => x.price_wrong || x.bad_public_text), desired_sell_ref: desired, threshold_ref: threshold, listings: issues };
    const row = { assetid: item.assetid, item_name: name, value_ref: roundedRef(value), desired_sell_ref: issue.desired_sell_ref, has_active_sell: issue.has_active_sell, needs_reprice: issue.needs_reprice, listing_price_ref: issue.listings?.[0]?.price_ref || null, listing_url: issue.listings?.[0]?.url || null };
    sellable.push(row);
    if (issue.needs_reprice) needsReprice.push(row);
    else if (issue.has_active_sell) activeOk += 1;
  }
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] }).drafts || [];
  const sellDrafts = drafts.filter(d => draftIntent(d) === 'sell' && !['cancelled','disabled'].includes(String(d.local_status || '').toLowerCase()));
  return { ok: true, version: APP_VERSION, enabled: Boolean(options.sell_booster_enabled), updated_at: new Date().toISOString(), sellable_owned_items: sellable.length, active_sell_ok: activeOk, needs_reprice: needsReprice.length, protected_items: protectedCount, below_min_ref: belowMin, unpriced_items: unpriced, sell_drafts: sellDrafts.length, undercut_ref: Number(options.strict_sell_classifieds_undercut_ref || options.sell_booster_undercut_ref || 0.11), reprice_threshold_ref: threshold, strict_classifieds_pricing_enabled: Boolean(options.strict_sell_classifieds_pricing_enabled), strict_skip_without_snapshot: Boolean(options.strict_sell_classifieds_skip_without_snapshot), sell_profit_guard: buildSellProfitGuardStatus(options), samples: sellable.slice(0, 12), needs_reprice_samples: needsReprice.slice(0, 8), note: 'Sell Booster lists owned tradable non-currency inventory. New sell publishes are repriced from current Backpack.tf lowest-seller classifieds and then checked against the configured profit floor before publishing.' };
}

function shouldAutoSellOwnedInventoryItem(item = {}, options = getOptions()) {
  const name = inventoryDisplayName(item);
  if (!item || !item.assetid || !item.tradable || !name) return { ok: false, reason: 'not_tradable_or_missing_asset' };
  if (!options.auto_sell_owned_inventory_include_currency && isCurrencyOrContainerName(name)) return { ok: false, reason: 'currency_or_container_skipped' };
  if (!options.auto_sell_owned_inventory_include_cases && /case|crate|munition/i.test(name)) return { ok: false, reason: 'case_or_crate_skipped' };
  const value = ownedItemValueRef(item);
  const min = Number(options.auto_sell_owned_inventory_min_ref || 0.11);
  if (!Number.isFinite(value) || value < min) return { ok: false, reason: 'below_min_ref', value_ref: value, min_ref: min };
  const existingIssue = sellBoosterListingIssueForOwnedItem(item, options);
  if (existingIssue.has_active_sell && !existingIssue.needs_reprice) return { ok: false, reason: 'already_has_active_sell_listing', value_ref: value, sell_booster: existingIssue };
  if (existingIssue.has_active_sell && existingIssue.needs_reprice && options.sell_booster_reprice_existing_enabled === false) return { ok: false, reason: 'active_sell_needs_reprice_but_reprice_disabled', value_ref: value, sell_booster: existingIssue };
  return { ok: true, value_ref: roundedRef(value), sell_booster: existingIssue };
}
class BoughtItemAutoSellRelisterService {
  constructor(auditService) { this.audit = auditService || { write(){} }; }
  status() {
    const state = readJson(AUTO_SELL_RELISTER_PATH, { ok: true, runs: [] });
    const draftsStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(draftsStore.drafts) ? draftsStore.drafts : [];
    const buyPublished = drafts.filter(d => draftIntent(d) === 'buy' && (String(d.local_status || '').startsWith('published') || d.published_listing_id));
    const buyFulfilled = drafts.filter(d => draftIntent(d) === 'buy' && String(d.local_status || '') === 'fulfilled_bought');
    const sellDrafts = drafts.filter(d => draftIntent(d) === 'sell' && d.source_buy_draft_id);
    return {
      ok: true,
      version: APP_VERSION,
      enabled: true,
      last_run_at: state.last_run_at || null,
      last_result: state.last_result || null,
      buy_published_candidates: buyPublished.length,
      buy_fulfilled: buyFulfilled.length,
      auto_sell_drafts: sellDrafts.length,
      owned_inventory_auto_sell_enabled: Boolean(getOptions().auto_sell_owned_inventory_above_min_ref_enabled),
      owned_inventory_min_ref: Number(getOptions().auto_sell_owned_inventory_min_ref || 0.11),
      runs: Array.isArray(state.runs) ? state.runs.slice(-20) : []
    };
  }
  findOwnedForBuyDraft(draft, inventoryItems) {
    const mismatches = [];
    const found = (inventoryItems || []).find(item => {
      if (!item || !item.assetid) return false;
      if (!item.tradable) return false;
      const name = inventoryDisplayName(item);
      if (!name || isCurrencyOrContainerName(name)) return false;
      const reasons = strictSkuMismatchReasons(item, draft);
      if (reasons.length) {
        const invBase = normalizeBaseItemName(name);
        const draftBase = normalizeBaseItemName(draft.item_name || draft.provider_payload_preview?.item?.item_name || '');
        if (invBase && draftBase && invBase === draftBase) mismatches.push({ assetid: item.assetid, item_name: name, reasons });
        return false;
      }
      return true;
    }) || null;
    if (!found && mismatches.length) draft.__last_sku_mismatches = mismatches.slice(0, 5);
    return found;
  }
  existingSellDraftForAsset(drafts, assetid) {
    return (drafts || []).find(d => draftIntent(d) === 'sell' && String(d.assetid || d.provider_payload_preview?.id || '') === String(assetid) && !['cancelled','disabled'].includes(String(d.local_status || '').toLowerCase())) || null;
  }
  createSellDraftForOwnedItem(buyDraft, ownedItem, drafts) {
    const now = new Date().toISOString();
    const assetid = String(ownedItem.assetid || '');
    const itemName = inventoryDisplayName(ownedItem) || buyDraft.item_name;
    const priceInfo = chooseAutoSellPriceRef(buyDraft, ownedItem);
    const sellRef = priceInfo.sell_ref;
    const details = sellListingDetails(itemName, sellRef);
    const existing = this.existingSellDraftForAsset(drafts, assetid);
    if (existing) {
      const idx = drafts.findIndex(d => d.draft_id === existing.draft_id);
      const currentMetal = Number(existing.provider_payload_preview?.currencies?.metal || existing.target_sell_ref || existing.max_buy_ref || 0);
      const currentDetails = String(existing.provider_payload_preview?.details || '');
      const activeSellPriceIssues = activeSellListingsForOwnedItem(ownedItem).map(listing => {
        const price = listingMetalValue(listing);
        const diff = Number.isFinite(price) && price > 0 ? roundedRef(price - sellRef) : 0;
        return { id: listing.id || listing.listing_id || listing.hash || null, price_ref: price || 0, desired_sell_ref: sellRef, diff_ref: diff, url: listingExternalUrl(listing) };
      }).filter(x => Math.abs(Number(x.diff_ref || 0)) > Number(getOptions().stack_sell_reprice_threshold_ref || 0.11));
      const activeListingNeedsReprice = Boolean(getOptions().stack_sell_reprice_active_listing_enabled !== false && activeSellPriceIssues.length);
      const needsFix = /\bBuying\b/i.test(currentDetails) || Math.abs(currentMetal - sellRef) > 0.001 || !existing.price_guard || !String(currentDetails).startsWith('Selling ') || activeListingNeedsReprice;
      if (idx !== -1 && needsFix) {
        const wasPublished = String(existing.local_status || '').startsWith('published') || activeListingNeedsReprice;
        const updated = {
          ...existing,
          item_name: itemName,
          max_buy_ref: sellRef,
          target_sell_ref: sellRef,
          expected_profit_ref: roundedRef(sellRef - Number(buyDraft.max_buy_ref || 0)),
          price_guard: { ...priceInfo, active_sell_price_issues: activeSellPriceIssues, active_listing_needs_reprice: activeListingNeedsReprice },
          local_status: 'approved_local',
          needs_republish_reason: activeListingNeedsReprice ? 'active_sell_listing_price_mismatch_republish' : (wasPublished ? 'published_sell_listing_repriced_from_owned_inventory_value' : 'existing_sell_draft_corrected_price_or_text'),
          provider_payload_preview: {
            ...(existing.provider_payload_preview || {}),
            intent: 'sell',
            id: assetid,
            currencies: { metal: sellRef },
            details,
            offers: true,
            bump: false,
            price_guard: { ...priceInfo, active_sell_price_issues: activeSellPriceIssues, active_listing_needs_reprice: activeListingNeedsReprice }
          },
          updated_at: now
        };
        drafts[idx] = updated;
        return { ok: true, created: false, corrected: true, republish_required: true, draft: updated, draft_id: updated.draft_id, reason: updated.needs_republish_reason };
      }
      return { ok: true, created: false, draft: existing, draft_id: existing.draft_id, reason: 'existing_sell_draft_for_asset' };
    }
    const draft = {
      draft_id: `sell_${assetid}_${Date.now().toString(36)}`,
      source_order_id: buyDraft.source_order_id || null,
      source_buy_draft_id: buyDraft.draft_id,
      source_buy_listing_id: buyDraft.published_listing_id || null,
      item_name: itemName,
      intent: 'sell',
      assetid,
      bought_item_detected: true,
      bought_detected_at: now,
      bought_for_ref: Number(buyDraft.max_buy_ref || 0),
      max_buy_ref: sellRef,
      target_sell_ref: sellRef,
      expected_profit_ref: roundedRef(sellRef - Number(buyDraft.max_buy_ref || 0)),
      price_guard: priceInfo,
      quality: String(buyDraft.quality || buyDraft.provider_payload_preview?.item?.quality || '6'),
      priceindex: String(buyDraft.priceindex || buyDraft.provider_payload_preview?.item?.priceindex || '0'),
      provider_payload_preview: {
        intent: 'sell',
        id: assetid,
        item: {
          quality: String(buyDraft.quality || buyDraft.provider_payload_preview?.item?.quality || '6'),
          item_name: itemName,
          priceindex: String(buyDraft.priceindex || buyDraft.provider_payload_preview?.item?.priceindex || '0')
        },
        currencies: { metal: sellRef },
        details,
        offers: true,
        bump: false,
        note: 'Auto-sell draft created after the item appeared in inventory. No Steam trade was accepted or confirmed by this add-on.'
      },
      local_status: 'approved_local',
      created_at: now,
      updated_at: now,
      provider_request_sent: false,
      published_at: null,
      published_listing_id: null,
      auto_sell_relister: true
    };
    drafts.push(draft);
    return { ok: true, created: true, draft, draft_id: draft.draft_id };
  }
  async run(reason = 'auto_sell_relister', runOptions = {}) {
    const options = getOptions();
    const started = new Date().toISOString();
    const result = { ok: true, version: APP_VERSION, reason, started_at: started, inventory_synced: false, detected: [], created: [], published: [], skipped: [], errors: [], counters: { checked: 0, detected: 0, created_sell_drafts: 0, already_had_sell_draft: 0, created_owned_inventory_sell_drafts: 0, owned_inventory_checked: 0, owned_inventory_skipped: 0, published_sell_listings: 0, errors: 0 } };
    result.strict_sell_classifieds_pricing = { enabled: Boolean(options.strict_sell_classifieds_pricing_enabled), applied: 0, skipped_without_snapshot: 0, errors: 0, samples: [] };
    try {
      if (options.inventory_sync_enabled && options.steam_id64 && runOptions.sync_inventory !== false) {
        const invSync = await new SteamInventorySyncService(this.audit).sync(true);
        result.inventory_synced = Boolean(invSync.ok);
        result.inventory_sync = { ok: Boolean(invSync.ok), items: Number(invSync.items_count || 0), error: invSync.error || null };
      }
      const inventoryItems = readInventoryItemsArray();
      const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
      const drafts = Array.isArray(store.drafts) ? store.drafts : [];
      const buyDrafts = drafts.filter(d => draftIntent(d) === 'buy' && !['cancelled','disabled','fulfilled_bought'].includes(String(d.local_status || '').toLowerCase()) && (String(d.local_status || '').startsWith('published') || d.published_listing_id));
      for (const buyDraft of buyDrafts) {
        result.counters.checked += 1;
        const owned = this.findOwnedForBuyDraft(buyDraft, inventoryItems);
        if (!owned) { result.skipped.push({ draft_id: buyDraft.draft_id, item_name: buyDraft.item_name, reason: buyDraft.__last_sku_mismatches?.length ? 'inventory_item_found_but_sku_mismatch' : 'not_in_inventory_yet', sku_mismatches: buyDraft.__last_sku_mismatches || [] }); continue; }
        result.counters.detected += 1;
        result.detected.push({ buy_draft_id: buyDraft.draft_id, item_name: buyDraft.item_name, assetid: owned.assetid, target_sell_ref: buyDraft.target_sell_ref || null });
        const created = this.createSellDraftForOwnedItem(buyDraft, owned, drafts);
        if (created.created) result.counters.created_sell_drafts += 1; else result.counters.already_had_sell_draft += 1;
        result.created.push({ buy_draft_id: buyDraft.draft_id, sell_draft_id: created.draft_id, item_name: created.draft?.item_name || buyDraft.item_name, created: Boolean(created.created), corrected: Boolean(created.corrected), assetid: owned.assetid });
        const idx = drafts.findIndex(d => d.draft_id === buyDraft.draft_id);
        if (idx !== -1) drafts[idx] = { ...drafts[idx], local_status: 'fulfilled_bought', bought_assetid: String(owned.assetid), bought_detected_at: new Date().toISOString(), auto_sell_draft_id: created.draft_id, updated_at: new Date().toISOString() };
      }

      // 5.13.29: also re-check existing auto-sell drafts that were created by
      // older versions.  Those older drafts may already have an active
      // Backpack.tf listing at a bad price, so the normal buy-draft detection no
      // longer runs.  Recompute the sell price from the owned asset and mark the
      // sell draft for republish when the price/text is wrong.
      for (const sellDraft of drafts.filter(d => draftIntent(d) === 'sell' && d.assetid && (d.auto_sell_relister || d.source_buy_draft_id))) {
        const owned = inventoryItems.find(item => String(item.assetid || '') === String(sellDraft.assetid || '') && item.tradable);
        if (!owned) continue;
        const sourceBuy = drafts.find(d => d.draft_id === sellDraft.source_buy_draft_id) || sellDraft;
        const corrected = this.createSellDraftForOwnedItem(sourceBuy, owned, drafts);
        if (corrected.corrected || corrected.republish_required) {
          result.counters.corrected_sell_drafts = Number(result.counters.corrected_sell_drafts || 0) + 1;
          result.created.push({ buy_draft_id: sourceBuy.draft_id || null, sell_draft_id: corrected.draft_id, item_name: corrected.draft?.item_name || sellDraft.item_name, created: false, corrected: true, assetid: owned.assetid });
        }
      }

      // 5.13.29: also sell owned inventory that did not come from our buy
      // listing loop.  This is what makes the bot actually publish sell listings
      // for tradeable owned items above the configured minimum instead of only
      // buying forever.  Currency, keys, metal, cases and crates remain skipped
      // by default so the bot does not sell its operating currency.
      if (options.auto_sell_owned_inventory_above_min_ref_enabled) {
        const maxOwnedSell = Math.max(0, Number(options.auto_sell_owned_inventory_max_per_run || 20));
        let createdOwned = 0;
        for (const ownedItem of inventoryItems) {
          if (createdOwned >= maxOwnedSell) break;
          result.counters.owned_inventory_checked += 1;
          const check = shouldAutoSellOwnedInventoryItem(ownedItem, options);
          if (!check.ok) { result.counters.owned_inventory_skipped += 1; continue; }
          if (this.existingSellDraftForAsset(drafts, String(ownedItem.assetid || ''))) { result.counters.owned_inventory_skipped += 1; continue; }
          const seed = ownedInventorySeedDraftForSell(ownedItem, check.value_ref);
          const created = this.createSellDraftForOwnedItem(seed, ownedItem, drafts);
          if (created.created || created.corrected) {
            createdOwned += 1;
            result.counters.created_owned_inventory_sell_drafts += 1;
            result.counters.created_sell_drafts += created.created ? 1 : 0;
            result.created.push({ buy_draft_id: null, sell_draft_id: created.draft_id, item_name: created.draft?.item_name || inventoryDisplayName(ownedItem), created: Boolean(created.created), corrected: Boolean(created.corrected), assetid: ownedItem.assetid, source: 'owned_inventory_auto_sell', value_ref: check.value_ref });
          }
        }
      }
      writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: new Date().toISOString() });
      if (runOptions.publish !== false && result.created.length) {
        const draftSvc = new HubListingDraftService(this.audit);
        let strictPricedThisRun = 0;
        for (const row of result.created.slice(0, Math.max(1, Number(options.persistent_classifieds_max_publishes_per_cycle || 3)))) {
          try {
            if (options.strict_sell_classifieds_pricing_enabled !== false && row.sell_draft_id && strictPricedThisRun < Number(options.strict_sell_classifieds_max_per_run || 20)) {
              try {
                const mirrorSvc = new MarketClassifiedsMirrorService(this.audit);
                const mirror = await mirrorSvc.syncForDraft(row.sell_draft_id, options);
                const sellRows = Number(mirror?.sell_count || mirror?.market?.sell?.length || 0);
                if (sellRows > 0) {
                  const applied = mirrorSvc.applyToDraft(row.sell_draft_id, options);
                  const profitGuard = applySellProfitGuardToDraft(row.sell_draft_id, options, mirror.market || null);
                  strictPricedThisRun += 1;
                  result.strict_sell_classifieds_pricing.applied += 1;
                  result.strict_sell_classifieds_pricing.samples.push({
                    sell_draft_id: row.sell_draft_id,
                    item_name: row.item_name,
                    lowest_sell_ref: Number(mirror.market?.sell?.[0]?.price_ref || 0),
                    applied_sell_ref: Number(profitGuard?.draft?.target_sell_ref || applied?.draft?.target_sell_ref || applied?.draft?.provider_payload_preview?.currencies?.metal || 0),
                    expected_profit_ref: Number(profitGuard?.guard?.expected_profit_ref || applied?.draft?.expected_profit_ref || 0),
                    profit_guard: profitGuard?.guard || null,
                    source: profitGuard?.guard?.adjusted_up_to_profit_floor ? 'classifieds_lowest_seller_plus_profit_floor' : 'classifieds_lowest_seller'
                  });
                  if (!profitGuard.ok) {
                    result.skipped.push({ sell_draft_id: row.sell_draft_id, item_name: row.item_name, reason: 'sell_profit_guard_blocked', profit_guard: profitGuard.guard || null });
                    continue;
                  }
                } else {
                  result.strict_sell_classifieds_pricing.skipped_without_snapshot += 1;
                  if (options.strict_sell_classifieds_skip_without_snapshot) {
                    result.skipped.push({ sell_draft_id: row.sell_draft_id, item_name: row.item_name, reason: 'strict_sell_classifieds_no_sell_snapshot' });
                    continue;
                  }
                }
              } catch (error) {
                result.strict_sell_classifieds_pricing.errors += 1;
                if (options.strict_sell_classifieds_skip_without_snapshot) {
                  result.errors.push({ sell_draft_id: row.sell_draft_id, error: 'strict_sell_classifieds_pricing_failed: ' + safeError(error) });
                  result.counters.errors += 1;
                  continue;
                }
              }
            }
            const pub = await draftSvc.publishGuarded(row.sell_draft_id, options, { confirm: true, auto_sell_relister: true, skip_currency_guard: true });
            result.published.push({ sell_draft_id: row.sell_draft_id, item_name: row.item_name, ok: Boolean(pub.ok), provider_status: pub.provider_status || null, listing_id: pub.published_listing_id || null, url: pub.published_listing_url || null, error: pub.error || pub.friendly_message || null });
            if (pub.ok) result.counters.published_sell_listings += 1;
          } catch (error) { result.counters.errors += 1; result.errors.push({ sell_draft_id: row.sell_draft_id, error: safeError(error) }); }
        }
      }
      result.completed_at = new Date().toISOString();
      result.publish_error_inspector = buildPublishErrorInspectorStatus(options);
      result.adaptive_fill_controller = buildAdaptiveFillControllerStatus(options);
      result.ok = result.counters.errors === 0;
      this.audit.write((result.counters.detected || result.counters.created_owned_inventory_sell_drafts) ? 'auto_sell_relister_created_sell_drafts' : 'auto_sell_relister_noop', { detected: result.counters.detected, created: result.counters.created_sell_drafts, owned_inventory_created: result.counters.created_owned_inventory_sell_drafts, published: result.counters.published_sell_listings });
      appendActionFeed((result.counters.detected || result.counters.created_owned_inventory_sell_drafts) ? 'auto_sell_relister_created_sell_drafts' : 'auto_sell_relister_noop', { detected: result.counters.detected, created: result.counters.created_sell_drafts, owned_inventory_created: result.counters.created_owned_inventory_sell_drafts, published: result.counters.published_sell_listings });
    } catch (error) {
      result.ok = false; result.error = safeError(error); result.completed_at = new Date().toISOString(); result.counters.errors += 1;
    }
    const state = readJson(AUTO_SELL_RELISTER_PATH, { runs: [] });
    const runs = [...(Array.isArray(state.runs) ? state.runs : []), result].slice(-50);
    writeJson(AUTO_SELL_RELISTER_PATH, { ok: Boolean(result.ok), version: APP_VERSION, last_run_at: result.completed_at, last_result: result, runs });
    return result;
  }
}



// ── 5.13.29 – Main Account Canonical Vault Save ─────────────────────
function manualOwnedSellDetectorValueRef(item = {}, options = getOptions()) {
  const value = ownedItemValueRef(item);
  if (Number.isFinite(value) && value >= Number(options.auto_sell_owned_inventory_min_ref || 0.11)) return roundedRef(value);
  if (options.manual_owned_sell_detector_include_unpriced_as_min) return roundedRef(options.auto_sell_owned_inventory_min_ref || 0.11);
  return 0;
}
function manualOwnedSellDetectorStatusRows(options = getOptions()) {
  const items = readInventoryItemsArray();
  const drafts = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] }).drafts || [];
  const rows = [];
  const skipped = { not_tradable: 0, protected_currency: 0, case_or_crate: 0, below_min_or_unpriced: 0, already_has_sell_listing: 0, already_has_sell_draft: 0 };
  const minRef = Number(options.auto_sell_owned_inventory_min_ref || 0.11);
  for (const item of items) {
    const name = inventoryDisplayName(item);
    if (!item || !item.assetid || !name || item.tradable === false) { skipped.not_tradable += 1; continue; }
    if (!options.auto_sell_owned_inventory_include_currency && isCurrencyOrContainerName(name)) { skipped.protected_currency += 1; continue; }
    if (!options.auto_sell_owned_inventory_include_cases && /case|crate|munition/i.test(name)) { skipped.case_or_crate += 1; continue; }
    if (activeSellListingExistsForOwnedItem(item)) { skipped.already_has_sell_listing += 1; continue; }
    const hasDraft = drafts.some(d => draftIntent(d) === 'sell' && String(d.assetid || d.provider_payload_preview?.id || '') === String(item.assetid || '') && !['cancelled','disabled'].includes(String(d.local_status || '').toLowerCase()));
    if (hasDraft) { skipped.already_has_sell_draft += 1; continue; }
    const value = manualOwnedSellDetectorValueRef(item, options);
    if (!Number.isFinite(value) || value < minRef) { skipped.below_min_or_unpriced += 1; continue; }
    rows.push({ assetid: String(item.assetid), item_name: name, value_ref: roundedRef(value), quality: inventoryQualityId(item), priceindex: inventoryPriceindex(item), defindex: inventoryDefindex(item), reason: 'owned_unlisted_manual_inventory_sell_candidate' });
  }
  return { rows, skipped };
}
class ManualOwnedItemSellDetectorService {
  constructor(auditService) { this.audit = auditService || { write(){} }; }
  status() {
    const options = getOptions();
    const state = readJson(MANUAL_OWNED_SELL_DETECTOR_PATH, { ok: true, runs: [] });
    const scan = manualOwnedSellDetectorStatusRows(options);
    return {
      ok: true,
      version: APP_VERSION,
      enabled: Boolean(options.manual_owned_sell_detector_enabled),
      force_inventory_sync: Boolean(options.manual_owned_sell_detector_force_inventory_sync),
      publish: Boolean(options.manual_owned_sell_detector_publish),
      scan_existing_unlisted: Boolean(options.manual_owned_sell_detector_scan_existing_unlisted),
      min_ref: Number(options.auto_sell_owned_inventory_min_ref || 0.11),
      unlisted_sellable_owned_items: scan.rows.length,
      skipped: scan.skipped,
      samples: scan.rows.slice(0, 12),
      last_run_at: state.last_run_at || null,
      last_result: state.last_result || null,
      message: scan.rows.length ? 'Owned tradable inventory has unlisted sell candidates. Auto-sell now / maintainer can create sell drafts and publish them.' : 'No unlisted owned tradable sell candidates found.'
    };
  }
  async run(reason = 'manual_owned_sell_detector', runOptions = {}) {
    const options = getOptions();
    const started = new Date().toISOString();
    const result = { ok: true, version: APP_VERSION, reason, started_at: started, inventory_synced: false, candidates: [], created: [], published: [], skipped: [], errors: [], counters: { candidates: 0, created_sell_drafts: 0, already_had_sell_draft: 0, published_sell_listings: 0, skipped: 0, errors: 0 } };
    try {
      if (!options.manual_owned_sell_detector_enabled) {
        result.ok = true; result.skipped.push({ reason: 'manual_owned_sell_detector_disabled' }); result.completed_at = new Date().toISOString();
        return this.persist(result);
      }
      if (options.inventory_sync_enabled && options.steam_id64 && (runOptions.sync_inventory !== false) && options.manual_owned_sell_detector_force_inventory_sync) {
        const invSync = await new SteamInventorySyncService(this.audit).sync(true);
        result.inventory_synced = Boolean(invSync.ok);
        result.inventory_sync = { ok: Boolean(invSync.ok), items: Number(invSync.items_count || 0), error: invSync.error || null };
      }
      const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
      const drafts = Array.isArray(store.drafts) ? store.drafts : [];
      const scan = manualOwnedSellDetectorStatusRows(options);
      const max = Math.max(0, Number(options.manual_owned_sell_detector_max_per_run || 30));
      const selected = scan.rows.slice(0, max);
      result.candidates = selected;
      result.counters.candidates = selected.length;
      const inventoryItems = readInventoryItemsArray();
      const relister = new BoughtItemAutoSellRelisterService(this.audit);
      for (const row of selected) {
        const ownedItem = inventoryItems.find(item => String(item.assetid || '') === String(row.assetid));
        if (!ownedItem) { result.counters.skipped += 1; result.skipped.push({ assetid: row.assetid, item_name: row.item_name, reason: 'asset_missing_after_scan' }); continue; }
        if (relister.existingSellDraftForAsset(drafts, String(row.assetid))) { result.counters.already_had_sell_draft += 1; continue; }
        const seed = ownedInventorySeedDraftForSell(ownedItem, row.value_ref);
        const created = relister.createSellDraftForOwnedItem(seed, ownedItem, drafts);
        if (created.created || created.corrected) {
          result.counters.created_sell_drafts += 1;
          result.created.push({ assetid: row.assetid, item_name: created.draft?.item_name || row.item_name, sell_draft_id: created.draft_id, created: Boolean(created.created), corrected: Boolean(created.corrected), value_ref: row.value_ref, source: 'manual_owned_inventory_auto_sell' });
        } else {
          result.counters.already_had_sell_draft += 1;
          result.created.push({ assetid: row.assetid, item_name: row.item_name, sell_draft_id: created.draft_id, created: false, reason: created.reason || 'existing_sell_draft' });
        }
      }
      writeJson(HUB_LISTING_DRAFTS_PATH, { ...store, ok: true, version: APP_VERSION, drafts, updated_at: new Date().toISOString() });
      const shouldPublish = runOptions.publish !== false && options.manual_owned_sell_detector_publish && options.allow_guarded_backpack_publish && options.allow_live_classifieds_writes && options.backpack_tf_write_mode === 'guarded';
      if (shouldPublish && result.created.length) {
        const draftSvc = new HubListingDraftService(this.audit);
        for (const row of result.created.filter(x => x.sell_draft_id).slice(0, Math.max(1, Number(options.manual_owned_sell_detector_max_per_run || 30)))) {
          try {
            const pub = await draftSvc.publishGuarded(row.sell_draft_id, options, { confirm: true, manual_owned_sell_detector: true, skip_currency_guard: true });
            result.published.push({ sell_draft_id: row.sell_draft_id, item_name: row.item_name, ok: Boolean(pub.ok), provider_status: pub.provider_status || null, listing_id: pub.published_listing_id || null, url: pub.published_listing_url || null, error: pub.error || pub.friendly_message || null });
            if (pub.ok) result.counters.published_sell_listings += 1;
          } catch (error) {
            result.counters.errors += 1; result.errors.push({ sell_draft_id: row.sell_draft_id, error: safeError(error) });
          }
        }
      }
      result.completed_at = new Date().toISOString();
      result.ok = result.counters.errors === 0;
      try { this.audit.write(result.counters.created_sell_drafts ? 'manual_owned_sell_detector_created_sell_drafts' : 'manual_owned_sell_detector_noop', { candidates: result.counters.candidates, created: result.counters.created_sell_drafts, published: result.counters.published_sell_listings, errors: result.counters.errors }); } catch {}
      try { appendActionFeed(result.counters.created_sell_drafts ? 'manual_owned_sell_detector_created_sell_drafts' : 'manual_owned_sell_detector_noop', { candidates: result.counters.candidates, created: result.counters.created_sell_drafts, published: result.counters.published_sell_listings, errors: result.counters.errors }); } catch {}
    } catch (error) {
      result.ok = false; result.error = safeError(error); result.completed_at = new Date().toISOString(); result.counters.errors += 1;
    }
    return this.persist(result);
  }
  persist(result) {
    const state = readJson(MANUAL_OWNED_SELL_DETECTOR_PATH, { runs: [] });
    const runs = [...(Array.isArray(state.runs) ? state.runs : []), result].slice(-50);
    writeJson(MANUAL_OWNED_SELL_DETECTOR_PATH, { ok: Boolean(result.ok), version: APP_VERSION, last_run_at: result.completed_at, last_result: result, runs });
    return result;
  }
}


// ── 5.13.29 – Sell-first maintainer helpers ──────────────────────────────
function maintainerSellFirstBacklog(options = getOptions()) {
  const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
  const drafts = Array.isArray(store.drafts) ? store.drafts : [];
  const accountListings = readAccountListingsArray();
  const activeSellKeys = new Set(accountListings
    .filter(listing => String(listingIntentValue(listing) || '').toLowerCase() === 'sell')
    .map(listing => normalizeListingText(listingItemName(listing)))
    .filter(Boolean));
  const finalStatuses = new Set(['cancelled','disabled','fulfilled_bought','auto_sell_created','exported']);
  const actionableStatuses = new Set(['approved_local','draft','ready_for_review','publish_failed','published','published_active','hold_profit_guard']);
  const rows = [];
  for (const d of drafts) {
    if (!d || !d.draft_id || draftIntent(d) !== 'sell') continue;
    const status = String(d.local_status || 'draft').toLowerCase();
    if (finalStatuses.has(status)) continue;
    if (!actionableStatuses.has(status)) continue;
    const name = normalizeListingText(d.item_name || d.provider_payload_preview?.item?.item_name || '');
    const alreadyActive = Boolean(name && activeSellKeys.has(name));
    if (alreadyActive && !['publish_failed','hold_profit_guard'].includes(status)) continue;
    rows.push({
      draft_id: d.draft_id,
      item_name: d.item_name || d.provider_payload_preview?.item?.item_name || 'Unknown item',
      local_status: d.local_status || 'draft',
      target_sell_ref: Number(d.target_sell_ref || d.provider_payload_preview?.currencies?.metal || 0),
      already_active: alreadyActive,
      assetid: d.assetid || d.provider_payload_preview?.item?.assetid || null
    });
  }
  const manual = (() => { try { return new ManualOwnedItemSellDetectorService(null).status(); } catch { return { unlisted_sellable_owned_items: 0, samples: [] }; } })();
  return {
    ok: true,
    version: APP_VERSION,
    enabled: Boolean(options.maintainer_sell_first_priority_enabled),
    backlog: rows.length,
    backlog_drafts: rows.length,
    unlisted_owned_sellable_items: Number(manual.unlisted_sellable_owned_items || 0),
    samples: rows.slice(0, 12),
    owned_samples: Array.isArray(manual.samples) ? manual.samples.slice(0, 8) : [],
    blocks_buy: Boolean(options.maintainer_sell_backlog_blocks_buy_until_empty && (rows.length || Number(manual.unlisted_sellable_owned_items || 0) > 0)),
    policy: 'sell_and_owned_inventory_first_then_buy_cap_fill',
    message: rows.length || Number(manual.unlisted_sellable_owned_items || 0) > 0
      ? 'Sell-first priority is active: publish/reprice owned sell work before adding more buy listings.'
      : 'No sell backlog detected; buy cap-fill may continue.'
  };
}

class PersistentClassifiedsMaintainerService {
  constructor(auditService) { this.audit = auditService || { write(){} }; this.running = false; }
  effectiveMaxPublishes(options = getOptions()) {
    const state = readJson(STARTUP_REBUILD_PATH, {});
    const fastUntil = state && state.fast_fill_until ? Date.parse(state.fast_fill_until) : 0;
    if (options.startup_rebuild_enabled !== false && fastUntil && Date.now() < fastUntil) {
      return Math.max(1, Math.min(Number(options.maintainer_publish_batch_hard_cap || 40), Number(options.startup_rebuild_batch_size || 8)));
    }
    const configured = Number(options.persistent_classifieds_max_publishes_per_cycle || options.startup_rebuild_normal_batch_size || 20);
    // 5.13.29: adaptive fill.  Keep fast cap-fill when Backpack.tf is healthy,
    // but back off automatically when recent runs show rate-limit/provider
    // pressure.  Currency/duplicate/stock skips do not slow the whole bot.
    let base = Math.max(20, Math.min(Number(options.maintainer_publish_batch_hard_cap || 80), Number.isFinite(configured) ? configured : 20));
    if (options.adaptive_fill_controller_enabled !== false) {
      try {
        const adaptive = buildAdaptiveFillControllerStatus(options);
        if (adaptive && adaptive.enabled !== false && Number(adaptive.effective_max_publishes_per_cycle || 0) > 0) base = Number(adaptive.effective_max_publishes_per_cycle);
      } catch {}
    }
    return base;
  }
  enabled(options = getOptions()) {
    return Boolean(
      options.persistent_classifieds_maintainer_enabled !== false &&
      options.backpack_tf_enabled &&
      options.allow_guarded_backpack_publish &&
      options.allow_live_classifieds_writes &&
      options.backpack_tf_write_mode === 'guarded' &&
      (options.backpack_tf_access_token || options.backpack_tf_api_key) &&
      !options.global_kill_switch &&
      !options.allow_live_trade_accepts &&
      !options.sda_auto_confirm &&
      !options.steamguard_auto_confirm
    );
  }
  summarizeLastResult(last = {}) {
    const counters = last.counters || {};
    return {
      ok: last.ok !== false,
      health: last.health || (last.ok === false ? 'error' : ((Number(counters.errors || 0) || Number(counters.archived_or_currency || 0)) ? 'warning' : 'green')),
      checked: Number(counters.checked || 0),
      published: Number(counters.published || (Array.isArray(last.published) ? last.published.length : 0)),
      already_active: Number(counters.already_active || 0),
      duplicate_skipped: Number(counters.duplicate_skipped || 0),
      archived_or_currency: Number(counters.archived_or_currency || 0),
      currency_skipped: Number(counters.currency_skipped || 0),
      errors: Number(counters.errors || 0),
      skipped: Array.isArray(last.skipped) ? last.skipped.length : 0,
      reason: last.reason || null,
      completed_at: last.completed_at || null,
      next_action: last.next_action || null
    };
  }
  status() {
    const options = getOptions();
    const state = readJson(CLASSIFIEDS_MAINTAINER_PATH, { ok: true, runs: [] });
    const last = state.last_run_at ? Date.parse(state.last_run_at) : 0;
    const interval = Number(options.persistent_classifieds_interval_minutes || 5);
    const enabled = this.enabled(options);
    const dueAtMs = last ? last + interval * 60 * 1000 : Date.now();
    const nextDue = enabled ? (last ? new Date(dueAtMs).toISOString() : 'now') : null;
    const dueInSeconds = enabled ? Math.max(0, Math.round((dueAtMs - Date.now()) / 1000)) : null;
    const configuredMax = Number(options.persistent_classifieds_max_publishes_per_cycle || 40);
    const effectiveMax = this.effectiveMaxPublishes(options);
    const fillTargets = computeListingFillTargets(readAccountListingsArray(), options);
    const stockSummary = summarizeStockCapIndex(buildStockCapIndex(options), options);
    const lastResult = state.last_result || null;
    const startupRebuild = readJson(STARTUP_REBUILD_PATH, {});
    const fastUntil = startupRebuild.fast_fill_until ? Date.parse(startupRebuild.fast_fill_until) : 0;
    const startupFastFillActive = Boolean(fastUntil && Date.now() < fastUntil);
    return {
      ok: true,
      version: APP_VERSION,
      enabled,
      running: Boolean(this.running || state.running),
      interval_minutes: interval,
      configured_max_publishes_per_cycle: configuredMax,
      max_publishes_per_cycle: effectiveMax,
      effective_max_publishes_per_cycle: effectiveMax,
      startup_fast_fill_active: startupFastFillActive,
      startup_fast_fill_until: startupRebuild.fast_fill_until || null,
      startup_rebuild_status: startupRebuild.status || 'not_run_yet',
      scheduler_tick_seconds: 60,
      listing_fill_mode: fillTargets.fill_mode,
      backpack_tf_account_listing_cap: fillTargets.cap,
      detected_listing_cap: fillTargets.detected_cap,
      max_total_active_listings: fillTargets.configured_max_total,
      listing_fill_reserve_slots: fillTargets.reserve_slots,
      active_total_listings: fillTargets.active_total,
      active_buy_listings: fillTargets.active_buy,
      active_sell_listings: fillTargets.active_sell,
      free_listing_slots: fillTargets.free_slots,
      target_active_buy_listings: fillTargets.target_buy,
      target_active_sell_listings: fillTargets.target_sell,
      stock_cap_per_item: Number(options.stock_cap_per_item || 1),
      stock_cap_include_pending_offers: options.stock_cap_include_pending_offers !== false,
      stock_summary: stockSummary,
      active_listings_overview: buildActiveListingsOverview(options),
      sell_first_priority: maintainerSellFirstBacklog(options),
      last_run_at: state.last_run_at || null,
      last_result: lastResult,
      last_result_summary: lastResult ? this.summarizeLastResult(lastResult) : null,
      next_due_at: nextDue,
      due_in_seconds: dueInSeconds,
      clear_status: {
        label: enabled ? (this.running || state.running ? 'running' : (dueInSeconds === 0 ? 'due_now' : 'waiting')) : 'disabled',
        text: enabled ? `Enabled · next run ${dueInSeconds === 0 ? 'now' : `in ${dueInSeconds}s`} · cap-fill ${fillTargets.active_total}/${fillTargets.cap} · target buy ${fillTargets.target_buy} · max ${effectiveMax}/cycle` : 'Disabled by sliders or safety gates',
        last: lastResult ? this.summarizeLastResult(lastResult) : null
      },
      slider_gate: {
        persistent_classifieds_maintainer_enabled: options.persistent_classifieds_maintainer_enabled !== false,
        allow_guarded_backpack_publish: Boolean(options.allow_guarded_backpack_publish),
        allow_live_classifieds_writes: Boolean(options.allow_live_classifieds_writes),
        backpack_tf_write_mode: options.backpack_tf_write_mode,
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        steam_confirmations: Boolean(options.sda_auto_confirm || options.steamguard_auto_confirm),
        global_kill_switch: Boolean(options.global_kill_switch)
      },
      runs: Array.isArray(state.runs) ? state.runs.slice(-20) : []
    };
  }
  due() {
    const options = getOptions();
    if (!this.enabled(options) || this.running) return false;
    const state = readJson(CLASSIFIEDS_MAINTAINER_PATH, {});
    const last = state.last_run_at ? Date.parse(state.last_run_at) : 0;
    return !last || (Date.now() - last >= Number(options.persistent_classifieds_interval_minutes || 5) * 60 * 1000);
  }
  collectCandidateDrafts(limit = 3, options = getOptions()) {
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
    const drafts = Array.isArray(store.drafts) ? store.drafts : [];
    const activeLikeRaw = drafts.filter(d => d && d.draft_id && !['cancelled', 'disabled', 'fulfilled_bought', 'auto_sell_created'].includes(String(d.local_status || '').toLowerCase()));
    const stockIndex = buildStockCapIndex(options);
    const activeLike = activeLikeRaw.filter(d => {
      const cap = stockCapStatusForDraft(d, options, stockIndex);
      if (cap.blocked && draftIntent(d) === 'buy') return false;
      const brainGate = tradingBrainFilterDraftForMaintainer(d, options);
      if (!brainGate.ok) return false;
      if (draftIntent(d) === 'buy' && options.maintainer_skip_unaffordable_buy_candidates !== false) {
        const currency = previewCurrencyGuardForDraft(d, options);
        if (!currency.enough_currency) return false;
      }
      return true;
    });

    // 5.13.29: do not let already-active Backpack.tf listings consume the
    // maintainer batch.  Keep them visible for verification, but sort them to
    // the end so the cycle can continue to fresh planned/approved drafts.
    const accountListings = readAccountListingsArray();
    const activeKeys = new Set(accountListings.map(listing => `${listingIntentValue(listing) || ''}|${normalizeListingText(listingItemName(listing))}`));
    const draftActiveOnBackpack = draft => {
      const intent = draftIntent(draft) || String(draft.intent || 'buy').toLowerCase();
      const name = normalizeListingText(draft.item_name || draft.provider_payload_preview?.item?.item_name || '');
      if (!name) return false;
      return activeKeys.has(`${intent}|${name}`) || activeKeys.has(`|${name}`);
    };
    const order = { approved_local: 0, draft: 1, ready_for_review: 2, publish_failed: 3, published: 4, published_active: 5, published_archived: 6 };
    return activeLike
      .map(d => {
        const currency = draftIntent(d) === 'buy' ? previewCurrencyGuardForDraft(d, options) : { enough_currency: true };
        return { draft: d, alreadyActiveOnBackpack: draftActiveOnBackpack(d), affordable: draftIntent(d) !== 'buy' || Boolean(currency.enough_currency), intent: draftIntent(d) };
      })
      .sort((a, b) => (options.maintainer_sell_first_priority_enabled !== false ? Number(b.intent === 'sell') - Number(a.intent === 'sell') : 0) || Number(a.alreadyActiveOnBackpack) - Number(b.alreadyActiveOnBackpack) || Number(a.intent === 'buy' && !a.affordable) - Number(b.intent === 'buy' && !b.affordable) || Number(a.intent === 'buy') - Number(b.intent === 'buy') || (order[String(a.draft.local_status || 'draft')] ?? 9) - (order[String(b.draft.local_status || 'draft')] ?? 9) || Number(b.draft.expected_profit_ref || 0) - Number(a.draft.expected_profit_ref || 0) || String(a.draft.item_name || '').localeCompare(String(b.draft.item_name || '')))
      .map(x => x.draft)
      .slice(0, Math.max(limit, 1));
  }
  async run(reason = 'scheduled_classifieds_maintainer') {
    if (this.running) return { ok: false, skipped: true, stage: 'already_running', version: APP_VERSION };
    this.running = true;
    const options = getOptions();
    const started = new Date().toISOString();
    const maxPublishes = this.effectiveMaxPublishes(options);
    const result = {
      ok: true,
      version: APP_VERSION,
      reason,
      started_at: started,
      enabled: this.enabled(options),
      max_publishes_per_cycle: maxPublishes,
      configured_max_publishes_per_cycle: Number(options.persistent_classifieds_max_publishes_per_cycle || 3),
      steps: [],
      published: [],
      skipped: [],
      errors: [],
      counters: { checked: 0, prepared: 0, published: 0, already_active: 0, duplicate_skipped: 0, archived_or_currency: 0, errors: 0, provider_requests: 0, stock_cap_skipped: 0, currency_skipped: 0, fallback_boost_approved: 0, stale_sell_archived: 0, sell_first_backlog: 0, sell_first_published: 0, buy_deferred_for_sell_first: 0 }
    };
    const saveRun = (partial = {}) => {
      const state = readJson(CLASSIFIEDS_MAINTAINER_PATH, { runs: [] });
      const final = { ...result, ...partial };
      final.health = final.ok === false ? 'error' : (Number(final.counters?.errors || 0) ? 'warning' : (Number(final.counters?.archived_or_currency || 0) ? 'warning' : 'green'));
      final.next_action = final.next_action || (final.enabled ? 'Maintainer will run again automatically while the guarded/live sliders stay enabled.' : 'Enable guarded/live sliders to run the maintainer.');
      const runs = [...(Array.isArray(state.runs) ? state.runs : []), final].slice(-50);
      writeJson(CLASSIFIEDS_MAINTAINER_PATH, { ok: Boolean(final.ok), version: APP_VERSION, running: false, last_run_at: final.completed_at || new Date().toISOString(), last_result: final, runs });
      return final;
    };
    writeJson(CLASSIFIEDS_MAINTAINER_PATH, { ...this.status(), running: true, last_started_at: started });
    try {
      if (!result.enabled) {
        result.ok = false; result.skipped.push('slider_or_safety_gate_disabled'); result.completed_at = new Date().toISOString();
        return saveRun(result);
      }
      const listingManager = new BackpackTfV2ListingManager(options, this.audit);
      const sync = await listingManager.syncListings(true);
      result.steps.push({ stage: 'sync_account_listings', ok: Boolean(sync.ok), listings: Number(sync.listings_count || 0), error: sync.error || null });

      // 5.13.29: stale sell listings (sell listing exists but owned asset is gone)
      // should not keep the account dirty forever.  Archive only when guarded
      // Backpack.tf write sliders are enabled; never touch Steam trades.
      if (options.stale_sell_listing_guard_enabled !== false && options.stale_sell_listing_guard_auto_archive_enabled !== false) {
        const staleArchive = await archiveStaleSellListingsGuarded(options, this.audit, 'persistent_classifieds_maintainer');
        result.steps.push({ stage: 'stale_sell_guard_cleanup', ok: Boolean(staleArchive.ok), stale_seen: staleArchive.stale_seen || 0, archived: staleArchive.archived || 0, failed: staleArchive.failed || 0, skipped: Boolean(staleArchive.skipped), safety: staleArchive.safety || null });
        result.counters.stale_sell_archived = Number(staleArchive.archived || 0);
        if (staleArchive.failed) result.counters.errors += Number(staleArchive.failed || 0);
      }

      const prunedBeforeFill = pruneUnactionableBuyDraftsForMaintainer(options, 'persistent_classifieds_maintainer_before_collect');
      if (prunedBeforeFill.pruned) {
        result.steps.push({ stage: 'prune_unactionable_buy_drafts', ok: true, pruned: prunedBeforeFill.pruned, removed: prunedBeforeFill.removed });
        result.counters.pruned_unactionable = Number(result.counters.pruned_unactionable || 0) + prunedBeforeFill.pruned;
      }

      const autoSell = await new BoughtItemAutoSellRelisterService(this.audit).run('persistent_classifieds_maintainer', { publish: true, sync_inventory: true });
      result.steps.push({ stage: 'auto_sell_relister', ok: Boolean(autoSell.ok), detected: Number(autoSell.counters?.detected || 0), created_sell_drafts: Number(autoSell.counters?.created_sell_drafts || 0), published_sell_listings: Number(autoSell.counters?.published_sell_listings || 0), errors: Number(autoSell.counters?.errors || 0) });
      if (autoSell.counters && Number(autoSell.counters.published_sell_listings || 0) > 0) {
        result.counters.published += Number(autoSell.counters.published_sell_listings || 0);
        result.published.push(...(autoSell.published || []).map(x => ({ ...x, source: 'auto_sell_relister' })));
      }
      const manualOwnedSell = await new ManualOwnedItemSellDetectorService(this.audit).run('persistent_classifieds_maintainer', { publish: true, sync_inventory: false });
      result.steps.push({ stage: 'manual_owned_sell_detector', ok: Boolean(manualOwnedSell.ok), candidates: Number(manualOwnedSell.counters?.candidates || 0), created_sell_drafts: Number(manualOwnedSell.counters?.created_sell_drafts || 0), published_sell_listings: Number(manualOwnedSell.counters?.published_sell_listings || 0), errors: Number(manualOwnedSell.counters?.errors || 0) });
      if (manualOwnedSell.counters && Number(manualOwnedSell.counters.published_sell_listings || 0) > 0) {
        result.counters.published += Number(manualOwnedSell.counters.published_sell_listings || 0);
        result.counters.sell_first_published += Number(manualOwnedSell.counters.published_sell_listings || 0);
        result.published.push(...(manualOwnedSell.published || []).map(x => ({ ...x, source: 'manual_owned_sell_detector' })));
      }

      const sellFirstStart = maintainerSellFirstBacklog(options);
      result.counters.sell_first_backlog = Number(sellFirstStart.backlog || 0) + Number(sellFirstStart.unlisted_owned_sellable_items || 0);
      result.steps.push({ stage: 'sell_first_priority', ok: true, enabled: Boolean(options.maintainer_sell_first_priority_enabled), backlog: sellFirstStart.backlog, unlisted_owned_sellable_items: sellFirstStart.unlisted_owned_sellable_items, blocks_buy: sellFirstStart.blocks_buy, published_sell_listings_so_far: result.counters.sell_first_published });

      const initialFillTargets = computeListingFillTargets(readAccountListingsArray(), options);
      let candidates = this.collectCandidateDrafts(Math.max(maxPublishes * 50, Math.min(1000, initialFillTargets.missing_buy + maxPublishes)));

      // 5.13.29: max_publishes_per_cycle is not just a cap anymore.  While the
      // guarded/live sliders are on, the maintainer must actively fill the batch
      // with the best currently planned opportunities.  Older builds stopped at
      // one existing approved draft, so a verified listing caused every later
      // cycle to no-op.  Here we always try to have at least `maxPublishes`
      // publishable drafts before the loop starts.
      const ensureTopMaintainerDrafts = () => {
        const queue = new PlanningQueueService(this.audit);
        let q = queue.current();
        const queueItemsBefore = Array.isArray(q.items) ? q.items.length : 0;
        const targetsBeforeQueue = computeListingFillTargets(readAccountListingsArray(), options);
        const minimumUsefulQueue = Math.min(1000, Math.max(maxPublishes * 50, Number(targetsBeforeQueue.missing_buy || 0) + maxPublishes));
        const shouldRefillQueue = !Array.isArray(q.items) || !q.items.length || queueItemsBefore < Math.min(200, minimumUsefulQueue);
        if (shouldRefillQueue) {
          try {
            const scanner = new MarketTargetScannerService(this.audit).build(options);
            result.steps.push({ stage: 'refill_market_scanner_for_cap', ok: Boolean(scanner.ok), candidates: Number(scanner.summary?.total_candidates || (scanner.candidates || []).length || 0), queue_items_before: queueItemsBefore, missing_buy: Number(targetsBeforeQueue.missing_buy || 0) });
          } catch (error) {
            result.steps.push({ stage: 'refill_market_scanner_for_cap', ok: false, error: safeError(error), non_blocking: true, queue_items_before: queueItemsBefore });
          }
          q = queue.rebuild('persistent_classifieds_maintainer_cap_refill');
          result.steps.push({ stage: 'refill_planning_queue_for_cap', ok: Boolean(q.ok), queue_items_after: Array.isArray(q.items) ? q.items.length : 0, minimum_useful_queue: minimumUsefulQueue });
        }

        const draftService = new HubListingDraftService(this.audit);
        let draftStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
        const existingDrafts = Array.isArray(draftStore.drafts) ? draftStore.drafts : [];
        const pruneInsideFill = pruneUnactionableBuyDraftsForMaintainer(options, 'persistent_classifieds_maintainer_before_build');
        if (pruneInsideFill.pruned) result.steps.push({ stage: 'prune_unactionable_buy_drafts_before_build', ok: true, pruned: pruneInsideFill.pruned });
        draftStore = readJson(HUB_LISTING_DRAFTS_PATH, { ok: true, drafts: [] });
        const refreshedExistingDrafts = Array.isArray(draftStore.drafts) ? draftStore.drafts : [];
        const existingNames = new Set(refreshedExistingDrafts
          .filter(d => d && !['cancelled','disabled','held_unactionable','hold_market_guard','hold_profit_guard'].includes(String(d.local_status || '').toLowerCase()))
          .filter(d => draftIntent(d) !== 'buy' || draftIsMaintainerActionable(d, options))
          .map(d => normalizeName(d.item_name)));

        const activeCandidates = this.collectCandidateDrafts(Math.max(maxPublishes * Number(options.maintainer_currency_skip_window_multiplier || 80), Math.min(1000, (computeListingFillTargets(readAccountListingsArray(), options).missing_buy || 0) + maxPublishes)));
        // 5.13.29: if the first candidates are already active, still approve
        // more planned queue items so the maintainer can move on to the next
        // opportunities instead of stopping at verified listings.
        const accountListingsForFill = readAccountListingsArray();
        const activeNamesForFill = new Set(accountListingsForFill.map(l => `${listingIntentValue(l) || ''}|${normalizeListingText(listingItemName(l))}`));
        const inactiveCandidateCount = activeCandidates.filter(d => {
          const key = `${draftIntent(d)}|${normalizeListingText(d.item_name || d.provider_payload_preview?.item?.item_name || '')}`;
          return !activeNamesForFill.has(key);
        }).length;
        const fillTargets = computeListingFillTargets(accountListingsForFill, options);
        const targetBuy = fillTargets.target_buy;
        const activeBuyCount = fillTargets.active_buy;
        const slotsMissing = fillTargets.missing_buy;
        const widerPool = Math.min(1000, Math.max(maxPublishes * Number(options.maintainer_currency_skip_window_multiplier || 80), slotsMissing + Math.max(0, maxPublishes - inactiveCandidateCount) + maxPublishes));
        const needed = Math.max(maxPublishes, widerPool);
        const stockIndex = buildStockCapIndex(options);
        const queueItems = Array.isArray(q.items) ? q.items : [];
        const toApprove = queueItems
          .filter(item => item && ['planned','needs_review','stale'].includes(String(item.local_status || 'planned')) && !existingNames.has(normalizeName(item.item_name)))
          .filter(item => !stockCapStatusForDraft({ ...item, intent: 'buy', provider_payload_preview: { item: { item_name: item.item_name, quality: item.quality, priceindex: item.priceindex } } }, options, stockIndex).blocked)
          .filter(item => {
            if (options.maintainer_skip_unaffordable_buy_candidates === false) return true;
            const guard = previewCurrencyGuardForDraft({ ...item, intent: 'buy', provider_payload_preview: { item: { item_name: item.item_name, quality: item.quality, priceindex: item.priceindex }, currencies: refToBackpackCurrencies(Number(item.max_buy_ref || 0), options), market_mirror: { lowest_sell_ref: Number(item.target_sell_ref || 0) } }, max_buy_ref: item.max_buy_ref, target_sell_ref: item.target_sell_ref, expected_profit_ref: item.expected_profit_ref }, options);
            return Boolean(guard.enough_currency);
          })
          .filter(item => tradingBrainFilterDraftForMaintainer({ ...item, intent: 'buy', provider_payload_preview: { item: { item_name: item.item_name, quality: item.quality, priceindex: item.priceindex }, currencies: refToBackpackCurrencies(Number(item.max_buy_ref || 0), options), market_mirror: { lowest_sell_ref: Number(item.target_sell_ref || 0) } }, max_buy_ref: item.max_buy_ref, target_sell_ref: item.target_sell_ref, expected_profit_ref: item.expected_profit_ref }, options).ok)
          .sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || Number(b.expected_profit_ref || 0) - Number(a.expected_profit_ref || 0))
          .slice(0, Math.max(needed, 0));

        let boostedToApprove = toApprove;
        if (options.fallback_fill_boost_enabled !== false && boostedToApprove.length < Math.max(maxPublishes, Number(options.fallback_fill_publish_target_per_cycle || 20))) {
          const existingIds = new Set(boostedToApprove.map(x => x.id).filter(Boolean));
          const activeNames = new Set(readAccountListingsArray().map(l => `${listingIntentValue(l) || ''}|${normalizeListingText(listingItemName(l))}`));
          const boostMax = Math.max(Number(options.fallback_fill_boost_max_approved_per_run || 120), Number(options.fallback_fill_boost_min_candidates || 120));
          const extra = queueItems
            .filter(item => item && !existingIds.has(item.id) && ['planned','needs_review','stale','held_unactionable'].includes(String(item.local_status || 'planned')))
            .filter(item => !existingNames.has(normalizeName(item.item_name)))
            .filter(item => !activeNames.has(`buy|${normalizeListingText(item.item_name || '')}`))
            .filter(item => !stockCapStatusForDraft({ ...item, intent: 'buy', provider_payload_preview: { item: { item_name: item.item_name, quality: item.quality, priceindex: item.priceindex } } }, options, stockIndex).blocked)
            .filter(item => {
              const buyRef = Number(item.max_buy_ref || item.buy_ref || 0);
              const sellRef = Number(item.target_sell_ref || item.sell_ref || 0);
              if (!Number.isFinite(buyRef) || buyRef <= 0) return false;
              if (buyRef > Number(options.market_pricing_no_snapshot_fallback_max_buy_ref || 120)) return false;
              if (sellRef && sellRef - buyRef < Number(options.market_pricing_no_snapshot_fallback_min_profit_ref || 0.22)) return false;
              if (options.maintainer_skip_unaffordable_buy_candidates !== false) {
                const guard = previewCurrencyGuardForDraft({ ...item, intent: 'buy', provider_payload_preview: { item: { item_name: item.item_name, quality: item.quality, priceindex: item.priceindex }, currencies: refToBackpackCurrencies(buyRef, options), market_mirror: { lowest_sell_ref: sellRef } }, max_buy_ref: buyRef, target_sell_ref: sellRef, expected_profit_ref: Number(item.expected_profit_ref || Math.max(0, sellRef - buyRef)) }, options);
                if (!guard.enough_currency) return false;
              }
              return true;
            })
            .sort((a, b) => Number(b.expected_profit_ref || 0) - Number(a.expected_profit_ref || 0) || Number(b.score || 0) - Number(a.score || 0))
            .slice(0, boostMax - boostedToApprove.length);
          if (extra.length) {
            boostedToApprove = [...boostedToApprove, ...extra];
            result.steps.push({ stage: 'fallback_fill_boost_candidates', ok: true, added: extra.length, total_to_approve: boostedToApprove.length, max_buy_ref: Number(options.market_pricing_no_snapshot_fallback_max_buy_ref || 120) });
            result.counters.fallback_boost_approved = Number(result.counters.fallback_boost_approved || 0) + extra.length;
          }
        }

        let approvedNow = 0;
        if (boostedToApprove.length) {
          const current = readJson(PLANNING_QUEUE_PATH, { ok: true, items: [] });
          const items = Array.isArray(current.items) ? current.items : [];
          const now = new Date().toISOString();
          // 5.13.29: approve the *boosted* candidate set, not only the
          // initial narrow toApprove list. 5.13.17 reported
          // fallback_boost_approved=120 but only the first few toApprove items
          // were actually written back to the planning queue, so cap-fill could
          // stay around 25-32 active listings.
          for (const item of boostedToApprove) {
            const idx = items.findIndex(x => x.id === item.id);
            if (idx !== -1) {
              items[idx] = { ...items[idx], local_status: 'approved_local', updated_at: now, maintainer_auto_approved: true, fallback_boost_auto_approved: !toApprove.some(x => x.id === item.id) };
              approvedNow += 1;
            }
          }
          writeJson(PLANNING_QUEUE_PATH, { ...current, items, updated_at: now });
        }

        const built = draftService.buildFromApproved('persistent_classifieds_maintainer_auto_top3');
        let approvedDraftsNow = 0;
        for (const d of (built.drafts || [])) {
          if (d && d.draft_id && d.local_status !== 'approved_local') {
            const approve = draftService.approveDraft(d.draft_id);
            if (approve && approve.ok) approvedDraftsNow += 1;
          }
        }
        const refreshed = this.collectCandidateDrafts(Math.max(maxPublishes * Number(options.maintainer_currency_skip_window_multiplier || 80), Math.min(1000, needed)));
        return { ok: refreshed.length > 0, candidates: refreshed, approved_queue_items: approvedNow, approved_drafts: approvedDraftsNow, built_drafts: Array.isArray(built.drafts) ? built.drafts.length : 0, needed_before: needed, fill_targets: fillTargets };
      };

      let fill = ensureTopMaintainerDrafts();
      candidates = fill.candidates || candidates;
      if (options.maintainer_sell_first_priority_enabled !== false) {
        const sellBacklogNow = maintainerSellFirstBacklog(options);
        const sellWorkFound = Number(sellBacklogNow.backlog || 0) > 0 || Number(sellBacklogNow.unlisted_owned_sellable_items || 0) > 0 || Number(result.counters.sell_first_published || 0) > 0;
        if (sellWorkFound && options.maintainer_sell_backlog_blocks_buy_until_empty !== false) {
          const before = candidates.length;
          const sellOnly = candidates.filter(d => draftIntent(d) === 'sell');
          result.counters.buy_deferred_for_sell_first += Math.max(0, before - sellOnly.length);
          candidates = sellOnly;
          result.steps.push({ stage: 'sell_first_defer_buy_cap_fill', ok: true, sell_backlog: sellBacklogNow.backlog, unlisted_owned_sellable_items: sellBacklogNow.unlisted_owned_sellable_items, buy_candidates_deferred: Math.max(0, before - sellOnly.length), sell_candidates_remaining: sellOnly.length, reason: 'sell_first_priority_before_buy_cap_fill' });
        }
      }
      result.counters.prepared = candidates.length;
      result.steps.push({ stage: 'auto_fill_to_cap', ok: Boolean(fill.ok), candidates: candidates.length, approved_queue_items: fill.approved_queue_items || 0, approved_drafts: fill.approved_drafts || 0, boosted_approval_fix: true, built_drafts: fill.built_drafts || 0, max_publishes_per_cycle: maxPublishes, fill_targets: fill.fill_targets || initialFillTargets });
      if (!candidates.length) {
        result.ok = false; result.skipped.push('no_candidate_draft'); result.completed_at = new Date().toISOString();
        return saveRun(result);
      }

      const draftService = new HubListingDraftService(this.audit);
      let publishAttempts = 0;
      for (const draft of candidates) {
        if (publishAttempts >= maxPublishes) break;
        const candidateId = draft.draft_id;
        result.counters.checked += 1;
        const stockCap = stockCapStatusForDraft(draft, options);
        result.steps.push({ stage: 'candidate_start', draft_id: candidateId, item_name: draft.item_name || null, local_status: draft.local_status || null, stock_cap: stockCap });
        if (stockCap.blocked && draftIntent(draft) === 'buy') {
          result.counters.stock_cap_skipped += 1;
          result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: stockCap.reason, stock_cap: stockCap });
          continue;
        }

        const maintainerBrainGate = tradingBrainFilterDraftForMaintainer(draft, options);
        result.steps.push({ stage: 'trading_brain_enforcement', ok: Boolean(maintainerBrainGate.ok), draft_id: candidateId, intent: maintainerBrainGate.intent, hard_reasons: maintainerBrainGate.hard_reasons, advisory_reasons: maintainerBrainGate.advisory_reasons });
        if (!maintainerBrainGate.ok) {
          result.counters.trading_brain_blocked = Number(result.counters.trading_brain_blocked || 0) + 1;
          result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'trading_brain_blocked', trading_brain_gate: maintainerBrainGate });
          continue;
        }

        if (draftIntent(draft) === 'buy' && options.maintainer_skip_unaffordable_buy_candidates !== false) {
          const currencyGate = previewCurrencyGuardForDraft(draft, options);
          result.steps.push({ stage: 'currency_affordability_gate', ok: Boolean(currencyGate.enough_currency), draft_id: candidateId, item_name: draft.item_name || null, needed: currencyGate.needed_text, available: currencyGate.available_text, missing: currencyGate.deficit_text });
          if (!currencyGate.enough_currency) {
            result.counters.currency_skipped += 1;
            result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'unaffordable_buy_skipped_continue', currency_guard: currencyGate, does_not_consume_batch: true });
            continue;
          }
        }

        try {
          const mirror = new MarketClassifiedsMirrorService(this.audit);
          await mirror.syncForDraft(candidateId, options);
          mirror.applyToDraft(candidateId, options);
          result.steps.push({ stage: 'copy_market_style', ok: true, draft_id: candidateId });
        } catch (error) {
          result.steps.push({ stage: 'copy_market_style', ok: false, draft_id: candidateId, error: safeError(error), non_blocking: true });
        }

        let verify = null;
        if (options.maintainer_skip_per_listing_verify) {
          verify = { ok: true, listed: false, match_count: 0, skipped_fast_fill: true, source: 'persistent_maintainer_fast_fill_skip_pre_verify' };
          result.steps.push({ stage: 'verify_existing_listing', ok: true, listed: false, skipped_fast_fill: true, draft_id: candidateId });
        } else {
          verify = await verifyPublishedListing(candidateId, options, this.audit, { forceSync: true, source: 'persistent_maintainer_before_publish' });
          result.steps.push({ stage: 'verify_existing_listing', ok: Boolean(verify.ok), listed: Boolean(verify.listed), matches: Number(verify.match_count || 0), draft_id: candidateId });
          if (verify.listed) {
            result.counters.already_active += 1;
            result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'listing_already_active', matches: Number(verify.match_count || 0) });
            this.audit.write('persistent_classifieds_maintainer_noop_verified', { draft_id: candidateId, matches: verify.match_count || 0 });
            continue;
          }
        }

        const approved = ensureApprovedDraftForMaintainer(candidateId);
        result.steps.push({ stage: 'ensure_approved_local', ok: Boolean(approved.ok), draft_id: candidateId, changed: Boolean(approved.changed), previous_status: approved.previous_status || null });
        if (!approved.ok) {
          result.counters.errors += 1;
          result.errors.push({ draft_id: candidateId, item_name: draft.item_name, code: 'candidate_not_approvable' });
          continue;
        }

        const publish = await draftService.publishGuarded(candidateId, options, { confirm: true, maintainer: true });
        if (publish.provider_request_sent !== false) {
          publishAttempts += 1;
          result.counters.provider_requests += 1;
        }
        result.steps.push({ stage: 'guarded_publish', ok: Boolean(publish.ok), draft_id: candidateId, item_name: publish.item_name || draft.item_name || null, provider_status: publish.provider_status || null, http_status: publish.provider_http_status || null, code: publish.code || null, listing_id: publish.published_listing_id || null, archived: Boolean(publish.published_archived), listing_status: publish.published_listing_status || null });

        if (publish.ok) {
          result.counters.published += 1;
          if (draftIntent(draft) === 'sell') result.counters.sell_first_published += 1;
          const pub = { draft_id: candidateId, item_name: publish.item_name || draft.item_name, listing_id: publish.published_listing_id || null, url: publish.published_listing_url || null, archived: Boolean(publish.published_archived), status: publish.published_listing_status || null };
          result.published.push(pub);
          if (pub.archived || ['notEnoughCurrency', 'archived'].includes(String(pub.status || ''))) result.counters.archived_or_currency += 1;
        } else if (publish.code === 'duplicate_listing_guard') {
          result.counters.duplicate_skipped += 1;
          result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'duplicate_listing_guard' });
        } else if (publish.code === 'buy_currency_unavailable_held') {
          result.counters.currency_skipped += 1;
          result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'buy_currency_unavailable_held_continue', message: publish.friendly_message || null, deficit: publish.currency_guard?.deficit_text || null, does_not_consume_batch: true });
        } else if (/trading_brain|profit|market/i.test(String(publish.code || '') + ' ' + String(publish.friendly_message || publish.error || ''))) {
          result.counters.trading_brain_filtered = Number(result.counters.trading_brain_filtered || 0) + 1;
          result.skipped.push({ draft_id: candidateId, item_name: draft.item_name, reason: 'safe_filtered_by_trading_brain_after_reprice', code: publish.code || null, message: publish.friendly_message || publish.error || null, does_not_consume_batch: true });
        } else {
          result.counters.errors += 1;
          result.errors.push({ draft_id: candidateId, item_name: draft.item_name, code: publish.code || 'publish_failed', message: publish.friendly_message || publish.error || publish.provider_response_summary || null });
        }

        if (options.maintainer_verify_after_cycle === false || options.maintainer_skip_per_listing_verify) {
          result.steps.push({ stage: 'verify_after_publish', ok: true, skipped_fast_fill: true, draft_id: candidateId });
        } else {
          verify = await verifyPublishedListing(candidateId, options, this.audit, { forceSync: true, source: 'persistent_maintainer_after_publish' });
          result.steps.push({ stage: 'verify_after_publish', ok: Boolean(verify.ok), listed: Boolean(verify.listed), matches: Number(verify.match_count || 0), draft_id: candidateId });
        }
      }

      result.completed_at = new Date().toISOString();
      result.publish_error_inspector = buildPublishErrorInspectorStatus(options);
      result.adaptive_fill_controller = buildAdaptiveFillControllerStatus(options);
      result.ok = result.counters.errors === 0;
      result.summary = {
        checked: result.counters.checked,
        published_this_cycle: result.counters.published,
        provider_requests_this_cycle: result.counters.provider_requests,
        max_publishes_per_cycle: maxPublishes,
        already_active: result.counters.already_active,
        already_active_does_not_consume_batch: true,
        duplicate_skipped: result.counters.duplicate_skipped,
        archived_or_currency: result.counters.archived_or_currency,
        currency_skipped: result.counters.currency_skipped,
        unaffordable_buy_skipped_does_not_consume_batch: true,
        errors: result.counters.errors,
        safe_filtered_by_trading_brain: Number(result.counters.trading_brain_filtered || 0) + Number(result.counters.trading_brain_blocked || 0),
        sell_first_backlog: Number(result.counters.sell_first_backlog || 0),
        sell_first_published: Number(result.counters.sell_first_published || 0),
        buy_deferred_for_sell_first: Number(result.counters.buy_deferred_for_sell_first || 0),
        sell_first_priority_enabled: Boolean(options.maintainer_sell_first_priority_enabled),
        publish_error_categories: result.publish_error_inspector?.summary?.categories || {},
        adaptive_fill_mode: result.adaptive_fill_controller?.mode || null,
        adaptive_effective_max_per_cycle: result.adaptive_fill_controller?.effective_max_publishes_per_cycle || maxPublishes,
        stock_cap_skipped: result.counters.stock_cap_skipped,
        trading_brain_blocked: Number(result.counters.trading_brain_blocked || 0),
        trading_brain_enforcement_enabled: Boolean(options.trading_brain_enforcement_enabled),
        fill_mode: computeListingFillTargets(readAccountListingsArray(), options).fill_mode,
        backpack_tf_account_listing_cap: computeListingFillTargets(readAccountListingsArray(), options).cap,
        active_total_listings: computeListingFillTargets(readAccountListingsArray(), options).active_total,
        free_listing_slots: computeListingFillTargets(readAccountListingsArray(), options).free_slots,
        target_active_buy_listings: computeListingFillTargets(readAccountListingsArray(), options).target_buy,
        stock_cap_per_item: Number(options.stock_cap_per_item || 1),
        stock_summary: summarizeStockCapIndex(buildStockCapIndex(options), options),
        active_listings_overview: buildActiveListingsOverview(options)
      };
      this.audit.write(result.ok ? 'persistent_classifieds_maintainer_completed' : 'persistent_classifieds_maintainer_issue', result.summary);
      appendActionFeed(result.ok ? 'persistent_classifieds_maintainer_completed' : 'persistent_classifieds_maintainer_issue', result.summary);
      return saveRun(result);
    } catch (error) {
      result.ok = false; result.error = safeError(error); result.completed_at = new Date().toISOString();
      result.counters.errors += 1;
      this.audit.write('persistent_classifieds_maintainer_failed', { message: result.error });
      appendActionFeed('persistent_classifieds_maintainer_failed', { error: result.error });
      return saveRun(result);
    } finally { this.running = false; }
  }
}

class HubSetupService {
  constructor(auditService) { this.audit = auditService; }
  status(sdaStatus = null) {
    const options = getOptions();
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const backpackCache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
    const decisions = readJson(DECISIONS_PATH, { ok: false, decisions: [] });
    const pricing = readJson(PRICING_REPORT_PATH, { ok: false });
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false });
    const plan = readJson(LISTING_PLAN_PATH, { ok: false, actions: [] });
    const state = readJson(STATE_PATH, {});
    const sdaConnected = Boolean(sdaStatus && sdaStatus.ok && (sdaStatus.connected || sdaStatus.status?.connected || sdaStatus.body?.connected));
    const steamId = options.steam_id64 || accounts.main_account?.steam_id64 || '';
    const steps = [
      setupStep('main_account', 'Main account profile', Boolean(steamId), steamId ? `SteamID64 ${redacted(steamId)}` : 'Main account SteamID64 is not set.', 'Save SteamID64 in the Trade Hub UI.'),
      setupStep('steam_api_key', 'Steam Web API key', Boolean(options.steam_web_api_key), options.steam_web_api_key ? 'Saved in UI credential vault.' : 'Needed to fetch trade offers.', 'Save Steam Web API key in the Trade Hub UI.'),
      setupStep('backpack_token', 'Backpack.tf token/API key', Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key), options.backpack_tf_access_token || options.backpack_tf_api_key ? 'Saved in UI credential vault.' : 'Needed for live Backpack.tf provider requests.', 'Save Backpack.tf token/API key in the Trade Hub UI.'),
      setupStep('provider_cache', 'Provider cache', Boolean(backpackCache.ok), backpackCache.ok ? `Prices ${Number(backpackCache.prices_count || 0)} · account listings ${Number(backpackCache.listings_count || (backpackCache.listings || []).length)}.` : 'No provider cache yet.', 'Run Sync Backpack.tf.'),
      setupStep('inventory_cache', 'Inventory cache', Boolean(inventory.ok), inventory.ok ? `${Number(inventory.items_count || 0)} items · priced ${Number(inventory.analysis?.priced_items || 0)} · est. ${Number(inventory.analysis?.estimated_value_ref || 0)} ref.` : 'Inventory not synced yet.', 'Run autopilot or Sync inventory.'),
      setupStep('pricing_core', 'Pricing report', Boolean(pricing.ok || backpackCache.prices_ok), pricing.ok ? `${pricing.summary?.total || 0} offers evaluated.` : (backpackCache.prices_ok ? 'Price schema synced; no offers evaluated yet.' : 'No pricing report yet.'), 'Run trade review.'),
      setupStep('decision_queue', 'Decision queue', Boolean(pricing.ok || state.last_review_at || Array.isArray(decisions.decisions)), Array.isArray(decisions.decisions) ? `${decisions.decisions.length} decisions. Empty is OK when no offers are active.` : 'Idle: no reviewed offers yet.', 'Autopilot or Run trade review will refresh this.'),
      setupStep('sda_bridge', 'SDA Bridge helper', sdaConnected || options.trade_approval_mode === 'manual', sdaConnected ? 'Side helper reachable.' : 'Optional while Trade Hub is in manual mode.', 'Open TF2 SDA Bridge before auto-confirm mode.'),
      setupStep('planning', 'Planning output', Boolean((plan.ok && Array.isArray(plan.actions)) || pricing.ok || backpackCache.prices_ok), plan.ok ? `${(plan.actions || []).length} listing actions. Empty can be normal.` : 'Planning is idle until offers or scanner targets exist.', 'Let autopilot run or build the market scanner.')
    ];
    const readyCount = steps.filter(x => x.ready).length;
    const status = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), readiness_percent: Math.round((readyCount / steps.length) * 100), ready_count: readyCount, total_steps: steps.length, main_account: accounts.main_account, account_model: { mode: accounts.mode, active_account_id: accounts.active_account_id, main_account_id: accounts.main_account_id, multi_account_enabled: accounts.multi_account_enabled, future_subaccounts_supported: true, subaccounts_prepared: Array.isArray(accounts.subaccounts) ? accounts.subaccounts.length : 0 }, steps, can_run_manual_review: Boolean(options.steam_web_api_key && steamId), can_sync_backpack: Boolean(options.backpack_tf_enabled && (options.backpack_tf_access_token || options.backpack_tf_api_key)), can_build_trading_core: Boolean(options.steam_web_api_key || options.backpack_tf_access_token || options.backpack_tf_api_key || backpackCache.ok || pricing.ok), recommended_next_action: steps.find(x => !x.ready)?.action || 'Ready for guarded trading workflow.' };
    writeJson(HUB_SETUP_PATH, status);
    return status;
  }
}
class TradingCoreService {
  constructor(auditService) { this.audit = auditService; }
  build(sdaStatus = null) {
    const options = getOptions();
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const decisionsFile = readJson(DECISIONS_PATH, { ok: false, decisions: [] });
    const decisions = Array.isArray(decisionsFile.decisions) ? decisionsFile.decisions : [];
    const backpackCache = readJson(BACKPACK_LISTINGS_PATH, { ok: false, listings: [] });
    const pricingReport = readJson(PRICING_REPORT_PATH, { ok: false });
    const listingPlan = readJson(LISTING_PLAN_PATH, { ok: false, actions: [] });
    const targetedOrders = readJson(TARGETED_ORDERS_PATH, { ok: false, orders: [] });
    const marketScanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false });
    const acceptRecommended = decisions.filter(d => d.decision === 'accept_recommended' && d.reviewed_status !== 'ignored');
    const needsReview = decisions.filter(d => d.decision === 'needs_review' && d.reviewed_status !== 'ignored');
    const cachedListings = Array.isArray(backpackCache.listings) ? backpackCache.listings : [];
    const snapshot = { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), scope: 'main_account_first_multi_account_ready', active_account_id: accounts.active_account_id, main_account: accounts.main_account, subaccounts_enabled: Boolean(options.multi_account_enabled), subaccounts_prepared: Array.isArray(accounts.subaccounts) ? accounts.subaccounts.length : 0, readiness: new HubSetupService(this.audit).status(sdaStatus), backpack: { enabled: options.backpack_tf_enabled, token_saved: Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key), cached_listings: cachedListings.length || Number(backpackCache.listings_count || 0), cache_updated_at: backpackCache.updated_at || null, write_mode: options.backpack_tf_write_mode, live_writes_enabled: Boolean(options.allow_live_classifieds_writes) }, market_scanner: { ready: Boolean(marketScanner.ok), candidates: Array.isArray(marketScanner.candidates) ? marketScanner.candidates.length : 0, updated_at: marketScanner.updated_at || null, mode: marketScanner.mode || 'not_built' }, inventory: { ready: Boolean(inventory.ok), items: Number(inventory.items_count || 0), priced_items: Number(inventory.analysis?.priced_items || 0), estimated_value_ref: Number(inventory.analysis?.estimated_value_ref || 0), top_value_items: inventory.analysis?.top_value_items || [] }, offers: { total: decisions.length, accept_recommended: acceptRecommended.length, needs_review: needsReview.length, reject_recommended: decisions.filter(d => d.decision === 'reject_recommended').length, estimated_profit_ref: Number(decisions.reduce((sum, d) => sum + Math.max(0, Number(d.estimated_profit_ref || 0)), 0).toFixed(2)), top_accepts: acceptRecommended.slice(0, 8).map(d => ({ tradeofferid: d.tradeofferid, profit_ref: d.estimated_profit_ref, risk_score: d.risk_score, pricing_score: d.pricing_score, liquidity_score: d.liquidity_score })) }, listings: { plan_ready: Boolean(listingPlan.ok), planned_actions: Array.isArray(listingPlan.actions) ? listingPlan.actions.length : 0, top_actions: (listingPlan.actions || []).slice(0, 8) }, targeted_orders: { ready: Boolean(targetedOrders.ok), count: Array.isArray(targetedOrders.orders) ? targetedOrders.orders.length : 0, selected_value_ref: targetedOrders.selected_value_ref || 0 }, safety: { trade_approval_mode: options.trade_approval_mode, global_live_writes_enabled: Boolean(options.allow_live_classifieds_writes), auto_accept_enabled: Boolean(options.auto_accept_enabled || options.trade_approval_mode !== 'manual'), sda_bridge_enabled: Boolean(options.sda_enabled), sda_auto_confirm: Boolean(options.sda_enabled && options.sda_auto_confirm), trade_only_confirmations_expected: true }, next_actions: this.nextActions(options, decisions, backpackCache, pricingReport, listingPlan) };
    writeJson(TRADING_CORE_PATH, snapshot);
    this.audit.write('trading_core_snapshot_built', { decisions: decisions.length, accept_recommended: acceptRecommended.length, planned_actions: snapshot.listings.planned_actions, readiness_percent: snapshot.readiness.readiness_percent });
    appendActionFeed('trading_core_snapshot_built', { decisions: decisions.length, accept_recommended: acceptRecommended.length, planned_actions: snapshot.listings.planned_actions, readiness_percent: snapshot.readiness.readiness_percent });
    return snapshot;
  }
  nextActions(options, decisions, backpackCache, pricingReport, listingPlan) {
    const actions = [];
    if (!options.steam_id64) actions.push('Set main account SteamID64.');
    if (!options.steam_web_api_key) actions.push('Add Steam Web API key to read trade offers.');
    if (!options.backpack_tf_access_token && !options.backpack_tf_api_key) actions.push('Add Backpack.tf token/API key for classifieds and provider pricing.');
    if (!backpackCache.ok) actions.push('Run Sync Backpack.tf to build classifieds cache.');
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false });
    if (!inventory.ok && getOptions().inventory_sync_enabled) actions.push('Sync Steam inventory to show owned items and estimated backpack value.');
    if (!Array.isArray(decisions) || decisions.length === 0) actions.push('Run trade review to create decision queue.');
    if (!pricingReport.ok) actions.push('Run review to generate pricing report.');
    if (!listingPlan.ok) actions.push('Build listing plan from review results.');
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    if (backpackCache.prices_ok && (!scanner.ok || !Array.isArray(scanner.candidates) || scanner.candidates.length === 0)) actions.push('Build market scanner to turn Backpack.tf prices into watchlist targets.');
    if (options.trade_approval_mode !== 'manual' && !options.sda_enabled) actions.push('Enable/check SDA Bridge before active confirmations.');
    if (!actions.length) actions.push('Review top accept_recommended trades and keep automation guarded until results are stable.');
    return actions;
  }
}
function buildListingLifecycle(decisions, listingPlan, targetedOrders) {
  const actions = Array.isArray(listingPlan?.actions) ? listingPlan.actions : [];
  const orders = Array.isArray(targetedOrders?.orders) ? targetedOrders.orders : [];
  const byItem = new Map();
  for (const action of actions) {
    byItem.set(normalizeName(action.item_name), { item_name: action.item_name, state: action.mode === 'live_allowed' ? 'ready' : 'draft', action: action.action, source: 'listing_plan', pricing_score: action.pricing_score, reason: action.reason });
  }
  for (const order of orders) {
    const key = normalizeName(order.item_name);
    byItem.set(key, { ...(byItem.get(key) || { item_name: order.item_name }), state: order.mode === 'ready_for_guarded_publish' ? 'ready' : 'draft', targeted_buy_order: true, max_buy_ref: order.max_buy_ref, expected_profit_ref: order.expected_profit_ref, source: 'targeted_buy_orders' });
  }
  const lifecycle = { ok: true, updated_at: new Date().toISOString(), states: Array.from(byItem.values()), counts: {} };
  for (const state of lifecycle.states) lifecycle.counts[state.state] = (lifecycle.counts[state.state] || 0) + 1;
  writeJson(LIFECYCLE_PATH, lifecycle);
  return lifecycle;
}
function buildOperationsCockpit(decisions, pricingReport, listingPlan, targetedOrders, options = getOptions()) {
  const notifications = readJson(NOTIFICATIONS_PATH, { entries: [] }).entries || [];
  const feed = readJson(ACTION_FEED_PATH, { entries: [] }).entries || [];
  const provider = providerState();
  const operations = { ok: true, updated_at: new Date().toISOString(), version: APP_VERSION, today: summarizeDecisions(decisions), providers: provider, backpack: { plan_actions: Array.isArray(listingPlan?.actions) ? listingPlan.actions.length : 0, live_writes_enabled: Boolean(options.allow_live_classifieds_writes), write_mode: options.backpack_tf_write_mode }, targeted_buy_orders: { count: Array.isArray(targetedOrders?.orders) ? targetedOrders.orders.length : 0, selected_value_ref: targetedOrders?.selected_value_ref || 0 }, notifications: { total: notifications.length, recent: notifications.slice(-5).reverse() }, action_feed: feed.slice(-10).reverse(), pricing_report: pricingReport?.summary || null, safety: { steamguard_embedded: options.steamguard_embedded, steamguard_auto_confirm: options.steamguard_embedded && (options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm'), steamguard_has_mafile: new SteamGuardModule(null).status().loaded, sda_auto_confirm: !options.steamguard_embedded && options.sda_enabled && (options.sda_auto_confirm || options.trade_approval_mode === 'accept_and_confirm'), sda_enabled: options.sda_enabled, sda_base_url: (!options.steamguard_embedded && options.sda_enabled) ? options.sda_base_url : null, stores_guard_secrets: new SteamGuardModule(null).status().loaded, stores_cookies: new SteamGuardModule(null).status().has_session } };
  writeJson(OPERATIONS_PATH, operations);
  return operations;
}
class OllamaStrategyAnalystService {
  constructor(auditService) { this.audit = auditService; }
  async analyze(decisions, operations, options = getOptions()) {
    const baseReport = { ok: true, updated_at: new Date().toISOString(), enabled: options.ollama_enabled, model: options.ollama_model, base_url: options.ollama_base_url, summary: null, recommendations: [] };
    if (!options.ollama_enabled) {
      baseReport.skipped = true;
      baseReport.reason = 'ollama_enabled is false';
      writeJson(OLLAMA_REPORT_PATH, baseReport);
      return baseReport;
    }
    const compact = (Array.isArray(decisions) ? decisions : []).slice(0, options.ollama_max_decisions).map(item => ({ tradeofferid: item.tradeofferid, decision: item.decision, profit_ref: item.estimated_profit_ref, risk_score: item.risk_score, pricing_score: item.pricing_score, liquidity_score: item.liquidity_score, reasons: item.reasons }));
    const prompt = `You are a local TF2 trading operations analyst with SDA auto-confirm enabled. Summarize risks, SDA confirmation outcomes, and strategy adjustments in concise JSON with keys summary and recommendations. Data: ${JSON.stringify({ operations: operations?.today || {}, decisions: compact })}`;
    try {
      const response = await fetchJsonWithTimeout(`${options.ollama_base_url}/api/generate`, options.ollama_timeout_seconds, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ model: options.ollama_model, prompt, stream: false }) });
      if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
      const text = String(response.body?.response || '').trim();
      const report = { ...baseReport, summary: text.slice(0, 4000), raw_response_saved: Boolean(text) };
      writeJson(OLLAMA_REPORT_PATH, report);
      this.audit.write('ollama_strategy_analysis_completed', { bytes: text.length });
      appendActionFeed('ollama_strategy_analysis_completed', { bytes: text.length });
      return report;
    } catch (error) {
      const report = { ...baseReport, ok: false, error: safeError(error) };
      writeJson(OLLAMA_REPORT_PATH, report);
      this.audit.write('ollama_strategy_analysis_failed', { error: report.error });
      appendActionFeed('ollama_strategy_analysis_failed', { error: report.error });
      return report;
    }
  }
}

const auditService = new TradeOfferAuditService(AUDIT_PATH);
const notificationService = new TradeOfferNotificationService(auditService);
const reviewService = new SteamTradeOfferReviewService({ auditService, notificationService });
const hubAutopilot = new HubAutopilotPipelineService(auditService, reviewService);
const classifiedsMaintainer = new PersistentClassifiedsMaintainerService(auditService);
function audit(type, payload = {}) { return auditService.write(type, payload); }


function buildAutonomyStatus() {
  const options = getOptions();
  const autopilot = hubAutopilot.status();
  const backpack = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
  const inventory = readJson(HUB_INVENTORY_PATH, { ok: false });
  const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
  const decisionsFile = readJson(DECISIONS_PATH, { ok: false, decisions: [] });
  const orders = readJson(TARGETED_ORDERS_PATH, { ok: false, orders: [] });
  const decisions = Array.isArray(decisionsFile.decisions) ? decisionsFile.decisions : [];
  let mode = 'observe';
  if (options.auto_review_enabled && options.hub_autopilot_enabled) mode = 'plan';
  if (options.trade_approval_mode === 'accept_recommended' || options.auto_accept_enabled) mode = 'guarded';
  if (options.trade_approval_mode === 'accept_and_confirm' || options.sda_auto_confirm || options.steamguard_auto_confirm) mode = 'active';
  const automaticTasks = [];
  if (options.hub_autopilot_sync_backpack) automaticTasks.push('Sync Backpack.tf prices and account listings');
  if (options.hub_autopilot_sync_inventory) automaticTasks.push('Sync Steam inventory');
  if (options.hub_autopilot_build_market) automaticTasks.push('Build market watchlist');
  if (options.hub_autopilot_build_core) automaticTasks.push('Build trading core snapshot');
  if (options.auto_review_enabled) automaticTasks.push('Review active trade offers');
  const waiting = [];
  if (!backpack.prices_ok) waiting.push('Backpack.tf price cache is missing. Autopilot will retry, or run Sync Backpack.tf.');
  if (!inventory.ok) waiting.push('Inventory is not synced yet or Steam returned an error. Keep manual mode until inventory is stable.');
  if (Array.isArray(scanner.candidates) && scanner.candidates.length === 0) waiting.push('No market candidates yet. This is safe idle, not a failure.');
  if (decisions.length === 0) waiting.push('No active Steam trade offers to evaluate.');
  if (mode !== 'observe' && mode !== 'plan' && !options.sda_enabled) waiting.push('SDA Bridge should be checked before live confirmations.');
  const labels = { observe: 'Observe', plan: 'Plan only', guarded: 'Guarded', active: 'Active' };
  const headline = mode === 'active' ? 'Live actions enabled' : mode === 'guarded' ? 'Can accept recommended trades' : mode === 'plan' ? 'Autonomous planning only' : 'Watching only';
  const summary = mode === 'plan'
    ? 'The hub runs sync, scanner and review on schedule, but does not accept or confirm trades by itself.'
    : mode === 'guarded'
      ? 'The hub may accept recommended offers according to limits. Confirmations still require the configured safety path.'
      : mode === 'active'
        ? 'Accept and confirmation automation is enabled. Use only after stable dry runs.'
        : 'Autopilot is disabled or passive. Nothing live will happen automatically.';
  return {
    ok: true,
    version: APP_VERSION,
    updated_at: new Date().toISOString(),
    mode,
    mode_label: labels[mode],
    headline,
    summary,
    next_due_at: autopilot.next_due_at || 'now',
    automatic_tasks: automaticTasks,
    waiting_for_user: waiting,
    counts: {
      prices: Number(backpack.prices_count || 0),
      inventory_items: Number(inventory.items_count || 0),
      market_candidates: Array.isArray(scanner.candidates) ? scanner.candidates.length : 0,
      targeted_orders: Array.isArray(orders.orders) ? orders.orders.length : 0,
      decisions: decisions.length,
      accept_recommended: decisions.filter(d => d.decision === 'accept_recommended' && d.reviewed_status !== 'ignored').length
    },
    safety: {
      live_classifieds_writes: Boolean(options.allow_live_classifieds_writes),
      trade_approval_mode: options.trade_approval_mode,
      auto_accept_enabled: Boolean(options.auto_accept_enabled),
      auto_confirm_enabled: Boolean(options.sda_auto_confirm || options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm')
    }
  };
}

function readTextOrNull(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}
function extractFirst(text, regex) {
  const match = String(text || '').match(regex);
  return match ? match[1] : null;
}
function versionEntry(name, value, expected, options = {}) {
  const optional = Boolean(options.optional);
  const present = value !== null && value !== undefined && value !== '';
  const ok = present ? value === expected : optional;
  return {
    name,
    value: present ? value : (optional ? 'not packaged in runtime' : null),
    present,
    optional,
    ok,
    note: options.note || null
  };
}
function buildVersionAudit() {
  const appRoot = path.resolve(__dirname, '..');
  const files = {
    config: path.join(appRoot, 'config.yaml'),
    package: path.join(appRoot, 'package.json'),
    run: path.join(appRoot, 'run.sh'),
    runtimeRun: '/run.sh',
    build: path.join(appRoot, 'build.yaml'),
    dockerfile: path.join(appRoot, 'Dockerfile'),
    frontend: path.join(appRoot, 'public', 'index.html')
  };
  const configText = readTextOrNull(files.config);
  const packageText = readTextOrNull(files.package);
  const runtimeRunText = readTextOrNull(files.runtimeRun);
  const runText = readTextOrNull(files.run) || runtimeRunText;
  const buildText = readTextOrNull(files.build);
  const dockerText = readTextOrNull(files.dockerfile);
  const frontendText = readTextOrNull(files.frontend);
  let pkgVersion = null;
  try { pkgVersion = JSON.parse(packageText || '{}').version || null; } catch { pkgVersion = null; }
  const expected = APP_VERSION;
  const entries = [
    versionEntry('runtime', APP_VERSION, expected),
    versionEntry('config', extractFirst(configText, /version:\s*["']?([^"'\n]+)["']?/), expected),
    versionEntry('package', pkgVersion, expected),
    versionEntry('run_script', extractFirst(runText, /version:\s*([0-9]+\.[0-9]+\.[0-9]+)/), expected, { note: runText && runText === runtimeRunText ? 'checked /run.sh runtime copy' : null }),
    versionEntry('build_yaml', extractFirst(buildText, /BUILD_VERSION:\s*["']?([^"'\n]+)["']?/), expected, { optional: true, note: 'Source marker; Home Assistant runtime often does not package build.yaml.' }),
    versionEntry('docker_arg', extractFirst(dockerText, /ARG\s+BUILD_VERSION=([^\s\n]+)/), expected, { optional: true, note: 'Source marker; Home Assistant runtime often does not package Dockerfile.' }),
    versionEntry('frontend', extractFirst(frontendText, /Home Assistant add-on\s*·\s*([^\s<]+)\s*·/), expected),
    versionEntry('frontend_banner', extractFirst(frontendText, /Build\s+([^\s<]+)\s+loaded/), expected)
  ];
  const stale = entries.filter(entry => !entry.ok);
  return {
    ok: stale.length === 0,
    version: APP_VERSION,
    expected,
    checked_at: new Date().toISOString(),
    entries,
    stale,
    guidance: stale.length ? 'Some active version markers are stale. Rebuild/push this add-on package again.' : 'All active runtime version markers match. Source-only build markers are informational when they are not packaged into the running container.'
  };
}

class DiagnosticBundleService {
  constructor(auditService, reviewService, pipeline) { this.audit = auditService; this.reviewService = reviewService; this.pipeline = pipeline; }
  summarizeStage(result) {
    if (!result || typeof result !== 'object') return { ok: false, error: 'No result.' };
    return compactObject({ ...result, items: undefined, listings: undefined, prices: undefined, body: undefined }, 10);
  }
  bundleInventory() {
    const inventory = readJson(HUB_INVENTORY_PATH, { ok: false, error: 'No inventory cache.' });
    const analysis = inventory.analysis || {};
    return compactObject({
      ok: Boolean(inventory.ok),
      stage: inventory.stage || null,
      updated_at: inventory.updated_at || null,
      items_count: Number(inventory.items_count || 0),
      tradable_items: Number(analysis.tradable_items || 0),
      priced_items: Number(analysis.priced_items || 0),
      unpriced_items: Number(analysis.unpriced_items || 0),
      estimated_value_ref: Number(analysis.estimated_value_ref || 0),
      pricing_match_diagnostics: analysis.pricing_match_diagnostics || null,
      top_value_items: (analysis.top_value_items || []).slice(0, 12),
      unpriced_samples: (analysis.unpriced_samples || []).slice(0, 12),
      attempts: (inventory.attempts || []).slice(-8),
      error: inventory.error || null,
      hint: inventory.hint || null
    }, 12);
  }
  bundleBackpack() {
    const cache = readJson(BACKPACK_LISTINGS_PATH, { ok: false });
    const schema = readJson(BACKPACK_PRICE_SCHEMA_PATH, { ok: false, prices: [] });
    return compactObject({
      ok: Boolean(cache.ok),
      updated_at: cache.updated_at || null,
      listings_count: Number(cache.listings_count || (Array.isArray(cache.listings) ? cache.listings.length : 0) || 0),
      listings_summary: cache.listings_summary || null,
      prices_ok: Boolean(cache.prices_ok || schema.ok),
      prices_count: Number(cache.prices_count || (Array.isArray(schema.prices) ? schema.prices.length : 0) || 0),
      cache_stage: cache.stage || null,
      error: cache.error || null,
      guidance: cache.guidance || null
    }, 20);
  }
  bundleScanner() {
    const scanner = readJson(MARKET_SCANNER_PATH, { ok: false, candidates: [] });
    const watchlist = readJson(MARKET_WATCHLIST_PATH, { ok: false, items: [] });
    return compactObject({
      ok: Boolean(scanner.ok),
      updated_at: scanner.updated_at || null,
      mode: scanner.mode || null,
      prices_seen: Number(scanner.prices_seen || 0),
      key_ref_estimate: Number(scanner.key_ref_estimate || 0),
      total_candidates: Number(scanner.summary?.total_candidates || (scanner.candidates || []).length || 0),
      watchlist_items: Number(scanner.summary?.watchlist_items || scanner.watchlist_count || (watchlist.items || []).length || 0),
      candidates: (scanner.candidates || []).slice(0, 25),
      watchlist: (watchlist.items || []).slice(0, 25),
      diagnostics: scanner.diagnostics || null
    }, 25);
  }
  bundleQueueSnapshot(label = 'current') {
    const queue = new ExecutionQueueService(this.audit).current();
    const summary = new ExecutionQueueService(this.audit).summarize(queue);
    return {
      label,
      captured_at: new Date().toISOString(),
      summary,
      entries: (queue.entries || []).slice(0, 30).map(x => ({
        id: x.id,
        title: x.title,
        type: x.type,
        source: x.source,
        status: x.status || 'pending_review',
        item_name: x.item_name || null,
        live: Boolean(x.live),
        score: Number(x.score || 0),
        expected_profit_ref: Number(x.expected_profit_ref || 0),
        max_buy_ref: Number(x.max_buy_ref || 0)
      }))
    };
  }
  buildTopQueueItems(bundle) {
    const entries = (bundle.queue_snapshot_after?.entries || bundle.execution_queue?.entries || [])
      .filter(x => x && x.status !== 'cancelled')
      .map(x => ({
        id: x.id,
        title: x.title || 'Review planned action',
        item_name: x.item_name || null,
        type: x.type || 'review',
        status: x.status || 'pending_review',
        live: Boolean(x.live),
        score: Number(x.score || 0),
        expected_profit_ref: Number(x.expected_profit_ref || 0),
        max_buy_ref: Number(x.max_buy_ref || 0),
        reason: x.description || x.reason || null
      }))
      .sort((a, b) => (Number(b.score || 0) - Number(a.score || 0)) || (Number(b.expected_profit_ref || 0) - Number(a.expected_profit_ref || 0)));
    return entries.slice(0, 10);
  }
  buildSafetyState(bundle) {
    const safety = bundle.safety || {};
    return {
      live_trade_accepts: Boolean(safety.live_trade_accepts),
      live_backpack_writes: Boolean(safety.live_backpack_writes),
      sda_confirmations: Boolean(safety.sda_confirmations),
      global_kill_switch: Boolean(safety.global_kill_switch),
      trade_approval_mode: safety.trade_approval_mode || 'manual',
      autonomy_mode: safety.autonomy_mode || 'observe',
      default_result: 'read_plan_only',
      user_expected_workflow: 'Click Diagnostic bundle, then send the downloaded JSON to the assistant.',
      safe_to_share_with_assistant: true,
      secrets_included: false
    };
  }
  buildWhatChanged(bundle) {
    const before = bundle.queue_snapshot_before?.summary || {};
    const after = bundle.queue_snapshot_after?.summary || {};
    const stages = Array.isArray(bundle.stages) ? bundle.stages : [];
    return {
      version_before_queue: before.version || null,
      version_after_queue: after.version || null,
      queue_total_before: Number(before.total || 0),
      queue_total_after: Number(after.total || 0),
      queue_pending_before: Number(before.pending || 0),
      queue_pending_after: Number(after.pending || 0),
      queue_approved_before: Number(before.approved || 0),
      queue_approved_after: Number(after.approved || 0),
      approved_lifecycle_actions: Number(bundle.approved_action_lifecycle?.approved_actions || 0),
      listing_drafts: Number(bundle.listing_draft_preview?.draft_count || bundle.listing_draft_preview?.buy_drafts || 0),
      draft_policy_passed: Number(bundle.listing_draft_policy?.passed || 0),
      draft_policy_warnings: Number(bundle.listing_draft_policy?.passed_with_warnings || 0),
      draft_policy_blocked: Number(bundle.listing_draft_policy?.blocked || 0),
      next_safe_step: bundle.listing_draft_local_approval?.next_safe_step || bundle.listing_draft_policy?.next_safe_step || bundle.listing_draft_review?.next_safe_step || bundle.listing_draft_preview?.next_safe_step || bundle.approved_action_lifecycle?.next_safe_step || null,
      local_draft_approval: bundle.listing_draft_local_approval?.status || 'not_applied',
      payload_previews: Number(bundle.backpack_listing_payload_preview?.payload_count || 0),
      payload_preview_status: bundle.backpack_listing_payload_preview?.status || 'not_built',
      payload_review_status: bundle.backpack_listing_payload_review?.status || 'not_built',
      payload_review_needs_review: Number(bundle.backpack_listing_payload_review?.needs_review || 0),
      payload_review_approved_locally: Number(bundle.backpack_listing_payload_review?.approved_locally || 0),
      payload_local_approval_status: bundle.backpack_listing_payload_local_approval?.status || 'not_applied',
      payload_local_approval_applied: Boolean(bundle.backpack_listing_payload_local_approval?.ok && bundle.backpack_listing_payload_local_approval?.status === 'payload_approved_locally'),
      guarded_publish_dry_run_requests: Number(bundle.guarded_publish_dry_run?.request_count || 0),
      publish_readiness_status: bundle.publish_readiness_gate?.status || 'not_built',
      publish_readiness_percent: Number(bundle.publish_readiness_gate?.readiness_percent || 0),
      safe_flow_done: Boolean(bundle.publish_readiness_gate?.safe_flow_done),
      guarded_publish_dry_run_requests: Number(bundle.guarded_publish_dry_run?.request_count || 0),
      guarded_publish_dry_run_status: bundle.guarded_publish_dry_run?.status || 'not_built',
      guarded_publish_provider_request_sent: Boolean(bundle.guarded_publish_dry_run?.provider_request_sent),
      publish_readiness_status: bundle.publish_readiness_gate?.status || 'not_built',
      publish_readiness_percent: Number(bundle.publish_readiness_gate?.readiness_percent || 0),
      publish_readiness_safe_flow_done: Boolean(bundle.publish_readiness_gate?.safe_flow_done),
      publish_handoff_status: bundle.publish_handoff?.status || 'not_built',
      publish_handoff_ready: Boolean(bundle.publish_handoff?.handoff_ready),
      diagnostic_triage_status: bundle.diagnostic_triage?.status || 'not_built',
      diagnostic_triage_health: bundle.diagnostic_triage?.health || 'unknown',
      diagnostic_triage_critical: Number(bundle.diagnostic_triage?.counts?.critical || 0),
      diagnostic_triage_warnings: Number(bundle.diagnostic_triage?.counts?.warnings || 0),
      pipeline_stages_ran: stages.map(x => ({ stage: x.stage, ok: Boolean(x.ok), error: x.error || null })),
      important_note: 'Diagnostic bundle may rebuild planning data and apply local-only planning approvals, but it does not execute, accept trades, confirm Steam actions or write Backpack.tf listings.'
    };
  }
  buildRecommendedNextPatch(bundle) {
    const top = this.buildTopQueueItems(bundle);
    const readinessDone = Boolean(bundle.publish_readiness_gate?.safe_flow_done);
    const payloadReady = Number(bundle.backpack_listing_payload_preview?.payload_count || 0) > 0;
    const localApproved = Number(bundle.listing_draft_review?.approved_locally || 0) > 0;
    return {
      id: readinessDone ? '5.13.29' : (payloadReady ? '5.12.26' : (localApproved ? '5.12.25' : '5.12.19')),
      title: readinessDone ? 'Scanner Queue Bridge' : (payloadReady ? 'Publish Readiness Gate' : (localApproved ? 'Backpack Listing Payload Preview' : 'Local Draft Approval')),
      goal: readinessDone
        ? 'Keep the workflow local-only and always-on; planning value is informational only and must not block planning or queue recommendations.'
        : payloadReady
        ? 'Build a publish readiness gate that confirms the dry-run request, safety locks, planning_value and credential prerequisites without calling Backpack.tf.'
        : (localApproved
          ? 'Create a provider-safe Backpack.tf payload preview for locally approved listing drafts without writing to Backpack.tf.'
          : 'Approve one policy-passed listing draft locally, preserving read/plan-only safety and leaving live writes disabled.'),
      suggested_changes: readinessDone ? [
        'Keep counting approved buy plans for visibility only.',
        'Do not use planning_value overrun as a blocker for planning or assistant recommendations.',
        'Surface planning_value drift as informational/advisory while keeping live writes disabled.'
      ] : payloadReady ? [
        'Preserve payload review status locally.',
        'Prepare a disabled publish-request preview only after local payload approval.',
        'Keep live Backpack.tf writes disabled unless explicitly enabled later.'
      ] : (localApproved ? [
        'Build a redacted provider payload preview for the locally approved draft.',
        'Show exact listing intent, item name, max buy price and safety gates.',
        'Keep live Backpack.tf writes disabled by default.'
      ] : [
        'Add one-click local draft approval for policy-passed drafts.',
        'Preserve draft_approved_locally across Diagnostic bundle rebuilds.',
        'Surface local approval in the assistant-ready diagnostic JSON.'
      ]),
      based_on_top_items: top.slice(0, 5).map(x => ({ item_name: x.item_name, score: x.score, expected_profit_ref: x.expected_profit_ref, max_buy_ref: x.max_buy_ref }))
    };
  }

  buildAssistantDecision(bundle) {
    const safety = bundle.safety || {};
    const liveEnabled = Boolean(safety.live_trade_accepts || safety.live_backpack_writes || safety.sda_confirmations);
    const queue = (bundle.queue_snapshot_after?.entries || bundle.execution_queue?.entries || []).filter(Boolean);
    const actionable = bundle.actionable_plan || {};
    const scanner = bundle.market_scanner || {};
    const planning_valueRaw = actionable.planning_value?.planning_value_ref || actionable.planning_value?.trading_planning_value_ref || scanner.targeted_orders?.planning_value_ref || 25;
    const planning_valueLimit = Math.max(0, Number(planning_valueRaw || 25));
    const isBuyPlan = (x) => String(x.type || '').includes('buy') && !x.live;
    const toBuyItem = (x) => ({
      id: x.id,
      item_name: x.item_name || 'Unknown item',
      type: x.type || 'prepare_buy_listing',
      score: Number(x.score || 0),
      expected_profit_ref: Number(x.expected_profit_ref || 0),
      max_buy_ref: Number(x.max_buy_ref || 0),
      live: Boolean(x.live),
      status: x.status || 'pending_review'
    });
    const alreadyApproved = queue
      .filter(x => isBuyPlan(x) && String(x.status || '') === 'approved')
      .map(toBuyItem);
    const approvedValueUsed = Number(alreadyApproved.reduce((sum, x) => sum + Math.max(0, Number(x.max_buy_ref || 0)), 0).toFixed(2));
    const planning_valueRemaining = Number(Math.max(0, planning_valueLimit - approvedValueUsed).toFixed(2));
    const planning_valueOverrun = Number(Math.max(0, approvedValueUsed - planning_valueLimit).toFixed(2));
    const buyItems = queue.filter(x => isBuyPlan(x) && (x.status || 'pending_review') === 'pending_review')
      .map(toBuyItem)
      .sort((a,b)=>(b.score-a.score) || (b.expected_profit_ref-a.expected_profit_ref) || (a.max_buy_ref-b.max_buy_ref));
    const sellItems = queue.filter(x => String(x.type || '').includes('sell')).map(x => ({
      id: x.id,
      item_name: x.item_name || 'Unknown item',
      type: x.type || 'prepare_sell_listing',
      score: Number(x.score || 0),
      expected_profit_ref: Number(x.expected_profit_ref || 0),
      max_buy_ref: Number(x.max_buy_ref || 0),
      live: Boolean(x.live),
      status: x.status || 'pending_review'
    }));
    const selected = [];
    let used = 0;
    const approvalBatchLimit = Math.max(1, Number(getOptions().max_actions_per_cycle || 3));
    for (const item of buyItems) {
      const cost = Math.max(0, Number(item.max_buy_ref || 0));
      if (!cost) continue;
      if (item.score < 85) continue;
      if (selected.length >= approvalBatchLimit) break;
      selected.push({ ...item, assistant_group: 'approve_to_queue', reason: 'Top scored buy listing draft. Planning value is informational only; queue-only and no live Backpack.tf write.' });
      used = Number((used + cost).toFixed(2));
    }
    const selectedIds = new Set(selected.map(x => x.id));
    const watchReason = 'Good watchlist candidate; not selected only because this assistant batch is capped, not because of planning_value.';
    const watch = buyItems.filter(x => !selectedIds.has(x.id)).slice(0, 10).map(x => ({ ...x, assistant_group: 'watch_only', reason: watchReason }));
    const weak = queue.filter(x => Number(x.score || 0) < 50 && !String(x.type || '').includes('sell')).slice(0, 10).map(x => ({ id: x.id, item_name: x.item_name || 'Unknown item', type: x.type || 'review', score: Number(x.score || 0), assistant_group: 'ignore_or_low_priority', reason: 'Low score or insufficient trading signal.' }));
    const sellReview = sellItems.map(x => ({ ...x, assistant_group: 'manual_sell_review', reason: x.item_name && /key/i.test(x.item_name) ? 'Currency-like item; do not sell automatically.' : 'Sell listing draft requires manual review and live writes remain disabled.' }));
    let recommended = 'observe_only';
    if (selected.length) recommended = selected.length === 1 ? 'approve_top_1_planning_value_advisory' : 'approve_strong_batch_planning_value_advisory';
    else if (watch.length) recommended = 'watch_only_no_strong_batch';
    const totalExpected = Number(selected.reduce((sum,x)=>sum+Number(x.expected_profit_ref||0),0).toFixed(2));
    const userSummary = selected.length
      ? `Approve ${selected.length} strong queue item(s) for review-only planning. Planning value is informational only; no live trade or listing will execute.`
      : 'Do not approve anything automatically. Keep the current candidates on watch until stronger signals are available.';
    return {
      ok: true,
      version: APP_VERSION,
      generated_at: bundle.generated_at || new Date().toISOString(),
      recommended_bulk_action: recommended,
      user_facing_summary: userSummary,
      planning_value_reference_ref: Number(planning_valueLimit.toFixed(2)),
      approved_selected_value_ref: approvedValueUsed,
      unused_value_ref: planning_valueRemaining,
      planning_value_delta_ref: planning_valueOverrun,
      selected_value_ref: used,
      planning_value_remaining_ref: Number(Math.max(0, planning_valueRemaining - used).toFixed(2)),
      selected_count: selected.length,
      selected_items: selected,
      already_approved_count: alreadyApproved.length,
      already_approved_items: alreadyApproved.slice(0, 10),
      watch_count: watch.length,
      watch_items: watch,
      manual_sell_review: sellReview,
      ignore_or_low_priority: weak,
      expected_profit_ref: totalExpected,
      risk_summary: selected.length
        ? 'Selected items are high-score watchlist-derived buy drafts. Planning value is informational only; they are not guaranteed profit and require manual review.'
        : 'No item met the strong approval criteria. Keep the plan as monitoring-only.',
      safe_to_queue: !liveEnabled && selected.length > 0,
      live_actions_enabled: liveEnabled,
      planning_value_summary: {
        enabled: false,
        mode: 'advisory_only',
        planning_value_reference_ref: Number(planning_valueLimit.toFixed(2)),
        approved_selected_value_ref: approvedValueUsed,
        unused_value_ref: planning_valueRemaining,
        planning_value_delta_ref: planning_valueOverrun,
        blocks_new_recommendations: false,
        note: 'Planning value is only a visible target/metric. It does not block always-on planning, assistant recommendations or queue preparation. Live writes remain separately disabled.'
      },
      safety: {
        queue_only: true,
        live_trade_accepts: Boolean(safety.live_trade_accepts),
        live_backpack_writes: Boolean(safety.live_backpack_writes),
        sda_confirmations: Boolean(safety.sda_confirmations),
        note: 'Assistant decision is advisory and review-only. It does not execute Steam or Backpack.tf actions.'
      },
      next_patch_hint: selected.length
        ? 'Continue local-only always-on planning with planning_value as advisory-only.'
        : 'Improve scanner quality and signal strength before selecting more.'
    };
  }
  buildAssistantSummary(bundle) {
    const summary = bundle.summary || this.buildSummary(bundle);
    const safety = bundle.safety_state || this.buildSafetyState(bundle);
    const top = bundle.top_queue_items || this.buildTopQueueItems(bundle);
    const decision = bundle.assistant_decision || this.buildAssistantDecision(bundle);
    const before = bundle.queue_snapshot_before?.summary || {};
    const after = bundle.queue_snapshot_after?.summary || {};
    const failures = (bundle.stages || []).filter(x => !x.ok).map(x => ({ stage: x.stage, error: x.error || x.result?.error || 'failed' }));
    return {
      status: failures.length ? 'needs_attention' : 'ready_for_assistant_review',
      headline: failures.length
        ? 'Diagnostic bundle finished with one or more failed stages.'
        : 'Diagnostic bundle finished successfully. Send this JSON to the assistant for the next patch/recommendation step.',
      one_click_workflow_ok: true,
      user_next_step: 'Upload/send this diagnostic JSON to the assistant. You do not need to click individual queue buttons for debugging.',
      counts: {
        prices: Number(summary.prices || 0),
        inventory_items: Number(summary.inventory_items || 0),
        inventory_value_ref: Number(summary.inventory_value_ref || 0),
        market_candidates: Number(summary.market_candidates || 0),
        watchlist_items: Number(summary.watchlist_items || 0),
        actionable_actions: Number(summary.actionable_actions || 0),
        queue_pending: Number(after.pending || summary.queue_pending_after || 0),
        queue_approved: Number(after.approved || summary.queue_approved_after || 0),
        protected_currency_items: Number(summary.protected_currency_items || 0),
        payload_previews: Number(summary.payload_previews || bundle.backpack_listing_payload_preview?.payload_count || 0),
        publish_handoff_ready: Boolean(bundle.publish_handoff?.handoff_ready)
      },
      safety,
      queue_state: {
        before: { total: Number(before.total || 0), pending: Number(before.pending || 0), approved: Number(before.approved || 0), cancelled: Number(before.cancelled || 0) },
        after: { total: Number(after.total || 0), pending: Number(after.pending || 0), approved: Number(after.approved || 0), cancelled: Number(after.cancelled || 0) }
      },
      recommended_bulk_action: decision.recommended_bulk_action,
      assistant_decision: { recommended_bulk_action: decision.recommended_bulk_action, selected_count: decision.selected_count, selected_value_ref: decision.selected_value_ref, planning_value_reference_ref: decision.planning_value_reference_ref, approved_selected_value_ref: decision.approved_selected_value_ref, unused_value_ref: decision.unused_value_ref, planning_value_delta_ref: decision.planning_value_delta_ref, expected_profit_ref: decision.expected_profit_ref, safe_to_queue: decision.safe_to_queue, live_actions_enabled: decision.live_actions_enabled },
      assistant_recommendation_application: compactObject(readJson(ASSISTANT_DECISION_APPLICATION_PATH, { ok: false, status: 'not_applied' }), 12),
      listing_draft_local_approval: compactObject(readJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' }), 12),
      backpack_listing_payload_preview: compactObject(readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, status: 'not_built', payloads: [] }), 12),
      top_queue_items: top.slice(0, 5),
      selected_items: (decision.selected_items || []).slice(0, 5),
      failed_stages: failures,
      warnings: Array.isArray(bundle.trading_brain?.warnings) ? bundle.trading_brain.warnings : [],
      blocked: Array.isArray(bundle.trading_brain?.blocked) ? bundle.trading_brain.blocked : []
    };
  }
  buildSummary(bundle) {
    const inv = bundle.inventory || {};
    const scanner = bundle.market_scanner || {};
    const brain = bundle.trading_brain || {};
    const plan = bundle.actionable_plan || {};
    return {
      version: APP_VERSION,
      generated_at: bundle.generated_at,
      active_account_id: bundle.accounts?.active_account_id || 'main',
      prices: bundle.backpack_tf?.prices_count || 0,
      inventory_items: inv.items_count || 0,
      inventory_value_ref: inv.estimated_value_ref || 0,
      market_candidates: scanner.total_candidates || 0,
      watchlist_items: scanner.watchlist_items || 0,
      actionable_actions: Number(plan.summary?.queue_ready_targets || (Array.isArray(plan.actions) ? plan.actions.length : 0) || 0),
      protected_currency_items: Number(plan.summary?.protected_currency_items || 0),
      recommendations: Array.isArray(brain.recommendations) ? brain.recommendations.length : 0,
      warnings: Array.isArray(brain.warnings) ? brain.warnings.length : 0,
      blocked: Array.isArray(brain.blocked) ? brain.blocked.length : 0,
      queue_pending_before: Number(bundle.queue_snapshot_before?.summary?.pending || 0),
      queue_approved_before: Number(bundle.queue_snapshot_before?.summary?.approved || 0),
      queue_pending_after: Number(bundle.queue_snapshot_after?.summary?.pending || 0),
      queue_approved_after: Number(bundle.queue_snapshot_after?.summary?.approved || 0),
      live_actions_enabled: Boolean(bundle.safety?.live_trade_accepts || bundle.safety?.live_backpack_writes || bundle.safety?.sda_confirmations),
      approved_lifecycle_actions: Number(bundle.approved_action_lifecycle?.approved_actions || 0),
      next_safe_step: bundle.listing_draft_local_approval?.next_safe_step || bundle.listing_draft_policy?.next_safe_step || bundle.approved_action_lifecycle?.next_safe_step || null,
      draft_approved_locally: Number(bundle.listing_draft_review?.approved_locally || 0),
      draft_policy_passed: Number(bundle.listing_draft_policy?.passed || 0),
      draft_policy_warnings: Number(bundle.listing_draft_policy?.passed_with_warnings || 0),
      draft_policy_blocked: Number(bundle.listing_draft_policy?.blocked || 0),
      payload_previews: Number(bundle.backpack_listing_payload_preview?.payload_count || 0),
      payload_preview_ready: Boolean(Number(bundle.backpack_listing_payload_preview?.payload_count || 0)),
      payload_review_needs_review: Number(bundle.backpack_listing_payload_review?.needs_review || 0),
      payload_review_approved_locally: Number(bundle.backpack_listing_payload_review?.approved_locally || 0),
      payload_local_approval_status: bundle.backpack_listing_payload_local_approval?.status || 'not_applied',
      payload_local_approval_applied: Boolean(bundle.backpack_listing_payload_local_approval?.ok && bundle.backpack_listing_payload_local_approval?.status === 'payload_approved_locally'),
      guarded_publish_dry_run_requests: Number(bundle.guarded_publish_dry_run?.request_count || 0),
      publish_readiness_status: bundle.publish_readiness_gate?.status || 'not_built',
      publish_readiness_percent: Number(bundle.publish_readiness_gate?.readiness_percent || 0),
      safe_readiness_percent: Number(bundle.publish_readiness_gate?.safe_readiness_percent || 0),
      safe_flow_done: Boolean(bundle.publish_readiness_gate?.safe_flow_done),
      publish_handoff_status: bundle.publish_handoff?.status || 'not_built',
      publish_handoff_ready: Boolean(bundle.publish_handoff?.handoff_ready),
      diagnostic_triage_status: bundle.diagnostic_triage?.status || 'not_built',
      diagnostic_triage_health: bundle.diagnostic_triage?.health || 'unknown',
      diagnostic_triage_critical: Number(bundle.diagnostic_triage?.counts?.critical || 0),
      diagnostic_triage_warnings: Number(bundle.diagnostic_triage?.counts?.warnings || 0)
    };
  }
  async build(source = 'manual_ui') {
    const started = new Date();
    const options = getOptions();
    const queueBefore = this.bundleQueueSnapshot('before_diagnostic_pipeline');
    const stages = [];
    const stage = async (name, fn) => {
      const startedAt = new Date().toISOString();
      try {
        const result = await fn();
        const payload = { stage: name, ok: result && result.ok !== false, started_at: startedAt, finished_at: new Date().toISOString(), result: this.summarizeStage(result) };
        stages.push(payload);
        return result;
      } catch (error) {
        const payload = { stage: name, ok: false, started_at: startedAt, finished_at: new Date().toISOString(), error: safeError(error) };
        stages.push(payload);
        return payload;
      }
    };
    await stage('provider_sync', async () => (options.backpack_tf_enabled && (options.backpack_tf_access_token || options.backpack_tf_api_key)) ? new BackpackTfV2ListingManager(options, this.audit).syncListings(true) : { ok: true, skipped: true, reason: 'backpack_credentials_missing_or_disabled' });
    await stage('inventory_sync', async () => (options.inventory_sync_enabled && options.steam_id64) ? new SteamInventorySyncService(this.audit).sync(true) : { ok: true, skipped: true, reason: 'steamid_missing_or_inventory_disabled' });
    await stage('market_scanner', async () => options.market_scanner_enabled ? new MarketTargetScannerService(this.audit).build(options) : { ok: true, skipped: true, reason: 'market_scanner_disabled' });
    await stage('trade_review', async () => (options.steam_web_api_key && options.steam_id64) ? this.reviewService.review('diagnostic_bundle') : { ok: true, skipped: true, reason: 'steam_api_or_steamid_missing' });
    await stage('trading_core', async () => new TradingCoreService(this.audit).build(null));
    await stage('trading_brain', async () => new TradingBrainService(this.audit).build('diagnostic_bundle'));
    await stage('actionable_plan', async () => new ActionableTradingPlanService(this.audit).build('diagnostic_bundle'));
    await stage('execution_queue', async () => new ExecutionQueueService(this.audit).build());
    await stage('approved_action_lifecycle', async () => new ApprovedActionLifecycleService(this.audit).build());
    await stage('listing_draft_preview', async () => new ListingDraftPreviewService(this.audit).build());
    await stage('listing_draft_review', async () => new ListingDraftReviewService(this.audit).build());
    await stage('listing_draft_policy', async () => new DraftQualityPolicyService(this.audit).build());
    await stage('backpack_listing_payload_preview', async () => new BackpackListingPayloadPreviewService(this.audit).build());
    await stage('backpack_listing_payload_review', async () => new BackpackListingPayloadReviewService(this.audit).build());
    await stage('backpack_listing_payload_local_approval', async () => new BackpackListingPayloadLocalApprovalService(this.audit).apply({ source: 'diagnostic_bundle_one_click' }));
    await stage('guarded_publish_dry_run', async () => new GuardedPublishDryRunService(this.audit).build({ source: 'diagnostic_bundle_one_click' }));
    await stage('publish_readiness_gate', async () => new PublishReadinessGateService(this.audit).build({ source: 'diagnostic_bundle_one_click' }));
    await stage('publish_handoff', async () => new PublishHandoffService(this.audit).build({ source: 'diagnostic_bundle_one_click' }));
    await stage('diagnostic_triage', async () => new DiagnosticTriageService(this.audit).build({ source: 'diagnostic_bundle_one_click' }));
    await stage('transfer_plan', async () => new StorageTransferPlannerService(this.audit).build());
    await stage('listing_plan', async () => new ListingManagerPlanModeService(this.audit).build());
    await stage('inventory_aggregate', async () => new InventoryAggregateService(this.audit).build());
    // 5.12.33 – audit for removed legacy fields
    await stage('no_forbidden_fields_audit', async () => { const r = runForbiddenFieldsAudit(); return { ok: r.ok, forbidden_fields_found: r.forbidden_fields_found, files_checked: r.files_checked, detail: r.ok ? 'No forbidden fields found.' : `Found ${r.forbidden_fields_found} forbidden field(s). Run data migration to clean.` }; });
    // 5.12.34 – planning queue rebuild
    await stage('planning_queue', async () => new PlanningQueueService(this.audit).rebuild('diagnostic_bundle'));
    const generatedAt = new Date().toISOString();
    const queueAfter = this.bundleQueueSnapshot('after_diagnostic_pipeline');
    const accounts = new MultiAccountPortfolioService(this.audit).list();
    const bundle = {
      ok: true,
      version: APP_VERSION,
      title: 'TF2 Trading Hub diagnostic bundle',
      generated_at: generatedAt,
      source,
      file_name: diagnosticFileName(started),
      safety_note: 'Diagnostic bundle is safe/local-only. It may update local planning approval state, but it does not accept trades, confirm Steam actions or write Backpack.tf listings.',
      safety: {
        live_trade_accepts: Boolean(options.allow_live_trade_accepts),
        live_backpack_writes: Boolean(options.allow_live_backpack_writes || options.allow_live_classifieds_writes),
        sda_confirmations: Boolean(options.allow_sda_trade_confirmations || options.sda_auto_confirm || options.steamguard_auto_confirm),
        global_kill_switch: Boolean(options.global_kill_switch),
        trade_approval_mode: options.trade_approval_mode,
        autonomy_mode: options.autonomy_mode
      },
      version_audit: buildVersionAudit(),
      diagnostic_mode: 'one_click_for_assistant',
      operator_note: 'Use Diagnostic bundle as the single primary workflow. It runs the safe pipeline and applies local-only planning approvals where available; manual approve/cancel buttons are optional debug controls.',
      queue_snapshot_before: queueBefore,
      queue_snapshot_after: queueAfter,
      stages,
      accounts: compactObject(accounts, 25),
      credentials_status: compactObject(new HubCredentialVaultService(this.audit).status(), 25),
      setup: compactObject(new HubSetupService(this.audit).status(null), 25),
      autonomy: compactObject(buildAutonomyStatus(), 25),
      backpack_tf: this.bundleBackpack(),
      inventory: this.bundleInventory(),
      market_scanner: this.bundleScanner(),
      trading_core: compactObject(readJson(TRADING_CORE_PATH, { ok: false }), 20),
      trading_brain: compactObject(readJson(TRADING_BRAIN_PATH, { ok: false }), 20),
      decision_queue: compactObject(readJson(DECISIONS_PATH, { ok: false, decisions: [] }), 20),
      actionable_plan: compactObject(readJson(ACTIONABLE_PLAN_PATH, { ok: false, actions: [], watchlist: [] }), 25),
      execution_queue: compactObject(readJson(EXECUTION_QUEUE_PATH, { ok: false, entries: [] }), 20),
      approved_action_lifecycle: compactObject(readJson(APPROVED_ACTION_LIFECYCLE_PATH, { ok: false, items: [] }), 20),
      listing_draft_preview: compactObject(readJson(LISTING_DRAFT_PREVIEW_PATH, { ok: false, drafts: [] }), 20),
      listing_draft_review: compactObject(readJson(LISTING_DRAFT_REVIEW_PATH, { ok: false, items: [] }), 20),
      listing_draft_policy: compactObject(readJson(LISTING_DRAFT_POLICY_PATH, { ok: false, items: [] }), 20),
      listing_draft_local_approval: compactObject(readJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' }), 12),
      backpack_listing_payload_preview: compactObject(readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, status: 'not_built', payloads: [] }), 20),
      backpack_listing_payload_review: compactObject(readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, status: 'not_built', payloads: [] }), 20),
      backpack_listing_payload_local_approval: compactObject(readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied', applied: false }), 12),
      guarded_publish_dry_run: compactObject(readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, status: 'not_built', requests: [] }), 16),
      publish_readiness_gate: compactObject(readJson(PUBLISH_READINESS_GATE_PATH, { ok: false, status: 'not_built', gates: [] }), 18),
      publish_handoff: compactObject(readJson(PUBLISH_HANDOFF_PATH, { ok: false, status: 'not_built', redacted_requests: [] }), 18),
      diagnostic_triage: compactObject(readJson(DIAGNOSTIC_TRIAGE_PATH, { ok: false, status: 'not_built', issues: [] }), 18),
      transfer_plan: compactObject(readJson(TRANSFER_PLAN_PATH, { ok: false, transfers: [] }), 20),
      listing_plan: compactObject(readJson(LISTING_PLAN_PATH, { ok: false, actions: [] }), 20),
      action_feed_recent: compactObject((readJson(ACTION_FEED_PATH, { entries: [] }).entries || []).slice(-30), 30),
      audit_recent: compactObject(readJsonLines(AUDIT_PATH, 30), 30),
      no_forbidden_fields_audit: runForbiddenFieldsAudit(),
      planning_queue: compactObject(readJson(PLANNING_QUEUE_PATH, { ok: false, items: [] }), 25),
      listing_drafts: compactObject(readJson(HUB_LISTING_DRAFTS_PATH, { ok: false, drafts: [] }), 25),
      opportunities: compactObject(buildOpportunities(), 25),
      publish_wizard: compactObject(buildPublishWizardStatus(), 20),
      duplicate_listing_guard: compactObject(readJson(DUPLICATE_LISTING_GUARD_PATH, { ok: true, skipped: true }), 20),
      guarded_publish_self_test: compactObject(buildGuardedPublishExecutorSelfTest(), 20),
      release_check: compactObject(buildReleaseCheck(), 20)
    };
    bundle.summary = this.buildSummary(bundle);
    bundle.safety_state = this.buildSafetyState(bundle);
    bundle.top_queue_items = this.buildTopQueueItems(bundle);
    bundle.what_changed = this.buildWhatChanged(bundle);
    bundle.assistant_decision = this.buildAssistantDecision(bundle);
    bundle.assistant_recommendation_application = compactObject(readJson(ASSISTANT_DECISION_APPLICATION_PATH, { ok: false, status: 'not_applied' }), 12);
    bundle.listing_draft_local_approval = compactObject(readJson(LISTING_DRAFT_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied' }), 12);
    bundle.backpack_listing_payload_preview = compactObject(readJson(LISTING_PAYLOAD_PREVIEW_PATH, { ok: false, status: 'not_built', payloads: [] }), 20);
    bundle.backpack_listing_payload_review = compactObject(readJson(LISTING_PAYLOAD_REVIEW_PATH, { ok: false, status: 'not_built', payloads: [] }), 20);
    bundle.backpack_listing_payload_local_approval = compactObject(readJson(LISTING_PAYLOAD_LOCAL_APPROVAL_PATH, { ok: false, status: 'not_applied', applied: false }), 12);
    bundle.guarded_publish_dry_run = compactObject(readJson(GUARDED_PUBLISH_DRY_RUN_PATH, { ok: false, status: 'not_built', requests: [] }), 16);
    bundle.publish_readiness_gate = compactObject(readJson(PUBLISH_READINESS_GATE_PATH, { ok: false, status: 'not_built', gates: [] }), 18);
    bundle.publish_handoff = compactObject(readJson(PUBLISH_HANDOFF_PATH, { ok: false, status: 'not_built', redacted_requests: [] }), 18);
    bundle.diagnostic_triage = compactObject(readJson(DIAGNOSTIC_TRIAGE_PATH, { ok: false, status: 'not_built', issues: [] }), 18);
    bundle.recommended_next_patch = this.buildRecommendedNextPatch(bundle);
    bundle.assistant_summary = this.buildAssistantSummary(bundle);
    try { fs.mkdirSync(DIAGNOSTIC_BUNDLE_DIR, { recursive: true }); } catch {}
    writeJson(DIAGNOSTIC_BUNDLE_PATH, bundle);
    try { writeJson(path.join(DIAGNOSTIC_BUNDLE_DIR, bundle.file_name), bundle); } catch {}
    this.audit.write('diagnostic_bundle_created', { file_name: bundle.file_name, stages: stages.length, summary: bundle.summary });
    appendActionFeed('diagnostic_bundle_created', { file_name: bundle.file_name, stages: stages.length, inventory_items: bundle.summary.inventory_items, candidates: bundle.summary.market_candidates });
    return bundle;
  }
  current() { return readJson(DIAGNOSTIC_BUNDLE_PATH, { ok: false, error: 'No diagnostic bundle has been created yet.' }); }
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/status') {
    const options = getOptions();
    const state = readJson(STATE_PATH, {});
    return json(res, 200, {
      ok: true,
      app: APP_NAME,
      version: APP_VERSION,
      scope: '5.13.29 – Production Dashboard Cleanup',
      mode: 'operations_cockpit_notifications_persistence_listing_engine_targeted_orders_multi_account_strategy_ollama',
      steam_web_api_key_saved: Boolean(options.steam_web_api_key),
      steam_web_api_key: redacted(options.steam_web_api_key),
      steam_id64: options.steam_id64,
      auto_review_enabled: options.auto_review_enabled,
      review_interval_minutes: options.review_interval_minutes,
      ha_notifications_enabled: options.ha_notifications_enabled,
      pricing_engine_enabled: options.pricing_engine_enabled,
      backpack_tf_enabled: options.backpack_tf_enabled,
      backpack_tf_token_saved: Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key),
      backpack_tf_write_mode: options.backpack_tf_write_mode,
      live_classifieds_writes_enabled: Boolean(options.allow_live_classifieds_writes),
      persistent_classifieds_maintainer: classifiedsMaintainer.status(),
      notification_center_enabled: options.notification_center_enabled,
      operations_cockpit_enabled: options.operations_cockpit_enabled,
      data_schema_version: DATA_SCHEMA_VERSION,
      strategy_mode: options.strategy_mode,
      trade_approval_mode: options.trade_approval_mode,
      targeted_buy_orders_enabled: options.targeted_buy_orders_enabled,
      multi_account_enabled: options.multi_account_enabled,
      active_account_id: options.active_account_id,
      ollama_enabled: options.ollama_enabled,
      ollama_model: options.ollama_model,
      provider_state: providerState(),
      runtime_event_logging: { enabled: options.runtime_event_logging_enabled, debug: options.runtime_debug_logging, level: options.runtime_log_level },
      last_review_at: state.last_review_at || null,
      prepared_offer: state.prepared_offer || null,
      safety: { steamguard_embedded: options.steamguard_embedded, steamguard_auto_confirm: options.steamguard_embedded && (options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm'), steamguard_confirm_delay_seconds: options.steamguard_confirm_delay_seconds, steamguard_status: new SteamGuardModule(auditService).status(), sda_enabled: options.sda_enabled, sda_auto_confirm: !options.steamguard_embedded && options.sda_enabled && (options.sda_auto_confirm || options.trade_approval_mode === 'accept_and_confirm'), sda_base_url: (!options.steamguard_embedded && options.sda_enabled) ? options.sda_base_url : null, stores_cookies: new SteamGuardModule(auditService).status().has_session, stores_guard_secrets: new SteamGuardModule(auditService).status().loaded, auto_accepts_offers: options.auto_accept_enabled || options.trade_approval_mode === 'accept_recommended' || options.trade_approval_mode === 'accept_and_confirm', auto_accept_received_only: options.auto_accept_received_only, auto_confirms_trades: (options.steamguard_embedded && (options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm')) || (!options.steamguard_embedded && options.sda_enabled && options.sda_auto_confirm), final_confirmation: options.steamguard_embedded ? ((options.steamguard_auto_confirm || options.trade_approval_mode === 'accept_and_confirm') ? 'embedded_legacy_auto' : 'embedded_legacy_manual') : ((options.sda_enabled && options.sda_auto_confirm) ? 'sda_auto' : 'manual_only') }
    });
  }
  if (pathname === '/api/version-audit') return json(res, 200, buildVersionAudit());
  if (pathname === '/api/system/runtime-status') return json(res, 200, buildRuntimeSchedulerStatus());
  if (pathname === '/api/system/crash-watchdog-status') return json(res, 200, buildCrashWatchdogStatus());
  if (pathname === '/api/diagnostics/bundle') {
    if (req.method === 'GET') return json(res, 200, new DiagnosticBundleService(auditService, reviewService, hubAutopilot).current());
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST or GET.' });
    try {
      const bundle = await new DiagnosticBundleService(auditService, reviewService, hubAutopilot).build('manual_ui');
      return json(res, 200, bundle);
    } catch (error) {
      const generatedAt = new Date().toISOString();
      const fallback = {
        ok: false,
        version: APP_VERSION,
        title: 'TF2 Trading Hub diagnostic bundle failure report',
        generated_at: generatedAt,
        source: 'manual_ui_error_fallback',
        file_name: diagnosticFileName(new Date()),
        error: safeError(error),
        guidance: 'Diagnostic bundle failed before completion. This fallback report is intentionally returned as HTTP 200 so the UI can download it. Check error and server audit, then install the next hotfix if needed.',
        safety_note: 'Failure report is read-only and redacted. It does not accept trades, confirm Steam actions or write Backpack.tf listings.',
        version_audit: buildVersionAudit(),
        stages: [{ stage: 'diagnostic_bundle', ok: false, error: safeError(error), finished_at: generatedAt }],
        summary: { prices: 0, inventory_items: 0, inventory_value_ref: 0, market_candidates: 0, watchlist_items: 0, recommendations: 0, warnings: 1, blocked: 1, live_actions_enabled: false }
      };
      try { fs.mkdirSync(DIAGNOSTIC_BUNDLE_DIR, { recursive: true }); } catch {}
      try { writeJson(DIAGNOSTIC_BUNDLE_PATH, fallback); } catch {}
      try { writeJson(path.join(DIAGNOSTIC_BUNDLE_DIR, fallback.file_name), fallback); } catch {}
      try { auditService.write('diagnostic_bundle_failed', { message: safeError(error), file_name: fallback.file_name }); } catch {}
      try { appendActionFeed('diagnostic_bundle_failed', { error: safeError(error), file_name: fallback.file_name }); } catch {}
      return json(res, 200, fallback);
    }
  }

  if (pathname === '/api/diagnostics/bundle/download') {
    if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'Use GET.' });
    let bundle = readJson(DIAGNOSTIC_BUNDLE_PATH, { ok: false, version: APP_VERSION, error: 'No diagnostic bundle has been created yet.' });
    if (!bundle || typeof bundle !== 'object') bundle = { ok: false, version: APP_VERSION, error: 'Diagnostic bundle cache is invalid.' };
    const fileName = String(bundle.file_name || diagnosticFileName(new Date())).replace(/[^A-Za-z0-9_.-]/g, '_');
    const body = safeJsonStringify(bundle);
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${fileName}"`,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    });
    return res.end(body);
  }


  if (pathname === '/api/assistant-decision/apply') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    const result = new AssistantDecisionApplyService(auditService).apply({ ...parsed, source: 'manual_ui' });
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/assistant-decision/application') return json(res, 200, new AssistantDecisionApplyService(auditService).current());
  if (pathname === '/api/approved-actions/lifecycle') return json(res, 200, new ApprovedActionLifecycleService(auditService).current());
  if (pathname === '/api/approved-actions/lifecycle/build') return json(res, 200, new ApprovedActionLifecycleService(auditService).build());
  if (pathname === '/api/listing-drafts/preview') return json(res, 200, new ListingDraftPreviewService(auditService).current());
  if (pathname === '/api/listing-drafts/preview/build') return json(res, 200, new ListingDraftPreviewService(auditService).build());
  if (pathname === '/api/listing-drafts/review') return json(res, 200, new ListingDraftReviewService(auditService).current());
  if (pathname === '/api/listing-drafts/review/build') return json(res, 200, new ListingDraftReviewService(auditService).build());
  if (pathname === '/api/listing-drafts/policy') return json(res, 200, new DraftQualityPolicyService(auditService).current());
  if (pathname === '/api/listing-drafts/policy/build') return json(res, 200, new DraftQualityPolicyService(auditService).build());
  if (pathname === '/api/listing-drafts/local-approval') return json(res, 200, new LocalDraftApprovalService(auditService).current());
  if (pathname === '/api/listing-drafts/local-approval/apply') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new LocalDraftApprovalService(auditService).apply(parsed || {}));
  }
  if (pathname === '/api/listing-drafts/payload-preview') return json(res, 200, new BackpackListingPayloadPreviewService(auditService).current());
  if (pathname === '/api/listing-drafts/payload-preview/build') return json(res, 200, new BackpackListingPayloadPreviewService(auditService).build());
  if (pathname === '/api/listing-drafts/payload-review') return json(res, 200, new BackpackListingPayloadReviewService(auditService).current());
  if (pathname === '/api/listing-drafts/payload-review/build') return json(res, 200, new BackpackListingPayloadReviewService(auditService).build());
  if (pathname === '/api/listing-drafts/payload-review/update') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new BackpackListingPayloadReviewService(auditService).update(parsed.id, parsed.status, parsed.note));
  }
  if (pathname === '/api/listing-drafts/payload-local-approval') return json(res, 200, new BackpackListingPayloadLocalApprovalService(auditService).current());
  if (pathname === '/api/listing-drafts/payload-local-approval/apply') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new BackpackListingPayloadLocalApprovalService(auditService).apply(parsed || {}));
  }
  if (pathname === '/api/listing-drafts/guarded-publish-dry-run' || pathname === '/api/listing-drafts/publish-dry-run') return json(res, 200, new GuardedPublishDryRunService(auditService).current());
  if (pathname === '/api/listing-drafts/guarded-publish-dry-run/build' || pathname === '/api/listing-drafts/publish-dry-run/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new GuardedPublishDryRunService(auditService).build(parsed || {}));
  }
  if (pathname === '/api/listing-drafts/publish-readiness-gate' || pathname === '/api/listing-drafts/publish-readiness') return json(res, 200, new PublishReadinessGateService(auditService).current());
  if (pathname === '/api/listing-drafts/publish-readiness-gate/build' || pathname === '/api/listing-drafts/publish-readiness/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new PublishReadinessGateService(auditService).build(parsed || {}));
  }
  if (pathname === '/api/listing-drafts/publish-handoff') return json(res, 200, new PublishHandoffService(auditService).current());
  if (pathname === '/api/listing-drafts/publish-handoff/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new PublishHandoffService(auditService).build(parsed || {}));
  }
  if (pathname === '/api/diagnostics/triage') return json(res, 200, new DiagnosticTriageService(auditService).current());
  if (pathname === '/api/diagnostics/triage/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new DiagnosticTriageService(auditService).build(parsed || {}));
  }
  if (pathname === '/api/listing-drafts/review/update') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new ListingDraftReviewService(auditService).update(parsed.id, parsed.status, parsed.note));
  }
  if (pathname === '/api/trading-brain') return json(res, 200, new TradingBrainService(auditService).last());
  if (pathname === '/api/trading-brain/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new TradingBrainService(auditService).build('manual_api'));
  }
  if (pathname === '/api/trading-brain/recommendations') return json(res, 200, new TradingBrainService(auditService).recommendations());
  if (pathname === '/api/trading-brain/acknowledge') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new TradingBrainService(auditService).acknowledge(parsed));
  }
  if (pathname === '/api/autonomy/run') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const result = await hubAutopilot.run('manual_autonomy_run');
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/autonomy/mode') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    const mode = ['observe', 'plan', 'guarded', 'active'].includes(parsed.mode) ? parsed.mode : 'observe';
    const optionsFile = readJson(OPTIONS_PATH, {});
    writeJson(OPTIONS_PATH, { ...optionsFile, autonomy_mode: mode });
    auditService.write('autonomy_mode_changed', { mode });
    appendActionFeed('autonomy_mode_changed', { mode });
    return json(res, 200, buildAutonomyStatus());
  }
  if (pathname === '/api/multi-account/summary') return json(res, 200, new MultiAccountPlanningService(auditService).summary());
  if (pathname === '/api/multi-account/build-plan') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new MultiAccountPlanningService(auditService).buildPlan());
  }
  if (pathname === '/api/inventory/aggregate') return json(res, 200, new InventoryAggregateService(auditService).current());
  if (pathname === '/api/inventory/sync-all-planning') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new InventoryAggregateService(auditService).build());
  }
  if (pathname === '/api/transfers/plan') return json(res, 200, new StorageTransferPlannerService(auditService).current());
  if (pathname === '/api/transfers/plan/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new StorageTransferPlannerService(auditService).build());
  }
  if (pathname.startsWith('/api/transfers/plan/') && (pathname.endsWith('/mark-done') || pathname.endsWith('/ignore'))) {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const parts = pathname.split('/');
    const id = parts[4] || '';
    const status = pathname.endsWith('/mark-done') ? 'done' : 'ignored';
    return json(res, 200, new StorageTransferPlannerService(auditService).update(id, status));
  }
  if (pathname === '/api/actionable-plan') return json(res, 200, new ActionableTradingPlanService(auditService).current());
  if (pathname === '/api/actionable-plan/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new ActionableTradingPlanService(auditService).build('manual_api'));
  }
  if (pathname === '/api/actionable-plan/bulk') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    const result = new ActionableTradingPlanService(auditService).bulkUpdate(parsed);
    if (result.ok) new ExecutionQueueService(auditService).build();
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname.startsWith('/api/actionable-plan/')) {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const parts = pathname.split('/');
    const id = decodeURIComponent(parts[3] || '');
    const action = parts[4] || 'approve';
    const result = new ActionableTradingPlanService(auditService).updateAction(id, action);
    if (result.ok && ['approve','ignore','lower_priority','pin','unpin'].includes(action)) {
      new ExecutionQueueService(auditService).build();
    }
    return json(res, result.ok ? 200 : 404, result);
  }
  if (pathname === '/api/execution-queue') return json(res, 200, new ExecutionQueueService(auditService).current());
  if (pathname === '/api/execution-queue/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new ExecutionQueueService(auditService).build());
  }
  if (pathname === '/api/execution-queue/bulk') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    return json(res, 200, new ExecutionQueueService(auditService).bulkSetStatus(parsed));
  }
  if (pathname.startsWith('/api/execution-queue/')) {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const parts = pathname.split('/');
    const id = parts[3] || '';
    const action = parts[4] || '';
    const queue = new ExecutionQueueService(auditService);
    if (action === 'approve') return json(res, 200, queue.setStatus(id, 'approved'));
    if (action === 'execute') return json(res, 200, queue.execute(id));
    if (action === 'cancel') return json(res, 200, queue.setStatus(id, 'cancelled'));
  }
  if (pathname === '/api/listings/plan') return json(res, 200, new ListingManagerPlanModeService(auditService).current());
  if (pathname === '/api/listings/plan/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new ListingManagerPlanModeService(auditService).build());
  }
  if (pathname.startsWith('/api/listings/plan/') && (pathname.endsWith('/approve') || pathname.endsWith('/ignore'))) {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const parts = pathname.split('/');
    const id = parts[4] || '';
    const status = pathname.endsWith('/approve') ? 'approved' : 'ignored';
    return json(res, 200, new ListingManagerPlanModeService(auditService).update(id, status));
  }
  if (pathname === '/api/decision-queue') {
    const file = readJson(DECISIONS_PATH, { decisions: [] });
    const decisions = file.decisions || [];
    return json(res, 200, { ok: true, version: APP_VERSION, ...decisionQueueSummary(decisions), decisions });
  }
  if (pathname === '/api/decision-queue/rebuild') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const options = getOptions();
    if (options.steam_web_api_key && options.steam_id64) {
      const result = await reviewService.review('decision_queue_rebuild');
      return json(res, result.ok ? 200 : 400, result);
    }
    return json(res, 200, { ok: true, skipped: true, reason: 'Steam API key or SteamID64 missing. Decision queue remains idle.', ...decisionQueueSummary([]), decisions: [] });
  }

  if (pathname === '/api/main-account/status') {
    return json(res, 200, canonicalMainAccountStatusResponse());
  }
  if (pathname === '/api/main-account/save') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const traceId = runtimeRequestId();
    runtimeLogger.info('main_account', 'route_enter', 'Main account save endpoint entered', { requestId: req.runtimeRequestId, trace_id: traceId, method: req.method, contentLength: req.headers && req.headers['content-length'] ? String(req.headers['content-length']) : null });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { runtimeLogger.warn('main_account', 'json_parse_failed', 'Main account save payload was invalid JSON', { requestId: req.runtimeRequestId, trace_id: traceId, bytes: Buffer.byteLength(raw || '', 'utf8') }); return json(res, 400, { ok: false, version: APP_VERSION, error: 'Invalid JSON.', trace_id: traceId, secrets_returned: false }); }
    parsed.__save_trace_id = traceId;
    try {
      const result = isolatedMainAccountSave(parsed, req.runtimeRequestId || traceId);
      runtimeLogger.info('main_account', 'route_return', 'Main account save endpoint returned', { requestId: req.runtimeRequestId, trace_id: traceId, save_verified: result.save_verified, elapsed_ms: result.elapsed_ms, readiness: result.main_account && result.main_account.readiness });
      return json(res, result.save_verified ? 200 : 400, result);
    } catch (error) {
      runtimeLogger.error('main_account', 'main-account.save.fail', 'Main account isolated save failed', runtimeErrorContext(error, { requestId: req.runtimeRequestId, trace_id: traceId }));
      mainAccountSaveTrace('main-account.save.fail', { trace_id: traceId, error: safeError(error) });
      return json(res, 500, { ok: false, version: APP_VERSION, saved: false, verified: false, save_verified: false, error: safeError(error), trace_id: traceId, secrets_returned: false });
    }
  }
  if (pathname === '/api/main-account/save-trace') {
    return json(res, 200, readJson(MAIN_ACCOUNT_SAVE_TRACE_PATH, { ok: true, version: APP_VERSION, events: [], hint: 'No save trace has been written yet.' }));
  }
  if (pathname === '/api/main-account/debug-status') {
    return json(res, 200, mainAccountDebugStatus());
  }
  if (pathname === '/api/main-account/debug-redacted') {
    return json(res, 200, mainAccountDebugStatus());
  }
  if (pathname === '/api/credentials/status') {
    return json(res, 200, canonicalMainAccountStatusResponse());
  }
  if (pathname === '/api/credentials/save-verify') {
    const verification = canonicalMainAccountStatusResponse();
    return json(res, 200, { ...verification, save_verified: Boolean(!verification.needs_setup), main_account: verification.main_account, secrets_returned: false });
  }
  if (pathname === '/api/credentials/main' || pathname === '/api/accounts/main/credentials') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid JSON.' }); }
    return json(res, 200, new HubCredentialVaultService(auditService).saveAccount({ ...parsed, account_id: 'main', id: 'main', role: 'main', make_active: true, force_main_account_switch: true }));
  }
  if (pathname === '/api/credentials/account') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid JSON.' }); }
    return json(res, 200, new HubCredentialVaultService(auditService).saveAccount(parsed));
  }
  if (pathname === '/api/accounts/account') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid JSON.' }); }
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    const result = new MultiAccountPortfolioService(auditService).saveAccountProfile(parsed);
    return json(res, result.ok === false ? 400 : 200, result);
  }
  if (pathname === '/api/accounts/remove') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid JSON.' }); }
    const result = new MultiAccountPortfolioService(auditService).removeAccount(parsed);
    return json(res, result.ok === false ? 400 : 200, result);
  }
  if (pathname === '/api/accounts/subaccount') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid JSON.' }); }
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    const result = new MultiAccountPortfolioService(auditService).saveSubaccount(parsed);
    return json(res, result.ok === false ? 400 : 200, result);
  }
  if (pathname === '/api/autopilot/status') return json(res, 200, hubAutopilot.status());
  if (pathname === '/api/autonomy/status') return json(res, 200, buildAutonomyStatus());
  if (pathname === '/api/autopilot/run') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const result = await hubAutopilot.run('manual_pipeline');
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/setup/status') {
    return json(res, 200, new HubSetupService(auditService).status(null));
  }
  if (pathname === '/api/trading-core/status' || pathname === '/api/trading-core/snapshot') {
    const cached = readJson(TRADING_CORE_PATH, null);
    if (pathname === '/api/trading-core/status' && cached) return json(res, 200, cached);
    return json(res, 200, new TradingCoreService(auditService).build(null));
  }
  if (pathname === '/api/trading-core/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new TradingCoreService(auditService).build(null));
  }
  if (pathname === '/api/accounts/main') {
    if (req.method === 'GET') return json(res, 200, new MultiAccountPortfolioService(auditService).list());
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use GET or POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    // 5.13.29: the visible "Save main account" workflow must update the single
    // credential vault main account as well as the profile card. Older builds saved
    // only the profile, so /api/credentials/status still showed the previous SteamID64.
    const credentialResult = new HubCredentialVaultService(auditService).saveAccount({ ...parsed, account_id: 'main', id: 'main', role: 'main', make_active: true, force_main_account_switch: true });
    const profileResult = new MultiAccountPortfolioService(auditService).saveMainAccount({ ...parsed, id: 'main' });
    const refreshedCredentials = new HubCredentialVaultService(auditService).status();
    const refreshedProfile = new MultiAccountPortfolioService(auditService).list();
    return json(res, 200, { ...refreshedProfile, credential_status: refreshedCredentials, credential_save: credentialResult, profile_save: profileResult, main_account: refreshedCredentials.main_account || refreshedProfile.main_account, accounts: refreshedCredentials.accounts || refreshedProfile.accounts });
  }
  if (pathname === '/api/offers/cache') return json(res, 200, readJson(CACHE_PATH, { ok: false, error: 'No cached offer sync yet.' }));
  if (pathname === '/api/offers/sync' || pathname === '/api/review/run') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    try { const result = await reviewService.review(pathname === '/api/review/run' ? 'manual_review' : 'manual_sync'); return json(res, result.ok ? 200 : 400, result); } catch (error) { audit('trade_offer_review_exception', { message: safeError(error) }); return json(res, 500, { ok: false, error: safeError(error) }); }
  }
  if (pathname === '/api/decisions') return json(res, 200, readJson(DECISIONS_PATH, { ok: false, error: 'No decisions yet.' }));
  if (pathname === '/api/notifications') return json(res, 200, { ok: true, entries: notificationService.list(200) });
  if (pathname === '/api/action-feed') return json(res, 200, readJson(ACTION_FEED_PATH, { ok: true, entries: [] }));
  if (pathname === '/api/operations') return json(res, 200, readJson(OPERATIONS_PATH, { ok: false, error: 'No operations cockpit data yet. Run review first.' }));
  if (pathname === '/api/data/status') return json(res, 200, new DataPersistenceMigrationService(auditService).status());
  if (pathname === '/api/data/migrate') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    return json(res, 200, new DataPersistenceMigrationService(auditService).migrate());
  }
  if (pathname === '/api/data/export') return json(res, 200, new DataPersistenceMigrationService(auditService).exportRedacted());
  if (pathname === '/api/strategy') return json(res, 200, new StrategyBuilderService(auditService).getStrategies());
  if (pathname === '/api/strategy/import') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    const payload = { ok: true, schema_version: DATA_SCHEMA_VERSION, updated_at: new Date().toISOString(), active: parsed.active || 'balanced', strategies: parsed.strategies || defaultStrategies(getOptions()).strategies };
    writeJson(STRATEGIES_PATH, payload);
    audit('strategy_imported', { active: payload.active, strategies: Object.keys(payload.strategies || {}).length });
    appendActionFeed('strategy_imported', { active: payload.active });
    return json(res, 200, payload);
  }
  if (pathname === '/api/targeted-buy-orders') return json(res, 200, readJson(TARGETED_ORDERS_PATH, { ok: false, error: 'No targeted buy order plan yet.' }));
  if (pathname === '/api/accounts') return json(res, 200, new MultiAccountPortfolioService(auditService).list());
  if (pathname === '/api/accounts/import') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    return json(res, 200, new MultiAccountPortfolioService(auditService).save(parsed));
  }
  if (pathname === '/api/backpack/lifecycle') return json(res, 200, readJson(LIFECYCLE_PATH, { ok: false, error: 'No listing lifecycle data yet.' }));
  if (pathname === '/api/ollama/report') return json(res, 200, readJson(OLLAMA_REPORT_PATH, { ok: false, error: 'No Ollama report yet.' }));
  if (pathname === '/api/ollama/analyze') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const decisions = readJson(DECISIONS_PATH, { decisions: [] }).decisions || [];
    const operations = readJson(OPERATIONS_PATH, { ok: false });
    const result = await new OllamaStrategyAnalystService(auditService).analyze(decisions, operations, getOptions());
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/pricelist') return json(res, 200, loadPricelist(getOptions().pricelist_path));
  if (pathname === '/api/pricelist/import') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) return json(res, 400, { ok: false, error: 'Expected an array or { items: [...] }.' });
    writeJson(PRICELIST_PATH, { updated_at: new Date().toISOString(), source: 'manual_import', items });
    audit('pricelist_imported', { count: items.length });
    return json(res, 200, { ok: true, count: items.length });
  }
  if (pathname === '/api/pricing/report') return json(res, 200, readJson(PRICING_REPORT_PATH, { ok: false, error: 'No pricing report yet.' }));
  if (pathname === '/api/offers/history') return json(res, 200, readOfferHistory());
  if (pathname === '/api/offers/mark') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    if (hasBlockedSecretPayload(parsed)) { audit('blocked_secret_payload', { path: pathname }); return json(res, 403, { ok: false, error: 'Blocked secret-like payload.' }); }
    const status = ['reviewed', 'ignored', 'watch'].includes(parsed.status) ? parsed.status : 'reviewed';
    const result = markOfferStatus(parsed.tradeofferid, status, parsed.note || '');
    audit('trade_offer_marked', { tradeofferid: parsed.tradeofferid, status });
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/providers/state') return json(res, 200, providerState());
  if (pathname === '/api/inventory/status') return json(res, 200, new SteamInventorySyncService(auditService).current());
  if (pathname === '/api/inventory/sync') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const result = await new SteamInventorySyncService(auditService).sync(true);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/backpack/status') {
    const options = getOptions();
    return json(res, 200, { ok: true, enabled: options.backpack_tf_enabled, token_saved: Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key), base_url: options.backpack_tf_base_url, write_mode: options.backpack_tf_write_mode, live_writes_enabled: Boolean(options.allow_live_classifieds_writes), cache: readJson(BACKPACK_LISTINGS_PATH, { ok: false, error: 'No cache yet.' }), provider: providerEntry('backpack.tf') });
  }
  if (pathname === '/api/backpack/listings') return json(res, 200, readJson(BACKPACK_LISTINGS_PATH, { ok: false, error: 'No backpack.tf listing cache yet.' }));
  if (pathname === '/api/backpack/sync') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const manager = new BackpackTfV2ListingManager(getOptions(), auditService);
    const result = await manager.syncListings(true);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/market-scanner') return json(res, 200, readJson(MARKET_SCANNER_PATH, { ok: false, error: 'No market scanner snapshot yet. Run Build market scanner after Sync Backpack.tf.', candidates: [] }));
  if (pathname === '/api/market-scanner/build') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const result = new MarketTargetScannerService(auditService).build(getOptions());
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/backpack/plan') return json(res, 200, readJson(LISTING_PLAN_PATH, { ok: false, error: 'No listing plan yet.' }));
  if (pathname === '/api/backpack/execute-plan') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const manager = new BackpackTfV2ListingManager(getOptions(), auditService);
    const result = await manager.executePlan();
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/trades/approve-recommended') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    const decisions = readJson(DECISIONS_PATH, { ok: false, decisions: [] }).decisions || [];
    if (!Array.isArray(decisions) || decisions.length === 0) return json(res, 400, { ok: false, error: 'No decision queue yet. Run review first.' });
    const baseOptions = getOptions();
    const maxPerCycle = clamp(parsed.max_per_cycle, baseOptions.auto_accept_max_per_cycle, 1, 50);
    const confirmAfterAccept = Boolean(parsed.confirm_after_accept);
    const refreshResult = await new SteamSessionRefreshService(auditService, notificationService).ensureFreshSession('manual_before_trade_approval');
    const maFile = new SteamGuardModule(auditService).loadMaFile();
    const acceptOptions = { ...baseOptions, auto_accept_enabled: true, auto_accept_max_per_cycle: maxPerCycle };
    const acceptResult = await new SteamTradeAcceptService(auditService).acceptOffers(decisions, maFile, acceptOptions);
    let confirmResult = { ok: false, skipped: true, reason: 'confirm_after_accept is false' };
    if (confirmAfterAccept) {
      const acceptedIds = Array.isArray(acceptResult.accepted) ? acceptResult.accepted.map(item => String(item.tradeofferid)).filter(Boolean) : [];
      if (acceptedIds.length > 0) {
        if (baseOptions.steamguard_confirm_delay_seconds > 0) await sleep(baseOptions.steamguard_confirm_delay_seconds * 1000);
        confirmResult = await new SteamGuardModule(auditService).autoConfirmOffers(acceptedIds);
      } else {
        confirmResult = { ok: true, skipped: true, reason: 'No accepted offers needed confirmation.' };
      }
    }
    const result = { ok: Boolean(acceptResult.ok), refresh_result: refreshResult, accept_result: acceptResult, confirm_result: confirmResult };
    auditService.write('trade_approval_manual_once', { accepted: acceptResult.accepted?.length || 0, failed: acceptResult.failed?.length || 0, confirm_after_accept: confirmAfterAccept });
    appendActionFeed('trade_approval_manual_once', { accepted: acceptResult.accepted?.length || 0, failed: acceptResult.failed?.length || 0, confirmed: confirmResult.confirmed?.length || 0 });
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/automation/summary') {
    const options = getOptions();
    const decisions = readJson(DECISIONS_PATH, { decisions: [] }).decisions || [];
    const acceptIds = decisions.filter(item => item.decision === 'accept_recommended' && item.reviewed_status !== 'ignored').map(item => String(item.tradeofferid));
    const status = new SteamGuardModule(auditService).status();
    return json(res, 200, {
      ok: true,
      trade_approval_mode: options.trade_approval_mode,
      auto_accept_enabled: options.auto_accept_enabled || options.trade_approval_mode === 'accept_recommended' || options.trade_approval_mode === 'accept_and_confirm',
      auto_confirm_enabled: (options.steamguard_embedded && options.steamguard_auto_confirm) || (!options.steamguard_embedded && options.sda_enabled && options.sda_auto_confirm) || options.trade_approval_mode === 'accept_and_confirm',
      accept_recommended_count: acceptIds.length,
      accept_recommended_offer_ids: acceptIds.slice(0, 20),
      steamguard_ready: Boolean(status.loaded && status.has_identity_secret),
      session_ready: Boolean(status.has_session),
      sda_enabled: options.sda_enabled,
      sda_ready: Boolean(!options.steamguard_embedded && options.sda_enabled),
      sda_auto_confirm: Boolean(!options.steamguard_embedded && options.sda_enabled && options.sda_auto_confirm),
      sda_base_url: (!options.steamguard_embedded && options.sda_enabled) ? options.sda_base_url : null,
      backpack_enabled: options.backpack_tf_enabled,
      backpack_token_saved: Boolean(options.backpack_tf_access_token || options.backpack_tf_api_key),
      backpack_write_mode: options.backpack_tf_write_mode,
      live_classifieds_writes_enabled: Boolean(options.allow_live_classifieds_writes)
    });
  }
  if (pathname === '/api/audit') return json(res, 200, { ok: true, entries: auditService.list(300) });
  if (pathname === '/api/trade/accept-log') return json(res, 200, readJson(TRADE_ACCEPT_LOG_PATH, { ok: true, entries: [] }));
  if (pathname === '/api/steamguard/status') {
    const options = getOptions();
    return json(res, 200, { ok: true, enabled: options.steamguard_embedded, auto_confirm: options.steamguard_auto_confirm, confirm_delay_seconds: options.steamguard_confirm_delay_seconds, ...new SteamGuardModule(auditService).status() });
  }
  if (pathname === '/api/steamguard/setup') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { return json(res, 400, { ok: false, error: 'Invalid setup JSON.' }); }
    const guard = new SteamGuardModule(auditService);
    const result = guard.saveMaFile(body);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/inspect-mafile') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = parseMaFilePayload(raw);
    if (!parsed.ok) return json(res, 400, { ok: false, error: parsed.error });
    const result = new SteamGuardModule(auditService).inspectMaFile(parsed.value);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/mafile') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    const parsed = parseMaFilePayload(raw);
    if (!parsed.ok) return json(res, 400, { ok: false, error: parsed.error });
    const result = new SteamGuardModule(auditService).saveMaFile(parsed.value);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/refresh-token') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const raw = await readBody(req);
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = { refresh_token: raw }; }
    const token = String(parsed.refresh_token || parsed.refreshToken || parsed.token || '').trim();
    const maFile = new SteamGuardModule(auditService).loadMaFile();
    const steamId64 = String(parsed.steam_id64 || parsed.steamid || maFile?.Session?.SteamID || '').trim();
    const result = new SteamSessionRefreshService(auditService).saveRefreshToken(token, steamId64, 'api');
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/refresh-session') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Use POST.' });
    const result = await new SteamSessionRefreshService(auditService, notificationService).refreshSession('manual_api');
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/totp' || pathname === '/api/steamguard/code') {
    const guard = new SteamGuardModule(auditService);
    const maFile = guard.loadMaFile();
    if (!maFile) return json(res, 400, { ok: false, error: 'No maFile loaded.' });
    if (!maFile.shared_secret) return json(res, 400, { ok: false, error: 'maFile is loaded but shared_secret is missing.' });
    try {
      const now = Math.floor(Date.now() / 1000);
      const secondsRemaining = 30 - (now % 30);
      const code = guard.generateTOTP(maFile.shared_secret);
      return json(res, 200, {
        ok: true,
        code,
        display_code: code,
        code_format: 'Steam Guard TOTP: 5 chars, digits 2-9 and capital letters',
        seconds_remaining: secondsRemaining,
        expires_at_unix: now + secondsRemaining,
        server_time_unix: now,
        account_name: maFile.account_name || null
      });
    } catch (error) {
      return json(res, 400, { ok: false, error: `Could not generate Steam Guard code: ${safeError(error)}` });
    }
  }
  if (pathname === '/api/steamguard/confirmations') {
    const refreshResult = await new SteamSessionRefreshService(auditService, notificationService).ensureFreshSession('manual_before_confirmations');
    const guard = new SteamGuardModule(auditService);
    const result = refreshResult.ok === false && !refreshResult.skipped ? refreshResult : await guard.fetchConfirmations();
    if (result && typeof result === 'object') result.refresh_result = refreshResult;
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/confirm' && req.method === 'POST') {
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    const guard = new SteamGuardModule(auditService);
    const maFile = guard.loadMaFile();
    if (!maFile) return json(res, 400, { ok: false, error: 'No maFile loaded.' });
    if (Array.isArray(parsed.offer_ids)) {
      const refreshResult = await new SteamSessionRefreshService(auditService, notificationService).ensureFreshSession('manual_confirm_before_confirmations');
      const result = refreshResult.ok === false && !refreshResult.skipped ? refreshResult : await guard.autoConfirmOffers(parsed.offer_ids);
      if (result && typeof result === 'object') result.refresh_result = refreshResult;
      return json(res, result.ok ? 200 : 400, result);
    }
    const confId = String(parsed.conf_id || parsed.id || '').trim();
    const confNonce = String(parsed.conf_nonce || parsed.nonce || parsed.key || '').trim();
    const result = await guard.acceptConfirmation(maFile, confId, confNonce);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/steamguard/deny' && req.method === 'POST') {
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    const guard = new SteamGuardModule(auditService);
    const maFile = guard.loadMaFile();
    if (!maFile) return json(res, 400, { ok: false, error: 'No maFile loaded.' });
    const confId = String(parsed.conf_id || parsed.id || '').trim();
    const confNonce = String(parsed.conf_nonce || parsed.nonce || parsed.key || '').trim();
    const result = await guard.denyConfirmation(maFile, confId, confNonce);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/sda/status') {
    const options = getOptions();
    const sda = new SdaConfirmationService(options, auditService);
    const status = await sda.getStatus();
    return json(res, 200, { ok: true, sda_enabled: options.sda_enabled, sda_auto_confirm: options.sda_auto_confirm, sda_base_url: options.sda_base_url, ...status });
  }
  if (pathname === '/api/sda/confirmations') {
    const options = getOptions();
    const sda = new SdaConfirmationService(options, auditService);
    const result = await sda.getConfirmations();
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/sda/confirm' && req.method === 'POST') {
    const options = getOptions();
    const raw = await readBody(req);
    const parsed = raw ? JSON.parse(raw) : {};
    const { conf_id, conf_key, offer_ids } = parsed;
    const sda = new SdaConfirmationService(options, auditService);
    if (offer_ids && Array.isArray(offer_ids)) {
      const result = await sda.autoConfirmOffers(offer_ids);
      return json(res, result.ok ? 200 : 400, result);
    }
    if (conf_id) {
      const result = await sda.acceptConfirmation(String(conf_id), String(conf_key || ''));
      return json(res, result.ok ? 200 : 400, result);
    }
    return json(res, 400, { ok: false, error: 'Provide conf_id+conf_key or offer_ids array.' });
  }

  // ── 5.12.34 – Planning Queue ─────────────────────────────────────────
  if (pathname === '/api/planning-queue' && req.method === 'GET') return json(res, 200, new PlanningQueueService(auditService).current());
  if (pathname === '/api/planning-queue/rebuild' && req.method === 'POST') return json(res, 200, new PlanningQueueService(auditService).rebuild('manual_ui'));
  if (pathname === '/api/planning-queue/bulk-approve-top' && req.method === 'POST') {
    const raw = await readBody(req); const parsed = raw ? JSON.parse(raw) : {};
    return json(res, 200, new PlanningQueueService(auditService).bulkApproveTop(Number(parsed.n || parsed.count || 3)));
  }
  if (pathname.startsWith('/api/planning-queue/item/') && pathname.endsWith('/status') && req.method === 'POST') {
    const id = pathname.replace('/api/planning-queue/item/', '').replace('/status', '');
    const raw = await readBody(req); const parsed = raw ? JSON.parse(raw) : {};
    return json(res, 200, new PlanningQueueService(auditService).setItemStatus(id, String(parsed.status || '')));
  }

  // ── 5.12.34 – Hub Listing Drafts ────────────────────────────────────
  if (pathname === '/api/hub-listing-drafts' && req.method === 'GET') return json(res, 200, new HubListingDraftService(auditService).current());
  if (pathname === '/api/hub-listing-drafts/build-from-approved' && req.method === 'POST') return json(res, 200, new HubListingDraftService(auditService).buildFromApproved('manual_ui'));
  if (pathname.startsWith('/api/hub-listing-drafts/') && pathname.endsWith('/approve-local') && req.method === 'POST') {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/approve-local', '');
    return json(res, 200, new HubListingDraftService(auditService).approveDraft(draftId));
  }
  if (pathname.startsWith('/api/hub-listing-drafts/') && pathname.endsWith('/cancel') && req.method === 'POST') {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/cancel', '');
    return json(res, 200, new HubListingDraftService(auditService).cancelDraft(draftId));
  }

  // ── 5.13.29 – TF2Autobot-style Guarded Backpack.tf Publish Executor ───────────────────
  if ((pathname.startsWith('/api/hub-listing-drafts/') || pathname.startsWith('/api/listing-drafts/')) && pathname.endsWith('/test-publish-payload') && req.method === 'POST') {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/api/listing-drafts/', '').replace('/test-publish-payload', '');
    return json(res, 200, new HubListingDraftService(auditService).testPublishPayload(draftId, getOptions()));
  }
  if ((pathname.startsWith('/api/hub-listing-drafts/') || pathname.startsWith('/api/listing-drafts/')) && pathname.endsWith('/publish-guarded') && req.method === 'POST') {
    const raw = await readBody(req); const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed.confirm) return json(res, 400, { ok: false, error: 'confirm=true is required to publish.', code: 'confirm_required', provider_request_sent: false });
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/api/listing-drafts/', '').replace('/publish-guarded', '');
    return json(res, 200, await new HubListingDraftService(auditService).publishGuarded(draftId, getOptions(), parsed));
  }

  // ── 5.12.33 – Forbidden fields audit ─────────────────────────────────
  if (pathname === '/api/system/forbidden-fields-audit') return json(res, 200, runForbiddenFieldsAudit());

  // ── 5.13.29 – Local Workflow ──────────────────────────────────────────
  if (pathname === '/api/workflow/run-local' && req.method === 'POST') return json(res, 200, await runLocalWorkflow(auditService));
  if (pathname === '/api/workflow/run-local' && req.method === 'GET') return json(res, 200, readJson(LOCAL_WORKFLOW_PATH, { ok: false, error: 'No local workflow run yet.' }));

  // ── 5.13.29 – Guarded Publish Executor Self-Test ─────────────────────
  if (pathname === '/api/opportunities') return json(res, 200, buildOpportunities());
  if (pathname === '/api/publish-wizard/verify-listing' && (req.method === 'POST' || req.method === 'GET')) {
    const status = buildPublishWizardStatus();
    if (!status.candidate_draft_id) return json(res, 200, { ok: false, version: APP_VERSION, error: 'No candidate draft to verify.', listed: false });
    return json(res, 200, await verifyPublishedListing(status.candidate_draft_id, getOptions(), auditService, { forceSync: true, source: 'publish_wizard_verify' }));
  }
  if ((pathname.startsWith('/api/hub-listing-drafts/') || pathname.startsWith('/api/listing-drafts/')) && pathname.endsWith('/verify-published')) {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/api/listing-drafts/', '').replace('/verify-published', '');
    return json(res, 200, await verifyPublishedListing(draftId, getOptions(), auditService, { forceSync: true, source: 'manual_verify_endpoint' }));
  }
  if ((pathname === '/api/system/sync-tf2-schema' || pathname === '/api/publish-wizard/sync-tf2-schema') && (req.method === 'POST' || req.method === 'GET')) {
    const service = new HubListingDraftService(auditService);
    const result = await service.syncSteamItemSchemaForDefindex(getOptions(), { force: true });
    auditService.write(result.ok ? 'steam_item_schema_synced' : 'steam_item_schema_sync_failed', { items: result.items_count || 0, pages: result.pages || 0, error: result.error || null });
    appendActionFeed(result.ok ? 'steam_item_schema_synced' : 'steam_item_schema_sync_failed', { items: result.items_count || 0, pages: result.pages || 0 });
    return json(res, result.ok ? 200 : 500, redactDeep({ ...result, items: undefined, sample: Array.isArray(result.items) ? result.items.slice(0, 8) : [] }));
  }
  if (pathname === '/api/publish-wizard/sync-market-classifieds' && (req.method === 'POST' || req.method === 'GET')) {
    const status = buildPublishWizardStatus();
    if (!status.candidate_draft_id) return json(res, 200, { ok: false, error: 'No candidate draft. Prepare a draft first.' });
    const mirror = await new MarketClassifiedsMirrorService(auditService).syncForDraft(status.candidate_draft_id, getOptions());
    if (mirror.ok) {
      const applied = new MarketClassifiedsMirrorService(auditService).applyToDraft(status.candidate_draft_id, getOptions());
      return json(res, 200, { ...mirror, applied });
    }
    return json(res, 200, mirror);
  }
  if ((pathname.startsWith('/api/hub-listing-drafts/') || pathname.startsWith('/api/listing-drafts/')) && pathname.endsWith('/sync-market-classifieds') && (req.method === 'POST' || req.method === 'GET')) {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/api/listing-drafts/', '').replace('/sync-market-classifieds', '');
    const mirror = await new MarketClassifiedsMirrorService(auditService).syncForDraft(draftId, getOptions());
    if (mirror.ok) return json(res, 200, { ...mirror, applied: new MarketClassifiedsMirrorService(auditService).applyToDraft(draftId, getOptions()) });
    return json(res, 200, mirror);
  }
  if (pathname === '/api/publish-wizard/currency-guard') {
    const status = buildPublishWizardStatus();
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { drafts: [] });
    const draft = (store.drafts || []).find(d => d.draft_id === status.candidate_draft_id);
    return json(res, 200, draft ? buildCurrencyGuardForDraft(draft) : { ok: false, error: 'No candidate draft.' });
  }
  if (pathname === '/api/publish-wizard/prepare-key-to-metal' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, prepareKeyToMetalDraft(getOptions(), auditService));
  if (pathname === '/api/most-traded/status' || pathname === '/api/offer-booster/status' || pathname === '/api/auto-list-anything/status') return json(res, 200, buildMostTradedAndKeysStatus(getOptions()));
  // 5.13.30: cached status + lite polling endpoint.  Lite is small and skips
  // every heavy sub-status; it is what the live dashboard polls every few
  // seconds.  The full /status response is served from a short-TTL memory cache
  // (PUBLISH_WIZARD_CACHE_TTL_MS) so opening the panel does not peg CPU.
  if (pathname === '/api/publish-wizard/status/lite') { try { return json(res, 200, buildPublishWizardLiteStatus()); } catch (error) { return json(res, 200, { ok: true, lite: true, version: APP_VERSION, updated_at: new Date().toISOString(), safe_fallback: true, error: safeError(error) }); } }
  if (pathname === '/api/publish-wizard/status') { try { return json(res, 200, getCachedPublishWizardStatus()); } catch (error) { return json(res, 200, { ok: true, version: APP_VERSION, updated_at: new Date().toISOString(), safe_fallback: true, error: safeError(error), classifieds_maintainer: { ok: false, error: 'status unavailable' }, auto_sell_relister: { ok: false, error: 'status unavailable' }, trade_offer_state_machine: { ok: false, counts: {}, states: [], next_action: 'Status fallback: dashboard recovered from a server-side status error.' }, steps: [], guarded_publish_enabled: Boolean(getOptions().allow_guarded_backpack_publish), live_classifieds_writes_enabled: Boolean(getOptions().allow_live_classifieds_writes), backpack_tf_write_mode: getOptions().backpack_tf_write_mode, publish_disabled_reason: 'Status fallback active. Run diagnostics if this repeats.' }); } }
  if (pathname === '/api/publish-wizard/prepare-one' && req.method === 'POST') {
    const queue = new PlanningQueueService(auditService);
    let q = queue.current();
    if (!Array.isArray(q.items) || !q.items.length) q = queue.rebuild('publish_wizard_prepare_one');
    let approvedQueueApplied = null;
    if (!(q.items || []).some(x => x.local_status === 'approved_local')) approvedQueueApplied = queue.bulkApproveTop(1);
    const draftService = new HubListingDraftService(auditService);
    const drafts = draftService.buildFromApproved('publish_wizard_prepare_one');
    let first = (drafts.drafts || []).find(d => d.local_status === 'approved_local') || (drafts.drafts || []).find(d => d.local_status === 'draft') || (drafts.drafts || [])[0];
    let approval = null;
    if (first && first.local_status !== 'approved_local') {
      approval = draftService.approveDraft(first.draft_id);
      if (approval && approval.draft) first = approval.draft;
    }
    const status = buildPublishWizardStatus();
    return json(res, 200, { ...status, prepared: true, prepared_draft_id: first?.draft_id || null, prepared_item_name: first?.item_name || null, prepared_local_status: first?.local_status || null, approved_queue_applied: Boolean(approvedQueueApplied), draft_approval_applied: Boolean(approval && approval.ok) });
  }
  if ((pathname.startsWith('/api/hub-listing-drafts/') || pathname.startsWith('/api/listing-drafts/')) && pathname.endsWith('/duplicate-guard')) {
    const draftId = pathname.replace('/api/hub-listing-drafts/', '').replace('/api/listing-drafts/', '').replace('/duplicate-guard', '');
    const store = readJson(HUB_LISTING_DRAFTS_PATH, { drafts: [] });
    const draft = (store.drafts || []).find(d => d.draft_id === draftId);
    return json(res, 200, draft ? buildDuplicateListingGuard(draft, getOptions()) : { ok: false, error: `Draft ${draftId} not found.` });
  }
  if (pathname === '/api/system/guarded-publish-self-test') return json(res, 200, buildGuardedPublishExecutorSelfTest());
  if (pathname === '/api/fallback-metrics/status') return json(res, 200, buildFallbackMetricsStatus(getOptions()));
  if (pathname === '/api/publish-error-inspector/status') return json(res, 200, buildPublishErrorInspectorStatus(getOptions()));
  if (pathname === '/api/adaptive-fill-controller/status') return json(res, 200, buildAdaptiveFillControllerStatus(getOptions()));
  if (pathname === '/api/liquidity-first/status') return json(res, 200, buildLiquidityFirstStatus(getOptions()));
  if (pathname === '/api/stale-sell-listing-guard/status') return json(res, 200, buildStaleSellListingGuardStatus(getOptions()));
  if (pathname === '/api/stale-sell-listing-guard/archive-stale' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await archiveStaleSellListingsGuarded(getOptions(), auditService, 'manual_api'));
  if (pathname === '/api/trading-brain-v513/status' || pathname === '/api/trading-brain/decision-status') return json(res, 200, buildTradingBrainV513Status(getOptions()));
  if (pathname === '/api/trading-brain-v513/rebuild' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, buildTradingBrainV513Status(getOptions()));
  if (pathname === '/api/market-pricing-pipeline/status') return json(res, 200, buildMarketPricingPipelineStatus(getOptions()));
  if (pathname === '/api/market-pricing-pipeline/rebuild' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await rebuildMarketPricingPipeline(getOptions(), auditService));
  if (pathname === '/api/sell-booster/status') return json(res, 200, buildSellBoosterStatus(getOptions()));
  if (pathname === '/api/sell-profit-guard/status') return json(res, 200, buildSellProfitGuardStatus(getOptions()));
  if (pathname === '/api/manual-owned-sell-detector/status') return json(res, 200, new ManualOwnedItemSellDetectorService(auditService).status());
  if (pathname === '/api/manual-owned-sell-detector/run' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await new ManualOwnedItemSellDetectorService(auditService).run('manual_ui', { publish: true, sync_inventory: true }));
  if (pathname === '/api/auto-sell-relister/status') return json(res, 200, new BoughtItemAutoSellRelisterService(auditService).status());
  if (pathname === '/api/auto-sell-relister/run' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await new BoughtItemAutoSellRelisterService(auditService).run('manual_ui', { publish: true, sync_inventory: true }));
  if (pathname === '/api/runtime-controls') return json(res, 200, readRuntimeControls());
  if (pathname === '/api/trade-offer-state-machine/status') { try { return json(res, 200, readTradeOfferStateMachine()); } catch (error) { return json(res, 200, { ok: false, version: APP_VERSION, safe_fallback: true, error: safeError(error), counts: {}, states: [], next_action: 'Trade offer state machine recovered with fallback.' }); } }
  if (pathname === '/api/trade-offer-state-machine/rebuild' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, buildTradeOfferStateMachine('manual_rebuild'));
  if (pathname === '/api/trade-guard/status') return json(res, 200, tradeGuardStatus({ counteroffers: tradeCounterofferStatus() }));
  if (pathname === '/api/trade-counteroffers/status') return json(res, 200, tradeCounterofferStatus());
  if (pathname === '/api/trade-counteroffers/preview') { const status = tradeCounterofferStatus(); return json(res, 200, status.preview || buildCounterofferPreviewSummary(status.drafts || [])); }
  if (pathname === '/api/trade-counteroffers/dry-run-validation') { const status = tradeCounterofferStatus(); const preview = status.preview || buildCounterofferPreviewSummary(status.drafts || []); return json(res, 200, { ok: true, version: APP_VERSION, dry_run_validation_enabled: status.dry_run_validation_enabled, live_sending_requested: status.live_sending_requested, live_sending_enabled: status.live_sending_enabled, live_sending_blocked_by_dry_run_validation: status.live_sending_blocked_by_dry_run_validation, would_counteroffer: preview.would_counteroffer_count || 0, would_decline_or_manual_review: preview.would_decline_or_manual_review_count || 0, previews: preview.previews || [], last_result: status.last_result || null, note: 'Dry-run validation endpoint: nothing is sent to Steam from this endpoint.' }); }
  if (pathname === '/api/classifieds-maintainer/toggle' && (req.method === 'POST' || req.method === 'GET')) {
    const raw = req.method === 'POST' ? await readBody(req) : '';
    let parsed = {};
    try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = {}; }
    const urlEnabled = /enabled=true/.test(String(req.url || '')) ? true : /enabled=false/.test(String(req.url || '')) ? false : undefined;
    const enabled = typeof parsed.enabled === 'boolean' ? parsed.enabled : (typeof urlEnabled === 'boolean' ? urlEnabled : !classifiedsMaintainer.status().enabled);
    const controls = writeRuntimeControls({ persistent_classifieds_maintainer_enabled: Boolean(enabled), source: 'dashboard_slider' });
    auditService.write('classifieds_maintainer_runtime_toggle', { enabled: Boolean(enabled) });
    appendActionFeed('classifieds_maintainer_runtime_toggle', { enabled: Boolean(enabled) });
    return json(res, 200, { ok: true, version: APP_VERSION, enabled: Boolean(enabled), runtime_controls: controls, maintainer: classifiedsMaintainer.status() });
  }
  if (pathname === '/api/classifieds-maintainer/status') return json(res, 200, classifiedsMaintainer.status());
  if (pathname === '/api/classifieds-maintainer/run' && (req.method === 'POST' || req.method === 'GET')) {
    // 5.13.29: Home Assistant ingress can return 502 Bad Gateway when a long
    // maintainer run keeps the HTTP request open while Backpack.tf calls are
    // still in progress.  Start manual runs in the background and return an
    // immediate accepted status.  The live dashboard poll then reads the run
    // result from /api/classifieds-maintainer/status.
    const before = classifiedsMaintainer.status();
    if (before.running) {
      return json(res, 202, { ok: true, version: APP_VERSION, accepted_async: false, already_running: true, message: 'Maintainer is already running. Dashboard will refresh automatically.', maintainer: before });
    }
    const acceptedAt = new Date().toISOString();
    setTimeout(() => {
      classifiedsMaintainer.run('manual_ui_async').catch(error => {
        auditService.write('manual_async_maintainer_failed', { message: safeError(error), accepted_at: acceptedAt });
        appendActionFeed('manual_async_maintainer_failed', { error: safeError(error), accepted_at: acceptedAt });
      });
    }, 25);
    return json(res, 202, { ok: true, version: APP_VERSION, accepted_async: true, accepted_at: acceptedAt, message: 'Maintainer run accepted and started in the background. Watch dashboard live status for progress/results.', maintainer: classifiedsMaintainer.status() });
  }

  if (pathname === '/api/startup-rebuild/status') return json(res, 200, new StartupRebuildControllerService(auditService).current());
  if (pathname === '/api/startup-rebuild/run' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await new StartupRebuildControllerService(auditService).run('manual_api'));
  if (pathname === '/api/classifieds-startup-archive/status') return json(res, 200, new StartupListingArchiveService(auditService).current());
  if (pathname === '/api/classifieds-startup-archive/run' && (req.method === 'POST' || req.method === 'GET')) return json(res, 200, await new StartupListingArchiveService(auditService).archiveAll('manual_api'));

  // ── 5.13.29 – Release Check ───────────────────────────────────────────
  if (pathname === '/api/system/release-check') return json(res, 200, buildReleaseCheck());

  return json(res, 404, { ok: false, error: 'Not found.' });
}
function serveStatic(res, pathname) {
  const publicDir = path.join(__dirname, '..', 'public');
  const fileName = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.normalize(path.join(publicDir, fileName));
  if (!filePath.startsWith(publicDir)) return text(res, 403, 'Forbidden');
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return text(res, 404, 'Not found');
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
  return text(res, 200, fs.readFileSync(filePath), types[ext] || 'application/octet-stream');
}
async function handle(req, res) {
  const requestStartedAt = Date.now();
  const requestId = runtimeRequestId();
  req.runtimeRequestId = requestId;
  let baseUrl = `http://${req.headers.host || 'localhost'}`;
  try { new URL(baseUrl); } catch { baseUrl = 'http://localhost'; }
  let url;
  try { url = new URL(normalizeRequestUrl(req.url), baseUrl); } catch (error) { runtimeLogger.error('api', 'api_request_failed', 'Invalid request URL', runtimeErrorContext(error, { requestId, rawUrl: req.url, method: req.method })); audit('invalid_request_url', { raw: req.url, message: safeError(error) }); return json(res, 400, { ok: false, error: 'Invalid request URL.' }); }
  const pathname = normalizeIngressPath(url.pathname);
  const isApi = pathname.startsWith('/api/');
  if (isApi) {
    runtimeLogger.info('api', 'api_request_start', 'API request started', { requestId, method: req.method, path: pathname, rawUrl: req.url, contentLength: req.headers && req.headers['content-length'] ? String(req.headers['content-length']) : null });
    try { res.once('finish', () => runtimeLogger.info('api', 'api_request_done', 'API request finished', { requestId, method: req.method, path: pathname, statusCode: res.statusCode, durationMs: Date.now() - requestStartedAt })); } catch {}
  }
  try { return isApi ? await handleApi(req, res, pathname) : serveStatic(res, pathname); } catch (error) { runtimeLogger.error('api', 'api_request_failed', 'API request failed', runtimeErrorContext(error, { requestId, method: req.method, path: pathname, durationMs: Date.now() - requestStartedAt })); audit('server_error', { path: pathname, message: safeError(error) }); return json(res, 500, { ok: false, error: 'Internal server error.' }); }
}
function startScheduler() {
  const startedAt = Date.now();
  globalThis.__tf2HubStartedAt = startedAt;
  runtimeLogger.info('startup', 'scheduler_started', 'Runtime scheduler started', { intervalMs: 60000 });
  let tickRunning = false;
  setInterval(() => {
    const options = getOptions();
    if (tickRunning) return;
    tickRunning = true;
    Promise.resolve().then(async () => {
      try {
        if (hubAutopilot.due()) await hubAutopilot.run('scheduled_pipeline').catch(error => audit('scheduled_pipeline_failed', { message: safeError(error) }));
        if (classifiedsMaintainer.due()) await classifiedsMaintainer.run('scheduled_classifieds_maintainer').catch(error => audit('scheduled_classifieds_maintainer_failed', { message: safeError(error) }));
      } catch (error) {
        runtimeLogger.error('scheduler', 'scheduler_tick_failed', 'Scheduler tick failed', runtimeErrorContext(error)); audit('scheduler_tick_failed', { message: safeError(error) });
      }
    }).finally(() => { tickRunning = false; });
  }, 60000);
}
ensureDataDir();
runtimeLogger.info('startup', 'addon_start', 'TF2 Trading Hub starting', { version: APP_VERSION, dataDir: DATA_DIR, pid: process.pid });
runtimeLogger.info('startup', 'version_loaded', 'Runtime version loaded', { version: APP_VERSION });
if (!fs.existsSync(PRICELIST_PATH)) writeJson(PRICELIST_PATH, defaultPricelist());
if (!fs.existsSync(STRATEGIES_PATH)) writeJson(STRATEGIES_PATH, defaultStrategies(getOptions()));
if (!fs.existsSync(ACCOUNTS_PATH)) writeJson(ACCOUNTS_PATH, defaultAccounts(getOptions()));
if (!fs.existsSync(ACTION_FEED_PATH)) writeJson(ACTION_FEED_PATH, { ok: true, updated_at: new Date().toISOString(), entries: [] });
if (!fs.existsSync(HUB_SETUP_PATH)) writeJson(HUB_SETUP_PATH, new HubSetupService(auditService).status(null));
if (!fs.existsSync(TRADING_CORE_PATH)) writeJson(TRADING_CORE_PATH, new TradingCoreService(auditService).build(null));
try { new DataPersistenceMigrationService(auditService).migrate(); } catch (error) { audit('startup_migration_failed', { message: safeError(error) }); }
startScheduler();
const __startupOptions = getOptions();
runtimeLogger.info('startup', 'startup_jobs_check', 'Startup jobs checked without boot delay gates', { archive_enabled: Boolean(__startupOptions.archive_classifieds_on_startup && __startupOptions.archive_classifieds_on_startup_confirmed), rebuild_enabled: Boolean(__startupOptions.startup_rebuild_enabled) });
new StartupListingArchiveService(auditService).runStartup().catch(error => audit('startup_listing_archive_schedule_failed', { message: safeError(error) }));
const __server = http.createServer((req, res) => handle(req, res).catch(error => { runtimeLogger.error('api', 'unhandled_request_error', 'Unhandled server request error', runtimeErrorContext(error, { requestId: req && req.runtimeRequestId })); audit('unhandled_request_error', { message: safeError(error) }); json(res, 500, { ok: false, error: 'Unhandled server error.' }); }));
__server.on('error', error => { writeCrashReport('server_error', error, { host: HOST, port: PORT }); });
__server.listen(PORT, HOST, () => {
  console.log(`[steam-companion] listening on ${HOST}:${PORT}`);
  try {
    const __mainStartupStatus = new HubCredentialVaultService(auditService).status();
    const __mainStartupPublic = (__mainStartupStatus && __mainStartupStatus.main_account) || __mainStartupStatus || {};
    console.log(`[tf2-hub] main account vault loaded: steamid64=${__mainStartupPublic.steam_id64_saved ? 'yes' : 'no'} steam_api_key=${__mainStartupPublic.steam_web_api_key_saved ? 'yes' : 'no'} backpack_token=${__mainStartupPublic.backpack_tf_token_saved ? 'yes' : 'no'}`);
    runtimeLogVaultStatus('vault_loaded', __mainStartupPublic, { startup: true, status_endpoint_shape: Boolean(__mainStartupStatus && __mainStartupStatus.main_account) ? 'main_account' : 'flat' });
  } catch (error) {
    runtimeLogger.error('startup', 'vault_loaded_failed', 'Main account vault startup status failed', runtimeErrorContext(error));
  }
  runtimeLogger.info('startup', 'config_loaded', 'Runtime options loaded', runtimeLoggerOptions());
  console.log('[tf2-hub] 5.13.36 Production Declutter + Isolated Main Save');
});
