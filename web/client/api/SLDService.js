/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { urlParts } = require('../utils/URLUtils');
const url = require('url');
const { isArray, sortBy, head, castArray, isNumber } = require('lodash');
const assign = require('object-assign');
const chroma = require('chroma-js');

const isAttributeAllowed = (type) => ['Integer', 'Long', 'Double', 'Float', 'BigDecimal'].indexOf(type) !== -1;
const getSimpleType = () => {
    return 'number';
};

const addViewParam = (actual, key, value) => {
    return {
        viewparams: (actual ? (actual + ';') : '') + key + ':' + value
    };
};

const isParam = (key, params = []) => {
    return params.filter(f => f.field === key).length > 0;
};

const isViewParam = (key, params) => {
    return isParam(key, params);
};

const getCustomClassification = (classification) => {
    if (classification) {
        return {
            customClasses: classification.reduce((previous, classItem) => {
                return [...previous, classItem.min + ',' + classItem.max + ',' + classItem.color];
            }, []).join(';')
        };
    }
    return {};
};

const standardColors = [{
    name: 'red',
    colors: ['#000', '#f00']
}, {
    name: 'green',
    colors: ['#000', '#0f0']
}, {
    name: 'blue',
    colors: ['#000', '#00f']
}, {
    name: 'gray',
    colors: ['#333', '#eee']
}, {
    name: 'jet',
    colors: ['#00f', '#ff0', '#f00']
}];

const getColor = (layer, name, intervals) => {
    const chosenColors = head((layer.thematic.colors || layer.thematic.additionalColors || []).filter(c => c.name === name)) ||
        head(standardColors.filter(c => c.name === name));
    if (chosenColors && chosenColors.colors.length >= 2) {
        return {
            ramp: "custom",
            colors: chroma.scale(chosenColors.colors).colors(intervals).join(',')
        };
    }
    return { ramp: name };
};

const mapParams = (layer, params) => {
    const configParams = layer.thematic && layer.thematic.params || [];
    const otherParams = layer.thematic && layer.thematic.fieldAsParam && ['field'] || [];
    return Object.keys(params).reduce((previous, key) => {
        if (isViewParam(key, [...configParams, ...otherParams])) {
            return assign(previous, addViewParam(previous.viewparams, key, params[key]));
        }
        if (key === 'ramp') {
            return assign(previous, getColor(layer, params[key], params.intervals || 5));
        }
        if (key === 'classification') {
            return assign(previous, getCustomClassification(params[key]));
        }
        if (key === 'attribute') {
            return assign(previous, {
                attribute: layer.thematic && layer.thematic.fieldAsParam ? params[key] : params.field
            });
        }
        if (key === 'field' && layer.thematic && !layer.thematic.fieldAsParam) {
            return previous;
        }
        if (key === 'strokeWeight' && !params.strokeOn) {
            return assign(previous, {
                [key]: -1
            });
        }
        if (key === 'strokeOn') {
            return previous;
        }
        return assign(previous, {
            [key]: params[key]
        });
    }, {});
};

const getUrl = (parts) => {
    return assign({
        protocol: parts.protocol,
        hostname: parts.domain
    }, parts.port ? {
        port: parts.port
    } : {});
};

const getNumber = (candidates) => {
    return candidates.reduce((previous, current) => {
        return isNumber(current) ? current : previous;
    }, null);
};

const getGeometryType = (rule) => {
    if (rule.PolygonSymbolizer) {
        return 'Polygon';
    }
    if (rule.LineSymbolizer) {
        return 'LineString';
    }
    if (rule.PointSymbolizer) {
        return 'Point';
    }
};

const getRuleColor = (rule) => {
    if (rule.PolygonSymbolizer) {
        return rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.CssParameter
            && rule.PolygonSymbolizer.Fill.CssParameter.$ || '#808080'; // OGC default color
    }
    if (rule.LineSymbolizer) {
        return rule.LineSymbolizer.Stroke && rule.LineSymbolizer.Stroke.CssParameter
            && rule.LineSymbolizer.Stroke.CssParameter.$ || '#808080'; // OGC default color
    }
    if (rule.PointSymbolizer) {
        return rule.PointSymbolizer.Graphic && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Fill
            && rule.PointSymbolizer.Graphic.Mark.Fill.CssParameter
            && rule.PointSymbolizer.Graphic.Mark.Fill.CssParameter.$ || '#808080'; // OGC default color
    }
    return '#808080';
};

