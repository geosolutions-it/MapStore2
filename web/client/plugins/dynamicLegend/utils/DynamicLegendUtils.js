/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { flattenArrayOfObjects, NodeTypes, isInsideResolutionsLimits } from '../../../utils/LayersUtils';

/**
 * Determines if a layer should be included in the dynamic legend.
 *
 * @param {Object} layer - The layer object.
 * @returns {boolean} True if layer is not a background layer and is of type 'wms' or 'arcgis'.
 */
export const keepLayer = layer => (layer.group !== 'background' && ['wms', 'arcgis'].includes(layer.type));

/**
 * Determines if a legend should be displayed for a layer based on resolution and visibility.
 *
 * @param {Object} node - The layer node.
 * @param {number} resolution - Current map resolution.
 * @returns {boolean} True if the legend is visible.
 */
export const isLegendLayerVisible = (node, resolution) => {
    return node.visibility !== false && !node.legendEmpty && isInsideResolutionsLimits(node, resolution);
};

/**
 * Determines if a group legend should be shown based on visible child layers.
 *
 * @param {Object} node - The group node.
 * @param {number} resolution - Current map resolution.
 * @returns {boolean} True if any child layers are visible and applicable.
 */
export const isLegendGroupVisible = (node, resolution) => {
    const flattenChildren = flattenArrayOfObjects(node.nodes);
    const flattenLayers = flattenChildren.filter(child => !child.nodes);
    const childrenLayersVisible = flattenLayers.some(child => isLegendLayerVisible(child, resolution));
    return node.visibility !== false && flattenLayers.length > 0 && childrenLayersVisible;
};

/**
 * Gets a style object based on node visibility and resolution.
 *
 * @param {Object} node - Node to evaluate.
 * @param {string} nodeType - Node type ('group' or 'layer').
 * @param {number} resolution - Current map resolution.
 * @returns {Object} CSS style object ({ display: 'none' } if not visible).
 */
export const getNodeStyle = (node, nodeType, resolution) => {
    const visible = nodeType === NodeTypes.GROUP
        ? isLegendGroupVisible(node, resolution)
        : isLegendLayerVisible(node, resolution);
    return visible ? { } : { display: 'none' };
};
