/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const L = require('leaflet');
const MapUtils = require('../MapUtils');
const CoordinatesUtils = require('../CoordinatesUtils');
const {head, isNumber} = require('lodash');

const isInRange = function(col, row, ranges) {
    if (col < ranges.cols.min || col > ranges.cols.max) {
        return false;
    }
    if (row < ranges.rows.min || row > ranges.rows.max) {
        return false;
    }
    return true;
};

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
    getWMTSParams: (matrixSet, matrixIds, zoom, nw, tilewidth) => {
        const currentScale = MapUtils.getScales()[zoom];

        const matrix = head(matrixSet.map((s, i) => {
            if (i === matrixSet.length - 1) {
                return null;
            }
            const top = parseFloat(s.ScaleDenominator);
            const bottom = parseFloat(matrixSet[i + 1].ScaleDenominator);
            const isBetween = top >= currentScale && bottom < currentScale;
            if (isBetween) {
                const delta = currentScale - bottom;
                return delta > (top - bottom) / 2 ? {id: i, data: s} : {id: i + 1, data: matrixSet[i + 1]};
            }
            return null;
        }).filter(v => v));

        const id = matrix && isNumber(matrix.id) && matrix.id + '' || matrixSet.length === 0 && zoom || null;

        if (!matrixIds[id]) {
            return null;
        }

        const ident = matrixIds[id].identifier;
        const topLeftCorner = matrix.data && matrix.data.TopLeftCorner && CoordinatesUtils.parseString(matrix.data.TopLeftCorner) || matrixIds[id].topLeftCorner;

        const X0 = topLeftCorner.lng || topLeftCorner.x;
        const Y0 = topLeftCorner.lat || topLeftCorner.y;

        const tilecol = Math.round((nw.x - X0) / tilewidth);
        const tilerow = -Math.round((nw.y - Y0) / tilewidth);

        const matrixRanges = matrix.data && matrix.data.MatrixWidth && matrix.data.MatrixHeight && {
            cols: {
                min: 0,
                max: matrix.data.MatrixWidth - 1
            },
            rows: {
                min: 0,
                max: matrix.data.MatrixHeight - 1
            }
        };

        const ranges = matrixIds[id].ranges || matrixRanges;

        if (ranges) {
            if (!isInRange(tilecol, tilerow, ranges)) {
                return null;
            }
        }

        return {ident, tilecol, tilerow};
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

        const params = this.getWMTSParams([...this.matrixSet], [...this.matrixIds], tilePoint.z, nw, tilewidth);

        if (!params) {
            return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        }


        this._urlsIndex++;
        if (this._urlsIndex === this._urls.length) {
            this._urlsIndex = 0;
        }
        const url = L.Util.template(this._urls[this._urlsIndex], {
            s: this._getSubdomain(tilePoint),
            TileRow: params.tilerow,
            TileCol: params.tilecol,
            TileMatrixSet: this.options.tileMatrixSet,
            TileMatrix: params.ident,
            Style: this.options.style
        });
        if (this.options.requestEncoding === "RESTful") {
            return url;
        }
        return url + L.Util.getParamString(this.wmtsParams, url, true) + "&tilematrix=" + params.ident + "&tilerow=" + params.tilerow + "&tilecol=" + params.tilecol;
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
