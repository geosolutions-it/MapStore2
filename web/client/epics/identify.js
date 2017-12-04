/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');

const {LOAD_FEATURE_INFO, GET_VECTOR_INFO} = require('../actions/mapInfo');
const {closeFeatureGrid} = require('../actions/featuregrid');

module.exports = {
    closeFeatureGridFromIdentifyEpic: (action$) =>
        action$.ofType(LOAD_FEATURE_INFO, GET_VECTOR_INFO)
        .switchMap(() => {
            return Rx.Observable.of(closeFeatureGrid());
        })
};
