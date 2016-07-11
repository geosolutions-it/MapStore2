/**
 * Copyright 2015-2016, GeoSolutions Sas.
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
const MapUtils = require('./MapUtils');
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
    /**
     * Create a new extent or update the provided extent.
     * @param {number} minX Minimum X.
     * @param {number} minY Minimum Y.
     * @param {number} maxX Maximum X.
     * @param {number} maxY Maximum Y.
     * @param {Object} optExtent Destination extent.
     * @return {Object Extent.
     */
    createOrUpdate(minX, minY, maxX, maxY, optExtent) {
        if (optExtent) {
            optExtent.maxx = maxX;
            optExtent.maxy = maxY;
            optExtent.minx = minX;
            optExtent.miny = minY;
            return optExtent;
        }
        return { maxx: maxX, maxy: maxY, minx: minX, miny: minY };
    },
    /**
     * Creates a bbox of size dimensions areund the center point given to it given the
     * resolution and the rotation
     * @param center {object} the x,y coordinate of the point
     * @param resolution {number} the resolution of the map
     * @param rotation {number} the optional rotation of the new bbox
     * @param size {object} width,height of the desired bbox
     * @param opt_extent {object}  optional bbox if passed it will be updated
     * @return {object} the desired bbox {minx, miny, maxx, maxy}
     */
     getForViewAndSize(center, resolution, rotation = 0, size, optExtent) {
        let dx = resolution * size[0] / 2;
        let dy = resolution * size[1] / 2;
        let cosRotation = Math.cos(rotation);
        let sinRotation = Math.sin(rotation);
        let xCos = dx * cosRotation;
        let xSin = dx * sinRotation;
        let yCos = dy * cosRotation;
        let ySin = dy * sinRotation;
        let x = center.x;
        let y = center.y;
        let x0 = x - xCos + ySin;
        let x1 = x - xCos - ySin;
        let x2 = x + xCos - ySin;
        let x3 = x + xCos + ySin;
        let y0 = y - xSin - yCos;
        let y1 = y - xSin + yCos;
        let y2 = y + xSin + yCos;
        let y3 = y + xSin - yCos;
        let bbox = MapInfoUtils.createOrUpdate(
            Math.min(x0, x1, x2, x3), Math.min(y0, y1, y2, y3),
            Math.max(x0, x1, x2, x3), Math.max(y0, y1, y2, y3),
            optExtent);
        return bbox;
    },
    buildIdentifyRequest(layer, props) {
        /* In order to create a valid feature info request
         * we create a bbox of 101x101 pixel that wrap the point.
         * center point is repojected then is built a box of 101x101pixel around it
         */
        let wrongLng = props.point.latlng.lng;
        // longitude restricted to the -180,180 range
        let lngCorrected = wrongLng - (360) * Math.floor(wrongLng / (360) + 0.5);
        const center = {x: lngCorrected, y: props.point.latlng.lat};
        let centerProjected = CoordinatesUtils.reproject(center, "EPSG:4326", "EPSG:900913");
        const resolution = MapUtils.getCurrentResolution(props.map.zoom, 0, 21, 96);
        const rotation = 0;
        const size = [101, 101];
        let bounds = MapInfoUtils.getForViewAndSize(centerProjected, resolution, rotation, size, null);
        if (layer.type === 'wms') {
            return {
                request: {
                    id: layer.id,
                    layers: layer.name,
                    query_layers: layer.name,
                    styles: layer.style,
                    x: 51,
                    y: 51,
                    height: 101,
                    width: 101,
                    srs: CoordinatesUtils.normalizeSRS(props.map.projection),
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
