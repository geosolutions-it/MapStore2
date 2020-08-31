/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isEqual from 'lodash/isEqual';

import {
    getStyleMetadataService,
    readClassification,
    readRasterClassification,
    getColor,
    getCapabilitiesUrl
} from './SLDService';

import axios from '../libs/ajax';
import StylesAPI from './geoserver/Styles';

const SUPPORTED_CLASSIFICATION_METHODS = [
    'equalInterval',
    'quantile',
    'jenks',
    'standardDeviation'
];

const DEFAULT_CLASSIFICATION_METHODS = [
    'equalInterval',
    'quantile',
    'jenks'
];

let cache = {};

/**
 * Update rule in rules array
 * @param {string} ruleId id of rule to update
 * @param {array} rules array of rules
 * @param {function} setRule must return the new rule, eg; (rule) => ({ ...rule, ...newValues })
 * @returns {array} return new rules with updated property
 */
function updateRules(ruleId, rules, setRule = (rl) => rl) {
    return rules.map((rule) => {
        if (rule.ruleId === ruleId) {
            return setRule(rule);
        }
        return rule;
    });
}

/**
 * API for GeoServer StyleEditor
 *
 * Can be used to implement @see {@link api/plugins#plugins.StyleEditor}
 *
 * @memberof API
 * @name StyleEditor
 */
export function clearCache() {
    cache = {};
}

function filterMethods(sldServiceCapabilities) {
    const { capabilities = {} } = sldServiceCapabilities || {};
    const { vector = {} } = capabilities;
    const { raster = {} } = capabilities;
    const vectorMethods = vector.classifications || [];
    const rasterMethods = raster.classifications || [];
    return {
        vector: vectorMethods.filter(method => SUPPORTED_CLASSIFICATION_METHODS.indexOf(method) !== -1),
        raster: rasterMethods.filter(method => SUPPORTED_CLASSIFICATION_METHODS.indexOf(method) !== -1)
    };
}

const API = {
    geoserver: {
        updateStyleService: ({ baseUrl, styleService }) => {
            const serviceBaseUrl = styleService?.isStatic
                ? styleService.baseUrl
                : baseUrl;
            if (cache[serviceBaseUrl]) {
                return new Promise(resolve => resolve(cache[serviceBaseUrl]));
            }
            const styleServiceCapabilitiesUrl = getCapabilitiesUrl({
                url: serviceBaseUrl
            });
            // request style service only if the styleService is not declared in cfg
            const servicePromise = styleService?.isStatic
                ? new Promise(resolve => resolve(styleService))
                : StylesAPI.getStyleService({ baseUrl: serviceBaseUrl });
            return servicePromise
                .then((updatedStyleService) => {
                    // TODO: avoid request if the sld service is not available in GeoServer
                    // this improvement needs a complete support of custom intervals
                    // eg: look in manifest for jars related to sld service
                    return axios.get(styleServiceCapabilitiesUrl)
                        .then(({ data }) => [updatedStyleService, data])
                        .catch(() => [updatedStyleService, null]);
                })
                .then(([updatedStyleService, serviceCapabilities]) => {
                    const newStyleService = {
                        ...updatedStyleService,
                        classificationMethods: serviceCapabilities
                            // use only supported methods on the client
                            ? filterMethods(serviceCapabilities)
                            : {
                                vector: DEFAULT_CLASSIFICATION_METHODS,
                                raster: DEFAULT_CLASSIFICATION_METHODS
                            }
                    };
                    cache[serviceBaseUrl] = newStyleService;
                    return newStyleService;
                });
        }
    }
};

/**
 * Get an updated style service
 * @memberof API.StyleEditor
 * @method updateStyleService
 * @param {object} options new values to update
 * @param {string} options.baseUrl base url of service endpoint
 * @param {object} options.styleService existing style service (this has precedence on baseUrl if is static service)
 * @returns {promise} return new rules with updated style service
 * @example
 * // expected style service in the promise resolve
 * {
 *  "baseUrl": "http://localhost:8080/geoserver/",
 *  "version": "2.18-SNAPSHOT",
 *  "formats": [ "css", "sld"],
 *  "availableUrls": [],
 *  "fonts": [ "Arial" ],
 *  "classificationMethods": {
 *   "vector": [ "equalInterval", "quantile", "jenks", "standardDeviation" ],
 *   "raster": [ "equalInterval", "quantile", "jenks" ]
 *  }
 * }
 */
export function updateStyleService({ baseUrl, styleService }) {
    return API.geoserver.updateStyleService({ baseUrl, styleService });
}
/**
 * Update rules of a style for a vector layer using external SLD services
 * @memberof API.StyleEditor
 * @method classificationVector
 * @param {object} values new values to update
 * @param {object} properties current properties of the rule that needs update
 * @param {array} rules rules of a style object
 * @param {object} layer layer configuration object
 * @returns {promise} return new rules with updated property and classification
 */
