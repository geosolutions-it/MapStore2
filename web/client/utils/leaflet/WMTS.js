/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const L = require('leaflet');
const MapUtils = require('../MapUtils');
const {head, isNumber} = require('lodash');

var WMTS = L.TileLayer.extend({
    defaultWmtsParams: {
        service: "WMTS",
        request: "GetTile",
        version: "1.3.0",
        layer: "",
        style: "",
        tileMatrixSet: "",
        format: "image/jpeg"
    },
    initialize: function(urls, options, matrixOptions) {
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
        for (let i in options) {
            // all keys that are not TileLayer options go to WMS params
            if (!this.options.hasOwnProperty(i) && i !== 'crs') {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        this.matrixIds = matrixOptions.matrixIds && this.getMatrix(matrixOptions.matrixIds, matrixOptions) || this.getDefaultMatrix(matrixOptions);
        this.matrixSet = matrixOptions.matrixSet && matrixOptions.matrixSet.TileMatrix || [];
        this.ignoreErrors = matrixOptions.ignoreErrors || false;
        L.setOptions(this, options);
    },
    isInRange: function(col, row, ranges) {
        if (col < ranges.cols.min || col > ranges.cols.max) {
            return false;
        }
        if (row < ranges.rows.min || row > ranges.rows.max) {
            return false;
        }
        return true;
    },
    getTopLeftCorner: (str) => {
        const coord = str.split(' ');
        const lng = parseFloat(coord[0]);
        const lat = parseFloat(coord[1]);
        return !isNaN(lng) && !isNaN(lat) && {lng, lat} || null;
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

        const currentScale = MapUtils.getScales()[map.getZoom()];

        const matrix = head(this.matrixSet.map((s, i) => {
            if (i === this.matrixSet.length - 1) {
                return null;
            }
            const top = parseFloat(s.ScaleDenominator);
            const bottom = parseFloat(this.matrixSet[i + 1].ScaleDenominator);
            const isBetween = top >= currentScale && bottom < currentScale;
            if (isBetween) {
                const delta = currentScale - bottom;
                return delta > (top - bottom) / 2 ? {id: i, data: s} : {id: i + 1, data: this.matrixSet[i + 1]};
            }
            return null;
        }).filter(v => v));

        const id = matrix && isNumber(matrix.id) && matrix.id + '' || this.matrixSet.length === 0 && map.getZoom() || null;

        if (!this.matrixIds[id]) {
            return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }

        const ident = this.matrixIds[id].identifier;
        const topLeftCorner = matrix.data && matrix.data.TopLeftCorner && this.getTopLeftCorner(matrix.data.TopLeftCorner) || this.matrixIds[id].topLeftCorner;

        const X0 = topLeftCorner.lng;
        const Y0 = topLeftCorner.lat;

        const tilecol = Math.floor((nw.x - X0) / tilewidth);
        const tilerow = -Math.floor((nw.y - Y0) / tilewidth);

        const ranges = matrix.data && matrix.data.MatrixWidth && matrix.data.MatrixHeight ? {
            cols: {
                min: 0,
                max: matrix.data.MatrixWidth - 1
            },
            rows: {
                min: 0,
                max: matrix.data.MatrixHeight - 1
            }
        } : this.matrixIds[id].ranges;

        if (ranges) {
            if (!this.isInRange(tilecol, tilerow, ranges)) {
                return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            }
        }
        this._urlsIndex++;
        if (this._urlsIndex === this._urls.length) {
            this._urlsIndex = 0;
        }
        const url = L.Util.template(this._urls[this._urlsIndex], {s: this._getSubdomain(tilePoint)});
        return url + L.Util.getParamString(this.wmtsParams, url, true) + "&tilematrix=" + ident + "&tilerow=" + tilerow + "&tilecol=" + tilecol;
    },
    getMatrix: function(matrix, options) {
        return matrix.map((el) => {
            return {
                identifier: el.identifier,
                topLeftCorner: new L.LatLng(options.originY, options.originX),
                ranges: el.ranges || null
            };
        });
    },
    getDefaultMatrix: function(options) {
        var e = new Array(22);
        // Lint gives an error here: All "var" declarations must be at the top of the function scope
        for (let t = 0; t < 22; t++) {
            e[t] = {
                identifier: options.tileMatrixPrefix + t,
                topLeftCorner: new L.LatLng(options.originY, options.originX)
            };
        }
        return e;
    },
    onError: function() {
        // let's allow ignoring WMTS errors if we don't configure ranges
        return !this.ignoreErrors;
    }
});
module.exports = WMTS;
