/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// handle selection
const { withProps, compose, withStateHandlers } = require('recompose');
const {findIndex} = require('lodash');
const getGroupLayerIds = (id, map) =>
    (map.layers || [])
        .filter(({ group = "Default" } = {}) => group === id)
        .map(({ id: lid } = {}) => lid);
/**
 * Allows management of node selection in localState. Useful to use TOC.
 * Requires a `map` prop with groups and layers. Each layer must have an id property
 * passes to wrapped component :
 *  - onNodeSelect : handler to call to select a node. example: `onNodeSelected(nodeId, 'layers', false);` nodeType should be one of 'layers' or 'groups'
 *  - selectedNodes: array of id of the selected nodes
 *  - selectedLayers, selectedGroups: same as selectedNodes, but only with selected groups or layers ids
 */
module.exports = compose(
    withStateHandlers(
        () => ({ selectedLayers: [], selectedGroups: [] }),
        {
            onNodeSelect: ({ selectedLayers = [], selectedGroups = [] }, { map = {} }) => (id, nodeType, ctrlKey) => ({
                selectedLayers: nodeType === "group"
                    ? findIndex(selectedGroups, item => item === id) >= 0
                        // remove all layers
                        ? selectedLayers.filter(item => findIndex(getGroupLayerIds(id, map), lid => lid === item) < 0)
                        // add all layers
                        : ctrlKey
                            ? [...selectedLayers, ...getGroupLayerIds(id, map)]
                            : [...getGroupLayerIds(id, map)]
                    // layer selection
                    : findIndex(selectedLayers, item => item === id) >= 0
                        // remove
                        ? selectedLayers.filter(i => i !== id)
                        : ctrlKey
                            ? [...selectedLayers, id]
                            : [id],
                selectedGroups: nodeType === "group"
                    ? findIndex(selectedGroups, item => item === id) >= 0
                        // remove group
                        ? selectedGroups.filter(g => g !== id)
                        // add group
                        : ctrlKey
                            ? [...selectedGroups, id]
                            : [id]
                    : ctrlKey
                        ? selectedGroups
                        : []
            })
        }
    ),
    withProps(({ selectedLayers, selectedGroups }) => ({
        selectedNodes: [...selectedLayers, ...selectedGroups]
    }))
);
