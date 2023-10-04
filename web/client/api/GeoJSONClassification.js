/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uniq from 'lodash/uniq';
import isNil from 'lodash/isNil';
import chroma from 'chroma-js';
import { defaultClassificationColors } from './SLDService';

const getSimpleStatistics = () => import('simple-statistics').then(mod => mod);

const getColorClasses = ({ ramp, intervals, reverse }) => {
    const scale = defaultClassificationColors[ramp] || ramp;
    const colorClasses = chroma.scale(scale).colors(intervals);
    return reverse ? [...colorClasses].reverse() : colorClasses;
};
/**
 * Classify an array of features with quantile method
 * @param {object} features array of GeoJSON features
 * @param {object} params parameters to compute the classification
 * @param {string} params.attribute the name of the attribute to use for classification
 * @param {number} params.intervals number of expected classes
 * @param {string} params.ramp the identifier of the color ramp
 * @param {boolean} params.reverse reverse the ramp color classification
 * @returns {promise} return classification object
 */
const quantile = (features, params) => getSimpleStatistics().then(({ quantileSorted }) => {
    const values = features.map(feature => feature?.properties?.[params.attribute]).filter(value => !isNil(value)).sort((a, b) => a - b);
    const intervals = params.intervals;
    const classes = [...[...new Array(intervals).keys()].map((n) => n / intervals), 1].map((p) => quantileSorted(values, p));
    const colors = getColorClasses({ ...params, intervals });
    return {
        data: {
            classification: classes.reduce((acc, min, idx) => {
                const max = classes[idx + 1];
                if (max !== undefined) {
                    const color = colors[idx];
                    return [ ...acc, { color, min, max }];
                }
                return acc;
            }, [])
        }
    };
});
/**
 * Classify an array of features with jenks method
 * @param {object} features array of GeoJSON features
 * @param {object} params parameters to compute the classification
 * @param {string} params.attribute the name of the attribute to use for classification
 * @param {number} params.intervals number of expected classes
 * @param {string} params.ramp the identifier of the color ramp
 * @param {boolean} params.reverse reverse the ramp color classification
 * @returns {promise} return classification object
 */
const jenks = (features, params) => getSimpleStatistics().then(({ jenks: jenksMethod }) => {
    const values = features.map(feature => feature?.properties?.[params.attribute]).filter(value => !isNil(value)).sort((a, b) => a - b);
    const paramIntervals = params.intervals;
    const intervals = paramIntervals > values.length ? values.length : paramIntervals;
    const classes = jenksMethod(values, intervals);
    const colors = getColorClasses({ ...params, intervals  });
    return {
        data: {
            classification: classes.reduce((acc, min, idx) => {
                const max = classes[idx + 1];
                if (max !== undefined) {
                    const color = colors[idx];
                    return [ ...acc, { color, min, max }];
                }
                return acc;
            }, [])
        }
    };
});
/**
 * Classify an array of features with equal interval method
 * @param {object} features array of GeoJSON features
 * @param {object} params parameters to compute the classification
 * @param {string} params.attribute the name of the attribute to use for classification
 * @param {number} params.intervals number of expected classes
 * @param {string} params.ramp the identifier of the color ramp
 * @param {boolean} params.reverse reverse the ramp color classification
 * @returns {promise} return classification object
 */
const equalInterval = (features, params) => getSimpleStatistics().then(({ equalIntervalBreaks }) => {
    const values = features.map(feature => feature?.properties?.[params.attribute]).filter(value => !isNil(value)).sort((a, b) => a - b);
    const classes = equalIntervalBreaks(values, params.intervals);
    const colors = getColorClasses(params);
    return {
        data: {
            classification: classes.reduce((acc, min, idx) => {
                const max = classes[idx + 1];
                if (max !== undefined) {
                    const color = colors[idx];
                    return [ ...acc, { color, min, max }];
                }
                return acc;
            }, [])
        }
    };
});
/**
 * Classify an array of features with unique interval method
 * @param {object} features array of GeoJSON features
 * @param {object} params parameters to compute the classification
 * @param {string} params.attribute the name of the attribute to use for classification
 * @param {string} params.ramp the identifier of the color ramp
 * @param {boolean} params.reverse reverse the ramp color classification
 * @returns {promise} return classification object
 */
const uniqueInterval = (features, params) => {
    const classes = uniq(features.map(feature => feature?.properties?.[params.attribute])).sort((a, b) => a > b ? 1 : -1);
    const colors = getColorClasses({ ...params, intervals: classes.length });
    return Promise.resolve({
        data: {
            classification: classes.map((value, idx) => {
                return {
                    color: colors[idx],
                    unique: value
                };
            })
        }
    });
};

const methods = {
    quantile,
    jenks,
    equalInterval,
    uniqueInterval
};
/**
 * Classify a GeoJSON feature collection
 * @param {object} geojson a GeoJSON feature collection
 * @param {object} params parameters to compute the classification
 * @param {string} params.method classification methods, one of: `quantile`, `jenks`, `equalInterval` or `uniqueInterval`
 * @param {string} params.attribute the name of the attribute to use for classification
 * @param {number} params.intervals number of expected classes
 * @param {string} params.ramp the identifier of the color ramp
 * @param {boolean} params.reverse reverse the ramp color classification
 * @returns {promise} return classification object
 */
export const classifyGeoJSON = (geojson, params) => {
    const features = geojson.type === 'FeatureCollection'
        ? geojson.features
        : [];
    return methods[params.method](features, params);
};

classifyGeoJSON.availableMethods = Object.keys(methods);
