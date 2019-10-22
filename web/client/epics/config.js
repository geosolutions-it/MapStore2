/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const axios = require('../libs/ajax');
const {LOAD_MAP_CONFIG, configureMap, configureError} = require('../actions/config');

const loadMapConfigAndConfigureMap = action$ =>
    action$.ofType(LOAD_MAP_CONFIG)
        .switchMap( ({configName, mapId}) =>
            Rx.Observable.defer( () => axios.get(configName) )
                .map(response => {
                    if (typeof response.data === 'object') {
                        return configureMap(response.data, mapId);
                    }
                    try {
                        const data = JSON.parse(response.data);
                        return configureMap(data, mapId);
                    } catch (e) {
                        return configureError('Configuration file broken (' + configName + '): ' + e.message, mapId);
                    }

                })
                .catch((e) => Rx.Observable.of(configureError(e, mapId)))
        );


module.exports = {
    loadMapConfigAndConfigureMap
};
