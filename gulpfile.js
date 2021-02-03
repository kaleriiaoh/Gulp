//Подключаем галп
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добапвление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Оптимизация стилей
const cleanCSS = require('gulp-clean-css');
//Оптимизация скриптов
const uglify = require('gulp-uglify');
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass');
//Модуль для сжатия изображений
const imagemin = require('gulp-imagemin');
//Модуль переименовывания файлов
const rename = require('gulp-rename');
//Шрифты
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fs = require('fs');




//Порядок подключения файлов со стилями
const styleFiles = [
   './src/scss/color.scss',
   './src/scss/_fonts.scss',
   './src/scss/main.scss'
]
//Порядок подключения js файлов
const scriptFiles = [
   './src/js/lib.js',
   './src/js/main.js'
]

//Для шрифтов
gulp.task ('fonts', () => {
   gulp.src('./src/fonts/**.ttf')
       .pipe(ttf2woff())
       .pipe(gulp.dest('./dist/fonts/'))
   return gulp.src('./src/fonts/**.ttf')
       .pipe(ttf2woff2())
       .pipe(gulp.dest('./dist/fonts/'))
});



//Тоже для шрифтов
const cb = () => {}

let srcFonts = './src/scss/_fonts.scss';
let appFonts = './dist/fonts/';

gulp.task ('fontsStyle', (done) => {
   let file_content = fs.readFileSync(srcFonts);

   fs.writeFile(srcFonts, '', cb);
   fs.readdir(appFonts, function (err, items) {
      if (items) {
         let c_fontname;
         for (var i = 0; i < items.length; i++) {
            let fontname = items[i].split('.');
            fontname = fontname[0];
            if (c_fontname != fontname) {
               fs.appendFile(srcFonts, '@include font-face("' + fontname + '", "' + fontname + '", 400);\r\n', cb);
            }
            c_fontname = fontname;
         }
      }
   })

   done();
});

//Таск для обработки стилей
gulp.task('styles', () => {
   //Шаблон для поиска файлов CSS
   //Всей файлы по шаблону './src/scss/**/*.scss'
   return gulp.src(styleFiles)
      .pipe(sourcemaps.init())
      //Указать stylus() , sass() или less()
      .pipe(sass())
      //Объединение файлов в один
      .pipe(concat('style.css'))
      //Добавить префиксы
      .pipe(autoprefixer({
         cascade: false
      }))
      //Минификация CSS
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(rename({
         suffix: '.min'
      }))
      //Выходная папка для стилей
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.stream());
});

//Таск для обработки скриптов
gulp.task('scripts', () => {
   //Шаблон для поиска файлов JS
   //Всей файлы по шаблону './src/js/**/*.js'
   return gulp.src(scriptFiles)
      //Объединение файлов в один
      .pipe(concat('main.js'))
      //Минификация JS
      .pipe(uglify({
         toplevel: true
      }))
      .pipe(rename({
         suffix: '.min'
      }))
      //Выходная папка для скриптов
      .pipe(gulp.dest('./dist/js'))
      .pipe(browserSync.stream());
});

//Таск для очистки папки dist
gulp.task('del', () => {
   return del(['dist/*'])
});

//Таск для сжатия изображений
gulp.task('img-compress', ()=> {
   return gulp.src('./src/img/**')
   .pipe(imagemin({
      progressive: true
   }))
   .pipe(gulp.dest('./dist/img/'))
});



//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
   browserSync.init({
      server: {
         baseDir: "./"
      }
   });
   //Следить за добавлением новых изображений
   gulp.watch('./src/img/**', gulp.series('img-compress'))
   //Следить за файлами со стилями с нужным расширением
   gulp.watch('./src/scss/**/*.scss', gulp.series('styles'))
   //Следить за JS файлами
   gulp.watch('./src/js/**/*.js', gulp.series('scripts'))
   //При изменении HTML запустить синхронизацию
   gulp.watch("./*.html").on('change', browserSync.reload)
   //Следить за шрифтами
   gulp.watch('./src/fonts/**.ttf',gulp.series('fonts'))
   gulp.watch('./src/fonts/**.ttf',gulp.series('fontsStyle'));
});

//Таск по умолчанию, Запускает del, styles, scripts, img-compress и watch
gulp.task('default', gulp.series('del', gulp.parallel('styles', 'scripts', 'img-compress'), 'fonts', 'fontsStyle', 'watch'));
