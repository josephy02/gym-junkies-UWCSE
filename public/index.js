/**
 * Names: Joseph Yared, Mia Pekez
 * Date: December 8, 2023
 * Section: CSE 154 AA, AC
 * This is the index.js file for the final project.
 */

'use strict';
(function() {
  let productOnPageId = '';

  window.addEventListener('load', init);

  /**
   * setup the sign-in button on initial page load
   */
  function init() {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (elonger) => {
        elonger.preventDefault();
        signIn();
      });
    });
    id('search-bar').addEventListener('input', function() {
      if (id('search-bar').value.trim() !== '') {
        id('search-btn').disabled = false;
      } else {
        id('search-btn').disabled = true;
      }
    });
    id('search-btn').addEventListener('click', searchProducts);
    id('product-btn').addEventListener('click', loadProducts);
    id('login-btn').addEventListener('click', showLoginPage);
    id('submit-btn').addEventListener('click', submitNewReview);
    id('cancel-btn').addEventListener('click', clickingCancel);
    id('trans-btn').addEventListener('click', viewTransactions);
    id('home-btn').addEventListener('click', clickingHome);
    id('product-btn').addEventListener('click', clickingProducts);
    id('newacct-btn').addEventListener('click', clickingNewUser);
    id('new-user-cancel-btn').addEventListener('click', clickingCancel);
    id('filter-btn').addEventListener('click', applyFilter);
    id('list-view-btn').addEventListener('click', () => toggleLayout('list-view'));
    id('grid-view-btn').addEventListener('click', () => toggleLayout('grid-view'));
    id('product-view').classList.add('hidden');
  }

  /**
   * This function toggles the layout of the webpage.
   * @param {String} layout - selected view type
   */
  function toggleLayout(layout) {
    let productView = id('product-view');
    productView.classList.remove('list-view', 'grid-view');
    productView.classList.add(layout);
  }

  /**
   * Handles clicking on the login button.
   */
  function showLoginPage() {
    id('transaction-history-view').classList.add('hidden');
    id('main-view').classList.add('hidden');
    id('header-image').classList.add('hidden');
    id('product-view').classList.add('hidden');
    id('profile-container').classList.add('hidden');
    id('login-view-section').classList.remove('hidden');
    id('product-details-view').classList.add('hidden');
  }

  /**
   * Makes a fetch request to /login.
   */
  async function signIn() {
    id('transaction-history-view').classList.add('hidden');
    id('login-view-section').classList.remove('hidden');
    try {
      let username = id('username-input').value;
      let password = id('password-input').value;
      let data = new FormData();
      data.append('username', username);
      data.append('password', password);
      let response = await fetch('/login', {method: 'POST', body: data});
      let loginData = await response.json();
      let savedUser = loginData.user[0].username;
      sessionStorage.setItem("username", savedUser);
      await statusCheck(response);
      displayLoginMessage(savedUser);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function displays the login message.
   * @param {string} savedUser - saved user's username
   */
  function displayLoginMessage(savedUser) {
    if (savedUser) {
      let loginText = gen('p');
      loginText.textContent = savedUser + " has successfully logged in!";
      id('login').appendChild(loginText);
    }
  }

  /**
   * Handles loading in all the products
   */
  async function loadProducts() {
    try {
      let response = await fetch('/getAllProducts');
      statusCheck(response);
      let data = await response.json();
      displayProducts(data);
      return data;
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Shows product on the product-view page
   * @param {JSON} data - response from fetch request to /getAllProducts.
   */
  function displayProducts(data) {
    id('search-bar').classList.remove('hidden');
    id('search-btn').classList.remove('hidden');
    id('main-view').classList.add('hidden');
    id('header-image').classList.add('hidden');
    id('login-view-section').classList.add('hidden');
    id('product-view').classList.remove('hidden');
    for (let i = 0; i < data.products.length; i++) {
      let prodArticle = gen('article');
      prodArticle.classList.add('card');
      prodArticle.id = data.products[i].id;
      let productName = gen('p');
      productName.classList.add('product-name');
      productName.textContent = data.products[i].name;
      let prodInfo = gen('div');
      prodInfo.classList.add('product-info');
      let image = gen('img');
      let imageNameRaw = data.products[i].name;
      let imgName = nameToPng(imageNameRaw);
      image.src = `img/${imgName}.png`;
      let price = gen('p');
      price.textContent = '$' + data.products[i].price;
      let rating = gen('p');
      rating.textContent = data.products[i].rating;
      prodArticle.appendChild(image);
      prodArticle.appendChild(productName);
      prodArticle.appendChild(price);
      prodArticle.appendChild(rating);
      id('product-view').appendChild(prodArticle);
      prodArticle.addEventListener('click', displayItem);
    }
  }

  /**
   * Filters the available products based on category or type.
   * @param {string} filter - selected category to filter by.
   */
  async function applyFilter() {
    let selectType = id('type-dropdown').value;
    try {
      let response = await fetch('/getAllProducts' + `?filter=${selectType}`);
      await statusCheck(response);
      let data = await response.json();
      foundProducts(data);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Grabs and displays individual item view.
   *
   */
  async function displayItem() {
    try {
      let productId = this.id;
      let response = await fetch(`/getAllProducts/${productId}`);
      statusCheck(response);
      let prodInfo = await response.json();
      populateIndividualView(prodInfo);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function populates each product's individual view with
   * additional information and corresponding reviews.
   * @param {JSON} prodInfo - response from fetch request to /getAllProducts/:product.
   */
  function populateIndividualView(prodInfo) {
    id('product-view').innerHTML = '';
    id('main-view').classList.add('hidden');
    id('header-image').classList.add('hidden');
    id('login-view-section').classList.add('hidden');
    id('product-view').classList.add('hidden');
    id('product-details-view').classList.remove('hidden');
    let prodArticle = gen('article');
    prodArticle.classList.add('ind-view');
    prodArticle.id = prodInfo.id;
    let productName = gen('p');
    productName.textContent = prodInfo.name;
    let productDescription = gen('p');
    productDescription.textContent = prodInfo.description;
    let price = gen('p');
    let productPrice = prodInfo.price;
    price.textContent = productPrice;
    let image = gen('img');
    let imageNameRaw = prodInfo.name;
    let imgName = nameToPng(imageNameRaw);
    image.src = `img/${imgName}.png`;
    let selectButton = gen('button');
    let buyButton = gen('button');
    selectButton.id = prodInfo.id;
    selectButton.classList.add('select-btn');
    selectButton.textContent = "Select item";
    selectButton.addEventListener('click', confirmPurchase);
    buyButton.id = prodInfo.id;
    buyButton.classList.add('buy-btn');
    buyButton.textContent = "Purchase item";
    buyButton.disabled = true;
    prodArticle.appendChild(image);
    prodArticle.appendChild(productName);
    prodArticle.appendChild(productDescription);
    prodArticle.appendChild(price);
    prodArticle.appendChild(selectButton);
    prodArticle.appendChild(buyButton);
    id('product-details-view').insertBefore(prodArticle, id('new-review'));
    if (prodInfo.reviews && prodInfo.reviews.length > 0) {
      let reviewList = gen('div');
      reviewList.classList.add('feedback-section');
      for (let i = 0; i < prodInfo.reviews.length; i++) {
        let reviewElt = gen('div');
        let userP = gen('p');
        let reviewUsername = prodInfo.reviews[i].username;
        userP.textContent = "username: " + reviewUsername;
        let ratingP = gen('p');
        let reviewRating = prodInfo.reviews[i].rating;
        ratingP.textContent = "rating: " + reviewRating;
        let textReviewP = gen('p');
        let textReview = prodInfo.reviews[i].text_review;
        textReviewP.textContent = "review: " + textReview;
        reviewElt.appendChild(ratingP);
        reviewElt.appendChild(userP);
        reviewElt.appendChild(textReviewP);
        reviewElt.classList.add('review');
        id('product-details-view').appendChild(reviewElt);
        id('product-details-view').insertBefore(reviewElt, id('new-review'));
      }
    }
  }

  /**
   * Searches for products based on input into search bar.
   */
  async function searchProducts() {
    try {
      let searchterm = id('search-bar').value;
      let response = await fetch('/getAllProducts' + `?search=${searchterm}`);
      await statusCheck(response);
      const searchedProducts = await response.json();
      foundProducts(searchedProducts);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function shows the prodcuts that matched the search.
   * @param {JSON} searchedProducts - the IDs of the products that match the search.
   */
  function foundProducts(searchedProducts) {
    let productsOnPage = qsa('#product-view .card');
    for (let i = 0; i < productsOnPage.length; i++) {
      let found = false;
      for (let j = 0; j < searchedProducts.products.length; j++) {
        let searchedProductId = parseInt(searchedProducts.products[j].id);
        productOnPageId = parseInt(productsOnPage[i].id);
        if (searchedProductId === productOnPageId) {
          productsOnPage[i].classList.remove('hidden');
          found = true;
        }
      }
      if (!found) {
        productsOnPage[i].classList.add('hidden');
      }
    }
  }

  /**
   * Sends request to POST endpoint /getAllProducts/leaveReview/:product/:username.
   */
  async function submitNewReview() {
    try {
      let productId = qs('#product-details-view article').id;
      let username = sessionStorage.getItem("username");
      let data = new FormData();
      let rating = id('rating').value;
      let textReview = id('text-review').value;
      data.append('rating', rating);
      data.append('review', textReview);
      let response = await fetch(`/getAllProducts/leaveReview/${productId}/${username}`,
      {method: 'POST', body: data});
      await statusCheck(response);
      const newReview = await response.json();
      addNewReview(newReview);
      setTimeout(() => {
      }, 2000);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * Appends the new comment onto the page.
   * @param {JSON} newReview - content of new review
   */
  function addNewReview(newReview) {
    let reviewContainer = gen('article');
    let newReviewUser = gen('p');
    newReviewUser.textContent = newReview.username;
    let newReviewRating = gen('p');
    newReviewRating.textContent = newReview.rating;
    let newReviewText = gen('p');
    newReviewText.textContent = newReview.text_review;
    reviewContainer.appendChild(newReviewUser);
    reviewContainer.appendChild(newReviewRating);
    reviewContainer.appendChild(newReviewText);
    id('product-details-view').insertBefore(reviewContainer, id('new-review'));
  }

  /**
   * This function makes a fetch request to GET endpoint /login/:user
   */
  async function viewTransactions() {
    try {
      let user = sessionStorage.getItem("username");
      let response = await fetch(`/login/${user}`);
      await statusCheck(response);
      const transactionHistory = await response.json();
      displayTransactions(transactionHistory);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function displays the user's transaction history.
   * @param {JSON} transactionHistory- content of user's transaction history
   */
  function displayTransactions(transactionHistory) {
    id('login-view-section').classList.add('hidden');
    id('product-view').classList.add('hidden');
    id('main-view').classList.add('hidden');
    id('header-image').classList.add('hidden');
    id('transaction-history-view').classList.remove('hidden');
    for (let i = 0; i < transactionHistory.length; i++) {
      let transactionContainer = gen('article');
      let transactionIdP = gen('p');
      let transactionProduct = gen('p');
      let image = gen('img');
      let transactionId = transactionHistory[i].transaction_id;
      transactionIdP.textContent = "Transaction ID: " + transactionId;
      let productName = transactionHistory[i].name;
      let imgName = nameToPng(productName);
      image.src = `img/${imgName}.png`;
      transactionProduct.textContent = productName;
      transactionContainer.appendChild(image);
      transactionContainer.appendChild(transactionIdP);
      transactionContainer.appendChild(transactionProduct);
      transactionContainer.classList.add('transaction');
      qs('#transaction-history-view').appendChild(transactionContainer);
    }
  }

  /**
   * This determines the behavior of clicking the create new user tab.
   */
  function clickingNewUser() {
    id('new-user-view').classList.remove('hidden');
    id('main-view').classList.add('hidden');
    id('header-image').classList.add('hidden');
    id('new-user-submit').addEventListener('click', createNewUser);
    id('product-view').classList.add('hidden');
    id('product-details-view').classList.add('hidden');
    id('login-view-section').classList.add('hidden');
    id('transaction-history-view').classList.add('hidden');
  }

  /**
   * This makes a fetch request to /createAccount
   */
  async function createNewUser() {
    try {
      let data = new FormData();
      let username = id('new-username').value;
      let password = id('new-password').value;
      let email = id('new-email').value;
      data.append('username', username);
      data.append('password', password);
      data.append('email', email);
      let response = await fetch('/createAccount', {method: 'POST', body: data});
      await statusCheck(response);
      const newUser = await response.json();
      displayNewUser(newUser);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function makes fetch request to /confirmPurchase/:product/:username
   */
  async function confirmPurchase() {
    let product = this.id;
    let username = sessionStorage.getItem("username");
    try {
      let response = await fetch(`confirmPurchase/${product}/${username}`);
      await statusCheck(response);
      const confirmation = await response.text();
      displayConfirmationMessage(confirmation);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function displays the purchase confirmation message on screen.
   * @param {text} confirmation - text response from fetch request to
   * confirmPurchase/:product/:username
   */
  function displayConfirmationMessage(confirmation) {
    let confMessage = gen('p');
    confMessage.textContent = confirmation;
    confMessage.classList.add('conf-message');
    qs('.ind-view').appendChild(confMessage);
    qs('.select-btn').disabled = true;
    qs('.buy-btn').disabled = false;
    qs('.buy-btn').addEventListener('click', makePurchase);
  }

  /**
   * This function makes a fetch request to /buy.
   */
  async function makePurchase() {
    let data = new FormData();
    let username = sessionStorage.getItem('username');
    let productId = this.id;
    data.append('username', username);
    data.append('productId', productId);
    try {
      let response = await fetch('/buy', {method: 'POST', body: data});
      await statusCheck(response);
      const newTransaction = await response.text();
      displayNewTransaction(newTransaction);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function displays the successful transaction message.
   * @param {text} newTransaction - text response from fetch request to /buy
   */
  function displayNewTransaction(newTransaction) {
    let newTransText = gen('p');
    newTransText.textContent = newTransaction;
    qs('.ind-view').appendChild(newTransText);
    qs('.conf-message').classList.add('hidden');
  }

  /**
   * This function lets the user know they have created a new account successfully.
   */
  function displayNewUser() {
    id('new-user-view').classList.remove('hidden');
  }

  /**
   * This function determines behavior of clicking the cancel button on login page.
   */
  function clickingCancel() {
    id('login-view-section').classList.add('hidden');
    id('product-view').classList.remove('hidden');
    id('new-user-view').classList.add('hidden');
  }

  /**
   * This determines the behavior of clicking the home button.
   */
  function clickingHome() {
    id('product-view').innerHTML = '';
    id('header-image').classList.remove('hidden');
    id('main-view').classList.remove('hidden');
    id('login-view-section').classList.add('hidden');
    id('product-details-view').classList.add('hidden');
    id('transaction-history-view').classList.add('hidden');
    id('search-bar').classList.add('hidden');
    id('search-btn').classList.add('hidden');
    id('new-user-view').classList.add('hidden');
    id('new-review').classList.add('hidden');
    id('product-view').classList.add('hidden');
    id('list-view').classList.add('hidden');
    id('grid-view').classList.add('hidden');
  }

  /**
   * This determines the behavior of clicking on the products tab.
   */
  function clickingProducts() {
    id('transaction-history-view').classList.add('hidden');
    id('new-user-view').classList.add('hidden');
    id('product-details-view').classList.add('hidden');
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * This is a helper function for getting the image source for each user.
   * @param {string} name - name of user
   * @returns {string} nameLowercase - name in all lowercase with dashes instead of spaces
   */
  function nameToPng(name) {
    let nameLowercase = name.toLowerCase();
    if (nameLowercase.includes(' ')) {
      nameLowercase = nameLowercase.replace(/ /g, '-');
    }
    nameLowercase = nameLowercase.replace(/'/g, '');
    return nameLowercase;
  }

  /**
   * Takes in an error and returns a message
   * @param {error} err - recieved error
   */
  function handleError(err) {
    console.error(err);
    let message = document.createElement('p');
    message.textContent = 'Uh oh, something is wrong!';
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a list of HTML elements.
   * @param {String} selector - css selector to match element.
   * @returns {HTMLElement} -  list of elements.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Generates html element of specified tag name.
   * @param {*} tag - name of element you want to create.
   * @returns {HTMLElement} - the generated element.
   */
  function gen(tag) {
    return document.createElement(tag);
  }
})();