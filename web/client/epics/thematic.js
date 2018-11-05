/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { LOAD_FIELDS, LOAD_CLASSIFICATION, fieldsLoaded, fieldsError, classificationLoaded, classificationError} = require('../actions/thematic');
const { UPDATE_NODE, changeLayerParams } = require('../actions/layers');
const Rx = require('rxjs');
const axios = require('../libs/ajax');
const {head} = require('lodash');

module.exports = (config) => ({
    loadFieldsEpic: (action$) =>
        action$.ofType(LOAD_FIELDS)
            .switchMap((action) => {
                if (action.layer.thematic && action.layer.thematic.fields) {
                    return Rx.Observable.of(fieldsLoaded(action.layer, action.layer.thematic.fields)).delay(0);
                }
                const url = config.getFieldsService(action.layer);
                return Rx.Observable.defer(() => axios.get(url))
                    .switchMap((response) => Rx.Observable.of(fieldsLoaded(action.layer, config.readFields(response.data))))
                    .catch(e => Rx.Observable.of(fieldsError(action.layer, e)));
            }),
    loadClassificationEpic: (action$) =>
        action$.ofType(LOAD_CLASSIFICATION)
            .switchMap((action) => {
                const url = config.getStyleMetadataService(action.layer, action.params);
                return Rx.Observable.defer(() => axios.get(url))
                    .switchMap((response) => Rx.Observable.of(classificationLoaded(action.layer, config.readClassification(response.data))))
                    .catch(e => Rx.Observable.of(classificationError(action.layer, e)));
            }),
    removeThematicEpic: (action$, store) =>
        action$.ofType(UPDATE_NODE)
            .switchMap((action) => {
                const layer = head(store.getState().layers.flat.filter(l => l.id === action.node));
                if (layer && action.options.thematic === null && config.hasThematicStyle(layer)) {
                    const newParams = config.removeThematicStyle(layer.params);
                    return Rx.Observable.of(changeLayerParams(action.node, newParams));
                }
                return Rx.Observable.empty();
            })
});
