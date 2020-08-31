/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    CHANGE_MAPINFO_STATE,
    NEW_MAPINFO_REQUEST,
    PURGE_MAPINFO_RESULTS,
    CHANGE_MAPINFO_FORMAT,
    SHOW_REVERSE_GEOCODE,
    HIDE_REVERSE_GEOCODE,
    GET_VECTOR_INFO,
    TOGGLE_MAPINFO_STATE,
    UPDATE_CENTER_TO_MARKER,
    FEATURE_INFO_CLICK, featureInfoClick,
    TOGGLE_EMPTY_MESSAGE_GFI, toggleEmptyMessageGFI,
    changeMapInfoState,
    newMapInfoRequest,
    purgeMapInfoResults,
    changeMapInfoFormat,
    showMapinfoRevGeocode,
    hideMapinfoRevGeocode,
    getVectorInfo,
    toggleMapInfoState,
    updateCenterToMarker,
    TOGGLE_SHOW_COORD_EDITOR, toggleShowCoordinateEditor,
    CHANGE_FORMAT, changeFormat,
    CHANGE_PAGE, changePage,
    TOGGLE_HIGHLIGHT_FEATURE, toggleHighlightFeature,
    SET_MAP_TRIGGER, setMapTrigger
} = require('../mapInfo');

describe('Test correctness of the map actions', () => {

    it('gets vector info', () => {
        const retval = getVectorInfo('layer', 'request', 'metadata');

        expect(retval.type).toBe(GET_VECTOR_INFO);
        expect(retval.layer).toBe('layer');
        expect(retval.request).toBe('request');
        expect(retval.metadata).toBe('metadata');
    });

    it('change map info state', () => {
        const testVal = "val";
        const retval = changeMapInfoState(testVal);

        expect(retval.type).toBe(CHANGE_MAPINFO_STATE);
        expect(retval.enabled).toExist();
        expect(retval.enabled).toBe(testVal);
    });

    it('add new info request', () => {
        const reqIdVal = 100;
        const requestVal = {p: "p"};
        const e = newMapInfoRequest(reqIdVal, requestVal);
        expect(e).toExist();
        expect(e.type).toBe(NEW_MAPINFO_REQUEST);
        expect(e.reqId).toExist();
        expect(e.reqId).toBeA('number');
        expect(e.reqId).toBe(100);
        expect(e.request).toExist();
        expect(e.request.p).toBe("p");
    });

    it('delete all results', () => {
        const retval = purgeMapInfoResults();

        expect(retval.type).toBe(PURGE_MAPINFO_RESULTS);
    });

    it('change mapInfo format', () => {
        const retval = changeMapInfoFormat('testFormat');

        expect(retval.type).toBe(CHANGE_MAPINFO_FORMAT);
        expect(retval.infoFormat).toBe('testFormat');
    });

    it('get reverse geocode data', () => {
        let placeId;
        showMapinfoRevGeocode({lat: 40, lng: 10})((e) => {
            placeId = e.reverseGeocodeData.place_id;
            expect(e).toExist();
            expect(e.type).toBe(SHOW_REVERSE_GEOCODE);
            expect(placeId).toExist();
        });
    });

    it('test featureInfoClick with filterNameList and overrideParams', () => {
        const point = {latlng: {lat: 1, lng: 3}};
        const layer = {id: "layer.1"};
        const filterNameList = [];
        const itemId = "itemId";
        const overrideParams = {cql_filter: "ID_ORIG=1234"};

        const action = featureInfoClick(point, layer, filterNameList, overrideParams, itemId);
        expect(action).toExist();
        expect(action.type).toBe(FEATURE_INFO_CLICK);
        expect(action.point).toBe(point);
        expect(action.layer).toBe(layer);
        expect(action.filterNameList).toBe(filterNameList);
        expect(action.overrideParams).toBe(overrideParams);
        expect(action.itemId).toBe(itemId);
    });
    it('reset reverse geocode data', () => {
        const e = hideMapinfoRevGeocode();
        expect(e).toExist();
        expect(e.type).toBe(HIDE_REVERSE_GEOCODE);
    });

    it('toggle map info state', () => {
        const retval = toggleMapInfoState();
        expect(retval.type).toBe(TOGGLE_MAPINFO_STATE);
    });

    it('update center to marker', () => {
        const retval = updateCenterToMarker('enabled');
        expect(retval.type).toBe(UPDATE_CENTER_TO_MARKER);
        expect(retval.status).toBe('enabled');
    });
    it('toggleEmptyMessageGFI', () => {
        const retval = toggleEmptyMessageGFI();
        expect(retval.type).toBe(TOGGLE_EMPTY_MESSAGE_GFI);
    });
    it('toggleShowCoordinateEditor', () => {
        const showCoordinateEditor = true;
        const retval = toggleShowCoordinateEditor(showCoordinateEditor);
        expect(retval.type).toBe(TOGGLE_SHOW_COORD_EDITOR);
        expect(retval.showCoordinateEditor).toBe(showCoordinateEditor);
    });
    it('changeFormat', () => {
        const format = "decimal";
        const retval = changeFormat(format);
        expect(retval.type).toBe(CHANGE_FORMAT);
        expect(retval.format).toBe(format);
    });
    it('toggleHighlightFeature', () => {
        const retVal = toggleHighlightFeature(true);
        expect(retVal).toExist();
        expect(retVal.type).toBe(TOGGLE_HIGHLIGHT_FEATURE);
        expect(toggleHighlightFeature().enabled).toBeFalsy();
        expect(toggleHighlightFeature(true).enabled).toBe(true);
    });
    it('changePage', () => {
        const retVal = changePage(true);
        expect(retVal).toExist();
        expect(retVal.type).toBe(CHANGE_PAGE);
        expect(changePage().index).toBeFalsy();
        expect(changePage(1).index).toBe(1);
    });
    it('setMapTrigger', () => {
        expect(setMapTrigger('hover')).toEqual({type: SET_MAP_TRIGGER, trigger: 'hover' });
    });
});
