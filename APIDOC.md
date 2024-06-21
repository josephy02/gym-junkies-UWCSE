# *Gym E-commerce Website* API Documentation
*This API is responsible for providing the necessary endpoints for managing products
and orders.*

## *Grabbing all products*
**Request Format:** */getAllProducts*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *This is our endpoint to retrieve all items in out database*

**Example Request:** */getAllProducts*

**Example Response:**


```json
{
  "products": [
    {
      "id": 1,
      "name": "Women's leggings",
      "price": 49.99,
      "rating": 5,
    },
    {
      "id": 2,
      "name": "Women's shorts",
      "price": 39.99,
      "rating": 4,
    },
  ]
}
```
**Error Handling:**
*500 status code and a server error message*

## *Check user login status*
**Request Format:** */login*

**Request Type:** *POST*

**Returned Data Format**: text

**Description:** *This endpoint checks to ensure that the user inputs the correct username and password. The endpoint returns the username.*

**Example Request:** */login *

**Example Response:**

```text
johnsmith

```
**Error Handling:**
*400 status code if username or password not put in*
*400 status code if username or password don't exist*


## *Confirming a users purchase*
**Request Format:** */confirmPurchase/:product/:username*

**Request Type:** *GET*

**Returned Data Format**: text

**Description:** * This endpoint confirms the selection of a product. It checks if there is sufficient inventory and if the user is logged in. If both are true, it enables the buying endpoint. *

**Example Request:** */confirmPurchase/2/johnsmith*

**Example Response:**

```text
Click Buy Iten to check out.

```

**Error Handling:**
*400 status code if item is out of stock or user is not logged in*
*500 status code if there is a server error in getting data.


## *Allows Users to Buy Products*
**Request Format:** */buy*

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Description:** *This endpoint allows users to buy a product and generates a unique transaction ID, subtracts 1 from inventory*

**Example Request:** */buy*

**Example Response:**

```text
Transaction sucessful. Your transaction ID is 18.
```
**Error Handling:**
*500 status code if server fails (checking login and inventory already handled in confirmation endpoint)*


## *Look at individual product details*
**Request Format:** */getAllProducts/:product*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *This endpoint retreives additional information about a product when it is clicked on.*

**Example Request:** */getAllProducts/2*

**Example Response:**

```json
{
  "description": "- Body fit\n- Seamless shorts\n- Seamless rib to waistband\n- High build seamless line to back\n- Heat-sealed logo to left hip\n- Sweat-wicking fabric\n- 93% Nylon 7% Elastane",
  "sizes": [
    {
      "size": "S"
    },
    {
      "size": "M"
    },
    {
      "size": "L"
    }
  ],
  "name": "Women's shorts",
  "price": 39.99,
  "id": 2,
  "reviews": [
    {
      "username": "johnsmith",
      "rating": 5,
      "text_review": "loved these"
    },
    {
      "username": "johnsmith",
      "rating": 5,
      "text_review": "loved these"
    },
    {
      "username": "johnsmith",
      "rating": 5,
      "text_review": "loved these"
    }
  ]
}
```
**Error Handling:**
*500 status code if product doesn't exist*


## *Retrieves user transaction history*
**Request Format:** */login/:user*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Allows users to access previous transaction history*

**Example Request:** */login/johnsmith*

**Example Response:**
```json
{
  "products": [
    {
      "name": "women's shorts",
      "transaction ID": 1,
    },
    {
      "name": "sports bra",
      "item-name": 2,
    },
  ]
}

```
**Error Handling:**
*400 status code if user not logged in*
*500 status code if server fails*


## *Access Transaction History*
**Request Format:** */getAllProducts/leaveReview/:product/:username*

**Request Type:** *POST*

**Returned Data Format**: JSON

**Description:** *This endpoint allows users to leave reviews on a product. It allows them to leave both a numerical rating and a text review.*

**Example Request:** *getAllProducts/leaveReview/10/johnsmith*

**Example Response:**

```json
{
  "username": "johnsmith",
  "rating": 5,
  "text_review": "epic"
}
```
**Error Handling:**
*400 status code if missing one or more of the required parameters*
*500 status code if the user doesn't exist*


## *Create a New Account*
**Request Format:** */createAccount*

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Description:** *This endpoint allows the user to create a new account*

**Request Body**
 - 'username': ...
 - 'password': ...
 - 'email': ...

**Example Request:** */createAccont*

**Example Response:**

```Text
New account with username: joeyared and email: joey@gmail.com created successfully.
```
**Error Handling:**
*400 status code if user already exists *
*500 internal server error*