/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const xml2js = require('xml2js');
const { Observable } = require('rxjs');
const { mapPropsStream, compose, branch, withPropsOnChange} = require('recompose');
const { isEmpty, isEqual} = require('lodash');

const { composeFilterObject } = require('./utils');
const wpsBounds = require('../../../observables/wps/bounds');
const FilterUtils = require('../../../utils/FilterUtils');
const { getWpsUrl } = require('../../../utils/LayersUtils');
const { set } = require('../../../utils/ImmutableUtils');
const MapUtils = require('../../../utils/MapUtils');

/**
 * fetches the bounds from an ogc filter based on dependencies
 * @returns {object} the map with center and zoom updated
 */
module.exports = compose(

    branch(
        ({mapSync, dependencies} = {}) => {
            return mapSync && (!isEmpty(dependencies.quickFilters) || !isEmpty(dependencies.filter));
        },
        compose(
            withPropsOnChange(["id"],
                ({hookRegister = null}) => ({
                    hookRegister: hookRegister || MapUtils.createRegisterHooks()
                })),
            mapPropsStream(props$ => {
                return props$
                    .distinctUntilChanged( (props = {}, nextProps = {}) =>
                        isEqual(props.dependencies.quickFilters, nextProps.dependencies.quickFilters) &&
                        isEqual(props.dependencies.filter, nextProps.dependencies.filter) &&
                        isEqual(props.dependencies.layer, nextProps.dependencies.layer)
                    )
                    .debounceTime(500)
                    .switchMap(({mapSync, dependencies = {}, filter: filterObj, hookRegister}) => {
                        if (!mapSync || isEmpty(dependencies.layer)) {
                            return Observable.of({ loading: false });
                        }
                        let filterObjCollection = {};
                        if (dependencies.quickFilters) {
                            filterObjCollection = {...filterObjCollection, ...composeFilterObject(filterObj, dependencies.quickFilters, dependencies.options)};
                        }
                        if (dependencies.filter) {
                            filterObjCollection = {...filterObjCollection, ...FilterUtils.composeAttributeFilters([filterObjCollection, dependencies.filter])};
                        }
                        const featureTypeName = dependencies && dependencies.layer && dependencies.layer.name;
                        if (!isEmpty(filterObjCollection)) {
                            // remove xsi:schemaLocation for performance improvements.
                            filterObjCollection = {
                                ...filterObjCollection,
                                options: {
                                    ...(filterObjCollection.options || {}),
                                    noSchemaLocation: true
                                }
                            };
                            const wfsGetFeature = FilterUtils.toOGCFilter(featureTypeName, filterObjCollection, "1.1.0");
                            return wpsBounds(getWpsUrl(dependencies.layer), {wfsGetFeature })
                                .switchMap(response => {
                                    let json;
                                    let sw;
                                    let ne;
                                    xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                                        json = result["ows:BoundingBox"];
                                        sw = json["ows:LowerCorner"].split(" ");
                                        ne = json["ows:UpperCorner"].split(" ");
                                    });
                                    if (json["ows:LowerCorner"] === "0.0 0.0" && json["ows:UpperCorner"] === "-1.0 -1.0") {
                                        return Observable.of({ loading: false });
                                    }
                                    const bounds4326 = {
                                        minx: parseFloat(sw[0]),
                                        miny: parseFloat(sw[1]),
                                        maxx: parseFloat(ne[0]),
                                        maxy: parseFloat(ne[1])
                                    };
                                    const hook = hookRegister.getHook(MapUtils.ZOOM_TO_EXTENT_HOOK);
                                    if (hook) {
                                        // trigger "internal" zoom to extent
                                        hook(bounds4326, {
                                            crs: "EPSG:4326",
                                            maxZoom: 21
                                        });
                                    }
                                    return Observable.of({ loading: false });
                                })
                                .startWith({loading: true})
                                .catch((error) => Observable.of({ error: "error getting bounds from filter", details: error }));
                        }
                        return Observable.of({ loading: false });
                    })
                    .combineLatest(props$, ({loading = false}, props = {}) => {
                        return set("loading", loading, props);
                    });
            }))
    )
);
