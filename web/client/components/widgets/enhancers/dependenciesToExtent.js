/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Observable } = require('rxjs');
const { mapPropsStream } = require('recompose');
const { isEmpty, isEqual} = require('lodash');

const { composeFilterObject, getLayerInCommon } = require('./utils');
const wpsBounds = require('../../../observables/wps/bounds');
const FilterUtils = require('../../../utils/FilterUtils');
const { getLayerUrl } = require('../../../utils/LayersUtils');


/**
 * fetches the bounds give an ogc filter based on dependencies
 * @returns {object} the map with layers updated or not
 */
module.exports = mapPropsStream(props$ => {
    return props$
        /* .distinctUntilChanged( (props = {}, nextProps = {}) =>
            isEqual(props.dependencies, nextProps.dependencies) ||
            props.filter === nextProps.filter
        )*/
        .filter(({mapSync, dependencies, map}) => {
            const layerInCommon = getLayerInCommon({dependencies, map});
            return mapSync && !isEmpty(layerInCommon);
        })
        .switchMap(({dependencies = {}, map, filter: filterObj}) => {
            const layerInCommon = getLayerInCommon({dependencies, map});
            let filterObjCollection = {};
            if (dependencies.quickFilters) {
                filterObjCollection = {...filterObjCollection, ...composeFilterObject(filterObj, dependencies.quickFilters, dependencies.options)};
            }
            if (dependencies.filter) {
                filterObjCollection = {...filterObjCollection, ...FilterUtils.composeAttributeFilters([filterObjCollection, dependencies.filter])};
            }
            // extracting ogc properties
            const featureTypeName = layerInCommon.name;
            if (!isEmpty(filterObjCollection)) {
                const wfsGetFeature = FilterUtils.toOGCFilter(featureTypeName, filterObjCollection, "1.1.0");
                return wpsBounds(getLayerUrl(layerInCommon), {wfsGetFeature})
                    .catch((error) => Observable.of({ error: "error getting bounds from filter", details: error }));
            }
            return Observable.of({});

        })
        .startWith({})
        .combineLatest(props$, (bounds = {}, props = {}) => {
            // calculate new bounds
            console.log("bounds", bounds);
            return {
                ...props,
                map: {
                    ...props.map
                }
            };
        });
});
