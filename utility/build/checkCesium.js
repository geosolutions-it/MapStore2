const fs = require('fs-extra');
const isInProject = !fs.existsSync('./node_modules/cesium');
const dirPrefix = isInProject ? '..' : '.';
const dir = `${dirPrefix}/web/client/libs/Cesium`;

console.log("Is project: " + isInProject);

const copyFromNodeModules = () => {
    console.log("Copying Cesium from node_modules...");
    fs.ensureDirSync(dir);
    fs.copySync(`${dirPrefix}/node_modules/cesium`, dir);
};

const exists = fs.pathExistsSync(dir);
if (!exists) {
    console.log("Cesium not found");
    copyFromNodeModules();
} else {
    const packageInLibs = fs.readJsonSync(dir + '/package.json', { 'throws': false });
    const packageInNodeModules = fs.readJsonSync(`${dirPrefix}/node_modules/cesium/package.json`, { 'throws': false });
    if (!packageInLibs || packageInNodeModules && packageInLibs.version !== packageInNodeModules.version) {
        console.log("Installed: " + (packageInLibs && packageInLibs.version));
        console.log("Required: " + (packageInNodeModules && packageInNodeModules.version));
        console.log("Cesium version is outdated");
        copyFromNodeModules();
    }
    console.log("Cesium installed");
}
