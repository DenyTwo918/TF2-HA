'use strict';

const express       = require('express');
const SteamUser     = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp     = require('steam-totp');
const fs            = require('fs');
const path          = require('path');
const { EventEmitter } = require('events');

// ─── Constants ────────────────────────────────────────────────────────────────

const VERSION  = '5.13.59';
const PORT     = Number(process.env.PORT  || 8099);
const DATA_DIR = process.env.DATA_DIR    || '/data';

// ─── Paths ────────────────────────────────────────────────────────────────────

const P = {
  creds:        path.join(DATA_DIR, 'tf2-hub-credentials.json'),
  options:      path.join(DATA_DIR, 'options.json'),
  audit:        path.join(DATA_DIR, 'steam-companion-audit.jsonl'),
  listings:     path.join(DATA_DIR, 'steam-companion-backpack-listings.json'),
  priceSchema:  path.join(DATA_DIR, 'tf2-hub-backpack-price-schema.json'),
  pollData:     path.join(DATA_DIR, 'steam-tradeoffer-poll.json'),
};

// ─── Storage ──────────────────────────────────────────────────────────────────

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return fallback; }
}

function writeJson(p, data) {
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, p);
}

function appendAudit(entry) {
  try {
    fs.appendFileSync(P.audit, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n', 'utf8');
  } catch { /* non-fatal */ }
}

// ─── Logging ──────────────────────────────────────────────────────────────────

const bus = new EventEmitter();
bus.setMaxListeners(100);

function log(level, event, data = {}) {
  const entry = { level, event, ...data };
  console.log(`[${level.toUpperCase()}] ${event}`, Object.keys(data).length ? data : '');
  appendAudit(entry);
  bus.emit('log', entry);
}

// ─── Options ──────────────────────────────────────────────────────────────────

function getOptions() { return readJson(P.options, {}); }

// ─── Credentials ──────────────────────────────────────────────────────────────

function loadCreds() { return readJson(P.creds, {}); }

function saveCreds(patch) {
  const cur = loadCreds();
  const next = { ...cur };
  const FIELDS = ['username','password','shared_secret','identity_secret',
                  'steam_api_key','bptf_token','steam_id'];
  for (const f of FIELDS) {
    if (patch[f] !== undefined && patch[f] !== '') next[f] = patch[f];
  }
  writeJson(P.creds, next);
  return next;
}

function credStatus() {
  const c = loadCreds();
  return {
    has_username:        !!c.username,
    has_password:        !!c.password,
    has_shared_secret:   !!c.shared_secret,
    has_identity_secret: !!c.identity_secret,
    has_steam_api_key:   !!c.steam_api_key,
    has_bptf_token:      !!c.bptf_token,
    steam_id:            c.steam_id || null,
    username:            c.username || null,
  };
}

// ─── Bot state ────────────────────────────────────────────────────────────────

const bot = {
  status:      'offline',   // offline | connecting | online | error | needs_2fa
  loginError:  null,
  steamId:     null,
  displayName: null,
  offerQueue:  [],          // pending manual review
  listings:    [],
  inventory:   [],
  lastOfferSync:   null,
  lastListingSync: null,
  lastInvSync:     null,
  startedAt:       new Date().toISOString(),
};

// Steam client instances (recreated on reconnect)
let client    = null;
let community = null;
let manager   = null;
let reconnectTimer = null;

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

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

// ─── backpack.tf ──────────────────────────────────────────────────────────────

let _priceSchemaCache = null;
let _priceSchemaTTL   = 0;

async function getPriceSchema() {
  if (_priceSchemaCache && Date.now() < _priceSchemaTTL) return _priceSchemaCache;
  const c = loadCreds();
  if (!c.bptf_token) return readJson(P.priceSchema, null);
  try {
    const data = await apiFetch(
      `https://backpack.tf/api/IGetPrices/v4?key=${c.bptf_token}&appid=440`,
      {}, 30000
    );
    _priceSchemaCache = data;
    _priceSchemaTTL   = Date.now() + 60 * 60 * 1000; // 1 h
    writeJson(P.priceSchema, data);
    log('info', 'price_schema_updated', {});
    return data;
  } catch (err) {
    log('warn', 'price_schema_fetch_failed', { error: err.message });
    return readJson(P.priceSchema, null);
  }
}

async function syncListings() {
  const c = loadCreds();
  const steamId = c.steam_id || bot.steamId;
  if (!c.bptf_token || !steamId) { bot.listings = readJson(P.listings, []); return bot.listings; }
  try {
    const data = await apiFetch(
      `https://backpack.tf/api/classifieds/listings/v1?token=${c.bptf_token}&steamid=${steamId}`,
      {}, 20000
    );
    bot.listings = (data.listings || []).map(l => ({
      id:         l.id,
      intent:     l.intent === 0 ? 'buy' : 'sell',
      item_name:  l.item?.name || 'Unknown',
      currencies: l.currencies,
      bump:       l.bump,
      created:    l.created,
    }));
    bot.lastListingSync = new Date().toISOString();
    writeJson(P.listings, bot.listings);
    log('info', 'listings_synced', { count: bot.listings.length });
  } catch (err) {
    log('warn', 'listings_sync_failed', { error: err.message });
    bot.listings = readJson(P.listings, []);
  }
  return bot.listings;
}

async function archiveListing(id) {
  const c = loadCreds();
  if (!c.bptf_token) throw new Error('No backpack.tf token configured');
  await apiFetch('https://backpack.tf/api/classifieds/delete/v1', {
    method:  'DELETE',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': c.bptf_token },
    body:    JSON.stringify({ listing_id: id }),
  }, 15000);
  log('info', 'listing_archived', { id });
}

async function publishListing(payload) {
  const c = loadCreds();
  if (!c.bptf_token) throw new Error('No backpack.tf token configured');
  const data = await apiFetch('https://backpack.tf/api/classifieds/list/v1', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': c.bptf_token },
    body:    JSON.stringify({ listings: [payload] }),
  }, 15000);
  log('info', 'listing_published', { result: data });
  return data;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

async function syncInventory() {
  const c = loadCreds();
  const steamId = c.steam_id || bot.steamId;
  if (!steamId) return bot.inventory;
  try {
    const url = `https://steamcommunity.com/inventory/${steamId}/440/2?l=english&count=5000`;
    const data = await apiFetch(url, {}, 20000);
    const descriptions = new Map(
      (data.descriptions || []).map(d => [`${d.classid}_${d.instanceid}`, d])
    );
    bot.inventory = (data.assets || []).map(a => {
      const desc = descriptions.get(`${a.classid}_${a.instanceid}`) || {};
      return {
        assetid:  a.assetid,
        classid:  a.classid,
        name:     desc.name || 'Unknown',
        quality:  desc.tags?.find(t => t.category === 'Quality')?.localized_tag_name || '',
        tradable: desc.tradable === 1,
        amount:   Number(a.amount) || 1,
      };
    }).filter(i => i.tradable);
    bot.lastInvSync = new Date().toISOString();
    log('info', 'inventory_synced', { count: bot.inventory.length });
  } catch (err) {
    log('warn', 'inventory_sync_failed', { error: err.message });
  }
  return bot.inventory;
}

// ─── Steam bot ────────────────────────────────────────────────────────────────

function buildSteamClients() {
  client    = new SteamUser();
  community = new SteamCommunity();
  manager   = new TradeOfferManager({
    steam:        client,
    community,
    language:     'en',
    pollInterval: 30000,
    pollData:     readJson(P.pollData, undefined),
    cancelTime:   7 * 24 * 60 * 60 * 1000,
  });

  // ── Client events ──────────────────────────────────────────────────────────

  client.on('loggedOn', () => {
    bot.status     = 'online';
    bot.steamId    = client.steamID?.getSteamID64();
    bot.loginError = null;
    try {
      const creds = loadCreds();
      if (bot.steamId && creds.steam_id !== bot.steamId) saveCreds({ steam_id: bot.steamId });
    } catch { /* non-fatal */ }
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed(440);
    log('info', 'steam_logged_on', { steamid: bot.steamId });
    bus.emit('status');
  });

  client.on('friendMessage', (steamId, message) => {
    log('info', 'friend_message', { from: steamId.getSteamID64(), message });
  });

  client.on('webSession', (_sessionId, cookies) => {
    manager.setCookies(cookies, err => {
      if (err) log('warn', 'manager_set_cookies_failed', { error: err.message });
    });
    community.setCookies(cookies);
    const c = loadCreds();
    if (c.identity_secret) {
      community.startConfirmationChecker(30000, c.identity_secret);
    }
    log('info', 'steam_web_session_set', {});
  });

  client.on('steamGuard', (_domain, callback, lastCodeWrong) => {
    if (lastCodeWrong) log('warn', 'steamguard_wrong_code', {});
    const c = loadCreds();
    if (c.shared_secret) {
      const code = SteamTotp.generateAuthCode(c.shared_secret);
      log('info', 'steamguard_totp_generated', {});
      callback(code);
    } else {
      bot.status     = 'needs_2fa';
      bot.loginError = 'Steam Guard required. Set shared_secret in credentials.';
      log('warn', 'steamguard_no_secret', {});
      bus.emit('status');
    }
  });

  client.on('error', err => {
    bot.status     = 'error';
    bot.loginError = err.message;
    log('error', 'steam_client_error', { message: err.message, eresult: err.eresult });
    bus.emit('status');
    scheduleReconnect();
  });

  client.on('disconnected', (eresult, msg) => {
    bot.status = 'offline';
    log('warn', 'steam_disconnected', { eresult, msg });
    bus.emit('status');
    scheduleReconnect();
  });

  // ── Manager events ─────────────────────────────────────────────────────────

  manager.on('pollData', data => {
    try { writeJson(P.pollData, data); } catch { /* non-fatal */ }
  });

  manager.on('newOffer', offer => {
    const entry = {
      id:             offer.id,
      partner:        offer.partner?.getSteamID64(),
      message:        offer.message || '',
      items_to_give:  offer.itemsToGive?.map(i => ({ assetid: i.assetid, name: i.name, classid: i.classid })) || [],
      items_to_receive: offer.itemsToReceive?.map(i => ({ assetid: i.assetid, name: i.name, classid: i.classid })) || [],
      is_gift:        offer.itemsToGive?.length === 0,
      received_at:    new Date().toISOString(),
    };
    bot.offerQueue.push(entry);
    bot.lastOfferSync = new Date().toISOString();
    log('info', 'new_trade_offer', { id: entry.id, partner: entry.partner, items_in: entry.items_to_receive.length, items_out: entry.items_to_give.length });
    bus.emit('offer', entry);
  });

  manager.on('receivedOfferChanged', (offer, _oldState) => {
    const active = TradeOfferManager.ETradeOfferState.Active;
    if (offer.state !== active) {
      bot.offerQueue = bot.offerQueue.filter(o => o.id !== offer.id);
      log('info', 'offer_no_longer_active', { id: offer.id, state: offer.state });
    }
  });

  manager.on('pollFailure', err => {
    log('warn', 'trade_poll_failure', { error: err.message });
  });
}

function scheduleReconnect(delayMs = 30000) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    tryLogin().catch(err => log('error', 'reconnect_error', { error: err.message }));
  }, delayMs);
}

