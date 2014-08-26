(function () {
    function getIdentifyingCode(selector) {
        var image = document.querySelector(selector);       //如果要用在greasemonkey脚本里,可以把下面代码放在imageonload事件里
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        var numbers = [                           //模板,依次是0-9十个数字对应明暗值字符串
            "111000111100000001100111001001111100001111100001111100001111100001111100001111100001111100100111001100000001111000111111111111111111111111111111",
            "111000111100000111100000111111100111111100111111100111111100111111100111111100111111100111111100111100000000100000000111111111111111111111111111",
            "100000111000000011011111001111111001111111001111110011111100111111001111110011111100111111001111111000000001000000001111111111111111111111111111",
            "100000111000000001011111001111111001111110011100000111100000011111110001111111001111111001011110001000000011100000111111111111111111111111111111",
            "111110011111100011111100011111000011110010011110010011100110011100110011000000000000000000111110011111110011111110011111111111111111111111111111",
            "000000001000000001001111111001111111001111111000001111000000011111110001111111001111111001011110001000000011100000111111111111111111111111111111",
            "111000011110000001100111101100111111001111111001000011000000001000111000001111100001111100100111000100000001111000011111111111111111111111111111",
            "100000000100000000111111100111111101111111001111110011111110111111100111111101111111001111111001111110011111110011111111111111111111111111111111",
            "110000011100000001100111001100111001100011011110000011110000011100110001001111100001111100000111000100000001110000011111111111111111111111111111",
            "110000111100000001000111001001111100001111100000111000100000000110000100111111100111111001101111001100000011110000111111111111111111111111111111"];
        var captcha = "";                         //存放识别后验证码
        canvas.width = image.width;
        canvas.height = image.height;
        document.body.appendChild(canvas);
        ctx.drawImage(image, 0, 0);
        for (var i = 0; i < 4; i++) {
            var pixels = ctx.getImageData(13 * i + 7, 3, 9, 16).data;
            var ldString = "";
            for (var j = 0, length = pixels.length; j < length; j += 4) {
                ldString = ldString + (+(pixels[j] * 0.3 + pixels[j + 1] * 0.59 + pixels[j + 2] * 0.11 >= 140));
            }
            var comms = numbers.map(function (value) {                      //为了100%识别率,这里不能直接判断是否和模板字符串相等,因为可能有个别0被计算成1,或者相反
                return ldString.split("").filter(function (v, index) {
                    return value[index] === v
                }).length
            });
            captcha += comms.indexOf(Math.max.apply(null, comms));          //添加到识别好验证码中
        }
        return captcha;
    }

    function isListPage() {
        return location.href.indexOf("http://www.wlcbnews.com/active/teacher.jsp") !== -1;
    }

    function isVotePage() {
        return location.href.indexOf("http://www.wlcbnews.com/active/teacher.jsp?action=vote") !== -1;
    }

    function getName() {
        var firstNames = "赵 钱 孙 李 周 吴 郑 王 冯 陈 褚 卫 蒋 沈 韩 杨 朱 秦 尤 许 何 吕 施 张 孔 曹 严 华 金 魏 陶 姜 戚 谢 邹 喻 柏 水 窦 章 云 苏 潘 葛 奚 范 彭 郎".split(" ");
        var lastNames = "中华姓氏是传统文化中生命力最旺凝聚力最强感召力最大人文情结是认同中华传统文化伟大基石中华民族历来以炎黄子孙自居把炎黄二帝作为共同人文初祖和精神偶像无论是偏处一隅少数民族还是飘零异域华裔侨胞时时处处都流传着炎黄二帝传说人人都以炎黄子孙为荣这种以血缘姓氏为传承纽带对共同祖先形象塑造对民族渊源追述构成了中华文化多元一体化和连续传承性认同基".split("");
        return firstNames[parseInt(Math.random() * firstNames.length)] + lastNames[parseInt(Math.random() * lastNames.length)] + lastNames[parseInt(Math.random() * lastNames.length)];
    }

    //得到name对应投票支持按钮
    function getBtnNode(name) {
//        var observer = new MutationObserver(callback);
//        observer.observer();
        var allTdNode = document.querySelectorAll("#votefrm td");
        for (var i = 0; i < allTdNode.length; ++i) {
            var text = allTdNode.item(i).querySelectorAll(".teachername")[1].textContent;
            if (text.indexOf(name) !== -1) {
                return allTdNode.item(i).querySelector(".teachername img");
            }
        }
    }

    function main() {
        if (isVotePage()) {
//            document.querySelector("img").onload = function () {
            document.querySelector("#cardno").value = getIdCard();
            document.querySelector("#uname").value = getName();
            document.querySelector("#vcode").value = getIdentifyingCode("img");
            document.querySelector("#button").click();
//            }
        }
        else if (isListPage()) {
            getBtnNode("吕海文").click();
        }
    }

    main();
})();