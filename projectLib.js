const assign = require('object-assign');
const denodeify = require('denodeify');
const fs = require('fs');
const mkdirp = denodeify(require('mkdirp'));
const writeFile = denodeify(fs.writeFile);
const readdir = denodeify(fs.readdir);
const readFile = denodeify(fs.readFile);
const stat = denodeify(fs.stat);

const ncp = denodeify(require('ncp').ncp);

const createPackageJSON = (options, outFolder) => {
    process.stdout.write('Creating package.json...\n');

    const packageJSON = assign({}, require('./package.json'), options);
    return writeFile(outFolder + '/package.json', JSON.stringify(packageJSON, null, 4));
};

const initGit = (outFolder) => {
    process.stdout.write('Creating git repo...\n');

    const git = require('simple-git')(outFolder);
    return new Promise((resolve, reject) => {
        git.init(() => {
            git.submoduleAdd('https://github.com/geosolutions-it/MapStore2.git', 'MapStore2', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

const copyTemplates = (basePath, outFolder, options, level = 0, path = '') => {
    return readdir(basePath + path)
        .then(files => {
            return Promise.all(
                files.map((file) => {
                    return stat(basePath + path + '/' + file)
                        .then((stats) => {
                            if (stats.isFile()) {
                                const filePath = basePath + path + '/' + file;
                                return readFile(filePath, 'UTF-8')
                                    .then((content) => {
                                        return mkdirp(outFolder + path)
                                            .then(() => {
                                                process.stdout.write('Copying ' + filePath + '\n');
                                                const outContent = content
                                                    .replace(/__PROJECTNAME__/g, options.name)
                                                    .replace(/__PROJECTDESCRIPTION__/g, options.description)
                                                    .replace(/__PROJECTVERSION__/g, options.version)
                                                    .replace(/__REPOURL__/g, options.repository);
                                                return writeFile(outFolder + path + '/' + file, outContent, 'UTF-8');
                                            });
                                    });
                            } else if (stats.isDirectory()) {
                                return copyTemplates(basePath, outFolder, options, level + 1, path + '/' + file);
                            }
                            return new Promise(resolve => { resolve(); });
                        });
                })
            );
        });
};

const copyStaticFiles = (baseFolder, outFolder, options, baseFiles) => {
    return new Promise((resolve, reject) => {
        process.stdout.write('Copying static files...\n');
        let copied = 0;
        const toBeCopied = baseFiles.length;
        baseFiles.map(function(fileName) {
            const toWrite = fs.createWriteStream(outFolder + '/' + fileName);
            fs.createReadStream(fileName).pipe(toWrite);
            process.stdout.write('Copied ' + fileName + '\n');
            return toWrite;
        }).forEach(function(stream) {
            stream.on('finish', function() {
                copied++;
                if (copied === toBeCopied) {
                    ncp(baseFolder, outFolder).then(resolve).catch(reject);
                }
            });
        });
    });
};

module.exports = {
    initGit,
    createPackageJSON,
    copyTemplates,
    copyStaticFiles
};