async function tryLogin() {
  const c = loadCreds();
  if (!c.username || !c.password) {
    log('info', 'login_skipped_no_credentials', {});
    return;
  }
  if (bot.status === 'online' || bot.status === 'connecting') return;

  // Tear down old clients
  if (client) {
    try { client.logOff(); } catch { /* ignore */ }
    client    = null;
    community = null;
    manager   = null;
  }

  bot.status     = 'connecting';
  bot.loginError = null;
  log('info', 'steam_login_attempt', { username: c.username });
  bus.emit('status');

  buildSteamClients();

  const loginOptions = { accountName: c.username, password: c.password };
  if (c.shared_secret) {
    loginOptions.twoFactorCode = SteamTotp.generateAuthCode(c.shared_secret);
  }
  client.logOn(loginOptions);
}

// ─── Offer actions ────────────────────────────────────────────────────────────

function getOffer(id) {
  return new Promise((resolve, reject) => {
    if (!manager) return reject(new Error('Steam not connected'));
    manager.getOffer(id, (err, offer) => err ? reject(err) : resolve(offer));
  });
}

async function acceptOffer(id) {
  const offer = await getOffer(id);
  await new Promise((resolve, reject) => {
    offer.accept((err, status) => err ? reject(err) : resolve(status));
  });
  bot.offerQueue = bot.offerQueue.filter(o => o.id !== id);
  log('info', 'offer_accepted', { id });
}

