/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Layers = require('../../../../utils/leaflet/Layers');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const WMSUtils = require('../../../../utils/leaflet/WMSUtils');
const L = require('leaflet');
const objectAssign = require('object-assign');
const {isArray, isEqual} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');


L.TileLayer.WMTS = L.TileLayer.extend({
        defaultWmtsParams: {
        service: "WMTS",
        request: "GetTile",
        version: "1.3.0",
        layer: "",
        style: "",
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
            wmstParams.width = wmtsParams.height = tileSize * 2;
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
        this.matrixIds = options.matrixIds || this.getDefaultMatrix();
        console.log("This is the matrix: "+this.matrixIds);
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

        return url + L.Util.getParamString(this.wmtsParams, url, true) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol
    },
        getDefaultMatrix: function() {
        var e = new Array(22);
        for (var t = 0; t < 22; t++) {
            e[t] = {
                identifier: "EPSG:900913:" + t,
                topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)

            }
        }
        return e
    }
});

L.tileLayer.wmts = function(urls, options) {
    return new L.TileLayer.WMTS(urls, options);
};

function wmsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        service: "WMTS",
        request: "GetTile",
        layer: options.name,
        styles: options.style || "",
        format: options.format || 'image/png',
        tileMatrixSet: "EPSG:900913",
        version: options.version || "1.0.0",
        tileSize: options.tileSize || 256
    }, options.params || {});
}

function getWMSURLs(urls) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmsToLeafletOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        return L.tileLayer.wmts(urls, queryParameters);
    }
});
