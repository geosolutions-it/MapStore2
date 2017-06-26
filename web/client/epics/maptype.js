/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {changeMapType} = require('../actions/maptype');
const Rx = require('rxjs');
const {get} = require('lodash');
const defaultRegex = /\/(viewer)\/(\w+)\/(\w+)/;
const findMapType = path => path.match(defaultRegex) && path.replace(defaultRegex, "$2");
const { LOCATION_CHANGE } = require('react-router-redux');

/**
 * keep the default mapType in sync when change the URL of the map for viewer
 * @memberof epics.maptype
 * @param  {external:Observable} action$ the stream of actions, acts on `LOCATION_CHANGE`
 * @param  {object} store   the store middleware API from redux `createMiddleware`
 * @return {external:Observable}  the stream of the actions to emit. (`changeMapType`)
 */
const syncMapType = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .filter(action =>
            action.payload
            && action.payload.pathname
            && action.payload.pathname.match(defaultRegex)
            && findMapType(action.payload.pathname) !== get(store.getState(), "maptype.mapType"))
        .switchMap((action) =>
            Rx.Observable.of(changeMapType(findMapType(action.payload.pathname)))
        );
/**
 * Epics for maptype switch functionalities
 * @name epics.maptype
 * @type {Object}
 */
module.exports = {
    syncMapType
};
