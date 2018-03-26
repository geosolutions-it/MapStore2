/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withHandlers} = require('recompose');
const {get} = require('lodash');
const { deepChange, sortLayers: DEFAULT_SORT_LAYERS, splitMapAndLayers, getNode} = require('../../../../../../utils/LayersUtils');
/**
 * add sorting capabilities to TOC.
 * This is a porting logic from layers reducer.  TODO: refactor.
 * NOTES: To understand this algorithm (original from layers reducer + StandardStore re-mappings of state)
 * you should consider that the order of tree is imposed by the layers, because a group can not be empty.
 * So the groups are only a presentation of the TOC.
 * This version doesn't keep in state the ids of nested nodes because is not necessary.
 * requires updateMapEntries callback, that can be added using handleNodePropertyChanges enhancer
 */
module.exports = withHandlers({
    onSort: ({ map = {}, activateSortLayers = true, filterText, sortLayers = DEFAULT_SORT_LAYERS, updateMapEntries = () => {}}) =>
        activateSortLayers && !filterText
        ? (nodeId, order = []) => {
            // get the groups in form {nodes: ["layer1_id", "layer2_id", {id: nestedGroup, nodes: [...]}]}
            const { flat: layers, groups = [] } = get(splitMapAndLayers(map), 'layers') || {};
            // get the list of nodes to change order
            const node = getNode(groups || [], nodeId);
            const nodes = nodeId === 'root' ? groups : node.nodes;
            if (nodes) {
                // modify the groups object to apply sortLayers
                const reorderedGroups = order.map(idx => nodes[idx]);
                const newGroups = nodeId === 'root' ? reorderedGroups :
                    deepChange(groups, nodeId, 'nodes', reorderedGroups);
                // modify layer's order
                const newLayers = sortLayers ? sortLayers(newGroups, layers || []) : layers || [];
                updateMapEntries({
                    layers: newLayers
                });
            }
        }
        : null
});
