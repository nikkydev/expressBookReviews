const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const validUser = users.find(user => user.username === username && user.password === password);
    return !!validUser;

}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).send("You obviously cannot follow instructions! Either your username or password are missing.")
    } 

    if (authenticatedUser(username,password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in!");
    } else {
        return res.status(208).send(`Uh oh, it appears you are not registered yet. Please register before trying to login.`)
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const session = req.session.authorization;

  // No session, they can't add review
  if (!session) {
    return res.status(403).send("Oh huh uh, you don't have permission to enter a review. Please login or register.");
  }

  const reviewerName = session.username;

  // Check if review is entered 
  if (!review) {
    return res.status(400).send("Doh, you forgot to add a review!");
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).send("There is no book with that ISBN number in our database.");
  }

  // Initialize reviews as an object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review
  const isUpdate = books[isbn].reviews.hasOwnProperty(reviewerName);
  books[isbn].reviews[reviewerName] = review;

  // Respond with the appropriate message
  const responseMessage = isUpdate ? "Your review has been updated." : "Your review has been added.";

  return res.status(200).send(responseMessage);
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
    const isbn = req.params.isbn;
    const session = req.session.authorization;

    // No session, they can't delete review
    if (!session) {
        return res.status(403).send("Oh huh uh, you don't have permission to delete a review. Please login or register.");
    }

    const reviewerName = session.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).send("There is no book with that ISBN number in our database.");
    }

    // Check if a review exists by user on that book
    if (books[isbn].reviews.hasOwnProperty(reviewerName)) {
        delete books[isbn].reviews[reviewerName];
        return res.status(200).send("Your review has been deleted.")
    } else {
        return res.status(404).send("You did not write a review for that book.")
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
