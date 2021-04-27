const { SSL_OP_NETSCAPE_CA_DN_BUG } = require('constants');
var express = require('express');
var app = express();

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
});
app.get('/test', function (request, response, next) {
    response.send("Got a GET to /test path");
    next();
});

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here
