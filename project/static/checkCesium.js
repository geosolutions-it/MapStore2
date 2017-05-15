var existsFile = require('exists-file');
 
var exists = existsFile('./libs/Cesium/Build/Cesium/Cesium.js');
if (!exists) {
    process.exit(0);
}
process.exit(1);