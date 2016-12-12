
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Layers = require('../../../../utils/leaflet/Layers');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const WMTSUtils = require('../../../../utils/leaflet/WMTSUtils');
const L = require('leaflet');
const objectAssign = require('object-assign');
const {isArray, isEqual} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');

L.TileLayer.WMTS = L.TileLayer.extend({

    /*defaultWmtsParams: {
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        layer: '',
        style: '',
        tilematrixSet: '',
        format: 'image/jpeg'
    },*/

    initialize: function(urls, options) { // (String, Object)
        this._url = urls[0];
        this._urls = urls;

        this._urlsIndex = 0;
        let wmtsParams = L.extend({}, this.defaultWmtsParams);
        let tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (const i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (!this.options.hasOwnProperty(i) && i !== "matrixIds") {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        // this.matrixIds = options.matrixIds || this.getDefaultMatrix();
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },

    getTileUrl: function(tilePoint, zoom) { // (Point, Number) -> String
        var map = this._map;
        const crs = map.options.crs;
        const tileSize = this.options.tileSize;
        const nwPoint = tilePoint.multiplyBy(tileSize);
        // +/-1 in order to be on the tile
        nwPoint.x += 1;
        nwPoint.y -= 1;
        const sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
        const nw = crs.project(map.unproject(nwPoint, zoom));
        const se = crs.project(map.unproject(sePoint, zoom));
        /* const tilewidth = se.x - nw.x;
        const ident = this.matrixIds[zoom].identifier;
        const X0 = this.matrixIds[zoom].topLeftCorner.lng;
        const Y0 = this.matrixIds[zoom].topLeftCorner.lat;
        const tilecol = Math.floor((nw.x - X0) / tilewidth);
        const tilerow = -Math.floor((nw.y - Y0) / tilewidth);
        const url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});
        return url + L.Util.getParamString(this.wmtsParams, url) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;*/
        let bbox = this.wmtsParams.CRS === L.CRS.EPSG4326 ?
            [se.y, nw.x, nw.y, se.x].join(',') :
            [nw.x, se.y, se.x, nw.y].join(',');
        this._urlsIndex++;
        if (this._urlsIndex === this._urls.length) {
            this._urlsIndex = 0;
        }
        const url = L.Util.template(this._urls[this._urlsIndex], {s: this._getSubdomain(tilePoint)});

        return url + L.Util.getParamString(this.wmtsParams, url, true) + '&BBOX=' + bbox;
    },

    setParams: function(params, noRedraw) {
        L.extend(this.wmtsParams, params);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    }
    /*getDefaultMatrix: function() {
        /**
         * the matrix3857 represents the projection
         * for in the IGN WMTS for the google coordinates.
         *
        var matrixIds3857 = new Array(22);
        for (let i = 0; i < 22; i++) {
            matrixIds3857[i] = {
                identifier: "" + i,
                topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)
            };
        }
        return matrixIds3857;
    }*/
});

L.tileLayer.wmts = function(url, options) {
    return new L.TileLayer.WMTS(url, options);
};

function tileMatrixValue(option) {
    const length = option.length;
    for (let i = 0; i < length; i++) {
        if (option[i].TileMatrixSet === "EPSG:900913") {
            if (option[i].TileMatrixSetLimits) {
                const inner = option[i].TileMatrixSetLimits.TileMatrixLimits;
                for (let ii = 0; ii < inner.length; i++) {
                    return inner[ii].TileMatrix;
                }
            }
            let result = "EPSG:900913:0";
            return result;
        }
    }
}

function wmtsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        layer: options.name,
        style: options.style || "",
        format: options.format || 'image/png',
        Service: "WMTS",
        transparent: options.transparent !== undefined ? options.transparent : true,
        tiled: options.tiled !== undefined ? options.tiled : true,
        opacity: opacity,
        Request: "GetTile",
        version: options.version || "1.0.0",
        tilematrixset: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        tileSize: options.tileSize || 256,
        TileMatrix: tileMatrixValue(options.TileMatrix),
        Tilerow: 0,
        tilecol: 0
    }, options.params || {});
}

function getWMTSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wmts', {
    create: (options) => {
        const urls = getWMTSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = wmtsToLeafletOptions(options) || {};
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
        return L.tileLayer.wmts(urls, queryParameters);
    },
    update: function(layer, newOptions, oldOptions) {
        // find the options that make a parameter change
        let oldqueryParameters = WMTSUtils.filterWMTSParamOptions(wmtsToLeafletOptions(oldOptions));
        let newQueryParameters = WMTSUtils.filterWMTSParamOptions(wmtsToLeafletOptions(newOptions));
        let newParameters = Object.keys(newQueryParameters).filter((key) => {return newQueryParameters[key] !== oldqueryParameters[key]; });
        let newParams = {};
        if ( newParameters.length > 0 ) {
            newParameters.forEach( key => newParams[key] = newQueryParameters[key] );
            // set new options as parameters, merged with params
            layer.setParams(objectAssign(newParams, newParams.params, newOptions.params));
        } else if (!isEqual(newOptions.params, oldOptions.params)) {
            layer.setParams(newOptions.params);
        }
    }
});
