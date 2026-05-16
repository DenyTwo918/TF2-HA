@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo.
echo === TF2-HA patch 5.13.47 push helper - NO NODE REQUIRED ===
echo This script copies patched files, commits and pushes to GitHub.
echo It skips Node.js syntax checks when Node is not installed.
echo.

where git >nul 2>nul || (
  echo ERROR: Git is not installed or not in PATH.
  echo Install Git for Windows, or push manually with GitHub Desktop.
  pause
  exit /b 1
)

set "PATCH_DIR=%~dp0"
if not exist "%PATCH_DIR%tf2-trading-hub\config.yaml" (
  echo Patched tf2-trading-hub folder was not found next to this BAT.
  echo Enter the FULL path to the extracted patch folder that contains tf2-trading-hub.
  echo Example: C:\Users\danie\Downloads\TF2-HA-5_13_47-operation-single-flight-lock-full
  set /p PATCH_DIR=Patch folder path: 
  if not "!PATCH_DIR:~-1!"=="\" set "PATCH_DIR=!PATCH_DIR!\"
)

if not exist "%PATCH_DIR%tf2-trading-hub\config.yaml" (
  echo ERROR: Patch folder is invalid. Missing tf2-trading-hub\config.yaml
  pause
  exit /b 1
)

set "REPO_DIR=%CD%"
git -C "%REPO_DIR%" rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo This current folder is not an active Git repo.
  echo Enter the FULL path to your real TF2-HA repository folder.
  echo Example: C:\Users\danie\Desktop\TF2 HA
  set /p REPO_DIR=Repo path: 
)

git -C "%REPO_DIR%" rev-parse --is-inside-work-tree >nul 2>nul || (
  echo ERROR: That repo path is not a Git repo.
  pause
  exit /b 1
)

if not exist "%REPO_DIR%\tf2-trading-hub" (
  echo ERROR: tf2-trading-hub folder not found in repo path.
  pause
  exit /b 1
)

echo.
echo Patch folder: %PATCH_DIR%
echo Repo folder:  %REPO_DIR%
echo.
echo [1/5] Copying patched files into repo...
copy /Y "%PATCH_DIR%tf2-trading-hub\config.yaml" "%REPO_DIR%\tf2-trading-hub\config.yaml" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\build.yaml" "%REPO_DIR%\tf2-trading-hub\build.yaml" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\package.json" "%REPO_DIR%\tf2-trading-hub\package.json" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\run.sh" "%REPO_DIR%\tf2-trading-hub\run.sh" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\dist\server.js" "%REPO_DIR%\tf2-trading-hub\dist\server.js" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\dist\index.js" "%REPO_DIR%\tf2-trading-hub\dist\index.js" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\public\app.js" "%REPO_DIR%\tf2-trading-hub\public\app.js" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\public\index.html" "%REPO_DIR%\tf2-trading-hub\public\index.html" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\README.md" "%REPO_DIR%\tf2-trading-hub\README.md" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\UPDATE_5_13_47.md" "%REPO_DIR%\tf2-trading-hub\UPDATE_5_13_47.md" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile" "%REPO_DIR%\tf2-trading-hub\Dockerfile" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.amd64" "%REPO_DIR%\tf2-trading-hub\Dockerfile.amd64" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.aarch64" "%REPO_DIR%\tf2-trading-hub\Dockerfile.aarch64" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.armhf" "%REPO_DIR%\tf2-trading-hub\Dockerfile.armhf" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.armv7" "%REPO_DIR%\tf2-trading-hub\Dockerfile.armv7" >nul
copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.i386" "%REPO_DIR%\tf2-trading-hub\Dockerfile.i386" >nul
copy /Y "%~f0" "%REPO_DIR%\push_patch_5_13_47_no_node.bat" >nul

echo.
echo [2/5] Optional JavaScript syntax check...
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Skipping node --check.
  echo Note: the patch was already checked before packaging.
) else (
  node --check "%REPO_DIR%\tf2-trading-hub\dist\server.js" || (echo server.js check failed.& pause& exit /b 1)
  node --check "%REPO_DIR%\tf2-trading-hub\dist\index.js" || (echo index.js check failed.& pause& exit /b 1)
  node --check "%REPO_DIR%\tf2-trading-hub\public\app.js" || (echo public app.js check failed.& pause& exit /b 1)
)

echo.
echo [3/5] Verifying 5.13.47 markers...
findstr /S /N /C:"5.13.47" "%REPO_DIR%\tf2-trading-hub\config.yaml" "%REPO_DIR%\tf2-trading-hub\package.json" "%REPO_DIR%\tf2-trading-hub\run.sh" "%REPO_DIR%\tf2-trading-hub\build.yaml" "%REPO_DIR%\tf2-trading-hub\public\index.html"
if errorlevel 1 (
  echo ERROR: Could not find 5.13.47 markers.
  pause
  exit /b 1
)

echo.
echo [4/5] Git status...
git -C "%REPO_DIR%" status --short

echo.
set /p CONFIRM=Commit and push patch 5.13.47 to GitHub? Type YES to continue: 
if /I not "%CONFIRM%"=="YES" (
  echo Cancelled. Files may be copied, but nothing was committed or pushed.
  pause
  exit /b 0
)

echo.
echo [5/5] Commit and push...
git -C "%REPO_DIR%" add tf2-trading-hub/config.yaml tf2-trading-hub/build.yaml tf2-trading-hub/Dockerfile tf2-trading-hub/Dockerfile.amd64 tf2-trading-hub/Dockerfile.aarch64 tf2-trading-hub/Dockerfile.armhf tf2-trading-hub/Dockerfile.armv7 tf2-trading-hub/Dockerfile.i386 tf2-trading-hub/package.json tf2-trading-hub/run.sh tf2-trading-hub/dist/server.js tf2-trading-hub/dist/index.js tf2-trading-hub/public/app.js tf2-trading-hub/public/index.html tf2-trading-hub/README.md tf2-trading-hub/UPDATE_5_13_47.md push_patch_5_13_47_no_node.bat
git -C "%REPO_DIR%" commit -m "TF2 Trading Hub 5.13.47 operation single-flight lock" || (
  echo Commit failed or there was nothing to commit.
  pause
  exit /b 1
)
git -C "%REPO_DIR%" push || (
  echo Push failed.
  pause
  exit /b 1
)

echo.
echo Done. Patch 5.13.47 pushed to GitHub.
pause