async function declineOffer(id) {
  const offer = await getOffer(id);
  await new Promise((resolve, reject) => {
    offer.decline(err => err ? reject(err) : resolve());
  });
  bot.offerQueue = bot.offerQueue.filter(o => o.id !== id);
  log('info', 'offer_declined', { id });
}

async function counterOffer(id, itemsToGive, itemsToReceive) {
  const offer  = await getOffer(id);
  const newOffer = offer.counter();
  itemsToGive?.forEach(i => newOffer.addMyItem({ appid: 440, contextid: '2', assetid: i }));
  itemsToReceive?.forEach(i => newOffer.addTheirItem({ appid: 440, contextid: '2', assetid: i }));
  await new Promise((resolve, reject) => {
    newOffer.send((err) => err ? reject(err) : resolve());
  });
  bot.offerQueue = bot.offerQueue.filter(o => o.id !== id);
  log('info', 'offer_countered', { original_id: id });
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

let tickRunning = false;

async function schedulerTick() {
  if (tickRunning) return;
  tickRunning = true;
  try {
    const now         = Date.now();
    const LISTING_TTL = 5  * 60 * 1000;
    const INV_TTL     = 10 * 60 * 1000;

    if (!bot.lastListingSync || now - new Date(bot.lastListingSync).getTime() > LISTING_TTL) {
      await syncListings().catch(e => log('warn', 'tick_listings_error', { error: e.message }));
    }
    if (!bot.lastInvSync || now - new Date(bot.lastInvSync).getTime() > INV_TTL) {
      await syncInventory().catch(e => log('warn', 'tick_inventory_error', { error: e.message }));
    }
  } finally {
    tickRunning = false;
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const wrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);

// ── Status ──────────────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  res.json({
    ok:              true,
    version:         VERSION,
    status:          bot.status,
    steam_id:        bot.steamId,
    display_name:    bot.displayName,
    login_error:     bot.loginError,
    offer_queue:     bot.offerQueue.length,
    listing_count:   bot.listings.length,
    inventory_count: bot.inventory.length,
    last_offer_sync: bot.lastOfferSync,
    last_listing_sync: bot.lastListingSync,
    last_inv_sync:   bot.lastInvSync,
    started_at:      bot.startedAt,
    credentials:     credStatus(),
  });
});

