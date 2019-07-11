/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const { SET_CONTROL_PROPERTIES } = require('../actions/controls');
const { purgeMapInfoResults, hideMapinfoMarker } = require('../actions/mapInfo');

module.exports = {
    onEpic: (action$, store) =>
    action$.filter((action) => action.type.indexOf('IF:') === 0)
        .switchMap((action) => {
            if (action.condition(store.getState())) {
                return Rx.Observable.of(action.action);
            }
            return Rx.Observable.of(action.elseAction.call());
        }),

    setControlPropertiesEpic: (action$) =>
        action$
            .ofType(SET_CONTROL_PROPERTIES)
            .filter((action) => action.control === "metadataexplorer" && action.properties && action.properties.enabled)
            .switchMap(() => {
                return Rx.Observable.of(purgeMapInfoResults(), hideMapinfoMarker());
            })
};
