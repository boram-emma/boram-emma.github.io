var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var plumber = require('gulp-plumber');
var cp = require('child_process');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

/*
* Compile and minify sass
*/
gulp.task('sass', function() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(csso())
		.pipe(gulp.dest('assets/css/'))
});

/*
* Copy compiled CSS into _site (for browser-sync preview)
*/
gulp.task('copy-css-to-site', function () {
  return gulp.src('assets/css/**/*.css')
    .pipe(gulp.dest('_site/assets/css'));
});

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
*/

gulp.task('jekyll-build', function (done) {
	return cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'})
		.on('close', done);
});


/*
 * Rebuild Jekyll & reload browserSync
 */
gulp.task('jekyll-rebuild', gulp.series(['sass', 'jekyll-build', 'copy-css-to-site'], function (done) {
	browserSync.reload();
	done();
}));

/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task('browser-sync', gulp.series(['sass', 'jekyll-build', 'copy-css-to-site'], function(done) {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
	done()
}));



/*
* Compile fonts
*/
gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*.{ttf,woff,woff2}')
		.pipe(plumber())
		.pipe(gulp.dest('assets/fonts/'))
});

/*
 * Minify images
 */
gulp.task('imagemin', function() {
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'))
});

/**
 * Compile and minify js
 */
gulp.task('js', function() {
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
});

gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.scss', gulp.series(['sass', 'jekyll-rebuild']));
  gulp.watch('src/js/**/*.js', gulp.series(['js', 'jekyll-rebuild']));
  gulp.watch('src/fonts/**/*.{tff,woff,woff2}', gulp.series(['fonts']));
  gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series(['imagemin']));
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series(['jekyll-rebuild']));
});

gulp.task('default', gulp.series(['js', 'sass', 'fonts', 'browser-sync', 'watch']));