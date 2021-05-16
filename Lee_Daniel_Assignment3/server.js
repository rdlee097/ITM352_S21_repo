// Daniel Lee Assignment 3
// Reference from Lab 13-Ex4, and same screencast, Lab 14 and 15
// Received help from both Dan Port in lecture and Alvin Almira from previous semester
// Uses npm express, query-string, filesystem, cookie-parser, and nodemon to run server

// Uses data from product_data.js
// var data = require('./Public/product_data.js');
// var products = data.products;

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

/* Cookie Middleware 
 *
 * List of cookies used by the system.
 * - 
 */
var cookieParser = require("cookie-parser");
app.use(cookieParser())  // Load the cookie parser to the middle ware.

/* Session Middleware
 * Source: https://medium.com/weekly-webtips/how-to-create-a-simple-login-functionality-in-express-5274c44c20df
 */
var session = require("express-session")
app.use(session({secret: "ITM352 rocks!",  // Secret taken from lab 15.
    name:'uniqueSessionID',
    saveUninitialized:false
}));

// TODO: Figure out how to import JS files.
class Cart {

    /* cartStr = {
     *     "total": <total>,
     *     "items": {
     *         <productId>: {
     *             "brand": <brand>,
     *             "name": <name>,
     *             "price": <price>,
     *             "image": <image>,
     *             "quantity": <quantity>,
     *            "subtotal": <subtotal>
     *         }
     *     }   
     * }
     */
    constructor(cartStr="") {

        /* items = {
         *     <productId>: {
         *         "brand": <brand>,
         *         "name": <name>,
         *         "price": <price>,
         *         "image": <image>,
         *         "quantity": <quantity>,
         *         "subtotal": <subtotal>
         *     }
         * }
         */
        this.items = {}
        this.total = 0.00;

        // Load an existing cart if provided.
        if (cartStr !== "") {

            // Decode the cart string.
            cartStr = decodeURIComponent(cartStr);

            // DEBUG: Print statement to study the contents of the cart string.
            console.log("Class Cart: Constructor: cartStr: " + cartStr);

            // Convert the string to a JSON object to assign the values to this cart.
            let cart = JSON.parse(cartStr);
            this.total = cart["total"]
            this.items = cart["items"]
        }
    }

    addItem(productId, brand, name, price, image, quantity) {

        let subtotal = price * quantity;

        // Add the item directly to the cart if it is missing.
        if (this.items[productId] == undefined) {
            this.items[productId] = {
                "brand": brand,
                "name": name,
                "price": price,
                "image": image,
                "quantity": quantity,
                "subtotal": subtotal
            };
            this.total += subtotal;
        }

        // Update the quantity of the item in the cart.
        else {
            this.items[productId]["quantity"] += quantity;
            this.items[productId]["subtotal"] += subtotal;
            this.total += subtotal;
        }
    }

    removeItem(productId) {

        // Nothing to do since the item doesn't exist in the cart.
        if (this.items[productId] == undefined) {
            return
        }

        // Reduce the total based on the subtotal of the removed item.
        this.total -= this.items[productId]['subtotal'];

        // Remove this item from the cart.
        this.items.delete(productId);
    }

    export() {
        
        // Conver this object into a string for storage and transportation.
        let cartStr = JSON.stringify({"total": this.total, "items": this.items});

        // DEBUG: Print statement to study the contents of the cart upon export.
        console.log("Class Cart: export: cartStr: " + cartStr);

        // Encode the cart string for cookie storage.
        return encodeURIComponent(cartStr);
    }
}

/* Logs All Routes to the Server */
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

// Uses data in body
app.use(myParser.urlencoded({ extended: true })); 

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

/* API to check if the user currently has an active session */
app.get("/loggedin", function (request, response) {
    if (request.session.loggedIn) {
        response.send(JSON.stringify({"name": request.session.name}));
    } else {
        response.send("");
    }

});

