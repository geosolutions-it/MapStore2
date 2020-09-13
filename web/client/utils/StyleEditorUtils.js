/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import head from 'lodash/head';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import uuidv1 from 'uuid/v1';


import url from 'url';

const { baseTemplates, customTemplates } = require('./styleeditor/stylesTemplates');

export const STYLE_ID_SEPARATOR = '___';
export const STYLE_OWNER_NAME = 'styleeditor';

const StyleEditorCustomUtils = {};

const EDITOR_MODES = {
    css: 'geocss',
    sld: 'xml'
};

const getGeometryType = (geomProperty = {}) => {
    const localPart = geomProperty.type && geomProperty.type.localPart && geomProperty.type.localPart.toLowerCase() || '';
    if (localPart.indexOf('polygon') !== -1
        || localPart.indexOf('surface') !== -1) {
        return 'polygon';
    } else if (localPart.indexOf('linestring') !== -1) {
        return 'linestring';
    } else if (localPart.indexOf('point') !== -1) {
        return 'point';
    }
    return 'vector';
};

/**
 * Utility functions for Share tools.
 * @memberof utils
 */

/**
 * generate a temporary id for style
 * @return {string} id
 */
export const generateTemporaryStyleId = () => `${uuidv1()}_ms_${Date.now().toString()}`;
/**
 * generate a style id with title included
 * @param  {object} properties eg: {title: 'My Title'}
 * @return {string} id
 */
export const generateStyleId = ({title = ''}) => `${title.toLowerCase().replace(/\s/g, '_')}${STYLE_ID_SEPARATOR}${uuidv1()}`;
/**
 * extract feature properties from a layer object
 * @param  {object} layer layer object
 * @return {object} {geometryType, properties, owsType}
 */
export const extractFeatureProperties = ({describeLayer = {}, describeFeatureType = {}} = {}) => {

    const owsType = describeLayer && describeLayer.owsType || null;
    const descProperties = get(describeFeatureType, 'complexType[0].complexContent.extension.sequence.element') || null;
    const geomProperty = descProperties && head(descProperties.filter(({ type }) => type && type.prefix === 'gml'));
    const geometryType = owsType === 'WCS' && 'raster' || geomProperty && owsType === 'WFS' && getGeometryType(geomProperty) || null;
    const properties = geometryType === 'raster'
        ? describeLayer.bands
        : descProperties && descProperties.reduce((props, { name, type = {} }) => ({
            ...props,
            [name]: {
                localPart: type.localPart,
                prefix: type.prefix
            }
        }), {});
    return {
        geometryType,
        properties,
        owsType
    };
};
/**
 * convert style format to codemirror mode
 * @param  {string} format style format css or sld
 * @return {string} mode name for codemirror or format string
 */
export const getEditorMode = format => EDITOR_MODES[format] || format;
/**
 * verify if layer url is valid for style editor service
 * @param  {object} layer layer object
 * @param  {object} service style service object
 * @return {bool}
 */
export const isSameOrigin = (layer = {}, service = {}) => {
    if (StyleEditorCustomUtils.isSameOrigin) return StyleEditorCustomUtils.isSameOrigin(layer, service);
    if (!service.baseUrl || !layer.url) return false;
    const availableUrls = [service.baseUrl, ...(service.availableUrls || [])];
    const parsedAvailableUrls = availableUrls.map(availableUrl => {
        const urlObj = url.parse(availableUrl);
        return `${urlObj.protocol}//${urlObj.host}`;
    });
    const layerObj = url.parse(layer.url);
    const layerUrl = `${layerObj.protocol}//${layerObj.host}`;
    return parsedAvailableUrls.indexOf(layerUrl) !== -1;
};
/**
 * return a ist of style templates
 * Can be overrided with setCustomUtils, must return an array of templates
 * @return {array} list of templates
 */
