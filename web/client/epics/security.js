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
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import head from 'lodash/head';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import { v4 as uuidv4 } from 'uuid';
import { DASHBOARD_LOADED } from '../actions/dashboard';
import { SET_CURRENT_STORY } from '../actions/geostory';
import { EDITOR_CHANGE } from '../actions/widgets';
import { UPDATE_ITEM } from '../actions/mediaEditor';
import { currentMediaTypeSelector, selectedItemSelector } from '../selectors/mediaEditor';
import { MAP_CONFIG_LOADED } from '../actions/config';
import {
    setShowModalStatus,
    setProtectedServices,
    loadRequestsRules,
    LOAD_REQUESTS_RULES,
    UPDATE_REQUESTS_RULES
} from '../actions/security';
import {
    getCredentials,
    convertAuthenticationRulesToRequestConfiguration
} from '../utils/SecurityUtils';
import { LOCAL_CONFIG_LOADED } from '../actions/localConfig';
import { layersSelector } from '../selectors/layers';
import { changeLayerProperties } from '../actions/layers';

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

/**
 * Epic to handle loading request configuration rules from config
 */
export const loadRequestsRulesFromConfigEpic = (action$) =>
    action$.ofType(LOCAL_CONFIG_LOADED)
        .switchMap((action) => {
            const config = action.config;
            let rules = config?.requestsConfigurationRules ?? [];
            const legacyRules = config?.authenticationRules ?? [];
            const shouldUseLegacyRules = config?.useAuthenticationRules ?? false;
            if (!isEmpty(legacyRules) && (isEmpty(rules) || shouldUseLegacyRules)) {
                rules = convertAuthenticationRulesToRequestConfiguration(legacyRules);
            }
            return Rx.Observable.of(loadRequestsRules(rules));
        });

/**
 * Helper function to determine which rules have changed
 * Returns an array of URL patterns from rules that have changed
 */
const getChangedRuleUrlPatterns = (oldRules, newRules) => {
    const makeMap = (rules) => new Map(rules.filter(r => r?.urlPattern).map(r => [r.urlPattern, r]));
    const [oldMap, newMap] = [makeMap(oldRules), makeMap(newRules)];
    const changed = new Set([
        ...[...newMap].filter(([p, n]) => !oldMap.has(p) || !isEqual(oldMap.get(p), n)).map(([p]) => p),
        ...[...oldMap].filter(([p]) => !newMap.has(p)).map(([p]) => p)
    ]);
    return [...changed];
};

/**
 * Epic to refresh layers when request configuration rules are updated
 * This ensures that layers re-fetch tiles with the new authentication parameters
 * Only refreshes layers whose URLs match changed rules
 */
export const refreshLayersOnRulesUpdateEpic = (action$, store) =>
    action$.ofType(LOAD_REQUESTS_RULES, UPDATE_REQUESTS_RULES)
        .switchMap((action) => {
            const state = store.getState();
            const newRules = get(action, 'rules', []);
            const oldRules = state.security?.previousRules || [];

            // Get URL patterns of rules that have changed
            const changedPatterns = getChangedRuleUrlPatterns(oldRules, newRules);

            if (isEmpty(changedPatterns)) {
                // No rules changed, no need to refresh
                return Rx.Observable.empty();
            }

            const layers = layersSelector(state) || [];

            // Find layers that should be refreshed based on matching changed rules
            const layersToUpdate = [];
            layers.forEach(layer => {
                const url = head(castArray(layer.url));

                // Check if any layer URL matches any changed rule pattern
                const shouldRefresh = changedPatterns.some(pattern => url?.match(new RegExp(pattern, "i")));
                if (shouldRefresh) layersToUpdate.push(layer);
            });

            // Dispatch changeLayerProperties for each matching layer
            const actions = layersToUpdate.map(layer => {
                const newSecurity = layer.security
                    ? { ...layer.security, refreshHash: uuidv4() }
                    : { refreshHash: uuidv4() };
                return changeLayerProperties(layer.id, { security: newSecurity, visibility: false });
            });

            return actions.length > 0 ? Rx.Observable.from(actions) : Rx.Observable.empty();
        });

