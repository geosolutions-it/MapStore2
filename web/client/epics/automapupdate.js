/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const {refreshLayers, LAYERS_REFRESHED, LAYERS_REFRESH_ERROR} = require('../actions/layers');
const {MAP_CONFIG_LOADED, MAP_INFO_LOADED} = require('../actions/config');
const {warning, success} = require('../actions/notifications');
const {toggleControl} = require('../actions/controls');
const {loadMapInfo} = require('../actions/config');
const {LOGIN_SUCCESS} = require('../actions/security');
const {updateVersion} = require('../actions/map');
const ConfigUtils = require('../utils/ConfigUtils');
const {mapIdSelector, mapVersionSelector} = require('../selectors/map');
const { LOCATION_CHANGE } = require('react-router-redux');

/**
 * When map has been loaded, it sends a notification if the version is less than 2 and users has write permission.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED` and `MAP_INFO_LOADED`.
 * @memberof epics.automapupdate
 * @return {external:Observable}
 */

const manageAutoMapUpdate = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((mapConfigLoaded) =>
            action$.ofType(MAP_INFO_LOADED)
                .switchMap((mapInfoLoaded) => {
                    const version = mapVersionSelector(store.getState());
                    const canEdit = mapInfoLoaded.info && mapInfoLoaded.info.canEdit || false;
                    let layers = mapConfigLoaded.config && mapConfigLoaded.config.map && mapConfigLoaded.config.map.layers && mapConfigLoaded.config.map.layers.filter((l) => l.type === 'wms' && l.group !== 'background') || [];
                    const options = {bbox: true, search: true, dimensions: true, title: true, groups: true, availableStyles: true, style: true};
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
                }).takeUntil(action$.ofType(LOCATION_CHANGE)));
/**
 * Reload information of map on LOGIN_SUCCESS.
 * @param {external:Observable} action$ manages `LOGIN_SUCCESS`.
 * @memberof epics.automapupdate
 * @return {external:Observable}
 */
const updateMapInfoOnLogin = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() =>
            action$.ofType(LOGIN_SUCCESS)
                .filter(() => !!mapIdSelector(store.getState()))
                .switchMap(() => {
                    const id = mapIdSelector(store.getState());
                    return Rx.Observable.of(
                        loadMapInfo(ConfigUtils.getConfigProp("geoStoreUrl") + "extjs/resource/" + id, id)
                    );
                }).takeUntil(action$.ofType(LOCATION_CHANGE)));

/**
 * Epics for update old map
 * @name epics.automapupdate
 * @type {Object}
 */

module.exports = {
    manageAutoMapUpdate,
    updateMapInfoOnLogin
};
