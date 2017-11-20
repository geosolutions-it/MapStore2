/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const WMTS = require('../WMTS');

describe('Test the leaflet WMTS utils', () => {
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('test getWMTSParams', () => {
        const matrixSet = [{
            MatrixHeight: "1",
            MatrixWidth: "1",
            ScaleDenominator: "545978.7733895439",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:0"
        }, {
            MatrixHeight: "10",
            MatrixWidth: "10",
            ScaleDenominator: "272989.38669477194",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:1"
        }, {
            MatrixHeight: "2",
            MatrixWidth: "4",
            ScaleDenominator: "136494.69334738597",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:2"
        }];
        const matrixIds = [{
            identifier: "SPHMERC_900913_CoFi:0",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }, {
            identifier: "SPHMERC_900913_CoFi:1",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }, {
            identifier: "SPHMERC_900913_CoFi:2",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }];
        const zoom = 11;
        const nw = {x: 1252363.3806813988, y: 5434997.568446243};
        const tilewidth = 4891.969810251379;
        const layer = new WMTS('http', {}, {
            tileMatrixPrefix: "SPHMERC_900913_CoFi:",
            originY: 20037508.3428,
            originX: -20037508.3428,
            ignoreErrors: false,
            matrixIds,
            matrixSet: null
        });
        const params = layer.getWMTSParams(matrixSet, matrixIds, zoom, nw, tilewidth);

        expect(params).toEqual({ ident: 'SPHMERC_900913_CoFi:1', tilecol: 4, tilerow: 1 });
    });

    it('test getWMTSParams no tile range', () => {
        const matrixSet = [{
            MatrixHeight: "1",
            MatrixWidth: "1",
            ScaleDenominator: "545978.7733895439",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:0"
        }, {
            MatrixHeight: "1",
            MatrixWidth: "2",
            ScaleDenominator: "272989.38669477194",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:1"
        }, {
            MatrixHeight: "2",
            MatrixWidth: "4",
            ScaleDenominator: "136494.69334738597",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:2"
        }];
        const matrixIds = [{
            identifier: "SPHMERC_900913_CoFi:0",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }, {
            identifier: "SPHMERC_900913_CoFi:1",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }, {
            identifier: "SPHMERC_900913_CoFi:2",
            ranges: null,
            topLeftCorner: {lat: 20037508.3428, lng: -20037508.3428}
        }];
        const zoom = 11;
        const nw = {x: 1252363.3806813988, y: 5434997.568446243};
        const tilewidth = 4891.969810251379;
        const layer = new WMTS('http', {}, {
            tileMatrixPrefix: "SPHMERC_900913_CoFi:",
            originY: 20037508.3428,
            originX: -20037508.3428,
            ignoreErrors: false,
            matrixIds,
            matrixSet: null
        });
        const params = layer.getWMTSParams(matrixSet, matrixIds, zoom, nw, tilewidth);

        expect(params).toBe(null);
    });

    it('test getWMTSParams no ids', () => {
        const matrixSet = [{
            MatrixHeight: "1",
            MatrixWidth: "1",
            ScaleDenominator: "545978.7733895439",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:0"
        }, {
            MatrixHeight: "1",
            MatrixWidth: "2",
            ScaleDenominator: "272989.38669477194",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:1"
        }, {
            MatrixHeight: "2",
            MatrixWidth: "4",
            ScaleDenominator: "136494.69334738597",
            TileHeight: "256",
            TileWidth: "256",
            TopLeftCorner: "1232776.0 5439871.0",
            "ows:Abstract": "The grid was not well-defined, the scale therefore assumes 1m per map unit.",
            "ows:Identifier": "SPHMERC_900913_CoFi:2"
        }];
        const matrixIds = [];
        const zoom = 11;
        const nw = {x: 1252363.3806813988, y: 5434997.568446243};
        const tilewidth = 4891.969810251379;
        const layer = new WMTS('http', {}, {
            tileMatrixPrefix: "SPHMERC_900913_CoFi:",
            originY: 20037508.3428,
            originX: -20037508.3428,
            ignoreErrors: false,
            matrixIds,
            matrixSet: null
        });
        const params = layer.getWMTSParams(matrixSet, matrixIds, zoom, nw, tilewidth);

        expect(params).toBe(null);
    });
});
