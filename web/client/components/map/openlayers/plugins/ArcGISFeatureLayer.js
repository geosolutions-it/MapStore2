/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isEqual from 'lodash/isEqual';
import trimEnd from 'lodash/trimEnd';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { bbox, all, tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import GeoJSON from 'ol/format/GeoJSON';

import { getStyle } from '../VectorStyle';
import Layers from '../../../../utils/openlayers/Layers';
import axios from '../../../../libs/ajax';
import { reprojectBbox } from '../../../../utils/CoordinatesUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';

const buildQueryUrl = (options) => {
    const baseUrl = trimEnd(options.url, '/');
    const layerId = options.name !== undefined ? options.name : '0';
    return `${baseUrl}/${layerId}/query`;
};

const DEFAULT_PAGE_SIZE = 1000;

const fetchPaginatedFeatures = (url, baseParams, authSourceId, pageSize) => {
    const recordCount = pageSize || DEFAULT_PAGE_SIZE;
    const allFeatures = [];
    const seenIds = new Set();
    const fetchPage = (offset) => {
        return axios.get(url, {
            params: {
                ...baseParams,
                resultOffset: offset,
                resultRecordCount: recordCount
            },
            _msAuthSourceId: authSourceId
        }).then(response => {
            const data = response?.data;
            const newFeatures = (data?.features || []).filter(f => {
                const id = f.id ?? f.properties?.OBJECTID;
                if (id !== null && id !== undefined && seenIds.has(id)) return false;
                if (id !== null && id !== undefined) seenIds.add(id);
                return true;
            });
            if (newFeatures.length) {
                allFeatures.push(...newFeatures);
            }
            const exceeded = data?.exceededTransferLimit
                || data?.properties?.exceededTransferLimit;
            if (exceeded && newFeatures.length > 0) {
                return fetchPage(offset + (data?.features?.length || 0));
            }
            return {
                type: 'FeatureCollection',
                features: allFeatures
            };
        }).catch(() => ({
            type: 'FeatureCollection',
            features: allFeatures
        }));
    };
    return fetchPage(0);
};

const getStrategy = (options) => {
    if (options.strategy === 'all') {
        return all;
    }
    if (options.strategy === 'bbox') {
        return bbox;
    }
    return tile(createXYZ({ tileSize: options?.tileSize || 512 }));
};

const getEffectiveStrategy = (options) => options?.strategy || 'tile';

const createLoader = (source, options) => (extent, resolution, projection, success, failure) => {
    const projCode = projection.getCode();
    const params = {
        where: '1=1',
        outFields: '*',
        outSR: 4326,
        f: 'geojson'
    };
    const strategy = getEffectiveStrategy(options);
    if (strategy === 'bbox' || strategy === 'tile') {
        const bbox4326 = reprojectBbox(extent, projCode, 'EPSG:4326');
        const [xmin, ymin, xmax, ymax] = bbox4326;
        params.geometry = `${xmin},${ymin},${xmax},${ymax}`;
        params.geometryType = 'esriGeometryEnvelope';
        params.spatialRel = 'esriSpatialRelIntersects';
        params.inSR = 4326;
    }
    fetchPaginatedFeatures(
        buildQueryUrl(options),
        params,
        options.security?.sourceId,
        options.maxRecordCount
    )
        .then((collection) => {
            const features = source.getFormat().readFeatures(collection, {
                dataProjection: 'EPSG:4326',
                featureProjection: projCode
            });
            source.addFeatures(features);
            source.set('@featureCollection', collection);
            success(features);
            options.onLoadEnd && options.onLoadEnd();
        })
        .catch(() => {
            source.removeLoadedExtent(extent);
            failure();
        });
};

const getArcGISFeatureStyle = (layer, options, map) => {
    const collection = layer.getSource().get('@featureCollection') || {};
    return getStyle(
        applyDefaultStyleToVectorLayer({
            ...options,
            features: collection.features,
            asPromise: true
        })
    )
        .then((style) => {
            if (style) {
                if (style.__geoStylerStyle) {
                    style({ map, features: collection.features })
                        .then((olStyle) => layer.setStyle(olStyle));
                } else {
                    layer.setStyle(style);
                }
            }
        });
};

const updateStyle = (layer, options, map) => getArcGISFeatureStyle(layer, options, map);

Layers.registerType('arcgis-feature', {
    create: (options, map) => {
        const source = new VectorSource({
            strategy: getStrategy(options),
            format: new GeoJSON()
        });
        let layer;
        source.setLoader(
            createLoader(source, {
                ...options,
                onLoadEnd: () => updateStyle(layer, layer._msCurrentOptions || options, map)
            })
        );
        layer = new VectorLayer({
            msId: options.id,
            source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            opacity: options.opacity,
            minResolution: options.minResolution,
            maxResolution: options.maxResolution
        });
        layer._msCurrentOptions = options;
        updateStyle(layer, options, map);
        return layer;
    },
    update: (layer, options = {}, oldOptions = {}, map) => {
        layer._msCurrentOptions = options;
        const source = layer.getSource();
        if (!isEqual(oldOptions.security, options.security)
            || !isEqual(oldOptions.requestRuleRefreshHash, options.requestRuleRefreshHash)
            || oldOptions.strategy !== options.strategy
        ) {
            source.setLoader(createLoader(source, {
                ...options,
                onLoadEnd: () => updateStyle(layer, layer._msCurrentOptions || options, map)
            }));
            source.clear();
            source.refresh();
        }
        if (options.style !== oldOptions.style || options.styleName !== oldOptions.styleName) {
            updateStyle(layer, options, map);
        }
        if (oldOptions.minResolution !== options.minResolution) {
            layer.setMinResolution(options.minResolution === undefined ? 0 : options.minResolution);
        }
        if (oldOptions.maxResolution !== options.maxResolution) {
            layer.setMaxResolution(options.maxResolution === undefined ? Infinity : options.maxResolution);
        }
    },
    render: () => {
        return null;
    }
});
