var gulp = require("gulp");
var jade = require("gulp-jade");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var watch = require("gulp-watch");
var es = require('event-stream');
//var jslint = require("gulp-jslint");
//var recess = require("gulp-recess");

var modules = ["control", "overlay"];

var sourcesRoot = "src/";
var assetsDir = "assets/";

modules.forEach(function (module) {

    var dir = {
        assets: "assets/",
        src: sourcesRoot + module + "/",
        dest: "build/" + module + "/",
        bower: "bower_components/"
    };

    gulp.task(module + "_js", function () {
        es.concat(
            gulp.src(dir.src + dir.assets + "js/**/*.js")
        )
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(concat("app.js"))
            //.pipe(uglify())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dir.dest + dir.assets + "js/"));
    });

    gulp.task(module + "_jade", function () {
        var locations = [
            {
                src: "*.jade",
                dest: ""
            },
            {
                src: "views/**/*jade",
                dest: "views/"
            }
        ];
        for (var i = 0; i < locations.length; i++) {
            gulp.src(dir.src + locations[i].src)
                .pipe(plumber())
                .pipe(jade({
                    pretty: true,
                    doctype: "HTML"
                }))
                .pipe(gulp.dest(dir.dest + locations[i].dest));
        }
    });

    gulp.task(module + "_less", function () {
        gulp.src(dir.src + dir.assets + "less/master.less")
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(less())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dir.dest + dir.assets + "css/"));
    });

    gulp.task(module + "_img", function () {
        gulp.src(dir.src + dir.assets + 'img/**/*.{jpg,png,svg}')
            .pipe(gulp.dest(dir.dest + dir.assets + 'img/'))
    });
});

var tasks = [];
var moduleTasks = ["jade", "js", "less", "img"];

modules.forEach(function (module) {
    moduleTasks.forEach(function (moduleTask) {
        tasks.push(module + "_" + moduleTask);
    })
});

gulp.task("compile", tasks);

gulp.task("default", tasks, function () {

    modules.forEach(function (module) {
        gulp.watch(sourcesRoot + module + "/" + assetsDir + "js/**/*.js", function () {
            gulp.run(module + "_js");
        });
        gulp.watch(sourcesRoot + module + "/" + assetsDir + "less/**/*.less", function () {
            gulp.run(module + "_less");
        });
        gulp.watch(sourcesRoot + module + "/" + "/**/*.jade", function () {
            gulp.run(module + "_jade");
        });
        gulp.watch(sourcesRoot + module + "/" + assetsDir + "img/*.{jpg,png,svg}", function () {
            gulp.run(module + "_img");
        });
    });

});
