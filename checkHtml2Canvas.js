var existsFile = require('exists-file');

var exists = existsFile('./web/client/libs/html2Canvas/build/html2Canvas.js');
if (!exists) {
    process.exit(0);
}
process.exit(1);