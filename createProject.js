const projectType = process.argv[2];
const projectName = process.argv[3];
const projectVersion = process.argv[4];
const projectDescription = process.argv[5];
const repoURL = process.argv[6];
const outFolder = process.argv[7];
const project = require('./projectLib');
const denodeify = require('denodeify');

if (!projectType || !projectName || !projectVersion || !projectDescription || !repoURL || !outFolder) {
    process.stdout.write('Usage: node ./createProject.js <projectType> <projectName> <projectVersion> <projectDescription> <GitHUB repo URL> <outputFolder>\n');
    throw new Error("Wrong parameters!");
}

const fs = require('fs');
const mkdirp = denodeify(require('mkdirp'));
const readdir = denodeify(fs.readdir);

const options = {
    name: projectName,
    version: projectVersion,
    description: projectDescription,
    repository: repoURL,
    scripts: require('./projectScripts.json')
};

const projectFolder = './project/' + projectType;

readdir(projectFolder)
    .then(() => {
        return mkdirp(outFolder);
    })
    .then(() => {
        process.stdout.write('Out folder created (' + outFolder + ')\n');
        return project.createPackageJSON(options, outFolder);
    })
    .then(() => {
        process.stdout.write('package.json file created\n');
        return project.copyStaticFiles(projectFolder + '/static', outFolder, options, ['.editorconfig', '.eslintrc', '.eslintignore', 'LICENSE.txt', '.babelrc']);
    })
    .then(() => {
        process.stdout.write('Static files copied\n');
        process.stdout.write('Copying template files\n');
        return project.copyTemplates(projectFolder + '/templates', outFolder, options);
    })
    .then(() => {
        process.stdout.write('Templates copied\n');
        return project.initGit(outFolder);
    })
    .then(() => {
        process.stdout.write('git repo OK!\n');
    })
    .catch((err) => {
        process.stderr.write(err + '\n');
    });
