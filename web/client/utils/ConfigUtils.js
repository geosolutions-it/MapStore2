var Proj4js = require('proj4');

var ConfigUtils = {
    convertFromLegacy: function(config) {
        var mapConfig = config.map;
        var layers = mapConfig.layers;
        var center = mapConfig.center;
        var zoom = mapConfig.zoom;
        var maxExtent = mapConfig.maxExtent;
        var epsg900913 = new Proj4js.Proj('EPSG:900913');
        var epsg4326 = new Proj4js.Proj('EPSG:4326');
        var xy = new Proj4js.Point(center);
        Proj4js.transform(epsg900913, epsg4326, xy);
        const latLng = {lat: xy.y, lng: xy.x};
        return {
            latLng: latLng,
            zoom: zoom,
            maxExtent: maxExtent, // TODO convert maxExtent
            layers: layers
        };
    }
};

module.exports = ConfigUtils;
