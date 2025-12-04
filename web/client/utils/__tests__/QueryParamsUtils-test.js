/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { CHANGE_MAP_VIEW, ZOOM_TO_EXTENT } from '../../actions/map';
import {
    getRequestLoadValue,
    getRequestParameterValue,
    postRequestLoadValue,
    getParametersValues,
    getQueryActions,
    paramActions
} from "../QueryParamsUtils";
import { SEARCH_LAYER_WITH_FILTER } from '../../actions/search';

describe('QueryParamsUtils', () => {
    it('test getRequestLoadValue', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat%22:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        const featureinfo = getRequestLoadValue('featureinfo', state);
        const zoom = getRequestLoadValue('zoom', state);
        const center = getRequestLoadValue('center', state);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(zoom).toBe(5);
        expect(center).toBe(null);
    });
    it('test getRequestLoadValue - invalid JSON', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        const featureinfo = getRequestLoadValue('featureinfo', state);
        const zoom = getRequestLoadValue('zoom', state);
        const center = getRequestLoadValue('center', state);
        expect(featureinfo).toBe("{\"lat: 38.72, \"lng\": -95.625}");
        expect(zoom).toBe(5);
        expect(center).toBe(null);
    });
    it('test postRequestLoadValue', () => {
        const uuid = '8158d9c3-155d-44c0-834a-5274161c241e';
        sessionStorage.setItem(`queryParams-${uuid}`, JSON.stringify({featureinfo: {lat: 38.72, lng: -95.625, filterNameList: []}, zoom: 5, center: "41,0"}));
        let featureinfo = postRequestLoadValue('featureinfo', uuid, sessionStorage);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(featureinfo.filterNameList).toEqual([]);

        const storageItem = sessionStorage.getItem(`queryParams-${uuid}`);
        featureinfo = JSON.parse(storageItem)[uuid]?.featureinfo;
        expect(featureinfo).toBe(undefined);

        const zoom = postRequestLoadValue('zoom', uuid, sessionStorage);
        const center = postRequestLoadValue('center', uuid, sessionStorage);
        expect(zoom).toBe(5);
        expect(center).toBe("41,0");
    });
    it('test getRequestParameterValue', () => {
        const state = {
            router: {
                location: {
                    search: '?featureinfo={%22lat%22:%2038.72,%20%22lng%22:%20-95.625}&zoom=5'
                }
            }
        };
        sessionStorage.setItem('queryParams', JSON.stringify({featureinfo: {lat: 5, lng: 5, filterNameList: []}, zoom: 3, center: "41,0"}));
        const featureinfo = getRequestParameterValue('featureinfo', state, sessionStorage);
        const zoom = getRequestParameterValue('zoom', state, sessionStorage);
        const center = getRequestParameterValue('center', state, sessionStorage);
        expect(featureinfo.lat).toBe(38.72);
        expect(featureinfo.lng).toBe(-95.625);
        expect(featureinfo.filterNameList).toBe(undefined);
        expect(zoom).toBe(5);
        expect(center).toBe("41,0");
        sessionStorage.clear();     // clear the session storage as it is not needed
    });
    it('test getParametersValues', () => {
        const state = {
            router: {
                location: {
                    search: '?center=11.558466796428766,41.415232026624764&zoom=12.344643329999036&heading=6.158556550454258&pitch=-0.2123635014967287&roll=0.000010414279262072055'
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const { center, zoom, heading, pitch, roll } = parameters;
        expect(center).toBe('11.558466796428766,41.415232026624764');
        expect(zoom).toBe(12.344643329999036);
        expect(heading).toBe(6.158556550454258);
        expect(pitch).toBe(-0.2123635014967287);
        expect(roll).toBe(0.000010414279262072055);
    });
    it('test getParametersValues - check that numeric zero values are processed properly', () => {
        const state = {
            router: {
                location: {
                    search: '?center=11.558466796428766,41.415232026624764&zoom=12.344643329999036&heading=6.158556550454258&pitch=0&roll=0'
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const { pitch, roll } = parameters;
        expect(pitch).toBe(0);
        expect(roll).toBe(0);
    });
    it('test getQueryActions with center querystring parameter', () => {
        const state = {
            router: {
                location: {
                    search: '?center=11.558466796428766,41.415232026624764&zoom=12.344643329999036&heading=6.158556550454258&pitch=-0.2123635014967287&roll=0.000010414279262072055'
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toBe(1);
        const changeMapViewAction = queryActions[0];
        expect(changeMapViewAction.type).toBe(CHANGE_MAP_VIEW);
        expect(changeMapViewAction.center).toEqual({x: 11.558466796428766, y: 41.415232026624764, crs: 'EPSG:4326'});
        expect(changeMapViewAction.viewerOptions).toEqual({heading: 6.158556550454258, pitch: -0.2123635014967287, roll: 0.000010414279262072055});
        expect(changeMapViewAction.zoom).toBe(12.344643329999036);
    });
    it('test getQueryActions in case of mapInfo with only center querystring parameter', () => {
        const state = {
            router: {
                location: {
                    search: '?mapInfo=gs:layer01&mapInfoFilter=NAME="test"&center=11.558466796428766,41.415232026624764'
                }
            },
            map: {
                present: {
                    zoom: 10,
                    center: {"x": 30, "y": 6, "crs": "EPSG:4326"}
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toEqual(2);
        const changeMapViewAction = queryActions[0];
        expect(changeMapViewAction.type).toEqual(CHANGE_MAP_VIEW);
        expect(changeMapViewAction.center).toEqual({x: 11.558466796428766, y: 41.415232026624764, crs: 'EPSG:4326'});
        expect(changeMapViewAction.zoom).toEqual(10);
        const searchWithFilterAction = queryActions[1];
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.queryParamZoomOption.isCoordsProvided).toEqual(true);
    });
    it('test getQueryActions in case of mapInfo with only marker querystring parameter', () => {
        const state = {
            router: {
                location: {
                    search: '?mapInfo=gs:layer01&mapInfoFilter=NAME="test"&marker=11.558466796428766,41.415232026624764'
                }
            },
            map: {
                present: {
                    zoom: 10,
                    center: {"x": 30, "y": 6, "crs": "EPSG:4326"}
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toEqual(3);
        const changeMapViewAction = queryActions[0];
        expect(changeMapViewAction.type).toEqual(CHANGE_MAP_VIEW);
        expect(changeMapViewAction.center).toEqual({x: 11.558466796428766, y: 41.415232026624764, crs: 'EPSG:4326'});
        expect(changeMapViewAction.zoom).toEqual(10);
        const searchWithFilterAction = queryActions[2];
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.queryParamZoomOption.isCoordsProvided).toEqual(true);
    });
    it('test getQueryActions in case of mapInfo with only bbox querystring parameter', () => {
        const state = {
            router: {
                location: {
                    search: '?mapInfo=gs:layer01&mapInfoFilter=NAME="test"&bbox=11,40,12,42'
                }
            },
            map: {
                present: {
                    zoom: 10,
                    center: {"x": 30, "y": 6, "crs": "EPSG:4326"}
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toEqual(2);
        const zoomToExtentAction = queryActions[0];
        expect(zoomToExtentAction.type).toEqual(ZOOM_TO_EXTENT);
        expect(zoomToExtentAction.extent).toEqual([11, 40, 12, 42]);
        const searchWithFilterAction = queryActions[1];
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.queryParamZoomOption.isCoordsProvided).toEqual(true);
    });
    it('test getQueryActions in case of mapInfo without center/marker/zoom or bbox', () => {
        const state = {
            router: {
                location: {
                    search: '?mapInfo=gs:layer01&mapInfoFilter=NAME="test"'
                }
            },
            map: {
                present: {
                    zoom: 10,
                    center: {"x": 30, "y": 6, "crs": "EPSG:4326"}
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toEqual(1);
        const searchWithFilterAction = queryActions[0];
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.queryParamZoomOption.isCoordsProvided).toEqual(false);
        expect(searchWithFilterAction.queryParamZoomOption.overrideZoomLvl).toEqual(null);
    });
    it('test getQueryActions in case of mapInfo with only zoom', () => {
        const state = {
            router: {
                location: {
                    search: '?mapInfo=gs:layer01&mapInfoFilter=NAME="test"&zoom=4'
                }
            },
            map: {
                present: {
                    zoom: 10,
                    center: {"x": 30, "y": 6, "crs": "EPSG:4326"}
                }
            }
        };
        const parameters = getParametersValues(paramActions, state);
        const queryActions = getQueryActions(parameters, paramActions, state);
        expect(queryActions.length).toEqual(1);
        const searchWithFilterAction = queryActions[0];
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.type).toEqual(SEARCH_LAYER_WITH_FILTER);
        expect(searchWithFilterAction.queryParamZoomOption.isCoordsProvided).toEqual(false);
        expect(searchWithFilterAction.queryParamZoomOption.overrideZoomLvl).toEqual(4);
    });
});


