/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import isEqual from 'lodash/isEqual';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { transformExtent as olTransformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import Layers from '../../../../utils/openlayers/Layers';
import {bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import { getStyle } from '../VectorStyle';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import {
    FGB_LAYER_TYPE,
    FGB_FEATURE_BATCH_SIZE,
    getFlatGeobufGeojson,
    createFlatGeobufGeometryTypeResolver
} from '../../../../api/FlatGeobuf';
import {
    getFlatGeobufGeometryTypeFromOptions,
    getFlatGeobufCrsFromOptions,
    toFgbRect
} from '../../../../utils/FlatGeobufLayerUtils';
import { getRequestConfigurationByUrl } from '../../../../utils/SecurityUtils';
import { updateUrlParams } from '../../../../utils/URLUtils';

const FGB_INFERRED_GEOMETRY_TYPE_KEY = `_${FGB_LAYER_TYPE}_InferredGeometryType`;

const getFlatGeobufStyle = (layer, options, map) => {
    const geometryType = getFlatGeobufGeometryTypeFromOptions(options)
        || layer?.get?.(FGB_INFERRED_GEOMETRY_TYPE_KEY);
    return getStyle(
        applyDefaultStyleToVectorLayer({
            ...options,
            geometryType,
            features: [],
            asPromise: true
        })
    )
        .then((style) => {
            if (style) {
                if (style.__geoStylerStyle) {
                    style({ map, features: [] })
                        .then((olStyle) => {
                            layer.setStyle(olStyle);
                        });
                } else {
                    layer.setStyle(style);
                }
            }
        });
};

/**
 * Yield to the browser every FGB_FEATURE_BATCH_SIZE features to allow the renderer to update
 * without blocking the interface during loading
 */
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

const updateStyle = (layer, options, map) => getFlatGeobufStyle(layer, options, map);

const createOnGeometryTypeDetected = (getLayer, options, map) => (geometryType) => {
    const layer = getLayer();
    if (!layer || !geometryType) {
        return;
    }
    if (layer.get(FGB_INFERRED_GEOMETRY_TYPE_KEY) === geometryType) {
        return;
    }
    layer.set(FGB_INFERRED_GEOMETRY_TYPE_KEY, geometryType);
    updateStyle(layer, options, map);
};

// Load-session counter on the ol source. Each loader captures the current
// session at start and bails if it changes. Only the update handler bumps it
// on CRS/data-source changes, so concurrent pans don't cancel each other.
const FGB_LOAD_SESSION_KEY = `_${FGB_LAYER_TYPE}_LoadSession`;
const getLoadSession = (source) => source.get(FGB_LOAD_SESSION_KEY) || 0;
const bumpLoadSession = (source) => source.set(FGB_LOAD_SESSION_KEY, getLoadSession(source) + 1);

/**
 * Consume async iterator of GeoJSON features, add to source, yield every FGB_FEATURE_BATCH_SIZE
 */
const consumeFeatureIterator = (iterator, geoJsonFormat, source, loaded, resolver, isCancelled) => new Promise((resolve, reject) => {
    let counter = 0;
    const step = () => {
        if (isCancelled()) {
            iterator.return?.();
            resolve();
            return;
        }
        iterator.next().then(({ value: geoJsonFeature, done }) => {
            if (done || isCancelled()) {
                if (isCancelled()) {
                    iterator.return?.();
                }
                resolve();
                return;
            }
            const olFeature = geoJsonFormat.readFeature(geoJsonFeature);
            source.addFeature(olFeature);
            loaded.push(olFeature);
            counter += 1;
            // Header may declare Unknown (0) for heterogeneous geometries;
            // sniff the first feature's geometry type as a fallback.
            if (!resolver.reported) {
                resolver.sniffFromFeature(geoJsonFeature?.geometry?.type);
            }
            if (counter % FGB_FEATURE_BATCH_SIZE === 0) {
                yieldToEventLoop().then(step);
            } else {
                step();
            }
        }).catch(reject);
    };
    step();
});

/**
 * Use geojson flavor (not ol flavor): avoids projection cache conflicts
 * with dynamic CRS. Capture session at load start; update handler bumps
 * it on context changes so stale streams don't corrupt loadedExtents.
 */
const createLoader = (source, options, getLayer, map) => (extent, resolution, projection, success, failure) => {
    const featureProjCode = projection.getCode();
    const mySession = getLoadSession(source);
    const isCancelled = () => getLoadSession(source) !== mySession;

    return getFlatGeobufGeojson().then((flatgeobuf) => {
        if (isCancelled()) {
            return null;
        }
        const { headers, params } = getRequestConfigurationByUrl(options.url, options?.security?.sourceId);
        const secureUrl = updateUrlParams(options.url, params);

        // FGB header CRS or fallback to EPSG:4326
        const dataProjection = getFlatGeobufCrsFromOptions(options);

        const dataExtent = featureProjCode !== dataProjection
            ? olTransformExtent(extent, featureProjCode, dataProjection)
            : extent;
        const rect = toFgbRect(dataExtent);

        const geoJsonFormat = new GeoJSON({
            dataProjection,
            featureProjection: featureProjCode
        });

        const resolver = createFlatGeobufGeometryTypeResolver(
            options,
            createOnGeometryTypeDetected(getLayer, options, map),
            () => getLayer()?.get?.(FGB_INFERRED_GEOMETRY_TYPE_KEY)
        );

        const loaded = [];
        const iterator = flatgeobuf.deserialize(secureUrl, rect, resolver.handleHeader, false, headers);
        return consumeFeatureIterator(iterator, geoJsonFormat, source, loaded, resolver, isCancelled)
            .then(() => {
                if (!isCancelled()) {
                    success?.(loaded);
                }
            });
    }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[FGB] loader error', err);
        failure?.();
    });
};

const createLayer = (options, map) => {

    const strategy = bboxStrategy;

    const source = new VectorSource({
        strategy
    });

    let layer;
    const getLayer = () => layer;

    source.setLoader(createLoader(source, options, getLayer, map));

    layer = new VectorLayer({
        msId: options.id,
        source: source,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        opacity: options.opacity,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
    });

    updateStyle(layer, options, map);

    return layer;
};

const needsReload = (oldOptions, newOptions) =>
    oldOptions.url !== newOptions.url
    || !isEqual(oldOptions.security, newOptions.security)
    || !isEqual(oldOptions.params, newOptions.params)
    || oldOptions.requestRuleRefreshHash !== newOptions.requestRuleRefreshHash;

Layers.registerType(FGB_LAYER_TYPE, {
    create: createLayer,
    update: (layer, newOptions = {}, oldOptions = {}, map) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = newOptions.crs || newOptions.srs || 'EPSG:3857';
        const source = layer.getSource();
        const crsChanged = newCrs !== oldCrs;
        const reload = needsReload(oldOptions, newOptions);

        // CRS change: drop and refetch instead of transforming in place.
        // Dynamic projections may not be registered yet. Reload also covers
        // URL/security/params changes; rebuild the loader to capture new options.
        if (crsChanged || reload) {
            bumpLoadSession(source);
            if (reload) {
                source.setLoader(createLoader(source, newOptions, () => layer, map));
            }
            source.clear();
            source.refresh();
        }

        if (
            !isEqual(oldOptions.style, newOptions.style)
            || oldOptions.styleName !== newOptions.styleName
        ) {
            updateStyle(layer, newOptions, map);
        }

        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution ?? 0);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution ?? Infinity);
        }

        return null;
    }
});
