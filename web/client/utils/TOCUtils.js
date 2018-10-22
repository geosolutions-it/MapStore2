/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


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
    }
};


module.exports = TOCUtils;
