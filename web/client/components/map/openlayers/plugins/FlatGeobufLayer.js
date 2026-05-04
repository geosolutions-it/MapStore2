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
    getFlatGeobufGeojson,
    createFlatGeobufGeometryTypeResolver
} from '../../../../api/FlatGeobuf';
import { getFlatGeobufGeometryTypeFromOptions } from '../../../../utils/FlatGeobufLayerUtils';
import { getRequestConfigurationByUrl } from '../../../../utils/SecurityUtils';
import { updateUrlParams } from '../../../../utils/URLUtils';

const FGB_INFERRED_GEOMETRY_TYPE_KEY = '_fgbInferredGeometryType';

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

// Yield to the event loop every N features so the OpenLayers renderer gets a
// requestAnimationFrame slot to paint progress. flatgeobuf batches features
// within ~256KB into a single HTTP range request, so without this yielding the
// for-await runs entirely in microtasks and the layer only paints once the
// whole batch has been added.
const FEATURE_YIELD_BATCH = 200;
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

const FGB_DATA_PROJECTION = 'EPSG:4326';

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

// Drain an async iterator of GeoJSON features, adding each as an OL feature
// to `source`. Yields back to the event loop every FEATURE_YIELD_BATCH
// features so the renderer gets a requestAnimationFrame slot to paint
// progress. Promise-constructor wrapping a recursive step lets us keep the
// loader promise-based without for-await-of.
const consumeFeatureIterator = (iterator, geoJsonFormat, source, loaded, resolver) => new Promise((resolve, reject) => {
    let counter = 0;
    const step = () => {
        iterator.next().then(({ value: geoJsonFeature, done }) => {
            if (done) {
                resolve();
                return;
            }
            const olFeature = geoJsonFormat.readFeature(geoJsonFeature);
            source.addFeature(olFeature);
            loaded.push(olFeature);
            counter += 1;
            // Header may declare Unknown (0) for heterogeneous datasets;
            // sniff the first feature's geometry type as a fallback.
            if (!resolver.reported) {
                resolver.sniffFromFeature(geoJsonFeature?.geometry?.type);
            }
            if (counter % FEATURE_YIELD_BATCH === 0) {
                yieldToEventLoop().then(step);
            } else {
                step();
            }
        }).catch(reject);
    };
    step();
});

const createLoader = (source, options, getLayer, map) => (extent, resolution, projection, success, failure) => {
    const featureProjCode = projection.getCode();
    // Use the geojson flavor (not the ol flavor): flatgeobuf-ol pulls a
    // separate copy of OL into node_modules/flatgeobuf/node_modules/ol,
    // and that copy has its own projection cache that doesn't share
    // registrations with MapStore's ol. Transforms fail for any CRS
    // registered after startup (dynamic projections). The geojson
    // flavor returns plain GeoJSON; we convert via MapStore's own
    // ol/format/GeoJSON, which uses MapStore's projection cache.
    return getFlatGeobufGeojson().then((flatgeobuf) => {
        const { headers, params } = getRequestConfigurationByUrl(options.url, options?.security?.sourceId);
        const secureUrl = updateUrlParams(options.url, params);

        const dataExtent = featureProjCode !== FGB_DATA_PROJECTION
            ? olTransformExtent(extent, featureProjCode, FGB_DATA_PROJECTION)
            : extent;
        const rect = {
            minX: dataExtent[0],
            minY: dataExtent[1],
            maxX: dataExtent[2],
            maxY: dataExtent[3]
        };

        const geoJsonFormat = new GeoJSON({
            dataProjection: FGB_DATA_PROJECTION,
            featureProjection: featureProjCode
        });

        const resolver = createFlatGeobufGeometryTypeResolver(
            options,
            createOnGeometryTypeDetected(getLayer, options, map),
            () => getLayer()?.get?.(FGB_INFERRED_GEOMETRY_TYPE_KEY)
        );

        const loaded = [];
        const iterator = flatgeobuf.deserialize(secureUrl, rect, resolver.handleHeader, false, headers);
        return consumeFeatureIterator(iterator, geoJsonFormat, source, loaded, resolver)
            .then(() => success?.(loaded));
    }).catch((e) => {
        // surface failures (proj4 transform errors for unregistered CRS,
        // network errors, malformed FGB) so they don't disappear silently
        // when OL invokes the loader.
        // eslint-disable-next-line no-console
        console.warn('[FlatGeobufLayer] load failed:', e);
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

        // CRS change: do NOT transform features in place. OL's geometry.transform
        // requires both CRS to be registered in proj4 at this exact moment, which
        // breaks for dynamic projections that get registered asynchronously by
        // initOLProjectionAdapter. Instead, drop and refetch; the loader runs
        // FGB (EPSG:4326) to view CRS each call, and 4326 is always registered.
        // Reload also covers URL/security/params changes; rebuild the loader so
        // it captures the new options.
        if (crsChanged || reload) {
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
