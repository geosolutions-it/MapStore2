const path = require('path');
const {NormalModuleReplacementPlugin} = require('webpack');

// dxf-parser 1.1.2 sets its log level at import, which otherwise writes browser
// storage (with a cookie fallback). Parsing does not need that persistence.
module.exports = () => new NormalModuleReplacementPlugin(/^loglevel$/, resource => {
    if (/[/\\]dxf-parser[/\\]/.test(resource.context)) {
        resource.request = path.join(__dirname, '..', 'web', 'client', 'libs', 'DxfLogger.js');
    }
});
