var top = obj.getBoundingClientRect().top //元素顶端到可见区域顶端的距离
var se = document.documentElement.clientHeight //浏览器可见区域高度。
if (top >= 0 && top <= se) {
    //code
}