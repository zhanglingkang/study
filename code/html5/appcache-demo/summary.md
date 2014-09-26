* chrome下有两种缓存，http缓存、离线缓存(这里没说其他浏览器不是这样，还没有验证)
* 在chrome中，app.js的Cache-Control设置为no-store和no-cache时，会被离线缓存忽略此设置，app.js该缓存还是缓存。规范里也是这么描述的。
* 如果app.js的Cache-Control设置为max-age=10000，离线缓存不会忽略此设置，也就是说这个http首部设置影响到了离线缓存。这时即使appcache文件发生变化,因为app.js还没有过期，
  不会重新请求app.js。
* app.appcache文件如果设置了max-age=10000，离线缓存会忽略此设置，但是http不会忽略，也就是说如果我们删除掉http缓存,app.cache文件会
重新向服务器请求，否则不会，被http缓存拦截。