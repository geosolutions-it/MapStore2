/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { trim } from 'lodash';
import isString from 'lodash/isString';
import tinycolor from 'tinycolor2';

const DEFAULT_POINT_SIZE = 1;

function formatExpression(property, operator, value) {
    const isValidProperty = `!(\${${property}} === undefined${value === null ? '' : ` || \${${property}} === null`})`;
    if (operator === '=~') {
        return `(${isValidProperty} && regExp('${value}').test(\${${property}}) === true)`;
    }
    return `(${isValidProperty} && \${${property}} ${operator} ${isString(value) ? `'${value}'` : value})`;
}

function filterToExpression(filter) {

    const comparisonMap = {
        '==': '===',
        '>': '>',
        '>=': '>=',
        '<': '<',
        '<=': '<=',
        '!=': '!==',
        '*=': '=~'
    };

    const [operator, ...operands] = filter;

    switch (operator) {
    case '||':
    case '&&':
        return `(${operands.map((filterArray) => filterToExpression(filterArray)).join(` ${operator} `)})`;
    case '>':
    case '<':
    case '>=':
    case '<=':
    case '!=':
    case '==':
    case '*=':
        const [ property, value ] = operands;
        const comparisonOperator = comparisonMap[operator];
        return formatExpression(property, comparisonOperator, value);
    default:
        return '';
    }
}

function formatFilter(filter) {
    if (!filter) {
        return true;
    }
    return filterToExpression(filter);
}

function checkValueConditions({ conditions }) {
    if (conditions.length === 1 && conditions[0][0] === true) {
        return conditions[0][1];
    }
    return { conditions };
}

function getStyleJSONFromRules({ name: title, rules = [] } = {}) {
    const reverseRules = [...rules].reverse();
    const isPointCloud = reverseRules.find(({ symbolizers }) => symbolizers[0].kind === 'Mark');
    const colorConditions = reverseRules
        .map(({ filter, symbolizers }) => {
            return [
                formatFilter(filter),
                isPointCloud && (symbolizers[0].fillOpacity || 0) === 0
                    ? `\${COLOR}`
                    : `color('${symbolizers[0].color}', ${symbolizers[0].fillOpacity})`
            ];
        });
    const validBaseColor = colorConditions.find(([expression]) => expression === true);
    const showParam = !validBaseColor && {
        show: colorConditions.filter(condition => condition !== true).map(([expression]) => expression).join(' || ')
    };
    const pointSizeConditions = reverseRules.map(({ filter, symbolizers }) => {
        return [formatFilter(filter), symbolizers[0].radius || DEFAULT_POINT_SIZE];
    });
    const names = reverseRules.map(({ name }) => name);
    const isNamesValid = !!names.find(name => !!name);
    return {
        ...showParam,
        color: checkValueConditions({
            conditions: !validBaseColor
                ? [...colorConditions, [true, 'color(\'#ffffff\', 1)']]
                : colorConditions
        }),
        ...(isPointCloud && {
            pointSize: checkValueConditions({
                conditions: !validBaseColor
                    ? [...pointSizeConditions, [true, DEFAULT_POINT_SIZE]]
                    : pointSizeConditions
            })
        }),
        ...((title || isNamesValid) && {
            meta: {
                ...(title && { title: `'${title}'` }),
                ...(isNamesValid && { names: `'${names.join(',')}'` })
            }
        })
    };
}

function parseColorValue(value) {
    if (/rgb\(|rgba\(|hsl\(|hsla\(/.test(value)) {
        const color = tinycolor(value);
        return {
            color: color.toHexString(),
            fillOpacity: color.getAlpha()
        };
    }
    if (/color\(/.test(value)) {
        const [color, opacity] = value.replace(/color\(|\)/g, '').split(',');
        return {
            color: color.replace(/\'/g, ''),
            fillOpacity: parseFloat(opacity !== undefined ? opacity : 1)
        };
    }
    // fallback color
    return {
        color: '#ffffff',
        fillOpacity: 1
    };
}

function getGeoStylerStyleFromStyleObj({ color, pointSize, meta } = {}) {

    const names = meta?.names ? trim(meta.names, '\'').split(',') : [];

    const rules = isString(color)
        ? [{
            filter: undefined,
            name: names[0] || '',
            symbolizers: [{
                kind: pointSize ? 'Mark' : 'Fill',
                ...parseColorValue(color)
            }]
        }]
        : color?.conditions?.map((condition, idx) => {
            const value = condition[1];
            return {
                filter: undefined,
                name: names[idx] || '',
                symbolizers: [{
                    kind: pointSize ? 'Mark' : 'Fill',
                    ...parseColorValue(value)
                }]
            };
        });
    return {
        name: meta?.title ? trim(meta.title, '\'') : '',
        rules: [...rules].reverse()
    };
}

class ThreeDTilesStyleParser {
    readStyle(styleJSON) {
        return new Promise((resolve, reject) => {
            try {
                const geoStylerStyle = getGeoStylerStyleFromStyleObj(styleJSON);
                resolve(geoStylerStyle);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                const styleJSON = getStyleJSONFromRules(geoStylerStyle);
                resolve(styleJSON);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default ThreeDTilesStyleParser;
