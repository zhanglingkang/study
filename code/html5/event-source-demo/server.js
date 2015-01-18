var http = require("http");
var fs = require("fs");

http.createServer(function (req, res) {
    var index = "./index.html";
    var fileName;
    var interval;

    if (req.url === "/")
        fileName = index;
    else
        fileName = "." + req.url;

    if (fileName === "./stream") {
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "close"
        });
//        res.write("retry: 6000\n");
//        res.write("event: connecttime\n");
//        res.write("data: " + (new Date()) + "\n\n");
//        res.write("data: " + (new Date()) + "\n\n");
        res.write(":ddd");

        interval = setInterval(function () {
            res.write("data: " + (new Date()) + "\n\n");
        }, 20000);
        req.connection.addListener("close", function () {
            clearInterval(interval);
            console.log("close");
        }, false);
//        res.end();
    } else if (fileName === index) {
        fs.exists(fileName, function (exists) {
            if (exists) {
                fs.readFile(fileName, function (error, content) {
                    if (error) {
                        res.writeHead(500);
                        res.end();
                    } else {
                        res.writeHead(200, {"Content-Type": "text/html"});
                        res.end(content, "utf-8");
                    }
                });
            } else {
                res.writeHead(404);
                res.end();
            }
        });
    } else {
        fs.exists(fileName, function (exists) {
            if (exists) {
                fs.readFile(fileName, function (error, content) {
                    if (error) {
                        res.writeHead(500);
                        res.end();
                    } else {
                        res.writeHead(200);
                        res.end(content, "utf-8");
                    }
                });
            }
        });
    }

}).listen(8080, "127.0.0.1");
console.log("Server running at http://127.0.0.1:8080/");