app.get('/api/version', (_req, res) => res.json({ version: VERSION }));

// ── Credentials ─────────────────────────────────────────────────────────────

app.get('/api/credentials', (_req, res) => res.json({ ok: true, ...credStatus() }));

app.post('/api/credentials', wrap(async (req, res) => {
  const next = saveCreds(req.body || {});
  log('info', 'credentials_saved', {});
  // If bot is offline and we now have enough to log in, try
  if (bot.status === 'offline' || bot.status === 'error') {
    tryLogin().catch(() => {});
  }
  res.json({ ok: true, ...credStatus() });
}));

// ── Trade offers ─────────────────────────────────────────────────────────────

app.get('/api/offers', (_req, res) =>
  res.json({ ok: true, offers: bot.offerQueue })
);

app.post('/api/offers/sync', (req, res) => {
  if (manager) {
    try { manager.doPoll(); }
    catch (err) { log('warn', 'manual_offer_poll_failed', { error: err.message }); }
    bot.lastOfferSync = new Date().toISOString();
  }
  res.json({ ok: true, offers: bot.offerQueue });
});

app.post('/api/offers/:id/accept', wrap(async (req, res) => {
  if (bot.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await acceptOffer(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/offers/:id/decline', wrap(async (req, res) => {
  if (bot.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  await declineOffer(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/offers/:id/counter', wrap(async (req, res) => {
  if (bot.status !== 'online') return res.status(503).json({ ok: false, error: 'Bot offline' });
  const { items_to_give, items_to_receive } = req.body || {};
  await counterOffer(req.params.id, items_to_give, items_to_receive);
  res.json({ ok: true });
}));

// ── Listings ─────────────────────────────────────────────────────────────────

app.get('/api/listings', (_req, res) =>
  res.json({ ok: true, listings: bot.listings, last_sync: bot.lastListingSync })
);

app.post('/api/listings/sync', wrap(async (req, res) => {
  const listings = await syncListings();
  res.json({ ok: true, listings, last_sync: bot.lastListingSync });
}));

app.post('/api/listings', wrap(async (req, res) => {
  const result = await publishListing(req.body);
  await syncListings().catch(() => {});
  res.json({ ok: true, result });
}));

app.delete('/api/listings/:id', wrap(async (req, res) => {
  await archiveListing(req.params.id);
  await syncListings().catch(() => {});
  res.json({ ok: true });
}));

// ── Inventory ────────────────────────────────────────────────────────────────

app.get('/api/inventory', (_req, res) =>
  res.json({ ok: true, inventory: bot.inventory, count: bot.inventory.length, last_sync: bot.lastInvSync })
);

app.post('/api/inventory/sync', wrap(async (req, res) => {
  await syncInventory();
  res.json({ ok: true, inventory: bot.inventory, count: bot.inventory.length, last_sync: bot.lastInvSync });
}));

// ── Prices ───────────────────────────────────────────────────────────────────

app.get('/api/prices/schema', wrap(async (req, res) => {
  const schema = await getPriceSchema();
  res.json({ ok: true, has_schema: !!schema, item_count: schema ? Object.keys(schema.response?.items || {}).length : 0 });
}));

// ── Bot control ──────────────────────────────────────────────────────────────

app.post('/api/bot/login', wrap(async (req, res) => {
  await tryLogin();
  res.json({ ok: true, status: bot.status });
}));

app.post('/api/bot/disconnect', (_req, res) => {
  if (client) try { client.logOff(); } catch { /* ignore */ }
  bot.status = 'offline';
  bus.emit('status');
  res.json({ ok: true });
});

// ── Events (audit log) ───────────────────────────────────────────────────────

app.get('/api/events', (_req, res) => {
  try {
    const lines = fs.existsSync(P.audit)
      ? fs.readFileSync(P.audit, 'utf8').trim().split('\n').filter(Boolean).slice(-200)
      : [];
    const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    res.json({ ok: true, events: entries.reverse() });
  } catch { res.json({ ok: true, events: [] }); }
});

// Server-Sent Events for live updates
app.get('/api/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const send = data => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const onLog    = e => send({ type: 'log',    entry: e });
  const onStatus = () => send({ type: 'status', status: bot.status });
  const onOffer  = e => send({ type: 'offer',  offer: e });
  bus.on('log',    onLog);
  bus.on('status', onStatus);
  bus.on('offer',  onOffer);
  // heartbeat every 25 s to prevent proxy timeout
  const hb = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(hb);
    bus.off('log',    onLog);
    bus.off('status', onStatus);
    bus.off('offer',  onOffer);
  });
});

// ── Compatibility endpoints for older dashboard probes ──────────────────────

app.get('/api/version-audit', (_req, res) => {
  res.json({
    ok: true,
    app_version: VERSION,
    addon_version: VERSION,
    server_version: VERSION,
    package_version: readJson(path.join(__dirname, '..', 'package.json'), {}).version || VERSION,
  });
});

app.get('/api/diagnostics/bundle', (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    status: bot.status,
    login_error: bot.loginError,
    credentials: credStatus(),
    offer_queue: bot.offerQueue.length,
    listing_count: bot.listings.length,
    inventory_count: bot.inventory.length,
    files: {
      audit_exists: fs.existsSync(P.audit),
      poll_data_exists: fs.existsSync(P.pollData),
      price_schema_exists: fs.existsSync(P.priceSchema),
    },
    node_version: process.version,
    uptime_seconds: Math.floor((Date.now() - new Date(bot.startedAt)) / 1000),
  });
});

