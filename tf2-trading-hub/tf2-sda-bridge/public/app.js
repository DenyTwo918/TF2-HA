'use strict';
const $ = selector => document.querySelector(selector);
function addonUrl(path) {
  const clean = String(path || '').replace(/^\/+/, '');
  const base = new URL(window.location.href);
  if (!base.pathname.endsWith('/')) base.pathname = base.pathname.replace(/[^/]*$/, '');
  base.search = '';
  base.hash = '';
  return new URL(clean, base.toString()).toString();
}
let lastCode = '';
function normalizeErrorValue(value) {
  if (!value) return 'Unknown error';
  if (typeof value === 'string') return value;
  if (value.message && typeof value.message === 'string') return value.message;
  if (value.error && typeof value.error === 'string') return value.error;
  try { return JSON.stringify(value); } catch { return String(value); }
}
async function api(path, options = {}) {
  const response = await fetch(addonUrl(path), { cache: 'no-store', ...options });
  const responseText = await response.text();
  let body = null;
  try { body = responseText ? JSON.parse(responseText) : {}; } catch { body = { ok: false, error: 'Response was not valid JSON.', raw: responseText }; }
  if (!response.ok) throw (body && typeof body === 'object' ? body : { ok: false, error: normalizeErrorValue(body) });
  return body;
}
function renderRaw(value) {
  const normalized = typeof value === 'object' && value !== null ? value : { value: normalizeErrorValue(value) };
  $('#raw-output').textContent = JSON.stringify(normalized, null, 2);
}
function setStatus(text, tone = 'info') {
  const el = $('#status-pill');
  el.textContent = text;
  const colors = {
    good: 'rgba(52,211,153,.55)',
    warn: 'rgba(251,191,36,.55)',
    bad: 'rgba(251,113,133,.55)',
    info: 'rgba(96,165,250,.35)'
  };
  el.style.borderColor = colors[tone] || colors.info;
}
function chip(label, ok, extra = '') { return `<span class="chip ${ok ? 'yes' : 'no'}">${label}: ${ok ? 'yes' : 'no'}${extra ? ` (${extra})` : ''}</span>`; }
function renderReport(report) {
  if (!report) { $('#import-report').innerHTML = ''; return; }
  $('#import-report').innerHTML = [
    chip('shared_secret', report.shared_secret, report.shared_secret_base64_ok ? 'base64 ok' : ''),
    chip('identity_secret', report.identity_secret, report.identity_secret_base64_ok ? 'base64 ok' : ''),
    chip('SteamID64', report.steam_id64),
    chip('SteamLoginSecure', report.steam_login_secure),
    chip('SessionID', report.session_id),
    chip('device_id', report.device_id),
    chip('TOTP ready', report.totp_ready),
    chip('Confirmations ready', report.confirmations_ready)
  ].join('');
}
async function selectedFileText() {
  const file = $('#file-input').files && $('#file-input').files[0];
  if (!file) throw new Error('Choose a .maFile first.');
  return await file.text();
}
function renderDiagnostics(diag) {
  if (!diag || !$('#diagnostics')) return;
  const missing = Array.isArray(diag.missing) ? diag.missing : [];
  $('#diagnostics').innerHTML = [
    `<div class="diag-line"><strong>Missing:</strong> ${missing.length ? missing.join(', ') : 'nothing important'}</div>`,
    `<div class="diag-line"><strong>Next step:</strong> ${diag.next_step || '-'}</div>`,
    `<div class="diag-line"><strong>Session health:</strong> ${diag.session_health && diag.session_health.status || 'unknown'}</div>`
  ].join('');
}
async function refreshStatus() {
  const status = await api('/api/status');
  if (status.confirmations_ready) setStatus('Ready for confirmations', 'good');
  else if (status.totp_ready) setStatus('TOTP ready · session missing', 'warn');
  else if (status.mafile_loaded) setStatus('maFile incomplete', 'warn');
  else setStatus('No maFile', 'bad');
  renderDiagnostics(status.diagnostics);
  renderRaw(status);
}
async function loadDiagnostics() {
  const result = await api('/api/diagnostics');
  renderDiagnostics(result);
  renderRaw(result);
}
async function checkText(text) {
  const result = await api('/api/mafile/check', { method: 'POST', body: text || '' });
  renderReport(result.report);
  renderRaw(result);
}
async function saveText(text) {
  const result = await api('/api/mafile', { method: 'POST', body: text || '' });
  renderReport(result.report);
  renderRaw(result);
  await refreshStatus();
}
async function showCode() {
  const result = await api('/api/code');
  lastCode = result.code || '';
  $('#steam-code').textContent = lastCode || '-----';
  $('#code-meta').textContent = result.ok ? `Expires in ${result.seconds_remaining}s · ${result.account_name || 'account'}` : 'Code unavailable';
  renderRaw(result);
}
function renderConfirmations(result) {
  const list = result.confirmations || result.confs || [];
  if (!result.ok) {
    $('#confirmations').innerHTML = `<p class="muted error-text">${normalizeErrorValue(result.error || result)}</p>`;
    renderDiagnostics(result.diagnostics);
    return;
  }
  if (!list.length) { $('#confirmations').innerHTML = `<p class="muted">No pending confirmations found.</p>`; return; }
  $('#confirmations').innerHTML = list.map(conf => {
    const isTrade = conf.is_trade_confirmation === true || conf.kind === 'trade';
    const kind = conf.kind || (isTrade ? 'trade' : 'unknown');
    const note = isTrade ? 'Trade confirmation can be allowed manually.' : 'Not a trade confirmation — left untouched so it can expire naturally.';
    const action = isTrade ? `<button data-allow="${conf.id}" data-key="${conf.nonce || conf.key || ''}">Allow trade</button>` : `<span class="badge muted-badge">No action</span>`;
    return `<div class="conf ${isTrade ? 'trade' : 'ignored'}"><div><strong>${conf.description || 'Steam confirmation'}</strong><br><span class="muted">id: ${conf.id || '-'} · creator: ${conf.creator || conf.creator_steamid || '-'} · type: ${kind}</span><br><span class="muted">${note}</span></div><div class="actions">${action}</div></div>`;
  }).join('');
}
async function loadConfirmations() {
  try {
    const result = await api('/api/confirmations');
    renderConfirmations(result);
    renderRaw(result);
  } catch (error) {
    const body = error && typeof error === 'object' ? error : { ok: false, error: normalizeErrorValue(error) };
    renderConfirmations(body);
    renderRaw(body);
  }
}
async function confirmOne(id, key, tag) {
  const result = await api('/api/confirmations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, key, tag }) });
  renderRaw(result);
  await loadConfirmations();
}
async function saveSession() {
  const body = { SteamID: $('#steamid').value.trim(), SteamLoginSecure: $('#steamloginsecure').value.trim(), SessionID: $('#sessionid').value.trim() };
  const result = await api('/api/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  renderRaw(result);
  await refreshStatus();
}
function showError(error) {
  const body = error && typeof error === 'object' ? { ok: false, ...error, error: normalizeErrorValue(error.error || error.message || error) } : { ok: false, error: normalizeErrorValue(error) };
  setStatus(body.error || 'Error', 'bad');
  if (body.diagnostics) renderDiagnostics(body.diagnostics);
  renderRaw(body);
}

document.addEventListener('click', async event => {
  try {
    if (event.target.id === 'refresh-status') await refreshStatus();
    if (event.target.id === 'run-diagnostics') await loadDiagnostics();
    if (event.target.id === 'check-file') await checkText(await selectedFileText());
    if (event.target.id === 'save-file') await saveText(await selectedFileText());
    if (event.target.id === 'check-paste') await checkText($('#mafile-text').value);
    if (event.target.id === 'save-paste') await saveText($('#mafile-text').value);
    if (event.target.id === 'show-code') await showCode();
    if (event.target.id === 'copy-code') { if (lastCode) await navigator.clipboard.writeText(lastCode); }
    if (event.target.id === 'save-session') await saveSession();
    if (event.target.id === 'load-confirmations') await loadConfirmations();
    if (event.target.dataset.allow) await confirmOne(event.target.dataset.allow, event.target.dataset.key, 'allow');
  } catch (error) { showError(error); }
});
refreshStatus().catch(showError);
