/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const pendingRefreshes = new WeakMap();

/** Follow source replacements without retaining listeners or loading counts on old sources. */
export const bindVectorSourceEvents = (layer, { onLoading, onLoad }, trackFeatures = true) => {
    let unbindSource = () => {};
    const bindSource = () => {
        unbindSource();
        const source = layer.getSource();
        let loading = 0;
        if (!source) return;
        const error = () => onLoad(true);
        const start = () => { if (loading++ === 0) onLoading(); };
        const end = failed => {
            loading = Math.max(0, loading - 1);
            if (!loading) onLoad(failed);
        };
        const loaded = () => end(false);
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

export const cancelVectorLayerRefresh = layer => {
    const pending = pendingRefreshes.get(layer);
    pending?.cleanup();
    pendingRefreshes.delete(layer);
};

/** Keep displayed features until every requested extent of the replacement is ready. */
export const refreshVectorLayer = (layer, createLayer, map, onReady = () => {}) => {
    cancelVectorLayerRefresh(layer);
    if (!layer.getSource()?.getFeatures?.().length || !map?.getView || !map?.getSize) return false;
    const replacement = createLayer();
    const source = replacement.getSource();
    const view = map.getView();
    let loading = 0;
    let failed = false;
    const start = () => { loading++; };
    const error = () => {
        failed = true;
        cancelVectorLayerRefresh(layer);
    };
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