export const getStyleTemplates = () => {
    if (StyleEditorCustomUtils.getStyleTemplates) {
        const generatedTemplates = StyleEditorCustomUtils.getStyleTemplates();
        return [...(isArray(generatedTemplates) ? generatedTemplates : [] ), ...baseTemplates];
    }
    return [...customTemplates, ...baseTemplates];
};
/**
 * Override function in StyleEditorUtils (only isSameOrigin, getStyleTemplates)
 * @param  {string} name function name
 * @param  {function} fun function to override
 */
export const setCustomUtils = (name, fun) => {
    StyleEditorCustomUtils[name] = fun;
};
/**
 * Get name and workspace from a goeserver name
 * @param  {string} name function name
 * @return  {object}
 */
export const getNameParts = (name) => {
    const layerPart = isString(name) && name.split(':') || [];
    return {
        workspace: layerPart[1] && layerPart[0],
        name: layerPart[1] || layerPart[0]
    };
};
/**
 * Stringify name and workspace
 * @param  {object} styleObj style object
 * @param  {string} styleObj.name name of style without workspace
 * @param  {object} styleObj.workspace {name: 'name of workspace'}
 * @return  {string} combination of workspace and name, eg. 'workspace:stylename'
 */
export const stringifyNameParts = ({name, workspace}) => `${workspace && workspace.name && `${workspace.name}:` || ''}${name}`;

const loopFilterObjToFilterArray = (filterObj, groupField) => {

    if (!(filterObj && filterObj.filterFields && filterObj.groupFields)
    || !groupField) {
        return null;
    }

    const filterFields = filterObj.filterFields.filter((filterField) => filterField.groupId === groupField.id);
    const groupFields = filterObj.groupFields.filter((group) => group.groupId === groupField.id);

    const allFields = [...filterFields, ...groupFields];

    const mapOperators = {
        'OR': '||',
        'AND': '&&',
        'like': '*=',
        '=': '==',
        '<>': '!=',
        'isNull': '=='
    };

    const content = allFields.map((field) => {
        if (field.rowId !== undefined) {
            const {operator, attribute, value} = field;
            if (operator && attribute && !isNil(value)) {
                return [
                    mapOperators[operator] || operator,
                    attribute,
                    operator === 'isNull' ? null : value
                ];
            }
            return null;
        }
        return loopFilterObjToFilterArray(filterObj, field);
    }).filter(value => value);

    const { logic } = groupField;
    if (content.length === 0) {
        return null;
    }
    return [mapOperators[logic], ...content];
};

export const filterObjectToFilterArray = (filterObj) => {
    const startGroupField = filterObj?.groupFields?.find(({ groupId }) => !groupId);
    return startGroupField && loopFilterObjToFilterArray(filterObj, startGroupField);
};

const loopFilterArrayToFilterObject = (filterArr, { index = 0, groupId } = {}, callback = () => {}) => {
    if (!filterArr) {
        return null;
    }
    const mapOperators = {
        '||': 'OR',
        '&&': 'AND',
        '*=': 'like',
        '==': '=',
        '!=': '<>'
    };
    const [first, ...others] = filterArr;
    const isFirstArray = isArray(first);
    const operator = isFirstArray ? first[0] : first;
    const operands = isFirstArray ? first.filter((val, idx) => idx !== 0) : others;

    if (operator === '||' || operator === '&&') {
        const newGroupId = uuidv1();
        callback('groupField', {
            id: newGroupId,
            index,
            logic: mapOperators[operator]
        });
        return loopFilterArrayToFilterObject(others, {
            index: index + 1,
            groupId: newGroupId
        }, callback);
    }
    if (operator) {
        callback('filterField', {
            attribute: operands[0],
            groupId,
            operator: mapOperators[operator] || operator,
            rowId: uuidv1(),
            type: isNaN(parseFloat(operands[1])) ? 'string' : 'number',
            value: operands[1]
        });
        return loopFilterArrayToFilterObject(others, {
            index,
            groupId
        }, callback);
    }

    return null;
};

