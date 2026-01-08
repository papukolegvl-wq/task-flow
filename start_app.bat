@echo off
echo Starting TaskFlow Application...
echo The application will open in your default browser.
call npm install
call npm run dev -- --open
pause
