import uuid from 'uuid';
import _bbox from '@turf/bbox';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import difference from '@turf/difference';
import { BUCKET_COLORS, BUCKET_OUTLINE_COLOR, CONTROL_NAME, ISOCHRONE_ROUTE_LAYER, UOM } from '../constants';
import { getMessageById } from '../../../utils/LocaleUtils';

/**
 * Computes isochrone bands
 * @param {object[]} features - The features to compute the isochrone bands from
 * @returns {object[]} The isochrone bands
 */
const computeIsochroneBands = (features) => {
    const result = [];

    for (let i = 0; i < features.length; i++) {
        let current = features[i];

        // subtract only the previous polygon (faster, works for concentric isochrones)
        if (i > 0) {
            const diff = difference(current, features[i - 1]);
            if (diff) {
                current = diff;
            }
        }

        result.push(current);
    }
    return result;
};

const getMarkerGeoJson = (point) => {
    return {
        markerFeature: isEmpty(point) ? [] : [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: point},
            properties: { id: "point" }
        }],
        markerRule: isEmpty(point) ? [] : [{
            name: "center",
            symbolizers: [
                {
                    kind: "Mark",
                    wellKnownName: "Circle",
                    color: "#dddddd",
                    fillOpacity: 0,
                    strokeColor: "#000000",
                    strokeOpacity: 1,
                    strokeWidth: 2,
                    radius: 4,
                    rotate: 0,
                    msBringToFront: false,
                    msHeightReference: "none"
                }
            ],
            filter: [ '||', [ '==', 'id', 'point' ] ]
        }]
    };
};

/**
 * Get the isochrone label
 * @param {number} distance - distance value (isodistance)
 * @param {number} time - time value (isochrone)
 * @param {object} messages - The translations messages object
 * @returns {string} The isochrone label
 */
const getIsochroneLabel = (distance, time, messages) => {
    return `${distance
        ? `${getMessageById(messages, "isochrone.distance")}: ${distance} ${UOM.DISTANCE}`
        : `${getMessageById(messages, "isochrone.time")}: ${time} ${UOM.TIME}`}`;
};
/**
 * Get the route detail layer text
 * @param {object} config - isochrone config
 * @param {object} config.distanceLimit - The distance limit to generate the isochrone layer from. In kms
 * @param {object} config.timeLimit - The time limit to generate the isochrone layer from. In minutes
 * @returns {string} The route detail layer text
 */
export const getRouteDetailText = (config, messages) => {
    if (isEmpty(config)) return '';
    const [lon, lat] = config.location ?? [];
    const distance = config?.distanceLimit ?? null;
    const time = config?.timeLimit ?? null;
    return `Lat: ${lat?.toFixed(2)}, Lon: ${lon?.toFixed(2)}` + (distance || time ? ` | ${getIsochroneLabel(distance, time, messages)}` : '');
};

/**
 * Get the interval value for a given index
 * @param {number} totalValue - The total value (distance or time)
 * @param {number} intervals - The number of intervals
 * @param {number} index - The current index (0-based)
 * @returns {number} The interval value
 */
export const getIntervalValue = (totalValue, intervals, index) => {
    const step = totalValue / intervals;
    return Math.round((index + 1) * step);
};

/**
 * Generates isochrone layer from data
 * @param {object[]} data - The data to generate the isochrone layer from
 * @param {object} config - The config to generate the isochrone layer from
 * @param {number} config.distanceLimit - The distance limit to generate the isochrone layer from
 * @param {number} config.timeLimit - The time limit to generate the isochrone layer from
 * @param {string} rampColors - The ramp colors to generate the isochrone layer from
 * @returns {object} The isochrone layer
 */
export const getIsochroneLayer = (data = [], config = {}, messages = {}) => {
    const rampColors = get(config, 'ramp.colors', BUCKET_COLORS);
    const distanceLimit = !isNil(config.distanceLimit) ? Number(config.distanceLimit) : null;
    const timeLimit = !isNil(config.timeLimit) ? Number(config.timeLimit) : null;

    const features = (data ?? []).map((feature, index, _features) => {
        const intervalValue = getIntervalValue(
            distanceLimit || timeLimit,
            _features.length, // total features is equal to the number of intervals
            index
        );
        const distance = distanceLimit ? intervalValue : null;
        const time = timeLimit ? intervalValue : null;
        const label = distance || time ? getIsochroneLabel(distance, time, messages) : null;

        return {
            type: 'Feature',
            geometry: feature.geometry,
            properties: {
                id: `isochrone-polygon-${index}`,
                distance,
                time,
                distanceUom: distanceLimit ? UOM.DISTANCE : null,
                timeUom: timeLimit ? UOM.TIME : null,
                label: label
            }
        };
    });
    const { markerFeature, markerRule } = getMarkerGeoJson(config.location);
    const layer = {
        type: 'vector',
        id: uuid(),
        name: ISOCHRONE_ROUTE_LAYER,
        title: getRouteDetailText(config, messages) || CONTROL_NAME,
        visibility: true,
        features: computeIsochroneBands(features).concat(markerFeature),
        style: {
            format: 'geostyler',
            body: {
                rules: features.map((feature, index) => ({
                    filter: ['||', ['==', 'id', `isochrone-polygon-${index}`]],
                    name: get(feature.properties, 'label') || `isochrone-polygon-${index}`,
                    symbolizers: [{
                        kind: 'Fill',
                        color: rampColors[index] || rampColors[rampColors.length - 1],
                        fillOpacity: 0.7,
                        outlineColor: BUCKET_OUTLINE_COLOR,
                        outlineOpacity: 1,
                        outlineWidth: 2,
                        msClassificationType: 'both',
                        msClampToGround: true
                    }]
                })).concat(markerRule)
            },
            metadata: {
                editorType: 'visual'
            }
        }
    };
    const bbox = _bbox({ type: "FeatureCollection", features });
    return {
        layer,
        bbox,
        data: { layer, bbox, config }
    };
};

/**
 * Get the marker layer identifier
 * @param {number} index - The index
 * @returns {object} The marker layer identifier
 */
export const getMarkerLayerIdentifier = (index) => {
    return ISOCHRONE_ROUTE_LAYER + `_marker_${index}`;
};

export const getRunLayerIdentifier = (id) => {
    return ISOCHRONE_ROUTE_LAYER + `_run_${id}`;
};

/**
 * Get the range value
 * @param {number} value - The value
 * @param {string} uom - The unit of measure
 * @returns {number} The range value
 */
export const getRangeValue = (value, uom = "meters") => {
    switch (uom) {
    case "meters":
        return Math.round(Number(value) * 1000);
    case "seconds":
        return Math.round(Number(value) * 60);
    case "km":
        return Number(value) / 1000;
    case "minutes":
        return Number((Number(value) / 60).toFixed(2));
    default:
        return value;
    }
};
