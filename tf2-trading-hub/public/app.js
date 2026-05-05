'use strict';

// ─── API ──────────────────────────────────────────────────────────────────────

function ingressBasePath() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const i = parts.indexOf('hassio_ingress');
  if (i >= 0 && parts[i + 1]) {
    return '/' + parts.slice(0, i + 2).join('/');
  }
  return '';
}

const API_BASE = ingressBasePath();

function apiUrl(path) {
  const clean = String(path || '').startsWith('/') ? String(path) : `/${path}`;
  return `${API_BASE}${clean}`;
}

async function api(path, opts = {}) {
  const r = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
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
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function show(el, visible = true) {
  if (typeof el === 'string') el = qs(el);
  el?.classList.toggle('hidden', !visible);
}

function setText(id, text) {
  const el = qs(`#${id}`);
  if (el) el.textContent = text;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CLASS = {
  online:      'online',
  connecting:  'connecting',
  offline:     'offline',
  error:       'error',
  needs_2fa:   'warn',
};

function renderStatus(data) {
  const badge = qs('#statusBadge');
  if (badge) {
    badge.textContent = data.status;
    badge.className   = 'status-badge ' + (STATUS_CLASS[data.status] || 'offline');
  }

  const c = data.credentials || {};
  setText('statSteam',     data.username || data.steam_id || (c.has_username ? c.username : '—'));
  setText('statOffers',    data.offer_queue ?? '—');
  setText('statListings',  data.listing_count ?? '—');
  setText('statInventory', data.inventory_count ?? '—');

  const errEl = qs('#loginError');
  if (errEl) {
    if (data.login_error) {
      errEl.textContent = data.login_error;
      errEl.classList.remove('hidden');
    } else {
      errEl.classList.add('hidden');
    }
  }

  const guard = data.steam_guard || {};
  show('#steamGuardCard', data.status === 'needs_2fa' || guard.required);
  const guardStatus = qs('#steamGuardStatus');
  if (guardStatus) {
    if (guard.last_code_wrong) {
      guardStatus.textContent = 'Code was rejected. Wait for a fresh code in your phone app and try again.';
      guardStatus.classList.remove('hidden');
    } else {
      guardStatus.classList.add('hidden');
    }
  }

  // Show setup banner if credentials missing
  const needsSetup = !c.has_username || !c.has_password;
  show('#setupBanner', needsSetup);
}

// ─── Trade offers ─────────────────────────────────────────────────────────────

function renderOffer(offer) {
  const gave    = offer.items_to_give?.length    || 0;
  const receive = offer.items_to_receive?.length || 0;
  const giftTag = offer.is_gift ? '<span class="pill gift">Gift</span>' : '';

  const giveHtml    = (offer.items_to_give || []).map(i => `<span class="item">${esc(i.name)}</span>`).join('');
  const receiveHtml = (offer.items_to_receive || []).map(i => `<span class="item">${esc(i.name)}</span>`).join('');

  return `
    <div class="offer" id="offer-${esc(offer.id)}">
      <div class="offer-head">
        <strong>Offer #${esc(offer.id)}</strong>
        <span class="partner">from ${esc(offer.partner)}</span>
        ${giftTag}
        <span class="pill">▲ ${gave} give</span>
        <span class="pill">▼ ${receive} receive</span>
      </div>
      ${offer.message ? `<p class="offer-msg">${esc(offer.message)}</p>` : ''}
      <div class="offer-items">
        ${giveHtml ? `<div class="item-group"><label>You give</label>${giveHtml}</div>` : ''}
        ${receiveHtml ? `<div class="item-group"><label>You receive</label>${receiveHtml}</div>` : ''}
      </div>
      <div class="btn-row">
        <button class="primary" onclick="acceptOffer('${esc(offer.id)}')">Accept</button>
        <button class="danger"  onclick="declineOffer('${esc(offer.id)}')">Decline</button>
      </div>
    </div>`;
}

function renderOffers(offers) {
  const el = qs('#offerList');
  const countEl = qs('#offerCount');
  if (!el) return;
  if (!offers || offers.length === 0) {
    el.innerHTML = '<p class="empty">No pending offers.</p>';
  } else {
    el.innerHTML = offers.map(renderOffer).join('');
  }
  if (countEl) countEl.textContent = offers?.length || 0;
}

async function acceptOffer(id) {
  const btn = qs(`#offer-${id} .primary`);
  if (btn) { btn.disabled = true; btn.textContent = 'Accepting…'; }
  try {
    await api(`/api/offers/${id}/accept`, { method: 'POST' });
    addLog('info', `Offer ${id} accepted`);
    qs(`#offer-${id}`)?.remove();
    const remaining = qs('#offerList')?.children.length || 0;
    if (remaining === 0) qs('#offerList').innerHTML = '<p class="empty">No pending offers.</p>';
  } catch (err) {
    addLog('error', `Accept failed: ${err.message}`);
    if (btn) { btn.disabled = false; btn.textContent = 'Accept'; }
  }
}

async function declineOffer(id) {
  const btn = qs(`#offer-${id} .danger`);
  if (btn) { btn.disabled = true; btn.textContent = 'Declining…'; }
  try {
    await api(`/api/offers/${id}/decline`, { method: 'POST' });
    addLog('info', `Offer ${id} declined`);
    qs(`#offer-${id}`)?.remove();
    const remaining = qs('#offerList')?.children.length || 0;
    if (remaining === 0) qs('#offerList').innerHTML = '<p class="empty">No pending offers.</p>';
  } catch (err) {
    addLog('error', `Decline failed: ${err.message}`);
    if (btn) { btn.disabled = false; btn.textContent = 'Decline'; }
  }
}

// ─── Listings ─────────────────────────────────────────────────────────────────

function renderListings(listings) {
  const el = qs('#listingList');
  if (!el) return;
  if (!listings || listings.length === 0) {
    el.innerHTML = '<p class="empty">No active listings.</p>';
    return;
  }
  el.innerHTML = listings.map(l => {
    const price = l.currencies
      ? Object.entries(l.currencies).map(([k, v]) => `${v} ${k}`).join(' + ')
      : '?';
    const intentClass = l.intent === 'buy' ? 'pill-buy' : 'pill-sell';
    return `
      <div class="listing-row">
        <span class="pill ${intentClass}">${esc(l.intent)}</span>
        <span class="listing-name">${esc(l.item_name)}</span>
        <span class="listing-price">${esc(price)}</span>
        <button class="small danger" onclick="archiveListing('${esc(l.id)}')">Remove</button>
      </div>`;
  }).join('');
}

async function archiveListing(id) {
  try {
    await api(`/api/listings/${id}`, { method: 'DELETE' });
    addLog('info', `Listing ${id} removed`);
    loadListings();
  } catch (err) {
    addLog('error', `Remove listing failed: ${err.message}`);
  }
}

async function loadListings() {
  try {
    const data = await api('/api/listings/sync', { method: 'POST' });
    renderListings(data.listings);
  } catch (err) {
    addLog('warn', `Listings sync failed: ${err.message}`);
  }
}

// ─── Inventory ────────────────────────────────────────────────────────────────

function renderInventory(items) {
  const el    = qs('#inventoryGrid');
  const count = qs('#invCount');
  if (!el) return;
  if (count) count.textContent = items?.length || 0;
  if (!items || items.length === 0) {
    el.innerHTML = '<p class="empty">Inventory empty or not loaded.</p>';
    return;
  }
  el.innerHTML = items.slice(0, 200).map(i =>
    `<div class="inv-item" title="${esc(i.name)}">${esc(i.name)}</div>`
  ).join('');
  if (items.length > 200) {
    el.innerHTML += `<p class="empty">…and ${items.length - 200} more</p>`;
  }
}

async function loadInventory() {
  try {
    const data = await api('/api/inventory/sync', { method: 'POST' });
    renderInventory(data.inventory);
    setText('invCount', data.count ?? 0);
    setText('statInventory', data.count ?? '—');
  } catch (err) {
    addLog('warn', `Inventory sync failed: ${err.message}`);
  }
}

// ─── Event log ────────────────────────────────────────────────────────────────

let logLines = [];

function addLog(level, message, data = {}) {
  const ts    = new Date().toLocaleTimeString();
  const entry = { ts, level, message, ...data };
  logLines.unshift(entry);
  if (logLines.length > 300) logLines = logLines.slice(0, 300);
  renderLog();
}

function renderLog() {
  const el = qs('#eventLog');
  if (!el) return;
  el.innerHTML = logLines.slice(0, 100).map(e =>
    `<div class="log-line ${esc(e.level)}"><span class="log-ts">${esc(e.ts)}</span> <span class="log-msg">${esc(e.message || e.event || '')}</span></div>`
  ).join('');
}

async function loadEvents() {
  try {
    const data = await api('/api/events');
    logLines = (data.events || []).map(e => ({
      ts:      new Date(e.ts).toLocaleTimeString(),
      level:   e.level || 'info',
      message: e.event || '',
    }));
    renderLog();
  } catch { /* non-fatal */ }
}

// ─── SSE live feed ────────────────────────────────────────────────────────────

function connectSSE() {
  const es = new EventSource(apiUrl('/api/events/stream'));
  es.onmessage = e => {
    let msg;
    try { msg = JSON.parse(e.data); } catch { return; }
    if (msg.type === 'status') {
      loadStatus();
    } else if (msg.type === 'offer' && msg.offer) {
      const existing = qs(`#offer-${msg.offer.id}`);
      if (!existing) {
        const el = qs('#offerList');
        const empty = el?.querySelector('.empty');
        empty?.remove();
        const div = document.createElement('div');
        div.innerHTML = renderOffer(msg.offer);
        el?.prepend(div.firstElementChild);
        const countEl = qs('#offerCount');
        if (countEl) countEl.textContent = Number(countEl.textContent || 0) + 1;
      }
    } else if (msg.type === 'log' && msg.entry) {
      addLog(msg.entry.level, msg.entry.event || '', {});
    }
  };
  es.onerror = () => {
    // EventSource auto-reconnects; just suppress noise
  };
}

// ─── Main poll ────────────────────────────────────────────────────────────────

let lastStatus = null;

async function loadStatus() {
  try {
    const data = await api('/api/status');
    renderStatus(data);
    // Only re-render offers/listings if counts changed
    if (!lastStatus || lastStatus.offer_queue !== data.offer_queue) {
      const offers = await api('/api/offers');
      renderOffers(offers.offers);
    }
    lastStatus = data;
  } catch (err) {
    qs('#statusBadge').textContent = 'error';
    qs('#statusBadge').className   = 'status-badge error';
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Credentials form
  const form = qs('#credsForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd    = new FormData(form);
    const patch = Object.fromEntries(fd.entries());
    const btn   = form.querySelector('[type=submit]');
    const status = qs('#credsSaveStatus');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      await api('/api/credentials', { method: 'POST', body: JSON.stringify(patch) });
      if (status) { status.textContent = 'Saved.'; status.classList.remove('hidden'); }
      addLog('info', 'Credentials saved');
      form.reset();
      loadStatus();
    } catch (err) {
      if (status) { status.textContent = 'Error: ' + err.message; status.classList.remove('hidden'); }
      addLog('error', 'Credentials save failed: ' + err.message);
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Save credentials';
    }
  });

  const guardForm = qs('#steamGuardForm');
  guardForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const input = guardForm.querySelector('[name=code]');
    const btn = guardForm.querySelector('[type=submit]');
    const status = qs('#steamGuardStatus');
    const code = String(input?.value || '').trim().toUpperCase();
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    try {
      await api('/api/steamguard/code', { method: 'POST', body: JSON.stringify({ code }) });
      if (status) { status.textContent = 'Code submitted. Connecting…'; status.classList.remove('hidden'); }
      input.value = '';
      addLog('info', 'Steam Guard code submitted');
      loadStatus();
    } catch (err) {
      if (status) { status.textContent = 'Error: ' + err.message; status.classList.remove('hidden'); }
      addLog('error', 'Steam Guard code failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit code';
    }
  });

  qs('#btnCancelSteamGuard')?.addEventListener('click', async () => {
    await api('/api/steamguard/cancel', { method: 'POST' }).catch(() => {});
    loadStatus();
  });

  // Buttons
  qs('#btnLogin')?.addEventListener('click', async () => {
    await api('/api/bot/login', { method: 'POST' }).catch(() => {});
    loadStatus();
  });
  qs('#btnDisconnect')?.addEventListener('click', async () => {
    await api('/api/bot/disconnect', { method: 'POST' }).catch(() => {});
    loadStatus();
  });
  qs('#btnSyncOffers')?.addEventListener('click', async () => {
    const data = await api('/api/offers/sync', { method: 'POST' }).catch(() => ({ offers: [] }));
    renderOffers(data.offers);
  });
  qs('#btnSyncListings')?.addEventListener('click', () => loadListings());
  qs('#btnSyncInventory')?.addEventListener('click', () => loadInventory());
  qs('#btnClearLog')?.addEventListener('click', () => { logLines = []; renderLog(); });

  // Initial load
  loadStatus();
  loadEvents();

  // Live feed
  connectSSE();

  // Poll every 10 s as fallback
  setInterval(loadStatus, 10000);
});
