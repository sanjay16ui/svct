import db from './db.js';
console.log("TOTAL PRODUCTS BEFORE:", db.all("SELECT COUNT(*) AS count FROM products")[0].count);
const p = db.all("SELECT id, title, image_url FROM products");
console.log("PRODUCTS:", p);

if (p.length < 6) {
    console.log("Seeding...");
    db.run(`INSERT INTO products (title, price, category, image_url) VALUES 
      ('Crochet Bag', 499, 'Accessories', 'uploads/placeholder.jpg'),
      ('Handmade Art', 299, 'Art', 'uploads/placeholder.jpg'),
      ('Cozy Blanket', 799, 'Cozy Things', 'uploads/placeholder.jpg'),
      ('Crochet Set', 599, 'Crochet Sets', 'uploads/placeholder.jpg'),
      ('Special Piece', 999, 'Special Edition', 'uploads/placeholder.jpg')
    `);
    console.log("TOTAL AFTER:", db.all("SELECT COUNT(*) AS count FROM products")[0].count);
}
