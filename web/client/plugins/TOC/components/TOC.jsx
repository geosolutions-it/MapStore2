/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import LayersTree from './LayersTree';
import {
    NodeTypes,
    denormalizeGroups,
    splitMapAndLayers,
    sortGroups,
    changeNodeConfiguration
} from '../../../utils/LayersUtils';
import { selectedNodesIdsToObject } from '../utils/TOCUtils';
import {
    saveMapConfiguration
} from '../../../utils/MapUtils';

/**
 * Controlled TOC component that supports map configuration
 * @prop {object} tree nodes tree
 * @prop {object} contextMenu context menu payload
 * @prop {function} onSort return the sorted node information
 * @prop {function} onChange return the changes of a specific node
 * @prop {function} onContextMenu return the context menu event of a specific node
 * @prop {component} groupNodeComponent custom group node component
 * @prop {component} layerNodeComponent custom layer node component
 * @prop {array} selectedNodes list of selected node objects
 * @prop {function} onSelectNode return the current selected node on click event
 * @prop {string} filterText filter to apply to layers title
 * @prop {string} theme layers tree theme, one of undefined or `legend`
 * @prop {string} className additional class name for the layer tree
 * @prop {array} nodeItems list of node component to customize specific nodes, expected structure [ { name, Component, selector } ]
 * @prop {array} nodeToolItems list of node tool component to customize specific tool available on a node, expected structure [ { name, Component } ]
 * @prop {object} singleDefaultGroup if true it hides the default group nodes
 * @prop {object} config optional configuration available for the nodes
 * @prop {number} config.resolution map resolution
 * @prop {array} config.resolutions list of available map resolutions
 * @prop {array} config.scales list of available map scales
 * @prop {number} config.zoom zoom level of the map
 * @prop {string} config.visualizationMode visualization mode of the map, `2D` or `3D`
 * @prop {boolean} config.sortable activate the possibility to sort nodes
 * @prop {boolean} config.hideOpacitySlider hide the opacity slider
 * @prop {string} config.language current language code
 * @prop {string} config.currentLocale current language code
 * @prop {boolean} config.showTitleTooltip show the title tooltip
 * @prop {boolean} config.showOpacityTooltip show the opacity tooltip
 * @prop {object} config.groupOptions specific options for group nodes
 * @prop {object} config.groupOptions.tooltipOptions options for group title tooltip
 * @prop {object} config.layerOptions specific options for layer nodes
 * @prop {object} config.layerOptions.tooltipOptions options for layer title tooltip
 * @prop {boolean} config.layerOptions.hideLegend hide the legend of the layer
 * @prop {object} config.layerOptions.legendOptions additional options for WMS legend
 */
export function ControlledTOC({
    tree,
    contextMenu,
    onSort = () => {},
    onChange = () => {},
    onSelectNode = () => {},
    onContextMenu = () => {},
    groupNodeComponent,
    layerNodeComponent,
    filterText,
    selectedNodes,
    rootGroupId,
    nodeTypes = NodeTypes,
    config = {},
    className,
    nodeItems,
    nodeToolItems,
    singleDefaultGroup,
    theme
}) {
    return (
        <LayersTree
            className={className}
            theme={theme}
            tree={tree}
            filterText={filterText}
            onSort={onSort}
            onChange={({ options, node: currentNode, nodeType }) =>
                onChange(currentNode.id, nodeType, options)
            }
            groupNodeComponent={groupNodeComponent}
            layerNodeComponent={layerNodeComponent}
            contextMenu={contextMenu}
            onContextMenu={onContextMenu}
            selectedNodes={selectedNodes}
            onSelect={({ event, node: currentNode, nodeType }) =>
                onSelectNode(currentNode.id, nodeType === nodeTypes.GROUP ? 'group' : 'layer', event?.ctrlKey)
            }
            nodeTypes={nodeTypes}
            rootGroupId={rootGroupId}
            config={config}
            nodeItems={nodeItems}
            nodeToolItems={nodeToolItems}
            singleDefaultGroup={singleDefaultGroup}
        />
    );
}

