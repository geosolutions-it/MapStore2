/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {changeLayerProperties} = require('../actions/layers');
const {CREATION_ERROR_LAYER} = require('../actions/map');
const {currentBackgroundLayerSelector, allBackgroundLayerSelector, getLayerFromId} = require('../selectors/layers');
const {setControlProperty} = require('../actions/controls');
const {isSupportedLayer} = require('../utils/LayersUtils');
const {warning} = require('../actions/notifications');
const {head} = require('lodash');

const handleCreationBackgroundError = (action$, store) =>
    action$.ofType(CREATION_ERROR_LAYER)
    .filter(a => a.options.id === currentBackgroundLayerSelector(store.getState()).id && a.options.group === "background")
    .switchMap((a) => {
        const maptype = store.getState().maptype.mapType;
        // consider only the supported backgrounds, removing the layer that generated an error on creation
        const firstSupportedBackgroundLayer = head(allBackgroundLayerSelector(store.getState()).filter(l => {
            return isSupportedLayer(l, maptype) && l.id !== a.options.id;
        }));

        return !!firstSupportedBackgroundLayer ?
        Rx.Observable.from([
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
const handleCreationLayerError = (action$, store) =>
    action$.ofType(CREATION_ERROR_LAYER)
    .switchMap((a) => {
        const maptype = store.getState().maptype.mapType;
        return isSupportedLayer(getLayerFromId(store.getState(), maptype)) ? Rx.Observable.from([
            changeLayerProperties(a.options.id, {invalid: true})
        ]) : Rx.Observable.empty();
    });

module.exports = {
    handleCreationLayerError,
    handleCreationBackgroundError
};
