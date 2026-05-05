'use strict';

// ─── API helper ───────────────────────────────────────────────────────────────

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
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const cssEsc = s => (window.CSS?.escape ? CSS.escape(String(s)) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'));

function show(el, visible = true) {
  if (typeof el === 'string') el = qs(el);
  el?.classList.toggle('hidden', !visible);
}
function setText(id, text) { const el = qs(`#${id}`); if (el) el.textContent = text; }
function fmtTime(v) {
  if (!v) return 'Not synced';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 'Not synced' : `Synced ${d.toLocaleTimeString()}`;
}
function setBusy(btn, busy, label) {
  if (!btn) return;
  if (busy) btn.dataset.originalText = btn.textContent;
  btn.disabled = busy;
  btn.textContent = busy ? label : (btn.dataset.originalText || btn.textContent);
}
function setHealthBar(id, value) {
  const el = qs(`#${id}`);
  if (el) el.style.setProperty('--value', `${Math.max(0, Math.min(100, value))}%`);
}

// ─── Active account ───────────────────────────────────────────────────────────

let activeAccountId = 'main';

function getActiveAccountId() { return activeAccountId; }

// ─── Status rendering ─────────────────────────────────────────────────────────

const STATUS_CLASS = { online: 'online', connecting: 'connecting', offline: 'offline', error: 'error', needs_2fa: 'warn', steamguard_required: 'warn' };

let lastStatus = null;
let logLines   = [];

function renderStatus(data) {
  const badge = qs('#statusBadge');
  const cls   = STATUS_CLASS[data.status] || 'offline';
  if (badge) { badge.textContent = data.status || 'offline'; badge.className = `status-badge ${cls}`; }

  const statusPill = qs('#statusPill');
  if (statusPill) { statusPill.textContent = data.status || 'offline'; statusPill.className = `pill ${cls}`; }

  setText('sideVersion', data.version || '5.13.67');

  const connectBtn    = qs('#btnLogin');
  const disconnectBtn = qs('#btnDisconnect');
  const onlineish     = ['online','connecting','needs_2fa','steamguard_required'].includes(data.status);
  if (connectBtn)    connectBtn.disabled    = onlineish;
  if (disconnectBtn) disconnectBtn.disabled = !onlineish && data.desired_online === false;

  const c = data.credentials || {};
  setText('statSteam',        data.display_name || c.username || data.steam_id || 'Not connected');
  setText('statSteamSub',     c.has_username ? 'Credentials saved' : 'Credentials missing');
  setText('statOffers',       data.offer_queue ?? 0);
  setText('statListings',     data.listing_count ?? 0);
  setText('statInventory',    data.inventory_count ?? 0);
  setText('statPriceItems',   data.price_item_count ?? 0);
  setText('statPriceStatus',  data.price_schema_status || 'unknown');

  const bp = data.backpack?.status ? ` · ${data.backpack.status}` : '';
  setText('statListingSync',    `${fmtTime(data.last_listing_sync)}${bp}`);
  if (data.inventory_error) {
    const retry = data.inventory_retry_after ? ` · retry ${fmtTime(data.inventory_retry_after).replace('Synced ','')}` : '';
    setText('statInventorySync', `Error: ${data.inventory_error}${retry}`);
  } else {
    setText('statInventorySync', data.inventory_source ? `${fmtTime(data.last_inv_sync)} · ${data.inventory_source}` : fmtTime(data.last_inv_sync));
  }

  const online = data.status === 'online';
  setHealthBar('barSteam',        online ? 100 : data.status === 'connecting' ? 45 : 14);
  setHealthBar('barOffers',       data.offer_manager_ready ? 92 : online ? 50 : 20);
  setHealthBar('barBackpack',     c.has_bptf_token ? (data.listing_count ? 90 : 55) : 16);
  setHealthBar('barPriceSchema',  data.price_schema_status === 'ok' ? 95 : c.has_bptf_api_key ? 50 : 14);
  setHealthBar('barInventory',    data.inventory_error ? 18 : data.inventory_count ? 92 : 38);

  const errEl = qs('#loginError');
  if (errEl) {
    if (data.login_error) { errEl.textContent = data.login_error; errEl.classList.remove('hidden'); }
    else errEl.classList.add('hidden');
  }

  show('#setupBanner',  !c.has_username || !c.has_password);
  show('#dryRunBanner', false); // shown separately after settings load

  // Credential status panel
  renderCredentialStatus(c, data);
}

function renderCredentialStatus(c, data) {
  const el = qs('#credentialStatus');
  if (!el) return;
  const items = [
    { label: 'Steam username',           ok: c.has_username },
    { label: 'Steam password',           ok: c.has_password },
    { label: 'Shared secret (2FA)',      ok: c.has_shared_secret },
    { label: 'Identity secret (confirm)',ok: c.has_identity_secret },
    { label: 'Steam Web API key',        ok: c.has_steam_api_key },
    { label: 'Steam ID64',               ok: !!(c.steam_id || data?.steam_id) },
    { label: 'Backpack.tf access token', ok: c.has_bptf_token,    warn: !c.has_bptf_token,  warnMsg: 'Required for listing sync and publishing' },
    { label: 'Backpack.tf API key',      ok: c.has_bptf_api_key,  warn: !c.has_bptf_api_key, warnMsg: 'Required for price schema — different from access token' },
  ];
  el.innerHTML = items.map(i => `
    <div class="cred-status-item ${i.ok ? 'ok' : i.warn ? 'warn' : 'missing'}">
      <span class="cred-dot">${i.ok ? '●' : '○'}</span>
      <span>${esc(i.label)}</span>
      ${!i.ok && i.warnMsg ? `<small>${esc(i.warnMsg)}</small>` : ''}
    </div>`).join('');
}

// ─── Offers ───────────────────────────────────────────────────────────────────

function evalTags(evaluation) {
  if (!evaluation?.tags?.length) return '';
  return evaluation.tags.map(t => {
    const cls = { safe:'safe', profit:'safe', manual_review:'warn', unpriced:'warn', loss:'error', no_pricing:'error', risky:'error', gift:'', empty:'error' }[t] || '';
    return `<span class="pill ${cls}">${esc(t.replace(/_/g,' '))}</span>`;
  }).join('');
}

function renderOffer(offer) {
  const give    = offer.items_to_give    || [];
  const receive = offer.items_to_receive || [];
  const giftTag = offer.is_gift ? '<span class="pill safe">Gift</span>' : '';
  const evTags  = evalTags(offer.evaluation);
  const profit  = offer.evaluation?.profit !== undefined ? ` · profit ${offer.evaluation.profit.toFixed(2)} ref` : '';

  return `
    <article class="offer-card" data-offer-id="${esc(offer.id)}">
      <div class="offer-topline">
        <div>
          <strong>Offer #${esc(offer.id)}</strong>
          <p>Partner ${esc(offer.partner || 'unknown')}${profit}</p>
        </div>
        <div class="offer-tags">${giftTag}${evTags}
          <span class="pill">${receive.length} in</span>
          <span class="pill">${give.length} out</span>
        </div>
      </div>
      ${offer.message ? `<blockquote>${esc(offer.message)}</blockquote>` : ''}
      <div class="offer-columns">
        <div class="offer-column give"><span>You give</span>
          <div>${give.length ? give.map(i => `<span class="item-chip out" title="${esc(i.name)}">${esc(i.name)}</span>`).join('') : '<em>Nothing</em>'}</div>
        </div>
        <div class="offer-column receive"><span>You receive</span>
          <div>${receive.length ? receive.map(i => `<span class="item-chip in" title="${esc(i.name)}">${esc(i.name)}</span>`).join('') : '<em>Nothing</em>'}</div>
        </div>
      </div>
      <div class="offer-actions">
        <button class="btn btn-primary" data-action="accept-offer" data-id="${esc(offer.id)}">Accept</button>
        <button class="btn btn-danger"  data-action="decline-offer" data-id="${esc(offer.id)}">Decline</button>
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
    addLog('info', `Offer sync: ${(data.offers||[]).length} pending`);
  } catch (err) { addLog('error', `Offer sync failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function acceptOffer(id, button) {
  setBusy(button, true, 'Accepting…');
  try {
    await api(`/api/offers/${encodeURIComponent(id)}/accept`, { method: 'POST' });
    qs(`[data-offer-id="${cssEsc(id)}"]`)?.remove();
    addLog('info', `Offer ${id} accepted`);
    refreshCockpit(false);
  } catch (err) { addLog('error', `Accept failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function declineOffer(id, button) {
  setBusy(button, true, 'Declining…');
  try {
    await api(`/api/offers/${encodeURIComponent(id)}/decline`, { method: 'POST' });
    qs(`[data-offer-id="${cssEsc(id)}"]`)?.remove();
    addLog('info', `Offer ${id} declined`);
    refreshCockpit(false);
  } catch (err) { addLog('error', `Decline failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

// ─── Listings ─────────────────────────────────────────────────────────────────

function listingPrice(c) {
  if (!c) return '?';
  return Object.entries(c).map(([k, v]) => `${v} ${k}`).join(' + ') || '?';
}

function renderBackpackDiagnostic(diagnostic, error) {
  const el = qs('#backpackDiagnostic');
  if (!el) return;
  const status = diagnostic?.status || (error ? 'error' : 'not_checked');
  const message = diagnostic?.message || error || 'Diagnostics pending.';
  const steam  = diagnostic?.steam_id  ? `<span>SteamID64: ${esc(diagnostic.steam_id)}</span>` : '';
  const raw    = diagnostic?.raw_count    !== undefined ? `<span>Raw: ${diagnostic.raw_count}</span>` : '';
  const parsed = diagnostic?.parsed_count !== undefined ? `<span>Parsed: ${diagnostic.parsed_count}</span>` : '';
  const hasToken = diagnostic?.token_saved ? '<span class="pill safe">Token saved</span>' : '<span class="pill error">No token</span>';
  el.className = `diagnostic-panel ${status === 'ok' ? 'ok' : status === 'empty' ? 'warn' : status === 'not_checked' ? 'hidden' : 'error'}`;
  el.innerHTML = `<strong>Backpack.tf: ${esc(status)}</strong><p>${esc(message)}</p><div class="diag-tags">${steam}${raw}${parsed}${hasToken}</div>`;
}

function renderListings(listings = []) {
  const el = qs('#listingList');
  if (!el) return;
  el.innerHTML = listings.length
    ? listings.map(l => `
      <article class="listing-card">
        <span class="intent ${l.intent === 'buy' ? 'buy' : 'sell'}">${esc(l.intent || 'listing')}</span>
        <strong>${esc(l.item_name || 'Unknown')}</strong>
        <span class="listing-price">${esc(listingPrice(l.currencies))}</span>
        <button class="btn btn-danger btn-small" data-action="delete-listing" data-id="${esc(l.id)}">Remove</button>
      </article>`).join('')
    : '<div class="empty-state">No active listings. Check Backpack diagnostics, token, SteamID64, and whether this account has public classified listings.</div>';
}

async function loadListings() {
  const data = await api('/api/listings');
  renderBackpackDiagnostic(data.diagnostic, data.error);
  renderListings(data.listings || []);
  return data.listings || [];
}

async function syncListings(button) {
  setBusy(button, true, 'Syncing…');
  try {
    const data = await api('/api/listings/sync', { method: 'POST' });
    renderBackpackDiagnostic(data.diagnostic, data.error);
    renderListings(data.listings || []);
    setText('statListings', (data.listings||[]).length);
    const bp = data.diagnostic?.status ? ` · ${data.diagnostic.status}` : '';
    setText('statListingSync', `${fmtTime(data.last_sync)}${bp}`);
    addLog('info', `Listings synced: ${(data.listings||[]).length}`);
  } catch (err) { addLog('error', `Listings sync failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function deleteListing(id, button) {
  setBusy(button, true, 'Removing…');
  try {
    await api(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    addLog('info', `Listing ${id} removed`);
    await syncListings(null);
  } catch (err) { addLog('error', `Remove failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

// ─── Listing drafts ───────────────────────────────────────────────────────────

function confidencePill(conf) {
  const cls = { schema: 'safe', none: 'error', 'needs_price': 'warn' }[conf] || 'warn';
  return `<span class="pill ${cls}">${esc(conf || 'unknown')}</span>`;
}

function renderDraft(d) {
  const price = d.suggested_sell_price != null ? `${d.suggested_sell_price} ref` : 'No price';
  const warns = d.warnings?.length ? `<div class="draft-warns">${d.warnings.map(w => `<span class="pill warn">${esc(w)}</span>`).join('')}</div>` : '';
  const ready = d.status === 'ready';
  return `
    <article class="draft-card" data-draft-id="${esc(d.draft_id)}">
      <div class="draft-topline">
        <div>
          <strong>${esc(d.market_hash_name || 'Unknown')}</strong>
          <p>${esc(d.quality || 'Unique')} · ${ready ? price : 'Needs price'}</p>
        </div>
        <div class="draft-tags">
          ${confidencePill(d.confidence)}
          ${d.dry_run ? '<span class="pill warn">dry-run</span>' : ''}
        </div>
      </div>
      ${warns}
      <div class="offer-actions">
        <button class="btn btn-primary ${!ready ? 'disabled' : ''}" data-action="publish-draft" data-id="${esc(d.draft_id)}" ${!ready ? 'title="No price — set allow_unpriced_items to publish anyway"' : ''}>Publish</button>
        <button class="btn btn-ghost"   data-action="ignore-draft"  data-id="${esc(d.draft_id)}">Ignore</button>
      </div>
    </article>`;
}

function renderDrafts(drafts = []) {
  const el = qs('#draftList');
  if (!el) return;
  const ready   = drafts.filter(d => d.status === 'ready').length;
  const unpriced = drafts.filter(d => d.status === 'needs_price').length;
  setText('draftCount', drafts.length);
  setText('statDrafts',    drafts.length);
  setText('statDraftsSub', `${ready} priced · ${unpriced} needs price`);

  const warn = qs('#draftWarning');
  if (warn) {
    if (unpriced && !ready) {
      warn.textContent = `${unpriced} drafts need pricing. Set the Backpack.tf API key to enable price schema.`;
      warn.classList.remove('hidden');
    } else { warn.classList.add('hidden'); }
  }

  el.innerHTML = drafts.length
    ? drafts.map(renderDraft).join('')
    : '<div class="empty-state">No listing drafts. Click "Generate drafts" to create sell drafts from your tradable inventory.</div>';
}

async function loadDrafts() {
  const data = await api('/api/listing-drafts');
  renderDrafts(data.drafts || []);
  return data.drafts || [];
}

async function generateDrafts(button) {
  setBusy(button, true, 'Generating…');
  try {
    const data = await api('/api/listing-drafts/generate', { method: 'POST' });
    renderDrafts(data.drafts || []);
    addLog('info', `Drafts generated: ${data.count ?? 0} (${(data.drafts||[]).filter(d=>d.status==='ready').length} priced)`);
  } catch (err) { addLog('error', `Generate drafts failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function publishDraft(draftId, button) {
  setBusy(button, true, 'Publishing…');
  try {
    const data = await api(`/api/listing-drafts/${encodeURIComponent(draftId)}/publish`, { method: 'POST' });
    addLog('info', `Draft ${data.dry_run ? '(simulated)' : 'published'}: ${data.item || draftId}`);
    await loadDrafts();
  } catch (err) { addLog('error', `Publish failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function ignoreDraft(draftId, button) {
  setBusy(button, true, 'Ignoring…');
  try {
    await api(`/api/listing-drafts/${encodeURIComponent(draftId)}/ignore`, { method: 'POST' });
    qs(`[data-draft-id="${cssEsc(draftId)}"]`)?.remove();
    addLog('info', `Draft ${draftId} ignored`);
    await loadDrafts();
  } catch (err) { addLog('error', `Ignore failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

// ─── Inventory ────────────────────────────────────────────────────────────────

function renderInventory(items = []) {
  const el = qs('#inventoryGrid');
  if (!el) return;
  setText('invCount', items.length || 0);
  el.innerHTML = items.length
    ? items.slice(0, 240).map(item => {
        const name = item.name || 'Unknown';
        const initials = name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'TF';
        return `<article class="inventory-card" title="${esc(name)}">
          <div class="item-icon">${esc(initials)}</div>
          <strong>${esc(name)}</strong>
          <span>${esc(item.quality || 'Tradable')}</span>
        </article>`;
      }).join('') + (items.length > 240 ? `<div class="empty-state">…and ${items.length-240} more</div>` : '')
    : '<div class="empty-state">Inventory empty or not loaded.</div>';
}

async function loadInventory() {
  const data = await api('/api/inventory');
  renderInventory(data.inventory || []);
  setText('statInventory', data.count ?? (data.inventory||[]).length);
  setText('statInventorySync', fmtTime(data.last_sync));
}

async function syncInventory(button) {
  setBusy(button, true, 'Syncing…');
  try {
    const data = await api('/api/inventory/sync', { method: 'POST' });
    renderInventory(data.inventory || []);
    setText('statInventory', data.count ?? (data.inventory||[]).length);
    setText('statInventorySync', fmtTime(data.last_sync));
    addLog('info', `Inventory synced: ${data.count ?? 0} tradable items`);
  } catch (err) {
    addLog('error', `Inventory sync failed: ${err.message}`);
    await loadStatus().catch(() => {});
  } finally { setBusy(button, false); }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function renderPricingPanel(data) {
  const el = qs('#pricingPanel');
  if (!el) return;
  const ok     = data.has_schema && data.status === 'ok';
  const warn   = data.has_schema && data.status !== 'ok';
  const errMsg = data.last_error?.error || data.last_error?.message || null;
  el.className = `diagnostic-panel ${ok ? 'ok' : warn ? 'warn' : 'error'}`;
  el.classList.remove('hidden');

  const needsApiKey   = data.status === 'no_key' || data.status === 'cached_no_key';
  const is403         = data.status === 'forbidden_check_api_key';

  let msg = data.has_schema
    ? `${data.item_count || 0} priced entries loaded. Last sync: ${fmtTime(data.last_sync)}.`
    : 'No price schema loaded.';
  if (is403) msg += ' HTTP 403 — check that the Backpack.tf API key is correct (it is different from the access token).';
  if (needsApiKey) msg += ' Add the Backpack.tf API key in Credentials to enable live price fetching.';
  if (errMsg && !is403) msg += ` Last error: ${errMsg}`;

  el.innerHTML = `<strong>Price schema: ${esc(data.status || 'unknown')}</strong><p>${esc(msg)}</p>`;
}

async function refreshPrices(button) {
  setBusy(button, true, 'Refreshing…');
  try {
    const data = await api('/api/prices/schema/refresh', { method: 'POST' });
    renderPricingPanel(data);
    setText('statPriceItems',  data.item_count || 0);
    setText('statPriceStatus', data.status || 'unknown');
    addLog('info', `Price schema: ${data.status} (${data.item_count || 0} items)`);
  } catch (err) { addLog('error', `Price refresh failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function loadPricingStatus() {
  try {
    const data = await api('/api/prices/schema');
    renderPricingPanel(data);
    setText('statPriceItems',  data.item_count || 0);
    setText('statPriceStatus', data.status || 'unknown');
  } catch { /* non-fatal */ }
}

async function lookupPrice(button) {
  const input  = qs('#priceLookupInput');
  const result = qs('#priceLookupResult');
  if (!input || !result) return;
  const name = input.value.trim();
  if (!name) return;
  setBusy(button, true, 'Looking up…');
  try {
    const data = await api(`/api/prices/lookup?name=${encodeURIComponent(name)}`);
    if (data.found && data.price) {
      const prices = data.price?.prices;
      let html = `<strong>${esc(name)}</strong><br>`;
      if (prices) {
        for (const [qual, tradability] of Object.entries(prices)) {
          for (const [trade, craftability] of Object.entries(tradability)) {
            for (const [craft, entries] of Object.entries(craftability)) {
              const e = Array.isArray(entries) ? entries[0] : entries;
              if (e?.value_raw != null) {
                html += `Quality ${qual} / ${trade} / ${craft}: <strong>${e.value_raw} ref</strong><br>`;
              }
            }
          }
        }
      }
      result.innerHTML = html;
    } else {
      result.textContent = `"${name}" not found in price schema.`;
    }
  } catch (err) { result.textContent = `Lookup failed: ${err.message}`; }
  finally { setBusy(button, false); }
}

// ─── Backpack diagnostics ─────────────────────────────────────────────────────

async function loadBackpackDiagnostics(button) {
  setBusy(button, true, 'Checking…');
  try {
    const data = await api('/api/backpack/diagnostics');
    const d = {
      status:       data.listings_status,
      message:      data.listings_count > 0
        ? `${data.listings_count} listings synced.`
        : `Status: ${data.listings_status}. Endpoint: ${data.endpoint_used || ''}`,
      steam_id:     data.steamid64,
      token_saved:  data.has_access_token,
    };
    renderBackpackDiagnostic(d, data.last_error);
    addLog('info', `Backpack diagnostics: listings=${data.listings_count} schema=${data.price_schema_status} token=${data.has_access_token} apikey=${data.has_api_key}`);
  } catch (err) {
    renderBackpackDiagnostic({ status: 'error', message: err.message }, err.message);
    addLog('error', `Backpack diagnostics failed: ${err.message}`);
  } finally { setBusy(button, false); }
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

async function runPipeline(button) {
  setBusy(button, true, 'Running…');
  try {
    const data = await api('/api/pipeline/run', { method: 'POST' });
    const result = data.result || data;
    const steps  = result.steps || [];
    const errors = result.errors || [];
    addLog(errors.length ? 'warn' : 'info',
      `Pipeline: ${steps.length} steps, ${errors.length} errors. ${steps.map(s => `${s.name}:${s.status}`).join(', ')}`);
    await refreshCockpit(false);
  } catch (err) { addLog('error', `Pipeline failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

function renderAccount(a) {
  const statusCls = STATUS_CLASS[a.status] || 'offline';
  const cred = a.credentials || {};
  return `
    <article class="account-card">
      <div class="account-topline">
        <div>
          <strong>${esc(a.label || a.account_id)}</strong>
          <p>ID: ${esc(a.account_id)} · Role: ${esc(a.role)}</p>
        </div>
        <div class="account-badges">
          <span class="pill ${statusCls}">${esc(a.status || 'offline')}</span>
          ${a.dry_run ? '<span class="pill warn">dry-run</span>' : '<span class="pill error">LIVE</span>'}
          ${a.enabled ? '' : '<span class="pill">disabled</span>'}
        </div>
      </div>
      <div class="account-stats">
        <span>Inventory: ${a.inventory_count || 0}</span>
        <span>Listings: ${a.listing_count || 0}</span>
        <span>Offers: ${a.offer_count || 0}</span>
        <span>Token: ${cred.has_bptf_token ? '✓' : '✗'}</span>
        <span>API key: ${cred.has_bptf_api_key ? '✓' : '✗'}</span>
      </div>
      <div class="offer-actions">
        <button class="btn btn-primary btn-small" data-action="account-login"      data-id="${esc(a.account_id)}">Connect</button>
        <button class="btn btn-ghost  btn-small" data-action="account-disconnect"  data-id="${esc(a.account_id)}">Disconnect</button>
        <button class="btn btn-ghost  btn-small" data-action="account-pipeline"    data-id="${esc(a.account_id)}">Run pipeline</button>
        <button class="btn btn-ghost  btn-small" data-action="account-select"      data-id="${esc(a.account_id)}">Select</button>
      </div>
    </article>`;
}

async function loadAccounts() {
  try {
    const data = await api('/api/accounts');
    const el   = qs('#accountList');
    if (!el) return;
    const accounts = data.accounts || [];
    el.innerHTML = accounts.length
      ? accounts.map(renderAccount).join('')
      : '<div class="empty-state">No accounts configured yet. Click "Add account" to add one.</div>';
  } catch (err) { addLog('error', `Accounts load failed: ${err.message}`); }
}

async function accountLogin(accountId, button) {
  setBusy(button, true, 'Connecting…');
  try {
    await api(`/api/accounts/${encodeURIComponent(accountId)}/bot/login`, { method: 'POST' });
    addLog('info', `Account ${accountId} login requested`);
    await loadAccounts();
  } catch (err) { addLog('error', `Account login failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function accountDisconnect(accountId, button) {
  setBusy(button, true, 'Disconnecting…');
  try {
    await api(`/api/accounts/${encodeURIComponent(accountId)}/bot/disconnect`, { method: 'POST' });
    addLog('info', `Account ${accountId} disconnected`);
    await loadAccounts();
  } catch (err) { addLog('error', `Account disconnect failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

async function accountPipeline(accountId, button) {
  setBusy(button, true, 'Running…');
  try {
    const data = await api(`/api/accounts/${encodeURIComponent(accountId)}/pipeline/run`, { method: 'POST' });
    const result = data.result || data;
    addLog('info', `Account ${accountId} pipeline: ${(result.steps||[]).length} steps, ${(result.errors||[]).length} errors`);
    await loadAccounts();
  } catch (err) { addLog('error', `Account pipeline failed: ${err.message}`); }
  finally { setBusy(button, false); }
}

// ─── Autonomous settings ──────────────────────────────────────────────────────

async function loadAutonomousSettings() {
  try {
    const data = await api('/api/settings');
    const s    = data.settings || {};
    const form = qs('#autonomousForm');
    if (!form) return;
    const setCheck = (name, val) => { const el = form.elements[name]; if (el) el.checked = !!val; };
    const setVal   = (name, val) => { const el = form.elements[name]; if (el) el.value  = val ?? ''; };
    setCheck('dry_run',                          s.dry_run ?? true);
    setCheck('autonomous_publish_enabled',        s.autonomous_publish_enabled ?? false);
    setCheck('autonomous_trade_accept_enabled',   s.autonomous_trade_accept_enabled ?? false);
    setCheck('require_price_confidence',          s.require_price_confidence ?? true);
    setCheck('allow_unpriced_items',              s.allow_unpriced_items ?? false);
    setVal('max_publish_per_cycle',               s.max_publish_per_cycle ?? 5);
    setVal('max_trade_accept_per_cycle',          s.max_trade_accept_per_cycle ?? 3);
    setVal('min_profit_ref',                      s.min_profit_ref ?? 0);
    setVal('max_parallel_accounts',              s.max_parallel_accounts ?? 1);

    // Show dry-run banner if dry_run is active
    show('#dryRunBanner', s.dry_run !== false);
  } catch { /* non-fatal */ }
}

async function saveAutonomousSettings(form) {
  const fd  = new FormData(form);
  const patch = {};
  for (const [k, v] of fd.entries()) patch[k] = v;
  const boolFields = ['dry_run','autonomous_publish_enabled','autonomous_trade_accept_enabled','require_price_confidence','allow_unpriced_items'];
  for (const f of boolFields) patch[f] = form.elements[f]?.checked ?? false;
  const numFields = ['max_publish_per_cycle','max_trade_accept_per_cycle','min_profit_ref','max_parallel_accounts'];
  for (const f of numFields) patch[f] = Number(patch[f] ?? 0);

  const btn    = form.querySelector('[type=submit]');
  const status = qs('#autonomousSaveStatus');
  setBusy(btn, true, 'Saving…');
  try {
    await api('/api/settings', { method: 'PATCH', body: JSON.stringify(patch) });
    if (status) { status.textContent = 'Settings saved.'; status.className = 'save-status success'; }
    addLog('info', 'Autonomous settings saved');
    show('#dryRunBanner', patch.dry_run);
  } catch (err) {
    if (status) { status.textContent = `Error: ${err.message}`; status.className = 'save-status error'; }
    addLog('error', `Settings save failed: ${err.message}`);
  } finally { setBusy(btn, false); }
}

// ─── Events / log ─────────────────────────────────────────────────────────────

function addLog(level, message) {
  logLines.unshift({ ts: new Date().toLocaleTimeString(), level: level || 'info', message });
  if (logLines.length > 300) logLines = logLines.slice(0, 300);
  renderLog();
}

function renderLog() {
  const el = qs('#eventLog');
  if (!el) return;
  el.innerHTML = logLines.length
    ? logLines.slice(0, 120).map(e =>
        `<div class="log-line ${esc(e.level)}"><span>${esc(e.ts)}</span><strong>${esc(e.level)}</strong><p>${esc(e.message || e.event || '')}</p></div>`
      ).join('')
    : '<div class="empty-state">No events loaded yet.</div>';
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
  } catch { renderLog(); }
}

function connectSSE() {
  try {
    const es = new EventSource('/api/events/stream');
    es.onmessage = e => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === 'status') loadStatus();
      if (msg.type === 'offer' && msg.offer) { addLog('info', `New offer ${msg.offer.id}`); loadOffers(); }
      if (msg.type === 'log' && msg.entry) addLog(msg.entry.level, `[${msg.entry.account_id || 'global'}] ${msg.entry.event}`);
    };
  } catch { /* Polling works if SSE unavailable */ }
}

// ─── Main loading ─────────────────────────────────────────────────────────────

async function loadStatus() {
  try {
    const data = await api('/api/status');
    renderStatus(data);
    if (!lastStatus || lastStatus.offer_queue !== data.offer_queue) await loadOffers();
    lastStatus = data;
  } catch {
    const badge = qs('#statusBadge');
    if (badge) { badge.textContent = 'error'; badge.className = 'status-badge error'; }
  }
}

async function refreshCockpit(syncExternal = false) {
  await loadStatus();
  await Promise.allSettled([
    loadOffers(), loadListings(), loadInventory(),
    loadDrafts(), loadEvents(), loadPricingStatus(),
  ]);
  if (syncExternal) addLog('info', 'Cockpit refreshed');
}

// ─── UI wiring ────────────────────────────────────────────────────────────────

document.addEventListener('click', async e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id  = btn.dataset.id;
  const act = btn.dataset.action;
  if (act === 'accept-offer')      return acceptOffer(id, btn);
  if (act === 'decline-offer')     return declineOffer(id, btn);
  if (act === 'delete-listing')    return deleteListing(id, btn);
  if (act === 'publish-draft')     return publishDraft(id, btn);
  if (act === 'ignore-draft')      return ignoreDraft(id, btn);
  if (act === 'account-login')     return accountLogin(id, btn);
  if (act === 'account-disconnect')return accountDisconnect(id, btn);
  if (act === 'account-pipeline')  return accountPipeline(id, btn);
  if (act === 'account-select') {
    activeAccountId = id;
    addLog('info', `Active account switched to ${id}`);
    await loadStatus();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Credentials form
  const credsForm = qs('#credsForm');
  credsForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd     = new FormData(credsForm);
    const patch  = Object.fromEntries(fd.entries());
    const btn    = credsForm.querySelector('[type=submit]');
    const status = qs('#credsSaveStatus');
    setBusy(btn, true, 'Saving…');
    try {
      await api('/api/credentials', { method: 'POST', body: JSON.stringify(patch) });
      if (status) { status.textContent = 'Saved. Empty fields were ignored.'; status.className = 'save-status success'; }
      addLog('info', 'Credentials saved');
      credsForm.reset();
      await loadStatus();
    } catch (err) {
      if (status) { status.textContent = `Error: ${err.message}`; status.className = 'save-status error'; }
      addLog('error', `Credentials save failed: ${err.message}`);
    } finally { setBusy(btn, false); }
  });

  // Autonomous form
  const autonomousForm = qs('#autonomousForm');
  autonomousForm?.addEventListener('submit', async e => {
    e.preventDefault();
    await saveAutonomousSettings(autonomousForm);
  });

  // Add account form
  const addAccountForm = qs('#addAccountForm');
  addAccountForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd   = new FormData(addAccountForm);
    const body = Object.fromEntries(fd.entries());
    const btn  = addAccountForm.querySelector('[type=submit]');
    setBusy(btn, true, 'Creating…');
    try {
      await api('/api/accounts', { method: 'POST', body: JSON.stringify(body) });
      addLog('info', `Account ${body.account_id} created`);
      addAccountForm.reset();
      show('#addAccountForm', false);
      await loadAccounts();
    } catch (err) { addLog('error', `Create account failed: ${err.message}`); }
    finally { setBusy(btn, false); }
  });

  qs('#btnAddAccount')?.addEventListener('click', () => show('#addAccountForm', !qs('#addAccountForm')?.classList.contains('hidden')));
  qs('#btnCancelAddAccount')?.addEventListener('click', () => show('#addAccountForm', false));

  // Bot control
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

  // Button bindings
  const bind = (id, fn) => qs(id)?.addEventListener('click', e => fn(e.currentTarget));
  bind('#btnSyncOffers',     syncOffers);
  bind('#btnSyncOffersTop',  syncOffers);
  bind('#btnSyncListings',   syncListings);
  bind('#btnSyncListingsTop',syncListings);
  bind('#btnSyncInventory',  syncInventory);
  bind('#btnSyncInventoryTop', syncInventory);
  bind('#btnGenerateDrafts', generateDrafts);
  bind('#btnGenDraftsTop',   generateDrafts);
  bind('#btnLoadPrices',     refreshPrices);
  bind('#btnRefreshSchema',  refreshPrices);
  bind('#btnDiagBackpack',   loadBackpackDiagnostics);
  bind('#btnRunPipeline',    runPipeline);
  bind('#btnPriceLookup',    lookupPrice);
  qs('#btnRefreshAll')?.addEventListener('click', e => {
    setBusy(e.currentTarget, true, 'Refreshing…');
    refreshCockpit(true).finally(() => setBusy(e.currentTarget, false));
  });
  qs('#btnClearLog')?.addEventListener('click', () => { logLines = []; renderLog(); });

  // Sidebar nav highlight
  qsa('.nav-link').forEach(a => a.addEventListener('click', () => {
    qsa('.nav-link').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  }));

  // Initial load
  refreshCockpit(false);
  loadAccounts();
  loadAutonomousSettings();
  connectSSE();
  setInterval(loadStatus, 10000);
  setInterval(loadAccounts, 30000);
});
