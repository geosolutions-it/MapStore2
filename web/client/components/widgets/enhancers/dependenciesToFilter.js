/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { find, isEmpty, pick } from 'lodash';
import { compose, withPropsOnChange } from 'recompose';

import { getViewportGeometry } from '../../../utils/CoordinatesUtils';
import { composeAttributeFilters, toOGCFilterParts } from '../../../utils/FilterUtils';
import { read } from '../../../utils/ogc/Filter/CQL/parser';
import filterBuilder from '../../../utils/ogc/Filter/FilterBuilder';
import fromObject from '../../../utils/ogc/Filter/fromObject';
import { composeFilterObject, getDependencyLayerParams } from './utils';

const getCqlFilter = (layer, dependencies) => {
    const params = getDependencyLayerParams(layer, dependencies);
    const cqlFilterKey = find(Object.keys(params || {}), (k = "") => k.toLowerCase() === "cql_filter");
    return params && cqlFilterKey && params[cqlFilterKey];
};

const getLayerFilter = ({layerFilter} = {}) => layerFilter;

const shouldMapOrKeys = ({ mapSync, geomProp, dependencies = {}, layer, quickFilters, options, filter } = {}, nextProps = {}) => {
    return mapSync !== nextProps.mapSync
        || dependencies.viewport !== (nextProps.dependencies && nextProps.dependencies.viewport)
        || dependencies.quickFilters !== (nextProps.dependencies && nextProps.dependencies.quickFilters)
        || dependencies.options !== (nextProps.dependencies && nextProps.dependencies.options)
        || geomProp !== nextProps.geomProp
        || filter !== nextProps.filter
        || options !== nextProps.options
        || quickFilters !== nextProps.quickFilters
        || getCqlFilter(layer, dependencies) !== getCqlFilter(nextProps.layer, nextProps.dependencies)
        || getLayerFilter(layer) !== getLayerFilter(nextProps.layer);
};

const createFilterProps = ({ mapSync, geomProp, dependencies = {}, filter: filterObj, layer, quickFilters, options } = {}) => {
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
                ...(layerFilter && !layerFilter.disabled ? toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                ...(newFilterObj ? toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : [])
            )) : undefined
        };
    }
    // merging filterObj with quickFilters coming from dependencies
    if (layer && dependencies && dependencies.quickFilters && dependencies.layer && (layer.name === dependencies.layer.name) ) {
        newFilterObj = {...newFilterObj, ...composeFilterObject(newFilterObj, dependencies.quickFilters, dependencies.options)};
    }
    // merging filterObj with attribute filter coming from dependencies
    if (layer && dependencies && dependencies.filter && dependencies.layer && (layer.name === dependencies.layer.name) ) {
        newFilterObj = {...newFilterObj, ...composeAttributeFilters([newFilterObj, dependencies.filter])};
    }
    // generating a cqlFilter based viewport coming from dependencies
    if (dependencies.viewport) {
        const bounds = Object.keys(viewport.bounds).reduce((p, c) => {
            return {...p, [c]: parseFloat(viewport.bounds[c])};
        }, {});
        geom = getViewportGeometry(bounds, viewport.crs);
        const cqlFilter = getCqlFilter(layer, dependencies);
        cqlFilterRules = cqlFilter
            ? [toFilter(read(cqlFilter))]
            : [];
        // this will contain an ogc filter based on current and other filters (cql included)
        return {
            filter: filter(and(
                ...cqlFilterRules,
                ...(layerFilter  && !layerFilter.disabled ? toOGCFilterParts(layerFilter, "1.1.0", "ogc") : []),
                ...(newFilterObj ? toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : []),
                ...(geomProp ? [property(geomProp).intersects(geom)] : [])))
        };
    }
    // this will contain only an ogc filter based on current and other filters (cql excluded)
    const ogcLayerFilterParts = layerFilter ? toOGCFilterParts(layerFilter, "1.1.0", "ogc") : [];
    const ogcNewFilterObjParts = newFilterObj ? toOGCFilterParts(newFilterObj, "1.1.0", "ogc") : [];
    const ogcFilter = isEmpty(ogcLayerFilterParts) && isEmpty(ogcNewFilterObjParts) ? undefined
        : filter(and(...ogcLayerFilterParts, ...ogcNewFilterObjParts));
    return { filter: ogcFilter };
};

const TRACE_PROPS = ['mapSync', 'dependencies', 'dependenciesMap', 'widgets'];
/**
 * Merges filter object and dependencies map into an ogc filter
 */
export default compose(
    withPropsOnChange(
        ({ traces, ...props }, { nextTraces = [], ...nextProps }) => {
            if (traces) {
                return traces.some((trace, idx) => shouldMapOrKeys(
                    {
                        ...pick(props, TRACE_PROPS),
                        ...trace
                    },
                    {
                        ...pick(nextProps, TRACE_PROPS),
                        ...nextTraces[idx]
                    }
                ));
            }
            return shouldMapOrKeys(props, nextProps);
        },
        (props = {}) => {
            if (props.traces) {
                return {
                    traces: props.traces.map((trace) => {
                        return {
                            ...trace,
                            ...createFilterProps({
                                ...pick(props, TRACE_PROPS),
                                ...trace
                            })
                        };
                    })
                };
            }
            return createFilterProps(props);
        }
    )
);
