/**
 * Names: Joseph Yared, Mia Pekez
 * Date: December 8, 2023
 * Section: CSE 154 AA, AC
 * This is the app.js file for the final project.
 */

'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * This endpoint retrieves all the products from gym.db. If there is a search parameter, it
 * filters the retrieved products to include only the ones that contain the search parameter.
 * Feature 1: display the items on a “main view” page
 * Feature 5: users must be able to search and filter the available items
 */
app.get('/getAllProducts', async (req, res) => {
  try {
    let db = await getDBConnection();
    let search = req.query.search;
    let filter = req.query.filter;
    if (search) {
      let searchResult = await db.all(`SELECT id
      FROM products WHERE attributes LIKE ?`, `%${search}%`);
      res.json({'products': searchResult});
    } else if (filter) {
      let filterResult = await db.all(`SELECT id FROM products
      WHERE (name = ? OR type = ? OR attributes = ?)`, [`${filter}`, `${filter}`, `${filter}`]);
      res.json({'products': filterResult});
    } else {
      let result = await db.all('SELECT * FROM products');
      res.json({'products': result});
    }
  } catch (err) {
    res.status(500).type('text').send('An error occurred on the server. Try again later.');
  }
});

/**
 * This endpoint is responsible for the user login
 * Feature 2: allow the user to login to their account
 */
app.post('/login', async (req, res) => {
  let db = await getDBConnection();
  let username = req.body.username;
  let password = req.body.password;
  try {
    if (username && password) {
      await db.all(`SELECT * FROM users WHERE username
      LIKE ? AND password LIKE ?`, [`${username}`, `${password}`]);
      await db.run('UPDATE users SET logged_in = ? WHERE username = ?', ["T", `${username}`]);
      let user = await db.all('SELECT username FROM users WHERE username = ?', `${username}`);
      res.type('text').send({'user': user});
    } else {
      res.type('text');
      res.status(400).send('missing username or password');
    }
  } catch (error) {
    res.status(400).send('username or password does not exist');
  }
});

/**
 * This endpoint confirms the selection of a product. It checks if there is sufficient inventory
 * and if the user is logged in. If both are true, it enables the buying endpoint.
 */
app.get('/confirmPurchase/:product/:username', async (req, res) => {
  let db = await getDBConnection();
  let product = req.params.product;
  let username = req.params.username;
  let isLoggedIn = await checkLogin(username);
  let inventoryCheck = await db.get(`SELECT product_size_inventory
  FROM inventory WHERE item_id = ?`, product);
  let inventory = JSON.stringify(inventoryCheck.product_size_inventory);
  try {
    if (isLoggedIn && inventoryCheck !== 0) {
      res.type('text').send('Click Buy Item to check out');
    } else {
      res.status(400).send('item out of stock or not logged in');
    }
  } catch (err) {
    res.status(500).send('server error');
  }
});

/**
 * This endpoint allows users to buy a product and generates a unique transaction ID.
 * Feature 4: users must be able to buy a product, enroll in a class, or reserve a service
 */
app.post('/buy', async (req, res) => {
  let db = await getDBConnection();
  let username = req.body.username;
  try {
    let productId = req.body.productid;
    let userID = await db.get("SELECT user_id FROM users WHERE username = ?", username);
    let userIDparsed = JSON.parse(userID.user_id);
    await db.run(`INSERT INTO transactions(product_id, user_id)
    VALUES(?, ?)`, [productId, userIDparsed]);
    let result = await db.run(`UPDATE inventory
    SET product_size_inventory = product_size_inventory - 1 WHERE item_id = ?`, productId);
    let lastID = result.lastID;
    res.type('text').send('Transaction successful. Your transaction ID is ' + lastID);
  } catch (error) {
    res.status(500).send('server error');
  }
});

/**
 * This endpoint retreives additional information about a product when it is clicked on.
 * Feature 3: clicking on any individual item should bring the user to a view which provides more detailed information about said item
 */
