const L = require('leaflet');

var WMTS = L.TileLayer.extend({
        defaultWmtsParams: {
        service: "WMTS",
        request: "GetTile",
        version: "1.3.0",
        layer: "",
        style: "",
        tileMatrixPrefix: "",
        tilematrixSet: "",
        format: "image/jpeg"
    },
    initialize: function(urls, options) {
        this._url = urls[0];
        this._urls = urls;
        this._urlsIndex = 0;
        let wmtsParams = L.extend({}, this.defaultWtmsParams);
        let tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (let i in options) {
            // all keys that are not TileLayer options go to WMS params
            if (!this.options.hasOwnProperty(i) && i !== 'crs') {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        this.matrixIds = options.matrixIds || this.getDefaultMatrix(options);
        L.setOptions(this, options);
    },

    getTileUrl: function(tilePoint) { // (Point, Number) -> String
        let map = this._map;
        let crs = map.options.crs;
        let tileSize = this.options.tileSize;
        let nwPoint = tilePoint.multiplyBy(tileSize);
        nwPoint.x += 1;
        nwPoint.y -= 1;
        let sePoint = nwPoint.add([tileSize, tileSize]);
        let nw = crs.project(map.unproject(nwPoint, tilePoint.z));
        let se = crs.project(map.unproject(sePoint, tilePoint.z));
        let tilewidth = se.x - nw.x;
        let t = map.getZoom();
        let ident = this.matrixIds[t].identifier;
        let X0 = this.matrixIds[t].topLeftCorner.lng;
        let Y0 = this.matrixIds[t].topLeftCorner.lat;
        let tilecol = Math.floor((nw.x - X0) / tilewidth);
        let tilerow = -Math.floor((nw.y - Y0) / tilewidth);
        this._urlsIndex++;
        if (this._urlsIndex === this._urls.length) {
            this._urlsIndex = 0;
        }
        const url = L.Util.template(this._urls[this._urlsIndex], {s: this._getSubdomain(tilePoint)});
        return url + L.Util.getParamString(this.wmtsParams, url, true) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
    },
    getDefaultMatrix: function(options) {
        var e = new Array(22);
        // Lint gives an error here: All "var" declarations must be at the top of the function scope
        for (var t = 0; t < 22; t++) {
            e[t] = {
                identifier: options.tileMatrixPrefix + t,
                topLeftCorner: new L.LatLng(options.minx, options.maxx)
            }
        }
        return e
    }
});
module.exports = WMTS;
