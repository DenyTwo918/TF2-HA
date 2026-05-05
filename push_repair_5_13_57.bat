@echo off
echo === TF2-HA 5.13.57 repair helper ===
echo Copy this BAT and PS1 into the TF2-HA repo root, then run this BAT.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply_repair_5_13_57.ps1"
echo.
pause
