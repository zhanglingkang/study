"use strict";

/**
 * 键盘事件的charCode在firefox下为0。keyCode在chrome和firefox下一致
 */

define(function (require, exports, module) {
    var keyCode = {
        ENTER: 13
    };
    return keyCode;
});
