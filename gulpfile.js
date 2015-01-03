var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    gzip   = require('gulp-gzip'),
    clean  = require('gulp-clean'),
    jshint = require('gulp-jshint');

var deps = [
   './node_modules/react/dist/react-with-addons.js',
   './node_modules/react-router/dist/react-router.js',
   './src/unno.js'
];

gulp.task('clean', function() {
   gulp.src('./build/unno.min.js')
       .pipe(clean({force: true}));
});

gulp.task('jshint', function() {
   gulp.src('./src/unno.js')
   .pipe(jshint())
   .pipe(jshint.reporter('default'));
});

gulp.task('gzip', function() {
   gulp.src(deps)
   .pipe(concat('unno.min.js'))
   .pipe(uglify())
   .pipe(gzip())
   .pipe(gulp.dest('./build'));
});

gulp.task('default', ['clean','jshint'], function() {
   gulp.src(deps)
       .pipe(concat('unno.min.js'))
       .pipe(uglify())
       .pipe(gulp.dest('./build'));
});
