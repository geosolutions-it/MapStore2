/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {findKey} = require('lodash');
const {MAPS_LOAD_MAP, MAPS_LIST_LOADED} = require("../actions/maps");
const {
    DASHBOARDS_LIST_LOADED
} = require('../actions/dashboards');
const {onTabSelected} = require("../actions/contenttabs");
/**
* Update Maps and Dashboards counts to select contenttabs each tab has to have a key in its ContentTab configuration
* @param {object} action
*/
const updateMapsDashboardTabs = (action$, {getState = () => {}}) =>
    action$.ofType(MAPS_LOAD_MAP)
    .switchMap(() => {
        return Rx.Observable.forkJoin(action$.ofType(MAPS_LIST_LOADED).take(1), action$.ofType(DASHBOARDS_LIST_LOADED).take(1))
        .switchMap((r) => {
            const results = {maps: r[0].maps, dashboards: r[1] };
            const {contenttabs = {}} = getState() || {};
            const {selected} = contenttabs;
            if (results[selected] && results[selected].totalCount === 0) {
                const id = findKey(results, ({totalCount}) => totalCount > 0);
                if (id) {
                    return Rx.Observable.of(onTabSelected(id));
                }
            }
            return Rx.Observable.empty();
        });
    });


module.exports = {updateMapsDashboardTabs};
