/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import * as Cesium from 'cesium';
import Layers from '../../../../utils/cesium/Layers';
import '../plugins/WMTSLayer';

describe('Cesium WMTS layer', () => {
    afterEach(() => expect.restoreSpies());

    const unresolved = {
        crs: 'EPSG:4326',
        tileMatrixSetLink: "sources['/wmts'].tileMatrixSet['EPSG:4326']",
        limits: [{ identifier: '0' }]
    };
    const options = {
        type: 'wmts', name: 'layer', url: '/wmts',
        availableTileMatrixSets: { 'EPSG:4326': unresolved }
    };

    it('does not request tiles or crash when all matrix definitions are missing', () => {
        const requestImage = expect.spyOn(Cesium.WebMapTileServiceImageryProvider.prototype, 'requestImage');
        const provider = Layers.createLayer('wmts', options);
        expect(provider).toBeA(Cesium.WebMapTileServiceImageryProvider);
        expect(provider.requestImage(0, 0, 0)).toBe(undefined);
        expect(provider.requestImage(0, 0, 30)).toBe(undefined);
        expect(requestImage).toNotHaveBeenCalled();
    });

    it('renders resolved matrix sets alongside missing definitions and respects tile limits', () => {
        const image = new Image();
        const requestImage = expect.spyOn(Cesium.WebMapTileServiceImageryProvider.prototype, 'requestImage').andReturn(image);
        const provider = Layers.createLayer('wmts', {
            ...options,
            availableTileMatrixSets: {
                ...options.availableTileMatrixSets,
                'EPSG:3857': {
                    crs: 'EPSG:3857',
                    limits: [{ identifier: '0', ranges: { cols: { min: 0, max: 0 }, rows: { min: 0, max: 0 } } }],
                    tileMatrixSet: {
                        'ows:Identifier': 'EPSG:3857',
                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::3857',
                        TileMatrix: [{ 'ows:Identifier': '0' }]
                    }
                }
            }
        });
        expect(provider.tilingScheme).toBeA(Cesium.WebMercatorTilingScheme);
        expect(provider.requestImage(0, 0, 0)).toBe(image);
        expect(provider.requestImage(1, 1, 0)).toBe(undefined);
        expect(provider.requestImage(0, 0, 1)).toBe(undefined);
        expect(requestImage.calls.length).toBe(1);
    });
});
