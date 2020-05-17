const { src, dest, series } = require('gulp');
const minify = require("gulp-minify");
const rename = require('gulp-rename');
const del = require('del');
const sftp = require('gulp-sftp');
const git = require('gulp-git');

const cleanDist = () => del([ 'htdocs' ]);


function renameFile() {

    return src('src/*.htm')
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('htdocs/'));
}

function minifyScript() {

    return src('src/js/main.js', { allowEmpty: true }) 
        .pipe(minify({noSource: true}))
        .pipe(dest('htdocs/js'))
}


function uploadSFTP() {

    return src('htdocs/*')
        .pipe(sftp({
            host: 'sftp.sd3.gpaas.net',
            user: '3579438',            
            remotePath: '/lamp0/web/vhosts/projet.hacktech.dev/htdocs/chloepassiondeathruction',
        }));
}


function pushGitHub(done) {

  return git.push('origin', 'master', function (err) {
    if (err) throw err;
    if (done) done();
  });
}


const build = series(cleanDist, renameFile, minifyScript, pushGitHub, uploadSFTP);

exports.rename = renameFile;
exports.script = minifyScript;
exports.clean = cleanDist;
exports.git = pushGitHub;
exports.sftp = uploadSFTP
exports.build = build;

exports.default = build;


