/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isUndefined, omitBy, isNumber, isObject } from 'lodash';

const METERS_PER_DEGREES = 111194.87428468118;

export const MAP_VIEWS_CONFIG_KEY = 'mapViews';
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
    ANIMATION: 'animation',
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
/**
 * create an inverse GeoJSON layer given a GeoJSON input with Polygon or MultiPolygon geometries
 * @param {object} collection feature collection
 * @param {object} options available options
 * @param {number} options.offset offset in meter
 */
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
/**
 * merge the configuration of view layers in the main layers array
 * @param {array} layers array of layer object
 * @param {object} view map view configuration
 */
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
/**
 * detect if a view layer is different from the map layers
 * @param {object} viewLayer layer object
 * @param {object} mapLayer layer object
 */
export const isViewLayerChanged = (viewLayer, mapLayer) => {
    return viewLayer.visibility !== mapLayer.visibility
    || viewLayer.opacity !== mapLayer.opacity
    || viewLayer.clippingLayerResourceId !== mapLayer.clippingLayerResourceId
    || viewLayer.clippingPolygonFeatureId !== mapLayer.clippingPolygonFeatureId
    || viewLayer.clippingPolygonUnion !== mapLayer.clippingPolygonUnion;
};
/**
 * pick view layer properties
 * @param {object} node layer object
 */
export const pickViewLayerProperties = (node) => {
    return omitBy({
        id: node.id,
        visibility: node.visibility,
        opacity: node.opacity,
        clippingLayerResourceId: node.clippingLayerResourceId,
        clippingPolygonFeatureId: node.clippingPolygonFeatureId,
        clippingPolygonUnion: node.clippingPolygonUnion
    }, isUndefined);
};
/**
 * pick view group properties
 * @param {object} node group object
 */
export const pickViewGroupProperties = (node) => {
    return omitBy({
        id: node.id,
        visibility: node.visibility
    }, isUndefined);
};
/**
 * merge the configuration of view groups in the main groups array
 * @param {array} rawGroups array of group object
 * @param {object} view map view configuration
 * @param {boolean} recursive apply recursive merge instead of flat one
 */
export const mergeViewGroups = (groups, { groups: viewGroups = [] } = {}, recursive) => {
    if (viewGroups.length === 0) {
        return groups || [];
    }
    if (recursive) {
        const recursiveMerge = (nodes) => {
            return nodes.map((node) => {
                if (isObject(node)) {
                    const viewGroup = viewGroups.find(vGroup => vGroup.id === node.id);
                    return {
                        ...node,
                        ...viewGroup,
                        ...(node.nodes && { nodes: recursiveMerge(node.nodes) }),
                        changed: true
                    };
                }
                return node;
            });
        };
        return recursiveMerge(groups || []);
    }
    return (groups || []).map((group) => {
        const viewGroup = viewGroups.find(vGroup => vGroup.id === group.id);
        if (viewGroup) {
            return { ...group, ...viewGroup, changed: true };
        }
        return group;
    });
};
/**
 * Exclude all geometry but polygons and ensure each feature has an identifier
 * @param {array} features array of GeoJSON features
 */
export const formatClippingFeatures = (features) => {
    return features
        ? features
            .filter(({ geometry }) => geometry.type === 'Polygon')
            .map((feature, idx) => ({
                ...feature,
                geometry: {
                    type: 'Polygon',
                    // remove height because is not needed for clipping
                    coordinates: feature.geometry.coordinates.map((rings) => rings.map(([lng, lat]) => [lng, lat]))
                },
                id: isNumber(feature?.id) ? `Feature ${feature?.id}` : feature?.id || `Feature ${idx + 1}`
            }))
        : undefined;
};

export const ZOOM_TO_HEIGHT = 80000000;
/**
 * convert height to zoom level
 * @param {number} height height in meter
 */
export const getZoomFromHeight = (height) => Math.log2(ZOOM_TO_HEIGHT / height) + 1;
/**
 * convert zoom level to height
 * @param {number} zoom zoom level
 */
export const getHeightFromZoom = (zoom) => ZOOM_TO_HEIGHT / Math.pow(2, zoom - 1);
/**
 * clean the current state of the map views before using it in the saving process
 * @param {object} payload current map views state
 * @param {array} layers layers available inside a map
 */
export const cleanMapViewSavedPayload = ({ views, resources, ...payload }, layers = []) => {
    const newViews = views?.map((view) => {
        if (view?.layers?.length > 0) {
            return {
                ...view,
                layers: view.layers.filter(viewLayer => !!layers.find(layer => layer.id === viewLayer.id))
            };
        }
        return view;
    });
    const newResources = resources?.filter((resource) => {
        const isUsedByView = !!newViews?.find((view) =>
            view?.mask?.resourceId === resource.id
            || view?.terrain?.clippingLayerResourceId === resource.id
            || view?.layers?.find(layer => layer?.clippingLayerResourceId === resource.id));
        return isUsedByView;
    }).map((resource) => {
        // we should store the feature collection
        // if the layer is vector and is not possible to find the original layer in map config
        // so we persist the mask or clipping resource
        if (resource?.data?.type === 'vector' && !layers.find(layer => layer.id === resource?.data?.id)) {
            return resource;
        }
        const { collection, ...data } = resource?.data;
        return {
            ...resource,
            data
        };
    });
    return {
        ...payload,
        views: newViews,
        resources: newResources
    };
};
