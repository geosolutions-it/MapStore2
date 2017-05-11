/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ATTRIBUTE_UPDATED, loadMaps, thumbnailError
} = require('../actions/maps');

const ConfigUtils = require('../utils/ConfigUtils');
const Rx = require('rxjs');

/**
 * Gets every `ATTRIBUTE_UPDATED` event.
 * Dispatches the reload of the maps after the attributes are updated
 * @param {external:Observable} action$
 * @memberof epics.maps
 * @return {external:Observable}
 */
const mapsEpic = (action$, store) =>
  action$.ofType(ATTRIBUTE_UPDATED)
    .switchMap( () =>
        Rx.Observable.of(loadMaps(false, store.getState().maps.searchText || "*"))
        .catch(e => Rx.Observable.from([thumbnailError(e)]))
);

    /**
     * Actions for maps
     * @name epics.maps
     */
module.exports = {
    mapsEpic
};
