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
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {SIZE_CHANGE, CLOSE_FEATURE_GRID, OPEN_FEATURE_GRID} = require('../actions/featuregrid');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {mapInfoRequestsSelector} = require('../selectors/mapinfo');
const {clearLayers} = require('../actions/layers');
const {head, get} = require('lodash');
const {mapLayoutBoundsSelector} = require('../selectors/map');
const {isFeatureGridOpen, getDockSize} = require('../selectors/featuregrid');
/**
 * Epìcs for feature grid
 * @memberof epics
 * @name map
 */

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

/**
 * Gets `MAP_CONFIG_LOADED`, `SIZE_CHANGE`, `CLOSE_FEATURE_GRID`, `OPEN_FEATURE_GRID`, `PURGE_MAPINFO_RESULTS`, `TOGGLE_CONTROL`, `SET_CONTROL_PROPERTY` events.
 * Configures a map layout based on state of panels.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED`, `SIZE_CHANGE`, `CLOSE_FEATURE_GRID`, `OPEN_FEATURE_GRID`, `PURGE_MAPINFO_RESULTS`, `TOGGLE_CONTROL`, `SET_CONTROL_PROPERTY`.
 * @memberof epics.map
 * @return {external:Observable} emitting {@link #actions.map.updateMapLayout} action
 */
const updateMapLayoutBounds = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED, SIZE_CHANGE, CLOSE_FEATURE_GRID, OPEN_FEATURE_GRID, PURGE_MAPINFO_RESULTS, TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .switchMap(() => {

            if (get(store.getState(), "browser.mobile")) {
                return Rx.Observable.empty();
            }

            const mapLayout = {left: {sm: 300, md: 600}, right: {md: 658}, bottom: {sm: 30}};

            if (get(store.getState(), "mode") === 'embedded') {
                const layoutBounds = mapLayoutBoundsSelector(store.getState());
                const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};
                return Rx.Observable.of(updateMapLayout({
                    ...layoutBounds,
                    ...height
                }));
            }

            const layoutBounds = mapLayoutBoundsSelector(store.getState());

            const leftPanels = head([
                get(store.getState(), "controls.queryPanel.enabled") && {left: mapLayout.left.md} || null,
                get(store.getState(), "controls.drawer.enabled") && {left: mapLayout.left.sm} || null
            ].filter(panel => panel)) || {left: 0};

            const rightPanels = head([
                get(store.getState(), "controls.annotations.enabled") && {right: mapLayout.right.md} || null,
                get(store.getState(), "controls.metadataexplorer.enabled") && {right: mapLayout.right.md} || null,
                mapInfoRequestsSelector(store.getState()).length > 0 && {right: mapLayout.right.md} || null
            ].filter(panel => panel)) || {right: 0};

            const footer = isFeatureGridOpen(store.getState()) && {bottom: getDockSize(store.getState()) * 100 + '%'} || {bottom: mapLayout.bottom.sm};

            const transform = isFeatureGridOpen(store.getState()) && {transform: 'translate(0, -' + mapLayout.bottom.sm + 'px)'} || {transform: 'none'};
            const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};

            return Rx.Observable.of(updateMapLayout({
                ...layoutBounds,
                ...leftPanels,
                ...rightPanels,
                ...footer,
                ...transform,
                ...height
            }));
        });

module.exports = {
    handleCreationLayerError,
    handleCreationBackgroundError,
    resetMapOnInit,
    updateMapLayoutBounds
};
