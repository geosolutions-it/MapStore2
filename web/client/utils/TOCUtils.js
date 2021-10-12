/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isObject, get } from 'lodash';

import {getLocale} from './LocaleUtils';
import head from "lodash/head";

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

/**
 * Returns a parsed title
 * @param {string/object} title title of the group
 * @param {string} locale
 */
export const getTitle = (title, locale = '') => {
    let _title = title || '';
    if (isObject(title)) {
        const _locale = locale || getLocale();
        _title = title[_locale] || title.default;
    }
    return _title.replace(/\./g, '/').replace(/\${dot}/g, '.');
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
        acc.push(wholeGroup ? g : {label: g.title, value: g.id});
        if (g.nodes.length > 0) {
            return acc.concat(flattenGroups(g.nodes, idx + 1, wholeGroup));
        }
        return acc;
    }, []);
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
