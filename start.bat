@echo off
echo Starting Larkspur Crochets...
cd backend && npm install
start cmd /k "cd backend && node server.js"
cd ../frontend && npm install
start cmd /k "cd frontend && npm run dev"
echo Open http://localhost:5173
pause
