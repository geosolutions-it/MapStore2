/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { getCurrentResolution } from '../MapUtils';
import { reproject, getProjectedBBox, reprojectBbox, fitBoundsToProjectionExtent } from '../CoordinatesUtils';
import { isObject, isNil, trimEnd } from 'lodash';
import axios from '../../libs/ajax';
import { esriToGeoJSONFeature, getQueryLayerIds, isFeatureServerUrl } from '../ArcGISUtils';

export default {
    buildRequest: (layer, { point, map, currentLocale } = {}) => {
        const heightBBox = 16;
        const widthBBox = 16;
        const size = [heightBBox, widthBBox];
        const rotation = 0;
        const resolution = isNil(map.resolution)
            ? getCurrentResolution(Math.ceil(map.zoom), 0, 21, 96)
            : map.resolution;
        const wrongLng = point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        const lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = { x: lngCorrected, y: point.latlng.lat };
        const centerProjected = reproject(center, 'EPSG:4326', map.projection);
        const bounds = fitBoundsToProjectionExtent(
            getProjectedBBox(centerProjected, resolution, rotation, size, null),
            map.projection
        );
        const bounds4326 = reprojectBbox(bounds, map.projection, 'EPSG:4326');
        return {
            request: {
                outputFormat: 'application/json',
                bounds: bounds4326
            },
            metadata: {
                title: isObject(layer.title)
                    ? layer.title[currentLocale] || layer.title.default
                    : layer.title
            },
            url: trimEnd(layer.url, '/')
        };
    },
    getIdentifyFlow: (layer, baseURL, { bounds } = {}) => {
        const isFeatureServer = isFeatureServerUrl(baseURL);

        if (isFeatureServer) {
            const layerId = layer.name !== undefined ? `${layer.name}` : '0';
            const params = {
                f: 'geojson',
                geometry: bounds.join(','),
                geometryType: 'esriGeometryEnvelope',
                spatialRel: 'esriSpatialRelIntersects',
                inSR: 4326,
                outSR: 4326,
                outFields: '*'
            };
            return Observable.defer(() =>
                axios.get(`${baseURL}/${layerId}/query`, { params })
                    .then((response) => ({
                        data: {
                            crs: 'EPSG:4326',
                            features: response?.data?.features || []
                        }
                    }))
            );
        }

        const params = {
            f: 'json',
            geometry: bounds.join(','),
            inSR: 4326,
            outSR: 4326,
            outFields: '*'
        };
        const layerIds = layer.name !== undefined
            ? getQueryLayerIds(layer.name, layer?.options?.layers || [])
            : layer.options.layers.map(({ id }) => id);
        return Observable.defer(() =>
            Promise.all(
                layerIds.map((layerId) =>
                    axios.get(`${baseURL}/${layerId}/query`, { params })
                        .then((response) => {
                            return (response?.data?.features || []).map(esriToGeoJSONFeature);
                        })
                )
            ).then((features) => {
                return {
                    data: {
                        crs: 'EPSG:4326',
                        features: features.flat()
                    }
                };
            })
        );
    }
};
