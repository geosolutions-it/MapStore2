/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isEqual from 'lodash/isEqual';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { bbox, all, tile } from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';
import GeoJSON from 'ol/format/GeoJSON';

import { getStyle } from '../VectorStyle';
import Layers from '../../../../utils/openlayers/Layers';
import { reprojectBbox } from '../../../../utils/CoordinatesUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import { fetchFeatureLayerCollection } from '../../../../api/ArcGIS';

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
    const strategy = getEffectiveStrategy(options);
    const params = {};
    if (strategy === 'bbox' || strategy === 'tile') {
        const [xmin, ymin, xmax, ymax] = reprojectBbox(extent, projCode, 'EPSG:4326');
        params.geometry = `${xmin},${ymin},${xmax},${ymax}`;
        params.geometryType = 'esriGeometryEnvelope';
        params.spatialRel = 'esriSpatialRelIntersects';
        params.inSR = 4326;
    }
    fetchFeatureLayerCollection(options.url, options.name, {
        params,
        authSourceId: options.security?.sourceId,
        maxRecordCount: options.maxRecordCount
    })
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
