/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { flattenArrayOfObjects, NodeTypes, isInsideResolutionsLimits } from '../../../utils/LayersUtils';

export const keepLayer = layer => (layer.group !== 'background' && ['wms', 'arcgis'].includes(layer.type));

export const isLegendLayerVisible = (node, resolution) => {
    return node.visibility !== false && !node.legendEmpty && isInsideResolutionsLimits(node, resolution);
};

export const isLegendGroupVisible = (node, resolution) => {
    const flattenChildren = flattenArrayOfObjects(node.nodes);
    const flattenLayers = flattenChildren.filter(child => !child.nodes);
    const childrenLayersVisible = flattenLayers.some(child => isLegendLayerVisible(child, resolution));
    return node.visibility !== false && flattenLayers.length > 0 && childrenLayersVisible;
};

export const getNodeStyle = (node, nodeType, resolution) => {
    const visible = nodeType === NodeTypes.GROUP
        ? isLegendGroupVisible(node, resolution)
        : isLegendLayerVisible(node, resolution);
    return visible ? { } : { display: 'none' };
};
