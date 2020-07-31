/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const { MAP_CONFIG_LOADED } = require('../actions/config');
const { SET_MAP_TRIGGER } = require('../actions/mapInfo');
const { registerEventListener, unRegisterEventListener } = require('../actions/map');
const { mapTriggerSelector } = require('../selectors/mapInfo');

// Epic to determine which trigger to use when map loads
const setMapTriggerEpic = (action$, store) =>
    action$.ofType(SET_MAP_TRIGGER, MAP_CONFIG_LOADED)
        .switchMap(() => {
            return Rx.Observable.of(
                mapTriggerSelector(store.getState()) === 'hover' ? registerEventListener('mousemove', 'identifyFloatingTool') : unRegisterEventListener('mousemove', 'identifyFloatingTool')
            );
        });

module.exports = {
    setMapTriggerEpic
};
