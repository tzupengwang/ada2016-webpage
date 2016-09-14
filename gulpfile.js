'use strict';

const gulp = require('gulp'),
      $ = require('gulp-load-plugins')(),
      browserify = require('browserify'),
      babelify = require('babelify'),
      source = require('vinyl-source-stream'),
      del = require('del'),
      browserSync = require('browser-sync');

const CONFIG = {
    src: {
        pug: 'src/pug/**/*.pug',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.css',
    },
    out: {
        base: './',
        html: './',
        js: './js/',
        css: './css',
    },
    entry: {
        pug: 'src/pug/index.pug',
        js: 'src/js/main.js',
    },
};

gulp.task('browser-sync', () => {
    browserSync.init({
        server: CONFIG.out.base,
        open: false,
    });
});

function logError(err) {
    $.util.log($.util.colors.red('[Error]'), err.toString());
    this.emit('end')
}
gulp.task('pug', () =>
    gulp.src(CONFIG.entry.pug)
        .pipe($.pug())
        .on('error', logError)
        .pipe(gulp.dest(CONFIG.out.html))
        .pipe(browserSync.stream())
);

gulp.task('css', () =>
    gulp.src(CONFIG.src.css)
        .pipe($.postcss([
            require('postcss-short'),
            require('precss'),
        ]))
        .on('error', logError)
        .pipe(gulp.dest(CONFIG.out.css))
        .pipe(browserSync.stream())
);

const ESLINT_CONF = {
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    baseConfig: {
        extends: "eslint:recommended",
    },
    rules: {
        semi: [1, 'always'],
    }
};

gulp.task('eslint', () => 
    gulp.src([CONFIG.src.js])
        .pipe($.eslint(ESLINT_CONF))
        .pipe($.eslint.format())
);

gulp.task('js', () =>
    browserify({entries: [CONFIG.entry.js]})
        .transform(babelify, {
            presets: ['es2015', 'es2016', 'es2017'],
            plugins: ["transform-es2015-modules-commonjs", "syntax-async-functions"],
        })
        //.add('babel-polyfill')
        .bundle()
        .on('error', logError)
        .pipe(source('main.js'))
        .pipe(gulp.dest(CONFIG.out.js))
        .pipe(browserSync.stream({once: true}))
);

gulp.task('watch', () => {
    gulp.watch(CONFIG.src.pug, ['pug']);
    gulp.watch(CONFIG.src.js, ['eslint', 'js']);
    gulp.watch(CONFIG.src.css, ['css']);
});


gulp.task('build', ['pug', 'css', 'eslint', 'js']);

gulp.task('default', ['build', 'watch', 'browser-sync']);

