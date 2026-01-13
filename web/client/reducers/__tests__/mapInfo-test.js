/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import mapInfo from '../mapInfo';
import {
    featureInfoClick,
    toggleEmptyMessageGFI,
    toggleShowCoordinateEditor,
    changeFormat,
    changePage,
    toggleHighlightFeature,
    setMapTrigger,
    setShowInMapPopup,
    onInitPlugin
} from '../../actions/mapInfo';
import {changeVisualizationMode} from '../../actions/maptype';
import { MAP_CONFIG_LOADED } from '../../actions/config';
import { VisualizationModes } from '../../utils/MapTypeUtils';

describe('Test the mapInfo reducer', () => {
    const appState = {
        configuration: {
            infoFormat: 'text/plain'
        },
        responses: [],
        requests: [
            {reqId: 10, request: "test"},
            {reqId: 11, request: "test1"},
            {reqId: 3, request: "test3"}
        ]};

    it('returns original state on unrecognized action', () => {
        let state = mapInfo(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('creates a general error ', () => {
        let testAction = {
            type: 'ERROR_FEATURE_INFO',
            error: "error",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo( appState, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1]).toBeFalsy();
    });

    it('creates an wms feature info exception', () => {
        let testAction = {
            type: 'EXCEPTIONS_FEATURE_INFO',
            exceptions: "exception",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo(appState, testAction);
        expect(state.responses).toBeTruthy();
        expect(state.responses.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("test");

    });

    it('creates a feature info data from successful request', () => {
        let testAction = {
            type: 'LOAD_FEATURE_INFO',
            data: "data",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo(appState, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBeTruthy();
        expect(state.responses[1].response).toBe("data");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");
        expect(state.index).toBe(1);
    });
    it('creates a feature info data from successful request, with showAllResponses true', () => {
        let testAction = {
            type: 'LOAD_FEATURE_INFO',
            data: "data",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 11
        };

        let state = mapInfo({
            configuration: {
                infoFormat: 'text/plain'
            },
            responses: [],
            requests: [
                {reqId: 10, request: "test"},
                {reqId: 11, request: "test1"},
                {reqId: 3, request: "test3"}
            ],
            showAllResponses: true
        }, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.loaded).toBe(true);
        expect(state.responses[1].response).toBe("data");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo({
            configuration: {
                infoFormat: 'text/plain'
            },
            responses: [{response: "test"}, {response: "test1"}],
            requests: [
                {reqId: 10, request: "test"},
                {reqId: 11, request: "test1"},
                {reqId: 3, request: "test3"}
            ],
            showAllResponses: true
        }, {...testAction, reqId: 3, layerMetadata: "meta3"});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(3);
        expect(state.responses[0].response).toBe("test");
        expect(state.responses[0]).toBeTruthy();
        expect(state.responses[1].response).toBe("test1");
        expect(state.responses[1]).toBeTruthy();
        expect(state.responses[2]).toBeTruthy();
        expect(state.responses[2].queryParams).toBe("params");
        expect(state.responses[2].layerMetadata).toBe("meta3");
        expect(state.loaded).toBe(true);
        expect(state.index).toBe(0);
    });
    it('creates a feature info data from successful request on showInMapPopup', () => {
        let testAction = {
            type: 'LOAD_FEATURE_INFO',
            data: "data",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo({...appState, showInMapPopup: true}, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: [], showInMapPopup: true}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.index).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"], showInMapPopup: true}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBeTruthy();
        expect(state.index).toBe(0);
    });
    it('creates a feature info with empty data from successful request', () => {
        let testAction = {
            type: 'LOAD_FEATURE_INFO',
            data: "",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo(appState, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(undefined);
        expect(state.loaded).toBe(undefined);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBeTruthy();
        expect(state.responses[1].response).toBe("");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");

        state = mapInfo(Object.assign({}, appState, {responses: [{response: "test"}, {response: "test"}]}), {...testAction, layerMetadata: "meta3", reqId: 3});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(3);
        expect(state.responses[0]).toBeTruthy();
        expect(state.responses[0].response).toBe("test");
        expect(state.responses[1].response).toBe("test");
        expect(state.responses[2].queryParams).toBe("params");
        expect(state.responses[2].layerMetadata).toBe("meta3");
        expect(state.index).toBe(undefined);
        expect(state.loaded).toBe(true);
    });

    it('creates a new mapinfo request', () => {
        let state = mapInfo({}, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");

        state = mapInfo({requests: [] }, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");

        state = mapInfo( appState, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(4);
        expect(state.requests.filter((req) => req.reqId === 10)[0].request).toBe("test");
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");
    });

    it('clear request queue', () => {
        let state = mapInfo({}, {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: []}), {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);

        state = mapInfo(Object.assign({}, appState, {responses: ["test"]}), {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);
    });

    it('set a new point on map which has been clicked', () => {
        let state = mapInfo({}, featureInfoClick("p"));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toBe('p');

        state = mapInfo({ clickPoint: 'oldP' }, featureInfoClick("p"));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toBe('p');

        const overrideParams = {"ws:layername": {info_format: "application/json"}};
        const filterNameList = ["ws:layername"];
        const layer = {};
        const itemId = "ws:layername_1";
        state = mapInfo({ clickPoint: 'oldP' }, featureInfoClick("p", layer, filterNameList, overrideParams, itemId ));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toEqual('p');
        expect(state.clickLayer).toEqual(layer);
        expect(state.filterNameList).toEqual(filterNameList);
        expect(state.overrideParams).toEqual(overrideParams);
        expect(state.itemId).toEqual(itemId);
    });

    it('enables map info', () => {
        let state = mapInfo({}, {type: 'CHANGE_MAPINFO_STATE', enabled: true});
        expect(state).toExist();
        expect(state.enabled).toBe(true);

        state = mapInfo({}, {type: 'CHANGE_MAPINFO_STATE', enabled: false});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
    });

    it('change mapinfo format', () => {
        let state = mapInfo({}, {type: 'CHANGE_MAPINFO_FORMAT', infoFormat: "testFormat"});
        expect(state).toExist();
        expect(state.configuration.infoFormat).toBe("testFormat");

        state = mapInfo({configuration: {infoFormat: 'oldFormat'}}, {type: 'CHANGE_MAPINFO_FORMAT', infoFormat: "newFormat"});
        expect(state).toExist();
        expect(state.configuration.infoFormat).toBe('newFormat');
    });

    it('show reverese geocode', () => {
        let state = mapInfo({}, {type: 'SHOW_REVERSE_GEOCODE'});
        expect(state).toExist();
        expect(state.showModalReverse).toBe(true);

        state = mapInfo({reverseGeocodeData: {}}, {type: "SHOW_REVERSE_GEOCODE", reverseGeocodeData: "newData"});
        expect(state).toExist();
        expect(state.reverseGeocodeData).toBe('newData');
    });

    it('hide reverese geocode', () => {
        let state = mapInfo({}, {type: 'HIDE_REVERSE_GEOCODE'});
        expect(state).toExist();
        expect(state.showModalReverse).toBe(false);
        expect(state.reverseGeocodeData).toBe(undefined);
    });

    it('should reset the state', () => {
        let state = mapInfo({showMarker: true}, {type: 'RESET_CONTROLS'});
        expect(state).toBeTruthy();
        expect(state).toEqual({
            showMarker: false,
            responses: [],
            requests: [],
            configuration: {
                trigger: "click"
            }
        });
    });

    it('should toggle mapinfo state', () => {
        let state = mapInfo({enabled: true}, {type: 'TOGGLE_MAPINFO_STATE'});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
    });

    it('should enable center to marker', () => {
        let state = mapInfo({}, {type: 'UPDATE_CENTER_TO_MARKER'});
        expect(state).toExist();
        expect(state.centerToMarker).toBe(undefined);

        state = mapInfo({}, {type: 'UPDATE_CENTER_TO_MARKER', status: 'enabled'});
        expect(state).toExist();
        expect(state.centerToMarker).toBe('enabled');

    });

    it('TOGGLE_EMPTY_MESSAGE_GFI', () => {
        let state = mapInfo({
            infoFormat: "text/html",
            configuration: {}
        }, toggleEmptyMessageGFI());
        expect(state.configuration.showEmptyMessageGFI).toBe(true);
        state = mapInfo(state, toggleEmptyMessageGFI());
        expect(state.configuration.showEmptyMessageGFI).toBe(false);
    });
    it('MAP_CONFIG_LOADED', () => {
        const oldInfoFormat = "text/html";
        const newInfoFormat = "application/json";
        let state = mapInfo({
            infoFormat: oldInfoFormat,
            configuration: {}
        }, {
            type: MAP_CONFIG_LOADED,
            config: {
                mapInfoConfiguration: {
                    infoFormat: newInfoFormat,
                    showEmptyMessageGFI: true
                }
            }
        });
        expect(state.configuration.showEmptyMessageGFI).toBe(true);
        expect(state.configuration.infoFormat).toBe(newInfoFormat);
    });

    it('toggleShowCoordinateEditor', () => {
        let state = mapInfo({}, toggleShowCoordinateEditor(true));
        expect(state).toExist();
        expect(state.showCoordinateEditor).toBe(false);
    });
    it('changeFormat', () => {
        let state = mapInfo({
            formatCoord: "aeronautical"
        }, changeFormat("decimal"));
        expect(state).toExist();
        expect(state.formatCoord).toBe("decimal");
    });
    it('mapInfo changePage', () => {
        const action = changePage(1);
        const state = mapInfo( undefined, action);
        expect(state.index).toBe(1);
    });
    it('mapInfo changePage', () => {
        const action = toggleHighlightFeature(true);
        const state = mapInfo(undefined, action);
        expect(state.highlight).toBe(true);
    });
    it('mapInfo SET_MAP_TRIGGER', () => {
        const action = setMapTrigger('hover');
        const state = mapInfo(undefined, action);
        expect(state.configuration.trigger).toBe('hover');
    });
    it('test the result of changeVisualizationMode action - VISUALIZATION_MODE_CHANGED when passing to 3D', () => {
        const action = changeVisualizationMode(VisualizationModes._3D);
        const initialState = {configuration: {}};
        const state = mapInfo(initialState, action);
        expect(state.configuration.trigger).toBe("click");
    });
    it('test the result of changeVisualizationMode action - VISUALIZATION_MODE_CHANGED when passing to 2D', () => {
        const action = changeVisualizationMode(VisualizationModes._2D);
        const initialState = {configuration: {trigger: "click"}};
        const state = mapInfo(initialState, action);
        expect(state.configuration.trigger).toBe("click");
    });
    it('setShowInMapPopup', () => {
        const initialState = { configuration: {} };
        const state = mapInfo(initialState, setShowInMapPopup(true));
        expect(state.showInMapPopup).toBeTruthy();
    });
    it('onInitPlugin', () => {
        const initialState = { configuration: {} };
        const state = mapInfo(initialState, onInitPlugin({cfg1: "test", configuration: {maxItems: 3}}));
        expect(state.cfg1).toEqual("test");
        expect(state.configuration).toEqual({maxItems: 3});
    });
    it('initiateOrResetHighlight via onInitPlugin if highlight default value equal true', () => {
        const initialState = { configuration: {} };
        const state = mapInfo(initialState, onInitPlugin({highlight: true}));
        expect(state.highlight).toEqual(true);
    });
    it('initiateOrResetHighlight via onInitPlugin if highlight default value equal false', () => {
        const initialState = { configuration: {} };
        const state = mapInfo(initialState, onInitPlugin({highlight: false}));
        expect(state.highlight).toEqual(false);
    });
    it('receiveResponse does not change index when same response is present', () => {
        // Simulate state with loaded true and index set
        const state = {
            loaded: true,
            index: 0,
            configuration: { infoFormat: 'text/plain' },
            requests: [
                { reqId: 10, request: 'test' },
                { reqId: 11, request: 'test1' }
            ],
            responses: [
                { response: 'data0', queryParams: 'params0', layerMetadata: 'meta0', layer: { type: 'wms' } },
                { response: 'data1', queryParams: 'params1', layerMetadata: 'meta1', layer: { type: 'wms' } }
            ]
        };
        // Action simulating a successful feature info load for reqId 11
        const action = {
            type: 'LOAD_FEATURE_INFO',
            data: 'data1',
            requestParams: 'params1',
            layerMetadata: 'meta1',
            layer: { type: 'wms' },
            reqId: 11
        };
        // Call reducer
        const newState = mapInfo(state, action);
        // Should have loaded true and index present
        expect(newState.loaded).toBe(true);
        // Index should not change
        expect(newState.index).toBe(0);
        // Should keep responses array
        expect(newState.responses.length).toBeGreaterThan(0);
    });
    it('receiveResponse sets index to another index when previous response is empty', () => {
        // Simulate state with loaded true and index set
        const state = {
            loaded: true,
            index: 0,
            configuration: { infoFormat: 'text/plain' },
            requests: [
                { reqId: 10, request: 'test' },
                { reqId: 11, request: 'test1' }
            ],
            responses: [
                { response: 'data0', queryParams: 'params0', layerMetadata: 'meta0', layer: { type: 'wms' } },
                { response: 'data1', queryParams: 'params1', layerMetadata: 'meta1', layer: { type: 'wms' } }
            ]
        };
        // Action simulating a successful feature info load for reqId 11
        const action = {
            type: 'LOAD_FEATURE_INFO',
            data: null,
            requestParams: 'params0',
            layerMetadata: 'meta0',
            layer: { type: 'wms' },
            reqId: 10
        };
        // Call reducer
        const newState = mapInfo(state, action);
        // Should have loaded true and index present
        expect(newState.loaded).toBe(true);
        // Index should not change
        expect(newState.index).toBe(1);
        // Should keep responses array
        expect(newState.responses.length).toBeGreaterThan(0);
    });
});
