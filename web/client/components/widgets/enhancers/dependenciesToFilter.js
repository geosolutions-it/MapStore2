/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange } = require('recompose');
const { find, isEmpty} = require('lodash');

const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const FilterUtils = require('../../../utils/FilterUtils');
const filterBuilder = require('../../../utils/ogc/Filter/FilterBuilder');
const fromObject = require('../../../utils/ogc/Filter/fromObject');
const { getDependencyLayerParams, composeFilterObject } = require('./utils');
const { composeAttributeFilters } = require('../../../utils/FilterUtils');
const getCqlFilter = (layer, dependencies) => {
    const params = getDependencyLayerParams(layer, dependencies);
    const cqlFilterKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter");
    return params && cqlFilterKey && params[cqlFilterKey];
};
const { read } = require('../../../utils/ogc/Filter/CQL/parser');
const getLayerFilter = ({layerFilter} = {}) => layerFilter;

/**
 * Merges filter object and dependencies map into an ogc filter
 */
module.exports = compose(
    withPropsOnChange(
        ({mapSync, geomProp, dependencies = {}, layer, quickFilters, options } = {}, nextProps = {}, filter) =>
            mapSync !== nextProps.mapSync
            || dependencies.viewport !== (nextProps.dependencies && nextProps.dependencies.viewport)
            || dependencies.quickFilters !== (nextProps.dependencies && nextProps.dependencies.quickFilters)
            || dependencies.options !== (nextProps.dependencies && nextProps.dependencies.options)
            || geomProp !== nextProps.geomProp
            || filter !== nextProps.filter
            || options !== nextProps.options
            || quickFilters !== nextProps.quickFilters
            || getCqlFilter(layer, dependencies) !== getCqlFilter(nextProps.layer, nextProps.dependencies)
            || getLayerFilter(layer) !== getLayerFilter(nextProps.layer),
        ({ mapSync, geomProp = "the_geom", dependencies = {}, filter: filterObj, layer, quickFilters, options} = {}) => {
            const viewport = dependencies.viewport;
            const fb = filterBuilder({ gmlVersion: "3.1.1" });
            const toFilter = fromObject(fb);
            const {filter, property, and} = fb;
            const {layerFilter} = layer || {};
            let geom = {};
            let cqlFilterRules = {};
            // merging attribute filter and quickFilters of the current widget into a single filterObj
            let newFilterObj = composeFilterObject(filterObj, quickFilters, options);

            if (!mapSync) {
                return {
                    filter: !isEmpty(newFilterObj) || layerFilter ? filter(and(
                        ...(layerFilter ? FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                        ...(newFilterObj ? FilterUtils.toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : [])
                    )) : undefined
                };
            }
            // merging filterObj with quickFilters coming from dependencies
            if (layer && dependencies && dependencies.quickFilters && dependencies.layer && layer.name === dependencies.layer.name ) {
                newFilterObj = {...newFilterObj, ...composeFilterObject(newFilterObj, dependencies.quickFilters, dependencies.options)};
            }
            // merging filterObj with attribute filter coming from dependencies
            if (layer && dependencies && dependencies.filter && dependencies.layer && layer.name === dependencies.layer.name ) {
                newFilterObj = {...newFilterObj, ...composeAttributeFilters([newFilterObj, dependencies.filter])};
            }
            // generating a cqlFilter based viewport coming from dependencies
            if (dependencies.viewport) {
                const bounds = Object.keys(viewport.bounds).reduce((p, c) => {
                    return {...p, [c]: parseFloat(viewport.bounds[c])};
                }, {});
                geom = CoordinatesUtils.getViewportGeometry(bounds, viewport.crs);
                const cqlFilter = getCqlFilter(layer, dependencies);
                cqlFilterRules = cqlFilter
                    ? [toFilter(read(cqlFilter))]
                    : [];
                // this will contain an ogc filter based on current and other filters (cql included)
                return {
                    filter: filter(and(
                        ...cqlFilterRules,
                        ...(layerFilter ? FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                        ...(newFilterObj ? FilterUtils.toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : []),
                        property(geomProp).intersects(geom)))
                };
            }
            // this will contain only an ogc filter based on current and other filters (cql excluded)
            return {
                filter: filter(and(
                    ...(layerFilter ? FilterUtils.toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                    ...(newFilterObj ? FilterUtils.toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : [])))
            };
        }
    )

);
