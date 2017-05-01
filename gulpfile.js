'use strict';

var browsersync = require('browser-sync').create(),
    browserify  = require('browserify'),
    gulp        = require('gulp'),
    autoprefixer= require('gulp-autoprefixer'),
    cleancss    = require('gulp-clean-css'),
    concat      = require('gulp-concat'),
    csscomb     = require('gulp-csscomb'),
    csslint     = require('gulp-csslint'),
    rename      = require('gulp-rename'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify');

var noop        = require("through2").obj();

/**
 *  Config
 */

var paths = {
    src: {
        root:       './src',
        html:       { folder: '.',          extensions: ['*.html', '*.htm']},
        style:      { folder: 'scss',       extensions: ['*.scss', '*.sass', '*.css'] },
        scripts:    { folder: 'scripts',    extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.png', '*.jpg', '*.jpeg', '*.gif'] },
        fonts:      { folder: 'fonts',      extensions: ['*.*'] },
        svg:        { folder: 'images/svg', extensions: ['*.svg'] }
    },
    dest: {
        root:       './dist',
        html:       { folder: '.',          extensions: ['*.html', '*.htm']},
        style:      { folder: 'css',        extensions: ['*.css'] },
        scripts:    { folder: 'js',         extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.png', '*.jpg', '*.jpeg', '*.gif'] },
        fonts:      { folder: 'fonts',      extensions: ['*.*'] },
        svg:        { folder: 'images/svg', extensions: ['*.svg'] }
    }
};

var plugins = {
    browsersync: false,
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
                level: 2
            },
            callback: (details) => {
                console.log('\t' + details.name + ' => ' + details.stats.originalSize);
                console.log('\t' + details.name + '    ' + (details.stats.minifiedSize - details.stats.originalSize));
                console.log('\t' + details.name + ' => ' + details.stats.minifiedSize);
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions']
            }
        },
        csscomb: {},
        csslint: {},
        sourcemaps: {
            options: {},
            writeOptions: {},
            writePath: './'
        },
        concat: {
            name: 'app.css'
        },
        rename: {
            basename: 'app'
        }
    },
    serve: {
        options: {
            server: paths.dest.root
        }
    }
};

/**
 *  Utils
 */

function getExtensions(path, root) {
    return path.extensions.map((extension) => {
        return root + '/' + path.folder + '/**/' + extension;
    });
};

/**
 *  Style
 */

gulp.task('style', () => {
    var $ = plugins.style;

    return gulp.src(getExtensions(paths.src.style, paths.src.root))
        .pipe($.run.sourcemaps && $.run.sass ? sourcemaps.init($.sourcemaps.options) : noop)
        .pipe($.run.sass ? sass($.sass.options).on('error', $.sass.onError) : noop)
        .pipe($.run.sass ? concat($.concat.name) : noop)
        .pipe($.run.autoprefixer && $.run.sass ? autoprefixer($.autoprefixer.options) : noop)
        .pipe($.run.csscomb && $.run.sass ? csscomb($.csscomb.options) : noop)
        .pipe($.run.csslint && $.run.sass ? csslint($.csslint.options) : noop)
        .pipe($.run.csslint && $.run.sass ? csslint.formatter($.csslint.formatterOptions) : noop)
        .pipe($.run.sass ? gulp.dest(paths.dest.root + '/' + paths.dest.style.folder) : noop)
        .pipe($.run.cleancss && $.run.sass ? rename({ suffix: '.min', basename: $.rename.basename }) : noop)
        .pipe($.run.cleancss && $.run.sass ? cleancss($.cleancss.options, $.cleancss.callback) : noop)
        .pipe($.run.sourcemaps && $.run.sass ? sourcemaps.write($.sourcemaps.writePath, $.sourcemaps.writeOptions) : noop)
        .pipe($.run.cleancss && $.run.sass ? gulp.dest(paths.dest.root + '/' + paths.dest.style.folder) : noop)
        .pipe($.run.cleancss && $.run.sass && plugins.browsersync ? browsersync.stream() : noop);
});

/**
 *  Serve
 */

gulp.task('serve', ['style'], () => {
    var $ = plugins.serve;

    browsersync.init($.options);

    plugins.browsersync = true;

    gulp.watch(getExtensions(paths.dest.style, paths.dest.root), ['style']);
    gulp.watch(getExtensions(paths.dest.html, paths.dest.root)).on('change', browsersync.reload);
});
