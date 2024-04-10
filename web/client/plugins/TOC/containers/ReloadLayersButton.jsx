/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import {
    changeLayerProperties,
    refreshLayerVersion
} from '../../../actions/layers';

/**
 * This component provides the reload layer node with errors actions to make them available inside the toolbar or context menu
 */
const ReloadLayersButton = connect(() => ({}), {
    onShow: changeLayerProperties,
    onReload: refreshLayerVersion
})(({
    onShow,
    onReload,
    status,
    itemComponent,
    selectedNodes,
    statusTypes,
    ...props
}) => {

    const reload = (layers) => {
        layers.forEach((layer) => {
            onShow(layer.id, { visibility: true });
            onReload(layer.id);
        });
    };
    const ItemComponent = itemComponent;
    if ([statusTypes.LAYER, statusTypes.LAYERS].includes(status)) {
        const nodesWithError = selectedNodes.filter(selected => selected?.node?.loadingError === 'Error');
        if (!nodesWithError?.length) {
            return null;
        }
        const isLoading = nodesWithError.some((selected) => !!selected?.node?.loading);
        return (
            <ItemComponent
                {...props}
                glyph="refresh"
                disabled={isLoading}
                labelId={nodesWithError.length > 1 ? 'toc.toolReloadLayersTooltip' : 'toc.toolReloadLayerTooltip'}
                tooltipId={nodesWithError.length > 1 ? 'toc.toolReloadLayersTooltip' : 'toc.toolReloadLayerTooltip'}
                onClick={() => reload(nodesWithError.map(selected => selected.node))}
            />
        );
    }
    return null;
});

export default ReloadLayersButton;

