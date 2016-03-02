const projectName = process.argv[2];
const projectVersion = process.argv[3];
const projectDescription = process.argv[4];
const repoURL = process.argv[5];
const outFolder = process.argv[6];

if (!projectName || !projectVersion || !projectDescription || !repoURL || !outFolder) {
    console.log('Usage: node ./createProject.js <projectName> <projectVersion> <projectDescription> <GitHUB repo URL> <outputFolder>');
    process.exit(1);
}

const fs = require('fs');
const ncp = require('ncp').ncp;

function createPackageJSON() {
    console.log('Creating package.json...');

    const packageJSON = require('./package.json');
    packageJSON.name = projectName;
    packageJSON.version = projectVersion;
    packageJSON.description = projectDescription;
    packageJSON.repository = repoURL;
    packageJSON.scripts = require('./projectScripts.json');

    fs.writeFile(outFolder + '/package.json', JSON.stringify(packageJSON, null, 4), copyStaticFiles);
    console.log('package.json OK');
}

function copyStaticFiles() {
    console.log('Copying static files...');
    var copied = 0;
    var streams = ['.editorconfig', '.eslintrc', '.eslintignore', 'LICENSE'].map(function(fileName) {
       const toWrite = fs.createWriteStream(outFolder + '/' + fileName);
       fs.createReadStream(fileName).pipe(toWrite);
       console.log('Copied ' + fileName);
       return toWrite;
    }).forEach(function(stream) {
        stream.on('finish', function() {
            copied++;
            if(copied == 4) {
                ncp('./project/static', outFolder, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    copyTemplates();
                });
            }
        });
    });
}

function copyTemplates() {
    console.log('Copying templated files...');
    fs.readdir('./project', function (err,files) {
      if (err) {
        return console.log(err);
      }
      files.forEach(function(file, index) {
        fs.stat('./project/' + file, function(err, stats) {
            if (err) {
                return console.log(err);
            }
            if (stats.isFile()) {
                fs.readFile('./project/' + file, 'UTF-8', function(err, data) {
                    data = data.replace(/__PROJECTNAME__/g, projectName);
                    data = data.replace(/__PROJECTDESCRIPTION__/g, projectDescription);
                    data = data.replace(/__REPOURL__/g, repoURL);
                    fs.writeFile(outFolder + '/' + file, data, 'UTF-8', function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log('Copied ' + file);
                        if (index === files.length - 1) {
                            initGit();
                        }
                    });
                });
            }
        });
      });
    });
}

function initGit() {
    console.log('Creating git repo...');

    const git = require('simple-git')( outFolder );
    git.init(function() {
        git.submoduleAdd('https://github.com/geosolutions-it/MapStore2.git', 'MapStore2', function() {
            console.log('git repo OK...');
        });
    });
}

createPackageJSON();










