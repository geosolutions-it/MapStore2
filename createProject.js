let projectType = process.argv[2];
let projectName = process.argv[3];
let projectVersion = process.argv[4];
let projectDescription = process.argv[5];
let repoURL = process.argv[6];
let outFolder = process.argv[7];
const project = require('./utility/projects/projectLib');
const denodeify = require('denodeify');
const readline = require('readline-promise').default;

const paramsDesc = [{
    label: 'Project Type (standard): ',
    name: 'projectType',
    "default": 'standard',
    validate: () => true
}, {
    label: 'Project Name: ',
    name: 'projectName',
    "default": '',
    validate: (val) => val !== ''
}, {
    label: 'Project Version (1.0.0): ',
    name: 'projectVersion',
    "default": '1.0.0',
    validate: () => true
}, {
    label: 'Project Description (Project Name): ',
    name: 'projectDescription',
    "default": '',
    validate: () => true
}, {
    label: 'Repository URL: ',
    name: 'repoURL',
    "default": undefined,
    validate: () => true
}, {
    label: 'Output folder: ',
    name: 'outFolder',
    "default": '',
    validate: (val) => val !== ''
}];

function doWork(params) {
    const fs = require('fs');
    const mkdirp = denodeify(require('mkdirp'));
    const readdir = denodeify(fs.readdir);

    const options = {
        name: params.projectName,
        version: params.projectVersion,
        description: params.projectDescription || params.projectName,
        repository: params.repoURL,
        scripts: require('./utility/projects/projectScripts.json'),
        dependencies: {
            "mapstore2": "file:MapStore2"
        }
    };

    const projectFolder = './project/' + params.projectType;

    readdir(projectFolder)
        .then(() => {
            return mkdirp(params.outFolder);
        })
        .then(() => {
            process.stdout.write('Out folder created (' + params.outFolder + ')\n');
            return project.createPackageJSON(options, params.outFolder);
        })
        .then(() => {
            process.stdout.write('package.json file created\n');
            return project.copyStaticFiles(projectFolder + '/static', params.outFolder, options, ['.editorconfig', '.eslintrc', '.eslintignore', 'LICENSE.txt', 'Dockerfile']);
        })
        .then(() => {
            process.stdout.write('copied static files\n');
            return project.copyTemplates('docker', params.outFolder + "/docker", options);
        })
        .then(() => {
            process.stdout.write('docker folder\n');
            process.stdout.write('Copying template files\n');
            return project.copyTemplates(projectFolder + '/templates', params.outFolder, options);
        })
        .then(() => {
            process.stdout.write('Templates copied\n');
            return project.initGit(params.outFolder);
        })
        .then(() => {
            process.stdout.write('git init\n');
            return project.updateSubmoduleBranch(params.outFolder);
        })
        .then(() => {
            process.stdout.write('git repo OK!\n');
            process.exit();
        })
        .catch((err) => {
            process.stderr.write(err + '\n');
        });
}

function readParam(rl, params, result) {
    return new Promise((resolve, reject) => {
        if (params.length === 0) {
            resolve(result);
        } else {
            const [param, ...other] = params;
            rl.questionAsync(param.label).then((answer) => {
                result[param.name] = answer || param.default;
                if (param.validate(result[param.name])) {
                    resolve(readParam(rl, other, result));
                } else {
                    reject(new Error(`the ${param.name}: ${answer} is not valid`));
                }
            });
        }
    });
}

function readParams() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return readParam(rl, paramsDesc, {});
}
if (process.argv.length === 2) {
    readParams().then((params) => {
        doWork(params);
    }).catch((e) => {
        throw new Error(e.message);
    });
} else if (!projectType || !projectName || !projectVersion || !projectDescription || !repoURL || !outFolder) {
    process.stdout.write('Usage: node ./createProject.js <projectType> <projectName> <projectVersion> <projectDescription> <GitHUB repo URL> <outputFolder>\n');
    throw new Error("Wrong parameters!");
} else {
    doWork({projectType, projectName, projectDescription, projectVersion, repoURL, outFolder});
}
