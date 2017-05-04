/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const axios = require('../libs/ajax');
const {changeSpatialAttribute} = require('../actions/queryform');
const {FEATURE_TYPE_SELECTED, QUERY, featureTypeLoaded, featureTypeError, query, createQuery, querySearchResponse, queryError, featureClose} = require('../actions/wfsquery');
const FilterUtils = require('../utils/FilterUtils');
const {isString} = require('lodash');
const {TOGGLE_CONTROL, setControlProperty} = require('../actions/controls');

const types = {
    'xsd:string': 'string',
    'xsd:dateTime': 'date',
    'xsd:number': 'number',
    'xsd:int': 'number'
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
        attributes: data.featureTypes[0].properties
            .filter((attribute) => attribute.type.indexOf('gml:') !== 0)
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

const featureTypeSelectedEpic = action$ =>
    action$.ofType(FEATURE_TYPE_SELECTED).switchMap(action => {
        return Rx.Observable.defer( () =>
            axios.get(action.url + '?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=' + action.typeName + '&outputFormat=application/json'))
        .map((response) => {
            if (typeof response.data === 'object' && response.data.featureTypes && response.data.featureTypes[0]) {
                const info = extractInfo(response.data);
                const geometry = info.geometry[0] && info.geometry[0].attribute ? info.geometry[0].attribute : 'the_geom';
                return Rx.Observable.from([featureTypeLoaded(action.typeName, info), changeSpatialAttribute(geometry)]);
            }
            try {
                JSON.parse(response.data);
            } catch(e) {
                return Rx.Observable.from([featureTypeError(action.typeName, 'Error from WFS: ' + e.message)]);
            }
            return Rx.Observable.from([featureTypeError(action.typeName, 'Error: feature types are empty')]);
        })
        .mergeAll()
        .catch(e => Rx.Observable.of(featureTypeError(action.typeName, e.message)));
    });

const wfsQueryEpic = (action$, store) =>
    action$.ofType(QUERY).switchMap(action => {
        const {unmarshaller} = require('../utils/ogc/WFS');
        const state = store.getState();

        let data;
        if (typeof action.filterObj === 'string') {
            data = action.filterObj;
        } else {
            const sortOptions = action.retry ? { sortBy: state.query.featureTypes[state.query.typeName].attributes[0].attribute, sortOrder: 'A'} : action.filterObj.sortOptions;
            data = action.filterObj.filterType === "OGC" ?
                FilterUtils.toOGCFilter(action.filterObj.featureTypeName, action.filterObj, action.filterObj.ogcVersion, sortOptions, action.filterObj.hits) :
                FilterUtils.toCQLFilter(action.filterObj);
        }
        return Rx.Observable.merge(
            Rx.Observable.of(createQuery(action.searchUrl, action.filterObj)),
            Rx.Observable.of(setControlProperty('drawer', 'enabled', false)),
            Rx.Observable.defer( () =>
                axios.post(action.searchUrl + '?service=WFS&outputFormat=json', data, {
                  timeout: 60000,
                  headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}
                }))
            .map((response) => {
                const json = isString(response.data) ? unmarshaller.unmarshalString(response.data) : null;
                const error = json && json.value && json.value.exception && json.value.exception[0] && json.value.exception[0].TYPE_NAME === 'OWS_1_0_0.ExceptionType' && json.value.exception[0].exceptionCode === 'NoApplicableCode';

                let obs = error ? Rx.Observable.of(query(action.searchUrl, action.filterObj, true)) : Rx.Observable.of(querySearchResponse(response.data, action.searchUrl, action.filterObj));
                obs = action.retry && error ? Rx.Observable.of(queryError('No sortable request')) : obs;
                return obs;
            })
            .mergeAll()
            .catch((e) => {
                return Rx.Observable.of(queryError(e));
            })
        );
    });

const closeFeatureEpic = action$ =>
    action$.ofType(TOGGLE_CONTROL).switchMap(action => {
        return action.control && action.control === 'drawer' ? Rx.Observable.of(featureClose()) : Rx.Observable.empty();
    });

module.exports = {
    featureTypeSelectedEpic,
    wfsQueryEpic,
    closeFeatureEpic
};
