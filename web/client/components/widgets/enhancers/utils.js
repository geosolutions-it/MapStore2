/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { find, get, isEmpty, reduce } from 'lodash';

import { gridUpdateToQueryUpdate } from '../../../utils/FeatureGridUtils';
import { composeAttributeFilters } from '../../../utils/FilterUtils';

/**
 * Utility function to get the original layer from "layers" dependency, then, get the "params" object.
 */
export const getDependencyLayerParams = (layer, dependencies) =>
    layer
        && layer.id
        && get(
            find(dependencies.layers || [], {
                id: layer.id
            }),
            "params",
            {}
        );
export const composeFilterObject =  (filterObj, quickFilters, options) => {
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
        const composedFilterFields = composeAttributeFilters([filterObj, columnsFilters], undefined, filterObj?.spatialFieldOperator);
        return {...filterObj, ...composedFilterFields};
    }
    return {};
};
export const getLayerInCommon = ({map = {}, dependencies} = {}) => {
    const targetLayerName = dependencies && dependencies.layer && dependencies.layer.name;
    const layerInCommon = !isEmpty(map) && !isEmpty(map.layers) && find(map.layers, {name: targetLayerName}) || {};
    return layerInCommon;
};

export default {
    getDependencyLayerParams,
    composeFilterObject,
    getLayerInCommon
};
