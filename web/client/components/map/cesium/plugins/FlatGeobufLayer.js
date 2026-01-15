/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';

// import {
//     Viewer,
//     GeoJsonDataSource,
//     Color,
//     HeightReference
// } from "cesium";
import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';
import {
    getStyle
} from '../../../../utils/VectorStyleUtils';
import { applyDefaultStyleToVectorLayer } from '../../../../utils/StyleUtils';
import GeoJSONStyledFeatures from  '../../../../utils/cesium/GeoJSONStyledFeatures';
import { createVectorFeatureFilter } from '../../../../utils/FilterUtils';

import {
    FGB_LAYER_TYPE,
    // getFlatGeobufOl,  // datasource
    getFlatGeobufGeojson // deserialize
} from '../../../../api/FlatGeobuf';


const createLayer = (options, map) => {

    // console.log('createLayer FlatGeobuf Cesium', options, map);

    if (!options.visibility) {
        return {
            detached: true,
            remove: () => {}
        };
    }

    // //USING LOADER
    // const source = new VectorSource();
    // getFlatGeobufOl().then(flatgeobuf => {
    //     const loader = flatgeobuf.createLoader(source, options.url);
    //     source.setLoader(loader);
    //     map.dataSources.add(source);
    // });
    // const source = await GeoJsonDataSource.load(geojson, {
    //     stroke: Color.BLUE,
    //     fill: Color.CYAN.withAlpha(0.4),
    //     strokeWidth: 2,
    //     clampToGround: true
    // });
    // map.dataSources.add(source);

    const vectorFeatureFilter = createVectorFeatureFilter(options);

    let styledFeatures = new GeoJSONStyledFeatures({
        map: map,
        features: [],
        id: options?.id,
        opacity: options.opacity,
        queryable: options.queryable === undefined || options.queryable,
        featureFilter: vectorFeatureFilter
    });

    let loadingBboxBind;

    function mapBbox() {
        const viewRectangle = map.camera.computeViewRectangle();
        const cameraPitch = Math.abs(Cesium.Math.toDegrees(map.camera.pitch));

        let rect = undefined;

        if (viewRectangle && cameraPitch > 60) {
            rect = {
                minx: Cesium.Math.toDegrees(viewRectangle.west),
                miny: Cesium.Math.toDegrees(viewRectangle.south),
                maxx: Cesium.Math.toDegrees(viewRectangle.east),
                maxy: Cesium.Math.toDegrees(viewRectangle.north)
            };
        }
        return rect;
    }

    async function loadingBbox({flatgeobuf}) {
        const geojson = {
            type: "FeatureCollection",
            features: []
        };

        let rect = mapBbox();

        // console.log('loadingBbox', rect);

        for await (const feature of flatgeobuf.deserialize(options.url, rect)) {
            geojson.features.push(feature);
        }

        if (styledFeatures) {

            // TODO implement .add() method in class GeoJSONStyledFeatures
            styledFeatures.setFeatures(geojson.features);

            const styledLayer = applyDefaultStyleToVectorLayer({ ...options, features: geojson.features });

            getStyle(styledLayer, 'cesium')
                .then((styleFunc) => {
                    if (styledFeatures) {
                        styledFeatures.setStyleFunction(styleFunc);
                    }
                });
        }
    }

    getFlatGeobufGeojson().then( async flatgeobuf => {
        loadingBboxBind = loadingBbox.bind(null, {flatgeobuf});
        map.camera.moveEnd.addEventListener(loadingBboxBind);
    });

    return {
        detached: true,
        remove: () => {

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
        if (layer?.styledFeatures && !isEqual(newOptions?.layerFilter, oldOptions?.layerFilter)) {
            const vectorFeatureFilter = createVectorFeatureFilter(newOptions);
            layer.styledFeatures.setFeatureFilter(vectorFeatureFilter);
        }
        return null;
    }
});
