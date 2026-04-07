@echo off
echo ====================================
echo   Larkspur Crochets - First Setup
echo ====================================
echo.
echo [1/3] Installing root dependencies...
call npm install
echo.
echo [2/3] Installing backend dependencies...
cd backend
call npm install
echo Resetting admin...
call node reset-admin.js
cd ..
echo.
echo [3/3] Starting servers...
start cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak
start cmd /k "cd /d %~dp0 && npx vite"
echo.
echo ====================================
echo Open: http://localhost:5173
echo Admin: sathurika / sathu@2004
echo ====================================
pause
