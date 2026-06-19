/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';

import { layersSelector } from '../../selectors/layers';
import { isInteractionSupported } from '../../utils/InteractionUtils';
import { widgetBuilderAvailable } from '../../selectors/controls';
import { createWidget } from '../../actions/widgets';
import { isWidgetLayerSupported } from '../../utils/WidgetsUtils';

const hasFilterableLayers = (state) => (layersSelector(state) || []).some(isInteractionSupported);

const WidgetsBuilderButton = connect((state) => ({
    available: widgetBuilderAvailable(state),
    hasLayers: hasFilterableLayers(state)
}), {
    onClick: createWidget
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    available,
    hasLayers,
    ...props
}) => {
    const ItemComponent = itemComponent;

    if (!available) {
        return null;
    }

    // Map-level widget: nothing (or a group) selected, the TOC root toolbar is shown
    if ([statusTypes.DESELECT, statusTypes.GROUP].includes(status) && hasLayers) {
        return (
            <ItemComponent
                {...props}
                glyph="widgets"
                tooltipId="toc.createWidgetForMap"
                onClick={() => onClick({
                    // `globalWidgetMode` makes every builder's layer step list only the
                    // layers currently in the map (single selection) and enables the
                    // editable source-layer field in the filter builder
                    globalWidgetMode: true
                })}
            />
        );
    }

    // Per-layer widget: a single supported layer node is selected.
    const layer = selectedNodes?.[0]?.node;
    if ([statusTypes.LAYER].includes(status) && isWidgetLayerSupported(layer)) {
        return (
            <ItemComponent
                {...props}
                glyph="widgets"
                tooltipId={'toc.createWidget'}
                onClick={() => layer?.error ? onClick({ mapSync: false }) : onClick()} // allows anyway to create a widget, not connected to map
            />
        );
    }
    return null;
});

export default WidgetsBuilderButton;
