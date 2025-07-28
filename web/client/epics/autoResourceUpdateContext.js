/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';
import {isEmpty} from 'lodash';

import { configureMap, LOAD_MAP_CONFIG, MAP_CONFIG_LOADED } from '../actions/config';
import { warning } from '../actions/notifications';
import { LOAD_CONTEXT } from '../actions/context';
import { isUserAllowedSelectorCreator } from '../selectors/security';
import { forceReRender } from '../actions/map';
import { getConfigProp } from '../utils/ConfigUtils';

import { migrateAllUrls } from '../utils/AutoResourceUpdateUtils';

/**
 * When map has been loaded, it sends a notification if the version is less than 2 and users has write permission.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED` and `MAP_INFO_LOADED`.
 * @memberof epics.autoresourceupdate
 * @return {external:Observable}
 */
export const manageAutoContextUpdateEpic = (action$, store) =>
    action$.ofType(LOAD_CONTEXT)
        .switchMap(() =>
            action$.ofType(LOAD_MAP_CONFIG)
                .switchMap(() =>
                    action$.ofType(MAP_CONFIG_LOADED)
                        .take(1)
                        .switchMap(({config, mapId, zoomToExtent}) => {
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
                )
        );
