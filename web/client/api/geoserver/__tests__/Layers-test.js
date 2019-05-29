/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var API = require('../Layers');

describe('Test layers rest API', () => {
    it('get layer', (done) => {
        const LAYER_NAME = "TEST_LAYER_1";
        API.getLayer("base/web/client/test-resources/geoserver/rest/", LAYER_NAME).then((layer)=> {
            expect(layer).toExist();
            expect(layer.name).toBe(LAYER_NAME);
            done();
        });
    });
    it('test removeStyles', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        API.removeStyles({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styles: [{name: 'generic'}]
        }).then((layer)=> {
            expect(layer).toExist();
            expect(layer.layer.styles.style.length).toBe(1);
            expect(layer.layer.styles.style[0].name).toBe('point');
            done();
        });
    });
    it('test updateAvailableStyles', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        API.updateAvailableStyles({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styles: [{name: 'polygon'}]
        }).then((layer)=> {
            expect(layer).toExist();
            expect(layer.layer.styles.style.length).toBe(3);
            expect(layer.layer.styles.style[0].name).toBe('point');
            expect(layer.layer.styles.style[1].name).toBe('generic');
            expect(layer.layer.styles.style[2].name).toBe('polygon');
            done();
        });
    });

    it('test updateDefaultStyle', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        const newDefaultStyle = 'point';
        API.updateDefaultStyle({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styleName: newDefaultStyle
        }).then((layerObj)=> {
            expect(layerObj).toExist();
            expect(layerObj.layer.defaultStyle.name).toBe(newDefaultStyle);
            expect(layerObj.layer.styles.style.length).toBe(2);
            expect(layerObj.layer.styles.style[0].name).toBe('test_TEST_LAYER_1');
            expect(layerObj.layer.styles.style[1].name).toBe('generic');
            done();
        }).catch(e => {
            done(e);
        });
    });
});
