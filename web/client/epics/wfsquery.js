/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const axios = require('../libs/ajax');
const Url = require('url');
const {changeSpatialAttribute, SELECT_VIEWPORT_SPATIAL_METHOD, updateGeometrySpatialField} = require('../actions/queryform');
const {CHANGE_MAP_VIEW} = require('../actions/map');
const {FEATURE_TYPE_SELECTED, QUERY, featureLoading, featureTypeLoaded, featureTypeError, querySearchResponse, queryError} = require('../actions/wfsquery');
const {paginationInfo, isDescribeLoaded, describeSelector} = require('../selectors/query');
const FilterUtils = require('../utils/FilterUtils');
const assign = require('object-assign');

const {isObject} = require('lodash');
const {interceptOGCError} = require('../utils/ObservableUtils');
// this is a workaround for https://osgeo-org.atlassian.net/browse/GEOS-7233. can be removed when fixed
const workaroundGEOS7233 = ({totalFeatures, features, ...rest}, {startIndex, maxFeatures}, originalSize) => {
    if (originalSize > totalFeatures && originalSize === startIndex + features.length && totalFeatures === features.length) {
        return {
            ...rest,
            features,
            totalFeatures: originalSize
        };
    }
    return {
        ...rest,
        features,
        totalFeatures
    };

};
const types = {
    // string
    // 'xsd:ENTITIES': 'string',
    // 'xsd:ENTITY': 'string',
    // 'xsd:ID': 'string',
    // 'xsd:IDREF': 'string',
    // 'xsd:IDREFS': 'string',
    // 'xsd:language': 'string',
    // 'xsd:Name': 'string',
    // 'xsd:NCName': 'string',
    // 'xsd:NMTOKEN': 'string',
    // 'xsd:NMTOKENS': 'string',
    'xsd:normalizedString': 'string',
    // 'xsd:QName': 'string',
    'xsd:string': 'string',
    // 'xsd:token': 'string',

    // date
    'xsd:date': 'date',
    'xsd:dateTime': 'date',
    // 'xsd:duration': 'date',
    // 'xsd:gDay': 'date',
    // 'xsd:gMonth': 'date',
    // 'xsd:gMonthDay': 'date',
    // 'xsd:gYear': 'date',
    // 'xsd:gYearMonth': 'date',
    // 'xsd:time': 'date',

    // number
    // 'xsd:byte': 'number',
    'xsd:decimal': 'number',
    'xsd:int': 'number',
    'xsd:integer': 'number',
    'xsd:long': 'number',
    'xsd:negativeInteger': 'number',
    'xsd:nonNegativeInteger': 'number',
    'xsd:nonPositiveInteger': 'number',
    'xsd:positiveInteger': 'number',
    'xsd:short': 'number',
    'xsd:unsignedLong': 'number',
    'xsd:unsignedInt': 'number',
    'xsd:unsignedShort': 'number',
    // 'xsd:unsignedByte': 'number',

    // from old object
    'xsd:number': 'number',

    // misc
    // 'xsd:anyURI': 'string',
    // 'xsd:base64Binary': 'number',
    'xsd:boolean': 'boolean',
    'xsd:double': 'number',
    // 'xsd:hexBinary': 'string',
    // 'xsd:NOTATION': 'string',
    'xsd:float': 'number'
};

const fieldConfig = {};

const extractInfo = (data) => {
    return {
        geometry: data.featureTypes[0].properties
            .filter((attribute) => attribute.type.indexOf('gml:') === 0)
            .map((attribute) => {
                let conf = {
                    label: attribute.name,
                    attribute: attribute.name,
                    type: 'geometry',
                    valueId: "id",
                    valueLabel: "name",
                    values: []
                };
                conf = fieldConfig[attribute.name] ? {...conf, ...fieldConfig[attribute.name]} : conf;
                return conf;
            }),
        original: data,
        attributes: data.featureTypes[0].properties
            .filter((attribute) => attribute.type.indexOf('gml:') !== 0 && types[attribute.type])
            .map((attribute) => {
                let conf = {
                    label: attribute.name,
                    attribute: attribute.name,
                    type: types[attribute.type],
                    valueId: "id",
                    valueLabel: "name",
                    values: []
                };
                conf = fieldConfig[attribute.name] ? {...conf, ...fieldConfig[attribute.name]} : conf;
                return conf;
            })
    };
};

const getWFSFilterData = (filterObj) => {
    let data;
    if (typeof filterObj === 'string') {
        data = filterObj;
    } else {
        data = filterObj.filterType === "OGC" ?
            FilterUtils.toOGCFilter(filterObj.featureTypeName, filterObj, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits) :
            FilterUtils.toCQLFilter(filterObj);
    }
    return data;
};

const getWFSFeature = (searchUrl, filterObj) => {
    const data = getWFSFilterData(filterObj);

    const urlParsedObj = Url.parse(searchUrl, true);
    let params = isObject(urlParsedObj.query) ? urlParsedObj.query : {};
    params.service = 'WFS';
    params.outputFormat = 'json';
    const queryString = Url.format({
        protocol: urlParsedObj.protocol,
        host: urlParsedObj.host,
        pathname: urlParsedObj.pathname,
        query: params
    });

    return Rx.Observable.defer( () =>
        axios.post(queryString, data, {
            timeout: 60000,
            headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
        }));
};

const getFirstAttribute = (state)=> {
    return state.query && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes && state.query.featureTypes[state.query.typeName].attributes[0] && state.query.featureTypes[state.query.typeName].attributes[0].attribute || null;
};

