const gulp = require('gulp');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const image = require('gulp-image');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const sync = require('browser-sync');
const del = require('del');

// HTML

const html = () => {
  return gulp
    .src(`src/*.html`)
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest(`dist`))
    .pipe(sync.stream());
};

// Styles

const styles = () => {
  return gulp
    .src(`src/styles/index.css`)
    .pipe(
      postcss([
        require(`postcss-import`),
        require(`postcss-media-minmax`),
        require(`autoprefixer`),
        require(`postcss-csso`),
      ])
    )
    .pipe(replace(/\.\.\//g, ''))
    .pipe(gulp.dest(`dist`))
    .pipe(sync.stream());
};

// Scripts

const scripts = () => {
  return gulp
    .src(`src/scripts/index.js`)
    .pipe(
      babel({
        presets: [
          [
            `@babel/preset-env`,
            {
              targets: {
                esmodules: true,
              },
            },
          ],
        ],
      })
    )
    .pipe(terser())
    .pipe(gulp.dest(`dist`))
    .pipe(sync.stream());
};

// Copy

const copy = () => {
  return gulp
    .src([`src/fonts/**/*`, `src/images/**/*`], {
      base: `src`,
    })
    .pipe(image())
    .pipe(gulp.dest(`dist`))
    .pipe(
      sync.stream({
        once: true,
      })
    );
};

// Clean

const clean = () => {
  return del([`dist/**/*`]);
};

// Paths

const paths = () => {
  return gulp
    .src(`dist/*.html`)
    .pipe(
      replace(
        /(<link rel="stylesheet" href=")\.?\/?styles\/(index.css">)/,
        `$1$2`
      )
    )
    .pipe(
      replace(
        /(<script src=")\.?\/?scripts\/(index.js">)/,
        `$1$2`
      )
    )
    .pipe(gulp.dest(`dist`));
};

// Server

const server = () => {
  return sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: `dist`,
    },
  });
};

// Watch

const watch = () => {
  gulp.watch(`src/*.html`, gulp.series(html, paths));
  gulp.watch(`src/styles/**/*.css`, gulp.series(styles));
  gulp.watch(`src/scripts/**/*.js`, gulp.series(scripts));
  gulp.watch([`src/fonts/**/*`, `src/images/**/*`], gulp.series(copy));
};

// Default

exports.default = gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, copy),
  paths,
  gulp.parallel(watch, server)
);
