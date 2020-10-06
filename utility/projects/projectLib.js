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

    const packageJSON = assign({}, require('../../package.json'), options);
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

/**
 * it does a checkout to a specified folder which in general is rootProject/MapStore2
 * @param {string} outFolder the folder where to apply the checkout
 * @return {Promise} the promise to continue the flow of project creation
 */
const updateSubmoduleBranch = (outFolder) => {
    const git = require('simple-git')();
    const gitProjectMs2 = require('simple-git')(`${outFolder}/MapStore2`);

    return new Promise((resolve, reject) => {
        try {
            git.branchLocal( (err, data) => {
                if (err) {
                    reject(err);
                }
                process.stdout.write("doing checkout to the branch: ", data.current);
                gitProjectMs2.checkout(data.current, null, (error) => {
                    if (error) {
                        reject(error);
                    }
                    process.stdout.write("checkout done");
                    resolve();
                });
            });
        } catch (e) {
            process.stdout.write("error");
            process.stdout.write(e);
            reject(e);
        }
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
        baseFiles.map(function(filePath) {
            const fileName = filePath.indexOf('/') === -1 ? filePath : filePath.split('/').reverse()[0];
            const toWrite = fs.createWriteStream(outFolder + '/' + fileName);
            fs.createReadStream(filePath).pipe(toWrite);
            process.stdout.write('Copied ' + filePath + '\n');
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
    copyStaticFiles,
    updateSubmoduleBranch
};
