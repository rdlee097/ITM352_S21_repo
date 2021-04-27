// Reference from Lab 13-Ex4, and same screencast
// Uses npm express, query-string, and nodemon to run server

// Uses data from product_data.js
var data = require('./public/product_data.js');
var products = data.products;
// Sets query_string to load
const query_string = require('query-string');
// Allowing express, server starts
var express = require('express');
var app = express();
// Loads parser
var myParser = require("body-parser");

// Referencing lab 13, to console log server request, to redirect invoice
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

// Uses data in body
app.use(myParser.urlencoded({ extended: true })); 
// app.get('/test', function (request, response, next) {
//     response.send('I got a request for /test');
// });

// Post, used to send to invoice, reference from Stacy Vasquez
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
        const stringified = query_string.stringify(POST);
        // If valid
        if (has_valid_quantity && has_quantity) {
            // Sends to invoice
            response.redirect("./invoice.html?" + stringified);
            
        } else {
            // If not valid, sends back
            response.redirect("./product_page.html?" + stringified);
            
        }
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
function isNonNegInt(string_to_check, returnErrors=false) {
    /*
    This funciton returns true if string_to_check is a non-negative integer. If return Errors=true it will return the array of reasons it is not a non-negative integer
    */
    errors = []; // assume no errors at first
    if(Number(string_to_check) != string_to_check) {errors.push('Not a number!');} // Check if string is a number value
    else {
        if(string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer
    };
    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}