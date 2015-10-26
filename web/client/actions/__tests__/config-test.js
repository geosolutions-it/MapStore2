/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {loadMapConfig, MAP_CONFIG_LOAD_ERROR, MAP_CONFIG_LOADED} = require('../config');

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
});
