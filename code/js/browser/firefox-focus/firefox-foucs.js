/**
 * firefox下的一个bug。
 * bug描述:一个输入框失去焦点时，调用alert，再调用focus让输入框获得焦点,会出现此bug
 * 解决方案:将alert放入setTimeout内
 */
document.querySelector("#text").addEventListener("blur", function (event) {
    setTimeout(function () {
        alert("输入错误");
        event.target.focus();
    }, 0);
});