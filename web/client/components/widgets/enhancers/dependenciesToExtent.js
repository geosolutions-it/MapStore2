/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const xml2js = require('xml2js');
const { Observable } = require('rxjs');
const { mapPropsStream } = require('recompose');
const { isEmpty, isEqual} = require('lodash');

const { composeFilterObject, getLayerInCommon } = require('./utils');
const wpsBounds = require('../../../observables/wps/bounds');
const FilterUtils = require('../../../utils/FilterUtils');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');
const { getLayerUrl } = require('../../../utils/LayersUtils');
const { set } = require('../../../utils/ImmutableUtils');


/**
 * fetches the bounds from an ogc filter based on dependencies
 * @returns {object} the map with center and zoom updated
 */
module.exports = mapPropsStream(props$ => {
    return props$
        .distinctUntilChanged( (props = {}, nextProps = {}) =>
            isEqual(props.dependencies, nextProps.dependencies)
        )
        .debounceTime(1000)
        .switchMap(({mapSync, dependencies = {}, map, filter: filterObj}) => {
            const layerInCommon = getLayerInCommon({dependencies, map});
            if (!mapSync || isEmpty(layerInCommon)) {
                return Observable.of({});
            }
            let filterObjCollection = {};
            if (dependencies.quickFilters) {
                filterObjCollection = {...filterObjCollection, ...composeFilterObject(filterObj, dependencies.quickFilters, dependencies.options)};
            }
            if (dependencies.filter) {
                filterObjCollection = {...filterObjCollection, ...FilterUtils.composeAttributeFilters([filterObjCollection, dependencies.filter])};
            }
            const featureTypeName = layerInCommon.name;
            if (!isEmpty(filterObjCollection)) {
                const wfsGetFeature = FilterUtils.toOGCFilter(featureTypeName, filterObjCollection, "1.1.0");
                return wpsBounds(getLayerUrl(layerInCommon), {wfsGetFeature })
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
                            return Observable.of({});
                        }
                        const bounds4326 = {
                            minx: parseFloat(sw[0]),
                            miny: parseFloat(sw[1]),
                            maxx: parseFloat(ne[0]),
                            maxy: parseFloat(ne[1])
                        };
                        const bounds3857 = CoordinatesUtils.reprojectBbox(bounds4326, "EPSG:4326", "EPSG:3857");
                        return Observable.of({
                            bounds4326,
                            bounds: {
                                minx: parseFloat(bounds3857[0]),
                                miny: parseFloat(bounds3857[1]),
                                maxx: parseFloat(bounds3857[2]),
                                maxy: parseFloat(bounds3857[3])
                            }
                        });
                    })
                    .startWith({loading: true})
                    .catch((error) => Observable.of({ error: "error getting bounds from filter", details: error }));
            }
            return Observable.of({});
        })
        .combineLatest(props$, ({bounds = {}, bounds4326 = {}, loading = false}, props = {}) => {
            // override new bounds and trigger "internal" zoom to extent
            if (!isEmpty(bounds) && !isEmpty(bounds4326)) {
                let newProps = set("map.bbox.bounds", bounds, props);
                newProps = set("map.zoomToExtent", true, newProps);
                return set("loading", false, newProps);
            }
            let newProps = set("map.zoomToExtent", false, props);
            return set("loading", loading, newProps);
        });
});
