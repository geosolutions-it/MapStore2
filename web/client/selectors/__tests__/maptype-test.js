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
    visualizationModeSelector,
    is3DMode,
    is2DMode
} from '../maptype';

import { MapLibraries } from '../../utils/MapTypeUtils';

describe('Test maptype', () => {
    it('test mapTypeSelector default', () => {
        const mapType = mapTypeSelector({});

        expect(mapType).toExist();
        expect(mapType).toBe(MapLibraries.OPENLAYERS);
    });

    it('test mapTypeSelector', () => {
        const mapType = mapTypeSelector({maptype: {mapType: MapLibraries.CESIUM}});

        expect(mapType).toExist();
        expect(mapType).toBe(MapLibraries.CESIUM);
    });

    it('test isCesium', () => {
        const bool = isCesium({maptype: {mapType: MapLibraries.CESIUM}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isCesium({maptype: {mapType: MapLibraries.LEAFLET}})).toBe(false);
    });

    it('test isLeaflet', () => {
        const bool = isLeaflet({maptype: {mapType: MapLibraries.LEAFLET}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isLeaflet({maptype: {mapType: MapLibraries.CESIUM}})).toBe(false);
    });

    it('test isOpenlayers', () => {
        const bool = isOpenlayers({maptype: {mapType: MapLibraries.OPENLAYERS}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isOpenlayers({maptype: {mapType: MapLibraries.CESIUM}})).toBe(false);
    });
    it('test mapTypeLoadedSelector', () => {
        const state = mapTypeLoadedSelector({
            maptype: {
                mapType: MapLibraries.OPENLAYERS,
                loaded: {
                    [MapLibraries.OPENLAYERS]: true
                }
            }
        });
        expect(state).toExist();
        expect(state).toEqual({[MapLibraries.OPENLAYERS]: true});
    });
    it('test visualizationModeSelector', () => {
        expect(visualizationModeSelector({
            maptype: {
                mapType: MapLibraries.OPENLAYERS
            }
        })).toBe("2D");
        expect(visualizationModeSelector({
            maptype: {
                mapType: MapLibraries.LEAFLET
            }
        })).toBe("2D");
        expect(visualizationModeSelector({
            maptype: {
                mapType: MapLibraries.CESIUM
            }
        })).toBe("3D");
    });
    it('test is2DMode', () => {
        expect(is2DMode({
            maptype: {
                mapType: MapLibraries.OPENLAYERS
            }
        })).toBe(true);
        expect(is2DMode({
            maptype: {
                mapType: MapLibraries.LEAFLET
            }
        })).toBe(true);
        expect(is2DMode({
            maptype: {
                mapType: MapLibraries.CESIUM
            }
        })).toBe(false);
    });
    it('test is3DMode', () => {
        expect(is3DMode({
            maptype: {
                mapType: MapLibraries.OPENLAYERS
            }
        })).toBe(false);
        expect(is3DMode({
            maptype: {
                mapType: MapLibraries.LEAFLET
            }
        })).toBe(false);
        expect(is3DMode({
            maptype: {
                mapType: MapLibraries.CESIUM
            }
        })).toBe(true);
    });
});
