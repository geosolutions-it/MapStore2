var objectAssign = require('object-assign');

var LeafletUtils = {
    wmsToLeafletOptions: function(source, options) {
        // NOTE: can we use opacity to manage visibility?
        var opacity = options.opacity !== undefined ? options.opacity : 1;
        return objectAssign({
            layers: options.name,
            styles: options.style || "",
            format: options.format || 'image/png',
            transparent: options.transparent !== undefined ? options.transparent : true,
            opacity: opacity
        }, source.baseParams || {}, options.params || {});
    },
    getWMSURL: function( url ) {
        return url.split("\?")[0];
    }
};

module.exports = LeafletUtils;
