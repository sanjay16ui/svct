const db = require('better-sqlite3')('larkspur.db');

console.log('\n=== TABLES ===');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());

console.log('\n=== USERS ===');
console.log(db.prepare('SELECT id, username, email, role FROM users').all());

console.log('\n=== PRODUCTS ===');
try { console.log(db.prepare('SELECT id, name, price FROM products').all()); }
catch(e) { console.log('No products table'); }

console.log('\n=== ORDERS ===');
try { console.log(db.prepare('SELECT id, user_id, status FROM orders').all()); }
catch(e) { console.log('No orders table'); }

console.log('\n=== WISHLIST ===');
try { console.log(db.prepare('SELECT * FROM wishlist').all()); }
catch(e) { console.log('No wishlist table'); }
