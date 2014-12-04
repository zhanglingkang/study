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
        },
        link: function ($scope, $element, $attrs) {
            console.log($attrs.id + "---link");
        }
    }
})
    .directive("isolatedScope", function () {
        return {
            scope: {
                isolatedScope: "="
            },

            link: function (scope, element, attr) {
                console.log(scope);
                console.log("isolatedScope");
//                console.log(element.scope());
//                console.log("elementScope");
            }
        }
    })

    .directive("parentScope", function () {
        return {
            priority: 1000,
            compile: function () {
                console.log(1000);
                return angular.noop;
            },
            link: function (scope) {
                scope.name = "xxx";
                console.log(scope);
                console.log("parentScope");
            }
        }
    })
    .directive("childScope", function () {
        return {
            scope: true,
            priority: 2000,
            compile: function () {
                console.log(2000);
                return angular.noop;
            },
            link: function (scope) {
                console.log(scope);
                console.log("childScope");
            }
        }

    })
    .
    directive("childScope1", function () {
        return {
            scope: true,
            link: function (scope) {
                console.log(scope);
                console.log("childScope1");
            }
        }

    });