const getDefaultSortOptions = (attribute) => {
    return attribute ? { sortBy: attribute, sortOrder: 'A'} : {};
};

const retryWithForcedSortOptions = (action, store) => {
    const sortOptions = getDefaultSortOptions(getFirstAttribute(store.getState()));
    return getWFSFeature(action.searchUrl, assign(action.filterObj, {
        sortOptions
    }))
        .let(interceptOGCError)
        .map((newResponse) => {
            const state = store.getState();
            const data = workaroundGEOS7233(newResponse.data, action.filterObj.pagination, paginationInfo.totalFeatures(state));
            return querySearchResponse(data, action.searchUrl, action.filterObj);
        })
        .catch((e) => {
            return Rx.Observable.of(queryError(e));
        });
};

/**
 * Gets the WFS feature type attributes and geometry when the feature has been selected
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `FEATURE_TYPE_SELECTED`
 * @return {external:Observable}
 */

const featureTypeSelectedEpic = (action$, store) =>
    action$.ofType(FEATURE_TYPE_SELECTED)
        .filter(action => action.url && action.typeName)
        .switchMap(action => {
            const state = store.getState();
            if (isDescribeLoaded(state, action.typeName)) {
                const info = extractInfo(describeSelector(state));
                const geometry = info.geometry[0] && info.geometry[0].attribute ? info.geometry[0].attribute : 'the_geom';
                return Rx.Observable.of(changeSpatialAttribute(geometry));
            }
            return Rx.Observable.defer( () => axios.get(action.url + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + action.typeName + '&outputFormat=application/json'))
                .map((response) => {
                    if (typeof response.data === 'object' && response.data.featureTypes && response.data.featureTypes[0]) {
                        const info = extractInfo(response.data);
                        const geometry = info.geometry[0] && info.geometry[0].attribute ? info.geometry[0].attribute : 'the_geom';
                        return Rx.Observable.from([featureTypeLoaded(action.typeName, info), changeSpatialAttribute(geometry)]);
                    }
                    try {
                        JSON.parse(response.data);
                    } catch (e) {
                        return Rx.Observable.from([featureTypeError(action.typeName, 'Error from WFS: ' + e.message)]);
                    }
                    return Rx.Observable.from([featureTypeError(action.typeName, 'Error: feature types are empty')]);
                })
                .mergeAll()
                .catch(e => Rx.Observable.of(featureTypeError(action.typeName, e.message)));
        });

/**
 * Sends a WFS query, returns a response or handles request error
 * in particular the NoApplicableCode WFS error with a forced sort option on the first attribute
 * @memberof epics.wfsquery
 * @param {external:Observable} action$ manages `QUERY`
 * @return {external:Observable}
 */

const wfsQueryEpic = (action$, store) =>
    action$.ofType(QUERY)
        .switchMap(action => {
            return Rx.Observable.merge(
                getWFSFeature(action.searchUrl, action.filterObj)
                    .let(interceptOGCError)
                    .switchMap((response) => {
                        const state = store.getState();
                        const data = workaroundGEOS7233(response.data, action.filterObj.pagination, paginationInfo.totalFeatures(state));
                        return Rx.Observable.of(querySearchResponse(data, action.searchUrl, action.filterObj));
                    })
                    .startWith(featureLoading(true))
                    .catch((error) => {
                        if (error.name === "OGCError" && error.code === 'NoApplicableCode') {
                            return retryWithForcedSortOptions(action, store);
                        }
                        return Rx.Observable.of(queryError(error));
                    })
                    .concat(Rx.Observable.of(featureLoading(false)))
            );
        });

function validateExtent(extent) {
    if (extent[0] <= -180.0 || extent[2] >= 180.0) {
        extent[0] = -180.0;
        extent[2] = 180.0;
    }
    return extent;
}
const viewportSelectedEpic = (action$, store) =>
    action$.ofType(SELECT_VIEWPORT_SPATIAL_METHOD, CHANGE_MAP_VIEW)
        .switchMap((action) => {
            // calculate new geometry from map properties only for viewport
            const map = action.type === CHANGE_MAP_VIEW ? action : store.getState().map.present || store.getState().map;
            if (action.type === SELECT_VIEWPORT_SPATIAL_METHOD ||
                action.type === CHANGE_MAP_VIEW &&
                store.getState().queryform &&
                store.getState().queryform.spatialField &&
                store.getState().queryform.spatialField.method === "Viewport") {
                const bounds = Object.keys(map.bbox.bounds).reduce((p, c) => {
                    return assign({}, p, {[c]: parseFloat(map.bbox.bounds[c])});
                }, {});
                const extent = validateExtent([bounds.minx, bounds.miny, bounds.maxx, bounds.maxy]);
                const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
                const start = [extent[0], extent[1]];
                const end = [extent[2], extent[3]];
                const coordinates = [[start, [start[0], end[1]], end, [end[0], start[1]], start]];
                let geometry = {
                    type: "Polygon", radius: 0, projection: "EPSG:4326",
                    extent, center, coordinates
                };
                return Rx.Observable.of(updateGeometrySpatialField(geometry));
            }
            return Rx.Observable.empty();
        });

 /**
  * Epics for WFS query requests
  * @name epics.wfsquery
  * @type {Object}
  */

module.exports = {
    featureTypeSelectedEpic,
    wfsQueryEpic,
    viewportSelectedEpic,
    getWFSFilterData
};
