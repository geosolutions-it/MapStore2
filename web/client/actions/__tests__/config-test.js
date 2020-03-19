/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { configureError, loadMapConfig, loadMapInfo, configureMap, MAP_CONFIG_LOAD_ERROR, LOAD_MAP_CONFIG, MAP_CONFIG_LOADED, LOAD_MAP_INFO} = require('../config');

describe('Test configuration related actions', () => {
    it('loadMapConfig', () => {
        const retVal = loadMapConfig("test", 1, {}, {}, {});
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOAD_MAP_CONFIG);
        expect(retVal.configName).toBe("test");
        expect(retVal.mapId).toBe(1);
        expect(retVal.config).toExist();
        expect(retVal.mapInfo).toExist();
        expect(retVal.overrideConfig).toExist();
    });

    it('configureMap', () => {
        const mapId = 1;
        const DATA = {};
        const retVal = configureMap(DATA, mapId);
        expect(retVal).toExist();
        expect(retVal.type).toBe(MAP_CONFIG_LOADED);
        expect(retVal);
    });

    it('configureError', () => {
        const retVal = configureError();
        expect(retVal).toExist();
        expect(retVal.type).toBe(MAP_CONFIG_LOAD_ERROR);
    });

    it('getResource access info', () => {
        const retVal = loadMapInfo(1);
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOAD_MAP_INFO);
        expect(retVal.mapId).toBe(1);
    });
});
