"use strict";

import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import svgSprite from 'gulp-svg-sprite';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import minify from 'gulp-minify';
import babel from 'gulp-babel';
import cache from 'gulp-cached';
import tingpng from 'gulp-tinypng';
import browserSync from 'browser-sync';

// Tinypng Api Key - 500 images limit per month - Get key here: https://tinypng.com/developers
const TINYPNG_API = 'e9aSCEpvwKzzSFKRgEA9FxW11TUJJF2z';

// Distribution Locations
let dist = {
  css: 'css',
  img: 'img',
  js: 'js',
  maps: 'maps', 
  jslib: 'js/lib', 
  fonts: 'fonts'
};

// Source Locations
let source = 'src/';
let bowerSrc = 'bower_components/';
let src = {
  sprite: source + 'img/svg/*.svg',
  styles: {
    location: source + 'scss/**/*.scss',
    autoprefixer: ['last 2 versions', 'safari 6', 'ie 9', 'ios 7', 'android 4']
  },
  scripts: source + 'js/scripts.js',
  plugins: [
    bowerSrc + 'jquery/dist/jquery.js',
    bowerSrc + 'slick-carousel/slick/slick.js',
    ],
  images: source + 'img/**/*.{png,jpg,jpeg}',
  copyTask: {
    jslib: source + 'js/lib/**/*',
    fonts: source + 'fonts/**/*'
  },
  serve: ['css/*.css', 'js/*.js', '*.html']
}

// Handle the error
let onError = (err) => {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);
    this.emit('end');
};

// SVG Sprites
gulp.task('sprite', () => {
  return gulp.src(src.sprite)
    .pipe(plumber({errorHandler: onError}))
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '',
          prefix: '',
          sprite: 'spritemap'
        }
      }
    }))
    .pipe(gulp.dest(dist.img))
    .pipe(notify({ message: 'SVG task complete' }));
});

// CSS
gulp.task('styles', () => {
  return gulp.src(src.styles.location)
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: src.styles.autoprefixer
        }))
    .pipe(sourcemaps.write(dist.maps))
    .pipe(gulp.dest(dist.css))
    .pipe(notify({ message: 'Styles task complete' }));
});

// JS - custom scripts
gulp.task('scripts', () => {
  return gulp.src(src.scripts)
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat('scripts.js'))
      .pipe(minify())
    .pipe(sourcemaps.write(dist.maps))
    .pipe(gulp.dest(dist.js))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// JS - plugins
gulp.task('scripts-plugins', () => {
  return gulp.src(src.plugins)
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(concat('plugins.js'))
      .pipe(minify())
    .pipe(sourcemaps.write(dist.maps))
    .pipe(gulp.dest(dist.js))
    .pipe(notify({ message: 'Plugins task complete' }));
});

// Images
gulp.task('images', () => {
 return gulp.src(src.images)
   .pipe(plumber({errorHandler: onError}))
   .pipe(cache('tinypnging'))
   .pipe(tingpng(TINYPNG_API))
   .pipe(gulp.dest(dist.img))
   .pipe(notify({ message: 'Image Task Completed: <%= file.relative %>' }));
});

// Copy files to dist
gulp.task('copyTask', () => {
  // JS library
  gulp.src(src.copyTask.jslib)
    .pipe(gulp.dest(dist.jslib));
  // Fonts
  gulp.src(src.copyTask.fonts)
    .pipe(gulp.dest(dist.fonts));
});

// Browsersync task - Static server
gulp.task('serve', () => {
    browserSync.init(src.serve, {
        server: {
            baseDir: "./"
        }
    });
});

// Default Tasks
gulp.task('default', ['copyTask', 'styles', 'scripts', 'sprite', 'scripts-plugins', 'images']);

// Watch tasks - gulp watch
gulp.task('watch', ['serve'], () => {
  // SVG files for spritemap
  gulp.watch(src.sprite, ['sprite']);

  // Watch .scss files
  gulp.watch(src.styles.location, ['styles']);

  // Watch scripts.js files
  gulp.watch(src.scripts, ['scripts']);

  // Watch plugin .js files
  gulp.watch(src.plugins, ['scripts-plugins']);

  // Watch image files
  gulp.watch(src.images, ['images']);

  // Watch for .js library files
  gulp.watch('{src.copyTask.jslib, src.copyTask.fonts}', ['copyTask']);
  
});
