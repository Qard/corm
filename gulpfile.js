var babelSettings = require('./test/pre')
var gulp = require('gulp')
var babel = require('gulp-babel')
var mocha = require('gulp-mocha')
var istanbul = require('gulp-istanbul')
var coveralls = require('gulp-coveralls')
var spawn = require('child_process').spawn

gulp.task('build', function () {
  return gulp.src('lib/*.js')
    .pipe(babel(babelSettings))
    .pipe(gulp.dest('dist'))
})

gulp.task('test', ['build'], function () {
  return gulp.src('test/**/*.js', { read: false })
    .pipe(test())
    .on('end', process.exit)
})

gulp.task('pre-coverage', ['build'], function () {
  return gulp.src(['dist/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
})

gulp.task('coverage', ['pre-coverage'], function () {
  return gulp.src('test/**/*.js', { read: false })
    .pipe(test())
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: 85
      }
    }))
    .on('end', process.exit)
})

gulp.task('coveralls', ['coverage'], function () {
  return gulp.src('coverage/**/lcov.info')
    .pipe(coveralls())
})

gulp.task('watch', function () {
  gulp.watch([
    'lib/**/*.js',
    'test/**/*.js'
  ], function () {
    return spawn('gulp', ['coverage'], {
      stdio: 'inherit'
    })
  })
})

gulp.task('default', [
  'watch'
])

function test () {
  return mocha({
    reporter: 'spec',
    require: ['should']
  })
}
