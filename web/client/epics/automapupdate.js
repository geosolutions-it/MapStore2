/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';

import { refreshLayers, LAYERS_REFRESHED, LAYERS_REFRESH_ERROR } from '../actions/layers';
import { MAP_CONFIG_LOADED, MAP_INFO_LOADED } from '../actions/config';
import { warning, success } from '../actions/notifications';
import { toggleControl } from '../actions/controls';
import { updateVersion } from '../actions/map';
import { mapVersionSelector } from '../selectors/map';
import { mapUpdateOptions } from '../selectors/automapupdate';

/**
 * When map has been loaded, it sends a notification if the version is less than 2 and users has write permission.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED` and `MAP_INFO_LOADED`.
 * @memberof epics.automapupdate
 * @return {external:Observable}
 */

export const manageAutoMapUpdate = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((mapConfigLoaded) =>
            action$.ofType(MAP_INFO_LOADED)
                .take(1)
                .switchMap((mapInfoLoaded) => {
                    const version = mapVersionSelector(store.getState());
                    const canEdit = mapInfoLoaded.info && mapInfoLoaded.info.canEdit || false;
                    let layers = mapConfigLoaded.config && mapConfigLoaded.config.map && mapConfigLoaded.config.map.layers && mapConfigLoaded.config.map.layers.filter((l) => l.type === 'wms' && l.group !== 'background') || [];
                    const options = mapUpdateOptions(store.getState());
                    return version < 2 && canEdit ?
                        Rx.Observable.of(warning({
                            title: "notification.warning",
                            message: "notification.updateOldMap",
                            action: {
                                label: "notification.update",
                                dispatch: refreshLayers(layers, options)
                            },
                            autoDismiss: 12,
                            position: "tc"
                        })).concat(
                            action$.ofType(LAYERS_REFRESHED, LAYERS_REFRESH_ERROR)
                                .bufferCount(layers.length)
                                .switchMap((refreshed) => {
                                    const errors = refreshed.filter((l) => l.type === LAYERS_REFRESH_ERROR);
                                    const notification = errors.length > 0 ?
                                        warning({
                                            title: "notification.warning",
                                            message: "notification.warningSaveUpdatedMap",
                                            autoDismiss: 6,
                                            position: "tc"
                                        })
                                        :
                                        success({
                                            title: "notification.success",
                                            message: "notification.saveUpdatedMap",
                                            autoDismiss: 6,
                                            position: "tc"
                                        });
                                    return Rx.Observable.of(notification, toggleControl('save'), updateVersion(2));
                                }))
                        : Rx.Observable.empty();
                }));

/**
 * Epics for update old map
 * @name epics.automapupdate
 * @type {Object}
 */

export default {
    manageAutoMapUpdate
};
