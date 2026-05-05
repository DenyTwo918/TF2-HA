'use strict';

// ─── API ──────────────────────────────────────────────────────────────────────

async function api(path, opts = {}) {
  const r = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await r.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { error: text }; }
  if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`);
  return body;
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

const qs  = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));
const cssEsc = s => (window.CSS && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'));

function show(el, visible = true) {
  if (typeof el === 'string') el = qs(el);
  el?.classList.toggle('hidden', !visible);
}

function setText(id, text) {
  const el = qs(`#${id}`);
  if (el) el.textContent = text;
}

function fmtTime(value) {
  if (!value) return 'Not synced';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'Not synced' : `Synced ${d.toLocaleTimeString()}`;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (busy) button.dataset.originalText = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? label : (button.dataset.originalText || button.textContent);
}

// ─── Status ──────────────────────────────────────────────────────────────────

const STATUS_CLASS = {
  online: 'online',
  connecting: 'connecting',
  offline: 'offline',
  error: 'error',
  needs_2fa: 'warn',
};

let lastStatus = null;
let logLines = [];

function renderStatus(data) {
  const badge = qs('#statusBadge');
  const cls = STATUS_CLASS[data.status] || 'offline';
  if (badge) {
    badge.textContent = data.status || 'offline';
    badge.className = `status-badge ${cls}`;
  }

  const statusPill = qs('#statusPill');
  if (statusPill) {
    statusPill.textContent = data.status || 'offline';
    statusPill.className = `pill ${cls}`;
  }

  const version = data.version || '5.13.60';
  setText('sideVersion', version);

  const c = data.credentials || {};
  const steamLabel = data.display_name || data.username || data.steam_id || c.username || 'Not connected';
  setText('statSteam', steamLabel);
  setText('statSteamSub', c.has_username ? 'Credentials saved' : 'Credentials missing');
  setText('statOffers', data.offer_queue ?? 0);
  setText('statListings', data.listing_count ?? 0);
  setText('statInventory', data.inventory_count ?? 0);
  setText('statListingSync', fmtTime(data.last_listing_sync));
  setText('statInventorySync', fmtTime(data.last_inv_sync));

  const hasOffers = Number(data.offer_queue || 0) > 0;
  const hasListings = Number(data.listing_count || 0) > 0;
  const hasInventory = Number(data.inventory_count || 0) > 0;
  const online = data.status === 'online';
  setHealthBar('barSteam', online ? 100 : data.status === 'connecting' ? 45 : 14);
  setHealthBar('barOffers', hasOffers ? 88 : online ? 50 : 20);
  setHealthBar('barBackpack', hasListings ? 90 : c.has_bptf_token ? 42 : 16);
  setHealthBar('barInventory', hasInventory ? 92 : c.steam_id || data.steam_id ? 38 : 14);

  const errEl = qs('#loginError');
  if (errEl) {
    if (data.login_error) {
      errEl.textContent = data.login_error;
      errEl.classList.remove('hidden');
    } else {
      errEl.classList.add('hidden');
    }
  }

  const needsSetup = !c.has_username || !c.has_password;
  show('#setupBanner', needsSetup);
}

function setHealthBar(id, value) {
  const el = qs(`#${id}`);
  if (el) el.style.setProperty('--value', `${Math.max(0, Math.min(100, value))}%`);
}

// ─── Offers ──────────────────────────────────────────────────────────────────

function itemChip(item, direction) {
  const name = item?.name || 'Unknown item';
  return `<span class="item-chip ${direction}" title="${esc(name)}">${esc(name)}</span>`;
}

