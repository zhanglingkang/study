module.exports = function (grunt) {

    var fs = require("fs");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: './dist/js/main.js',
                dest: './dist/js/main.js'
            }
        },
        transport: {
            options: {
                paths: [""],
                alias: '<%= pkg.spm.alias %>',
                debug: true
            },
            js: {
                files: [
                    {
                        expand: true,
                        cwd: "./app/js",
                        src: '**',
                        filter: 'isFile',
                        dest: './dist/temp/js'
                    }
                ]

            }
        },
//        concat: {
//            foo: {
//                options: {
//                    include: 'relative'
//                },
//                files: [
//                    {
//                        src: ['./dist/temp/js/*debug.js'],
//                        dest: './dist/js/main-debug.js'
//                    },
//                    {
//                        src: ['./dist/temp/js/*.js'],
//                        dest: './dist/js/main.js',
//                        filter: function (filepath) {
//                            return filepath.indexOf("debug") == -1;
//                        }
//                    }
//                ]
//
//            }
//        }
        concat: {
            foo: {
                options: {
                    noncmd: true,//允许合并非cmd模块
                    banner: "",//合并文件的标题
                    footer: ""//合并文件的底部
                },
                files: [
                    {
                        './dest.js': ['./app/js/filters.js', './app/js/app.js']
                    }
                ]
            }
        },
        replace: {
            html: {
                file: "demo.html",
                replace: ['http://js.wanmeiyueyu.com/bms/dist.js', 'http://js.wanmeiyueyu.com/bms/dist1.js']
            }
        }

    });

    grunt.registerTask("init", "初始化dist目录", function () {
        if (grunt.file.exists("./dist")) {
            grunt.file.delete("./dist");
            grunt.file.mkdir("./dist/temp/js");
            grunt.file.mkdir("./dist/js");
        }
    });
    grunt.registerMultiTask("replace", "将制定的文件里标记data-romove属性标签删除掉", function () {
        console.log(this.target + "----" + this.data);
        grunt.file.copy(this.data.file, "dist/demo.html");
        var scriptReg = /<script\s+[^>]*data-remove[^>]*>\s*<\/script>/g;
        var fileContent = grunt.file.read("dist/demo.html");
        var matchResult;
        var replacePosition = -1;
        var contentToAdd = "";
        while ((matchResult = scriptReg.exec(fileContent)) != null) {
            replacePosition = scriptReg.lastIndex;
        }
        this.data.replace.forEach(function (value, index) {
            contentToAdd += "<script src='" + value + "'></script>";
        });
        fileContent = fileContent.substring(0, replacePosition) + contentToAdd + fileContent.substring(replacePosition, fileContent.length);
        fileContent = fileContent.replace(scriptReg, "");
        grunt.file.write("dist/demo.html", fileContent);
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['init', 'transport', "concat", "uglify"]);

};