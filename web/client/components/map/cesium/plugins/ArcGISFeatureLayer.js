/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';

import Layers from '../../../../utils/cesium/Layers';
import {
    getStyle,
    layerToGeoStylerStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from '../../../../utils/cesium/GeoJSONStyledFeatures';
import TiledBillboardCollection from '../../../../utils/cesium/TiledBillboardCollection';
import { fetchFeatureLayerCollection } from '../../../../api/ArcGIS';

const getEffectiveStrategy = (options) => options?.strategy || 'tile';

const isPointGeometry = (options) => !options?.geometryType || ['Point', 'MultiPoint'].includes(options.geometryType);

const createLoader = (options) => {
    const strategy = getEffectiveStrategy(options);
    const callOptions = {
        authSourceId: options.security?.sourceId,
        maxRecordCount: options.maxRecordCount
    };
    if (strategy === 'bbox' || strategy === 'tile') {
        return (extent) => {
            const [xmin, ymin, xmax, ymax] = extent;
            return fetchFeatureLayerCollection(options.url, options.name, {
                ...callOptions,
                params: {
                    geometry: `${xmin},${ymin},${xmax},${ymax}`,
                    geometryType: 'esriGeometryEnvelope',
                    spatialRel: 'esriSpatialRelIntersects',
                    inSR: 4326
                }
            }).then((data) => ({ data }));
        };
    }
    return () => fetchFeatureLayerCollection(options.url, options.name, callOptions)
        .then((data) => ({ data }));
};

const applyStyle = (styledFeatures, options, features) => {
    layerToGeoStylerStyle(options)
        .then((style) => {
            getStyle(applyDefaultStyleToVectorLayer({
                ...options,
                features,
                style
            }), 'cesium')
                .then((styleFunc) => {
                    styledFeatures.setStyleFunction(styleFunc);
                });
        });
};

const createLayer = (options, map) => {
    if (!options.visibility) {
        return {
            detached: true,
            styledFeatures: undefined,
            remove: () => {}
        };
    }

    let styledFeatures;
    let loader;
    let loadingBbox;
    let bboxTimeout;
    let tiledPrimitive;
    let currentOptions = options;

    let loadCount = 0;
    let _layerRef = null;
    const notifyLoading = () => {
        if (loadCount === 0) {
            _layerRef?.loader?.onLayerLoading?.();
        }
        loadCount++;
    };
    const notifyLoaded = (error) => {
        loadCount--;
        if (loadCount === 0) {
            _layerRef?.loader?.onLayerLoad?.(error);
        }
    };

    const add = () => {
        const strategy = getEffectiveStrategy(currentOptions);
        loader = createLoader(currentOptions);

        if (strategy !== 'tile') {
            styledFeatures = new GeoJSONStyledFeatures({
                features: [],
                id: currentOptions?.id,
                map,
                opacity: currentOptions.opacity,
                queryable: currentOptions.queryable === undefined || currentOptions.queryable
            });
        }

        if (strategy === 'bbox') {
            loadingBbox = () => {
                if (bboxTimeout) {
                    clearTimeout(bboxTimeout);
                    bboxTimeout = undefined;
                }
                bboxTimeout = setTimeout(() => {
                    const viewRectangle = map.camera.computeViewRectangle();
                    const cameraPitch = Math.abs(Cesium.Math.toDegrees(map.camera.pitch));
                    if (viewRectangle && cameraPitch > 60) {
                        notifyLoading();
                        loader([
                            Cesium.Math.toDegrees(viewRectangle.west),
                            Cesium.Math.toDegrees(viewRectangle.south),
                            Cesium.Math.toDegrees(viewRectangle.east),
                            Cesium.Math.toDegrees(viewRectangle.north)
                        ])
                            .then(({ data: collection }) => {
                                styledFeatures.setFeatures(collection.features);
                                applyStyle(styledFeatures, currentOptions, collection.features);
                                notifyLoaded();
                            })
                            .catch(() => notifyLoaded({ error: true }));
                    }
                }, 300);
            };
            map.camera.moveEnd.addEventListener(loadingBbox);
        } else if (strategy === 'tile') {
            const tileLoadFn = (tileDef) => {
                notifyLoading();
                return loader([
                    Cesium.Math.toDegrees(tileDef.rectangle.west),
                    Cesium.Math.toDegrees(tileDef.rectangle.south),
                    Cesium.Math.toDegrees(tileDef.rectangle.east),
                    Cesium.Math.toDegrees(tileDef.rectangle.north)
                ]).then(({ data: collection }) => {
                    notifyLoaded();
                    return collection;
                }).catch((e) => {
                    notifyLoaded({ error: true });
                    throw e;
                });
            };

            tiledPrimitive = new TiledBillboardCollection({
                map,
                tileType: isPointGeometry(currentOptions) ? 'billboard' : 'feature',
                msId: currentOptions.id,
                opacity: currentOptions.opacity,
                minimumLevel: currentOptions.minimumLevel || 0,
                maximumLevel: currentOptions.maximumLevel || 18,
                debugTiles: false,
                queryable: currentOptions.queryable === undefined || currentOptions.queryable,
                style: currentOptions.style,
                styleOptions: isPointGeometry(currentOptions) ? undefined : currentOptions,
                tileWidth: currentOptions?.tileSize || 512,
                loadTile: tileLoadFn
            });
            tiledPrimitive.load();
        } else {
            notifyLoading();
            loader()
                .then(({ data: collection }) => {
                    styledFeatures.setFeatures(collection.features);
                    applyStyle(styledFeatures, currentOptions, collection.features);
                    notifyLoaded();
                })
                .catch(() => notifyLoaded({ error: true }));
        }
    };

    const layerObj = {
        detached: true,
        styledFeatures,
        tiledPrimitive,
        setCurrentOptions: (opts) => { currentOptions = opts; },
        loader: null,
        add: () => {
            add();
            layerObj.styledFeatures = styledFeatures;
            layerObj.tiledPrimitive = tiledPrimitive;
        },
        remove: () => {
            if (styledFeatures) {
                styledFeatures.destroy();
                styledFeatures = undefined;
            }
            if (tiledPrimitive) {
                tiledPrimitive.destroy();
                tiledPrimitive = undefined;
            }
            if (loadingBbox) {
                map.camera.moveEnd.removeEventListener(loadingBbox);
            }
        }
    };
    _layerRef = layerObj;
    return layerObj;
};

Layers.registerType('arcgis-feature', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (layer?.setCurrentOptions) {
            layer.setCurrentOptions(newOptions);
        }
        if (
            oldOptions.forceProxy !== newOptions.forceProxy
            || !isEqual(oldOptions.security, newOptions.security)
            || oldOptions.strategy !== newOptions.strategy
        ) {
            return createLayer(newOptions, map);
        }
        if (!isEqual(newOptions.style, oldOptions.style)) {
            if (layer?.styledFeatures) {
                layerToGeoStylerStyle(newOptions)
                    .then((style) => {
                        getStyle(applyDefaultStyleToVectorLayer({
                            ...newOptions,
                            features: layer?.styledFeatures?._originalFeatures,
                            style
                        }), 'cesium')
                            .then((styleFunc) => {
                                layer.styledFeatures.setStyleFunction(styleFunc);
                            });
                    });
            }
            if (layer?.tiledPrimitive) {
                layer.tiledPrimitive.setStyleFunction(newOptions.style);
            }
        }
        if (newOptions.opacity !== oldOptions.opacity) {
            if (layer?.styledFeatures) {
                layer.styledFeatures.setOpacity(newOptions.opacity);
            }
            if (layer?.tiledPrimitive) {
                layer.tiledPrimitive.setOpacity(newOptions.opacity);
            }
        }
        return null;
    }
});
