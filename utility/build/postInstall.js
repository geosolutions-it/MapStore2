console.log("********** post install **********");

const fs = require('fs-extra');
const isInProject = fs.existsSync('./MapStore2');
console.log(isInProject ? "* in project" : "* not in project");

fs.removeSync(`./node_modules/leaflet-simple-graticule/node_modules`);
fs.removeSync(`./node_modules/react-sortable-items/node_modules/react-dom`);
fs.removeSync(`./node_modules/geostyler-openlayers-parser/node_modules/@terrestris`); // explicit dependency in package.json
/**
 * this is run 2 times because one from the package.json of the project and one from mapstore2 library
 * when run from the project there is an error when the version from mapstore is executed therefore
 * we perform a check before do the copy
 * */
if (fs.existsSync('./node_modules/@geosolutions/mocha')) {
    console.log("* executing the copy of mocha");
    fs.emptyDirSync(`./node_modules/mocha`);
    fs.copySync(`./node_modules/@geosolutions/mocha`, `./node_modules/mocha`);
}

const isPackage = !!fs.existsSync('../../node_modules/mapstore');
const dirPrefix = isPackage
    ? '../..'
    : isInProject
        ? '..'
        : '.';

const isFramework = fs.existsSync(`${dirPrefix}/node_modules/mapstore/framework`);
if (isPackage && !isFramework) {
    // create the framework directory in the package
    fs.emptyDirSync(`${dirPrefix}/node_modules/mapstore/framework`);
    const framework = [
        'actions',
        'api',
        'assets',
        'components',
        'containers',
        'epics',
        'hooks',
        'jsapi',
        'libs',
        'observables',
        'plugins',
        'reducers',
        'selectors',
        'stores',
        'themes',
        'translations',
        'utils',
        'localConfig.json',
        'config.json'
    ];
    framework.forEach(name => {
        fs.copySync(
            `${dirPrefix}/node_modules/mapstore/web/client/${name}`,
            `${dirPrefix}/node_modules/mapstore/framework/${name}`
        );
    });

    const files = fs.readdirSync(`${dirPrefix}/node_modules/mapstore`);

    const excludeRemove = [
        'package.json',
        'framework',
        'node_modules',
        'project',
        'build',
        'utility'
    ];

    files.forEach(name => {
        if (excludeRemove.indexOf(name) === -1) {
            fs.removeSync(`${dirPrefix}/node_modules/mapstore/${name}`);
            console.log(`REMOVED: ${dirPrefix}/node_modules/mapstore/${name}`);
        }
    });
}
