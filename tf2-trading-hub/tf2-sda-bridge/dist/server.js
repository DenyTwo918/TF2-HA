'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const APP_VERSION = '1.1.3';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8098);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = process.env.SDA_BRIDGE_DATA_DIR || '/data';
const MAFILE_PATH = path.join(DATA_DIR, 'tf2-sda-bridge-mafile.json');
const SESSION_HEALTH_PATH = path.join(DATA_DIR, 'tf2-sda-bridge-session-health.json');
const AUDIT_PATH = path.join(DATA_DIR, 'tf2-sda-bridge-audit.jsonl');
const MAX_BODY_BYTES = 1024 * 1024;

function ensureDataDir() { try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_error) {} }
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_error) { return fallback; } }
function writeJson(file, value) { ensureDataDir(); const tmp = `${file}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2)); fs.renameSync(tmp, file); }
function appendAudit(event, payload = {}) { ensureDataDir(); const safe = redactSecrets(payload); fs.appendFileSync(AUDIT_PATH, `${JSON.stringify({ ts: new Date().toISOString(), event, ...safe })}\n`); }
function readOptions() { const file = path.join(DATA_DIR, 'options.json'); const opts = readJson(file, {}); return { provider_timeout_seconds: clamp(opts.provider_timeout_seconds, 15, 3, 60), allow_confirmations: opts.allow_confirmations === true, expose_code: opts.expose_code !== false }; }
function clamp(value, fallback, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function scrubLongTokens(text) { return String(text || '').replace(/[A-Za-z0-9_\-=%+/]{32,}/g, '[redacted]'); }
function safePlainObject(value, depth = 0, seen = new Set()) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return scrubLongTokens(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return String(value);
  if (typeof value === 'function') return '[function]';
  if (value instanceof Error) return { name: value.name || 'Error', message: scrubLongTokens(value.message || String(value)), code: value.code || undefined };
  if (depth > 4) return '[max-depth]';
  if (seen.has(value)) return '[circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 30).map(item => safePlainObject(item, depth + 1, seen));
  const result = {};
  for (const [key, raw] of Object.entries(value)) {
    if (/secret|token|loginsecure|sessionid|cookie|password/i.test(key)) result[key] = redacted(raw);
    else result[key] = safePlainObject(raw, depth + 1, seen);
  }
  return result;
}
function safeError(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return scrubLongTokens(error);
  if (error instanceof Error) return scrubLongTokens(error.message || error.name || 'Error');
  if (typeof error === 'object') {
    const direct = error.error || error.message || error.reason || error.statusText;
    if (direct && typeof direct !== 'object') return scrubLongTokens(direct);
    try { return scrubLongTokens(JSON.stringify(safePlainObject(error))); } catch (_error) { return 'Unknown object error'; }
  }
  return scrubLongTokens(String(error));
}
function errorPayload(error, extra = {}) {
  return { ok: false, error: safeError(error), error_type: error && error.name || typeof error, ...extra };
}
function json(res, status, payload) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(JSON.stringify(payload, null, 2)); }
function text(res, status, body, type = 'text/plain; charset=utf-8') { res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(body); }
async function readBody(req) { return await new Promise((resolve, reject) => { let data = ''; req.on('data', chunk => { data += chunk; if (data.length > MAX_BODY_BYTES) { reject(new Error('Body too large')); req.destroy(); } }); req.on('end', () => resolve(data)); req.on('error', reject); }); }

function redacted(value) { return value ? '[saved]' : ''; }
function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, raw] of Object.entries(value)) {
    if (/secret|token|loginsecure|sessionid|cookie|password/i.test(key)) result[key] = redacted(raw);
    else result[key] = redactSecrets(raw);
  }
  return result;
}

function normalizeRequestUrl(rawUrl) {
  let raw = typeof rawUrl === 'string' && rawUrl.length > 0 ? rawUrl.trim() : '/';
  if (!raw) return '/';
  if (raw === '//' || /^\/+[#?]?$/.test(raw)) return '/';
  if (raw.startsWith('//')) {
    if (raw[2] === '?' || raw[2] === '#') return `/${raw.slice(2)}`;
    raw = `/${raw.replace(/^\/+/, '')}`;
  }
  return raw;
}
function normalizeIngressPath(req) {
  let pathname = '/';
  try { pathname = new URL(normalizeRequestUrl(req.url), 'http://local').pathname; } catch (_error) { pathname = '/'; }
  // Home Assistant ingress can forward paths like /api/hassio_ingress/<token>/api/status.
  // Use the last /api/ segment so frontend requests work both directly and through ingress.
  const apiIndex = pathname.lastIndexOf('/api/');
  if (apiIndex > 0) pathname = pathname.slice(apiIndex);
  for (const marker of ['/app.js', '/styles.css', '/index.html']) { const index = pathname.indexOf(marker); if (index > 0) pathname = pathname.slice(index); }
  return pathname || '/';
}
function requestSearchParams(req) { try { return new URL(normalizeRequestUrl(req.url), 'http://local').searchParams; } catch (_error) { return new URL('http://local/').searchParams; } }

function stripCodeFence(raw) { return String(raw || '').trim().replace(/^```(?:json|javascript|js)?\s*/i, '').replace(/```$/i, '').trim(); }
function looksUrlEncoded(raw) { return /%7B|%22|%7D|%3A/i.test(String(raw || '')); }
function tryJsonParse(raw) { try { return { ok: true, value: JSON.parse(raw) }; } catch (error) { return { ok: false, error: error.message }; } }
function firstJsonObjectSlice(raw) { const textValue = String(raw || ''); const start = textValue.indexOf('{'); const end = textValue.lastIndexOf('}'); return start >= 0 && end > start ? textValue.slice(start, end + 1) : ''; }
function unescapeCommonCopyArtifacts(value) { return String(value || '').replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&amp;/g, '&').replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); }
function parseFlexibleJsonValue(rawInput) {
  let raw = unescapeCommonCopyArtifacts(stripCodeFence(rawInput));
  if (!raw) return { ok: false, error: 'Paste a maFile JSON object first or choose the .maFile file from disk.' };
  if (looksUrlEncoded(raw)) { try { raw = decodeURIComponent(raw); } catch (_error) {} }
  if (!raw.startsWith('{') && !raw.startsWith('[') && !raw.startsWith('"')) { const sliced = firstJsonObjectSlice(raw); if (sliced) raw = sliced; }
  const candidates = [raw];
  const sliced = firstJsonObjectSlice(raw);
  if (sliced && sliced !== raw) candidates.push(sliced);
  if (raw.includes('\\"') || raw.includes('\\n')) candidates.push(raw.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  let parsed = { ok: false, error: 'No parser candidate matched.' };
  for (const candidate of candidates) { parsed = tryJsonParse(candidate); if (parsed.ok) break; }
  if (!parsed.ok) return { ok: false, error: `Invalid maFile JSON: ${parsed.error}` };
  let value = parsed.value;
  for (let i = 0; i < 5 && typeof value === 'string'; i += 1) {
    const nestedRaw = unescapeCommonCopyArtifacts(stripCodeFence(value));
    const nested = tryJsonParse(nestedRaw);
    if (!nested.ok) { const nestedSlice = firstJsonObjectSlice(nestedRaw); if (nestedSlice) { const parsedSlice = tryJsonParse(nestedSlice); if (parsedSlice.ok) { value = parsedSlice.value; continue; } } break; }
    value = nested.value;
  }
  return { ok: true, value };
}
function unwrapMaFileContainer(value) {
  let current = value;
  for (let i = 0; i < 5; i += 1) {
    if (typeof current === 'string') { const parsed = parseFlexibleJsonValue(current); if (!parsed.ok) return current; current = parsed.value; continue; }
    if (current && typeof current === 'object') {
      const wrapped = current.maFile ?? current.mafile ?? current.steamguard_mafile ?? current.steamGuardMaFile ?? current.payload ?? current.data;
      if (wrapped && wrapped !== current) { current = wrapped; continue; }
    }
    break;
  }
  return current;
}
function normalizeFieldName(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function findDeepField(value, names, depth = 0, seen = new Set()) {
  if (!value || typeof value !== 'object' || depth > 7 || seen.has(value)) return '';
  seen.add(value);
  const wanted = new Set(names.map(normalizeFieldName));
  for (const [key, raw] of Object.entries(value)) { if (wanted.has(normalizeFieldName(key)) && raw !== undefined && raw !== null && String(raw).trim()) return String(raw).trim(); }
  for (const raw of Object.values(value)) { if (raw && typeof raw === 'object') { const found = findDeepField(raw, names, depth + 1, seen); if (found) return found; } }
  return '';
}
function isLikelyBase64Secret(value) { const textValue = String(value || '').trim(); if (!textValue || textValue.length < 16) return false; if (!/^[A-Za-z0-9+/=]+$/.test(textValue)) return false; try { return Buffer.from(textValue, 'base64').length >= 8; } catch (_error) { return false; } }
function hasEncryptedMaFileShape(value) { if (!value || typeof value !== 'object') return false; const keys = Object.keys(value).map(normalizeFieldName); return Boolean(value.encrypted || value.Encrypted || (keys.includes('encrypted') && (keys.includes('data') || keys.includes('iv') || keys.includes('salt')))); }

function parseMaFilePayload(rawInput) {
  const parsed = parseFlexibleJsonValue(rawInput);
  if (!parsed.ok) return parsed;
  const value = unwrapMaFileContainer(parsed.value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'Expected a maFile JSON object.' };
  return { ok: true, value };
}
function normalizeMaFile(raw) {
  const sharedSecret = findDeepField(raw, ['shared_secret', 'sharedSecret', 'shared']);
  const identitySecret = findDeepField(raw, ['identity_secret', 'identitySecret', 'identity']);
  const steamId = findDeepField(raw, ['SteamID', 'steamid', 'steam_id', 'steamid64', 'steamID64']);
  const steamLoginSecure = findDeepField(raw, ['SteamLoginSecure', 'steamLoginSecure', 'steam_login_secure']);
  const sessionId = findDeepField(raw, ['SessionID', 'sessionid', 'session_id']);
  const deviceId = findDeepField(raw, ['device_id', 'deviceId']);
  const accountName = findDeepField(raw, ['account_name', 'accountName', 'account']) || findDeepField(raw, ['username', 'login']);
  return {
    shared_secret: sharedSecret,
    identity_secret: identitySecret,
    device_id: deviceId,
    account_name: accountName,
    Session: { SteamID: steamId, SteamLoginSecure: steamLoginSecure, SessionID: sessionId },
    imported_at: new Date().toISOString()
  };
}
function verifyMaFile(raw) {
  const normalized = normalizeMaFile(raw);
  const report = {
    shared_secret: Boolean(normalized.shared_secret),
    shared_secret_base64_ok: isLikelyBase64Secret(normalized.shared_secret),
    identity_secret: Boolean(normalized.identity_secret),
    identity_secret_base64_ok: isLikelyBase64Secret(normalized.identity_secret),
    steam_id64: Boolean(normalized.Session.SteamID),
    steam_login_secure: Boolean(normalized.Session.SteamLoginSecure),
    session_id: Boolean(normalized.Session.SessionID),
    device_id: Boolean(normalized.device_id),
    encrypted_shape_detected: hasEncryptedMaFileShape(raw),
    totp_ready: Boolean(normalized.shared_secret && isLikelyBase64Secret(normalized.shared_secret)),
    confirmations_ready: Boolean(normalized.identity_secret && isLikelyBase64Secret(normalized.identity_secret) && normalized.Session.SteamID && normalized.Session.SteamLoginSecure && normalized.Session.SessionID)
  };
  return { normalized, report };
}

function deriveDeviceId(steamId64) { const hash = crypto.createHash('sha1').update(String(steamId64 || '')).digest('hex'); return `android:${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`; }
function loadMaFile() { const maFile = readJson(MAFILE_PATH, null); if (!maFile || !maFile.shared_secret || !maFile.identity_secret) return null; return maFile; }
function saveMaFile(maFile) { writeJson(MAFILE_PATH, maFile); appendAudit('mafile_saved', { account_name: maFile.account_name || null, steam_id64: maFile.Session && maFile.Session.SteamID ? '[present]' : '[missing]', has_session: Boolean(maFile.Session && maFile.Session.SteamLoginSecure && maFile.Session.SessionID) }); }
function getDeviceId(maFile) { return String(maFile && maFile.device_id || '').trim() || deriveDeviceId(maFile && maFile.Session && maFile.Session.SteamID || ''); }
function buildCookies(maFile) { const session = maFile && maFile.Session || {}; const cookies = []; if (session.SteamLoginSecure) cookies.push(`steamLoginSecure=${session.SteamLoginSecure}`); if (session.SessionID) cookies.push(`sessionid=${session.SessionID}`); return cookies.join('; '); }

function buildDiagnostics() {
  const rawMaFile = readJson(MAFILE_PATH, null);
  const health = readJson(SESSION_HEALTH_PATH, { status: 'not_checked', checked_at: null, message: null });
  const report = rawMaFile && typeof rawMaFile === 'object' ? verifyMaFile(rawMaFile).report : null;
  const session = rawMaFile && rawMaFile.Session && typeof rawMaFile.Session === 'object' ? rawMaFile.Session : {};
  const missing = [];
  if (!rawMaFile) missing.push('maFile');
  if (rawMaFile && !rawMaFile.shared_secret) missing.push('shared_secret');
  if (rawMaFile && !rawMaFile.identity_secret) missing.push('identity_secret');
  if (rawMaFile && !session.SteamID) missing.push('SteamID64');
  if (rawMaFile && !session.SteamLoginSecure) missing.push('SteamLoginSecure');
  if (rawMaFile && !session.SessionID) missing.push('SessionID');
  return {
    ok: true,
    version: APP_VERSION,
    mode: 'embedded_mafile',
    paths: { mafile: MAFILE_PATH, session_health: SESSION_HEALTH_PATH },
    mafile_json_readable: Boolean(rawMaFile),
    mafile_report: report,
    missing,
    next_step: !rawMaFile
      ? 'Upload/save decrypted SDA-compatible maFile first.'
      : missing.includes('SteamLoginSecure') || missing.includes('SessionID')
        ? 'TOTP can work, but mobile confirmations require SteamLoginSecure and sessionid cookies.'
        : 'Click Load confirmations. Only trade confirmations can be allowed; other confirmations are left untouched.',
    session_health: health,
    options: redactSecrets(readOptions())
  };
}
function publicStatus() {
  let maFile = null;
  let maFileError = null;
  try { maFile = loadMaFile(); } catch (error) { maFileError = safeError(error); }
  const health = readJson(SESSION_HEALTH_PATH, { status: 'not_checked', checked_at: null, message: null });
  const session = maFile && maFile.Session || {};
  return {
    ok: true,
    service: 'tf2-sda-bridge',
    mode: 'embedded_mafile',
    version: APP_VERSION,
    configured: Boolean(maFile),
    connected: Boolean(maFile && maFile.shared_secret && maFile.identity_secret),
    allow_confirmations: readOptions().allow_confirmations,
    mafile_loaded: Boolean(maFile),
    mafile_error: maFileError,
    account_name: maFile && maFile.account_name || null,
    steam_id64_present: Boolean(session.SteamID),
    has_shared_secret: Boolean(maFile && maFile.shared_secret),
    has_identity_secret: Boolean(maFile && maFile.identity_secret),
    has_session: Boolean(session.SteamLoginSecure && session.SessionID),
    device_id_present: Boolean(maFile && getDeviceId(maFile)),
    totp_ready: Boolean(maFile && maFile.shared_secret),
    confirmations_ready: Boolean(maFile && maFile.identity_secret && session.SteamID && session.SteamLoginSecure && session.SessionID),
    session_health: health,
    diagnostics: buildDiagnostics()
  };
}
function generateTOTP(sharedSecret) {
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
  for (let i = 0; i < 5; i += 1) { code += steamChars[value % steamChars.length]; value = Math.floor(value / steamChars.length); }
  return code;
}
function generateConfirmationKey(identitySecret, tag, time) {
  const tagBuffer = Buffer.from(String(tag || 'conf'), 'utf8');
  const buffer = Buffer.alloc(8 + tagBuffer.length);
  buffer.writeUInt32BE(Math.floor(time / 0x100000000), 0);
  buffer.writeUInt32BE(time >>> 0, 4);
  tagBuffer.copy(buffer, 8);
  const hmac = crypto.createHmac('sha1', Buffer.from(identitySecret, 'base64'));
  hmac.update(buffer);
  return hmac.digest('base64');
}
async function fetchJsonWithTimeout(url, timeoutSeconds, options = {}) {
  const parsed = new URL(url);
  const lib = parsed.protocol === 'https:' ? https : http;
  return await new Promise((resolve, reject) => {
    const req = lib.request(parsed, { method: options.method || 'GET', headers: options.headers || {}, timeout: timeoutSeconds * 1000 }, response => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        const contentType = response.headers['content-type'] || '';
        let body = null;
        try { body = data ? JSON.parse(data) : {}; } catch (_error) { body = { raw: data.slice(0, 1200), content_type: contentType }; }
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, headers: response.headers, contentType, body });
      });
    });
    req.on('timeout', () => { req.destroy(new Error('Steam request timeout')); });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}
function markSessionHealth(status, message, extra = {}) { const value = { status, message: message || null, checked_at: new Date().toISOString(), ...extra }; writeJson(SESSION_HEALTH_PATH, value); return value; }
function normalizeConfirmationType(value) {
  const text = String(value === undefined || value === null ? '' : value).toLowerCase().trim();
  if (!text) return '';
  if (text === '2' || text === 'trade' || text === 'tradeoffer' || text === 'trade_offer') return 'trade';
  if (text === '3' || text.includes('market')) return 'market';
  if (text.includes('login') || text.includes('auth') || text.includes('device')) return 'login';
  return text;
}
function classifyConfirmation(conf, offerSet = null) {
  const raw = conf && conf.raw && typeof conf.raw === 'object' ? conf.raw : (conf || {});
  const id = String(conf && (conf.id || conf.conf_id || conf.cid) || raw.id || raw.conf_id || raw.cid || '');
  const creator = String(conf && (conf.creator || conf.creator_steamid || conf.tradeofferid || conf.creator_id) || raw.creator || raw.creator_steamid || raw.tradeofferid || raw.creator_id || '');
  const typeRaw = conf && (conf.type || conf.conf_type) || raw.type || raw.conf_type || raw.type_name || raw.typeName || '';
  const type = normalizeConfirmationType(typeRaw);
  const description = String(conf && (conf.description || conf.conf_description || conf.summary) || raw.conf_description || raw.description || raw.summary || '').toLowerCase();
  const hasTradeOfferField = Boolean(raw.tradeofferid || raw.trade_offer_id || raw.offer_id || raw.tradeOfferId);
  const matchedOffer = Boolean(offerSet && creator && offerSet.has(String(creator)));
  if (matchedOffer) return { kind: 'trade', is_trade: true, matched_offer_id: String(creator), reason: 'matched_requested_trade_offer_id' };
  if (hasTradeOfferField) return { kind: 'trade', is_trade: true, matched_offer_id: String(raw.tradeofferid || raw.trade_offer_id || raw.offer_id || raw.tradeOfferId), reason: 'tradeofferid_field_present' };
  if (type === 'trade') return { kind: 'trade', is_trade: true, matched_offer_id: null, reason: 'steam_confirmation_type_trade' };
  if (type === 'market' || /market|listing|sell listing|community market/.test(description)) return { kind: 'market', is_trade: false, matched_offer_id: null, reason: 'market_or_listing_confirmation' };
  if (type === 'login' || /login|sign in|device|authenticator|authorize|change password|email|phone|guard/.test(description)) return { kind: 'login_or_account', is_trade: false, matched_offer_id: null, reason: 'login_or_account_confirmation' };
  return { kind: 'unknown', is_trade: false, matched_offer_id: null, reason: 'unknown_confirmation_type' };
}
function normalizeConfirmations(list) {
  const raw = Array.isArray(list) ? list : [];
  return raw.map(conf => {
    const normalized = {
      id: String(conf.id || conf.conf_id || conf.cid || ''),
      nonce: String(conf.nonce || conf.key || conf.confirmation_key || conf.ck || ''),
      creator: String(conf.creator || conf.creator_steamid || conf.tradeofferid || conf.creator_id || ''),
      creator_steamid: String(conf.creator_steamid || conf.creator || conf.tradeofferid || ''),
      description: conf.conf_description || conf.description || conf.summary || '',
      type: conf.type || conf.conf_type || null,
      raw: conf
    };
    const classification = classifyConfirmation(normalized);
    normalized.kind = classification.kind;
    normalized.is_trade_confirmation = classification.is_trade;
    normalized.safety_reason = classification.reason;
    normalized.auto_actionable = false;
    return normalized;
  });
}
function findConfirmationByIdAndNonce(confirmations, confId, confNonce) {
  const id = String(confId || '');
  const nonce = String(confNonce || '');
  return (confirmations || []).find(conf => String(conf.id || '') === id && (!nonce || String(conf.nonce || conf.key || conf.confirmation_key || '') === nonce));
}

async function fetchConfirmations() {
  try {
    const maFile = loadMaFile();
    if (!maFile) return { ok: false, error: 'No maFile loaded.', stage: 'mafile_missing', diagnostics: buildDiagnostics() };
    if (!maFile.identity_secret) return { ok: false, error: 'identity_secret is missing.', stage: 'identity_secret_missing', diagnostics: buildDiagnostics() };
    const session = maFile.Session || {};
    if (!session.SteamID || !session.SteamLoginSecure || !session.SessionID) {
      markSessionHealth('missing_session', 'SteamLoginSecure/SessionID is missing. TOTP can work, but mobile confirmations require a fresh Steam session.');
      return { ok: false, error: 'SteamLoginSecure/SessionID is missing. TOTP can work, but mobile confirmations require a fresh Steam session.', stage: 'session_missing', session_recovery_required: true, diagnostics: buildDiagnostics() };
    }
    const time = Math.floor(Date.now() / 1000);
    const url = new URL('https://steamcommunity.com/mobileconf/getlist');
    url.searchParams.set('p', getDeviceId(maFile));
    url.searchParams.set('a', session.SteamID);
    url.searchParams.set('k', generateConfirmationKey(maFile.identity_secret, 'conf', time));
    url.searchParams.set('t', String(time));
    url.searchParams.set('m', 'android');
    url.searchParams.set('tag', 'conf');
    const result = await fetchJsonWithTimeout(url.toString(), readOptions().provider_timeout_seconds, { headers: { Cookie: buildCookies(maFile), 'User-Agent': 'Steam App / Android', Accept: 'application/json' } });
    const bodyLooksHtml = result.body && typeof result.body.raw === 'string' && /<html|<!doctype|<body/i.test(result.body.raw);
    if (bodyLooksHtml) {
      markSessionHealth('needs_refresh', 'Steam returned HTML instead of JSON. Refresh SteamLoginSecure/SessionID.');
      return { ok: false, status: result.status, error: 'Steam returned HTML instead of JSON. Session is probably expired.', stage: 'steam_returned_html', session_recovery_required: true, diagnostics: buildDiagnostics() };
    }
    if (!result.ok || result.body && result.body.success === false) {
      const steamMessage = result.body && (result.body.message || result.body.error || result.body.raw) || `Steam HTTP ${result.status}`;
      markSessionHealth('needs_refresh', safeError(steamMessage));
      return { ok: false, status: result.status, error: safeError(steamMessage), stage: 'steam_unsuccessful_response', body: safePlainObject(result.body), session_recovery_required: true, diagnostics: buildDiagnostics() };
    }
    const confirmations = normalizeConfirmations(result.body && (result.body.conf || result.body.confs || result.body.confirmations || []));
    const trade_count = confirmations.filter(conf => conf.is_trade_confirmation).length;
    const non_trade_count = confirmations.length - trade_count;
    markSessionHealth('ok', 'Confirmation API responded successfully.', { confirmations: confirmations.length, trade_count, non_trade_count });
    return { ok: true, confirmations, confs: confirmations, raw_count: confirmations.length, trade_count, non_trade_count, safety_policy: 'Only trade confirmations can be allowed from this add-on. Login/account/market/unknown confirmations are left untouched and can expire naturally.' };
  } catch (error) {
    const message = safeError(error);
    markSessionHealth('error', message);
    appendAudit('fetch_confirmations_exception', { message });
    return { ok: false, error: message, stage: 'fetch_confirmations_exception', diagnostics: buildDiagnostics() };
  }
}

async function performConfirmationOp(confId, confNonce, op = 'allow') {
  try {
    const options = readOptions();
    if (!options.allow_confirmations) return { ok: false, error: 'allow_confirmations is false in SDA Bridge options.', action_taken: false };
    const maFile = loadMaFile();
    if (!maFile) return { ok: false, error: 'No maFile loaded.', action_taken: false };
    const session = maFile.Session || {};
    if (!session.SteamID || !session.SteamLoginSecure || !session.SessionID) return { ok: false, error: 'Steam session is missing.', action_taken: false };
    const operation = op === 'cancel' || op === 'deny' ? 'cancel' : 'allow';
    const tag = operation === 'allow' ? 'allow' : 'cancel';
    const time = Math.floor(Date.now() / 1000);
    const url = new URL('https://steamcommunity.com/mobileconf/ajaxop');
    url.searchParams.set('op', operation);
    url.searchParams.set('p', getDeviceId(maFile));
    url.searchParams.set('a', session.SteamID);
    url.searchParams.set('k', generateConfirmationKey(maFile.identity_secret, tag, time));
    url.searchParams.set('t', String(time));
    url.searchParams.set('m', 'android');
    url.searchParams.set('tag', tag);
    url.searchParams.set('cid', String(confId));
    url.searchParams.set('ck', String(confNonce));
    const result = await fetchJsonWithTimeout(url.toString(), options.provider_timeout_seconds, { headers: { Cookie: buildCookies(maFile), 'User-Agent': 'Steam App / Android', Accept: 'application/json' } });
    const success = Boolean(result.ok && result.body && result.body.success !== false);
    appendAudit(operation === 'allow' ? 'confirmation_allowed' : 'confirmation_denied', { conf_id: String(confId), ok: success, status: result.status });
    return { ok: success, status: result.status, conf_id: String(confId), body: safePlainObject(result.body), action_taken: success, error: success ? null : safeError(result.body || `Steam HTTP ${result.status}`) };
  } catch (error) {
    const message = safeError(error);
    appendAudit('confirmation_operation_exception', { conf_id: String(confId), message });
    return { ok: false, error: message, action_taken: false, stage: 'confirmation_operation_exception' };
  }
}
async function acceptConfirmation(confId, confNonce, op = 'allow', guard = {}) {
  const operation = op === 'cancel' || op === 'deny' ? 'cancel' : 'allow';
  if (operation !== 'allow') {
    appendAudit('confirmation_cancel_blocked_by_policy', { conf_id: String(confId) });
    return { ok: false, blocked: true, action_taken: false, error: 'Deny/cancel is disabled by policy. Non-trade or suspicious confirmations are left untouched so they expire naturally.' };
  }
  const alreadyFetched = guard.alreadyFetchedConf || null;
  const expectedSet = guard.expectedOfferIds ? new Set(guard.expectedOfferIds.map(String)) : null;
  let conf = alreadyFetched;
  if (!conf) {
    const confsResult = await fetchConfirmations();
    if (!confsResult.ok) return { ...confsResult, action_taken: false };
    conf = findConfirmationByIdAndNonce(confsResult.confirmations, confId, confNonce);
  }
  if (!conf) {
    appendAudit('confirmation_allow_blocked_not_found', { conf_id: String(confId) });
    return { ok: false, blocked: true, action_taken: false, error: 'Confirmation was not found in the current Steam confirmation list.' };
  }
  const classification = classifyConfirmation(conf, expectedSet);
  if (!classification.is_trade) {
    appendAudit('confirmation_allow_blocked_non_trade', { conf_id: String(confId), kind: classification.kind, reason: classification.reason });
    return { ok: false, blocked: true, action_taken: false, conf_id: String(confId), kind: classification.kind, safety_reason: classification.reason, error: 'Blocked by safety policy: this is not a confirmed trade-offer confirmation. It was not allowed or denied.' };
  }
  const result = await performConfirmationOp(confId, confNonce, 'allow');
  return { ...result, kind: classification.kind, matched_offer_id: classification.matched_offer_id, safety_reason: classification.reason };
}
async function autoConfirmOffers(offerIds) {
  if (!readOptions().allow_confirmations) return { ok: false, skipped: true, error: 'allow_confirmations is false in SDA Bridge options.' };
  const wanted = new Set((offerIds || []).map(String));
  if (!wanted.size) return { ok: true, confirmed: [], skipped_no_offers: true };
  const confsResult = await fetchConfirmations();
  if (!confsResult.ok) return confsResult;
  const confirmed = [];
  const ignored = [];
  const unmatched = new Set([...wanted]);
  for (const conf of confsResult.confirmations) {
    const classification = classifyConfirmation(conf, wanted);
    if (!classification.is_trade || !classification.matched_offer_id || !wanted.has(String(classification.matched_offer_id))) {
      ignored.push({ conf_id: conf.id, kind: classification.kind, reason: classification.reason, action_taken: false });
      continue;
    }
    const offerId = String(classification.matched_offer_id);
    unmatched.delete(offerId);
    const result = await acceptConfirmation(conf.id, conf.nonce, 'allow', { expectedOfferIds: [offerId], alreadyFetchedConf: conf });
    confirmed.push({ conf_id: conf.id, offer_id: offerId, ok: result.ok, error: result.error || null, action_taken: result.action_taken === true });
  }
  appendAudit('auto_confirm_cycle', { offer_count: wanted.size, confirmed: confirmed.length, ignored: ignored.length, unmatched: unmatched.size, total_confs: confsResult.confirmations.length });
  return { ok: true, confirmed, ignored, unmatched: [...unmatched], total_confs: confsResult.confirmations.length, safety_policy: 'Only matched trade-offer confirmations were allowed. Everything else was left untouched.' };
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/status' || pathname === '/status' || pathname === '/') return json(res, 200, publicStatus());
  if (pathname === '/api/diagnostics' || pathname === '/diagnostics') return json(res, 200, buildDiagnostics());
  if (pathname === '/api/mafile' && req.method === 'POST') {
    const raw = await readBody(req);
    const parsed = parseMaFilePayload(raw);
    if (!parsed.ok) return json(res, 400, parsed);
    const { normalized, report } = verifyMaFile(parsed.value);
    if (report.encrypted_shape_detected && !report.totp_ready) return json(res, 400, { ok: false, error: 'This looks like an encrypted maFile. Export/decrypt it in SDA first.', report });
    if (!report.shared_secret || !report.identity_secret) return json(res, 400, { ok: false, error: 'maFile must contain shared_secret and identity_secret.', report });
    saveMaFile(normalized);
    markSessionHealth(report.confirmations_ready ? 'uploaded_not_checked' : 'missing_session', report.confirmations_ready ? 'maFile saved; confirmations not checked yet.' : 'maFile saved without SteamLoginSecure/SessionID.');
    return json(res, 200, { ok: true, saved: true, report, status: publicStatus() });
  }
  if (pathname === '/api/mafile/check' && req.method === 'POST') {
    const raw = await readBody(req);
    const parsed = parseMaFilePayload(raw);
    if (!parsed.ok) return json(res, 400, parsed);
    const { report } = verifyMaFile(parsed.value);
    return json(res, 200, { ok: true, report });
  }
  if (pathname === '/api/session' && req.method === 'POST') {
    const body = parseFlexibleJsonValue(await readBody(req));
    if (!body.ok || !body.value || typeof body.value !== 'object') return json(res, 400, { ok: false, error: 'Expected JSON object with SteamID64, SteamLoginSecure and SessionID.' });
    const maFile = loadMaFile();
    if (!maFile) return json(res, 400, { ok: false, error: 'Save maFile first.' });
    const steamId = body.value.SteamID || body.value.steam_id64 || body.value.steamid64 || body.value.steamId64 || maFile.Session?.SteamID || '';
    const steamLoginSecure = body.value.SteamLoginSecure || body.value.steamLoginSecure || body.value.steam_login_secure || '';
    const sessionId = body.value.SessionID || body.value.sessionid || body.value.session_id || '';
    if (!steamId || !steamLoginSecure || !sessionId) return json(res, 400, { ok: false, error: 'SteamID64, SteamLoginSecure and SessionID are required.' });
    maFile.Session = { SteamID: String(steamId), SteamLoginSecure: String(steamLoginSecure), SessionID: String(sessionId) };
    saveMaFile(maFile);
    markSessionHealth('manual_session_saved', 'Manual Steam session saved; confirmations not checked yet.');
    return json(res, 200, { ok: true, saved: true, status: publicStatus() });
  }
  if (pathname === '/api/totp' || pathname === '/api/code') {
    const options = readOptions();
    if (!options.expose_code) return json(res, 403, { ok: false, error: 'expose_code is disabled in options.' });
    const maFile = loadMaFile();
    if (!maFile || !maFile.shared_secret) return json(res, 400, { ok: false, error: 'No shared_secret loaded.' });
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = 30 - (now % 30);
    try { return json(res, 200, { ok: true, code: generateTOTP(maFile.shared_secret), seconds_remaining: secondsRemaining, expires_at_unix: now + secondsRemaining, account_name: maFile.account_name || null }); }
    catch (error) { return json(res, 400, { ok: false, error: safeError(error) }); }
  }
  if (pathname === '/api/confirmations' || pathname === '/confirmations') {
    if (req.method === 'POST') {
      const query = requestSearchParams(req);
      let body = {}; try { body = JSON.parse(await readBody(req) || '{}'); } catch (_error) {}
      const id = body.id || body.conf_id || body.cid || query.get('id') || query.get('cid');
      const key = body.key || body.nonce || body.conf_nonce || body.ck || query.get('key') || query.get('ck');
      const tag = body.tag || query.get('tag') || 'allow';
      if (!id || !key) return json(res, 400, { ok: false, error: 'Confirmation id and key/nonce are required.' });
      const result = await acceptConfirmation(id, key, tag);
      return json(res, result.ok ? 200 : 400, result);
    }
    const result = await fetchConfirmations();
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/confirm-offers' && req.method === 'POST') {
    let body = {}; try { body = JSON.parse(await readBody(req) || '{}'); } catch (_error) {}
    const offerIds = body.offer_ids || body.offers || [];
    const result = await autoConfirmOffers(Array.isArray(offerIds) ? offerIds : [offerIds]);
    return json(res, result.ok ? 200 : 400, result);
  }
  if (pathname === '/api/audit') {
    try { const lines = fs.readFileSync(AUDIT_PATH, 'utf8').trim().split('\n').filter(Boolean).slice(-200).map(line => JSON.parse(line)); return json(res, 200, { ok: true, entries: lines }); } catch (_error) { return json(res, 200, { ok: true, entries: [] }); }
  }
  return json(res, 404, { ok: false, error: 'Not found' });
}
function serveStatic(res, pathname) {
  const clean = pathname === '/' ? '/index.html' : pathname;
  const file = path.join(PUBLIC_DIR, clean.replace(/^\/+/, ''));
  if (!file.startsWith(PUBLIC_DIR)) return text(res, 403, 'Forbidden');
  try { const data = fs.readFileSync(file); const ext = path.extname(file); const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.css' ? 'text/css; charset=utf-8' : ext === '.js' ? 'application/javascript; charset=utf-8' : 'application/octet-stream'; return text(res, 200, data, type); } catch (_error) { return text(res, 404, 'Not found'); }
}
async function handle(req, res) {
  try {
    const pathname = normalizeIngressPath(req);
    if (pathname.startsWith('/api/') || pathname === '/status' || pathname === '/confirmations' || (pathname === '/' && req.headers.accept && req.headers.accept.includes('application/json'))) return await handleApi(req, res, pathname);
    return serveStatic(res, pathname);
  } catch (error) { return json(res, 500, errorPayload(error, { diagnostics: buildDiagnostics() })); }
}

ensureDataDir();
console.log(`[tf2-sda-bridge] version: ${APP_VERSION}`);
console.log('[tf2-sda-bridge] embedded maFile SDA helper; no external SDA service required');
http.createServer(handle).listen(PORT, HOST, () => console.log(`[tf2-sda-bridge] listening on ${HOST}:${PORT}`));
