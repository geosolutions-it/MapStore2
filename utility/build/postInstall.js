const fs = require('fs-extra');
const isInProject = !fs.existsSync('./node_modules/cesium');
const isPackage = !!fs.existsSync('../../node_modules/cesium');
const dirPrefix = isPackage
    ? '../..'
    : isInProject
        ? '..'
        : '.';
fs.removeSync(`${dirPrefix}/node_modules/leaflet-simple-graticule/node_modules`);
fs.removeSync(`${dirPrefix}/node_modules/react-sortable-items/node_modules/react-dom`);
fs.removeSync(`${dirPrefix}/node_modules/geostyler-openlayers-parser/node_modules/@terrestris`); // explicit dependency in package.json
fs.emptyDirSync(`${dirPrefix}/node_modules/mocha`);
fs.copySync(`${dirPrefix}/node_modules/@geosolutions/mocha`, `${dirPrefix}/node_modules/mocha`);

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
