var objectAssign = require('object-assign');

var WMSUtils = {
    wmsToLeafletOptions: function(options) {
        var opacity = options.opacity !== undefined ? options.opacity : 1;
        // NOTE: can we use opacity to manage visibility?
        return objectAssign({
            layers: options.name,
            styles: options.style || "",
            format: options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity
        }, options.params || {});
    },
    getWMSURL: function( url ) {
        return url.split("\?")[0];
    }
};

module.exports = WMSUtils;
