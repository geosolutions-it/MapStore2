/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import { ServerTypes } from '../../../../utils/LayersUtils';
import isEqual from 'lodash/isEqual';

import {getStyle} from '../VectorStyle';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {bbox, all, tile} from 'ol/loadingstrategy.js';
import { createXYZ } from 'ol/tilegrid.js';

import GeoJSON from 'ol/format/GeoJSON';

import { getFeature, getFeatureLayer } from '../../../../api/WFS';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import { needsReload, needsCredentials, getConfig } from '../../../../utils/WFSLayerUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';

const createLoader = (source, options) => (extent, resolution, projection) => {
    let proj = projection.getCode();
    let req;
    let filters = [];
    const onError = () => {
        source.removeLoadedExtent(extent);
        source.dispatchEvent('vectorerror');
    };
    if (options.serverType === ServerTypes.NO_VENDOR) {

        if (needsCredentials(options)) {
            req = new Promise((resolve, reject) => {reject();});
        } else {
            if (options?.strategy === 'bbox' || options?.strategy === 'tile') {
            // here bbox filter is
                const [left, bottom, right, top] = extent;

                filters = [{
                    spatialField: {
                        operation: 'BBOX',
                        geometry: {
                            projection: proj,
                            extent: [[left, bottom, right, top]] // use array because bbox is buggy
                        }
                    }
                }];
            }
            req = getFeatureLayer(options, {filters, proj}, getConfig(options));
        }
    } else {
        const params = optionsToVendorParams(options);
        const config = getConfig(options);
        req = getFeature(options.url, options.name, {
            // bbox: extent.join(',') + ',' + proj,
            outputFormat: "application/json",
            // maxFeatures: 3600, // This looks the internal openlayers limit. TODO: investigate more
            srsname: proj,
            ...params
        }, config);
    }

    req.then(response => {
        if (response.status === 200) {
            source.addFeatures(
                source.getFormat().readFeatures(response.data));
            source.set('@wfsFeatureCollection', response.data);
            options.onLoadEnd && options.onLoadEnd();
        } else {
            onError();
        }
    }).catch(e => {
        onError(e);
    });
};
/**
 * Generate the OL style from options. It workarounds some issues
 * @param {object} options MapStore's layer options
 * @param {object} layer the openlayers layer
 */
const getWFSStyle = (layer, options, map) => {
    const collection = layer.getSource().get('@wfsFeatureCollection') || {};
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
                        .then((olStyle) => {
                            layer.setStyle(olStyle);
                        });
                } else {
                    layer.setStyle(style);
                }
            }
        });
};
const getStrategy = (options) => {
    if (options.strategy === 'bbox' && options?.serverType === ServerTypes.NO_VENDOR) {
        return bbox;
    }
    if (options.strategy === 'all') {
        return all;
    }
    if (options.strategy === 'tile' && options?.serverType === ServerTypes.NO_VENDOR) {
        return tile(createXYZ({
            tileSize: options?.tileSize || 512
        }));
    }
    return null;
};

/**
 * Fetch describeFeatureType if missing and set the style accordingly with the geometry type.
 * @param {object} layer the openlayers layer
 * @param {object} options MapStore layer configuration
 */
const updateStyle = (layer, options, map) => getWFSStyle(layer, options, map);

/**
 * WFS Layer for MapStore. Openlayers implementation.
 * Note: WFS Source stores features in the layer internally, to distinguish from vector source.
 * These features are not stored in the final layer object.
 *
 */
Layers.registerType('wfs', {
    create: (options, map) => {

        const source = new VectorSource({
            strategy: getStrategy(options) || undefined, // this can not be null, must be
            format: new GeoJSON()
        });
        let layer;
        source.setLoader(
            createLoader(source, {
                ...options,
                onLoadEnd: () => {
                    updateStyle(layer, options, map);
                }
            })
        );

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
    },
    update: (layer, options = {}, oldOptions = {}, map) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = options.crs || options.srs || 'EPSG:3857';
        const source = layer.getSource();
        if (newCrs !== oldCrs) {
            source.forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }
        if (needsReload(oldOptions, options) || !isEqual(oldOptions.security, options.security)) {
            source.setLoader(createLoader(source, options));
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
