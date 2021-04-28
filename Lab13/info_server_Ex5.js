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
// Works using "action" from form tag
app.post('/process_form', function (request, response, next) {
    process_quantity_form(request.body, request, response);
});

app.use(express.static('./public'));

app.listen(8080, function () {
    console.log(`listening on port 8080`)
    }
); // note the use of an anonymous function here

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

function process_quantity_form (POST, response) {
    if (typeof POST['purchase_submit_button'] != 'undefined') {
       receipt = '';
       for(i in products) { 
        let q = POST[`quantity_textbox${i}`];
        let model = products[i]['model'];
        let model_price = products[i]['price'];
        if (isNonNegInt(q)) {
          receipt += `<h3>Thank you for purchasing: ${q} ${model}. Your total is \$${q * model_price}!</h3>`; // render template string
        } else {
          receipt += `<h3><font color="red">${q} is not a valid quantity for ${model}!</font></h3>`;
        }
      }
      response.send(receipt);
      response.end();
    }
 }