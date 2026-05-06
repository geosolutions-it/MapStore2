/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';

import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import {
    getStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from  '../../../../utils/cesium/GeoJSONStyledFeatures';
import { createVectorFeatureFilter } from '../../../../utils/FilterUtils';
import { updateUrlParams } from '../../../../utils/URLUtils';
import { getRequestConfigurationByUrl } from '../../../../utils/SecurityUtils';

import {
    FGB_LAYER_TYPE,
    FGB_MATCH_ALL_RECT,
    FGB_FEATURE_BATCH_SIZE,
    FGB_STREAM_FLUSH_INTERVAL,
    getFlatGeobufGeojson,
    createFlatGeobufGeometryTypeResolver
} from '../../../../api/FlatGeobuf';
import {
    getFlatGeobufGeometryTypeFromOptions,
    getFlatGeobufCrsFromOptions,
    fgbRectContains
} from '../../../../utils/FlatGeobufLayerUtils';

/**
 * Yield to the browser every FGB_FEATURE_BATCH_SIZE features to allow the renderer to update
 * without blocking the interface during loading
 */
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

// Resolve and apply the cesium style function for an FGB layer. Pulled out
// of createLayer so the update handler can reapply on a style-only change
// without recreating the layer (and refetching all features). Reads only
// its arguments, no closure capture.
const applyFlatGeobufStyle = (options, styledFeatures, inferredGeometryType) => {
    if (!styledFeatures) {
        return Promise.resolve();
    }
    const geometryType = getFlatGeobufGeometryTypeFromOptions(options) || inferredGeometryType;
    const styledLayer = applyDefaultStyleToVectorLayer({ ...options, geometryType, features: [] });
    return getStyle(styledLayer, 'cesium').then((styleFunc) => {
        if (styleFunc) {
            styledFeatures.setStyleFunction(styleFunc);
        }
    });
};

const createLayer = (options, map) => {

    if (!options.visibility) {
        return {
            detached: true,
            remove: () => {}
        };
    }

    const vectorFeatureFilter = createVectorFeatureFilter(options);

    let styledFeatures = new GeoJSONStyledFeatures({
        map: map,
        features: [],
        id: options?.id,
        opacity: options.opacity,
        queryable: options.queryable === undefined || options.queryable,
        featureFilter: vectorFeatureFilter
    });

    let activeLoad = null;
    let inferredGeometryType;
    let loadedEverything = false;
    const loadedRects = [];
    const seenFeatureIds = new Set();

    /**
     * Geometry type: from config, FGB header, or first feature as fallback
     */
    const applyStyle = () => applyFlatGeobufStyle(options, styledFeatures, inferredGeometryType);

    function mapBbox() {
        const viewRectangle = map.camera.computeViewRectangle();
        const cameraPitch = Math.abs(Cesium.Math.toDegrees(map.camera.pitch));
        if (viewRectangle && cameraPitch > 60) {
            return {
                minX: Cesium.Math.toDegrees(viewRectangle.west),
                minY: Cesium.Math.toDegrees(viewRectangle.south),
                maxX: Cesium.Math.toDegrees(viewRectangle.east),
                maxY: Cesium.Math.toDegrees(viewRectangle.north)
            };
        }
        return null;
    }

    let loadingBboxBind;
    let initialStyleApplied = false;

    /**
     * Load features within the current camera bounding box.
     * rect so the whole file is fetched - subsequent camera moves are
     * still skipped because fgbRectContains(matchAll, anyBbox) is always true.
     */
    async function loadingBbox({ flatgeobuf }) {
        const dataProjection = getFlatGeobufCrsFromOptions(options);
        const rect = dataProjection === 'EPSG:4326' ? mapBbox() : FGB_MATCH_ALL_RECT;

        if (loadedEverything) {
            return;
        }
        if (rect && loadedRects.some(loaded => fgbRectContains(loaded, rect))) {
            return;
        }

        const myLoad = {};
        activeLoad = myLoad;

        // First-time only: apply a default style early so the layer has
        // something to draw with as soon as features arrive. The geometry
        // type may still be unknown; applyDefaultStyleToVectorLayer falls
        // back to 'GeometryCollection', which renders any geometry.
        if (!initialStyleApplied) {
            initialStyleApplied = true;
            applyStyle();
        }

        const { headers, params } = getRequestConfigurationByUrl(options.url, options?.security?.sourceId);
        const secureUrl = updateUrlParams(options.url, params);

        const resolver = createFlatGeobufGeometryTypeResolver(
            options,
            (geometryType) => {
                inferredGeometryType = geometryType;
                applyStyle();
            },
            () => inferredGeometryType
        );

        let batch = [];
        let lastFlush = Date.now();
        try {
            // 5th positional is `headers` (HeadersInit). The 3rd is
            // `headerMetaFn`. Earlier code passed headers as the 3rd which
            // both broke auth and could throw if headers was non-empty.
            const iterator = flatgeobuf.deserialize(secureUrl, rect, resolver.handleHeader, false, headers);
            for await (const feature of iterator) {
                if (activeLoad !== myLoad) {
                    return;
                }
                if (!resolver.reported) {
                    resolver.sniffFromFeature(feature?.geometry?.type);
                }
                if (feature?.id !== undefined && seenFeatureIds.has(feature.id)) {
                    continue;
                }
                if (feature?.id !== undefined) {
                    seenFeatureIds.add(feature.id);
                }
                batch.push(feature);
                if (batch.length >= FGB_FEATURE_BATCH_SIZE) {
                    styledFeatures.addFeatures(batch);
                    batch = [];
                    // Yield after every batch so requestAnimationFrame can fire
                    // and the browser stays responsive; yielding only at the
                    // FGB_STREAM_FLUSH_INTERVAL flush boundary leaves long uninterrupted CPU windows
                    // when batches arrive faster than the network roundtrip.
                    await yieldToEventLoop();
                }
                if (Date.now() - lastFlush > FGB_STREAM_FLUSH_INTERVAL) {
                    styledFeatures.flushPendingUpdate();
                    lastFlush = Date.now();
                }
            }
            if (activeLoad !== myLoad) {
                return;
            }
            if (batch.length) {
                styledFeatures.addFeatures(batch);
            }
            styledFeatures.flushPendingUpdate();
            if (rect) {
                loadedRects.push(rect);
            } else {
                loadedEverything = true;
            }
        } catch (e) {
            // Render whatever made it into the source; the rect isn't marked
            // loaded, so a later moveEnd will retry.
        } finally {
            if (activeLoad === myLoad) {
                activeLoad = null;
            }
        }
    }

    getFlatGeobufGeojson().then(async(flatgeobuf) => {
        loadingBboxBind = () => loadingBbox({ flatgeobuf });
        map.camera.moveEnd.addEventListener(loadingBboxBind);
        loadingBboxBind();
    });

    return {
        detached: true,
        // Accessors instead of direct refs so the update handler always
        // reads live closure state (styledFeatures is nulled on remove,
        // inferredGeometryType is set asynchronously by the resolver).
        getStyledFeatures: () => styledFeatures,
        getInferredGeometryType: () => inferredGeometryType,
        remove: () => {
            // Invalidate any in-flight load so its addFeatures calls become
            // no-ops on a destroyed instance.
            activeLoad = null;
            if (styledFeatures) {
                styledFeatures.destroy();
                styledFeatures = undefined;
            }
            if (loadingBboxBind) {
                map.camera.moveEnd.removeEventListener(loadingBboxBind);
            }
        }
    };
};

Layers.registerType(FGB_LAYER_TYPE, {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (!isEqual(newOptions.features, oldOptions.features)) {
            return createLayer(newOptions, map);
        }
        const styledFeatures = layer?.getStyledFeatures?.();
        const styleChanged = !isEqual(newOptions.style, oldOptions.style)
            || newOptions.styleName !== oldOptions.styleName;
        // Style-only change: reapply on the existing GeoJSONStyledFeatures
        // instead of recreating the layer (which would refetch every feature).
        if (styleChanged && styledFeatures) {
            applyFlatGeobufStyle(newOptions, styledFeatures, layer.getInferredGeometryType());
        }
        return null;
    }
});
