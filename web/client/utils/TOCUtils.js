/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isObject, find, isNil} = require('lodash');

const TOCUtils = {
    createFromSearch: function(options, search) {
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
    },
    /**
     * it fetches and joins the fragments for tooltips for node component in the TOC
     * @param {object} tooltipOptions
     * @param {object} node layer or group
     * @param {string} currentLocale
     * @return {string} tooltip text
     */
    getTooltip: (tooltipOptions, node, currentLocale) => {
        // if this node is present in the tooltipOptions then use those keys to create the text for the tooltip
        let tooltips = tooltipOptions && find(Object.keys(tooltipOptions), id => id === node.id);
        if (tooltips) {
            // if you specify a joinsStr it uses it for concatenating the various fields
            return tooltipOptions[tooltips]
                    .map(t => TOCUtils.getTooltipText(t, node, currentLocale))
                    .filter(t => !isNil(t))
                    .join(tooltipOptions.joinStr || " - ");
        }
        return TOCUtils.getTooltipText("title", node, currentLocale);
    },
    /**
     * it fetch the fragment to compose the tooltip
     * @param {object} fragment in the node
     * @param {object} node layer or group
     * @param {string} currentLocale
     * @return {string} tooltip fragment
     */
    getTooltipText: (fragment, node, currentLocale) => {
        switch (fragment) {
            case "title": {
                const translation = isObject(node.title) ? node.title[currentLocale] || node.title.default : node.title;
                const title = translation || node.name;
                return title;
            }
            // default is the name of the property passed
            default: return node[fragment];
        }
    }
};


module.exports = TOCUtils;
