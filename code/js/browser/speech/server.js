var path = require('path');
var express = require('express');
var app = express();

app.use('/', express.static(path.join(__dirname, "")));

app.listen(3000);
console.log('Listening on port 3000');