/* API to end the user's active session */
app.get('/logout', function (request, response) {

    // Destroy the user session.
    // Source: https://medium.com/weekly-webtips/how-to-create-a-simple-login-functionality-in-express-5274c44c20df
    request.session.destroy((err)=>{})

    // Re-direct the user to the main product page.
    response.redirect("./product_page.html");
});

// Add to cart API.
// We will be using cookies to store and display the cart on the website.
// We will be re-using components from the "process_purchase" API call from previous labs/homework.
app.post("/add_to_cart", function(request, response) {

    // DEBUG: Debugging print statement to study the contents of the POST call.
    console.log("Add to Cart API: Request Body: " + JSON.stringify(request.body));

    // DEBUG: Print statement to study the contents of the cookies.
    // Cookies are stored in a dictionary.
    console.log("Add to Cart API: Cookies: " + JSON.stringify(request.cookies));

    let brand = request.body["brand"] || '';
    let name = request.body["name"] || '';
    let price = request.body["price"] || '';
    let image = request.body["image"] || '';
    let quantity = request.body["quantity"] || '';

    // Covert to types.
    price = parseFloat(price);
    quantity = parseInt(quantity);

    // TODO: If any of the required pieces of information is missing, then we can't process the request of the cart.

    // If the user does not already have a cart, then we will create a brand new cart object.
    let cartStr = request.cookies["cartStr"];

    // Decode the cart string.
    // cartStr = decodeURIComponent(cartStr);

    if (cartStr === undefined || cartStr === "") {
        var cart = new Cart();
    }

    // Check if the user already has an existing cart.
    // If an existing cart is discovered, then parse it and create it as an existing cart object.
    else {
        var cart = new Cart(cartStr);
    }

    // Add the requested item to the cart.
    cart.addItem(brand+name, brand, name, price, image, quantity)

    // Export the new cart to a string to be stored in a cookie.
    response.cookie("cartStr", cart.export());

    // Redirect the user back to the last page that they were on.
    // https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters
    var backUrl = request.header("Referer") || "/";
    response.redirect(backUrl);
});

// Post, used to send to invoice, reference from Stacy Vasquez (Fall 2020)
app.post('/process_purchase', function (request, response) {

    // Check if the user is logged in. If they are not, then send them to the login page.
    if (!request.session.loggedIn) {
        response.redirect("./login.html");
    }

    response.redirect("./invoice.html");

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
//             // response.redirect("./login.html?" + stringified);
//             return;
//         } else {

//             // If not valid, sends back
//             response.redirect("./product_page.html?" + stringified);
            
//         }
//    }
});

// Process login form, reference from lab 14 and assignment 2 screencasts, also Stacy Vasquez (Fall 2020) for var cleanup
app.post('/process_login',
    function (request, response) {
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

                // 
                request.session.loggedIn = true;
                request.session.username = username_signin;
                request.session.name = rqy["name"];

                // Clear cart after login.
                response.clearCookie('cartStr');

                // Redirect the user back to the last page that they were on.
                // https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters
                // var backUrl = request.header("Referer") || "/";
                // response.redirect(backUrl);

                // Redirect the user to the homepage after login.
                response.redirect('/product_page.html');

                // Redirect to invoice if username and password are correct
                // response.redirect('/invoice.html?' + qs.stringify(rqy));
                return; 

            // If password is wrong, display 'Invalid Password' message in console
            } else { 
                login_error.push = ('Invalid Password');
                console.log(login_error);
                rqy["username"] = username_signin;
                rqy["name"] = user_data[username_signin]["name"];
                rqy.login_error = login_error.join(';');
            }   
        }
        
        // If username is wrong, display 'Invalid Username' message in console
        else {
            login_error.push = ('Invalid Username');
            console.log(login_error);
            rqy["username"] = username_signin;
            rqy.login_error = login_error.join(';');
        }

        // Redirects to login page for any error
        response.redirect('./login.html?' + qs.stringify(rqy));
    }
);

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