/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isObject, get, isNil } from 'lodash';

import { DEFAULT_GROUP_ID, NodeTypes } from '../../../utils/LayersUtils';
import { isSRSAllowed } from '../../../utils/CoordinatesUtils';
import head from "lodash/head";

export const StatusTypes = {
    DESELECT: 'DESELECT',
    GROUP: 'GROUP',
    LAYER: 'LAYER',
    BOTH: 'BOTH',
    GROUPS: 'GROUPS',
    LAYERS: 'LAYERS'
};
/**
 * Return if a tree should be presented as a single node group when only the default one is available
 * @param {array} tree the node tree
 * @return true or false
 */
export const isSingleDefaultGroup = (tree) => {
    return !!(tree?.length === 1 && tree?.[0]?.nodes && tree?.[0]?.id === DEFAULT_GROUP_ID
        && tree?.[0]?.visibility !== false
        && tree?.[0]?.nodesMutuallyExclusive !== true);
};

export const isValidNewGroupOption = function({ label }) {
    const filterWrongGroupRegex = RegExp('^\/|\/$|\/{2,}');
    if (!label || filterWrongGroupRegex.test(label)) {
        return false;
    }
    return true;
};

/**
 * gets the fragment for the tooltip.
 * @param {object} fragment in the node
 * @param {object} node layer or group
 * @param {string} currentLocale
 * @return {string} tooltip fragment
 */
export const getTooltipFragment = (fragment = "title", node, currentLocale, separator = " - ") => {
    switch (fragment) {
    case "title": {
        const translation = isObject(node.title) ? node.title[currentLocale] || node.title.default : node.title;
        const title = translation || node.name || "";
        return title;
    }
    case "description": {
        const description = node.description || "";
        return description;
    }
    case "both": {
        const translation = isObject(node.title) ? node.title[currentLocale] || node.title.default : node.title;
        const title = translation || node.nam || "";
        const description = node.description || "";
        return `${title}${separator && description ? separator : ""}${description}`;
    }
    // default is the name of the property passed
    default: return node[fragment];
    }
};
/**
 * gets and joins the fragments for tooltips of the node component in the TOC
 * @param {object} node layer or group
 * @param {string} currentLocale
 * @return {string} tooltip text
 */
export const getTooltip = (node, currentLocale, separator = " - ") => {
    // if this node is present in the tooltipOptions then use those keys to create the text for the tooltip
    return getTooltipFragment(node.tooltipOptions, node, currentLocale, separator);
};
/**
 * gets in a single call the title and the tooltip for the node
 * @param {object} node layer or group
 * @param {string} currentLocale
 * @return {string} separator
 * @return {number} maxLength
*/
export const getTitleAndTooltip = ({node, currentLocale, tooltipOptions = {separator: " - ", maxLength: 807}}) => {
    let tooltipText = getTooltip(node, currentLocale, tooltipOptions.separator) || "";
    tooltipText = tooltipText && tooltipText.substring(0, tooltipOptions.maxLength);
    if (tooltipText.length === tooltipOptions.maxLength) {
        tooltipText += "...";
    }
    return {
        title: getTooltipFragment("title", node, currentLocale, tooltipOptions.separator),
        tooltipText
    };
};

/**
 * Returns a matched group object for the given group name.
 * @param {string} groupName
 * @param {array} groups
 */
export const getGroupByLabel = (groupName, groups = []) => {
    const result = head(groups.filter(g => g.label === groupName));
    return result || groups.reduce((prev, g) => prev || !!g.nodes && getGroupByLabel(groupName, g.nodes), undefined);
};

export const getLabelName = (groupLabel = "", groups = []) => {
    let label = groupLabel.replace(/[^\.\/]+/g, match => {
        const title = get(getGroupByLabel(match, groups), 'label');
        return groups && title || match;
    });
    label = label.replace(/\./g, '/');
    label = label.replace(/\${dot}/g, '.');
    return label;
};

/**
 * Return the layer crs
 * @param {object} node the layer node
 * @return crs string
 */
const getSourceCRS = (node) => node?.bbox?.crs || node?.sourceMetadata?.crs;

/**
 * Check if a given layer node has the crs compatible with the available ones
 * @param {object} node the layer node
 * @return true or false
 */
const isCRSCompatible = (node) => {
    const CRS = getSourceCRS(node);
    // Check if source crs is compatible
    return !isNil(CRS) ? isSRSAllowed(CRS) : true;
};
/**
 * Check if a layer has an error and return the message
 * @param {object} node the layer node
 * @return message object or null
 */
export const getLayerErrorMessage = (node) => {
    if (node.loadingError === 'Error') {
        return { msgId: "toc.loadingerror" };
    }
    if (!isCRSCompatible(node)) {
        return {
            msgId: "toc.sourceCRSNotCompatible",
            msgParams: { sourceCRS: getSourceCRS(node) }
        };
    }
    return null;
};

/**
 * loop trough groups to find the related node
 * @param {string} nodeId node id to search
 * @param {object} node group node where to extract the searched node
 * @return tree node or null
 */
const findGroup = (nodeId, node) => {
    if (node?.id === nodeId) {
        return node;
    }
    return node?.nodes.reduce((found, childNode) => {
        if (found !== null) {
            return found;
        }
        return childNode?.nodes ? findGroup(nodeId, childNode) : null;
    }, null);
};
/**
 * Convert a list of node id in their object representation
 * @param {array} selectedNodesIds array of ids of selected nodes
 * @param {array} layers all available layer nodes
 * @param {array} tree all available group nodes
 * @return list of selected nodes
 */
export const selectedNodesIdsToObject = (selectedNodesIds, layers, tree) => {
    return selectedNodesIds.map(nodeId => {
        const layer = layers.find(({ id }) => nodeId === id);
        if (layer) {
            const error = getLayerErrorMessage(layer);
            return { id: nodeId, node: { ...layer, error }, type: NodeTypes.LAYER };
        }
        const group = findGroup(nodeId, { nodes: tree });
        if (group) {
            return { id: nodeId, node: group, type: NodeTypes.GROUP };
        }
        return null;
    }).filter(selectedNode => !!selectedNode);
};
