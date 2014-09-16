"use strict";

/**
 * 访问键盘事件的按键码，有三个相关属性
 * charCode、keyCode、which
 * 在chrome下，
 * 不管摁什么类型的键，keyCode和which均能够访问按键码，charCode只能访问字符键的按键码，比如a,b....
 * 在firefox下，
 * 按字符键a时，charCode、keyCode、which值分别为97、0、97
 * 按enter键时，charCode、keyCode、which值分别为0、13、13
 * 按向上键时，charCode、keyCode、which值分别为0、38、0
 * 总之，访问不为0的那个键即可。
 */

define(function (require, exports, module) {
    var keyCode = {
        ENTER: 13,
        BACKSPACE: 8,
        TOP: 38,
        RIGHT: 39,
        BOTTOM: 40,
        LEFT: 37
    };
    return keyCode;
});
