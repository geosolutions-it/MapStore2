/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {changeLayerProperties} = require('../actions/layers');
const {CREATION_ERROR_LAYER, INIT_MAP, changeMapExtents} = require('../actions/map');
const { configuredMaxExtentSelector, configuredMaxExtentCrsSelector,
        projectionSelector, configuredRestrictedExtentSelector} = require('../selectors/map');
const {currentBackgroundLayerSelector, allBackgroundLayerSelector, getLayerFromId} = require('../selectors/layers');
const {mapTypeSelector} = require('../selectors/maptype');
const {setControlProperty} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {isSupportedLayer} = require('../utils/LayersUtils');
const {warning} = require('../actions/notifications');
const {resetControls} = require('../actions/controls');
const {clearLayers} = require('../actions/layers');
const {head} = require('lodash');
const CoordinatesUtils = require('../utils/CoordinatesUtils');

const handleCreationBackgroundError = (action$, store) =>
    action$.ofType(CREATION_ERROR_LAYER)
    // added delay because the CREATION_ERROR_LAYER needs to be initialized after MAP_CONFIG_LOADED
    .delay(500)
    .filter(a => {
        const currentBackground = currentBackgroundLayerSelector(store.getState());
        return currentBackground && a.options.id === currentBackground.id && a.options.group === "background";
    })
    .switchMap((a) => {
        const maptype = mapTypeSelector(store.getState());
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
    // added delay because the CREATION_ERROR_LAYER needs to be initialized after MAP_CONFIG_LOADED
    .delay(500)
    .switchMap((a) => {
        const maptype = mapTypeSelector(store.getState());
        const layer = getLayerFromId(store.getState(), a.options.id);
        return !!layer && isSupportedLayer(layer, maptype) ? Rx.Observable.from([
            changeLayerProperties(a.options.id, {invalid: true})
        ]) : Rx.Observable.empty();
    });

const resetMapOnInit = (action$) => action$.ofType(INIT_MAP).switchMap(() => Rx.Observable.of(resetControls(), clearLayers()));

const resetExtnentOnInit = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
    .switchMap(() => {
        const confExtent = configuredMaxExtentSelector(store.getState());
        const confExtentCrs = configuredMaxExtentCrsSelector(store.getState());
        const projection = projectionSelector(store.getState());
        const restrictedExtent = configuredRestrictedExtentSelector(store.getState());
        const reprojectionIsValid = confExtent && confExtentCrs && projection && projection !== confExtentCrs;
        const extent = reprojectionIsValid ? CoordinatesUtils.reprojectBbox(confExtent, confExtentCrs, projection) : confExtent;
        return Rx.Observable.of(changeMapExtents(extent, restrictedExtent));

    });


module.exports = {
    handleCreationLayerError,
    handleCreationBackgroundError,
    resetMapOnInit,
    resetExtnentOnInit
};
