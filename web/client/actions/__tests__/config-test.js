/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const { configureError, loadMapConfig, loadMapInfo, configureMap, MAP_CONFIG_LOAD_ERROR, LOAD_MAP_CONFIG, MAP_CONFIG_LOADED} = require('../config');

describe('Test configuration related actions', () => {
    it('loadMapConfig', () => {
        const retVal = loadMapConfig("test", 1);
        expect(retVal).toExist();
        expect(retVal.type).toBe(LOAD_MAP_CONFIG);
        expect(retVal.configName).toBe("test");
        expect(retVal.mapId).toBe(1);
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

    it('getResource access info', (done) => {
        loadMapInfo('base/web/client/test-resources/geostore/ShortResource.json', 1)((actionCreator) => {
            try {
                switch (actionCreator.type) {
                case "MAP_INFO_LOAD_START":
                    expect(actionCreator.mapId).toBe(1);
                    break;
                case "MAP_INFO_LOADED":
                    let resourceInfo = actionCreator.info;
                    expect(resourceInfo).toExist();
                    expect(resourceInfo.canEdit).toExist();
                    expect(resourceInfo.id).toBe(1);
                    done();
                    break;
                default:
                    done("ERROR");
                    break;
                }

            } catch (ex) {
                done(ex);
            }
        });
    });
});
