/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {changeLayerProperties} = require('../actions/layers');
const {CREATION_ERROR_LAYER, INIT_MAP, updateMapLayout} = require('../actions/map');
const {currentBackgroundLayerSelector, allBackgroundLayerSelector, getLayerFromId} = require('../selectors/layers');
const {mapTypeSelector} = require('../selectors/maptype');
const {setControlProperty} = require('../actions/controls');
const {isSupportedLayer} = require('../utils/LayersUtils');
const {warning} = require('../actions/notifications');
const {resetControls, TOGGLE_CONTROL, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {clearLayers} = require('../actions/layers');
const {head, get} = require('lodash');
const {mapLayoutBoundsSelector} = require('../selectors/map');
const {isFeatureGridOpen, getDockSize} = require('../selectors/featuregrid');

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

const resetMapOnInit = action$ =>
    action$.ofType(INIT_MAP).switchMap(() => Rx.Observable.of(resetControls(), clearLayers()));

const updateMapLayoutBounds = (action$, store) =>
    action$.ofType("MAP_CONFIG_LOADED", "FEATUREGRID:SIZE_CHANGE", "FEATUREGRID:CLOSE_GRID", "FEATUREGRID:OPEN_GRID", "PURGE_MAPINFO_RESULTS", TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .switchMap(() => {

            const layoutBounds = mapLayoutBoundsSelector(store.getState());

            const leftPanels = head([
                get(store.getState(), "controls.queryPanel.enabled") && {left: 600} || null,
                get(store.getState(), "controls.drawer.enabled") && {left: 300} || null
            ].filter(panel => panel)) || {left: 0};

            const rightPanels = head([
                get(store.getState(), "controls.annotations.enabled") && {right: 658} || null,
                get(store.getState(), "controls.metadataexplorer.enabled") && {right: 658} || null,
                get(store.getState(), "mapInfo.requests") && store.getState().mapInfo.requests.length > 0 && {right: 658} || null
            ].filter(panel => panel)) || {right: 0};

            const footer = isFeatureGridOpen(store.getState()) && {bottom: getDockSize(store.getState()) * 100 + '%'} || {bottom: 30};

            const newBounds = {
                ...layoutBounds,
                ...leftPanels,
                ...rightPanels,
                ...footer
            };

            return Rx.Observable.of(updateMapLayout(newBounds));
        });

module.exports = {
    handleCreationLayerError,
    handleCreationBackgroundError,
    resetMapOnInit,
    updateMapLayoutBounds
};
