/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {get, find, reduce, isEmpty} = require('lodash');
const { gridUpdateToQueryUpdate } = require('../../../utils/FeatureGridUtils');
const { composeAttributeFilters } = require('../../../utils/FilterUtils');
/**
 * Utility function to get the original layer from "layers" dependency, then, get the "params" object.
 */
module.exports = {
    getDependencyLayerParams: (layer, dependencies) =>
        layer
            && layer.id
            && get(
                find(dependencies.layers || [], {
                    id: layer.id
                }),
                "params",
                {}
            ),
    composeFilterObject: (filterObj, quickFilters, options) => {
        const quickFiltersForVisibleProperties = quickFilters && options &&
            Object.keys(quickFilters)
                .filter(qf => find(options.propertyName, f => f === qf))
                .reduce((p, c) => {
                    return {...p, [c]: quickFilters[c]};
                }, {});

        // Building new filterObj in order to and the two filters: old filterObj and quickFilter (from Table Widget)
        const columnsFilters = reduce(quickFiltersForVisibleProperties, (cFilters, value, attribute) => {
            return gridUpdateToQueryUpdate({attribute, ...value}, cFilters);
        }, {});
        if (!isEmpty(filterObj) || !isEmpty(columnsFilters)) {
            const composedFilterFields = composeAttributeFilters([filterObj, columnsFilters]);
            return {...filterObj, ...composedFilterFields};
        }
        return {};
    },
    getLayerInCommon: ({map = {}, dependencies} = {}) => {
        const targetLayerName = dependencies && dependencies.layer && dependencies.layer.name;
        const layerInCommon = !isEmpty(map) && !isEmpty(map.layers) && find(map.layers, {name: targetLayerName}) || {};
        return layerInCommon;
    }
};
