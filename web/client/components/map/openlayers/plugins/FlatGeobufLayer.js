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
import {
    getStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import {
    FGB_LAYER_TYPE,
    getFlatGeobufOl
} from '../../../../api/FlatGeobuf';

// the same of WFS?
const getWFSStyle = (layer, options, map) => {

    const featuresVect = layer.getSource().getFeatures();

    const geojson = new GeoJSON().writeFeatures(featuresVect);

    return getStyle(
        applyDefaultStyleToVectorLayer({
            ...options,
            features: geojson.features,
            asPromise: true
        })
    )
        .then((style) => {
            if (style) {
                if (style.__geoStylerStyle) {
                    style({ map, features: geojson.features })
                        .then((olStyle) => {
                            layer.setStyle(olStyle);
                        });
                } else {
                    layer.setStyle(style);
                }
            }
        });
};

const updateStyle = (layer, options, map) => getWFSStyle(layer, options, map);

const createLayer = (options, map) => {

    const mapProjection = map.getView().getProjection().getCode();

    const strategy = bboxStrategy;

    const source = new VectorSource({
        strategy
    });

    const layer = new VectorLayer({
        msId: options.id,
        source,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        opacity: options.opacity,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
    });

    getFlatGeobufOl().then(flatgeobuf => {

        const loader = flatgeobuf.createLoader(source, options.url, mapProjection, strategy);
        source.setLoader(loader);

        // update style on features loaded from source
        // source.on('featuresloadend', () => {

        //     // source.set('@fgbFeatureCollection', );
        //     updateStyle(layer, options, map);
        // });
    });

    // dosen't work
    // updateStyle(layer, options, map);

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
