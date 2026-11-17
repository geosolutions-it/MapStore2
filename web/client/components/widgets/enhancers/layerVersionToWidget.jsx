/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, memo } from 'react';

const withLiveVersion = (layer, autoRefreshLayers) => {
    const live = layer?.id && autoRefreshLayers.find(({ id }) => id === layer.id);
    return live && live._v_ !== layer._v_ ? { ...layer, _v_: live._v_ } : layer;
};

/**
 * Copies the current `_v_` of the `autoRefreshLayers` prop (layers with an auto refresh interval, from the map state)
 * into the widget's `layer` (table, counter) and `traces[].layer` (chart),
 * so changes made by `refreshLayerVersion` are visible to the data fetching enhancers.
 */
const layerVersionToWidget = (Component) => {
    function LayerVersionToWidget({ layer, traces, autoRefreshLayers, ...props }) {
        const liveLayers = autoRefreshLayers || [];
        const versionedLayer = useMemo(
            () => layer && withLiveVersion(layer, liveLayers),
            [layer, autoRefreshLayers]
        );
        const versionedTraces = useMemo(
            () => traces?.map((trace) => ({ ...trace, layer: withLiveVersion(trace.layer, liveLayers) })),
            [traces, autoRefreshLayers]
        );
        return (
            <Component
                {...props}
                autoRefreshLayers={autoRefreshLayers}
                {...(layer ? { layer: versionedLayer } : {})}
                {...(traces ? { traces: versionedTraces } : {})}
            />
        );
    }
    // memo is needed to use hooks in a chain of recompose enhancers
    return memo(LayerVersionToWidget);
};

export default layerVersionToWidget;
