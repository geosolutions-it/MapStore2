/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import isNumber from 'lodash/isNumber';

const METERS_PER_DEGREES = 111194.87428468118;
export const MAP_VIEWS_LAYERS_OWNER = 'MAP_VIEWS_LAYERS_OWNER';
export const DefaultViewValues = {
    DURATION: 10,
    TRANSLUCENCY_NEAR_DISTANCE: 500,
    TRANSLUCENCY_FAR_DISTANCE: 5000,
    TRANSLUCENCY_OPACITY: 0.5,
    MASK_OFFSET: 10000
};
export const ViewSettingsTypes = {
    DESCRIPTION: 'description',
    POSITION: 'position',
    NAVIGATION: 'navigation',
    MASK: 'mask',
    GLOBE_TRANSLUCENCY: 'globeTranslucency',
    LAYERS_OPTIONS: 'layersOptions'
};

const getFeatureFromBbox = (bbox, offset = 0) => {
    const [minx, miny, maxx, maxy] = bbox;
    const offsetDeg = offset / METERS_PER_DEGREES;
    const oMinx = minx - offsetDeg;
    const oMiny = miny - offsetDeg;
    const oMaxx = maxx + offsetDeg;
    const oMaxy = maxy + offsetDeg;
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [oMinx, oMiny],
                    [oMinx, oMaxy],
                    [oMaxx, oMaxy],
                    [oMaxx, oMiny],
                    [oMinx, oMiny]
                ]
            ]

        },
        properties: {}
    };
};

export const createInverseMaskFromPolygonFeatureCollection = (collection, { offset = 0 } = {}) => {
    return Promise.all([
        import('@turf/difference'),
        import('@turf/bbox')
    ])
        .then(([modDifference, modBbox]) => {
            const turfDifference = modDifference.default;
            const turfBbox = modBbox.default;
            const bbox = turfBbox(collection);
            const bboxPolygon = getFeatureFromBbox(bbox, offset);
            const features = [
                bboxPolygon,
                ...collection.features
                    .filter(({ geometry }) => geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon')
            ];
            const difference = features.length > 1
                ? features.reduce((previous, current) => turfDifference(previous, current))
                : bboxPolygon;
            return {
                type: 'FeatureCollection',
                features: [difference].filter(feature => !!feature)
            };
        });
};

export const mergeViewLayers = (layers, { layers: viewLayers = [] } = {}) => {
    if (viewLayers.length === 0) {
        return layers || [];
    }
    return (layers || []).map((layer) => {
        const viewLayer = viewLayers.find(vLayer => vLayer.id === layer.id);
        if (viewLayer) {
            return { ...layer, ...viewLayer, changed: true };
        }
        return layer;
    });
};

export const formatClippingFeatures = (features) => {
    return features
        ? features
            .filter(({ geometry }) => geometry.type === 'Polygon')
            .map((feature, idx) => ({ ...feature, id: isNumber(feature?.id) ? `Feature ${feature?.id}` : feature?.id || `Feature ${idx + 1}` }))
        : undefined;
};

export const ZOOM_TO_HEIGHT = 80000000;

export const getZoomFromHeight = (height) => Math.log2(ZOOM_TO_HEIGHT / height) + 1;
export const getHeightFromZoom = (zoom) => ZOOM_TO_HEIGHT / Math.pow(2, zoom - 1);
