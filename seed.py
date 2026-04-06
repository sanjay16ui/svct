import sqlite3

db = sqlite3.connect('backend/larkspur.db')
c = db.cursor()
c.execute('SELECT COUNT(*) FROM products')
print('Before:', c.fetchone()[0])
c.execute("INSERT INTO products (title, price, category, image_url) VALUES ('Crochet Bag', 499, 'Accessories', 'uploads/placeholder.jpg'), ('Handmade Art', 299, 'Art', 'uploads/placeholder.jpg'), ('Cozy Blanket', 799, 'Cozy Things', 'uploads/placeholder.jpg'), ('Crochet Set', 599, 'Crochet Sets', 'uploads/placeholder.jpg'), ('Special Piece', 999, 'Special Edition', 'uploads/placeholder.jpg')")
db.commit()
c.execute('SELECT COUNT(*) FROM products')
print('After:', c.fetchone()[0])
db.close()
