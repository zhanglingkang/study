var http = require("http");
var fs = require("fs");
var url = require("url");

var server = http.createServer(function (request, response) {
    response.writeHead(307, "OK", {
        Location: "http://www.baidu.com"
    });
    response.write("");
    response.end();

});

server.listen(8080);

