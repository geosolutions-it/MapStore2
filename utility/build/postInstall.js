console.log("********** post install **********");

const fs = require('fs-extra');
const path = require('path');
const isInProject = fs.existsSync('./MapStore2');
console.log(isInProject ? "* in project" : "* not in project");

const nodeModules = [
    {
        path: path.join(__dirname, '..', '..', 'node_modules'), // MapStore2, project with submodule or file:MapStore2
        valid: true // sometimes some node_modules are installed also in the submodule
    },
    {
        path: path.join(__dirname, '..', '..', '..', 'node_modules'), // file:MapStore2 symlink installation
        valid: !!fs.existsSync(path.join(__dirname, '..', '..', '..', 'MapStore2')) // check MapStore2 submodule
    },
    {
        path: path.join(__dirname, '..', '..', '..', '..', 'node_modules'), // node_modules/mapstore installation
        valid: !!fs.existsSync(path.join(__dirname, '..', '..', '..', '..', 'node_modules', 'mapstore')) // valid for installation "mapstore": "git+..."
    }
];

function removeModules(nodeModulesPath) {
    const removeModulesList = [
        'leaflet-simple-graticule/node_modules',
        'geostyler-openlayers-parser/node_modules/@terrestris'
    ];
    removeModulesList.forEach((removeModule) => {
        const removePath = path.resolve(nodeModulesPath, removeModule);
        if (fs.existsSync(removePath)) {
            fs.removeSync(removePath);
        }
    });
    /**
     * this is run 2 times because one from the package.json of the project and one from mapstore2 library
     * when run from the project there is an error when the version from mapstore is executed therefore
     * we perform a check before do the copy
     * */
    if (fs.existsSync(path.resolve(nodeModulesPath, '@geosolutions/mocha'))) {
        console.log("* executing the copy of mocha");
        fs.emptyDirSync(path.resolve(nodeModulesPath, 'mocha'));
        fs.copySync(path.resolve(nodeModulesPath, '@geosolutions/mocha'), path.resolve(nodeModulesPath, 'mocha'));
    }
}

nodeModules.forEach((nodeModule) => {
    if (fs.existsSync(nodeModule.path) && nodeModule.valid) {
        console.log('remove in node_modules path', nodeModule.path);
        removeModules(nodeModule.path) 
    }
});
