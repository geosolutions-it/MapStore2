/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withPropsOnChange} = require('recompose');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const FilterUtils = require('../../../utils/FilterUtils');
const filterBuilder = require('../../../utils/ogc/Filter/FilterBuilder');
const fromObject = require('../../../utils/ogc/Filter/fromObject');
const { getDependencyLayerParams } = require('./utils');
const { find } = require('lodash');
const getCqlFilter = (layer, dependencies) => {
    const params = getDependencyLayerParams(layer, dependencies);
    const cqlFilterKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter");
    return params && cqlFilterKey && params[cqlFilterKey];
};
const { read } = require('../../../utils/ogc/Filter/CQL/parser');


/**
 * Merges filter object and dependencies map into an ogc filter
 */
module.exports = compose(
    withPropsOnChange(
        ({mapSync, geomProp, dependencies = {}, layer} = {}, nextProps = {}, filter) =>
            mapSync !== nextProps.mapSync
            || dependencies.viewport !== (nextProps.dependencies && nextProps.dependencies.viewport)
            || geomProp !== nextProps.geomProp
            || filter !== nextProps.filter
            || getCqlFilter(layer, dependencies) !== getCqlFilter(nextProps.layer, nextProps.dependencies),
        ({ mapSync, geomProp = "the_geom", dependencies = {}, filter: filterObj, layer} = {}) => {
            const viewport = dependencies.viewport;
            const fb = filterBuilder({ gmlVersion: "3.1.1" });
            const toFilter = fromObject(fb);
            const {filter, property, and} = fb;
            if (!mapSync || !dependencies.viewport) {
                return {
                    filter: filterObj ? filter(and((FilterUtils.toOGCFilterParts(filterObj, "1.1.0", "ogc") || []))) : undefined
                };
            }

            const bounds = Object.keys(viewport.bounds).reduce((p, c) => {
                return {...p, [c]: parseFloat(viewport.bounds[c])};
            }, {});
            const geom = CoordinatesUtils.getViewportGeometry(bounds, viewport.crs);
            const cqlFilter = getCqlFilter(layer, dependencies);
            const cqlFilterRules = cqlFilter
                ? [toFilter(read(cqlFilter))]
                : [];
            return {
                filter: filter(and(
                    ...cqlFilterRules,
                    ...(filterObj ? FilterUtils.toOGCFilterParts(filterObj, "1.1.0", "ogc") : []),
                    property(geomProp).intersects(geom)))
            };
        }
    )

);
