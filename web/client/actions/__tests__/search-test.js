/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    TEXT_SEARCH_RESULTS_LOADED,
    TEXT_SEARCH_LOADING,
    TEXT_SEARCH_ERROR,
    TEXT_SEARCH_STARTED,
    TEXT_SEARCH_ITEM_SELECTED,
    TEXT_SEARCH_NESTED_SERVICES_SELECTED,
    TEXT_SEARCH_CANCEL_ITEM,
    UPDATE_RESULTS_STYLE,
    CHANGE_SEARCH_TOOL,
    ZOOM_ADD_POINT,
    CHANGE_FORMAT,
    SCHEDULE_SEARCH_LAYER_WITH_FILTER,
    CHANGE_COORD,
    HIDE_MARKER,
    changeActiveSearchTool,
    zoomAndAddPoint,
    changeFormat,
    changeCoord,
    searchResultLoaded,
    searchTextLoading,
    searchResultError,
    textSearch,
    selectSearchItem,
    selectNestedService,
    cancelSelectedItem,
    updateResultsStyle,
    hideMarker,
    scheduleSearchLayerWithFilter
} from '../search';

describe('Test correctness of the search actions', () => {

    it('text search started', () => {
        const action = textSearch("via Milano", {}, 25);
        expect(action.type).toBe(TEXT_SEARCH_STARTED);
        expect(action.searchText).toBe("via Milano");
        expect(action.maxResults).toBe(25);
    });
    it('text search loading', () => {
        const action = searchTextLoading(true);
        expect(action.loading).toBe(true);
        expect(action.type).toBe(TEXT_SEARCH_LOADING);
    });
    it('text search error', () => {
        const action = searchResultError({message: "MESSAGE"});
        expect(action.error).toExist();
        expect(action.error.message).toBe("MESSAGE");
        expect(action.type).toBe(TEXT_SEARCH_ERROR);
    });
    it('search results', () => {
        const testVal = ['result1', 'result2'];
        const retval = searchResultLoaded(testVal);
        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH_RESULTS_LOADED);
        expect(retval.results).toEqual(testVal);
        expect(retval.append).toBe(false);

        const retval2 = searchResultLoaded(testVal, true);
        expect(retval2).toExist();
        expect(retval2.type).toBe(TEXT_SEARCH_RESULTS_LOADED);
        expect(retval2.results).toEqual(testVal);
        expect(retval2.append).toBe(true);
    });
    it('search item selected', () => {
        const retval = selectSearchItem("A", "B", "C", {color: '#ff0000'});
        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH_ITEM_SELECTED);
        expect(retval.item).toEqual("A");
        expect(retval.mapConfig).toBe("B");
        expect(retval.service).toBe("C");
        expect(retval.resultsStyle).toEqual({color: '#ff0000'});
    });
    it('search item cancelled', () => {
        const retval = cancelSelectedItem("ITEM");
        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH_CANCEL_ITEM);
        expect(retval.item).toEqual("ITEM");
    });
    it('search nested service selected', () => {
        const items = [{text: "TEXT"}];
        const services = [{type: "wfs"}, {type: "wms"}];
        const retval = selectNestedService(services, items, "TEST");
        expect(retval).toExist();
        expect(retval.type).toBe(TEXT_SEARCH_NESTED_SERVICES_SELECTED);
        expect(retval.items).toEqual(items);
        expect(retval.services).toEqual(services);
    });
    it('update results style', () => {
        const style = {color: '#ff0000'};
        const retval = updateResultsStyle(style);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_RESULTS_STYLE);
        expect(retval.style).toEqual({color: '#ff0000'});
    });
    it('update active search tool', () => {
        const activeSearchTool = "decimal";
        const retval = changeActiveSearchTool(activeSearchTool);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_SEARCH_TOOL);
        expect(retval.activeSearchTool).toEqual(activeSearchTool);
    });
    it('zoom to point and add a marker there', () => {
        const pos = {x: 1, y: 2};
        const zoom = 12;
        const crs = "EPSG:4326";
        const retval = zoomAndAddPoint(pos, zoom, crs);
        expect(retval).toExist();
        expect(retval.type).toBe(ZOOM_ADD_POINT);
        expect(retval.pos).toEqual(pos);
        expect(retval.zoom).toEqual(zoom);
        expect(retval.crs).toEqual(crs);
    });
    it('change coordinate', () => {
        const coord = "lat";
        const val = 12;
        const retval = changeCoord(coord, val);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_COORD);
        expect(retval.coord).toEqual(coord);
        expect(retval.val).toEqual(val);
    });
    it('change format', () => {
        const format = "decimal";
        const retval = changeFormat(format);
        expect(retval).toExist();
        expect(retval.type).toBe(CHANGE_FORMAT);
        expect(retval.format).toEqual(format);
    });
    it('hide marker', () => {
        const retval = hideMarker();
        expect(retval).toExist();
        expect(retval.type).toBe(HIDE_MARKER);
    });
    it('scheduleSearchLayerWithFilter', () => {
        const retval = scheduleSearchLayerWithFilter({ layer: 'layer1', cql_filter: "mm='nn'"});
        expect(retval).toExist();
        expect(retval.type).toBe(SCHEDULE_SEARCH_LAYER_WITH_FILTER);
        expect(retval.layer).toBe('layer1');
        expect(retval.cql_filter).toBe("mm='nn'");
    });
    it('scheduleSearchLayerWithFilter with queryParamZoomOption', () => {
        const queryParamZoomOption = {
            overrideZoomLvl: 5,
            isCoordsProvided: false
        };
        const retval = scheduleSearchLayerWithFilter({ layer: 'layer1', cql_filter: "mm='nn'", queryParamZoomOption});
        expect(retval).toExist();
        expect(retval.type).toEqual(SCHEDULE_SEARCH_LAYER_WITH_FILTER);
        expect(retval.layer).toEqual('layer1');
        expect(retval.cql_filter).toEqual("mm='nn'");
        expect(retval.queryParamZoomOption).toEqual(queryParamZoomOption);
    });
});
