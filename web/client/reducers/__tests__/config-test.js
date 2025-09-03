/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import mapConfig from '../config';
import { DETAILS_LOADED } from '../../actions/details';
import { MAP_INFO_LOADED } from './../../actions/config';


describe('Test the mapConfig reducer', () => {
    it('creates a configuration object from loaded config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { version: 2, map: { center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        expect(state.map).toExist();
        expect(state.map.zoom).toExist();
        expect(state.map.center).toExist();
        expect(state.map.center.crs).toExist();
        expect(state.layers).toExist();
    });

    it('creates a configuration object from legacy config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { map: { center: [1361886.8627049, 5723464.1181097], zoom: 11, layers: [] }}});
        expect(state.map).toExist();
        expect(state.map.zoom).toExist();
        expect(state.map.center).toExist();
        expect(state.map.center.crs).toExist();
        expect(state.layers).toExist();
    });
    it('checks if empty background layer type is changed accordingly', () => {
        const state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { version: 2, map: { center: {x: 1, y: 1}, zoom: 11, layers: [{type: 'ol', group: "background"}] }}});
        expect(state.map.zoom).toExist();
        expect(state.map.center).toExist();
        expect(state.map.center.crs).toExist();
        expect(state.layers).toExist();
        expect(state.layers.length).toBe(1);
        expect(state.layers[0].type).toBe("empty");
        const state2 = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { version: 2, map: { center: {x: 1, y: 1}, zoom: 11, layers: [{type: 'OpenLayers.Layer', group: "background"}] }}});
        expect(state2.layers).toExist();
        expect(state2.layers.length).toBe(1);
        expect(state2.layers[0].type).toBe("empty");
    });

    it('creates an error on wrongly loaded config', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOAD_ERROR', error: 'error'});
        expect(state.loadingError).toExist();
    });

    it('returns original state on unrecognized action', () => {
        var state = mapConfig(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });
    it('get map info', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', mapId: 1, config: { version: 2, map: {center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        state = mapConfig(state, {type: "MAP_INFO_LOAD_START", mapId: 1});
        expect(state.map).toExist();
        expect(state.map.info).toNotExist();
        expect(state.map.loadingInfo).toBe(true);
        expect(state.map.center.crs).toExist();
        state = mapConfig(state, {type: "MAP_INFO_LOADED", mapId: 1, info: {canEdit: true, canDelete: true}});
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.canEdit).toBe(true);
    });
    it('DETAILS_LOADED Map', () => {
        const detailsUri = "details/uri";
        var state = mapConfig({
            map: {
                present: {
                    mapId: 1
                }
            }
        }, {type: DETAILS_LOADED, id: 1, detailsUri});
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.attributes.details).toBe(detailsUri);
    });
    it('DETAILS_LOADED Dahboard', () => {
        const detailsUri = "details/uri";
        var state = mapConfig({
            dashboard: {
                resource: {
                    id: "1", attributes: {}
                }
            }
        }, {type: DETAILS_LOADED, id: "1", detailsUri});
        expect(state.dashboard).toExist();
        expect(state.dashboard.resource).toExist();
        expect(state.dashboard.resource.attributes.details).toBe(detailsUri);
    });

    it('loads annotations layer and generate correctly the geodesic lines if needed', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', config: { map: { center: [1361886.8627049, 5723464.1181097], zoom: 11, layers: [
            {
                type: 'vector',
                id: "annotations",
                features: [{
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        id: 'feature-01',
                        geometry: {
                            type: "MultiPoint",
                            coordinates: [[1, 2], [4, 5]]
                        },
                        properties: {
                            id: 'feature-01',
                            useGeodesicLines: true
                        }
                    },
                    {
                        type: "Feature",
                        id: 'feature-02',
                        geometry: {
                            type: "LineString",
                            coordinates: [[1, 2], [4, 5]]
                        },
                        properties: {
                            id: 'feature-02'
                        },
                        style: [{
                            color: "#303030"
                        }]
                    }]
                }]
            }] }}});
        expect(state.map).toExist();
        expect(state.layers).toExist();
        const newAnnotationsFeature = state.layers[0].features[0];
        const otherLineString = state.layers[0].features[1];
        expect(newAnnotationsFeature.geometry).toEqual({
            type: "MultiPoint",
            coordinates: [[1, 2], [4, 5]]
        });
        expect(newAnnotationsFeature.properties).toEqual({
            geodesic: true,
            id: 'feature-01',
            annotationType: 'MultiPoint',
            name: 'MultiPoint'
        });
        expect(otherLineString.properties).toEqual({
            geodesic: false,
            id: 'feature-02',
            annotationType: 'LineString',
            name: 'LineString'
        });
        expect(otherLineString.geometry).toEqual({
            type: "LineString",
            coordinates: [[1, 2], [4, 5]]
        });
    });

    it('test MAP_INFO_LOADED with merge of info', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', mapId: "1", config: { version: 2, map: {center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        state = mapConfig({
            ...state,
            map: {
                ...state.map,
                info: {
                    ...state.map.info,
                    canEdit: true
                }
            }
        }, {
            type: MAP_INFO_LOADED,
            mapId: "1",
            info: {attributes: ["newattributes"]},
            merge: true
        });
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.attributes).toEqual(["newattributes"]);
        // expect(state.map.info.canEdit).toBeTruthy();
        state = {};
    });
    it('test MAP_INFO_LOADED accepts string or numeric mapId', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', mapId: "1", config: { version: 2, map: {center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        state = mapConfig(state, {type: "MAP_INFO_LOADED", mapId: 1, info: {canEdit: true, canDelete: true}});
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.canEdit).toBe(true);
        state = {};
        state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', mapId: 1, config: { version: 2, map: {center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        state = mapConfig(state, {type: "MAP_INFO_LOADED", mapId: "1", info: {canEdit: true, canDelete: true}});
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.canEdit).toBe(true);
    });
    it('overrides mapconfig if external file is loaded and mapId exists on current map', () => {
        var state = mapConfig({}, {type: 'MAP_CONFIG_LOADED', mapId: "1", config: { version: 2, map: {center: {x: 1, y: 1}, zoom: 11, layers: [] }}});
        state = mapConfig(state, {type: "MAP_INFO_LOADED", mapId: "1", info: {canEdit: true, canDelete: true}});
        expect(state.map).toExist();
        expect(state.map.info).toExist();
        expect(state.map.info.canEdit).toBe(true);
        state = mapConfig(state, {type: 'MAP_CONFIG_LOADED', config: {fileName: "uploadedMap.json", version: 2, map: {center: {x: 10, y: 10}, zoom: 21, layers: [] }}});
        expect(state.map).toExist();
        expect(state.map.mapId).toBe("1");
        expect(state.map.center.x).toBe(10);
        expect(state.map.center.y).toBe(10);
        expect(state.map.zoom).toBe(21);
    });
});