export const filterArrayToFilterObject = (filterArr) => {
    let groupFields = [];
    let filterFields = [];
    loopFilterArrayToFilterObject(filterArr, undefined, (type, entry) => {
        if (type === 'groupField') {
            groupFields.push(entry);
        }
        if (type === 'filterField') {
            filterFields.push(entry);
        }
    });
    return {
        groupFields,
        filterFields
    };
};

export function parseJSONStyle(style) {

    if (!(style && style.rules)) {
        return style;
    }

    return {
        ...style,
        rules: flatten(style.rules.map((rule) => {
            if (rule.kind === 'Classification') {
                return (rule.classification || []).map((entry, idx) => {
                    const lessThan = idx === rule.classification.length - 1
                        ? '<='
                        : '<';
                    const minFilter = entry.min !== null ? [['>=', rule.attribute, entry.min]] : [];
                    const maxFilter = entry.max !== null ? [[lessThan, rule.attribute, entry.max]] : [];
                    const minLabel = entry.min !== null && '>= ' + entry.min;
                    const maxLabel = entry.max !== null && lessThan + ' ' + entry.max;
                    return {
                        name: minLabel && maxLabel
                            ? minLabel + ' and ' + maxLabel
                            : minLabel || maxLabel,
                        filter: minFilter[0] || maxFilter[0]
                            ? ['&&',
                                ...minFilter,
                                ...maxFilter
                            ]
                            : undefined,
                        ...(rule.scaleDenominator && { scaleDenominator: rule.scaleDenominator }),
                        symbolizers: [
                            omitBy({
                                ...omit(rule, [
                                    'ruleId',
                                    'classification',
                                    'intervals',
                                    'method',
                                    'ramp',
                                    'reverse',
                                    'attribute',
                                    'symbolizerKind'
                                ]),
                                kind: rule.symbolizerKind || 'Fill',
                                color: entry.color
                            }, isUndefined)
                        ]
                    };
                });
            }

            if (rule.kind === 'Raster') {
                const colorMap = rule.classification && rule.classification.length > 0 && {
                    colorMapEntries: (rule.classification || []).map((entry) => ({
                        label: entry.label,
                        quantity: entry.quantity,
                        color: entry.color,
                        opacity: entry.opacity
                    }))
                };
                return {
                    name: rule.name || '',
                    ...(rule.scaleDenominator && { scaleDenominator: rule.scaleDenominator }),
                    symbolizers: [
                        omitBy({
                            ...omit(rule, [
                                'ruleId',
                                'classification',
                                'intervals',
                                'method',
                                'ramp',
                                'reverse',
                                'continuous',
                                'symbolizerKind',
                                'name'
                            ]),
                            kind: 'Raster',
                            ...(colorMap && { colorMap })
                        }, isUndefined)
                    ]
                };
            }

            const filter = filterObjectToFilterArray(rule.filter);

            return {
                ...rule,
                filter,
                symbolizers: (rule?.symbolizers || [])
                    .map((symbolizer) => omitBy(symbolizer, isUndefined))
            };
        }))
    };
}

export function formatJSONStyle(style) {
    return {
        ...style,
        rules: style.rules.map((rule) => {
            return {
                ...rule,
                ruleId: uuidv1(),
                filter: rule.filter && filterArrayToFilterObject(rule.filter),
                symbolizers: rule.symbolizers && rule.symbolizers.map((symbolizer) => {
                    return {
                        ...symbolizer,
                        symbolizerId: uuidv1()
                    };
                }) || []
            };
        })
    };
}

export default {
    STYLE_ID_SEPARATOR,
    STYLE_OWNER_NAME,
    generateTemporaryStyleId,
    generateStyleId,
    extractFeatureProperties,
    getEditorMode,
    isSameOrigin,
    getStyleTemplates,
    setCustomUtils,
    getNameParts,
    stringifyNameParts,
    parseJSONStyle,
    formatJSONStyle
};
