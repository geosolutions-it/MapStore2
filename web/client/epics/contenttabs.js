/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {keys, findIndex, difference} = require('lodash');
const {MAPS_LOAD_MAP, MAPS_LIST_LOADED} = require("../actions/maps");
const {
    DASHBOARDS_LIST_LOADED
} = require('../actions/dashboards');
const {GEOSTORIES_LIST_LOADED} = require('../actions/geostories');
const {onTabSelected, SET_TABS_HIDDEN} = require("../actions/contenttabs");
/**
* Update Maps, Dashboards and Geostories counts to select contenttabs each tab has to have a key in its ContentTab configuration
* @param {object} action
*/
const updateMapsDashboardTabs = (action$, {getState = () => {}}) =>
    action$.ofType(MAPS_LOAD_MAP)
        .switchMap(() => {
            return Rx.Observable.forkJoin(action$.ofType(MAPS_LIST_LOADED).take(1), action$.ofType(DASHBOARDS_LIST_LOADED).take(1), action$.ofType(GEOSTORIES_LIST_LOADED).take(1))
                .switchMap((r) => {
                    const results = {maps: r[0].maps, dashboards: r[1], geostories: r[2]};
                    const {contenttabs = {}} = getState() || {};
                    const {selected, hiddenTabs = {}} = contenttabs;
                    if (results[selected] && results[selected].totalCount === 0) {
                        const id = keys(results).filter(key => (results[key] || {}).totalCount > 0 && !hiddenTabs[key])[0];
                        if (id) {
                            return Rx.Observable.of(onTabSelected(id));
                        }
                    }
                    return Rx.Observable.empty();
                });
        });

const updateSelectedOnHiddenTabs = (action$, store) =>
    action$.ofType(SET_TABS_HIDDEN)
        .switchMap(() => {
            const state = store.getState();
            const {selected, hiddenTabs = {}} = state.contenttabs;

            const hiddenKeys = keys(hiddenTabs).filter(key => !!hiddenTabs[key]);

            return findIndex(hiddenKeys, key => key === selected) > -1 ?
                Rx.Observable.of(onTabSelected(difference(['dashboards', 'geostories', 'maps'], hiddenKeys)[0])) :
                Rx.Observable.empty();
        });

module.exports = {updateMapsDashboardTabs, updateSelectedOnHiddenTabs};