export function classificationVector({
    values,
    properties,
    rules,
    layer
}) {

    const paramsKeys = [
        'intervals',
        'method',
        'reverse',
        'attribute',
        'ramp'
    ];

    const params = { ...properties, ...values };
    const { ruleId } = properties;

    // if ramp changes and method is custom interval
    // we should update the color values without a new request
    if (values.ramp !== undefined
        && values.ramp !== properties.ramp
        && params?.method === 'customInterval'
        && !values.classification) {
        const { colors: colorsString } = getColor(undefined, values.ramp, params.intervals);
        const colors = colorsString.split(',');
        return new Promise((resolve) =>
            resolve(
                updateRules(ruleId, rules, (rule) => ({
                    ...rule,
                    ...params,
                    classification: params.classification.map((entry, idx) => ({
                        ...entry,
                        color: colors[idx]
                    })),
                    errorId: undefined
                }))
            )
        );
    }

    const previousParams = paramsKeys.reduce((acc, key) => ({ ...acc, [key]: properties[key] }), {});
    const currentParams = paramsKeys.reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
    const validParameters = !paramsKeys.find(key => params[key] === undefined);
    const needsRequest = validParameters && !isEqual(previousParams, currentParams)
        // not request if the entries are updated manually
        && values?.ramp !== 'custom'
        && params?.method !== 'customInterval';

    if (needsRequest) {
        const customRamp = params.ramp === 'custom' && params.classification.length > 0
            && {
                name: 'custom',
                colors: params.classification.map((entry) => entry.color)
            };
        const rampParams = getColor(undefined, params.ramp, params.intervals, customRamp);
        return axios.get(getStyleMetadataService(layer, {
            intervals: params.intervals,
            method: params.method,
            attribute: params.attribute,
            reverse: params.reverse,
            ...rampParams
        }))
            .then(({ data }) => {
                return updateRules(ruleId, rules, (rule) => ({
                    ...rule,
                    ...values,
                    classification: readClassification(data),
                    errorId: undefined
                }));
            })
            .catch(() => {
                return updateRules(ruleId, rules, (rule) => ({
                    ...rule,
                    ...values,
                    errorId: 'styleeditor.classificationError'
                }));
            });
    }

    return new Promise((resolve) =>
        resolve(
            updateRules(ruleId, rules, (rule) => ({
                ...rule,
                ...values,
                errorId: undefined
            }))
        )
    );
}
/**
 * Update rules of a style for a raster layer using external SLD services
 * @memberof API.StyleEditor
 * @method classificationRaster
 * @param {object} values new values to update
 * @param {object} properties current properties of the rule that needs update
 * @param {array} rules rules of a style object
 * @param {object} layer layer configuration object
 * @returns {promise} return new rules with updated property and classification
 */
export function classificationRaster({
    values,
    properties,
    rules,
    layer
}) {

    const paramsKeys = [
        'intervals',
        'continuous',
        'method',
        'reverse',
        'ramp'
    ];

    const params = { ...properties, ...values};
    const { ruleId } = properties;

    const previousParams = paramsKeys.reduce((acc, key) => ({ ...acc, [key]: properties[key] }), {});
    const currentParams = paramsKeys.reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
    const validParameters = !paramsKeys.find(key => params[key] === undefined);
    const needsRequest = validParameters && !isEqual(previousParams, currentParams);

    if (needsRequest) {
        const customRamp = params.ramp === 'custom' && params.classification.length > 0
            && { name: 'custom', colors: params.classification.map((entry) => entry.color) };
        const rampParams = getColor(undefined, params.ramp, params.intervals, customRamp);
        return axios.get(getStyleMetadataService(layer, {
            intervals: params.intervals,
            continuous: params.continuous,
            method: params.method,
            reverse: params.reverse,
            ...rampParams
        }))
            .then(({ data }) => {
                return updateRules(ruleId, rules, (rule) => ({
                    ...rule,
                    ...values,
                    classification: readRasterClassification(data),
                    errorId: undefined
                }));
            })
            .catch(() => {
                return updateRules(ruleId, rules, (rule) => ({
                    ...rule,
                    ...values,
                    errorId: 'styleeditor.classificationRasterError'
                }));
            });
    }
    return new Promise((resolve) =>
        resolve(
            updateRules(ruleId, rules, (rule) => ({
                ...rule,
                ...values,
                errorId: undefined
            }))
        )
    );
}


export default {
    classificationVector,
    classificationRaster,
    updateStyleService,
    clearCache
};
