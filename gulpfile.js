'use strict';

var browsersync     = require('browser-sync'),
    browserify      = require('browserify'),
    gulp            = require('gulp'),
    autoprefixer    = require('gulp-autoprefixer'),
    cleancss        = require('gulp-clean-css'),
    csscomb         = require('gulp-csscomb'),
    csslint         = require('gulp-csslint'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify');

var noop            = require("through2").obj();

/**
 *  Config
 */

var paths = {
    src: {
        root:       './src',
        style:      { folder: 'scss',       extensions: ['*.scss', '*.sass', '*.css'] },
        scripts:    { folder: 'scripts',    extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.*', '!*.svg'] },
        fonts:      { folder: 'fonts',      extensions: ['*.*'] },
        svg:        { folder: 'images/svg', extensions: ['*.svg'] }
    },
    dest: {
        root:       './dist',
        style:      { folder: 'css',        extensions: ['*.css'] },
        scripts:    { folder: 'js',         extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.*', '!*.svg'] },
        fonts:      { folder: 'fonts',      extensions: ['*.*'] },
        svg:        { folder: 'images/svg', extensions: ['*.svg'] }
    }
};

var plugins = {
    style: {
        run: {
            sass: true,
            cleancss: true,
            autoprefixer: true,
            csscomb: true,
            csslint: true,
            sourcemaps: true
        },
        sass: {
            options: {
                includePaths: []
            },
            onError: sass.logError
        },
        cleancss: {
            options: {
                compatibility: 'ie8',
                inline: ['local', 'remote', '!fonts.googleapis.com'],
                level: 2,
                debug: true
            },
            callback: (details) => {
                console.log(details.name + ' => ' + details.stats.originalSize);
                console.log(details.name + ' ' + (details.stats.minifiedSize - details.stats.originalSize));
                console.log(details.name + ' => ' + details.stats.minifiedSize);
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions']
            }
        },
        csscomb: {
            options: null
        },
        csslint: {
            options: {},
            formatterOptions: {}
        },
        sourcemaps: {
            options: {},
            writeOptions: {},
            writePath: './'
        }
    }
};

/**
 *  Style
 */

gulp.task('style', () => {
    var $ = plugins.style;

    return gulp.src(paths.src.root + '/' + paths.src.style.folder + '/**/' + paths.src.style.extensions)
        .pipe($.run.sourcemaps    ? sourcemaps.init($.sourcemaps.options) : noop)
        .pipe($.run.sass          ? sass($.sass.options).on('error', $.sass.onError) : noop)
        .pipe($.run.autoprefixer  ? autoprefixer($.autoprefixer.options) : noop)
        .pipe($.run.csscomb       ? csscomb($.csscomb.options) : noop)
        .pipe($.run.csslint       ? csslint($.csslint.options) : noop)
        .pipe($.run.csslint       ? csslint.formatter($.csslint.formatterOptions) : noop)
        .pipe($.run.cleancss      ? cleancss($.cleancss.options, $.cleancss.callback) : noop)
        .pipe($.run.sourcemaps    ? sourcemaps.write($.sourcemaps.writePath, $.sourcemaps.writeOptions) : noop)
        .pipe(gulp.dest(paths.dest.style + '/' + paths.src.style.folder));
});
