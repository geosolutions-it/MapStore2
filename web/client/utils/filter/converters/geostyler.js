/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isArray } from "lodash";

const operatorMap = {
    '==': '=',
    '!=': '<>',
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
    '&&': 'AND',
    '||': 'OR'
};

/**
 * Converts a Geostyler filter to CQL filter
 * @param {object|string} geostylerFilter geostyler filter rules array
 * @returns {string} CQL filter
 */

export const cql = (geostylerFilter) => {
    function parseCondition(filter) {
        if (Array.isArray(filter)) {
            let [operator, ...filterRules] = filter;
            if (operatorMap[operator]) {
                if (operator === '&&' || operator === '||') {
                    return `(${filterRules.map(parseCondition).join(` ${operatorMap[operator]} `)})`;
                }
                let field = filter[1];
                let value = filter[2];
                if (typeof value === 'string') {
                    value = `'${value}'`;
                } else if (typeof value === 'boolean') {
                    value = value ? 'TRUE' : 'FALSE';
                }
                return `${field} ${operatorMap[operator]} ${value}`;

            }
        }
        return '';
    }
    const geostylerRules = isArray(geostylerFilter) ? geostylerFilter : geostylerFilter?.body;
    return parseCondition(geostylerRules);
};

// TODO: create a converter from cql to geostyler rules

export default {
    cql
    // geostyler
};
