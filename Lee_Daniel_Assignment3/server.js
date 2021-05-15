// Daniel Lee Assignment 3
// Reference from Lab 13-Ex4, and same screencast, Lab 14
// Uses npm express, query-string, filesystem, and nodemon to run server

// Uses data from product_data.js
var data = require('./Public/product_data.js');
var products = data.products;
// Loads querystring
const qs = require('qs');
// Loads filesystem
var fs = require('fs');
// Allowing express, server starts
var express = require('express');
var app = express();
// Loads parser
var myParser = require("body-parser");
var user_data_file = 'user_data.json';
// Uses data in body
app.use(myParser.urlencoded({ extended: true })); 
// From lab 15
// Assigns cookieParser 
var cookieParser = require('cookie-parser'); 
app.use(cookieParser());
// Assigns session 
var session = require('express-session'); 
// Assigns mailer
// const nodemailer = require("nodemailer"); 
app.use(session({ secret: "ITM352 rocks!" }));
// From lab 15

// Referencing lab 13, to console log server request, to redirect invoice
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});



// Read user data file, taken from lab 14 screencast
if (fs.existsSync(user_data_file)) {
    // Uses filesystem's to load user_data.json
    var file_stats = fs.statSync(user_data_file);
    console.log(`${user_data_file} has ${file_stats["size"]} characters`); 
    // Lets server read user_data.json and convert data to string
    data = fs.readFileSync(user_data_file, 'utf-8');
    var user_data = JSON.parse(data);  
} else {
    console.log(`${user_data_file} does not exist!`);
}

// Post, used to send to invoice, reference from Stacy Vasquez (Fall 2020)
app.post('/process_purchase', function (request, response) {
    let POST = request.body;
    if (typeof POST['submit_purchase'] != 'undefined') {
        var has_valid_quantity = true;
        var has_quantity = false;
        for (i = 0; i < products.length; i++) {
            // Checks quantity amount
            qty = POST[`quantity${i}`];
            // Greater than 0
            has_quantity = has_quantity || qty > 0;
            // Greater than 0, and valid using Int check function
            has_valid_quantity = has_valid_quantity && isNonNegInt(qty);
        }
        // Makes data into strings
        const stringified = qs.stringify(POST);
        // If valid
        if (has_valid_quantity && has_quantity) {
            // Sends to invoice
            response.redirect("./login.html?" + stringified);
            return;
        } else {
            // If not valid, sends back
            response.redirect("./product_page.html?" + stringified);
            
        }
   }
});

// Process login form, reference from lab 14 and assignment 2 screencasts, also Stacy Vasquez (Fall 2020) for var cleanup
app.post('/process_login', function (request, response) {
    let post = request.body;
    let rqy = request.query;
    let username_entered = post["username"];
    let password_entered = post["password"];
    // Starts an array that holds errors, sent to window.onload in login.html
    var login_error = [];
    console.log(rqy);
    // Sets usernames inputed into lowercase
    var username_signin = username_entered.toLowerCase();
    // Checks to match username input to user_data
    if (typeof user_data[username_signin] != 'undefined') {
        // If username matches password
        if (user_data[username_signin]["password"] == password_entered) {
            console.log(rqy);
            rqy["username"] = username_signin;
            rqy["name"] = user_data[rqy["username"]]["name"];
            console.log(rqy["name"]);
            // Redirect to invoice if username and password are correct
            response.redirect('/invoice.html?' + qs.stringify(rqy));
            return; 
        } else { 
            // If password is wrong, display 'Invalid Password' message in console
            login_error.push = ('Invalid Password');
            console.log(login_error);
            rqy["username"] = username_signin;
            rqy["name"] = user_data[username_signin]["name"];
            rqy.login_error = login_error.join(';');
        }   
    } else { 
        // If username is wrong, display 'Invalid Username' message in console
        login_error.push = ('Invalid Username');
        console.log(login_error);
        rqy["username"] = username_signin;
        rqy.login_error = login_error.join(';');
    }
    // Redirects to login page for any error
    response.redirect('./login.html?' + qs.stringify(rqy));
});

