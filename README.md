# Larkspur Crochets

Handmade crochet e-commerce — fully portable, git-clone ready.

FIRST TIME SETUP:
  Windows → double-click start.bat
  Mac/Linux → bash start.sh

  Then open: http://localhost:5173
  Admin login: sathurika / sathu@2004
  (If login fails: cd backend && node reset-admin.js)

## Tech Stack
Frontend: React + TypeScript + Vite + Tailwind + Framer Motion + Three.js
Backend: Node.js + Express + SQLite (better-sqlite3) + Multer + bcrypt + JWT

## Run Locally
Requirements: Node.js v18+

Windows: double-click start.bat
Mac/Linux: bash start.sh

Manual:
  Terminal 1: cd backend && npm install && node server.js
  Terminal 2: cd frontend && npm install && npm run dev
  Open: http://localhost:5173

## Admin Login
URL: http://localhost:5173/admin
Username: sathurika
Password: sathu@2004
Reset: cd backend && node reset-admin.js

## Pages
/ — Home
/shop — Shop
/wishlist — Wishlist
/admin — Admin Panel
/login — Login

## Admin Panel Tabs
- Products: add/edit/delete products with images
- Orders: view and update order status
- Wish Orders: view custom crochet requests, reference files, reply to users
