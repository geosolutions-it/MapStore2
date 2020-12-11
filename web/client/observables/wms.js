/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import urlUtil from 'url';

import { head } from 'lodash';
import Proj4js from 'proj4';
import { Observable } from 'rxjs';

import WMS from '../api/WMS';
import axios from '../libs/ajax';
import { determineCrs, fetchProjRemotely, getProjUrl } from '../utils/CoordinatesUtils';
import { getCapabilitiesUrl } from '../utils/LayersUtils';
import { interceptOGCError } from '../utils/ObservableUtils';
import { cleanAuthParamsFromURL } from '../utils/SecurityUtils';

const proj4 = Proj4js;

export const toDescribeLayerURL = ({name, search = {}, url} = {}) => {
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
export const describeLayer = l => Observable.defer( () => axios.get(toDescribeLayerURL(l))).let(interceptOGCError);
export const getLayerCapabilities = l => Observable.defer(() => WMS.getCapabilities(getCapabilitiesUrl(l)))
    .let(interceptOGCError)
    .map(c => WMS.parseLayerCapabilities(c, l));

export const addSearch = l =>
    describeLayer(l)
        .map( ({data = {}}) => data && data.layerDescriptions[0])
        .map(({owsURL} = {}) => ({
            ...l,
            params: {}, // TODO: if needed, clean them up
            search: owsURL ? {
                type: "wfs",
                url: cleanAuthParamsFromURL(owsURL)
            } : undefined
        }));
export const getNativeCrs = (layer) => Observable.of(layer).filter(({nativeCrs}) => !nativeCrs)
    .switchMap((l) => {
        return getLayerCapabilities(l)
            .switchMap((layerCapability = {}) => {
                const nativeCrs = head(layerCapability.crs) || "EPSG:3587";
                if (!determineCrs(nativeCrs)) {
                    const EPSG = nativeCrs.split(":").length === 2 ? nativeCrs.split(":")[1] : "3857";
                    return Observable.fromPromise(fetchProjRemotely(nativeCrs, getProjUrl(EPSG))
                        .then(res => {
                            proj4.defs(nativeCrs, res.data);
                            return nativeCrs;
                        }));
                }
                return Observable.of(nativeCrs);
            });
    });


export default {
    getLayerCapabilities,
    describeLayer,
    addSearch,
    getNativeCrs
};