app.get('/getAllProducts/:product', async (req, res) => {
  try {
    let db = await getDBConnection();
    let product = req.params.product;
    let productView = await db.all(`SELECT products.id, products.description, inventory.size,
                                    inventory.product_size_inventory, products.name, products.price,
                                    reviews.username, reviews.rating, reviews.text_review
                                    FROM products
                                    JOIN inventory ON products.id = inventory.item_id
                                    JOIN reviews ON products.id = reviews.product_id
                                    WHERE products.id = ?`, [`${product}`]);
    let productDetails = {};
    productView.forEach(row => {
      const {description, size, inventory, name, price, id, username, rating, text_review} = row;
      if (!productDetails.description) {
        productDetails.description = description;
        productDetails.sizes = [];
        productDetails.name = name;
        productDetails.price = price;
        productDetails.id = id;
        productDetails.reviews = [];
      }
      productDetails.sizes.push({size, inventory});
      productDetails.reviews.push({username, rating, text_review});
    });
    res.json(productDetails);
  } catch (error) {
    res.status(500).type('text').send('Product does not exist.');
  }
});

/**
 * This endpoint retrieves user's transaction history.
 * Feature 6: users must be able to access all previous transactions
 */
app.get('/login/:user', async (req, res) => {
  let db = await getDBConnection();
  let username = req.params.user;
  try {
    let isLoggedIn = await checkLogin(username);
    if (isLoggedIn) {
      let transactionHistory = await db.all(`SELECT t.transaction_id, p.name
                                            FROM users u, transactions t, products p
                                            WHERE u.user_id = t.user_id
                                            AND t.product_id = p.id`);
      res.json(transactionHistory);
    } else {
      res.status(400).send('need to login to see transaction history');
    }
  } catch (error) {
    res.status(500).type('text').send('server error');
  }
});

/**
 * This endpoint allows users to leave reviews on a product. It allows them to leave both
 * a numerical rating and a text review.
 */
app.post('/getAllProducts/leaveReview/:product/:username', async (req, res) => {
  try {
    let db = await getDBConnection();
    let product = req.params.product;
    let username = req.params.username;
    let textReview = req.body.review;
    let productRating = req.body.rating;
    let isLoggedIn = await checkLogin(username);
    if (isLoggedIn && textReview && productRating) {
      let productIDObject = await db.all('SELECT id FROM products WHERE id = ?', `${product}`);
      let productID = productIDObject[0].id;
      let result = await db.run(`INSERT INTO reviews(product_id, username, text_review, rating)
      VALUES (?, ?, ?, ?)`, [parseInt(productID), username, textReview, productRating]);
      await db.run(`UPDATE products SET number_of_ratings = number_of_ratings + 1
      WHERE id = ?`, parseInt(productID));
      await db.run(`UPDATE products SET rating = (rating + ?)/(number_of_ratings)
      WHERE id = ?`, [productRating, parseInt(productID)]);
      let lastID = result.lastID;
      let newReview = await db.get(`SELECT username, rating, text_review
      FROM reviews WHERE review_id = ?`, [lastID]);
      await db.close();
      res.json(newReview);
    } else {
      res.status(400).type('text').send('Missing one or more of the required params.');
    }
  } catch (err) {
    res.status(500).send('Yikes. User does not exist.');
  }
});

/**
 * This endpoint allows the user to create a new account.
 */
app.post('/createAccount', async (req, res) => {
  try {
    let db = await getDBConnection();
    let newUsername = req.body.username;
    let newPassword = req.body.password;
    let newEmail = req.body.email;
    let existingUser = await db.get(`SELECT username, email FROM users
    WHERE username = ? OR email = ?`, [newUsername, newEmail]);
    if (existingUser) {
      res.status(400).send('username or email already exists');
    } else {
      let result = await db.run(`INSERT INTO users(username, password, email)
      VALUES(?, ?, ?)`, [newUsername, newPassword, newEmail]);
      let lastID = result.lastID;
      let newUserEntry = await db.get(`SELECT username, password, email
      FROM users WHERE user_id = ?`, `${lastID}`);
      res.type('text').send("New account with username: " + newUsername +
      " and email: " + newEmail + " created successfully");
    }
  } catch (err) {
    res.status(500).send("internal server error");
  }
});

/**
 * This is a helper function to check if the user is logged in.
 * @param {string} username - the username currently stored in session storage.
 * @returns {boolean} - true or false
 */
  async function checkLogin(username) {
    return new Promise(async (resolve, reject) => {
    try {
      let db = await getDBConnection();
      let response = await db.all(`SELECT username FROM users
      WHERE username = ? AND logged_in = ?`, [`${username}`, 'T']);
      resolve(response.length !== 0);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'gym.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);