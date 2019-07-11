/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    LAYER_SELECTED_FOR_SEARCH,
    FEATURE_TYPE_SELECTED,
    FEATURE_TYPE_ERROR,
    FEATURE_LOADING,
    FEATURE_LOADED,
    FEATURE_ERROR,
    QUERY_RESULT,
    QUERY_ERROR,
    QUERY_CREATE,
    QUERY,
    RESET_QUERY,
    INIT_QUERY_PANEL,
    TOGGLE_LAYER_FILTER,
    initQueryPanel,
    layerSelectedForSearch,
    featureTypeSelected,
    featureTypeError,
    featureLoading,
    featureLoaded,
    featureError,
    querySearchResponse,
    queryError,
    createQuery,
    query,
    resetQuery,
    toggleLayerFilter
} = require('../wfsquery');

describe('wfsquery actions', () => {
    it('layerSelectedForSearch', () => {
        let {type, id} = layerSelectedForSearch(1);
        expect(type).toBe(LAYER_SELECTED_FOR_SEARCH);
        expect(id).toBe(1);
    });
    it('layerSelectedForSearch', () => {
        let {type} = initQueryPanel();
        expect(type).toBe(INIT_QUERY_PANEL);
    });
    it('featureTypeSelected', () => {
        let {type, url, typeName} = featureTypeSelected("/geoserver/", "topp:states");
        expect(type).toBe(FEATURE_TYPE_SELECTED);
        expect(url).toBe("/geoserver/");
        expect(typeName).toBe("topp:states");
    });
    it('featureTypeError', () => {
        let {type, error, typeName} = featureTypeError("topp:states", "ERROR");
        expect(type).toBe(FEATURE_TYPE_ERROR);
        expect(error).toBe("ERROR");
        expect(typeName).toBe("topp:states");
    });
    it('featureLoading', () => {
        let {type, isLoading} = featureLoading(true);
        expect(type).toBe(FEATURE_LOADING);
        expect(isLoading).toBe(true);
    });
    it('featureLoaded', () => {
        let {type, typeName, feature} = featureLoaded("topp:states", "feature");
        expect(type).toBe(FEATURE_LOADED);
        expect(typeName).toBe("topp:states");
        expect(feature).toBe(feature);
    });
    it('featureError', () => {
        let {type, typeName, error} = featureError("topp:states", "ERROR");
        expect(type).toBe(FEATURE_ERROR);
        expect(typeName).toBe("topp:states");
        expect(error).toBe("ERROR");
    });
    it('querySearchResponse', () => {
        let {type, result, searchUrl, filterObj} = querySearchResponse("result", "searchUrl", "filterObj");
        expect(type).toBe(QUERY_RESULT);
        expect(result).toBe("result");
        expect(searchUrl).toBe("searchUrl");
        expect(filterObj).toBe("filterObj");
    });
    it('queryError', () => {
        let {type, error} = queryError("ERROR");
        expect(type).toBe(QUERY_ERROR);
        expect(error).toBe("ERROR");
    });
    it('createQuery', () => {
        let {type, searchUrl, filterObj} = createQuery("searchUrl", "filterObj");
        expect(type).toBe(QUERY_CREATE);
        expect(searchUrl).toBe("searchUrl");
        expect(filterObj).toBe("filterObj");
    });
    it('query', () => {
        let {type, searchUrl, filterObj} = query("searchUrl", "filterObj");
        expect(type).toBe(QUERY);
        expect(searchUrl).toBe("searchUrl");
        expect(filterObj).toBe("filterObj");
    });
    it('query with query options', () => {
        let { type, searchUrl, filterObj, queryOptions } = query("searchUrl", "filterObj", "queryOptions");
        expect(type).toBe(QUERY);
        expect(searchUrl).toBe("searchUrl");
        expect(filterObj).toBe("filterObj");
        expect(queryOptions).toBe("queryOptions");
    });
    it('resetQuery', () => {
        let {type} = resetQuery();
        expect(type).toBe(RESET_QUERY);
    });
    it('toggleLayerFilter', () => {
        let {type} = toggleLayerFilter();
        expect(type).toBe(TOGGLE_LAYER_FILTER);
    });
});
