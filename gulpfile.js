/*npm packages required to run gulp.*/
const gulp = require("gulp");
//for cleaning the dist folder.
const del = require("del");
//for merging environment config files.
const merge = require("gulp-merge-json");
//to read and write files
const fs = require("fs");
//for typescript
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
//for minifying js
const uglify = require("gulp-uglify");
var cssMinify = require("gulp-css-minify");

//Reading the command-line argument called config. If it is not present, the default value is DEV.
const argv = require("yargs").argv;
const config = argv.config == undefined ? "DEV" : argv.config;

//removes the existing dist and makes room for the new build.
function clean() {
  return del(["./dist/"]);
}

//moves files from src to dist
function copyLocales() {
  return gulp
    .src(["_locales/**/*.*"], { base: "." })
    .pipe(gulp.dest("./dist/"));
}

function copyAllFiles() {
  copyLocales();
  return gulp
    .src([
      "src/**/*.*",
      "!src/config.json",
      "!src/config.PROD.json",
      "!src/manifest*.json",
      "!src/typings.d.ts",
      "!src/css/*.*",
      "!src/**/*.ts",
    ])
    .pipe(gulp.dest("./dist/"));
}

//Transforms the config.json files, merging the source one with the environment one.
function transformConfig(cb) {
  return transformJson(cb, "config");
}

//Transforms the manifest.json file.
function transformManifest(cb) {
  return transformJson(cb, "manifest");
}

function transformJson(cb, fileName) {
  if (config == "DEV") {
    return gulp.src(`src/${fileName}.json`).pipe(gulp.dest("./dist/"));
  }

  return gulp
    .src([`src/${fileName}.json`, `src/${fileName}.${config}.json`])
    .pipe(
      merge({
        fileName: `${fileName}.json`,
      })
    )
    .pipe(gulp.dest("./dist"));
}

//Writes the transformed config.json file to the scripts folder to allow the Chrome Extension’s .js files access the config values.
function writeConfigJsFile(cb) {
  var content = fs.readFileSync("./dist/config.json", "utf8").trim();
  content = `
  // File generated by gulpfile.js. 
  // DO NOT CHANGE IT DIRECTLY.
  // Edit config.*.json files instead.
  const config = ${content};
  export default config;`;

  fs.mkdirSync("./dist/scripts", { recursive: true }, (err) => {
    if (err) throw err;
  });
  fs.writeFileSync("./dist/scripts/config.js", content);

  fs.mkdirSync("./src/scripts", { recursive: true }, (err) => {
    if (err) throw err;
  });
  fs.writeFileSync("./src/scripts/config.js", content);

  del(["./dist/config.json"]);

  return cb();
}

function compileTypescript() {
  return tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(uglify())
    .pipe(gulp.dest("dist/"));
}

function compileCSS() {
  return gulp
    .src("./src/css/**/*.css")
    .pipe(cssMinify())
    .pipe(gulp.dest("./dist/css/"));
}

//Watches for any change in the src folder and automatically repeat the previous steps.
function watch(cb) {
  if (argv.watch == undefined) return cb();

  return gulp.watch(
    ["src/**/*.*", "!src/scripts/config.js"],
    gulp.series(
      clean,
      compileCSS,
      compileTypescript,
      copyAllFiles,
      transformConfig,
      writeConfigJsFile,
      transformManifest
    )
  );
}

// order in which the functions are run
exports.default = gulp.series(
  clean,
  compileCSS,
  compileTypescript,
  copyAllFiles,
  transformConfig,
  writeConfigJsFile,
  transformManifest,
  watch
);
