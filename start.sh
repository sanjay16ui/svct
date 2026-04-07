#!/bin/bash
cd backend && npm install && node server.js &
cd frontend && npm install && npm run dev &
echo "Open http://localhost:5173"
