#!/bin/bash
echo "=== Larkspur Crochets Setup ==="
echo "[1/3] Installing root dependencies..."
npm install
echo "[2/3] Installing backend dependencies..."
cd backend
npm install
node reset-admin.js
cd ..
echo "[3/3] Starting servers..."
cd backend && node server.js &
cd ..
npx vite &
echo "Open: http://localhost:5173"
echo "Admin: sathurika / sathu@2004"
