'use strict';

const state = {
  version: '5.13.68',
  accounts: [],
  selected: 'main',
  selectedStatus: null,
  inventory: [],
  listings: [],
  drafts: [],
  offers: [],
  events: [],
  pricing: {},
};

const $ = (id) => document.getElementById(id);
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString() : 'Not synced';
const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function ingressBasePath() {
  const path = window.location.pathname || '/';
  const marker = '/api/hassio_ingress/';
  const markerIndex = path.indexOf(marker);
  if (markerIndex >= 0) {
    const before = path.slice(0, markerIndex);
    const rest = path.slice(markerIndex + marker.length);
    const token = rest.split('/').filter(Boolean)[0] || '';
    return `${before}${marker}${token}/`;
  }
  if (path.endsWith('/')) return path;
  return path.replace(/\/[^/]*$/, '/') || '/';
}

function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path || '').replace(/^\/+/, '');
  const normalized = clean.startsWith('api/') ? clean : `api/${clean}`;
  return new URL(normalized, `${window.location.origin}${ingressBasePath()}`).toString();
}

async function api(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function setBusy(button, text, promise) {
  const old = button.textContent;
  button.disabled = true;
  button.textContent = text;
  const timeout = setTimeout(() => { button.disabled = false; button.textContent = old; }, 15000);
  return Promise.resolve(promise).finally(() => {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = old;
  });
}

function badgeClass(status) {
  if (status === 'online') return 'online';
  if (status === 'connecting' || status === 'reconnect_wait') return 'connecting';
  if (status === 'error' || status === 'steamguard_required') return 'error';
  return 'offline';
}

function currentAccount() {
  return state.accounts.find(a => a.account_id === state.selected) || state.accounts[0] || null;
}

function renderStatus(status) {
  state.version = status.version || state.version;
  $('sideVersion').textContent = state.version;
  state.accounts = status.accounts || [];
  state.pricing = status.pricing || {};
  if (!state.accounts.find(a => a.account_id === state.selected)) state.selected = state.accounts[0]?.account_id || 'main';
  state.selectedStatus = currentAccount();

  renderAccountSelector();
  renderAccountCards();

  const selected = currentAccount() || status;
  $('statusBadge').textContent = selected.status || 'offline';
  $('statusBadge').className = `status-badge ${badgeClass(selected.status)}`;
  $('statusPill').textContent = selected.status || 'offline';
  $('statusPill').className = `pill ${badgeClass(selected.status)}`;
  $('statAccounts').textContent = state.accounts.length;
  $('statAccountsSub').textContent = `${state.accounts.filter(a => a.enabled).length} enabled`;
  $('statOnline').textContent = state.accounts.filter(a => a.status === 'online').length;
  $('statInventory').textContent = selected.inventory_count ?? 0;
  $('statInventorySync').textContent = selected.last_inv_sync ? `Synced ${fmtTime(selected.last_inv_sync)}` : selected.inventory_error || 'Not synced';
  $('statListings').textContent = selected.listing_count ?? 0;
  $('statListingSync').textContent = selected.last_listing_sync ? `Synced ${fmtTime(selected.last_listing_sync)}` : selected.backpack?.status || 'Not synced';
  $('statDrafts').textContent = selected.draft_count ?? 0;
  $('statPrices').textContent = state.pricing.item_count || 0;
  $('statPriceSub').textContent = state.pricing.status || 'not loaded';
  $('offerCount').textContent = selected.offer_queue || 0;
  $('draftCount').textContent = selected.draft_count || 0;
  $('invCount').textContent = selected.inventory_count || 0;

  const err = $('loginError');
  if (selected.login_error) { err.textContent = selected.login_error; err.classList.remove('hidden'); }
  else err.classList.add('hidden');

  const flags = selected.flags || {};
  $('safetyBanner').innerHTML = `<strong>${flags.dry_run ? 'DRY RUN enabled' : 'LIVE ACTIONS enabled'}</strong><br>${flags.autonomous_enabled ? 'Autonomous pipeline is enabled for this account.' : 'Autonomous pipeline is disabled; manual review is default.'}`;

  setBar('barSteam', selected.status === 'online');
  setBar('barOffers', !!selected.offer_manager_ready);
  setBar('barBackpack', ['ok', 'empty'].includes(selected.backpack?.status));
  setBar('barInventory', !!selected.last_inv_sync);

  fillForm(selected);
}

function setBar(id, ok) {
  const el = $(id);
  el.style.width = ok ? '100%' : '35%';
  el.className = ok ? 'ok' : 'warn';
}

function renderAccountSelector() {
  const sel = $('accountSelector');
  const value = state.selected;
  sel.innerHTML = state.accounts.map(a => `<option value="${esc(a.account_id)}">${esc(a.label || a.account_id)} · ${esc(a.status || 'offline')}</option>`).join('');
  sel.value = value;
}

function renderAccountCards() {
  const box = $('accountCards');
  if (!state.accounts.length) {
    box.innerHTML = `<div class="empty">No accounts yet. Create the main account below.</div>`;
    return;
  }
  box.innerHTML = state.accounts.map(a => `
    <article class="account-card ${a.account_id === state.selected ? 'selected' : ''}" data-account="${esc(a.account_id)}">
      <div class="account-top"><strong>${esc(a.label || a.account_id)}</strong><span class="pill ${badgeClass(a.status)}">${esc(a.status || 'offline')}</span></div>
      <div class="muted">${esc(a.account_id)} · ${esc(a.role)} · ${a.enabled ? 'enabled' : 'disabled'}</div>
      <div class="mini-grid"><span>Inventory <b>${a.inventory_count || 0}</b></span><span>Listings <b>${a.listing_count || 0}</b></span><span>Offers <b>${a.offer_queue || 0}</b></span><span>Drafts <b>${a.draft_count || 0}</b></span></div>
      <div class="account-actions"><button class="btn btn-ghost btn-small" data-action="select" data-account="${esc(a.account_id)}">Open</button><button class="btn btn-ghost btn-small" data-action="connect" data-account="${esc(a.account_id)}">Connect</button><button class="btn btn-ghost btn-small" data-action="disconnect" data-account="${esc(a.account_id)}">Disconnect</button><button class="btn btn-ghost btn-small" data-action="pipeline" data-account="${esc(a.account_id)}">Pipeline</button></div>
    </article>`).join('');
}

function fillForm(account) {
  const form = $('accountForm');
  if (!account) return;
  form.account_id.value = account.account_id || 'main';
  form.label.value = account.label || '';
  form.role.value = account.role || 'trading';
  form.enabled.value = String(account.enabled !== false);
  form.dry_run.value = String(account.flags?.dry_run !== false);
  form.autonomous_enabled.value = String(!!account.flags?.autonomous_enabled);
  form.autonomous_publish_enabled.value = String(!!account.flags?.autonomous_publish_enabled);
  form.autonomous_trade_accept_enabled.value = String(!!account.flags?.autonomous_trade_accept_enabled);
  form.steamid64.value = account.credentials?.steamid64 || account.credentials?.steam_id || account.steam_id || '';
  form.steam_username.value = account.credentials?.username || '';
}

async function loadSelectedData() {
  const id = encodeURIComponent(state.selected);
  const [offers, listings, inv, drafts] = await Promise.allSettled([
    api(`/api/accounts/${id}/offers`),
    api(`/api/accounts/${id}/listings`),
    api(`/api/accounts/${id}/inventory`),
    api(`/api/accounts/${id}/listing-drafts`),
  ]);
  state.offers = offers.value?.offers || [];
  state.listings = listings.value?.listings || [];
  state.inventory = inv.value?.inventory || [];
  state.drafts = drafts.value?.drafts || [];
  renderOffers(); renderListings(listings.value); renderInventory(inv.value); renderDrafts();
}

function renderOffers() {
  const box = $('offerList');
  $('offerCount').textContent = state.offers.length;
  if (!state.offers.length) { box.innerHTML = `<div class="empty">No pending trade offers. Manual review queue is clean.</div>`; return; }
  box.innerHTML = state.offers.map(o => `<article class="offer-card"><div><strong>Offer ${esc(o.id)}</strong><p>Partner ${esc(o.partner || 'unknown')}</p><p>${esc(o.evaluation?.decision || 'manual_review')} · profit ${Number(o.evaluation?.profit_ref || 0).toFixed(2)} ref</p></div><div><button class="btn btn-primary btn-small" data-offer="accept:${esc(o.id)}">Accept</button><button class="btn btn-ghost btn-small" data-offer="decline:${esc(o.id)}">Decline</button></div></article>`).join('');
}

function renderListings(payload = {}) {
  const box = $('listingList');
  const diag = $('backpackDiagnostic');
  const d = payload?.diagnostic || currentAccount()?.backpack;
  if (d) { diag.classList.remove('hidden'); diag.innerHTML = `<strong>Backpack status: ${esc(d.status || 'not_checked')}</strong><br>${esc(d.message || '')}`; }
  else diag.classList.add('hidden');
  if (!state.listings.length) { box.innerHTML = `<div class="empty">No active listings for this account. Generate drafts from inventory or check Backpack diagnostics.</div>`; return; }
  box.innerHTML = state.listings.map(l => `<article class="list-row"><strong>${esc(l.item_name)}</strong><span>${esc(l.intent)} · ${esc(JSON.stringify(l.currencies || {}))}</span></article>`).join('');
}

function renderInventory(payload = {}) {
  const box = $('inventoryGrid');
  const info = $('inventoryPricing');
  info.classList.remove('hidden');
  info.innerHTML = `<strong>Inventory source:</strong> ${esc(payload?.source || currentAccount()?.inventory_source || 'not synced')} · <strong>Pricing:</strong> ${esc(state.pricing.status || 'not loaded')}`;
  $('invCount').textContent = state.inventory.length;
  if (!state.inventory.length) { box.innerHTML = `<div class="empty">Inventory is empty or not loaded yet.</div>`; return; }
  box.innerHTML = state.inventory.map(i => `<article class="item-card"><div class="item-icon">${esc((i.name || '?').slice(0,2).toUpperCase())}</div><strong>${esc(i.name)}</strong><span>${esc(i.quality || 'Unique')}</span></article>`).join('');
}

function priceText(p) {
  if (!p) return 'needs price';
  return p.text || `${p.keys || 0} keys ${p.metal || 0} ref`;
}

function renderDrafts() {
  const box = $('draftList');
  $('draftCount').textContent = state.drafts.length;
  if (!state.drafts.length) { box.innerHTML = `<div class="empty">No listing drafts yet. Run Generate drafts after inventory sync.</div>`; return; }
  box.innerHTML = state.drafts.map(d => `<article class="list-row draft-row"><div><strong>${esc(d.name || d.market_hash_name)}</strong><span>${esc(d.status)} · ${esc(d.confidence)} · ${esc(priceText(d.suggested_price))}</span>${d.warnings?.length ? `<small>${esc(d.warnings.join(', '))}</small>` : ''}</div><div><button class="btn btn-primary btn-small" data-draft="publish:${esc(d.draft_id)}">Publish</button><button class="btn btn-ghost btn-small" data-draft="ignore:${esc(d.draft_id)}">Ignore</button></div></article>`).join('');
}

function renderEvents() {
  const box = $('eventList');
  box.innerHTML = state.events.slice(0, 120).map(e => `<div class="event"><time>${fmtTime(e.ts)}</time><span class="pill ${e.level || 'info'}">${esc(e.level || 'info')}</span><strong>${esc(e.event)}</strong><small>${esc(e.account_id || '')}</small></div>`).join('') || `<div class="empty">No events yet.</div>`;
}

async function loadEvents() {
  const data = await api('/api/events');
  state.events = data.events || [];
  renderEvents();
}

async function loadAll() {
  const status = await api('/api/status');
  renderStatus(status);
  await loadSelectedData();
  await loadEvents();
}

function selectedPath(path) { return `/api/accounts/${encodeURIComponent(state.selected)}${path}`; }

async function runAction(btn, busyText, fn) {
  try { await setBusy(btn, busyText, fn()); await loadAll(); }
  catch (err) { alert(err.message); }
}

function formBool(value) { return value === true || value === 'true'; }

function setupHandlers() {
  $('accountSelector').addEventListener('change', async e => { state.selected = e.target.value; await loadSelectedData(); renderStatus({ accounts: state.accounts, pricing: state.pricing, version: state.version }); });
  $('btnRefresh').addEventListener('click', e => runAction(e.currentTarget, 'Refreshing…', loadAll));
  $('btnConnect').addEventListener('click', e => runAction(e.currentTarget, 'Connecting…', () => api(selectedPath('/bot/login'), { method: 'POST' })));
  $('btnDisconnect').addEventListener('click', e => runAction(e.currentTarget, 'Disconnecting…', () => api(selectedPath('/bot/disconnect'), { method: 'POST' })));
  $('btnRunPipeline').addEventListener('click', e => runAction(e.currentTarget, 'Running…', () => api(selectedPath('/pipeline/run'), { method: 'POST' })));
  $('btnSyncOffers').addEventListener('click', e => runAction(e.currentTarget, 'Syncing…', () => api(selectedPath('/offers/sync'), { method: 'POST' })));
  $('btnSyncListings').addEventListener('click', e => runAction(e.currentTarget, 'Syncing…', () => api(selectedPath('/backpack/sync'), { method: 'POST' })));
  $('btnSyncInventory').addEventListener('click', e => runAction(e.currentTarget, 'Syncing…', () => api(selectedPath('/inventory/sync'), { method: 'POST' })));
  $('btnGenerateDrafts').addEventListener('click', e => runAction(e.currentTarget, 'Generating…', () => api(selectedPath('/listing-drafts/generate'), { method: 'POST' })));
  $('btnRefreshPrices').addEventListener('click', e => runAction(e.currentTarget, 'Refreshing…', () => api('/api/prices/schema/refresh', { method: 'POST' })));
  $('btnBackpackDiag').addEventListener('click', e => runAction(e.currentTarget, 'Checking…', async () => { const d = await api(selectedPath('/backpack/diagnostics')); $('backpackDiagnostic').classList.remove('hidden'); $('backpackDiagnostic').innerHTML = `<pre>${esc(JSON.stringify(d, null, 2))}</pre>`; }));
  $('btnNewAccount').addEventListener('click', () => { state.selected = `account-${Date.now()}`; $('accountForm').reset(); $('accountForm').account_id.value = state.selected; $('accountForm').enabled.value = 'false'; $('accountForm').dry_run.value = 'true'; location.hash = '#credentials'; });
  $('btnClearEvents').addEventListener('click', () => { state.events = []; renderEvents(); });

  $('accountCards').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.account;
    const action = btn.dataset.action;
    state.selected = id;
    if (action === 'select') { loadAll(); return; }
    if (action === 'connect') runAction(btn, 'Connecting…', () => api(`/api/accounts/${encodeURIComponent(id)}/bot/login`, { method: 'POST' }));
    if (action === 'disconnect') runAction(btn, 'Disconnecting…', () => api(`/api/accounts/${encodeURIComponent(id)}/bot/disconnect`, { method: 'POST' }));
    if (action === 'pipeline') runAction(btn, 'Running…', () => api(`/api/accounts/${encodeURIComponent(id)}/pipeline/run`, { method: 'POST' }));
  });

  $('offerList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-offer]');
    if (!btn) return;
    const [action, id] = btn.dataset.offer.split(':');
    runAction(btn, `${action}…`, () => api(selectedPath(`/offers/${encodeURIComponent(id)}/${action}`), { method: 'POST' }));
  });

  $('draftList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-draft]');
    if (!btn) return;
    const [action, id] = btn.dataset.draft.split(':');
    runAction(btn, `${action}…`, () => api(selectedPath(`/listing-drafts/${encodeURIComponent(id)}/${action}`), { method: 'POST', body: JSON.stringify({}) }));
  });

  $('accountForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = fd.get('account_id') || state.selected || 'main';
    const record = {
      account_id: id,
      label: fd.get('label'),
      role: fd.get('role'),
      enabled: formBool(fd.get('enabled')),
      dry_run: formBool(fd.get('dry_run')),
      autonomous_enabled: formBool(fd.get('autonomous_enabled')),
      autonomous_publish_enabled: formBool(fd.get('autonomous_publish_enabled')),
      autonomous_trade_accept_enabled: formBool(fd.get('autonomous_trade_accept_enabled')),
    };
    const credentials = {};
    ['steam_username','steam_password','shared_secret','identity_secret','steam_web_api_key','steamid64','backpack_access_token','backpack_api_key'].forEach(k => {
      const v = fd.get(k);
      if (v) credentials[k] = v;
    });
    await api('/api/accounts', { method: 'POST', body: JSON.stringify({ ...record, credentials }) });
    state.selected = String(id).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    $('saveStatus').textContent = 'Saved. Empty secret fields were ignored.';
    $('saveStatus').classList.remove('hidden');
    await loadAll();
  });
}

function connectSSE() {
  try {
    const es = new EventSource(apiUrl('/api/events/stream'));
    es.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'log') { state.events.unshift(msg.entry); state.events = state.events.slice(0, 200); renderEvents(); }
      if (msg.type === 'status' || msg.type === 'offer') loadAll().catch(() => {});
    };
  } catch { /* polling fallback */ }
}

setupHandlers();
loadAll().catch(err => { console.error(err); $('statusBadge').textContent = err.message; $('statusBadge').className = 'status-badge error'; });
connectSSE();
setInterval(() => loadAll().catch(() => {}), 15000);
