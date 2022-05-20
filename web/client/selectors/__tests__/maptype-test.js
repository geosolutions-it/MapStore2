/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


import expect from 'expect';

import {
    mapTypeSelector,
    isCesium,
    isOpenlayers,
    isLeaflet,
    mapTypeLoadedSelector,
    last2dMapTypeSelector
} from '../maptype';

describe('Test maptype', () => {
    it('test mapTypeSelector default', () => {
        const mapType = mapTypeSelector({});

        expect(mapType).toExist();
        expect(mapType).toBe("leaflet");
    });

    it('test mapTypeSelector', () => {
        const mapType = mapTypeSelector({maptype: {mapType: "cesium"}});

        expect(mapType).toExist();
        expect(mapType).toBe("cesium");
    });

    it('test isCesium', () => {
        const bool = isCesium({maptype: {mapType: "cesium"}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isCesium({maptype: {mapType: "leaflet"}})).toBe(false);
    });

    it('test isLeaflet', () => {
        const bool = isLeaflet({maptype: {mapType: "leaflet"}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isLeaflet({maptype: {mapType: "cesium"}})).toBe(false);
    });

    it('test isOpenlayers', () => {
        const bool = isOpenlayers({maptype: {mapType: "openlayers"}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isOpenlayers({maptype: {mapType: "cesium"}})).toBe(false);
    });
    it('test mapTypeLoadedSelector', () => {
        const state = mapTypeLoadedSelector({
            maptype: {
                mapType: "openlayers",
                loaded: {
                    "openlayers": true
                }
            }
        });
        expect(state).toExist();
        expect(state).toEqual({"openlayers": true});
    });
    it('test default last2dMapTypeSelector', () => {
        const state = last2dMapTypeSelector({
            maptype: {
                last2dMapType: null
            }
        });
        expect(state).toExist();
        expect(state).toEqual("openlayers");
    });
    it('test last2dMapTypeSelector', () => {
        const state = last2dMapTypeSelector({
            maptype: {
                last2dMapType: "leaflet"
            }
        });
        expect(state).toExist();
        expect(state).toEqual("leaflet");
    });
});
