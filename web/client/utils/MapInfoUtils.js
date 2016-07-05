/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FeatureInfoUtils = require("./FeatureInfoUtils");
const INFO_FORMATS = FeatureInfoUtils.INFO_FORMATS;
const INFO_FORMATS_BY_MIME_TYPE = FeatureInfoUtils.INFO_FORMATS_BY_MIME_TYPE;

const {isArray} = require('lodash');
const assign = require('object-assign');
const CoordinatesUtils = require('./CoordinatesUtils');

const reprojectBbox = (bbox, projection) => {
    let newBbox = CoordinatesUtils.reprojectBbox(bbox.bounds, bbox.crs, projection);
    return assign({}, {
        crs: projection,
        bounds: {
            minx: newBbox[0],
            miny: newBbox[1],
            maxx: newBbox[2],
            maxy: newBbox[3]
        }
    });
};

const MapInfoUtils = {
    /**
     * specifies which info formats are currently supported
     */
    //           default format ↴
    AVAILABLE_FORMAT: ['TEXT', 'JSON', 'HTML'],

    /**
     * @return a filtered version of INFO_FORMATS object.
     * the returned object contains only keys that AVAILABLE_FORMAT contains.
     */
    getAvailableInfoFormat() {
        return Object.keys(INFO_FORMATS).filter((k) => {
            return MapInfoUtils.AVAILABLE_FORMAT.indexOf(k) !== -1;
        }).reduce((prev, k) => {
            prev[k] = INFO_FORMATS[k];
            return prev;
        }, {});
    },
    /**
     * @return like getAvailableInfoFormat but return an array filled with the keys
     */
    getAvailableInfoFormatLabels() {
        return Object.keys(MapInfoUtils.getAvailableInfoFormat());
    },
    /**
     * @return like getAvailableInfoFormat but return an array filled with the values
     */
    getAvailableInfoFormatValues() {
        return Object.keys(MapInfoUtils.getAvailableInfoFormat()).map( label => {
            return INFO_FORMATS[label];
        });
    },
    /**
     * @return {string} the default info format value
     */
    getDefaultInfoFormatValue() {
        return INFO_FORMATS[MapInfoUtils.AVAILABLE_FORMAT[0]];
    },
    clickedPointToGeoJson(clickedPoint) {
        if (!clickedPoint) {
            return [];
        }
        return [
            {
                id: "get-feature-info-point",
                type: "Feature",
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(clickedPoint.lng), parseFloat(clickedPoint.lat)]
                }
            }
        ];
    },
    getMarkerLayer(name, clickedMapPoint) {
        return {
            type: 'vector',
            visibility: true,
            name: name || "GetFeatureInfo",
            styleName: "marker",
            features: MapInfoUtils.clickedPointToGeoJson(clickedMapPoint)
        };
    },
    buildIdentifyRequest(layer, props) {
        const {bounds, crs} = reprojectBbox(props.map.bbox, props.map.projection);
        if (layer.type === 'wms') {
            return {
                request: {
                    id: layer.id,
                    layers: layer.name,
                    query_layers: layer.name,
                    styles: layer.style,
                    x: parseInt(props.point.pixel.x, 10),
                    y: parseInt(props.point.pixel.y, 10),
                    height: parseInt(props.map.size.height, 10),
                    width: parseInt(props.map.size.width, 10),
                    srs: CoordinatesUtils.normalizeSRS(crs),
                    bbox: bounds.minx + "," +
                          bounds.miny + "," +
                          bounds.maxx + "," +
                          bounds.maxy,
                    feature_count: props.maxItems,
                    info_format: props.format,
                    ...assign({}, layer.baseParams, props.params)
                },
                metadata: {
                    title: layer.title,
                    regex: layer.featureInfoRegex
                },
                url: isArray(layer.url) ?
                    layer.url[0] :
                    layer.url.replace(/[?].*$/g, '')
            };
        }
        return {};
    },
    getValidator(format) {
        return FeatureInfoUtils.Validator[INFO_FORMATS_BY_MIME_TYPE[format]] || {
            getValidResponses: (responses) => responses,
            getNoValidResponses: () => []
        };
    },
    getViewers() {
        return {
            [FeatureInfoUtils.INFO_FORMATS.JSON]: require('../components/data/identify/viewers/JSONViewer'),
            [FeatureInfoUtils.INFO_FORMATS.HTML]: require('../components/data/identify/viewers/HTMLViewer'),
            [FeatureInfoUtils.INFO_FORMATS.TEXT]: require('../components/data/identify/viewers/TextViewer')
        };
    },
    defaultQueryableFilter(l) {
        return l.visibility &&
            l.type === 'wms' &&
            (l.queryable === undefined || l.queryable) &&
            l.group !== "background"
        ;
    }
};

module.exports = MapInfoUtils;