function renderOffer(offer) {
  const give = offer.items_to_give || [];
  const receive = offer.items_to_receive || [];
  const giftTag = offer.is_gift ? '<span class="pill safe">Gift</span>' : '';
  const risk = give.length > receive.length ? 'Needs review' : receive.length > 0 ? 'Inbound value' : 'Empty offer';

  return `
    <article class="offer-card" data-offer-id="${esc(offer.id)}">
      <div class="offer-topline">
        <div>
          <strong>Offer #${esc(offer.id)}</strong>
          <p>Partner ${esc(offer.partner || 'unknown')}</p>
        </div>
        <div class="offer-tags">
          ${giftTag}
          <span class="pill">${esc(risk)}</span>
          <span class="pill">${receive.length} in</span>
          <span class="pill">${give.length} out</span>
        </div>
      </div>
      ${offer.message ? `<blockquote>${esc(offer.message)}</blockquote>` : ''}
      <div class="offer-columns">
        <div class="offer-column give">
          <span>You give</span>
          <div>${give.length ? give.map(i => itemChip(i, 'out')).join('') : '<em>Nothing</em>'}</div>
        </div>
        <div class="offer-column receive">
          <span>You receive</span>
          <div>${receive.length ? receive.map(i => itemChip(i, 'in')).join('') : '<em>Nothing</em>'}</div>
        </div>
      </div>
      <div class="offer-actions">
        <button class="btn btn-primary" data-action="accept-offer" data-id="${esc(offer.id)}">Accept</button>
        <button class="btn btn-danger" data-action="decline-offer" data-id="${esc(offer.id)}">Decline</button>
      </div>
    </article>`;
}

function renderOffers(offers = []) {
  const el = qs('#offerList');
  if (!el) return;
  setText('offerCount', offers.length || 0);
  el.innerHTML = offers.length
    ? offers.map(renderOffer).join('')
    : '<div class="empty-state">No pending trade offers. The cockpit will light up when a new offer arrives.</div>';
}

async function loadOffers() {
  const data = await api('/api/offers');
  renderOffers(data.offers || []);
  return data.offers || [];
}

