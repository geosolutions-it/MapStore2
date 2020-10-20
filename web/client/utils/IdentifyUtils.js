/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import buffer from 'turf-buffer';
import intersect from 'turf-intersect';

import FeatureInfoUtils from './FeatureInfoUtils';
import { buildIdentifyRequest } from './MapInfoUtils';
import { getLayer } from './LayersUtils';

export const getFormatForResponse = (res, props) => {
    const {format, queryParams = {}} = res;
    // handle WMS/WMTS.., and also WFS
    return queryParams.info_format
        || queryParams.outputFormat
        || format && FeatureInfoUtils.INFO_FORMATS[format]
        || props.format;
};

export const responseValidForEdit = (res) => !!get(res, 'layer.search.url');

/**
* Gets the feature that was clicked on a map layer
* @param {array} layers the layers from which the required layer(layerId) can be filtered from
* @param {string} layerId the id of the layer to which the clicked feature belongs
* @param {object} options buildIndentifyRequest options
*/
export const getIntersectingFeature = (layers, layerId, options) => {
    const locationsLayer = getLayer(layerId, layers);

    const identifyRequest = buildIdentifyRequest(locationsLayer, {...options});
    const { metadata } = identifyRequest;

    const cpoint = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": [options.point.latlng.lng, options.point.latlng.lat]
        }
    };

    let unit = metadata && metadata.units;
    switch (unit) {
    case "m":
        unit = "meters";
        break;
    case "deg":
        unit = "degrees";
        break;
    case "mi":
        unit = "miles";
        break;
    default:
        unit = "meters";
    }

    const resolution = metadata && metadata.resolution || 1;
    const bufferedPoint = buffer(cpoint, (metadata.buffer || 1) * resolution, unit);

    const intersectingFeature = locationsLayer.features[0].features.filter(
        (feature) => {
            const buff = buffer(feature, 1, "meters");
            const intersection = intersect(bufferedPoint, buff);
            if (intersection) {
                return true;
            }
            return false;
        }
    );

    return intersectingFeature;
};
