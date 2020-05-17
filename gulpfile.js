const { src, dest, series } = require('gulp');
const minify = require("gulp-minify");
const rename = require('gulp-rename');
const del = require('del');
const sftp = require('gulp-sftp');
const git = require('gulp-git');
const merge = require("merge-stream");

const cleanDist = () => del([ 'htdocs' ]);


function renameFile() {

    return src('src/*.htm')
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('htdocs/'));
}

function minifyScript() {

    return src('src/js/*.js', { allowEmpty: true }) 
        .pipe(minify({noSource: true}))
        .pipe(dest('htdocs/js/'));
}


function uploadSFTP() {

    return src('htdocs/**/*')
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


function copyRessource() {
    return merge([
            src('src/audio/**/*') .pipe(dest('htdocs/audio/')),
            src('src/data/**/*') .pipe(dest('htdocs/data/')),
            src('src/images/**/*') .pipe(dest('htdocs/images/')),
            src('src/lib/**/*') .pipe(dest('htdocs/lib/')),
            src('src/*') .pipe(dest('htdocs/'))
        ]);
}



const build = series(cleanDist, renameFile, minifyScript, copyRessource, pushGitHub, uploadSFTP);

exports.rename = renameFile;
exports.script = minifyScript;
exports.clean = cleanDist;
exports.copy = copyRessource;
exports.git = pushGitHub;
exports.sftp = uploadSFTP
exports.build = build;

exports.default = build;


