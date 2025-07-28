/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';
import { isEmpty } from 'lodash';

import { configureMap, MAP_CONFIG_LOADED, MAP_INFO_LOADED } from '../actions/config';
import { warning } from '../actions/notifications';
import { isUserAllowedSelectorCreator } from '../selectors/security';
import { DASHBOARD_LOADED, dashboardLoaded } from '../actions/dashboard';
import { SET_CURRENT_STORY, setCurrentStory } from '../actions/geostory';
import { forceReRender } from '../actions/map';
import { getConfigProp } from '../utils/ConfigUtils';

import { migrateAllUrls } from '../utils/AutoResourceUpdateUtils';
import { START_UPDATING_RESOURCE } from '../actions/autoResourceUpdate';
/**
 * Epics for update old map
 * @name epics.autoresourceupdate
 * @type {Object}
 */


/**
 * When map has been loaded, it sends a notification if the version is less than 2 and users has write permission.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED` and `MAP_INFO_LOADED`.
 * @memberof epics.autoresourceupdate
 * @return {external:Observable}
 */
export const manageAutoMapUpdateEpic = (action$, store) =>
    action$.ofType(START_UPDATING_RESOURCE)
        .switchMap(() =>
            action$.ofType(MAP_CONFIG_LOADED)
                .mergeMap(({config, mapId, zoomToExtent}) =>
                    action$.ofType(MAP_INFO_LOADED)
                        .take(1)
                        .switchMap(() => {
                            const state = store.getState();
                            const options = getConfigProp('AutoResourceUpdateOptions');
                            const showNotification = options?.showNotificationForRoles?.length && isUserAllowedSelectorCreator({
                                allowedRoles: options.showNotificationForRoles
                            })(state);
                            const newMapConfig = migrateAllUrls(config, options.urlsToReplace);
                            let actions = [];
                            if (showNotification) {
                            // show only for allowed roles, do not show it by default
                                actions.push(warning({
                                    title: "notification.warning",
                                    message: "notification.updateOldResource",
                                    autoDismiss: options.autoDismiss,
                                    position: "tc"
                                }));
                            }
                            actions.push(configureMap(newMapConfig, mapId, zoomToExtent));
                            actions.push(forceReRender());
                            if (isEmpty(options)) {
                                return Rx.Observable.empty();
                            }
                            return Rx.Observable.from(actions);
                        })
                ));

/**
 * When map has been loaded, it sends a notification if the version is less than 2 and users has write permission.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED` and `MAP_INFO_LOADED`.
 * @memberof epics.autoresourceupdate
 * @return {external:Observable}
 */
export const manageAutoDashboardUpdateEpic = (action$, store) =>
    action$.ofType(START_UPDATING_RESOURCE)
        .switchMap(() =>
            action$.ofType(DASHBOARD_LOADED)
                .take(1)
                .switchMap(({resource, data}) => {
                    const state = store.getState();
                    const options = getConfigProp('AutoResourceUpdateOptions');
                    const showNotification = options?.showNotificationForRoles?.length && isUserAllowedSelectorCreator({
                        allowedRoles: options.showNotificationForRoles
                    })(state);

                    const newData = migrateAllUrls(data, options.urlsToReplace);
                    let actions = [];
                    if (showNotification) {
                        // show only for allowed roles, do not show it by default
                        actions.push(warning({
                            title: "notification.warning",
                            message: "notification.updateOldResource",
                            autoDismiss: options.autoDismiss,
                            position: "tc"
                        }));
                    }
                    actions.push(dashboardLoaded(resource, newData));
                    if (isEmpty(options)) {
                        return Rx.Observable.empty();
                    }
                    return Rx.Observable.from(actions);
                })
        );


/**
 * when a story is loaded a check is done and all urls are replaced
 * @param {external:Observable} action$ manages `START_UPDATING_RESOURCE` and `SET_CURRENT_STORY`.
 * @memberof epics.autoresourceupdate
 * @return {external:Observable}
 */
export const manageAutoGeostoryUpdateEpic = (action$, store) =>
    action$.ofType(START_UPDATING_RESOURCE)
        .switchMap(() =>
            action$.ofType(SET_CURRENT_STORY)
                .filter(({story}) => !isEmpty(story))
                .take(1)
                .switchMap(({story}) => {
                    const state = store.getState();
                    const options = getConfigProp('AutoResourceUpdateOptions');
                    const showNotification = options?.showNotificationForRoles?.length && isUserAllowedSelectorCreator({
                        allowedRoles: options.showNotificationForRoles
                    })(state);

                    const newStory = migrateAllUrls(story, options.urlsToReplace);
                    let actions = [];
                    if (showNotification) {
                        // show only for allowed roles, do not show it by default
                        actions.push(warning({
                            title: "notification.warning",
                            message: "notification.updateOldResource",
                            autoDismiss: options.autoDismiss,
                            position: "tc"
                        }));
                    }
                    actions.push(setCurrentStory(newStory));
                    if (isEmpty(options)) {
                        return Rx.Observable.empty();
                    }
                    return Rx.Observable.from(actions);
                })
        );
