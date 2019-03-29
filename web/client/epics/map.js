/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Rx = require('rxjs');
const {changeLayerProperties} = require('../actions/layers');
const { mapPaddingSelector } = require('../selectors/maplayout');

const {
    CREATION_ERROR_LAYER,
    INIT_MAP,
    ZOOM_TO_EXTENT,
    changeMapView
} = require('../actions/map');
const {mapSelector} = require('../selectors/map');

const {currentBackgroundLayerSelector, allBackgroundLayerSelector, getLayerFromId} = require('../selectors/layers');
const {mapTypeSelector} = require('../selectors/maptype');
const {setControlProperty} = require('../actions/controls');
const {isSupportedLayer} = require('../utils/LayersUtils');
const MapUtils = require('../utils/MapUtils');
const CoordinatesUtils = require('../utils/CoordinatesUtils');

const {warning} = require('../actions/notifications');
const {resetControls} = require('../actions/controls');
const {clearLayers} = require('../actions/layers');
const {removeAllAdditionalLayers} = require('../actions/additionallayers');
const { head, isArray } = require('lodash');


const legacyZoomToExtent = (action, state) => {
    let zoom = 0;
    let extent = [];
    // TODO: move out of here
    if (isArray(action.extent)) {
        extent = action.extent.map((val) => {
            // MapUtils.getCenterForExtent returns an array of strings sometimes (catalog)
            if (typeof val === 'string' || val instanceof String) {
                return Number(val);
            }
            return val;
        });
    } else {
        extent = Object.keys(action.extent).map(v => {
            if (typeof action.extent[v] === 'string' || action.extent[v] instanceof String) {
                return Number(action.extent[v]);
            }
            return action.extent[v];
        });
    }
    let bounds = CoordinatesUtils.reprojectBbox(extent, action.crs, state.bbox && state.bbox.crs || "EPSG:4326");
    if (bounds) {
        // center by the max. extent defined in the map's config
        let center = CoordinatesUtils.reproject(MapUtils.getCenterForExtent(extent, action.crs), action.crs, 'EPSG:4326');
        // workaround to get zoom 0 for -180 -90... - TODO do it better
        let full = action.crs === "EPSG:4326" && extent && extent[0] <= -180 && extent[1] <= -90 && extent[2] >= 180 && extent[3] >= 90;
        if (full) {
            zoom = 1;
        } else {
            let mapBBounds = CoordinatesUtils.reprojectBbox(extent, action.crs, state.projection || "EPSG:4326");
            // NOTE: STATE should contain size !!!
            zoom = MapUtils.getZoomForExtent(mapBBounds, state.size, 0, 21, null);
        }
        if (action.maxZoom && zoom > action.maxZoom) {
            zoom = action.maxZoom;
        }
        let newBounds = { minx: bounds[0], miny: bounds[1], maxx: bounds[2], maxy: bounds[3] };
        let newBbox = { ...state.bbox, bounds: newBounds };
        return Rx.Observable.of(changeMapView(
            center,
            zoom,
            newBbox,
            state.size,
            action.mapStateSource,
            state.projection,
            state.viewerOptions
        ));
    }
    Rx.Observable.empty();

};

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
    action$.ofType(INIT_MAP).switchMap(() => Rx.Observable.of(removeAllAdditionalLayers(), resetControls(), clearLayers()));


const zoomToExtentEpic = (action$, {getState = () => {} }) =>
    action$.ofType(ZOOM_TO_EXTENT).switchMap((action ) => {
        const hook = MapUtils.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
        const padding = mapPaddingSelector(getState());
        if (hook) {
            // TODO: manage crs
            const { extent, crs, maxZoom } = action;
            hook(extent, {
                crs,
                padding,
                maxZoom
            });
            return Rx.Observable.empty();
        }
        return legacyZoomToExtent(action, mapSelector(getState()) );
    });
module.exports = {
    handleCreationLayerError,
    handleCreationBackgroundError,
    resetMapOnInit,
    zoomToExtentEpic
};
