'use strict';

var browsersync     = require('browser-sync').create(),
    gulp            = require('gulp'),
    autoprefixer    = require('gulp-autoprefixer'),
    cleancss        = require('gulp-clean-css'),
    concat          = require('gulp-concat'),
    csscomb         = require('gulp-csscomb'),
    imagemin        = require('gulp-imagemin'),
    csslint         = require('gulp-csslint'),
    jshint          = require('gulp-jshint'),
    rename          = require('gulp-rename'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify');

var noop            = () => { return require("through2").obj(); };

/**
 *  Config
 */

var paths = {
    src: {
        root:       './src',
        html:       { folder: '.',          extensions: ['*.html', '*.htm']},
        style:      { folder: 'scss',       extensions: ['*.scss', '*.sass', '*.css'] },
        scripts:    { folder: 'scripts',    extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg'] },
        fonts:      { folder: 'fonts',      extensions: ['*.ttf', '*.eot', '*.otf', '*.woff', '*.woff2'] },
    },
    dest: {
        root:       './dist',
        html:       { folder: '.',          extensions: ['*.html', '*.htm']},
        style:      { folder: 'css',        extensions: ['*.css'] },
        scripts:    { folder: 'js',         extensions: ['*.js'] },
        images:     { folder: 'images',     extensions: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg'] },
        fonts:      { folder: 'fonts',      extensions: ['*.ttf', '*.eot', '*.otf', '*.woff', '*.woff2'] },
    }
};

var plugins = {
    browsersync: false,
    html: {},
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
    scripts: {
        run: {
            jshint: true,
            uglify: true,
            sourcemaps: true
        },
        jshint: {
            reporter: 'default'
        },
        sourcemaps: {
            options: {},
            writeOptions: {},
            writePath: './'
        },
        concat: {
            name: 'app.js'
        },
        rename: {
            basename: 'app'
        }
    },
    images: {
        run: {
            imagemin: true
        },
        imagemin: {
            options: {
                interlaced: true,
                progressive: true,
                optimizationLevel: 5,
                svgoPlugins: [{ removeViewBox: true }]
            }
        }
    },
    fonts: {},
    serve: {
        options: {
            server: paths.dest.root,
            ghostMode: false,
            logFileChanges: false,
            reloadOnRestart: true,
            notify: false
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
 *  HTML
 */

gulp.task('html', () => {
    var $ = plugins.html;

    return gulp.src(getExtensions(paths.src.html, paths.src.root))
        .pipe(gulp.dest(paths.dest.root + '/' + paths.dest.html.folder));
});

/**
 *  Style
 */

gulp.task('style', () => {
    var $ = plugins.style;

    return gulp.src(getExtensions(paths.src.style, paths.src.root))
        .pipe($.run.sourcemaps && $.run.sass    ? sourcemaps.init($.sourcemaps.options)                                 : noop())
        .pipe($.run.sass                        ? sass($.sass.options).on('error', $.sass.onError)                      : noop())
        .pipe($.run.sass                        ? concat($.concat.name)                                                 : noop())
        .pipe($.run.autoprefixer && $.run.sass  ? autoprefixer($.autoprefixer.options)                                  : noop())
        .pipe($.run.csscomb && $.run.sass       ? csscomb($.csscomb.options)                                            : noop())
        .pipe($.run.csslint && $.run.sass       ? csslint($.csslint.options)                                            : noop())
        .pipe($.run.csslint && $.run.sass       ? csslint.formatter($.csslint.formatterOptions)                         : noop())
        .pipe($.run.sass                        ? gulp.dest(paths.dest.root + '/' + paths.dest.style.folder)            : noop())
        .pipe($.run.cleancss && $.run.sass      ? rename({ suffix: '.min', basename: $.rename.basename })               : noop())
        .pipe($.run.cleancss && $.run.sass      ? cleancss($.cleancss.options, $.cleancss.callback)                     : noop())
        .pipe($.run.sourcemaps && $.run.sass    ? sourcemaps.write($.sourcemaps.writePath, $.sourcemaps.writeOptions)   : noop())
        .pipe(gulp.dest(paths.dest.root + '/' + paths.dest.style.folder))
        .pipe(plugins.browsersync               ? browsersync.stream()                                                  : noop());
});

/**
 *  Scripts
 */

gulp.task('scripts', () => {
    var $ = plugins.scripts;

    return gulp.src(getExtensions(paths.src.scripts, paths.src.root))
        .pipe($.run.jshint                      ? jshint() : noop())
        .pipe($.run.jshint                      ? jshint.reporter($.jshint.reporter)                                    : noop())
        .pipe($.run.sourcemaps && $.run.uglify  ? sourcemaps.init($.sourcemaps.options)                                 : noop())
        .pipe(concat($.concat.name))
        .pipe(gulp.dest(paths.dest.root + '/' + paths.dest.scripts.folder))
        .pipe($.run.uglify                      ? uglify()                                                              : noop())
        .pipe($.run.uglify                      ? rename({ suffix: '.min', basename: $.rename.basename })               : noop())
        .pipe($.run.sourcemaps && $.run.uglify  ? sourcemaps.write($.sourcemaps.writePath, $.sourcemaps.writeOptions)   : noop())
        .pipe(gulp.dest(paths.dest.root + '/' + paths.dest.scripts.folder))
        .pipe(plugins.browsersync               ? browsersync.stream()                                                  : noop());
});

/**
 *  Images
 */

gulp.task('images', () => {
    var $ = plugins.images;

    return gulp.src(getExtensions(paths.src.images, paths.root))
        .pipe($.run.imagemin                    ? imagemin($.imagemin.options)                                          : noop())
        .pipe(gulp.dest(paths.dest.root + '/' + paths.dest.images.folder))
        .pipe(plugins.browsersync               ? browsersync.stream()                                                  : noop());
});

/**
 *  Fonts
 */

gulp.task('fonts', () => {
    var $ = plugins.fonts;

    return gulp.src(getExtensions(paths.src.fonts, paths.src.root))
        .pipe(gulp.dest(gulp.dest.root + '/' + paths.dest.fonts.folder))
        .pipe(plugins.browsersync               ? browsersync.stream()                                                  : noop());
});

/**
 *  Default (build all)
 */

gulp.task('default', ['html', 'style', 'scripts', 'images', 'fonts']);

/**
 *  Serve
 */

gulp.task('serve', ['default'], () => {
    var $ = plugins.serve;

    browsersync.init($.options);

    plugins.browsersync = true;

    gulp.watch(getExtensions(paths.src.html,    paths.src.root), ['html']);
    gulp.watch(getExtensions(paths.src.style,   paths.src.root), ['style']);
    gulp.watch(getExtensions(paths.src.scripts, paths.src.root), ['scripts']);
    gulp.watch(getExtensions(paths.src.images,  paths.src.root), ['images']);
    gulp.watch(getExtensions(paths.src.fonts,   paths.src.root), ['fonts']);
    gulp.watch(getExtensions(paths.dest.html,   paths.dest.root)).on('change', browsersync.reload);
});
