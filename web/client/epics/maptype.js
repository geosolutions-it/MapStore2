/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { changeMapType } from '../actions/maptype';

import Rx from 'rxjs';
const defaultRegex = /\/(viewer)\/(\w+)\/(\w+)/;
const findMapType = path => {
    const match = path.match(defaultRegex);
    return match && match[0] && match[0].replace(defaultRegex, '$2');
};
import { LOCATION_CHANGE } from 'connected-react-router';
import { last2dMapTypeSelector } from './../selectors/globeswitcher';
import { mapTypeSelector } from './../selectors/maptype';


/**
 * restore mapType to last mapType for a 2d mode when the URL is changed
 * @memberof epics.maptype
 * @param  {external:Observable} action$ the stream of actions, acts on `LOCATION_CHANGE`
 * @param  {object} store   the store middleware API from redux `createMiddleware`
 * @return {external:Observable}  the stream of the actions to emit. (`changeMapType`)
 */
export const syncMapType = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap((action) => {
            const pathname = action?.payload?.location?.pathname;
            const newMapType = findMapType(pathname);
            const currentMapType = mapTypeSelector(store.getState());
            if (pathname.match(defaultRegex) && newMapType !== currentMapType) {
                // this happen while mapType is changed inside viewer
                return Rx.Observable.of(changeMapType(newMapType));
            }
            const last2dMapType = last2dMapTypeSelector(store.getState());
            return currentMapType !== last2dMapType ? Rx.Observable.of(changeMapType(last2dMapType)) : Rx.Observable.empty();

        });

/**
 * Epics for maptype switch functionalities
 * @name epics.maptype
 * @type {Object}
 */
export default {
    syncMapType
};
