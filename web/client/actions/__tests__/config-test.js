/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {loadMapConfig, changeLayerProperties, changeBrowserProperties, MAP_CONFIG_LOAD_ERROR, MAP_CONFIG_LOADED, CHANGE_LAYER_PROPERTIES, CHANGE_BROWSER_PROPERTIES} = require('../config');

describe('Test configuration related actions', () => {
    it('does not load a missing configuration file', (done) => {
        loadMapConfig('missingConfig.json')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(MAP_CONFIG_LOAD_ERROR);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('loads an existing configuration file', (done) => {
        loadMapConfig('base/web/client/test-resources/testConfig.json')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe(MAP_CONFIG_LOADED);
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
    it('test layer properties change action', (done) => {
        let e = changeLayerProperties('layer', {visibility: true});

        try {
            expect(e).toExist();
            expect(e.type).toBe(CHANGE_LAYER_PROPERTIES);
            expect(e.newProperties).toExist();
            expect(e.newProperties.visibility).toBe(true);
            expect(e.layer).toBe('layer');
            done();
        } catch(ex) {
            done(ex);
        }

    });

    it('loads an broken configuration file', (done) => {
        loadMapConfig('base/web/client/test-resources/testConfig.broken.json')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('MAP_CONFIG_LOAD_ERROR');
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('test browser properties change action', (done) => {
        let e = changeBrowserProperties({touch: true});

        try {
            expect(e).toExist();
            expect(e.type).toBe(CHANGE_BROWSER_PROPERTIES);
            expect(e.newProperties).toExist();
            expect(e.newProperties.touch).toBe(true);
            done();
        } catch(ex) {
            done(ex);
        }
    });
});
