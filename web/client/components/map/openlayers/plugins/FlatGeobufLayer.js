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
import Layers from '../../../../utils/openlayers/Layers';
import {bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import GeoJSON from 'ol/format/GeoJSON';
import { getStyle } from '../VectorStyle';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import {
    FGB_LAYER_TYPE,
    getFlatGeobufOl
} from '../../../../api/FlatGeobuf';

// the same of WFS?
const getWFSStyle = (layer, options, map) => {

    const featuresVect = layer.getSource().getFeatures();

    const geojson = new GeoJSON().writeFeatures(featuresVect);
    const geojsonObj = JSON.parse(geojson);

    return getStyle(
        applyDefaultStyleToVectorLayer({
            ...options,
            features: geojsonObj.features,
            asPromise: true
        })
    )
        .then((style) => {
            if (style) {
                if (style.__geoStylerStyle) {
                    style({ map, features: geojsonObj.features })
                        .then((olStyle) => {
                            layer.setStyle(olStyle);
                        });
                } else {
                    layer.setStyle(style);
                }
            }
        });
};

const createLoader = (source, options, strategy) => (extent, resolution, projection) => {
    getFlatGeobufOl().then(flatgeobuf => {
        // in flatgeobuf from v4.4.0 params is: VectorSource<FeatureLike>, url: string, srs?: string, strategy?: LoadingStrategy, clear?: boolean, headers?: HeadersInit
        const loader = flatgeobuf.createLoader(source, options.url, projection.getCode(), strategy, true);
        source.setLoader(loader);
        loader(extent, resolution, projection); // force load at creation(needed for flatgeobuf only)
        options.onLoadEnd && options.onLoadEnd();
    });
};

const updateStyle = (layer, options, map) => getWFSStyle(layer, options, map);

const createLayer = (options, map) => {

    const proj = map.getView().getProjection().getCode();
    const strategy = bboxStrategy;

    const source = new VectorSource({
        strategy
    });

    let layer;
    source.setLoader(
        createLoader(source, {
            ...options,
            proj: proj,
            onLoadEnd: () => {
                updateStyle(layer, options, map);
            }
        }, strategy)
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
};

Layers.registerType(FGB_LAYER_TYPE, {
    create: createLayer,
    update: (layer, newOptions, oldOptions, map) => {

        const isStyleChanged = !isEqual(oldOptions.style, newOptions.style);
        const isStyleNameChanged = oldOptions.styleName !== newOptions.styleName;
        if (
            isStyleChanged ||
            isStyleNameChanged
        ) {
            updateStyle(layer, newOptions, map);
        }

        return null;
    }
});
