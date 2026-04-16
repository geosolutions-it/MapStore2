/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import { getFeature, getFeatureLayer } from '../../../../api/WFS';
import { needsReload, needsCredentials, getConfig } from '../../../../utils/WFSLayerUtils';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import {
    getStyle,
    layerToGeoStylerStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from  '../../../../utils/cesium/GeoJSONStyledFeatures';
import { ServerTypes } from '../../../../utils/LayersUtils';
import TiledBillboardCollection from '../../../../utils/cesium/TiledBillboardCollection';


const requestFeatures = (options, params, config) => {
    return getFeature(options.url, options.name, {
        // ...(!params?.CQL_FILTER && { bbox: [minx, miny, maxx, maxy, projection].join(',') }),
        outputFormat: 'application/json',
        srsname: 'EPSG:4326',
        ...params
    }, config);
};

const createLoader = (options) => {
    if (options.serverType === ServerTypes.NO_VENDOR) {
        if (needsCredentials(options)) {
            return () => null;
        }

        if (options?.strategy === 'bbox' || options.strategy === 'tile') {
            return (extent) => getFeatureLayer(options, { filters: [{
                spatialField: {
                    operation: 'BBOX',
                    geometry: {
                        projection: 'EPSG:4326',
                        extent: [extent] // use array because bbox is buggy
                    }
                }
            }], proj: 'EPSG:4326' }, getConfig(options));
        }
        return () => getFeatureLayer(options, { filters: [], proj: 'EPSG:4326' }, getConfig(options));
    }
    const params = optionsToVendorParams(options);
    const config = getConfig(options);
    return () => requestFeatures(options, params, config);
};

const createLayer = (options, map) => {

    if (!options.visibility) {
        return {
            detached: true,
            styledFeatures: undefined,
            remove: () => {}
        };
    }

    let styledFeatures = new GeoJSONStyledFeatures({
        features: [],
        id: options?.id,
        map: map,
        opacity: options.opacity,
        queryable: options.queryable === undefined || options.queryable,
        styleRules: options?.style?.body?.rules || []
    });
    let loader;
    let loadingBbox;
    let bboxTimeout;
    let tiledPrimitive;

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
        loader = createLoader(options);
        if (options?.strategy === 'bbox' && options?.serverType === ServerTypes.NO_VENDOR) {
            loadingBbox = () => {
                if (bboxTimeout) {
                    clearTimeout(bboxTimeout);
                    bboxTimeout = undefined;
                }
                bboxTimeout = setTimeout(() => {
                    const viewRectangle = map.camera.computeViewRectangle();
                    const cameraPitch = Math.abs(Cesium.Math.toDegrees(map.camera.pitch));
                    if (viewRectangle && cameraPitch > 60) {
                        const result = loader([
                            Cesium.Math.toDegrees(viewRectangle.west),
                            Cesium.Math.toDegrees(viewRectangle.south),
                            Cesium.Math.toDegrees(viewRectangle.east),
                            Cesium.Math.toDegrees(viewRectangle.north)
                        ]);
                        if (result && typeof result.then === 'function') {
                            notifyLoading();
                            result
                                .then(({ data: collection }) => {
                                    styledFeatures.setFeatures(collection.features);
                                    layerToGeoStylerStyle(options)
                                        .then((style) => {
                                            getStyle(applyDefaultStyleToVectorLayer({
                                                ...options,
                                                features: collection.features,
                                                style
                                            }), 'cesium')
                                                .then((styleFunc) => {
                                                    styledFeatures.setStyleFunction(styleFunc);
                                                });
                                        });
                                    notifyLoaded();
                                })
                                .catch(() => notifyLoaded({ error: true }));
                        }
                    }
                }, 300);
            };
            map.camera.moveEnd.addEventListener(loadingBbox);
        } else if (options?.strategy === 'tile' && options?.serverType === ServerTypes.NO_VENDOR) {
            tiledPrimitive = new TiledBillboardCollection({
                map,
                tileType: 'billboard',
                opacity: options.opacity,
                minimumLevel: options.minimumLevel || 17,
                maximumLevel: options.maximumLevel || 17,
                msId: options.id,
                debugTiles: false,
                queryable: options.queryable === undefined || options.queryable,
                style: options.style,
                tileWidth: options?.tileSize || 512,
                loadTile: (tile) => {
                    notifyLoading();
                    return loader([
                        Cesium.Math.toDegrees(tile.rectangle.west),
                        Cesium.Math.toDegrees(tile.rectangle.south),
                        Cesium.Math.toDegrees(tile.rectangle.east),
                        Cesium.Math.toDegrees(tile.rectangle.north)
                    ]).then(({ data: collection }) => {
                        notifyLoaded();
                        return collection;
                    }).catch((e) => {
                        notifyLoaded({ error: true });
                        throw e;
                    });
                }
            });
            tiledPrimitive.load();
        } else {
            const result = loader();
            if (result && typeof result.then === 'function') {
                notifyLoading();
                result
                    .then(({ data: collection }) => {
                        styledFeatures.setFeatures(collection.features);
                        layerToGeoStylerStyle(options)
                            .then((style) => {
                                getStyle(applyDefaultStyleToVectorLayer({
                                    ...options,
                                    features: collection.features,
                                    style
                                }), 'cesium')
                                    .then((styleFunc) => {
                                        styledFeatures.setStyleFunction(styleFunc);
                                    });
                            });
                        notifyLoaded();
                    })
                    .catch(() => notifyLoaded({ error: true }));
            }
        }
    };
    const layerObj = {
        detached: true,
        styledFeatures,
        loader: null,
        add,
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

Layers.registerType('wfs', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (
            needsReload(oldOptions, newOptions) ||
            oldOptions.forceProxy !== newOptions.forceProxy ||
            !isEqual(oldOptions.security, newOptions.security)
        ) {
            return createLayer(newOptions, map);
        }
        if (layer?.styledFeatures && !isEqual(newOptions.style, oldOptions.style)) {
            // update style rules here
            if (!isEqual(newOptions?.style?.body?.rules, oldOptions?.style?.body?.rules)) {
                let styleRules = newOptions?.style?.body?.rules || [];
                layer.styledFeatures._setStyleRules(styleRules);
            }
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
        if (layer?.styledFeatures && newOptions.opacity !== oldOptions.opacity) {
            layer.styledFeatures.setOpacity(newOptions.opacity);
        }
        return null;
    }
});
