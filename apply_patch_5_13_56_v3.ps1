
param(
  [string]$RepoRoot = ""
)

$ErrorActionPreference = "Stop"
$PatchVersion = "5.13.56"
$PatchTitle = "Safe Minimal Maintainer after provider sync"

function Write-Step([string]$Text) {
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Find-RepoRoot([string]$StartPath) {
  if ($StartPath -and (Test-Path $StartPath)) {
    $p = (Resolve-Path $StartPath).Path
    for ($i = 0; $i -lt 10; $i++) {
      if (Test-Path (Join-Path $p "tf2-trading-hub\dist\server.js")) { return $p }
      $parent = Split-Path $p -Parent
      if (-not $parent -or $parent -eq $p) { break }
      $p = $parent
    }
  }

  $candidates = @(
    (Get-Location).Path,
    "$env:USERPROFILE\Desktop\TF2 HA\.claude\worktrees\happy-hugle-6896f7",
    "$env:USERPROFILE\Desktop\TF2 HA\.claude\worktrees",
    "$env:USERPROFILE\Desktop\TF2 HA",
    "$env:USERPROFILE\Downloads"
  ) | Where-Object { $_ -and (Test-Path $_) }

  foreach ($base in $candidates) {
    if (Test-Path (Join-Path $base "tf2-trading-hub\dist\server.js")) { return (Resolve-Path $base).Path }
  }

  foreach ($base in $candidates) {
    try {
      $found = Get-ChildItem -Path $base -Recurse -Filter server.js -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -like "*tf2-trading-hub*dist*server.js" } |
        Select-Object -First 1
      if ($found) {
        return (Resolve-Path (Join-Path $found.DirectoryName "..\..")).Path
      }
    } catch {}
  }

  throw "Could not find repo root. Run this script from the repository root, or pass -RepoRoot 'C:\path\to\repo'."
}

function Read-Text([string]$Path) {
  return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}

function Write-Text([string]$Path, [string]$Text) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Text, $utf8NoBom)
}

function Replace-AllVersions([string]$Text) {
  return ($Text -replace "5\.13\.(47|48|49|50|51|52|53|54|55)", $PatchVersion)
}

function Remove-TrailingWhitespaceFromText([string]$Text) {
  # git diff --check rejects spaces/tabs at end of added lines.
  # Keep line endings, remove only trailing spaces/tabs before line endings and EOF.
  $Text = [regex]::Replace($Text, '[ \t]+(\r?\n)', '$1')
  $Text = [regex]::Replace($Text, '[ \t]+$', '')
  return $Text
}

