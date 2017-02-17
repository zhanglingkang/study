### 静态资源缓存策略

#### 静态资源

* 字体
* 图片
* css
* js

#### 策略

所有资源设为一年（足够久）缓存，通过程序（md5作为参数或者文件名）控制缓存

#### 实现

##### 资源通过webpack引用时如何实现

* loader

```
    {
        test: /\.(jpe?g|png|gif|ico|svg)$/,
        loader: 'file',
        query: {
            name: '[name].[ext]?[hash:10]'
        }
    },
```

* chunk
```
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: '[name].js',
        publicPath: '/web/public/dist/',
        chunkFilename: '[name].chunk.js?[hash:10]'
    },
```

##### 传统的引用方式下如何实现

* 在css里引用图片

```css
.passport-icon {
  background-image: url('http://a.amap.com/lbs-p/static/img/sprite.png');
}
```

* 在就是里动态插入资源

```javascript
function insertStyle(href) {
    let link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    document.getElementsByTagName("head")[0].appendChild(link)
}
insertStyle(process.env.cdn + 'css/sprite.css')
```

* 在html里通过script、style标签引用js、css

通过两个gulp插件gulp-rev、gulp-rev-collector实现

1. 这些静态资源通过依赖关系组成一张图，先处理不可能依赖其他资源的资源，比如图片、字体


```
function registerRevTask(taskName, src) {
    gulp.task(taskName, function () {
        return gulp.src(src)
            .pipe(rev())
            .pipe(gulp.dest(dist))
            .pipe(rev.manifest('../dist/rev-manifest.json', {
                merge: true
            }))
            .pipe(gulp.dest(dist))
    })
}
registerRevTask('revImg', '../dist/**/*.png')
```

处理之后，图片的文件名会发生变化，同时生成rev-manifest.json文件，内容如下：

```
{
  "img/sprite.png": "img/sprite-a3a2c414a2.png",
  "img/sprite@2x.png": "img/sprite@2x-200f49440e.png"
}
```

2. 接下来处理css文件，因为此时css可能引用的资源都已经处理完毕

```
registerRevCollectorTask('revCollectorCss', '../dist/**/*.css')

```
此时rev-manifest.json文件的内容会更新

```
{
  "css/sprite.css": "css/sprite-64f1c7698d.css",
  "img/sprite.png": "img/sprite-a3a2c414a2.png",
  "img/sprite@2x.png": "img/sprite@2x-200f49440e.png"
}
```

3. 最后处理js文件，js里可能引用了图片、css、字体等任何静态资源

##### 通过php或者其他后端语言引用了js、css文件

读取rev-manifest.json的内容进行替换即可

最终实现了我们的缓存策略

#### FAQ

* gulp-rev实现原理

实现原理比较简单，读取文件内容生成md5，更新文件名，将文件名映射关系写入到rev-manifest.json中

* gulp-rev-manifest实现原理

识别出引用了静态资源的地方，然后根据rev-manifest.json的内容进行替换

* gulp-rev-manifest如何识别哪里引用了静态资源
    
    以下内容基于个人猜测，并未证实
    
    * 在html中，通过识别script、style标签
    
    * 在css中，通过识别url()、 import
    
    * 在js中，通过字符串匹配，因为下面这种情况都可以识别出来
    
    ```javascript
    function insertStyle(href) {
        let link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        document.getElementsByTagName("head")[0].appendChild(link)
    }
    insertStyle（'http://a.amap.cdn/**/css/sprite.css')
    ```
    
    会被替换成
    
    ```javascript
        function insertStyle(href) {
            let link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = href
            document.getElementsByTagName("head")[0].appendChild(link)
        }
        insertStyle（'http://a.amap.cdn/**/css/sprite-64f1c7698d.css')
    ```
    
    存在的风险：不是引用资源的地方，但是字符串匹配上了。。。
    
    疑问：在html中，内联的js、css是否会被处理


