/**
 * Created by zhanglingkang on 14-8-17.
 */

var http = require("http");
var fs = require("fs");
var url = require("url");

var server = http.createServer(function (request, response) {
    console.log(request.url);
    var content = "";
    try {
        content = fs.readFileSync(getFileName(request), "UTF-8");
    } catch (e) {
        //console.log(e);
    }
    //response.setHeaders("");
    response.setHeader("Cache-Control", "max-age=10000");
    if (getFileName(request).match(/\.js|\.appcache$/)) {

    }else if(getFileName(request).match(/\.appcache$/)){
        response.setHeader("Content-Type", "text/manifest");
    }
    response.writeHead(200, "OK");
    response.write(content);
    response.end();

});

server.listen(8080);


function getFileName(request) {
    return url.parse(request.url).pathname.substring(1);
}