// Process registration form, referenced from lab 14 screencast and Nick Sams
app.post('/process_register', function (request, response, next) {
    let post = request.body;
    let rqy = request.query;
    // Array to return errors
    var registration_error = [];
    // Pattern from registration form
    var fullname_box = /^[A-Za-z]+$/;
    var username_box = /^[0-9A-Za-z]+$/;

    // Full Name
    // Only letters for full name
    if (fullname_box.test(post["name"])) {
    } else {
        registration_error.push('Use only letters');
        console.log("must be letters only");
    }

    // Username
    // Checks the new username in lowercase across other usernames
    var reguser = post["username"].toLowerCase(); 
    // Gives error if username is taken
    if (typeof user_data[reguser] != 'undefined') {
        registration_error.push('Username taken');
    }
    // Requires username to be letters and numbers 
    if (username_box.test(post["username"])) {
    } else {
        registration_error.push('Letters and numbers only in username')
    }

    // Password
    // Requires password to be above 5 characters
    if (post["password"].length < 6) {
        registration_error.push('Password must be minimum 6 characters')
    }
    // Checks to see that the password was entered correctly both times
    if (post["password"] !== post["password_repeat"]) { 
        registration_error.push('Password does not match')
    }

    // If all inputs are valid, continues to save data into user_data.json
    // Reloads if there is an error found
    if (registration_error.length == 0) {
        console.log('No errors')
        rqy["fullname"] = post["fullname"];
        rqy["username"] = post["username"];
        rqy["email"] = post["email"]; 
            var username = post["username"];
            // Register user information
            user_data[username] = {}; 
            user_data[username]["name"] = post["fullname"];
            user_data[username]["password"] = post["password"]; 
            user_data[username]["email"] = post["email"]; 
             // Pushes information to user_data.json
            data = JSON.stringify(user_data); 
            fs.writeFileSync(user_data_file, data, "utf-8");
            // Redirects to invoice page
            response.redirect('./invoice.html?' + qs.stringify(rqy));
    } else {
        // If errors are present, log the user into the console, redirect to registration page
        console.log(registration_error);
        // Redirect to registration page if error is present
        rqy.registration_error = registration_error.join(';');
        response.redirect('registration_form.html?' + qs.stringify(rqy));
    }
});

// Get cart information
app.post('/get_cart', function (request, response) {
    if (typeof request.session.cart == "undefined") {// If cart data is not requested, create an object for it
        request.session.cart = {};
    }
    // Responds to cart
    response.json(request.session.cart);
});

// Process Cart
app.post('/add_cart', function (request, response) {
    console.log(request.session);
    let post = request.body;

    // Check if the quantities are NonNegInt (from previous Assignment 1)
    // Professor Port helped me create a product_key to post and save that session's quantities to the Shopping Cart
    if (typeof post['submitCart'] != 'undefined') {
        product_key = POST["product_key"]; // POSTs the product_key
        products = allProducts[product_key];
        var hasvalidquantities = true; // Assumes that the variable is true (has valid quantities)
        // var hasquantities = false
        let quantities = [];
        for (i = 0; i < products.length; i++) {
            qty = POST[`quantity${i}`];
            quantities[i] = qty;
            // hasquantities = hasquantities || qty > 0; // If value is > 0, then it is valid
            hasvalidquantities = hasvalidquantities && isNonNegInt(qty); // If quantity is both > 0 and valid
        }
    // NOTE: Following code will retain query string from products_display.html page 
    // Borrowed from Prof. Port's screencast "Getting Started With Assignment 2"
    if (hasvalidquantities) { // If valid, add the quantities to the cart/ session
        if (typeof request.session.cart == "undefined") {
            request.session.cart = {};
        }
            request.session.cart[product_key] = quantities; // Posts the user's session
            POST["message"] = "Successfully added to cart!";
        } else {
            POST["message"] = "Invalid quantities, cart not updated!";
        }
        const stringified = qs.stringify(POST);
        console.log(request.session);
        response.redirect(`./products.html?${stringified}`);
    }
});




// Using express to access "Public" folder files
app.use(express.static('./Public'));

// Server start, listening to port 8080
app.listen(8080, function () {
    console.log(`listening on port 8080`)
    }
); // note the use of an anonymous function here

// Retrieved from lab 11
function isNonNegInt(qty, return_errors = false) { //this function checks if values are postitive, integer, whole values 
    errors = []; // assume no errors at first
    if (qty == '') qty = 0; //sets input quatity as 0 
    if (Number(qty) != qty) errors.push(' <b>This is not a number!</b>'); // Check if string is a number value
    else if (qty < 0) errors.push('<b>Negative value!</b>'); // Check if it is non-negative
    else if (parseInt(qty) != qty) errors.push('<b>This is not a full value!</b>'); // Check that it is an integer
    return return_errors ? errors : (errors.length == 0);
}