/**
 * TOC component that supports map configuration
 * @prop {object} map map configuration
 * @prop {function} onChangeMap return the changed map configuration
 * @prop {array} selectedNodes list of selected node identifiers
 * @prop {function} onSelectNode return the current selected node on click event
 * @prop {string} theme layers tree theme, one of undefined or `legend`
 * @prop {string} className additional class name for the layer tree
 * @prop {array} nodeItems list of node component to customize specific nodes, expected structure [ { name, Component, selector } ]
 * @prop {array} nodeToolItems list of node tool component to customize specific tool available on a node, expected structure [ { name, Component } ]
 * @prop {object} singleDefaultGroup if true it hides the default group nodes
 * @prop {object} config optional configuration available for the nodes
 * @prop {number} config.resolution map resolution
 * @prop {array} config.resolutions list of available map resolutions
 * @prop {array} config.scales list of available map scales
 * @prop {number} config.zoom zoom level of the map
 * @prop {string} config.visualizationMode visualization mode of the map, `2D` or `3D`
 * @prop {boolean} config.sortable activate the possibility to sort nodes
 * @prop {boolean} config.hideOpacitySlider hide the opacity slider
 * @prop {string} config.language current language code
 * @prop {string} config.currentLocale current language code
 * @prop {boolean} config.showTitleTooltip show the title tooltip
 * @prop {boolean} config.showOpacityTooltip show the opacity tooltip
 * @prop {object} config.groupOptions specific options for group nodes
 * @prop {object} config.groupOptions.tooltipOptions options for group title tooltip
 * @prop {object} config.layerOptions specific options for layer nodes
 * @prop {object} config.layerOptions.tooltipOptions options for layer title tooltip
 * @prop {boolean} config.layerOptions.hideLegend hide the legend of the layer
 * @prop {object} config.layerOptions.legendOptions additional options for WMS legend
 */
function TOC({
    map = { layers: [], groups: [] },
    onChangeMap = () => {},
    selectedNodes = [],
    onSelectNode = () => {},
    config,
    className,
    nodeToolItems,
    singleDefaultGroup,
    nodeItems,
    theme
}) {
    const { layers } = splitMapAndLayers(map) || {};
    const tree = denormalizeGroups(layers.flat || [], layers.groups || []).groups;
    function handleOnChange(currentLayers, currentGroups) {
        const mapConfig = saveMapConfiguration(map, currentLayers || layers.flat, currentGroups || layers.groups, []);
        const newMap = {
            ...map,
            layers: mapConfig?.map?.layers,
            groups: mapConfig?.map?.groups
        };
        onChangeMap(newMap);
    }
    function handleOnSort(nodeId, groupId, index) {
        const sortedGroups = sortGroups({
            groups: layers.groups,
            layers: layers.flat
        }, {
            node: nodeId,
            index,
            groupId
        });
        if (sortedGroups) {
            handleOnChange(sortedGroups.layers, sortedGroups.groups);
        }
    }
    function handleUpdateNode(nodeId, nodeType, options) {
        const updatedNode = changeNodeConfiguration({
            groups: layers.groups,
            layers: layers.flat
        }, {
            node: nodeId,
            nodeType,
            options
        });
        handleOnChange(updatedNode.layers, updatedNode.groups);
    }
    return (
        <ControlledTOC
            className={className}
            theme={theme}
            tree={tree}
            selectedNodes={selectedNodesIdsToObject(selectedNodes, layers.flat, tree)}
            onSelectNode={onSelectNode}
            onSort={handleOnSort}
            onChange={handleUpdateNode}
            config={config}
            nodeItems={nodeItems}
            nodeToolItems={nodeToolItems}
            singleDefaultGroup={singleDefaultGroup}
        />
    );
}

export default TOC;
