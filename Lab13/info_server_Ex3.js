var express = require('express');
var app = express();
var myParser = require("body-parser"); 
app.use(myParser.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path 
    + ' with query' + JSON.stringify(request.query));
    next();
});

app.get('/text.txt', function (request, response, next) {
    response.send("I got a request for /test");
    next();
});

app.post("/display_purchase", function (request, response, next) {
    user_data = {'username':'itm352', 'password':'grader'};
    post_data = request.body;
    if(post_data['quantity_textbox'] ) {
       the_qty = post_data['quantity_textbox'];
        if (isNonNegIntString(the_aty)) {
            response.send(`Thanks for purchasing ${the_qty} items!`);
            return;
        }
        else {
            response.redirect('./order_page.html?quantity_textbox='+the_qty)
            return;
        }
   }
   response.send(post_data);
});


app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

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