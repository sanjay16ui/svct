const Database = require('better-sqlite3');
const db = new Database('larkspur.db');

console.log('\n========== ALL TABLES ==========');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());

console.log('\n========== ALL USERS (with login info) ==========');
try {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all();
  users.forEach(u => console.log(u));
} catch(e) { console.log('ERROR:', e.message); }

console.log('\n========== ALL PRODUCTS ==========');
try {
  const products = db.prepare('SELECT id, title, price, stock, created_at FROM products').all();
  products.forEach(p => console.log(p));
} catch(e) { console.log('No products table'); }

console.log('\n========== ALL ORDERS ==========');
try {
  const orders = db.prepare('SELECT id, user_id, status, total, created_at FROM orders').all();
  orders.forEach(o => console.log(o));
} catch(e) { console.log('No orders table'); }

console.log('\n========== ALL WISHLIST ==========');
try {
  const w = db.prepare('SELECT * FROM wishlist').all();
  w.forEach(i => console.log(i));
} catch(e) { console.log('No wishlist table'); }

console.log('\n========== ROW COUNT SUMMARY ==========');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as total FROM ${t.name}`).get();
    console.log(`${t.name}: ${count.total} rows`);
  } catch(e) {}
});

console.log('\n========== DB CHECK COMPLETE ==========\n');
