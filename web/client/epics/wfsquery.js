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
const {FEATURE_TYPE_SELECTED, featureTypeLoaded, featureTypeError} = require('../actions/wfsquery');

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

module.exports = {
    featureTypeSelectedEpic
};
