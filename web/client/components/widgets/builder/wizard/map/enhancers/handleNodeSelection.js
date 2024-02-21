/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// handle selection

import { compose, withProps, withStateHandlers } from 'recompose';
import { getSelectedNodes } from '../../../../../../utils/LayersUtils';

/**
 * Allows management of node selection in localState. Useful to use TOC.
 * Requires a `map` prop with groups and layers. Each layer must have an id property
 * passes to wrapped component :
 *  - onNodeSelect : handler to call to select a node. example: `onNodeSelected(nodeId, 'layers', false);` nodeType should be one of 'layers' or 'groups'
 *  - selectedNodes: array of id of the selected nodes
 *  - selectedLayers, selectedGroups: same as selectedNodes, but only with selected groups or layers ids
 */
export default compose(
    withStateHandlers(
        () => ({ selectedLayers: [], selectedGroups: [] }),
        {
            onNodeSelect: ({ selectedLayers = [], selectedGroups = [] }) => (id, nodeType, ctrlKey) => {
                const selectedNodes = getSelectedNodes([...selectedLayers, ...selectedGroups], id, ctrlKey);
                const selectedLayersIds = nodeType === 'layer' ? [...selectedLayers, id] : selectedLayers;
                const selectedGroupsId = nodeType === 'group' ? [...selectedGroups, id] : selectedGroups;
                return {
                    selectedLayers: selectedNodes.filter((selectedId) => selectedLayersIds.includes(selectedId)),
                    selectedGroups: selectedNodes.filter((selectedId) => selectedGroupsId.includes(selectedId))
                };
            }
        }
    ),
    withProps(({ selectedLayers, selectedGroups }) => ({
        selectedNodes: [...selectedLayers, ...selectedGroups]
    }))
);
