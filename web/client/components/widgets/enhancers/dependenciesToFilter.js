/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withPropsOnChange} = require('recompose');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const filterBuilder = require('../../../utils/ogc/Filter/FilterBuilder');
module.exports = compose(
   withPropsOnChange(
       ({mapSync, geom_prop, dependencies} = {}, nextProps = {}) => mapSync !== nextProps.mapSync || dependencies.viewport !== (nextProps.dependencies && nextProps.dependencies.viewport),
       ({mapSync, dependencies = {}}) => {
           const viewport = dependencies.viewport;
           if (!mapSync || !dependencies.viewport) {
               return ({
                   filter: undefined
               });
           }

           const bounds = Object.keys(viewport.bounds).reduce((p, c) => {
               return {...p, [c]: parseFloat(viewport.bounds[c])};
           }, {});
           const geom = CoordinatesUtils.getViewportGeometry(bounds, viewport.crs);
           const {filter, property} = filterBuilder({gmlVersion: "3.1.1"});
           return {
               filter: filter(property("the_geom").intersects(geom))
           };
       }
   ),

);
