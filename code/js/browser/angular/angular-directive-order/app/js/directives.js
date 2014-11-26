'use strict';

angular.module("phonecatDirectives", []).directive("print", function () {
    return {
        restrict: "A",
        controller: function ($scope, $element, $attrs) {
            console.log($attrs.id + "--controller");
        },
        compile: function (element, $attr) {
            console.log($attr.id + "---compile");
            return {
                pre: function (scope, element, $attr) {
                    console.log($attr.id + "---pre")
                },
                post: function (scope, element, $attr) {
                    console.log($attr.id + "---post")
                }
            }
        }
    }
});