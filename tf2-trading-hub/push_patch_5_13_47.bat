@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "PATCH_DIR=%~dp0"
set "REPO_DIR=%PATCH_DIR%"

echo.
echo === TF2-HA patch 5.13.47 push helper ===
echo This will copy/check patch files, commit and push to GitHub.
echo.
where git >nul 2>nul || (echo ERROR: Git is not installed or not in PATH. Install Git for Windows or use GitHub Desktop manually.& pause& exit /b 1)
where node >nul 2>nul || (echo ERROR: Node.js is not installed or not in PATH.& pause& exit /b 1)

git -C "%REPO_DIR%" rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo This folder is not an active Git repo.
  echo Enter the FULL path to your real TF2-HA repository folder, for example:
  echo C:\Users\danie\Desktop\TF2 HA
  set /p REPO_DIR=Repo path: 
  git -C "!REPO_DIR!" rev-parse --is-inside-work-tree >nul 2>nul || (echo ERROR: That path is not a Git repo.& pause& exit /b 1)
  echo.
  echo Copying patched files into !REPO_DIR! ...
  if not exist "!REPO_DIR!\tf2-trading-hub" (echo ERROR: tf2-trading-hub folder not found in repo path.& pause& exit /b 1)
  copy /Y "%PATCH_DIR%tf2-trading-hub\config.yaml" "!REPO_DIR!\tf2-trading-hub\config.yaml" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\build.yaml" "!REPO_DIR!\tf2-trading-hub\build.yaml" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\package.json" "!REPO_DIR!\tf2-trading-hub\package.json" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\run.sh" "!REPO_DIR!\tf2-trading-hub\run.sh" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\dist\server.js" "!REPO_DIR!\tf2-trading-hub\dist\server.js" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\dist\index.js" "!REPO_DIR!\tf2-trading-hub\dist\index.js" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\public\app.js" "!REPO_DIR!\tf2-trading-hub\public\app.js" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\public\index.html" "!REPO_DIR!\tf2-trading-hub\public\index.html" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\README.md" "!REPO_DIR!\tf2-trading-hub\README.md" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\UPDATE_5_13_47.md" "!REPO_DIR!\tf2-trading-hub\UPDATE_5_13_47.md" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile" "!REPO_DIR!\tf2-trading-hub\Dockerfile" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.amd64" "!REPO_DIR!\tf2-trading-hub\Dockerfile.amd64" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.aarch64" "!REPO_DIR!\tf2-trading-hub\Dockerfile.aarch64" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.armhf" "!REPO_DIR!\tf2-trading-hub\Dockerfile.armhf" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.armv7" "!REPO_DIR!\tf2-trading-hub\Dockerfile.armv7" >nul
  copy /Y "%PATCH_DIR%tf2-trading-hub\Dockerfile.i386" "!REPO_DIR!\tf2-trading-hub\Dockerfile.i386" >nul
  copy /Y "%PATCH_DIR%push_patch_5_13_47.bat" "!REPO_DIR!\push_patch_5_13_47.bat" >nul
)

echo.
echo Using repo: %REPO_DIR%
echo.
echo [1/5] Checking JavaScript syntax...
node --check "%REPO_DIR%\tf2-trading-hub\dist\server.js" || (echo server.js check failed.& pause& exit /b 1)
node --check "%REPO_DIR%\tf2-trading-hub\dist\index.js" || (echo index.js check failed.& pause& exit /b 1)
node --check "%REPO_DIR%\tf2-trading-hub\public\app.js" || (echo public app.js check failed.& pause& exit /b 1)

echo.
echo [2/5] Verifying version markers...
findstr /S /N /C:"5.13.47" "%REPO_DIR%\tf2-trading-hub\config.yaml" "%REPO_DIR%\tf2-trading-hub\package.json" "%REPO_DIR%\tf2-trading-hub\run.sh" "%REPO_DIR%\tf2-trading-hub\build.yaml" "%REPO_DIR%\tf2-trading-hub\public\index.html"

echo.
echo [3/5] Git status...
git -C "%REPO_DIR%" status --short

echo.
set /p CONFIRM=Commit and push patch 5.13.47 to GitHub? Type YES to continue: 
if /I not "%CONFIRM%"=="YES" (
  echo Cancelled. Nothing was committed or pushed.
  pause
  exit /b 0
)

echo.
echo [4/5] Commit...
git -C "%REPO_DIR%" add tf2-trading-hub/config.yaml tf2-trading-hub/build.yaml tf2-trading-hub/Dockerfile tf2-trading-hub/Dockerfile.amd64 tf2-trading-hub/Dockerfile.aarch64 tf2-trading-hub/Dockerfile.armhf tf2-trading-hub/Dockerfile.armv7 tf2-trading-hub/Dockerfile.i386 tf2-trading-hub/package.json tf2-trading-hub/run.sh tf2-trading-hub/dist/server.js tf2-trading-hub/dist/index.js tf2-trading-hub/public/app.js tf2-trading-hub/public/index.html tf2-trading-hub/README.md tf2-trading-hub/UPDATE_5_13_47.md push_patch_5_13_47.bat
git -C "%REPO_DIR%" commit -m "TF2 Trading Hub 5.13.47 operation single-flight lock" || (echo Commit failed or nothing to commit.& pause& exit /b 1)

echo.
echo [5/5] Push...
git -C "%REPO_DIR%" push || (echo Push failed.& pause& exit /b 1)

echo.
echo Done. Patch 5.13.47 pushed to GitHub.
pause
