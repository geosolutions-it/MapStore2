/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange } = require('recompose');
const { find, isEmpty, isEqual} = require('lodash');

const FilterUtils = require('../../../utils/FilterUtils');
const { optionsToVendorParams } = require('../../../utils/VendorParamsUtils');
const { arrayUpdate } = require('../../../utils/ImmutableUtils');

const {composeFilterObject} = require('./utils');

/**
 * Merges dependencies quickFilters and filter into a cql filter for a layer
 * @returns {object} the map with layers updated or not
 */
module.exports = compose(
    withPropsOnChange(
        ({mapSync, dependencies = {}, map = {} } = {}, nextProps = {}, filter) =>
            mapSync !== nextProps.mapSync
            || !isEqual(dependencies, nextProps.dependencies)
            || !isEqual(map, nextProps.map)
            || filter !== nextProps.filter,
        ({ mapSync, dependencies = {}, filter: filterObj = {}, map = {layers: []}} = {}) => {

            const targetLayerName = dependencies && dependencies.layer && dependencies.layer.name;
            const layerInCommon = find(map.layers, {name: targetLayerName}) || {};

            let filterObjCollection = {};
            let layersUpdatedWithCql = {};
            let cqlFilter = undefined;

            if (mapSync && !isEmpty(layerInCommon)) {
                if (dependencies.quickFilters) {
                    filterObjCollection = {...filterObjCollection, ...composeFilterObject(filterObj, dependencies.quickFilters, dependencies.options)};
                }
                if (dependencies.filter) {
                    filterObjCollection = {...filterObjCollection, ...FilterUtils.composeAttributeFilters([filterObjCollection, dependencies.filter])};
                }

                if (!isEmpty(filterObjCollection) && FilterUtils.toCQLFilter(filterObjCollection)) {
                    cqlFilter = FilterUtils.toCQLFilter(filterObjCollection);
                    // originalCqlFilter is used to store the cql_filter created on the layer that is coming from the map
                    // we should avoid to add the merge between originalCqlFilter and cql filter generated from quickFilters etc,
                    // because these changes are pushed in the state

                    layersUpdatedWithCql = arrayUpdate(false,
                        {...layerInCommon,
                            // using originalCqlFilter only once
                            originalCqlFilter: !map.originalCqlFilterAdded ? layerInCommon && layerInCommon.params && layerInCommon.params.CQL_FILTER : layerInCommon.originalCqlFilter,
                            params: optionsToVendorParams({ params: {CQL_FILTER: cqlFilter}}, layerInCommon.originalCqlFilter)
                        }, {name: targetLayerName}, map.layers);
                    return {
                        map: {
                            ...map,
                            originalCqlFilterAdded: true,
                            layers: layersUpdatedWithCql
                        }
                    };
                }
            }
            layersUpdatedWithCql = map.layers.map(l => ({...l, params: {...l.params, CQL_FILTER: undefined}}));
            return {
                map: {
                    ...map,
                    layers: layersUpdatedWithCql
                }
            };
        }
    )

);
