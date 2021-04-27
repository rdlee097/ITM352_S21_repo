var express = require('express');
var app = express();
var myParser = require("body-parser");
var products = require('./product_data.json');

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path 
    + ' with query' + JSON.stringify(request.query));
    next();
});

app.get("/product_data.js", function (request, response, next) {
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.use(myParser.urlencoded({ extended: true }));

app.get('/test.html', function (request, response, next) {
    response.send('I got a request for /test');
});

// Processed the form from order_page.html
app.post('/display_purchase', function (request, response, next) {
    process_quantity_form(request.body, request, response);
});

app.use(express.static('./public'));

app.listen(8081, function () {
    console.log(`listening on port 8080`)
    }
); // note the use of an anonymous function here

function isNonNegIntString(string_to_check, returnErrors=false) {
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

function process_quantity_form(post_data, request, response) {
    
    if (post_data['quantity_textbox']) {
        the_qty = post_data['quantity_textbox'];
        let prod_num = post_data['product_select'];
        let model = products[prod_num]['model'];
        let model_price = products[prod_num]['price'];
        if(isNonNegIntString(the_qty)) {
            // response.send(`Thanks for purchasing ${the_qty} items!`);
            // response.redirect('invoice.html?quantity_textbox=' + the_qty);
            response.send(`<h2>Thank you for purchasing ${the_qty} ${model}. Your total is \$${the_qty * model_price}!</h2>`);
            return;
        } else {
            // response.send(`Hey! ${the_qty} is not a valid quantity!`);
            response.redirect('./order_page.html?quantity_textbox=' + the_qty);
            
            return;
        }
    }
    response.send(JSON.stringify(post_data));
}