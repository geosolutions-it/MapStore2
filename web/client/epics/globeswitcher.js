/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {TOGGLE_3D, updateLast2dMapType} = require('../actions/globeswitcher');

const Rx = require('rxjs');
const {get} = require('lodash');

const defaultRegex = /\/(viewer)\/(\w+)\/(\w+)/;
const { push } = require('react-router-redux');

const replaceMapType = (path, newMapType) => {
    let match = path.match(defaultRegex);
    if (match) {
        return `/viewer/${newMapType}/${match[3]}`;
    }
};
/**
 * Gets every `TOGGLE_3D` event.
 * @memberof epics.globeswitcher
 * @param {external:Observable} action$ manages `TOGGLE_3D`.
 * @return {external:Observable} emitting react-router-redux push action and {@link #actions.globeswitcher.updateLast2dMapType} actions
 */
const updateRouteOn3dSwitch = (action$, store) =>
    action$.ofType(TOGGLE_3D)
        .switchMap( action => {
            const newPath = replaceMapType(action.hash || location.hash, action.enable ? "cesium" : get(store.getState(), "globeswitcher.last2dMapType") || "leaflet");
            if (newPath) {
                return Rx.Observable.from([push(newPath), updateLast2dMapType(action.originalMapType)]);
            }
            Rx.Observable.of(updateLast2dMapType(action.mapType));
        });
/**
 * Epics for 3d switcher functionality
 * @name epics.globeswitcher
 * @type {Object}
 */
module.exports = {
    updateRouteOn3dSwitch
};
