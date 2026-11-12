/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import Layers from '../../../../utils/openlayers/Layers';
import '../plugins/WMTSLayer';

describe('OpenLayers WMTS layer', () => {
    it('creates a layer when saved matrix links have no source definitions', () => {
        const layer = Layers.createLayer('wmts', {
            type: 'wmts', name: 'layer', url: '/wmts', srs: 'EPSG:3857',
            availableTileMatrixSets: {
                'EPSG:3857': {
                    crs: 'EPSG:3857',
                    tileMatrixSetLink: "sources['/wmts'].tileMatrixSet['EPSG:3857']",
                    limits: [{ identifier: '0' }]
                }
            }
        });
        expect(layer).toExist();
        expect(layer.getSource().getMatrixSet()).toBe('EPSG:3857');
    });
});
