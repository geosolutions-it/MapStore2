/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const MapUtils = require('../utils/MapUtils');
const {download} = require('../utils/FileUtils');
const {EXPORT_MAP} = require('../actions/mapexport');
const { setControlProperty } = require('../actions/controls');

const { mapSelector } = require('../selectors/map');
const { layersSelector, groupsSelector } = require('../selectors/layers');
const { backgroundListSelector } = require('../selectors/backgroundselector');
const { mapOptionsToSaveSelector } = require('../selectors/mapsave');
const textSearchConfigSelector = state => state.searchconfig && state.searchconfig.textSearchConfig;

const PersistMap = {
    mapstore2: (state) => JSON.stringify(MapUtils.saveMapConfiguration(mapSelector(state), layersSelector(state), groupsSelector(state), backgroundListSelector(state), textSearchConfigSelector(state), mapOptionsToSaveSelector(state)))
};


module.exports = {
    exportMapContext: (action$, {getState = () => {}} = {} ) =>
        action$
            .ofType(EXPORT_MAP)
            .switchMap( ({format}) =>
                Rx.Observable.of(PersistMap[format](getState()))
                    .do((data) => download(data, "map.json", "application/json"))
                    .map(() => setControlProperty('export', 'enabled', false))
            )
};
