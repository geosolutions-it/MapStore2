/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MapUtils = require('../MapUtils');
const CoordinatesUtils = require('../CoordinatesUtils');
const {isArray, isObject, head} = require('lodash');
const { optionsToVendorParams } = require('../VendorParamsUtils');

const SecurityUtils = require('../SecurityUtils');
const assign = require('object-assign');

module.exports = {
    buildRequest: (layer, props, infoFormat, viewer, featureInfo) => {
        /* In order to create a valid feature info request
         * we create a bbox of 101x101 pixel that wrap the point.
         * center point is re-projected then is built a box of 101x101pixel around it
         */
        const heightBBox = props && props.sizeBBox && props.sizeBBox.height || 101;
        const widthBBox = props && props.sizeBBox && props.sizeBBox.width || 101;
        const size = [heightBBox, widthBBox];
        const rotation = 0;
        const resolution = MapUtils.getCurrentResolution(Math.ceil(props.map.zoom), 0, 21, 96);
        let wrongLng = props.point.latlng.lng;
        // longitude restricted to the [-180°,+180°] range
        let lngCorrected = wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
        const center = {x: lngCorrected, y: props.point.latlng.lat};
        let centerProjected = CoordinatesUtils.reproject(center, 'EPSG:4326', props.map.projection);
        let bounds = CoordinatesUtils.getProjectedBBox(centerProjected, resolution, rotation, size, null);
        let queryLayers = layer.name;
        if (layer.queryLayers) {
            queryLayers = layer.queryLayers.join(",");
        }

        const locale = props.currentLocale ? head(props.currentLocale.split('-')) : null;
        const ENV = locale ? 'locale:' + locale : '';
        const params = optionsToVendorParams({
            filterObj: layer.filterObj,
            params: assign({}, layer.baseParams, layer.params, props.params)
        });
        return {
            request: SecurityUtils.addAuthenticationToSLD({
                service: 'WMS',
                version: '1.1.1',
                request: 'GetFeatureInfo',
                exceptions: 'application/json',
                id: layer.id,
                layers: layer.name,
                query_layers: queryLayers,
                styles: layer.style,
                x: widthBBox % 2 === 1 ? Math.ceil(widthBBox / 2) : widthBBox / 2,
                y: widthBBox % 2 === 1 ? Math.ceil(widthBBox / 2) : widthBBox / 2,
                height: heightBBox,
                width: widthBBox,
                srs: CoordinatesUtils.normalizeSRS(props.map.projection) || 'EPSG:4326',
                bbox: bounds.minx + "," +
                      bounds.miny + "," +
                      bounds.maxx + "," +
                      bounds.maxy,
                feature_count: props.maxItems,
                info_format: infoFormat,
                ENV,
                ...assign({}, params)
            }, layer),
            metadata: {
                title: isObject(layer.title) ? layer.title[props.currentLocale] || layer.title.default : layer.title,
                regex: layer.featureInfoRegex,
                viewer,
                featureInfo
            },
            url: isArray(layer.url) ?
                layer.url[0] :
                layer.url.replace(/[?].*$/g, '')
        };
    }
};
