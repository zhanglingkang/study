/**
 * 458664616-120044
 */
var port = 80;
var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var mime = require("./mime").types;
var config = require("./config");
var zlib = require("zlib");
//创建http服务端
var server = http.createServer(function (request, response) {
    var obj = url.parse(request.url);
    response.setHeader("Server", "Node/V8");
    console.log(obj);
    var pathname = obj.pathname;
    if (pathname.slice(-1) === "/") {
        pathname = pathname + config.Welcome.file;   //默认取当前默认下的index.html
    }
    var realPath = path.join("./", path.normalize(pathname.replace(/\.\./g, "")));
    console.log(realPath);
    var pathHandle = function (realPath) {
        //用fs.stat方法获取文件
        fs.stat(realPath, function (err, stats) {
            if (err) {
                response.writeHead(404, "not found", {'Content-Type': 'text/plain'});
                response.write("the request " + realPath + " is not found");
                response.end();
            } else {
                if (stats.isDirectory()) {
                } else {
                    var ext = path.extname(realPath);
                    ext = ext ? ext.slice(1) : 'unknown';
                    var contentType = mime[ext] || "text/plain";
                    response.setHeader("Content-Type", contentType);

                    var lastModified = stats.mtime.toUTCString();
                    var ifModifiedSince = "If-Modified-Since".toLowerCase();
                    response.setHeader("Last-Modified", lastModified);

                    if (ext.match(config.Expires.fileMatch)) {
                        var expires = new Date();
                        expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
                        response.setHeader("Expires", expires.toUTCString());
                        response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);
                    }

                    if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
                        console.log("从浏览器cache里取")
                        response.writeHead(304, "Not Modified");
                        response.end();
                    } else {
                        var raw = fs.createReadStream(realPath);
                        var acceptEncoding = request.headers['accept-encoding'] || "";
                        var matched = ext.match(config.Compress.match);

                        if (matched && acceptEncoding.match(/\bgzip\b/)) {
                            response.writeHead(200, "Ok", {'Content-Encoding': 'gzip'});
                            raw.pipe(zlib.createGzip()).pipe(response);
                        } else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
                            response.writeHead(200, "Ok", {'Content-Encoding': 'deflate'});
                            raw.pipe(zlib.createDeflate()).pipe(response);
                        } else {
                            response.writeHead(200, "Ok");
                            raw.pipe(response);
                        }
                    }
                }
            }
        });

    }
    pathHandle(realPath);
});
server.listen(port);