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
    getFlatGeobufGeojson,
    createFlatGeobufGeometryTypeResolver
} from '../../../../api/FlatGeobuf';
import { getFlatGeobufGeometryTypeFromOptions } from '../../../../utils/FlatGeobufLayerUtils';

// Streaming cadence: how often during a single load to push accumulated
// features to the renderer so the user sees progress instead of a single
// render at the end.
const FEATURE_BATCH_SIZE = 200;
const STREAM_FLUSH_INTERVAL_MS = 500;
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

// FGB query rect: { minX, minY, maxX, maxY }; note the uppercase X/Y. The
// flatgeobuf library destructures these exact keys in streamSearch; lowercase
// keys silently produce a no-op filter (every feature matches), which causes
// the entire file to be downloaded instead of just the bbox-relevant features.
const rectContains = (outer, inner) =>
    outer && inner
    && outer.minX <= inner.minX && outer.maxX >= inner.maxX
    && outer.minY <= inner.minY && outer.maxY >= inner.maxY;

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

    // Geometry type used by applyDefaultStyleToVectorLayer; resolved from
    // (in order) the layer config, the FGB header on first load, or the
    // first loaded feature when the header is Unknown.
    let inferredGeometryType;

    // Loaded-extents cache + per-feature dedup so subsequent camera moves
    // don't re-fetch and re-add the same features.
    const loadedRects = [];
    let loadedEverything = false;
    const seenFeatureIds = new Set();

    // Token to abort an in-flight load when a newer one starts (the FGB
    // library doesn't expose AbortController; this is a cooperative cancel).
    let activeLoad = null;

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

    async function loadingBbox({ flatgeobuf }) {
        const rect = mapBbox();

        // Skip when we already have everything we'd need for this view.
        if (loadedEverything) {
            return;
        }
        if (rect && loadedRects.some(loaded => rectContains(loaded, rect))) {
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

        const { headers } = getRequestConfigurationByUrl(options.url, options?.security?.sourceId);
        const secureUrl = updateUrlParams(options.url, options.params);

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
                if (batch.length >= FEATURE_BATCH_SIZE) {
                    styledFeatures.addFeatures(batch);
                    batch = [];
                    // Yield after every batch so requestAnimationFrame can fire
                    // and the browser stays responsive; yielding only at the
                    // 500ms flush boundary leaves long uninterrupted CPU windows
                    // when batches arrive faster than the network roundtrip.
                    await yieldToEventLoop();
                }
                if (Date.now() - lastFlush > STREAM_FLUSH_INTERVAL_MS) {
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
        // Initial load; don't make the user nudge the camera before
        // anything appears.
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