async function syncOffers(button) {
  setBusy(button, true, 'Scanning…');
  try {
    const data = await api('/api/offers/sync', { method: 'POST' });
    renderOffers(data.offers || []);
    addLog('info', `Offer sync complete: ${(data.offers || []).length} pending`);
  } catch (err) {
    addLog('error', `Offer sync failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

async function acceptOffer(id, button) {
  setBusy(button, true, 'Accepting…');
  try {
    await api(`/api/offers/${encodeURIComponent(id)}/accept`, { method: 'POST' });
    qs(`[data-offer-id="${cssEsc(id)}"]`)?.remove();
    addLog('info', `Offer ${id} accepted`);
    await refreshCockpit(false);
  } catch (err) {
    addLog('error', `Accept failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

async function declineOffer(id, button) {
  setBusy(button, true, 'Declining…');
  try {
    await api(`/api/offers/${encodeURIComponent(id)}/decline`, { method: 'POST' });
    qs(`[data-offer-id="${cssEsc(id)}"]`)?.remove();
    addLog('info', `Offer ${id} declined`);
    await refreshCockpit(false);
  } catch (err) {
    addLog('error', `Decline failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

// ─── Listings ────────────────────────────────────────────────────────────────

function listingPrice(currencies) {
  if (!currencies) return '?';
  return Object.entries(currencies)
    .map(([k, v]) => `${v} ${k}`)
    .join(' + ') || '?';
}

function renderListings(listings = []) {
  const el = qs('#listingList');
  if (!el) return;
  el.innerHTML = listings.length
    ? listings.map(l => `
      <article class="listing-card">
        <span class="intent ${l.intent === 'buy' ? 'buy' : 'sell'}">${esc(l.intent || 'listing')}</span>
        <strong>${esc(l.item_name || 'Unknown item')}</strong>
        <span class="listing-price">${esc(listingPrice(l.currencies))}</span>
        <button class="btn btn-danger btn-small" data-action="delete-listing" data-id="${esc(l.id)}">Remove</button>
      </article>`).join('')
    : '<div class="empty-state">No listings loaded yet. Sync Backpack.tf listings to populate this panel.</div>';
}

async function loadListings() {
  const data = await api('/api/listings');
  renderListings(data.listings || []);
  return data.listings || [];
}

async function syncListings(button) {
  setBusy(button, true, 'Syncing…');
  try {
    const data = await api('/api/listings/sync', { method: 'POST' });
    renderListings(data.listings || []);
    setText('statListings', (data.listings || []).length);
    setText('statListingSync', fmtTime(data.last_sync));
    addLog('info', `Listings synced: ${(data.listings || []).length}`);
  } catch (err) {
    addLog('error', `Listings sync failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

async function deleteListing(id, button) {
  setBusy(button, true, 'Removing…');
  try {
    await api(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    addLog('info', `Listing ${id} removed`);
    await syncListings(null);
  } catch (err) {
    addLog('error', `Remove listing failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

// ─── Inventory ───────────────────────────────────────────────────────────────

function renderInventory(items = []) {
  const el = qs('#inventoryGrid');
  if (!el) return;
  setText('invCount', items.length || 0);
  el.innerHTML = items.length
    ? items.slice(0, 240).map(item => {
      const name = item.name || 'Unknown';
      const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase() || 'TF';
      return `<article class="inventory-card" title="${esc(name)}">
        <div class="item-icon">${esc(initials)}</div>
        <strong>${esc(name)}</strong>
        <span>${esc(item.quality || 'Tradable')}</span>
      </article>`;
    }).join('') + (items.length > 240 ? `<div class="empty-state">…and ${items.length - 240} more items</div>` : '')
    : '<div class="empty-state">Inventory is empty or not loaded yet.</div>';
}

async function loadInventory() {
  const data = await api('/api/inventory');
  renderInventory(data.inventory || []);
  setText('statInventory', data.count ?? (data.inventory || []).length);
  setText('statInventorySync', fmtTime(data.last_sync));
}

async function syncInventory(button) {
  setBusy(button, true, 'Syncing…');
  try {
    const data = await api('/api/inventory/sync', { method: 'POST' });
    renderInventory(data.inventory || []);
    setText('statInventory', data.count ?? (data.inventory || []).length);
    setText('statInventorySync', fmtTime(data.last_sync));
    addLog('info', `Inventory synced: ${data.count ?? 0} tradable items`);
  } catch (err) {
    addLog('error', `Inventory sync failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

async function refreshPrices(button) {
  setBusy(button, true, 'Refreshing…');
  try {
    const data = await api('/api/prices/schema');
    addLog('info', `Price schema loaded: ${data.item_count || 0} items`);
  } catch (err) {
    addLog('error', `Price refresh failed: ${err.message}`);
  } finally {
    setBusy(button, false);
  }
}

// ─── Events ──────────────────────────────────────────────────────────────────

function addLog(level, message) {
  const entry = { ts: new Date().toLocaleTimeString(), level: level || 'info', message };
  logLines.unshift(entry);
  if (logLines.length > 300) logLines = logLines.slice(0, 300);
  renderLog();
}

function renderLog() {
  const el = qs('#eventLog');
  if (!el) return;
  el.innerHTML = logLines.length
    ? logLines.slice(0, 120).map(e => `<div class="log-line ${esc(e.level)}"><span>${esc(e.ts)}</span><strong>${esc(e.level)}</strong><p>${esc(e.message || e.event || '')}</p></div>`).join('')
    : '<div class="empty-state">No events loaded yet.</div>';
}

async function loadEvents() {
  try {
    const data = await api('/api/events');
    logLines = (data.events || []).map(e => ({
      ts: new Date(e.ts).toLocaleTimeString(),
      level: e.level || 'info',
      message: e.event || '',
    }));
    renderLog();
  } catch {
    renderLog();
  }
}

function connectSSE() {
  try {
    const es = new EventSource('/api/events/stream');
    es.onmessage = e => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === 'status') loadStatus();
      if (msg.type === 'offer' && msg.offer) {
        addLog('info', `New offer ${msg.offer.id}`);
        loadOffers();
      }
      if (msg.type === 'log' && msg.entry) {
        addLog(msg.entry.level, msg.entry.event || 'runtime event');
      }
    };
  } catch {
    // Polling still works if SSE is unavailable through a proxy.
  }
}

// ─── Main loading ────────────────────────────────────────────────────────────

async function loadStatus() {
  try {
    const data = await api('/api/status');
    renderStatus(data);
    if (!lastStatus || lastStatus.offer_queue !== data.offer_queue) await loadOffers();
    lastStatus = data;
  } catch (err) {
    const badge = qs('#statusBadge');
    if (badge) {
      badge.textContent = 'error';
      badge.className = 'status-badge error';
    }
  }
}

async function refreshCockpit(syncExternal = false) {
  await loadStatus();
  await Promise.allSettled([loadOffers(), loadListings(), loadInventory(), loadEvents()]);
  if (syncExternal) addLog('info', 'Cockpit refreshed');
}

// ─── UI wiring ───────────────────────────────────────────────────────────────

document.addEventListener('click', async e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === 'accept-offer') return acceptOffer(id, btn);
  if (btn.dataset.action === 'decline-offer') return declineOffer(id, btn);
  if (btn.dataset.action === 'delete-listing') return deleteListing(id, btn);
});

document.addEventListener('DOMContentLoaded', () => {
  const form = qs('#credsForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const patch = Object.fromEntries(fd.entries());
    const btn = form.querySelector('[type=submit]');
    const status = qs('#credsSaveStatus');
    setBusy(btn, true, 'Saving…');
    try {
      await api('/api/credentials', { method: 'POST', body: JSON.stringify(patch) });
      if (status) {
        status.textContent = 'Saved. Empty fields were ignored.';
        status.className = 'save-status success';
      }
      addLog('info', 'Credentials saved');
      form.reset();
      await loadStatus();
    } catch (err) {
      if (status) {
        status.textContent = `Error: ${err.message}`;
        status.className = 'save-status error';
      }
      addLog('error', `Credentials save failed: ${err.message}`);
    } finally {
      setBusy(btn, false);
    }
  });

  qs('#btnLogin')?.addEventListener('click', async e => {
    setBusy(e.currentTarget, true, 'Connecting…');
    try { await api('/api/bot/login', { method: 'POST' }); addLog('info', 'Bot login requested'); }
    catch (err) { addLog('error', `Login failed: ${err.message}`); }
    finally { setBusy(e.currentTarget, false); loadStatus(); }
  });

  qs('#btnDisconnect')?.addEventListener('click', async e => {
    setBusy(e.currentTarget, true, 'Disconnecting…');
    try { await api('/api/bot/disconnect', { method: 'POST' }); addLog('info', 'Bot disconnected'); }
    catch (err) { addLog('error', `Disconnect failed: ${err.message}`); }
    finally { setBusy(e.currentTarget, false); loadStatus(); }
  });

  const bind = (id, fn) => qs(id)?.addEventListener('click', e => fn(e.currentTarget));
  bind('#btnSyncOffers', syncOffers);
  bind('#btnSyncOffersTop', syncOffers);
  bind('#btnSyncListings', syncListings);
  bind('#btnSyncListingsTop', syncListings);
  bind('#btnSyncInventory', syncInventory);
  bind('#btnSyncInventoryTop', syncInventory);
  bind('#btnLoadPrices', refreshPrices);
  qs('#btnRefreshAll')?.addEventListener('click', e => {
    setBusy(e.currentTarget, true, 'Refreshing…');
    refreshCockpit(true).finally(() => setBusy(e.currentTarget, false));
  });
  qs('#btnClearLog')?.addEventListener('click', () => { logLines = []; renderLog(); });

  // Sidebar highlight for in-page navigation.
  qsa('.nav-link').forEach(a => a.addEventListener('click', () => {
    qsa('.nav-link').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  }));

  refreshCockpit(false);
  connectSSE();
  setInterval(loadStatus, 10000);
});
