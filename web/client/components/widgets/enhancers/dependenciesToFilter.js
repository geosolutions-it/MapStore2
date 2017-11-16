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
module.exports = compose(
   withPropsOnChange(
       ({mapSync, geomProp, dependencies = {}} = {}, nextProps = {}, filter) =>
            mapSync !== nextProps.mapSync
            || dependencies.viewport !== (nextProps.dependencies && nextProps.dependencies.viewport)
            || geomProp !== nextProps.geomProp
            || filter !== nextProps.filter,
       ({mapSync, geomProp = "the_geom", dependencies = {}, filter: filterObj} = {}) => {
           const viewport = dependencies.viewport;
           const {filter, property, and} = filterBuilder({gmlVersion: "3.1.1"});
           if (!mapSync || !dependencies.viewport) {
               return {
                   filter: filterObj ? filter(and((FilterUtils.toOGCFilterParts(filterObj, "1.1.0", "ogc") : []))) : undefined
               };
           }

           const bounds = Object.keys(viewport.bounds).reduce((p, c) => {
               return {...p, [c]: parseFloat(viewport.bounds[c])};
           }, {});
           const geom = CoordinatesUtils.getViewportGeometry(bounds, viewport.crs);
           return {
               filter: filter(and(
                   ...(filterObj ? FilterUtils.toOGCFilterParts(filterObj, "1.1.0", "ogc") : []),
                    property(geomProp).intersects(geom)))
           };
       }
   )

);
