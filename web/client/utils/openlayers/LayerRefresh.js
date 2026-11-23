/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Source event tracking and buffered refreshes for OpenLayers vector layers.
 * @memberof utils
 * @static
 * @name OpenLayersLayerRefresh
 */

const pendingRefreshes = new WeakMap();

/**
 * Track loading and errors on the current source and rebind when the layer's source changes.
 * Detaching a source with outstanding loads calls onLoad(false) to clear its loading state.
 * @function bindVectorSourceEvents
 * @param {ol.layer.Vector} layer Layer whose source events should be tracked.
 * @param {object} callbacks Loading status callbacks.
 * @param {function} callbacks.onLoading Called without arguments when the first feature load starts.
 * @param {function} callbacks.onLoad Called with a failure boolean when loads finish or vectorerror fires.
 * @param {boolean} [trackFeatures=true] Track featuresloadstart/end/error events in addition to vectorerror.
 * Set to false for client-side vector sources that do not emit matching load completion events.
 * @returns {function} Cleanup callback that removes layer and source listeners and clears pending loading state.
 * Call it when the layer is replaced or its component unmounts.
 * @memberof utils.OpenLayersLayerRefresh
 */
export const bindVectorSourceEvents = (layer, { onLoading, onLoad }, trackFeatures = true) => {
    let unbindSource = () => {};
    /**
     * Move loading/error listeners from the previous source to the layer's current source.
     * @returns {void}
     */
    const bindSource = () => {
        unbindSource();
        const source = layer.getSource();
        let loading = 0;
        if (!source) return;
        /**
         * Report a source-level vector loading error.
         * @returns {*} Return value of the onLoad callback.
         */
        const error = () => onLoad(true);
        /**
         * Count a feature request and report the transition to loading.
         * @returns {void}
         */
        const start = () => { if (loading++ === 0) onLoading(); };
        /**
         * Complete a feature request and report when no requests remain.
         * @param {boolean} failed Whether this request failed.
         * @returns {void}
         */
        const end = failed => {
            loading = Math.max(0, loading - 1);
            if (!loading) onLoad(failed);
        };
        /**
         * Handle a successful feature load.
         * @returns {void}
         */
        const loaded = () => end(false);
        /**
         * Handle a failed feature load.
         * @returns {void}
         */
        const failed = () => end(true);
        source.on('vectorerror', error);
        if (trackFeatures) {
            source.on('featuresloadstart', start);
            source.on('featuresloadend', loaded);
            source.on('featuresloaderror', failed);
        }
        unbindSource = () => {
            source.un('vectorerror', error);
            source.un('featuresloadstart', start);
            source.un('featuresloadend', loaded);
            source.un('featuresloaderror', failed);
            if (loading) onLoad(false);
            loading = 0;
        };
    };
    bindSource();
    layer.on('change:source', bindSource);
    return () => {
        layer.un('change:source', bindSource);
        unbindSource();
    };
};

/**
 * Detach a pending replacement source's refresh listeners and forget its pending refresh.
 * In-flight requests are not aborted; their results can no longer replace the displayed source.
 * @function cancelVectorLayerRefresh
 * @param {ol.layer.Vector} layer Layer whose pending refresh should be cancelled.
 * @returns {void}
 * @memberof utils.OpenLayersLayerRefresh
 */
export const cancelVectorLayerRefresh = layer => {
    const pending = pendingRefreshes.get(layer);
    pending?.cleanup();
    pendingRefreshes.delete(layer);
};

/**
 * Load a replacement vector source for the current map extent while retaining displayed features.
 * The source's loading strategy may request several extents. The replacement is installed only
 * after all loads finish successfully and the layer is still visible. Failed, cancelled or
 * superseded refreshes leave the displayed source unchanged.
 * @function refreshVectorLayer
 * @param {ol.layer.Vector} layer Existing layer with loaded features.
 * @param {function} createLayer Factory returning a replacement layer with a fresh vector source.
 * The source loader must emit featuresloadstart/end/error events.
 * @param {ol.Map} map Map providing the extent, resolution and projection for loading the replacement.
 * @param {function} [onReady] Called without arguments after the replacement source is installed.
 * @returns {boolean} True when replacement loading was started; false when the layer has no
 * loaded features or the map is unavailable, so the caller should use its normal reload path.
 * @memberof utils.OpenLayersLayerRefresh
 */
export const refreshVectorLayer = (layer, createLayer, map, onReady = () => {}) => {
    cancelVectorLayerRefresh(layer);
    if (!layer.getSource()?.getFeatures?.().length || !map?.getView || !map?.getSize) return false;
    const replacement = createLayer();
    const source = replacement.getSource();
    const view = map.getView();
    let loading = 0;
    let failed = false;
    /**
     * Count each extent requested by the replacement source's loading strategy.
     * @returns {void}
     */
    const start = () => { loading++; };
    /**
     * Discard the pending replacement after any extent request fails.
     * @returns {void}
     */
    const error = () => {
        failed = true;
        cancelVectorLayerRefresh(layer);
    };
    /**
     * Complete an extent request and schedule installation after all synchronous requests have started.
     * @returns {void}
     */
    const end = () => {
        loading--;
        // A strategy can start several extent requests synchronously.
        Promise.resolve().then(() => {
            if (!loading && !failed && pendingRefreshes.get(layer)?.source === source) {
                cancelVectorLayerRefresh(layer);
                if (layer.getVisible() !== false) {
                    layer.setSource(source);
                    onReady();
                }
            }
        });
    };
    /**
     * Remove listeners from the replacement source without aborting its requests.
     * @returns {void}
     */
    const cleanup = () => {
        source.un('featuresloadstart', start);
        source.un('featuresloadend', end);
        source.un('featuresloaderror', error);
    };
    pendingRefreshes.set(layer, { source, cleanup });
    source.on('featuresloadstart', start);
    source.on('featuresloadend', end);
    source.on('featuresloaderror', error);
    source.loadFeatures(view.calculateExtent(map.getSize()), view.getResolution(), view.getProjection());
    return true;
};
