/*
	ТАСКИ GULP:
	gulp				Запуск дефолтного gulp таска (sass, js, watch, browserSync) для разработки;
	gulp imagemin		Сжатие картинок
	gulp favicon		Генератор favicon
	gulp build			Сборка проекта в папку prod (очистка, сжатие картинок, удаление всего лишнего);
	gulp clearcache		Очистка кеша gulp. Полезно для очистки кеш картинок и закешированных путей.
*/

var gulp           = require('gulp'),
	gutil          = require('gulp-util' ),
	sass           = require('gulp-sass'),
	browserSync    = require('browser-sync'),
	rename         = require('gulp-rename'),
	del            = require('del'),
	sourcemaps     = require('gulp-sourcemaps'),
	cache          = require('gulp-cache'),
	autoprefixer   = require('gulp-autoprefixer'),
	notify         = require("gulp-notify"),
	tinypng        = require('gulp-tinypng-compress'),
	svgmin         = require('gulp-svgmin'),
	zip            = require('gulp-zip'),
	ico            = require('gulp-to-ico'),
	responsive     = require('gulp-responsive'),
	cssnano        = require('gulp-cssnano');

// РАБОТА С SASS ФАЙЛАМИ
gulp.task('sass:main', function() {
	return gulp.src('dev/scss/main.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on("error", notify.onError({
		title: "Error compiling SASS",
	})))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dev/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('sass:libs', function() {
	return gulp.src('dev/scss/libs.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on("error", notify.onError({
		title: "Error compiling SASS LIBS",
	})))
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dev/css'))
	.pipe(browserSync.reload({stream: true}));
});

// РАБОТА С КАРТИНКАМИ
gulp.task('imagemin:tinypng', function() {
	gulp.src('dev/img/**/*{png,jpg,jpeg}')
	.pipe(tinypng({
		key: 'kEx97Kwcl6gt8PXj1VnvLimN9IXXoppF',
		log: true,
		summarise: true,
		parallel: true,
		parallelMax: 999,
		sigFile: 'dev/img/.tinypng-sigs',
		sameDest: true
	}).on("error", notify.onError({
		title: "TinyPNG error",
	})))
	.pipe(gulp.dest('dev/img'));
});

gulp.task('imagemin:svg', function() {
	return gulp.src('dev/img/**/*.svg')
	.pipe(svgmin())
	.pipe(gulp.dest('dev/img'));
});

gulp.task('imagemin', ['imagemin:tinypng', 'imagemin:svg']);

// FAVICON GENERATOR
gulp.task('favicon:ico', function() {
	return gulp.src('dev/img/favicon/apple-touch-icon-144x144.png')
		.pipe(ico('favicon.ico', { resize: true, sizes: [48] }))
		.pipe(gulp.dest('dev/img/favicon'));
});

gulp.task('favicon:resize', function() {
	return gulp.src(['dev/img/favicon/apple-touch-icon-144x144.png'])
	.pipe(responsive({
		'*.png': [
			{
				width: 114,
				rename: 'apple-touch-icon-114x114.png'
			},

			{
				width: 72,
				rename: 'apple-touch-icon-72x72.png'
			},

			{
				width: 57,
				rename: 'apple-touch-icon.png'
			}
		],
	}, {
		compressionLevel: 9,
		progressive: false,
		withoutAdaptiveFiltering: true,
		withMetadata: false,
	}))
	.pipe(gulp.dest('dev/img/favicon/'));
});

gulp.task('favicon', ['favicon:ico', 'favicon:resize']);

// ZIP-АРХИВАЦИЯ ПРОЕКТА
gulp.task('zip:prod', function() {
	gulp.src('prod/**')
		.pipe(zip('prod.zip'))
		.pipe(gulp.dest(''));
})

gulp.task('zip:dev', function() {
	gulp.src('dev/**')
		.pipe(zip('dev.zip'))
		.pipe(gulp.dest(''));
})

// LIVERELOAD
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'dev'
		},
		notify: true,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

// СЛЕЖЕНИЕ ЗА ФАЙЛАМИ
gulp.task('watch', ['sass:main', 'sass:libs', 'browser-sync'], function() {
	// SCSS
	gulp.watch('dev/scss/**/*.scss', ['sass:main']);
	gulp.watch('dev/libs/**/*.scss', ['sass:libs']);
	// JS
	gulp.watch('dev/js/**/*.js', browserSync.reload);
	gulp.watch('dev/libs/**/*.js', browserSync.reload);
	// HTML
	gulp.watch('dev/*.html', browserSync.reload);
	// IMAGES
	gulp.watch('dev/img/**.*', browserSync.reload);
});

// СБОРКА ПРОЕКТА
gulp.task('build', ['removeprod', 'imagemin', 'favicon', 'sass:main', 'sass:libs'], function() {

	var buildFiles = gulp.src('dev/*.html')
		.pipe(gulp.dest('prod'));

	var buildCss = gulp.src([
		'dev/css/main.css',
		'dev/css/libs.min.css',
	])
		.pipe(gulp.dest('prod/css'));

	var buildMainJs = gulp.src('dev/js/common.js',)
		.pipe(gulp.dest('prod/js'));

	var buildJsLibs = gulp.src('dev/libs/**/*.js',)
		.pipe(gulp.dest('prod/libs'));

	var buildFonts = gulp.src('dev/fonts/**/*',)
		.pipe(gulp.dest('prod/fonts'));

	var buildImages = gulp.src('dev/img/**/*')
		.pipe(gulp.dest('prod/img'));

	var buildFavicon = gulp.src('dev/img/favicon/favicon.ico')
		.pipe(gulp.dest('prod/img/favicon'));

});

gulp.task('removeprod', function() { return del.sync('prod'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);