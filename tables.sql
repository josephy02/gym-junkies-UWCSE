CREATE TABLE products(
   id             INTEGER PRIMARY KEY AUTOINCREMENT,
   name TEXT,
   price INTEGER,
   type TEXT,
   attributes TEXT,
   description TEXT,
);

CREATE TABLE inventory(
   size           TEXT,
   product_size_inventory         INTEGER,
   item_id INTEGER,
   FOREIGN KEY(item_id) REFERENCES products(id)
);

CREATE TABLE transactions(
   transaction_id             INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id           INTEGER,
   product_id INTEGER,
   FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE users(
   user_id             INTEGER PRIMARY KEY AUTOINCREMENT,
   username          TEXT,
   password  TEXT,
   FOREIGN KEY(user_id) REFERENCES transactions(user_id)
);

CREATE TABLE reviews(
   review_id             INTEGER PRIMARY KEY AUTOINCREMENT,
   product_id INTEGER,
   username          TEXT,
   rating  INTEGER,
   text_review TEXT,
   FOREIGN KEY(username) REFERENCES users(username),
   FOREIGN KEY(	product_id) REFERENCES products(id)
);