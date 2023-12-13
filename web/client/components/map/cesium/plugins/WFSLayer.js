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
import axios from '../../../../libs/ajax';
import { getFeature } from '../../../../api/WFS';
import { needsReload } from '../../../../utils/WFSLayerUtils';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import {
    getStyle,
    layerToGeoStylerStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';

const requestFeatures = (options, params, cancelToken) => {
    return getFeature(options.url, options.name, {
        // ...(!params?.CQL_FILTER && { bbox: [minx, miny, maxx, maxy, projection].join(',') }),
        outputFormat: 'application/json',
        srsname: 'EPSG:4326',
        ...params
    }, {
        cancelToken
    });
};

const createLayer = (options, map) => {

    if (!options.visibility) {
        return {
            detached: true,
            dataSource: undefined,
            remove: () => {}
        };
    }

    let dataSource = new Cesium.GeoJsonDataSource(options?.id);
    dataSource.loadingEvent.addEventListener(() => {
        // ensure it updates render on every loading
        map.scene.requestRender();
    });
    const params = optionsToVendorParams(options);

    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();
    requestFeatures(options, params, source.token)
        .then(({ data: collection }) => {
            dataSource.load(collection, {
                // ensure default style is not applied
                stroke: new Cesium.Color(0, 0, 0, 0),
                fill: new Cesium.Color(0, 0, 0, 0),
                markerColor: new Cesium.Color(0, 0, 0, 0),
                strokeWidth: 0,
                markerSize: 0
            }).then(() => {
                map.dataSources.add(dataSource);
                dataSource['@wfsFeatureCollection'] = collection;
                layerToGeoStylerStyle(options)
                    .then((style) => {
                        getStyle(applyDefaultStyleToVectorLayer({ ...options, style }), 'cesium')
                            .then((styleFunc) => {
                                if (styleFunc) {
                                    styleFunc({
                                        entities: dataSource?.entities?.values,
                                        map,
                                        opacity: options.opacity ?? 1,
                                        features: collection.features
                                    }).then(() => {
                                        map.scene.requestRender();
                                    });
                                }
                            });
                    });
            });
        });


    dataSource.show = !!options.visibility;
    dataSource.queryable = options.queryable === undefined || options.queryable;

    return {
        detached: true,
        dataSource,
        remove: () => {
            if (source?.cancel) {
                source.cancel();
            }
            if (dataSource && map) {
                map.dataSources.remove(dataSource);
                dataSource = undefined;
            }
        }
    };
};

Layers.registerType('wfs', {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {
        if (needsReload(oldOptions, newOptions)) {
            return createLayer(newOptions, map);
        }
        if (layer?.dataSource?.entities?.values
            && (
                !isEqual(newOptions.style, oldOptions.style)
                || newOptions.opacity !== oldOptions.opacity
            )
        ) {
            layerToGeoStylerStyle(newOptions)
                .then((style) => {
                    getStyle(applyDefaultStyleToVectorLayer({ ...newOptions, style }), 'cesium')
                        .then((styleFunc) => {
                            if (styleFunc) {
                                styleFunc({
                                    entities: layer.dataSource.entities.values,
                                    map,
                                    opacity: newOptions.opacity ?? 1
                                }).then(() => {
                                    map.scene.requestRender();
                                });
                            }
                        });
                });
        }
        return null;
    }
});
