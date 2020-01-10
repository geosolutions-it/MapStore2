/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange } = require('recompose');
const { find, reduce, isEmpty} = require('lodash');

const FilterUtils = require('../../../utils/FilterUtils');
const filterBuilder = require('../../../utils/ogc/Filter/FilterBuilder');
const { getDependencyLayerParams } = require('./utils');
const { composeAttributeFilters } = require('../../../utils/FilterUtils');
const { gridUpdateToQueryUpdate } = require('../../../utils/FeatureGridUtils');
const getCqlFilter = (layer, dependencies) => {
    const params = getDependencyLayerParams(layer, dependencies);
    const cqlFilterKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter");
    return params && cqlFilterKey && params[cqlFilterKey];
};
const getLayerFilter = ({layerFilter} = {}) => layerFilter;

const composeFilterObject = (filterObj, quickFilters, options) => {
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
};

/**
 * Merges filter object and dependencies map into an ogc filter
 */
module.exports = compose(
    withPropsOnChange(
        ({mapSync, dependencies = {}, layer, quickFilters, options } = {}, nextProps = {}, filter) =>
            mapSync !== nextProps.mapSync
            || dependencies !== nextProps.dependencies
            || filter !== nextProps.filter
            || options !== nextProps.options
            || quickFilters !== nextProps.quickFilters
            || getCqlFilter(layer, dependencies) !== getCqlFilter(nextProps.layer, nextProps.dependencies)
            || getLayerFilter(layer) !== getLayerFilter(nextProps.layer),
        ({ mapSync, dependencies = {}, filter: filterObj, layer, quickFilters, options, map} = {}) => {
            const fb = filterBuilder({ gmlVersion: "3.1.1" });
            const {filter, and} = fb;

            // TODO continue here
            const findLayer =
            const {layerFilter} = layer || {};
            let newFilterObj = composeFilterObject(filterObj, quickFilters, options);

            if (mapSync && dependencies && dependencies.layer && layer && dependencies.layer.name === layer.name) {
                if (dependencies.quickFilters) {
                    newFilterObj = {...newFilterObj, ...composeFilterObject(newFilterObj, dependencies.quickFilters, dependencies.options)};
                }
                if (dependencies.filter) {
                    newFilterObj = {...newFilterObj, ...composeAttributeFilters([newFilterObj, dependencies.filter])};
                }
                return {
                    map: newFilterObj || layerFilter ? filter(and(
                        ...(layerFilter ? FilterUtils.toCQLFilter(layerFilter) : []),
                        ...(newFilterObj ? FilterUtils.toCQLFilter(newFilterObj) : [])
                    )) : map
                };
            }
            return {
                map
            };
        }
    )

);
