const fs = require('fs-extra');
const isInProject = !fs.existsSync('./node_modules/cesium');
const dirPrefix = isInProject ? '..' : '.'
fs.removeSync(`${dirPrefix}/node_modules/leaflet-simple-graticule/node_modules`);
fs.removeSync(`${dirPrefix}/node_modules/react-sortable-items/node_modules/react-dom`);
fs.emptyDirSync(`${dirPrefix}/node_modules/mocha`);
fs.copySync(`${dirPrefix}/node_modules/@geosolutions/mocha`, `${dirPrefix}/node_modules/mocha`);
