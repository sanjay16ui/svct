@echo off
echo ====================================
echo   Larkspur Crochets - First Setup
echo ====================================
echo.

echo [1/4] Installing root dependencies...
call npm install

echo [2/4] Installing backend dependencies...
cd backend
call npm install
echo Resetting admin credentials...
call node reset-admin.js
cd ..

echo [3/4] Installing frontend dependencies...
(no separate frontend folder - already at root)

echo [4/4] Starting servers...
start cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak
start cmd /k "vite"

echo.
echo ====================================
echo Open: http://localhost:5173
echo Admin: sathurika / sathu@2004
echo ====================================
pause
