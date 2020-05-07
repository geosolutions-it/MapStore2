/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import TileConfigProvider from '../TileConfigProvider';


describe('TileConfigProvider', () => {
    beforeEach( () => {

    });
    afterEach((done) => {
        document.body.innerHTML = '';

        setTimeout(done);
    });
    it('test getLayerConfig', () => {
        const config = TileConfigProvider.getLayerConfig("OpenStreetMap");
        expect(config).toExist();
    });
    it('test getLayerConfig with variant', () => {
        const config = TileConfigProvider.getLayerConfig('Thunderforest.OpenCycleMap');
        expect(config).toExist();
    });
    it('test getLayerConfig with variant optins', () => {
        const [url, config] = TileConfigProvider.getLayerConfig('Thunderforest.Transport');
        expect(url).toExist();
        expect(config).toExist();
    });
});
