/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');

const {ADD_BACKGROUND, createBackgroundsList} = require('../actions/backgroundselector');
const {setControlProperty} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {allBackgroundLayerSelector} = require('../selectors/layers');

const accessMetadataExplorer = (action$) =>
    action$.ofType(ADD_BACKGROUND)
    .switchMap(() => Rx.Observable.of(setControlProperty('metadataexplorer', 'enabled', true)));

const backgroundsListInit = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
    .switchMap(() => {
        const state = store.getState();
        const backgrounds = allBackgroundLayerSelector(state);
        return Rx.Observable.of(createBackgroundsList(backgrounds));
    });

module.exports = {
    accessMetadataExplorer,
    backgroundsListInit
};
