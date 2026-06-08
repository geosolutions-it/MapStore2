/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { createWidget } from '../../actions/widgets';
import { widgetBuilderAvailable } from '../../selectors/controls';
import { layersSelector } from '../../selectors/layers';
import { isInteractionSupported } from '../../utils/InteractionUtils';

const hasFilterableLayers = (state) => {
    const layers = layersSelector(state) || [];
    return layers.some(isInteractionSupported);
};

const selector = createStructuredSelector({
    available: widgetBuilderAvailable,
    hasLayers: hasFilterableLayers
});

const FilterWidgetTOCButton = connect(selector, {
    onClick: createWidget
})(({
    onClick,
    status,
    itemComponent,
    statusTypes,
    available,
    hasLayers,
    config = {},
    ...props
}) => {
    const ItemComponent = itemComponent;

    if (config.activateFilterWidgetButton === false) {
        return null;
    }
    if (!available || !hasLayers) {
        return null;
    }
    if (![statusTypes.DESELECT, statusTypes.GROUP].includes(status)) {
        return null;
    }
    return (
        <ItemComponent
            {...props}
            glyph="widgets"
            tooltipId="toc.createWidgetForMap"
            onClick={() => onClick({
                // `globalWidgetMode` makes every builder's layer step list only the
                // layers currently in the map (single selection) and enables the
                // editable source-layer field in the filter builder.
                globalWidgetMode: true
            })}
        />
    );
});

export default FilterWidgetTOCButton;
