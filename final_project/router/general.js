const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) {
    return res.status(404).send("You did not enter a username!")
  }

  if (!password) {
    return res.status(400).send("You did not enter a password!")
  }

  const userExistsAlready = users.find(user => user.username === username);

  if (username && password) {
    if (userExistsAlready) {
        return res.status(400).send(`A user with a username of ${username} already exists!`)
    } else {
        users.push({"username": username, "password": password});
        return res.send("You have successfully registered!")
    }
  }
});

const bookListPromise = new Promise((resolve,reject) => {
    if (books) {
        resolve(books);
    } else {
        reject(books);
    } 
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    bookListPromise
        .then((books) => {
            return res.json(books);
        })
        .catch((err) => {
            return res.status(500).send(err);
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const queriedISBN = req.params.isbn;
  bookListPromise
        .then((books) => {
            return res.send(books[queriedISBN]);
        })
        .catch(err => {
            return res.status(500).send(err);
        })
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const queriedAuthor = req.params.author;
  let booksArr = [];

  bookListPromise
    .then(books => {
        for (let book in books) {
            if (books[book].author === queriedAuthor) {
                booksArr.push(books[book])
            }
            }
        
            if (booksArr.length > 0) {
            return res.send(booksArr);
            } else {
            return res.status(400).send(`There is no book available by the author: ${queriedAuthor}`)
        }
    })
    .catch(err => {
        return res.status(500).send(err)
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const queriedTitle = req.params.title;
  let booksArr = [];

  bookListPromise
    .then((books) => {
        for (let book in books) {
            if (books[book].title === queriedTitle) {
                booksArr.push(books[book]);
            }
          }
        
          if (booksArr.length > 0) {
            return res.send(booksArr);
          } else {
            return res.status(400).send(`There is no book with title ${queriedTitle} available.`)
          }
    })
    .catch(err => {
        return res.status(500).send(err);
    });
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const queriedReview = req.params.isbn;
  let booksArr = [];

  for (let book in books) {
    if (book === queriedReview) {
        booksArr.push(books[book].reviews)
    }
  }

  if (booksArr.length > 0) {
    return res.send(booksArr);
  } else {
    return res.status(400).send(`There are no book reviews with the isbn number of: ${queriedReview}`)
  }
});

module.exports.general = public_users;