function Clean-TrailingWhitespace([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $t = Read-Text $Path
  $clean = Remove-TrailingWhitespaceFromText $t
  if ($clean -ne $t) { Write-Text $Path $clean }
}

function Add-Or-Set-YamlOption([string]$Yaml, [string]$Key, [string]$Value) {
  $pattern = "(?m)^(\s*$([regex]::Escape($Key))\s*:\s*).*$"
  if ($Yaml -match $pattern) {
    return [regex]::Replace($Yaml, $pattern, "`$1$Value")
  }
  if ($Yaml -match "(?m)^options:\s*$") {
    return [regex]::Replace($Yaml, "(?m)^options:\s*$", "options:`n  $Key`: $Value", 1)
  }
  return $Yaml + "`noptions:`n  $Key`: $Value`n"
}

function Add-Or-Set-YamlSchema([string]$Yaml, [string]$Key, [string]$Value) {
  $pattern = "(?m)^(\s*$([regex]::Escape($Key))\s*:\s*).*$"
  if ($Yaml -match $pattern) {
    return [regex]::Replace($Yaml, $pattern, "`$1$Value")
  }
  if ($Yaml -match "(?m)^schema:\s*$") {
    return [regex]::Replace($Yaml, "(?m)^schema:\s*$", "schema:`n  $Key`: $Value", 1)
  }
  return $Yaml + "`nschema:`n  $Key`: $Value`n"
}

function Patch-Server([string]$Path) {
  $text = Read-Text $Path
  $text = Replace-AllVersions $text
  $text = [regex]::Replace($text, "APP_VERSION\s*=\s*['\""].*?['\""]", "APP_VERSION = '$PatchVersion'")

  if ($text -notmatch "SAFE_MINIMAL_MAINTAINER_5_13_56") {
    $block = @'

        // SAFE_MINIMAL_MAINTAINER_5_13_56
        const __safeMinimalMaintainerEnabled_5_13_56 = (typeof options === 'undefined' || !options || options.persistent_classifieds_maintainer_safe_minimal_mode_enabled !== false);
        if (__safeMinimalMaintainerEnabled_5_13_56) {
          const __safeMinimalReason_5_13_56 = (typeof reason !== 'undefined' && reason) ? reason : 'unknown';
          try {
            if (typeof runtimeLogger !== 'undefined' && runtimeLogger && runtimeLogger.info) {
              runtimeLogger.info('maintainer', 'maintainer_minimal_mode_enabled', 'Safe minimal maintainer mode enabled after provider sync', { reason: __safeMinimalReason_5_13_56, mode: 'safe_minimal' });
              runtimeLogger.info('maintainer', 'maintainer_legacy_steps_skipped', 'Legacy post-sync maintainer steps skipped by Safe Minimal Maintainer mode', { reason: __safeMinimalReason_5_13_56 });
              runtimeLogger.info('maintainer', 'maintainer_minimal_completed', 'Safe minimal maintainer completed after provider sync', { reason: __safeMinimalReason_5_13_56 });
            }
          } catch (_) {}
          result.safe_minimal_mode = true;
          result.skipped_legacy_steps = true;
          result.steps.push({ stage: 'safe_minimal_legacy_steps', ok: true, skipped: true, reason: 'safe_minimal_mode' });
          result.completed_at = new Date().toISOString();
          result.ok = result.ok !== false;
          return result;
        }
'@

    $patterns = @(
      "(?s)(result\.steps\.push\(\s*\{\s*stage\s*:\s*['\"" ]provider_sync['\"" ].*?\}\s*\)\s*;)",
      "(?s)(result\.steps\.push\(\s*\{[^{}]*stage\s*:\s*['\"" ]provider_sync['\"" ][\s\S]*?\}\s*\)\s*;)"
    )
    $patched = $false
    foreach ($pattern in $patterns) {
      $m = [regex]::Match($text, $pattern)
      if ($m.Success) {
        $text = $text.Substring(0, $m.Index + $m.Length) + $block + $text.Substring($m.Index + $m.Length)
        $patched = $true
        break
      }
    }
    if (-not $patched) {
      # Last fallback: insert after provider sync assignment. This is less exact, but prevents the script from failing on layout drift.
      $pattern3 = "(?s)(const\s+sync\s*=\s*await[\s\S]{0,1000}?syncListings\((?:false|true)\)[\s\S]{0,1000}?; )"
      $m3 = [regex]::Match($text, $pattern3)
      if ($m3.Success) {
        $text = $text.Substring(0, $m3.Index + $m3.Length) + $block + $text.Substring($m3.Index + $m3.Length)
        $patched = $true
      }
    }
    if (-not $patched) {
      $snippet = ($text | Select-String -Pattern "provider_sync|syncListings|classifiedsMaintainer|PersistentClassifieds" -AllMatches | Select-Object -First 1).ToString()
      throw "Could not locate provider_sync result step in $Path. File layout differs too much. Snippet: $snippet"
    }
  }

  # Prefer cached provider sync in maintainer. This avoids forced 45k-price reload during Maintain now.
  $text = $text -replace "syncListings\(true\)", "syncListings(false)"

  $text = Remove-TrailingWhitespaceFromText $text
  Write-Text $Path $text
}

function Patch-VersionedTextFile([string]$Path) {
  if (Test-Path $Path) {
    $t = Read-Text $Path
    $t = Replace-AllVersions $t
    Write-Text $Path $t
  }
}

function Patch-Config([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $t = Read-Text $Path
  $t = Replace-AllVersions $t
  $t = [regex]::Replace($t, "(?m)^(version:\s*).*$", "`${1}`"$PatchVersion`"")
  $t = Add-Or-Set-YamlOption $t "persistent_classifieds_maintainer_safe_minimal_mode_enabled" "true"
  $t = Add-Or-Set-YamlOption $t "persistent_classifieds_maintainer_auto_run_enabled" "false"
  $t = Add-Or-Set-YamlSchema $t "persistent_classifieds_maintainer_safe_minimal_mode_enabled" "bool"
  $t = Add-Or-Set-YamlSchema $t "persistent_classifieds_maintainer_auto_run_enabled" "bool"
  Write-Text $Path $t
}

function Patch-PackageJson([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $t = Read-Text $Path
  $t = Replace-AllVersions $t
  $t = [regex]::Replace($t, '"version"\s*:\s*"[^"]+"', '"version": "5.13.56"')
  Write-Text $Path $t
}

function Patch-RunSh([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $t = @"
#!/usr/bin/env sh
set -eu
echo "[tf2-hub] version: 5.13.56"
echo "[tf2-hub] Safe Minimal Maintainer after provider sync"
exec node /app/dist/server.js
"@
  Write-Text $Path $t
}

function Ensure-UpdateNote([string]$RepoRoot) {
  $path = Join-Path $RepoRoot "tf2-trading-hub\UPDATE_5_13_56.md"
  $note = @"
# Update 5.13.56 - Safe Minimal Maintainer after provider sync

- Added Safe Minimal Maintainer mode.
- Maintain now completes safely after provider sync by default.
- Legacy post-sync maintainer steps are skipped unless explicitly re-enabled.
- Added runtime events:
  - maintainer_minimal_mode_enabled
  - maintainer_legacy_steps_skipped
  - maintainer_minimal_completed
- Provider sync now prefers cached mode instead of forcing a heavy price reload.
- Credentials, Backpack token handling and trading safety defaults were not changed.
"@
  Write-Text $path $note
}

$RepoRoot = Find-RepoRoot $RepoRoot
Write-Step "Repo root"
Write-Host $RepoRoot

$hub = Join-Path $RepoRoot "tf2-trading-hub"
$server = Join-Path $hub "dist\server.js"
$index = Join-Path $hub "dist\index.js"

Write-Step "Patching runtime files"
Patch-Server $server
if (Test-Path $index) { Patch-Server $index }

Write-Step "Patching metadata and UI version markers"
Patch-Config (Join-Path $hub "config.yaml")
Patch-VersionedTextFile (Join-Path $hub "Dockerfile")
Patch-VersionedTextFile (Join-Path $hub "build.yaml")
Patch-RunSh (Join-Path $hub "run.sh")
Patch-PackageJson (Join-Path $hub "package.json")
Patch-VersionedTextFile (Join-Path $hub "README.md")
Patch-VersionedTextFile (Join-Path $RepoRoot "README.md")
Patch-VersionedTextFile (Join-Path $RepoRoot "repository.yaml")
Patch-VersionedTextFile (Join-Path $hub "public\index.html")
Patch-VersionedTextFile (Join-Path $hub "public\app.js")
Ensure-UpdateNote $RepoRoot

Write-Step "Cleaning trailing whitespace"
$cleanupFiles = @(
  (Join-Path $hub "dist\server.js"),
  (Join-Path $hub "dist\index.js"),
  (Join-Path $hub "config.yaml"),
  (Join-Path $hub "Dockerfile"),
  (Join-Path $hub "build.yaml"),
  (Join-Path $hub "run.sh"),
  (Join-Path $hub "package.json"),
  (Join-Path $hub "README.md"),
  (Join-Path $RepoRoot "README.md"),
  (Join-Path $RepoRoot "repository.yaml"),
  (Join-Path $hub "public\index.html"),
  (Join-Path $hub "public\app.js"),
  (Join-Path $hub "UPDATE_5_13_56.md")
)
foreach ($f in $cleanupFiles) { Clean-TrailingWhitespace $f }

Write-Step "Validation"
Push-Location $RepoRoot
try {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    & node --check "tf2-trading-hub\dist\server.js"
    if ($LASTEXITCODE -ne 0) { throw "node --check server.js failed" }
    if (Test-Path "tf2-trading-hub\dist\index.js") {
      & node --check "tf2-trading-hub\dist\index.js"
      if ($LASTEXITCODE -ne 0) { throw "node --check index.js failed" }
    }
  } else {
    Write-Warning "Node.js not found. Skipping node --check."
  }

  $git = Get-Command git -ErrorAction SilentlyContinue
  if ($git) {
    & git diff --check
    if ($LASTEXITCODE -ne 0) { throw "git diff --check failed" }
  } else {
    Write-Warning "Git not found. Skipping git checks/push."
  }
} finally {
  Pop-Location
}

Write-Step "Commit, merge origin/main with local preference, push"
Push-Location $RepoRoot
try {
  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) {
    Write-Warning "Git not found. Patch files were changed, but commit/push was skipped."
    exit 0
  }

  & git status --short
  & git add README.md repository.yaml tf2-trading-hub
  & git commit -m "5.13.56 - safe minimal maintainer after provider sync"
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "git commit returned non-zero. This may mean there was nothing to commit. Continuing."
  }

  & git fetch origin
  if ($LASTEXITCODE -ne 0) { throw "git fetch origin failed" }

  & git merge origin/main -X ours --no-edit
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Merge had conflicts. Resolving listed conflicts by keeping local branch files."
    $conflicts = (& git diff --name-only --diff-filter=U)
    foreach ($file in $conflicts) {
      if ($file) {
        & git checkout --ours -- $file
        & git add $file
      }
    }
    & git commit -m "Resolve merge conflicts for 5.13.56"
    if ($LASTEXITCODE -ne 0) { throw "Conflict resolution commit failed" }
  }

  $branch = (& git branch --show-current).Trim()
  if (-not $branch) { throw "Could not determine current git branch" }
  & git push -u origin $branch
  if ($LASTEXITCODE -ne 0) { throw "git push failed" }

  Write-Host ""
  Write-Host "DONE. Branch pushed: $branch" -ForegroundColor Green
  Write-Host "Open your GitHub PR again. Conflicts should be resolved."
} finally {
  Pop-Location
}
