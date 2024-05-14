/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import {getCurrentResolution} from '../MapUtils';
import {reproject, getProjectedBBox, normalizeSRS} from '../CoordinatesUtils';
import {getLayerUrl} from '../LayersUtils';
import {isObject, isNil} from 'lodash';
import { optionsToVendorParams } from '../VendorParamsUtils';
import { generateEnvString } from '../LayerLocalizationUtils';
import axios from '../../libs/ajax';

export default {
    buildRequest: (layer, { point, map, currentLocale } = {}) => {
        const heightBBox = 101;
        const widthBBox = 101;
        const size = [heightBBox, widthBBox];
        const rotation = 0;
        const resolution = isNil(map.resolution)
            ? getCurrentResolution(Math.ceil(map.zoom), 0, 21, 96)
            : map.resolution;
        let wrongLng = point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        let lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = {x: lngCorrected, y: point.latlng.lat};
        let centerProjected = reproject(center, 'EPSG:4326', map.projection);
        let bounds = getProjectedBBox(centerProjected, resolution, rotation, size, null);
        const { features = [] } = point?.intersectedFeatures?.find(({ id }) => id === layer.id) || {};
        return {
            request: {
                features: [...features],
                outputFormat: 'application/json',
                point,
                bounds,
                map
            },
            metadata: {
                title: isObject(layer.title)
                    ? layer.title[currentLocale] || layer.title.default
                    : layer.title
            },
            url: 'client'
        };
    },
    getIdentifyFlow: (layer, baseURL, { features = [], point, map } = {}) => {
        return Observable.defer(() => axios.post(`${layer.url}/${layer.name}/query`, null, {
            params: {
                f: 'geojson',
                geometry: `${point.rawPos[0]},${point.rawPos[1]}`,
                geometryType: 'esriGeometryPoint',
                inSR: map.projection
            }
        }).then((response) => {
            return {
                data: {
                    features: response?.data?.features || []
                }
            };
        }).catch(() => {

            return {
                data: {
                    features
                }
            };
        }));
    }
};
