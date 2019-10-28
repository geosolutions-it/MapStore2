/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import axios from '../libs/ajax';
import {LOAD_MAP_CONFIG, configureMap, configureError} from '../actions/config';

export const loadMapConfigAndConfigureMap = action$ =>
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

