/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '../../utils/PluginsUtils';
import { openQueryBuilder } from '../../actions/layerFilter';

// dummy plugin
const FilterLayer = () => null;

const FilterLayerButton = connect(() => ({}), {
    onClick: openQueryBuilder
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    ...props
}) => {
    const ItemComponent = itemComponent;
    const layer = selectedNodes?.[0]?.node;
    if ([statusTypes.LAYER].includes(status) && layer?.search && !layer?.error) {
        return (
            <ItemComponent
                {...props}
                glyph="filter-layer"
                tooltipId={'toc.layerFilterTooltip'}
                onClick={() => onClick()}
            />
        );
    }
    return null;
});

/**
 * Plugin that activate the FilterLayer button in the {@link #plugins.TOC|TOC}.
 * **Requires the {@link #plugins.QueryPanel|QueryPanel} plugin to work**
 * @name FilterLayer
 * @class
 * @memberof plugins
 * @requires plugins.QueryPanel
 */
export default createPlugin('FilterLayer',
    {
        component: FilterLayer,
        containers: {
            TOC: [{
                name: "FilterLayer",
                target: 'toolbar',
                Component: FilterLayerButton,
                position: 6
            }]
        }
    }
);
