/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import xml2js from 'xml2js';

import { Observable } from 'rxjs';
import { mapPropsStream, compose, branch, withPropsOnChange } from 'recompose';
import { isEmpty, isEqual } from 'lodash';
import { composeFilterObject } from './utils';
import wpsBounds from '../../../observables/wps/bounds';
import { composeAttributeFilters, toOGCFilter } from '../../../utils/FilterUtils';
import { getWpsUrl } from '../../../utils/LayersUtils';
import { set } from '../../../utils/ImmutableUtils';
import { createRegisterHooks, ZOOM_TO_EXTENT_HOOK } from '../../../utils/MapUtils';

/**
 * fetches the bounds from an ogc filter based on dependencies
 * @returns {object} the map with center and zoom updated
 */
export default compose(

    branch(
        ({mapSync, dependencies} = {}) => {
            return mapSync && (!isEmpty(dependencies.quickFilters) || !isEmpty(dependencies.filter));
        },
        compose(
            withPropsOnChange(["id"],
                ({hookRegister = null}) => ({
                    hookRegister: hookRegister || createRegisterHooks()
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
                            filterObjCollection = {...filterObjCollection, ...composeAttributeFilters([filterObjCollection, dependencies.filter])};
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
                            const wfsGetFeature = toOGCFilter(featureTypeName, filterObjCollection, "1.1.0");
                            return wpsBounds(getWpsUrl(dependencies.layer), {wfsGetFeature })
                                .switchMap(data => {
                                    let json;
                                    let sw;
                                    let ne;
                                    xml2js.parseString(data, {explicitArray: false}, (ignore, result) => {
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
                                    const hook = hookRegister.getHook(ZOOM_TO_EXTENT_HOOK);
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
