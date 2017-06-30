/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {changeLayerProperties, resetInvalidLayers} = require('../actions/layers');
const {CREATION_ERROR_LAYER} = require('../actions/map');
const {MAP_TYPE_CHANGED} = require('../actions/maptype');
const {currentBackgroundLayerSelector, allBackgroundLayerSelector} = require('../selectors/layers');
const {setControlProperty} = require('../actions/controls');
const {warning} = require('../actions/notifications');
const {head} = require('lodash');

const handleCreationLayerError = (action$, store) =>
    action$.ofType(CREATION_ERROR_LAYER)
    .filter(a => a.options.id === currentBackgroundLayerSelector(store.getState()).id && a.options.group === "background")
    .switchMap((a) => {
        const Layers = require('../utils/' + store.getState().maptype.mapType + '/Layers');
        // consider only the supported backgrounds, removing the layer that generated an error on creation
        const firstSupportedBackgroundLayer = head(allBackgroundLayerSelector(store.getState()).filter(l => {
            if (l.type === "mapquest" || l.type === "bing" ) {
                return Layers.isSupported(l.type) && l.id !== a.options.id && l.apiKey && l.apiKey !== "__API_KEY_MAPQUEST__";
            }
            return Layers.isSupported(l.type) && l.id !== a.options.id;
        }));

        return !!firstSupportedBackgroundLayer ?
        Rx.Observable.from([
            changeLayerProperties(a.options.id, {invalid: true}),
            changeLayerProperties(firstSupportedBackgroundLayer.id, {visibility: true}),
            setControlProperty('backgroundSelector', 'currentLayer', firstSupportedBackgroundLayer),
            setControlProperty('backgroundSelector', 'tempLayer', firstSupportedBackgroundLayer),
            warning({
                title: "warning",
                message: "notification.backgroundLayerNotSupported",
                action: {
                    label: "close"
                },
                position: "tc"
            })
        ]) : Rx.Observable.of(warning({
            title: "warning",
            message: "notification.noBackgroundLayerSupported",
            action: {
                label: "close"
            },
            position: "tc"
        }));
    });

const resetInvalidLayersEpic = action$ =>
    action$.ofType(MAP_TYPE_CHANGED)
    .switchMap(() => {
        return Rx.Observable.of(resetInvalidLayers());
    });

module.exports = {
    handleCreationLayerError,
    resetInvalidLayersEpic
};