// ── Diagnostics ──────────────────────────────────────────────────────────────

app.get('/api/diagnostics', (_req, res) => {
  res.json({
    ok:             true,
    version:        VERSION,
    status:         bot.status,
    login_error:    bot.loginError,
    credentials:    credStatus(),
    offer_queue:    bot.offerQueue.length,
    listing_count:  bot.listings.length,
    inventory_count: bot.inventory.length,
    started_at:     bot.startedAt,
    uptime_seconds: Math.floor((Date.now() - new Date(bot.startedAt)) / 1000),
    node_version:   process.version,
  });
});

// ── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  log('error', 'request_error', { method: req.method, path: req.path, error: err.message });
  res.status(500).json({ ok: false, error: err.message });
});

// ─── Startup ──────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Global crash guards
  process.on('uncaughtException', err => {
    log('error', 'uncaught_exception', { error: err.message, stack: err.stack?.split('\n')[0] });
  });
  process.on('unhandledRejection', reason => {
    log('error', 'unhandled_rejection', { error: String(reason) });
  });
  process.on('SIGTERM', () => {
    log('info', 'sigterm_received', {});
    if (client) try { client.logOff(); } catch { /* ignore */ }
    process.exit(0);
  });

  log('info', 'server_starting', { version: VERSION, port: PORT });

  app.listen(PORT, '0.0.0.0', () => {
    log('info', 'server_listening', { port: PORT });
  });

  // Try Steam login
  await tryLogin().catch(err => log('error', 'initial_login_error', { error: err.message }));

  // Scheduler: tick every 60 s
  setInterval(() => {
    schedulerTick().catch(err => log('error', 'scheduler_error', { error: err.message }));
  }, 60 * 1000);

  log('info', 'server_ready', { version: VERSION });
}

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