const validateClassification = (classificationObj) => {
    if (!classificationObj || !classificationObj.Rules || !classificationObj.Rules.Rule) {
        throw new Error("toc.thematic.invalid_object");
    }
    const rules = castArray(classificationObj.Rules.Rule);
    rules.forEach(rule => {
        if (!rule.PolygonSymbolizer && !rule.LineSymbolizer && !rule.PointSymbolizer) {
            throw new Error("toc.thematic.invalid_geometry");
        }
    });
};

/**
 * API for GeoServer SLDService {@link http://docs.geoserver.org/stable/en/user/community/sldservice/index.html}.
 *
 * Can be used to implement @see {@link api/plugins#plugins.ThematicLayer}
 *
 * @memberof API
 * @name SLDService
 */
const API = {
    /**
     * Returns a url to get a full SLD for classification, given a layer cfg object and a list
     * of classification parameters.
     *
     * @memberof API.SLDService
     * @method getStyleService
     * @param {object} layer layer configuration object
     * @param {object} params map of classification parameters: they will be used to build parameters for the SLDService classify service
     * @returns {string} url to get a classification SLD
     */
    getStyleService: (layer, params) => {
        const parts = urlParts(isArray(layer.url) ? layer.url[0] : layer.url);
        return url.format(assign(getUrl(parts), {
            pathname: parts.applicationRootPath + "/rest/sldservice/" + layer.name + "/classify.xml",
            query: assign({}, mapParams(layer, params), { fullSLD: true })
        }));
    },
    /**
     * Returns a url to get a classification JSON, given a layer cfg object and a list
     * of classification parameters.
     *
     * @memberof API.SLDService
     * @method getStyleMetadataService
     * @param {object} layer layer configuration object
     * @param {object} params map of classification parameters: they will be used to build parameters for the SLDService classify service
     * @returns {string} url to get a classification metadata JSON
     */
    getStyleMetadataService: (layer, params) => {
        const parts = urlParts(isArray(layer.url) ? layer.url[0] : layer.url);
        return url.format(assign(getUrl(parts), {
            pathname: parts.applicationRootPath + "/rest/sldservice/" + layer.name + "/classify.json",
            query: params
        }));
    },
    /**
     * Returns an object with additional parameters to apply a classification style to a WMS layer.
     *  - SLD: dynamic link to the classification style service
     *  - viewparams: SQL views parameters actual values
     *
     * @memberof API.SLDService
     * @method getStyleParameters
     * @param {object} layer layer configuration object
     * @param {object} params map of classification parameters: they will be used to build parameters for the SLDService classify service
     * @returns {object} classification style object (SLD, viewparams)
     */
    getStyleParameters: (layer, params) => {
        return {
            SLD: API.getStyleService(layer, params),
            viewparams: mapParams(layer, params).viewparams
        };
    },
    /**
     * Returns an object with parameters mapped from UI ones, to WMS ones.
     *
     * @memberof API.SLDService
     * @method getMetadataParameters
     * @param {object} layer layer configuration object
     * @param {object} params map of classification parameters: they will be used to build parameters for the SLDService classify service
     * @returns {object} classification parameters object
     */
    getMetadataParameters: (layer, params) => {
        return mapParams(layer, params);
    },
    /**
     * Returns the url to get a list of fields available for the given layer.
     * If the layer has a datatable configuration property in the thematic object, this is used to extract fields list,
     * otherwise the original layer is used (datatable is used for SQLViews doing aggregation, where the original list of data attributes
     * is not directly available on the aggregated layer).
     *
     * @memberof API.SLDService
     * @method getFieldsService
     * @param {object} layer layer configuration object
     * @returns {string} url of the attributes service
     */
    getFieldsService: (layer) => {
        const parts = urlParts(isArray(layer.url) ? layer.url[0] : layer.url);
        const table = layer.thematic && layer.thematic.datatable || layer.name;
        return url.format(assign(getUrl(parts), {
            pathname: parts.applicationRootPath + "/rest/sldservice/" + table + "/attributes.json"
        }));
    },
    /**
     * Reads attributes returned by the attributes service and builds a simple list of:
     *  - name
     *  - type (only number is currently supported)
     * If the layer has a datatable configuration property in the thematic object, this is used to extract fields list,
     * otherwise the original layer is used (datatable is used for SQLViews doing aggregation, where the original list of data attributes
     * is not directly available on the aggregated layer).
     *
     * @memberof API.SLDService
     * @method readFields
     * @param {object} fieldsObj object returned by SLDService attributes service
     * @returns {array} simplified fields list
     */
    readFields: (fieldsObj) => {
        return sortBy(castArray(fieldsObj.Attributes.Attribute || [])
            .filter(a => isAttributeAllowed(a.type))
            .map(a => ({
                name: a.name,
                type: getSimpleType(a.type)
            })), a => a.name);
    },
    /**
     * Reads classification classes returned by the classification service and builds a simple list of:
     *  - color
     *  - min
     *  - max
     * If the layer has a datatable configuration property in the thematic object, this is used to extract fields list,
     * otherwise the original layer is used (datatable is used for SQLViews doing aggregation, where the original list of data attributes
     * is not directly available on the aggregated layer).
     *
     * @memberof API.SLDService
     * @method readClassification
     * @param {object} classificationObj object returned by SLDService classifier service
     * @returns {array} simplified classification classes list
     */
    readClassification: (classificationObj) => {
        validateClassification(classificationObj);
        return castArray(classificationObj.Rules.Rule || []).map((rule) => ({
            color: getRuleColor(rule),
            type: getGeometryType(rule),
            min: getNumber([rule.Filter.And && (rule.Filter.And.PropertyIsGreaterThanOrEqualTo || rule.Filter.And.PropertyIsGreaterThan).Literal, rule.Filter.PropertyIsEqualTo && rule.Filter.PropertyIsEqualTo.Literal]),
            max: getNumber([rule.Filter.And && (rule.Filter.And.PropertyIsLessThanOrEqualTo || rule.Filter.And.PropertyIsLessThan).Literal, rule.Filter.PropertyIsEqualTo && rule.Filter.PropertyIsEqualTo.Literal])
        })) || [];
    },
    /**
     * supported classification methods
     *
     * @memberof API.SLDService
     * @property {array} methods supported classification methods
     */
    methods: [
        'equalInterval', 'quantile', 'jenks'
    ],
    /**
     * Inlines configuration parameters, replacing known types (e.g. aggregate) with actual configuration.
     *
     * @memberof API.SLDService
     * @method getThematicParameters
     * @param {object} params simplified parameters configuration
     * @returns {array} list of actual parameters configuration (standard params are inlined)
     */
    getThematicParameters: (params) => {
        return params.map((param) => param.type && API.standardParams[param.type] && assign({}, API.standardParams[param.type], param) || param);
    },
    /**
     * Supported known parameters: some parameters have a special behaviour (preconfigured and localized labels and values):
     *  - type=aggregate (sum, count, min, ...)
     *
     * @memberof API.SLDService
     * @property {object} standardParams supported known parameters
     */
    standardParams: {
        aggregate: {
            "title": "toc.thematic.classification_aggregate",
            "defaultValue": "sum",
            "values": [{
                "name": "toc.thematic.values.sum",
                "value": "sum"
            }, {
                "name": "toc.thematic.values.avg",
                "value": "avg"
            }, {
                "name": "toc.thematic.values.count",
                "value": "count"
            },
            {
                "name": "toc.thematic.values.min",
                "value": "min"
            },
            {
                "name": "toc.thematic.values.max",
                "value": "max"
            }]
        }
    },
    /**
     * Gets a list of color samples for all the given palettes.
     *
     * @memberof API.SLDService
     * @method getColors
     * @param {object} baseColors base color palettes
     * @param {object} layer layer configuration (can contain thematic.colors for color palette overrides or thematic.additionalColors for appending)
     * @param {number} samples number of samples for each palette
     * @returns {array} list of palettes with sample colors
     */
    getColors: (baseColors = standardColors, layer, samples) => {
        const colors = layer.thematic.colors || [...baseColors, ...(layer.thematic.additionalColors || [])];

        return colors.map((color) => color.colors.length >= samples ? color : assign({}, color, {
            colors: chroma.scale(color.colors).colors(samples)
        }));
    },
    /**
     * Checks if the given layer has a thematic style applied on it (SLD param not empty)
     *
     * @memberof API.SLDService
     * @method hasThematicStyle
     * @param {object} layer layer configuration
     * @returns {boolean} true if thematic style is applied, false otherwise
     */
    hasThematicStyle: (layer) => {
        return layer && layer.params && layer.params.SLD && true || false;
    },
    /**
     * Removes a thematic style from the given layer (SLD and viewparams params are removed)
     *
     * @memberof API.SLDService
     * @method removeThematicStyle
     * @param {object} params layer params configuration
     * @returns {object} layer params configuration without the thematic style parameters
     */
    removeThematicStyle: (params) => {
        const {SLD, viewparams, ...other} = params;
        return assign({}, other, {
            SLD: null,
            viewparams: null
        });
    },

    defaultParams: {
        attribute: "",
        intervals: 5,
        method: "equalInterval",
        ramp: 'red',
        field: "",
        open: false,
        strokeWeight: 0.2,
        strokeColor: '#ff0000',
        strokeOn: false
    }
};

module.exports = API;
