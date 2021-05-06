// Reference from Lab 13-Ex4, and same screencast
// Uses npm express, query-string, and nodemon to run server

// Uses data from product_data.js
var data = require('./public/product_data.js');
var products = data.products;
// Sets query_string to load
const qs = require('qs');
// Allowing express, server starts
var express = require('express');
var app = express();
// Loads parser
var myParser = require("body-parser");
// Uses data in body
app.use(myParser.urlencoded({ extended: true })); 
var fs = require('fs');

// var user_data = require('./user_data.json');
// Read user data file
var user_data_file = './user_data.json';
if(fs.existsSync(user_data_file)) {
    var file_stats = fs.statSync(user_data_file);
    // console.log(`${user_data_file} has ${file_stats["size"]} characters`); 
    var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));  
} else {
    console.log(`${user_data_file} does not exist!`);
}

// console.log(user_data);

// Referencing lab 13, to console log server request, to redirect invoice
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});


// app.get('/test', function (request, response, next) {
//     response.send('I got a request for /test');
// });

// // Post, used to send to invoice, reference from Stacy Vasquez
// app.post('/process_purchase', function (request, response) {
//     let POST = request.body;
//     if (typeof POST['submit_purchase'] != 'undefined') {
//         var has_valid_quantity = true;
//         var has_quantity = false;
//         for (i = 0; i < products.length; i++) {
//             // Checks quantity amount
//             qty = POST[`quantity${i}`];
//             // Greater than 0
//             has_quantity = has_quantity || qty > 0;
//             // Greater than 0, and valid using Int check function
//             has_valid_quantity = has_valid_quantity && isNonNegInt(qty);
//         }
//         // Makes data into strings
//         const stringified = qs.stringify(POST);
//         // If valid
//         if (has_valid_quantity && has_quantity) {
//             // Sends to invoice
//             response.redirect("./login.html?" + stringified);
            
//         } else {
//             // If not valid, sends back
//             response.redirect("./product_page.html?" + stringified);
            
//         }
//    }
// });

// Process login form
app.post('/process_login', function (request, response, next) {
    console.log(request.query);
    // Check login and password match database

    // No error, send to invoice
    let username_entered = request.body["uname"];
    let password_entered = request.body["psw"];
    if (typeof user_data[username_entered] != 'undefined') {
        if (user_data[username_entered]['password'] == password_entered) {  
            response.send(`${username_entered} is logged in.`);
    } else {
        response.send(`${username_entered} password is wrong.`);
    }
} else {
    response.send(`${username_entered} is not registerd.`);
}
});

// Process registration form
app.post('/process_register', function (request, response, next) {
    // Add a new user to user_data.json
    username = request.body["uname"];
    user_data[username] = {};
    user_data[username]["name"] = request.body["fullname"];
    user_data[username]["password"] = request.body["psw"];
    user_data[username]["email"] = request.body["email"];
    // Save updated user_data to file DB
    fs.writeFileSync(user_data_file, JSON.stringify(user_data));
    response.send(`${username} is registered.`);
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