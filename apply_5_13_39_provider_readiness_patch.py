#!/usr/bin/env python3
"""
TF2 Trading Hub 5.13.39 – Provider Readiness + Token Validity Dashboard

Run from the TF2-HA repository root or from the tf2-trading-hub add-on directory:

  python apply_5_13_39_provider_readiness_patch.py

What it does:
- bumps all relevant version markers to 5.13.39
- adds /api/main-account/provider-health
- augments /api/main-account/status and /api/credentials/status with provider_health
- makes /api/setup/status include a provider-health step
- changes the Main account card so it distinguishes:
  saved credentials vs valid Backpack.tf token vs price API/schema readiness vs priced inventory
- keeps secrets redacted
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

NEW_VERSION = "5.13.39"
PATCH_LABEL = "provider-readiness-token-health"


def find_addon_dir() -> Path:
    cwd = Path.cwd()
    candidates = [cwd, cwd / "tf2-trading-hub"]
    for c in candidates:
        if (c / "dist" / "server.js").exists() and (c / "public" / "app.js").exists():
            return c
    raise SystemExit(
        "Nenalezen tf2-trading-hub add-on. Spusť skript z rootu repozitáře TF2-HA "
        "nebo přímo ze složky tf2-trading-hub."
    )


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def backup(files: list[Path], addon: Path) -> Path:
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    bdir = addon / "patch-backups" / f"5.13.39-{PATCH_LABEL}-{stamp}"
    bdir.mkdir(parents=True, exist_ok=True)
    for f in files:
        if f.exists():
            rel = f.relative_to(addon)
            target = bdir / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, target)
    return bdir


def set_versions(text: str, filename: str) -> str:
    text = re.sub(r"APP_VERSION\s*=\s*['\"][0-9]+\.[0-9]+\.[0-9]+['\"]", f"APP_VERSION = '{NEW_VERSION}'", text)
    text = re.sub(r'"version"\s*:\s*"[0-9]+\.[0-9]+\.[0-9]+"', f'"version": "{NEW_VERSION}"', text)
    text = re.sub(r"version:\s*['\"]?[0-9]+\.[0-9]+\.[0-9]+['\"]?", f'version: "{NEW_VERSION}"', text)
    text = re.sub(r"BUILD_VERSION:\s*['\"]?[0-9]+\.[0-9]+\.[0-9]+['\"]?", f'BUILD_VERSION: "{NEW_VERSION}"', text)
    text = re.sub(r"TF2-HA-TF2-Trading-Hub/[0-9]+\.[0-9]+\.[0-9]+", f"TF2-HA-TF2-Trading-Hub/{NEW_VERSION}", text)
    text = re.sub(r"\[tf2-hub\]\s+version:\s*[0-9]+\.[0-9]+\.[0-9]+", f"[tf2-hub] version: {NEW_VERSION}", text)
    text = re.sub(r"Home Assistant add-on\s*·\s*[0-9]+\.[0-9]+\.[0-9]+\s*·\s*[^\n<]*", f"Home Assistant add-on · {NEW_VERSION} · Provider Readiness", text)
    text = re.sub(r"Build\s+[0-9]+\.[0-9]+\.[0-9]+\s+loaded[^\n<]*", f"Build {NEW_VERSION} loaded Provider health separates saved credentials from live Backpack.tf token/API/schema readiness.", text)
    text = re.sub(r"\b5\.13\.(?:3[0-8])\b", NEW_VERSION, text)
    return text


SERVER_PROVIDER_HEALTH_JS = r"""
// ── 5.13.39 – Provider readiness health ───────────────────────────────
function providerHealthText(value, depth = 0, seen = new WeakSet()) {
  try {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Error) return String(value.message || value);
    if (typeof value !== 'object') return String(value);
    if (seen.has(value) || depth > 4) return '';
    seen.add(value);
    return Object.entries(value).slice(0, 80).map(([k, v]) => `${k}:${providerHealthText(v, depth + 1, seen)}`).join(' ');
  } catch { return ''; }
}
function providerHealthCountCollection(root, keys = []) {
  try {
    if (!root) return 0;
    if (Array.isArray(root)) return root.length;
    if (typeof root !== 'object') return 0;
    for (const key of keys) {
      const value = root[key];
      if (Array.isArray(value)) return value.length;
      if (value && typeof value === 'object') {
        if (Array.isArray(value.items)) return value.items.length;
        if (Array.isArray(value.listings)) return value.listings.length;
        if (Array.isArray(value.prices)) return value.prices.length;
        const nestedCount = Number(value.count || value.total || value.length || 0);
        if (Number.isFinite(nestedCount) && nestedCount > 0) return nestedCount;
      }
      const direct = Number(value || 0);
      if (Number.isFinite(direct) && direct > 0) return direct;
    }
    for (const value of Object.values(root).slice(0, 50)) {
      if (Array.isArray(value)) return value.length;
      if (value && typeof value === 'object') {
        const count = providerHealthCountCollection(value, keys);
        if (count > 0) return count;
      }
    }
  } catch {}
  return 0;
}
function providerHealthNumber(root, keys = []) {
  try {
    if (!root || typeof root !== 'object') return 0;
    for (const key of keys) {
      const value = key.split('.').reduce((acc, part) => acc && acc[part], root);
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch {}
  return 0;
}
function providerHealthFileMeta(filePath) {
  try {
    const st = fs.statSync(filePath);
    return { exists: true, size_bytes: st.size, mtime: st.mtime.toISOString(), file: path.basename(filePath) };
  } catch {
    return { exists: false, size_bytes: 0, mtime: null, file: path.basename(filePath) };
  }
}
function providerHealthLastBackpackFailure() {
  try {
    const events = readJsonLines(AUDIT_PATH, 700).reverse();
    return events.find(event => {
      const text = providerHealthText(event).toLowerCase();
      return text.includes('backpack') && (text.includes('failed') || text.includes('invalid') || text.includes('api_key_missing') || text.includes('401'));
    }) || null;
  } catch { return null; }
}
function providerHealthState() {
  const vault = readCanonicalMainAccountVaultStrict();
  const accountStatus = publicMainAccountStatus(vault.main_account || {}, vault.source || 'canonical_vault');
  const account = vault.main_account || {};
  const provider = providerEntry('backpack.tf') || {};
  const lastFailure = providerHealthLastBackpackFailure();
  const providerText = `${providerHealthText(provider)} ${providerHealthText(lastFailure)}`.toLowerCase();
  const invalidToken = Number(provider.last_status) === 401 || /\b401\b|access token is not valid|invalid access token|invalid token|unauthorized/.test(providerText);
  const apiKeyMissing = /api[_\s-]?key[_\s-]?missing|api key missing|hasapikey:false|has_api_key:false/.test(providerText);

  const listingsRaw = readJson(BACKPACK_LISTINGS_PATH, {});
  const priceSchemaRaw = readJson(BACKPACK_PRICE_SCHEMA_PATH, {});
  const pricelistRaw = readJson(PRICELIST_PATH, {});
  const inventoryRaw = readJson(HUB_INVENTORY_PATH, {});
  const scannerRaw = readJson(MARKET_SCANNER_PATH, {});

  const listingsCount = providerHealthCountCollection(listingsRaw, ['listings', 'classifieds', 'items', 'active', 'buy', 'sell', 'entries', 'results', 'count', 'total']);
  const priceSchemaCount = providerHealthCountCollection(priceSchemaRaw, ['items', 'prices', 'schema', 'entries', 'results', 'count', 'total']);
  const pricelistCount = providerHealthCountCollection(pricelistRaw, ['items', 'prices', 'entries', 'results', 'count', 'total']);
  const priceCount = Math.max(priceSchemaCount, pricelistCount);
  const inventoryItems = Math.max(
    providerHealthNumber(inventoryRaw, ['items', 'summary.items', 'summary.total_items', 'inventory.items', 'count', 'total']),
    providerHealthCountCollection(inventoryRaw, ['items', 'inventory', 'assets', 'entries'])
  );
  const pricedItems = Math.max(
    providerHealthNumber(inventoryRaw, ['priced', 'summary.priced', 'priced_items', 'matched_items', 'pricing.matched_items', 'pricing.matched']),
    providerHealthCountCollection(inventoryRaw, ['priced_items', 'priced'])
  );
  const scannerCandidates = Math.max(
    providerHealthNumber(scannerRaw, ['candidates', 'summary.candidates', 'count', 'total']),
    providerHealthCountCollection(scannerRaw, ['candidates', 'items', 'results'])
  );

  const tokenSaved = Boolean(accountStatus.backpack_tf_access_token_saved || accountStatus.backpack_tf_token_saved || account.backpack_tf_access_token);
  const apiKeySaved = Boolean(accountStatus.backpack_tf_api_key_saved || account.backpack_tf_api_key);
  const steamInventoryReady = inventoryItems > 0;
  const priceSchemaReady = priceCount > 0;
  const inventoryPriced = pricedItems > 0;
  const tokenValid = tokenSaved ? (invalidToken ? false : ((provider.last_ok_at || listingsCount > 0) ? true : null)) : false;
  const tokenState = !tokenSaved ? 'missing' : invalidToken ? 'invalid_401' : tokenValid === true ? 'ok' : 'unknown_not_verified_yet';
  const priceState = priceSchemaReady ? 'ready' : (apiKeyMissing || !apiKeySaved ? 'api_key_missing_or_price_sync_failed' : 'missing');

  let readiness = 'ready';
  let recommendedNextAction = 'Provider health looks ready.';
  if (accountStatus.needs_setup) {
    readiness = 'credentials_missing';
    recommendedNextAction = 'Fill SteamID64, Steam Web API key and Backpack.tf token/API key, then save Main account.';
  } else if (invalidToken) {
    readiness = 'backpack_token_invalid';
    recommendedNextAction = 'Generate a fresh Backpack.tf access token/API key, paste it into Main account, save, restart the add-on and run Local Workflow.';
  } else if (!priceSchemaReady) {
    readiness = 'price_schema_missing';
    recommendedNextAction = apiKeyMissing || !apiKeySaved ? 'Backpack.tf credentials are saved, but price sync reports missing API key/no prices. Paste the Backpack.tf API key as well as the access token, then run Local Workflow.' : 'Run Local Workflow. If prices stay at 0, refresh Backpack.tf token/API key.';
  } else if (!steamInventoryReady) {
    readiness = 'inventory_not_synced';
    recommendedNextAction = 'Run Sync inventory / Local Workflow and check SteamID64 visibility.';
  } else if (!inventoryPriced) {
    readiness = 'inventory_unpriced';
    recommendedNextAction = 'Inventory loaded but no items matched Backpack.tf prices. Fix Backpack.tf price schema/API key first, then rerun Local Workflow.';
  }

  const overallReady = readiness === 'ready';
  const checks = [
    { id: 'credentials_saved', label: 'Credentials saved', ready: !accountStatus.needs_setup, state: accountStatus.needs_setup ? 'missing' : 'saved', detail: accountStatus.missing || {} },
    { id: 'backpack_access_token_saved', label: 'Backpack access token saved', ready: tokenSaved, state: tokenSaved ? 'saved' : 'missing' },
    { id: 'backpack_access_token_valid', label: 'Backpack access token valid', ready: tokenValid === true, state: tokenState, detail: invalidToken ? 'Backpack.tf returned 401 / invalid token in the last sync.' : 'Based on last provider sync/listing fetch.' },
    { id: 'backpack_api_key_saved', label: 'Backpack API key saved', ready: apiKeySaved || priceSchemaReady, state: apiKeySaved ? 'saved' : 'not_saved_or_not_required_by_field', detail: apiKeyMissing ? 'Price schema sync reported API key missing.' : '' },
    { id: 'backpack_price_schema_ready', label: 'Backpack price schema ready', ready: priceSchemaReady, state: priceState, count: priceCount },
    { id: 'steam_inventory_ready', label: 'Steam inventory ready', ready: steamInventoryReady, state: steamInventoryReady ? 'ready' : 'missing', count: inventoryItems },
    { id: 'inventory_priced', label: 'Inventory priced', ready: inventoryPriced, state: inventoryPriced ? 'ready' : 'unpriced', count: pricedItems },
    { id: 'market_scanner_candidates', label: 'Market scanner candidates', ready: scannerCandidates > 0, state: scannerCandidates > 0 ? 'ready' : 'none', count: scannerCandidates }
  ];

  const result = {
    ok: true,
    version: APP_VERSION,
    checked_at: new Date().toISOString(),
    credentials_saved: !accountStatus.needs_setup,
    overall_ready: overallReady,
    readiness,
    recommended_next_action: recommendedNextAction,
    main_account: { readiness: accountStatus.readiness, needs_setup: accountStatus.needs_setup, missing: accountStatus.missing, secrets_returned: false },
    backpack_tf: {
      access_token_saved: tokenSaved,
      api_key_saved: apiKeySaved,
      token_valid: tokenValid,
      token_state: tokenState,
      api_key_missing: apiKeyMissing,
      price_state: priceState,
      listings_count: listingsCount,
      price_count: priceCount,
      provider_last_status: provider.last_status || null,
      provider_last_ok_at: provider.last_ok_at || null,
      provider_last_error_at: provider.last_error_at || null,
      provider_failures: Number(provider.failures || 0)
    },
    inventory: { items: inventoryItems, priced: pricedItems, unpriced: Math.max(0, inventoryItems - pricedItems), ready: steamInventoryReady, priced_ready: inventoryPriced },
    scanner: { candidates: scannerCandidates },
    checks,
    files: {
      provider_state: providerHealthFileMeta(PROVIDER_STATE_PATH),
      backpack_listings: providerHealthFileMeta(BACKPACK_LISTINGS_PATH),
      backpack_price_schema: providerHealthFileMeta(BACKPACK_PRICE_SCHEMA_PATH),
      pricelist: providerHealthFileMeta(PRICELIST_PATH),
      inventory: providerHealthFileMeta(HUB_INVENTORY_PATH),
      audit: providerHealthFileMeta(AUDIT_PATH)
    },
    last_backpack_failure: lastFailure ? runtimeRedactValue('last_backpack_failure', lastFailure) : null,
    secrets_returned: false
  };
  try { runtimeLogger.info('provider_health', 'status_built', 'Provider readiness status built', { readiness, overall_ready: overallReady, token_state: tokenState, price_state: priceState, inventory_items: inventoryItems, priced_items: pricedItems }); } catch {}
  return result;
}
function withProviderHealthStatus(status = {}) {
  const providerHealth = providerHealthState();
  const nextReadiness = status.needs_setup ? 'needs_setup' : (providerHealth.overall_ready ? 'ready' : providerHealth.readiness);
  return {
    ...status,
    readiness: nextReadiness,
    provider_health: providerHealth,
    recommended_next_action: providerHealth.overall_ready ? (status.recommended_next_action || 'Main account and providers are ready.') : providerHealth.recommended_next_action,
    main_account: {
      ...(status.main_account || {}),
      readiness: nextReadiness,
      provider_health: providerHealth,
      backpack_token_valid: providerHealth.backpack_tf.token_valid,
      backpack_token_state: providerHealth.backpack_tf.token_state,
      backpack_price_state: providerHealth.backpack_tf.price_state,
      secrets_returned: false
    },
    secrets_returned: false
  };
}
function buildMainAccountProviderHealth() { return providerHealthState(); }
"""


PUBLIC_RENDER_CREDENTIALS_JS = r"""
function renderCredentials(data){
const el=qs('#credentialStatus'); if(!el)return; if(!data||data.ok===false){el.innerHTML=`
<div class="muted">${esc(data?.error||'Credential status unavailable.')}</div>
`;return;}
const accounts=Array.isArray(data.account_status)?data.account_status:(Array.isArray(data.accounts)?data.accounts:[]);
const main=data.main_account||accounts.find(a=>String(a.id||'main')==='main'||String(a.role||'')==='main')||accounts[0]||{};
const providerHealth=data.provider_health||main.provider_health||{};
const backpackHealth=providerHealth.backpack_tf||{};
const inventoryHealth=providerHealth.inventory||{};
const checks=Array.isArray(providerHealth.checks)?providerHealth.checks:[];
const select=qs('#credentialAccountId'); if(select){ select.innerHTML='Main account'; select.value='main'; }
const steamSaved=Boolean(main.steam_web_api_key_saved||main.steam_api_key_saved||main.steam_api);
const backpackSaved=Boolean(main.backpack_tf_token_saved||main.backpack_tf_access_token_saved||main.backpack_tf||main.backpack_tf_api_key_saved||backpackHealth.access_token_saved||backpackHealth.api_key_saved);
const steamIdSaved=Boolean(main.steam_id64_saved||main.steam_id64);
const steamId=main.steam_id64_short||main.steam_id64||(steamIdSaved?'saved':'missing');
const credentialsReady=Boolean(steamIdSaved&&steamSaved&&backpackSaved);
const providerKnown=Boolean(providerHealth.readiness||checks.length||providerHealth.recommended_next_action);
const providerReady=providerHealth.overall_ready===true;
const ready=credentialsReady&&(!providerKnown||providerReady);
const readiness=(providerHealth.readiness||main.readiness||data.readiness||'').toString();
const tokenState=backpackHealth.token_state||main.backpack_token_state||(backpackHealth.token_valid===true?'ok':backpackHealth.token_valid===false?'invalid':'unknown');
const tokenPillClass=tokenState==='ok'?'ok':(tokenState.includes('invalid')?'bad':'warn');
const priceState=backpackHealth.price_state||main.backpack_price_state||'unknown';
const pricePillClass=String(priceState).includes('ready')?'ok':'warn';
const providerRows=checks.length?checks.map(x=>`
  <div class="feed-row"><strong>${esc(x.label||x.id)}</strong> ${pill(x.ready?'ready':'needs attention',x.ready?'ok':'warn')} <span class="muted">${esc(x.state||'')}${x.count!=null?` · ${esc(x.count)}`:''}${x.detail?` · ${esc(typeof x.detail==='string'?x.detail:JSON.stringify(x.detail))}`:''}</span></div>
`).join(''):'';
el.innerHTML=`
<div>${esc(main.label||'Main account')}${pill(ready?'ready':'needs attention',ready?'ok':'warn')}</div>
<div class="grid compact">
${metric('SteamID64',steamId)} ${metric('Steam API key',steamSaved?'saved':'missing')} ${metric('Backpack saved',backpackSaved?'saved':'missing')} ${metric('Live scope','Main only')}
${metric('Backpack token valid',tokenState)} ${metric('Backpack prices',priceState)} ${metric('Inventory',`${Number(inventoryHealth.items||0)} items`)} ${metric('Priced',`${Number(inventoryHealth.priced||0)} priced`)}
</div>
<div class="muted">Credentials saved only means they are stored. Provider health shows whether Backpack.tf and pricing actually work.</div>
<div class="muted">${esc(providerHealth.recommended_next_action||'To switch account: paste the new SteamID64, Steam Web API key and Backpack.tf token/API key, then click Save main account.')}</div>
${readiness?`<div class="muted">Readiness: ${esc(readiness)} ${pill(tokenState,tokenPillClass)} ${pill(priceState,pricePillClass)}</div>`:''}
${providerRows?`<details><summary>Provider health checks</summary>${providerRows}</details>`:''}
`;
"""


def patch_server(text: str) -> str:
    original = text
    if "5.13.39 – Provider readiness health" not in text:
        marker = "function fileMetaRedacted(filePath) {"
        if marker not in text:
            raise RuntimeError("Nelze najít marker pro vložení provider health funkce: function fileMetaRedacted")
        text = text.replace(marker, SERVER_PROVIDER_HEALTH_JS.strip() + " " + marker, 1)

    replacements = {
        "if (pathname === '/api/main-account/status') { return json(res, 200, canonicalMainAccountStatusResponse()); }":
            "if (pathname === '/api/main-account/provider-health') { return json(res, 200, buildMainAccountProviderHealth()); } if (pathname === '/api/main-account/status') { return json(res, 200, withProviderHealthStatus(canonicalMainAccountStatusResponse())); }",
        "if (pathname === '/api/credentials/status') { return json(res, 200, canonicalMainAccountStatusResponse()); }":
            "if (pathname === '/api/credentials/status') { return json(res, 200, withProviderHealthStatus(canonicalMainAccountStatusResponse())); }",
        "if (pathname === '/api/credentials/save-verify') { const verification = canonicalMainAccountStatusResponse(); return json(res, 200, { ...verification, save_verified: Boolean(!verification.needs_setup), main_account: verification.main_account, secrets_returned: false }); }":
            "if (pathname === '/api/credentials/save-verify') { const verification = withProviderHealthStatus(canonicalMainAccountStatusResponse()); return json(res, 200, { ...verification, save_verified: Boolean(!verification.needs_setup), main_account: verification.main_account, secrets_returned: false }); }",
        "if (pathname === '/api/setup/status') { return json(res, 200, new HubSetupService(auditService).status(null)); }":
            "if (pathname === '/api/setup/status') { const setup = new HubSetupService(auditService).status(null); const providerHealth = buildMainAccountProviderHealth(); const steps = Array.isArray(setup.steps) ? setup.steps.slice() : []; steps.unshift({ id: 'provider_health', label: 'Provider health', ready: Boolean(providerHealth.overall_ready), detail: providerHealth.recommended_next_action || providerHealth.readiness || 'Provider health unknown' }); const ready_count = steps.filter(s => s && s.ready).length; const total_steps = steps.length; return json(res, 200, { ...setup, provider_health: providerHealth, steps, ready_count, total_steps, readiness_percent: total_steps ? Math.round((ready_count / total_steps) * 100) : 0, recommended_next_action: providerHealth.overall_ready ? (setup.recommended_next_action || 'Ready.') : providerHealth.recommended_next_action }); }",
    }
    for old, new in replacements.items():
        if old in text:
            text = text.replace(old, new, 1)
        elif new not in text:
            raise RuntimeError(f"Nelze najít route pattern v server.js: {old[:80]}...")

    if text == original:
        raise RuntimeError("server.js nebyl změněn – patch se zřejmě neaplikoval.")
    return text


def patch_public_app(text: str) -> str:
    if "Credentials saved only means they are stored. Provider health shows" in text:
        return text
    pattern = r"function renderCredentials\(data\)\{.*?const debugBtn=qs\('#debugMainAccountStatus'\);"
    match = re.search(pattern, text, flags=re.DOTALL)
    if not match:
        raise RuntimeError("Nelze najít renderCredentials() blok v public/app.js")
    return text[:match.start()] + PUBLIC_RENDER_CREDENTIALS_JS.strip() + " const debugBtn=qs('#debugMainAccountStatus');" + text[match.end():]


def patch_package_json(text: str) -> str:
    try:
        data = json.loads(text)
        data["version"] = NEW_VERSION
        data["description"] = "TF2 Trading Hub provider readiness health: separates saved credentials from live Backpack.tf token/API/schema readiness."
        return json.dumps(data, ensure_ascii=False, separators=(", ", ": ")) + "\n"
    except Exception:
        return set_versions(text, "package.json")


def patch_readme(text: str) -> str:
    entry = f"""

## {NEW_VERSION} – Provider Readiness + Token Validity Dashboard

Main account readiness now separates stored credentials from live provider health. The dashboard shows whether the Backpack.tf access token is saved, whether the last provider sync returned 401/invalid token, whether Backpack.tf price schema/pricelist is available, and whether the Steam inventory is actually priced. New endpoint: `/api/main-account/provider-health`. Secrets remain redacted.
"""
    if f"## {NEW_VERSION} – Provider Readiness" not in text:
        text = text.rstrip() + entry
    return set_versions(text, "README.md")


def patch_config_text(text: str) -> str:
    text = set_versions(text, "config.yaml")
    text = re.sub(r"description:\s*[^\n]+", "description: Provider readiness health separates saved credentials from live Backpack.tf token/API/schema readiness.", text, count=1)
    return text


def main() -> None:
    addon = find_addon_dir()
    files = [
        addon / "dist" / "server.js",
        addon / "dist" / "index.js",
        addon / "public" / "app.js",
        addon / "public" / "index.html",
        addon / "config.yaml",
        addon / "package.json",
        addon / "run.sh",
        addon / "build.yaml",
        addon / "README.md",
    ]
    bdir = backup(files, addon)

    changed = []
    for js_name in ["server.js", "index.js"]:
        p = addon / "dist" / js_name
        if p.exists():
            text = set_versions(read(p), js_name)
            text = patch_server(text)
            write(p, text)
            changed.append(str(p.relative_to(addon)))

    app = addon / "public" / "app.js"
    if app.exists():
        text = set_versions(read(app), "app.js")
        text = patch_public_app(text)
        write(app, text)
        changed.append(str(app.relative_to(addon)))

    for name in ["public/index.html", "run.sh", "build.yaml"]:
        p = addon / name
        if p.exists():
            write(p, set_versions(read(p), name))
            changed.append(name)

    cfg = addon / "config.yaml"
    if cfg.exists():
        write(cfg, patch_config_text(read(cfg)))
        changed.append("config.yaml")

    pkg = addon / "package.json"
    if pkg.exists():
        write(pkg, patch_package_json(read(pkg)))
        changed.append("package.json")

    readme = addon / "README.md"
    if readme.exists():
        write(readme, patch_readme(read(readme)))
        changed.append("README.md")

    # Syntax check JS files where possible.
    node_check = []
    try:
        for p in [addon / "dist" / "server.js", addon / "dist" / "index.js", addon / "public" / "app.js"]:
            if p.exists():
                result = subprocess.run(["node", "--check", str(p)], cwd=str(addon), text=True, capture_output=True, timeout=30)
                node_check.append({"file": str(p.relative_to(addon)), "ok": result.returncode == 0, "stderr": result.stderr.strip(), "stdout": result.stdout.strip()})
    except FileNotFoundError:
        node_check.append({"ok": None, "note": "node není v PATH, přeskočeno node --check"})
    except Exception as e:
        node_check.append({"ok": False, "error": str(e)})

    report = {
        "ok": True,
        "version": NEW_VERSION,
        "patch": PATCH_LABEL,
        "addon_dir": str(addon),
        "backup_dir": str(bdir),
        "changed": changed,
        "node_check": node_check,
        "next_steps": [
            "Commitni změny do GitHubu.",
            "V Home Assistantu otevři Add-on Store → ⋮ → Check for updates.",
            "Aktualizuj TF2 Trading Hub na 5.13.39 a restartuj add-on.",
            "Otevři /api/main-account/provider-health nebo dashboard Main account – uvidíš, zda je Backpack.tf token invalidní / API key chybí / inventory není oceněné.",
        ],
    }
    report_path = addon / f"PATCH_{NEW_VERSION}_{PATCH_LABEL}_REPORT.json"
    write(report_path, json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
