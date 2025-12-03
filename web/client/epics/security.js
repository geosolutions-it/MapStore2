/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from 'rxjs';
import uniqBy from 'lodash/uniqBy';
import isArray from 'lodash/isArray';
import { DASHBOARD_LOADED } from '../actions/dashboard';
import { SET_CURRENT_STORY } from '../actions/geostory';
import { EDITOR_CHANGE } from '../actions/widgets';
import { UPDATE_ITEM } from '../actions/mediaEditor';
import { currentMediaTypeSelector, selectedItemSelector } from '../selectors/mediaEditor';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { setShowModalStatus, setProtectedServices } from '../actions/security';
import { getCredentials } from '../utils/SecurityUtils';

/**
 * checks if a content is protected in a map
 *
 */
export const checkProtectedContentEpic = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .switchMap((action) => {
            const config = action.config;
            const protectedLayers = config?.map?.layers.map(layer => {
                return {protectedId: layer?.security?.sourceId, url: layer.url};
            }).filter(v => !!v.protectedId);
            const protectedServices = uniqBy(protectedLayers, "protectedId")
                .map(({protectedId, url}) => {
                    return {
                        protectedId,
                        url,
                        ...getCredentials(protectedId)
                    };
                })
                .filter(({ username, password }) => !(username && password));

            // group by similar url
            const uniqueServices = uniqBy(protectedServices, "url");

            if (uniqueServices.length) {
                return Rx.Observable.of(
                    setProtectedServices(uniqueServices),
                    setShowModalStatus(true)
                );
            }
            return Rx.Observable.of(setShowModalStatus(false));
        });

/**
 * checks if a content is protected in a map
 *
 */
export const checkProtectedContentDashboardEpic = (action$) =>
    action$.ofType(DASHBOARD_LOADED)
        .switchMap((action) => {
            const widgets = action.data?.widgets || [];
            const layers = widgets
                .reduce((p, w) => {
                    return p.concat(w?.maps);
                }, [])
                .reduce((pre, c) => {
                    return pre.concat(c?.layers
                        ?.map(layer => {
                            return { protectedId: layer?.security?.sourceId, url: layer.url };
                        })
                        .filter(v => !!v.protectedId));
                }, []).filter(Boolean);

            const protectedServices = uniqBy(layers, "protectedId")
                .map(({ protectedId, url }) => {
                    return {
                        protectedId,
                        url,
                        ...getCredentials(protectedId)
                    };
                })
                .filter(({ username, password }) => !(username && password));

            // group by similar url
            const uniqueServices = uniqBy(protectedServices, "url");

            if (uniqueServices.length) {
                return Rx.Observable.of(
                    setProtectedServices(uniqueServices),
                    setShowModalStatus(true)
                );
            }
            return Rx.Observable.of(setShowModalStatus(false));
        });


export const checkProtectedContentDashboardMapEpic = (action$) =>
    action$.ofType(EDITOR_CHANGE)
        .filter(action => action.key === "maps" && isArray(action.value))
        .switchMap((action) => {
            const maps = action.value || [];
            const layers = maps
                .reduce((pre, c) => {
                    return pre.concat(c.layers
                        ?.map(layer => {
                            return { protectedId: layer?.security?.sourceId, url: layer.url };
                        })
                        .filter(v => !!v.protectedId));
                }, []);

            const protectedServices = uniqBy(layers, "protectedId")
                .map(({ protectedId, url }) => {
                    return {
                        protectedId,
                        url,
                        ...getCredentials(protectedId)
                    };
                })
                .filter(({ username, password }) => !(username && password));

            // group by similar url
            const uniqueServices = uniqBy(protectedServices, "url");

            if (uniqueServices.length) {
                return Rx.Observable.of(
                    setProtectedServices(uniqueServices),
                    setShowModalStatus(true)
                );
            }
            return Rx.Observable.of(setShowModalStatus(false));
        });
export const checkProtectedContentGeostoryMapSelectionEpic = (action$, store) =>
    action$.ofType(UPDATE_ITEM)
        .filter((action) => {
            return currentMediaTypeSelector(store.getState()) === "map" && action.item.type === "map";
        })
        .switchMap(() => {
            const map = selectedItemSelector(store.getState());
            const layers = map?.data?.layers
                ?.map(layer => {
                    return { protectedId: layer?.security?.sourceId, url: layer.url };
                })
                .filter(v => !!v.protectedId);

            const protectedServices = uniqBy(layers, "protectedId")
                .map(({ protectedId, url }) => {
                    return {
                        protectedId,
                        url,
                        ...getCredentials(protectedId)
                    };
                })
                .filter(({ username, password }) => !(username && password));

            // group by similar url
            const uniqueServices = uniqBy(protectedServices, "url");

            if (uniqueServices.length) {
                return Rx.Observable.of(
                    setProtectedServices(uniqueServices),
                    setShowModalStatus(true)
                );
            }
            return Rx.Observable.of(setShowModalStatus(false));
        });
export const checkProtectedContentGeostoryEpic = (action$) =>
    action$.ofType(SET_CURRENT_STORY)
        .switchMap((action) => {
            const resources = action.story?.resources || [];
            const layers = resources?.reduce((p, c) => {
                return p.concat(c?.data?.layers
                    ?.map(layer => {
                        return { protectedId: layer?.security?.sourceId, url: layer.url };
                    })
                    .filter(v => !!v.protectedId)
                );
            }, []);
            const protectedServices = uniqBy(layers, "protectedId")
                .map(({ protectedId, url }) => {
                    return {
                        protectedId,
                        url,
                        ...getCredentials(protectedId)
                    };
                })
                .filter(({ username, password }) => !(username && password));

            // group by similar url
            const uniqueServices = uniqBy(protectedServices, "url");

            if (uniqueServices.length) {
                return Rx.Observable.of(
                    setProtectedServices(uniqueServices),
                    setShowModalStatus(true)
                );
            }
            return Rx.Observable.of(setShowModalStatus(false));
        });

