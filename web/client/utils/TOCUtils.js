/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isObject, get } from 'lodash';

import {getGroupByName} from './LayersUtils';
import {getLocale} from './LocaleUtils';

export const createFromSearch = function(options, search) {
    /* only create an option from search if the length of the search string is > 0 and
    it does no match the label property of an existing option
    MV: it should also avoid the creation of group with an empty name therefore a new regex has been introduced
    */
    const filterWrongGroupRegex = RegExp('^\/|\/$|\/{2,}');
    if (search.length === 0 || (options.map(function(option) {
        return option.label;
    })).indexOf(search) > -1 || filterWrongGroupRegex.test(search)) {
        return null;
    }

    const val = search.replace(/\./g, '${dot}').replace(/\//g, '.');
    return {label: search, value: val};
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
 * flatten groups and subgroups in a single array
 * @param {object[]} groups node to get the groups and subgroups
 * @param {number} idx
 * @params {boolean} wholeGroup, if true it returns the whole node
 * @return {object[]} array of nodes (groups and subgroups)
*/
export const flattenGroups = (groups, idx = 0, wholeGroup = false) => {
    return groups.filter((group) => group.nodes).reduce((acc, g) => {
        acc.push(wholeGroup ? g : {label: g.id.replace(/\./g, '/').replace(/\${dot}/g, '.'), value: g.id});
        if (g.nodes.length > 0) {
            return acc.concat(flattenGroups(g.nodes, idx + 1, wholeGroup));
        }
        return acc;
    }, []);
};
export const getLabelName = (groupLabel = "", groups = []) => {
    let label = groupLabel.replace(/[^\.\/]+/g, match => {
        const title = get(getGroupByName(match, groups), 'title');
        if (isObject(title)) {
            const locale = getLocale();
            return title[locale] || title.default;
        }
        return groups && title || match;
    });
    label = label.replace(/\./g, '/');
    label = label.replace(/\${dot}/g, '.');
    return label;
};
