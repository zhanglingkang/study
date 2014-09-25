//(function () {
//    var img = $("#img_rand_code")[0];
//    var canvas;
//    var ctx;
//    var plugin;
//    $("body").append("<canvas></canvas>");
//    $("body").append('<embed id="pluginId" type="application/x-np-piao"></embed>');
//    plugin = $("#pluginId")[0];
//    canvas = $("canvas")[0];
//    ctx = canvas.getContext("2d");
//    onImgLoaded(img, function () {
//        ctx.drawImage(img, 0, 0);
//        $("body").append('<img src="' + canvas.toDa + '"/>');
//        fillCode();
//    });
//    /**
//     * @method onImgLoaded
//     * @description 在图片加载完毕之后执行fn函数，如果图片当前已经加载完，立即执行
//     * @param {Node} img结点
//     * @param {Function} fn
//     */
//    function onImgLoaded(img, fn) {
//        if (img.complete) {
//            fn();
//        } else {
//            img.onload = function () {
//                fn();
//            }
//        }
//    }
//
//    /**
//     * @method  fillCode
//     * @description 填充验证码
//     */
//    function fillCode() {
//        var fileReader = new FileReader();
//        fileReader.addEventListener("load", function (result) {
//            var base64 = fileReader.result.replace(/data:image\/jpeg;base64,/, "").replace("data:image/png;base64,", "");
//            var data = {
//                img_buf: base64,
//                check: plugin.GetSig(base64)
//            };
//            var url = "http://check.huochepiao.360.cn/img_yzm?" + JSON.stringify(data);
//            console.log(url);
//            img.src = fileReader.result;
//            $.get(url, function (data) {
//                $("#randCode").val(data.res);
//            }, "json");
//        });
//        var xhr = new XMLHttpRequest();
//        xhr.open("GET", "https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew.do?module=login&rand=sjrand&" + Math.random());
//        xhr.responseType = "blob";
//        xhr.onreadystatechange = function () {
//            if (4 == xhr.readyState && 200 == xhr.status) {
//                fileReader.readAsDataURL(xhr.response)
//            }
//        };
//        xhr.send();
//    }
//}());
(function () {
    var img = $("#yanzheng")[0];
    var canvas;
    var ctx;
    var plugin;
    $("body").append("<canvas></canvas>");
    $("body").append('<embed id="pluginId" type="application/x-np-piao"></embed>');
    plugin = $("#pluginId")[0];
    canvas = $("canvas")[0];
    ctx = canvas.getContext("2d");
    onImgLoaded(img, function () {
        ctx.drawImage(img, 0, 0);
//        $("body").append('<img src="' + canvas.toDa + '"/>');
        fillCode();
    });
    /**
     * @method onImgLoaded
     * @description 在图片加载完毕之后执行fn函数，如果图片当前已经加载完，立即执行
     * @param {Node} img结点
     * @param {Function} fn
     */
    function onImgLoaded(img, fn) {
        if (img.complete) {
            fn();
        } else {
            img.onload = function () {
                fn();
            }
        }
    }

    /**
     * @method  fillCode
     * @description 填充验证码
     */
    function fillCode() {
        var fileReader = new FileReader();
        fileReader.addEventListener("load", function (result) {
            var base64 = fileReader.result.replace(/data:image\/jpeg;base64,/, "").replace("data:image/png;base64,", "");
            var data = {
                img_buf: base64,
                check: plugin.GetSig(base64)
            };
            var url = "http://check.huochepiao.360.cn/img_yzm?" + JSON.stringify(data);
            console.log(url);
            img.src = fileReader.result;
            $.get(url, function (data) {
                $("#validateCode").val(data.res);
            }, "json");
        });
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://passport.csdn.net/ajax/verifyhandler.ashx?rand=" + Math.random());
        xhr.responseType = "blob";
        xhr.onreadystatechange = function () {
            if (4 == xhr.readyState && 200 == xhr.status) {
                fileReader.readAsDataURL(xhr.response)
            }
        };
        xhr.send();
    }
}());