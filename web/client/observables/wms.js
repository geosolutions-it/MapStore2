/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {Observable} = require('rxjs');
const axios = require('../libs/ajax');
const WMS = require('../api/WMS');
const LayersUtils = require('../utils/LayersUtils');
const SecurityUtils = require('../utils/SecurityUtils');
const CoordinatesUtils = require("../utils/CoordinatesUtils");
const urlUtil = require('url');
const {interceptOGCError} = require('../utils/ObservableUtils');
const {head} = require('lodash');
const Proj4js = require('proj4').default;
const proj4 = Proj4js;

const toDescribeLayerURL = ({name, search = {}, url} = {}) => {
    const parsed = urlUtil.parse(search.url || url, true);
    return urlUtil.format(
        {
            ...parsed,
            search: undefined, // this allows to merge parameters correctly
            query: {
                ...parsed.query,

                service: "WMS",
                version: "1.1.1",
                layers: name,
                outputFormat: 'application/json',
                request: "DescribeLayer"
            }
        });
};
const describeLayer = l => Observable.defer( () => axios.get(toDescribeLayerURL(l))).let(interceptOGCError);
const getLayerCapabilities = l => Observable.defer(() => WMS.getCapabilities(LayersUtils.getCapabilitiesUrl(l)))
    .let(interceptOGCError)
    .map(c => WMS.parseLayerCapabilities(c, l));

module.exports = {
    getLayerCapabilities,
    describeLayer,
    addSearch: l =>
        describeLayer(l)
            .map( ({data = {}}) => data && data.layerDescriptions[0])
            .map(({owsURL} = {}) => ({
                ...l,
                params: {}, // TODO: if needed, clean them up
                search: owsURL ? {
                    type: "wfs",
                    url: SecurityUtils.cleanAuthParamsFromURL(owsURL)
                } : undefined
            })),
    getNativeCrs: (layer) => Observable.of(layer).filter(({nativeCrs}) => !nativeCrs)
        .switchMap((l) => {
            return getLayerCapabilities(l)
                .switchMap((layerCapability = {}) => {
                    const nativeCrs = head(layerCapability.crs) || "EPSG:3587";
                    if (!CoordinatesUtils.determineCrs(nativeCrs)) {
                        const EPSG = nativeCrs.split(":").length === 2 ? nativeCrs.split(":")[1] : "3857";
                        return Observable.fromPromise(CoordinatesUtils.fetchProjRemotely(nativeCrs, CoordinatesUtils.getProjUrl(EPSG))
                            .then(res => {
                                proj4.defs(nativeCrs, res.data);
                                return nativeCrs;
                            }));
                    }
                    return Observable.of(nativeCrs);
                });
        })

};
