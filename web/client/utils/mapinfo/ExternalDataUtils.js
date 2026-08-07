/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { read as readCQL } from '../ogc/Filter/CQL/parser';

export const EXTERNAL_DATA = 'EXTERNAL_DATA';

const PLACEHOLDER = /\$\{\s*properties(?:\.([A-Za-z_$][\w$]*)|\[['"]([^'"]+)['"]\])\s*\}/g;
const DOUBLE_QUOTED_PLACEHOLDER = /"[^"]*\$\{\s*properties(?:\.[A-Za-z_$][\w$]*|\[['"][^'"]+['"]\])\s*\}[^"]*"/;
// the only literals CQL accepts outside a quoted string
const UNQUOTED_LITERAL = /^(-?\d+(\.\d+)?|true|false)$/i;
const escapeCQLStrings = (value) => value.replace(/'/g, "''");

// quote parity is reliable because CQL escapes a quote by doubling it
const isInsideQuotedLiteral = (cqlFilter, offset) =>
    (cqlFilter.slice(0, offset).match(/'/g) || []).length % 2 === 1;

const createError = (message, code, properties = {}) =>
    Object.assign(new Error(message), { code, ...properties });

/**
 * Validates the required fields, property placeholders and CQL syntax.
 * @return {string|null} translation key for the error, or null when valid
 */
export const validateExternalDataConfiguration = ({ url, typeName, cqlFilter } = {}) => {
    if (!url?.trim() || !typeName?.trim() || !cqlFilter?.trim()) {
        return 'layerProperties.externalData.validation.missingFields';
    }
    const placeholders = cqlFilter.match(PLACEHOLDER) || [];
    const withoutValidPlaceholders = cqlFilter.replace(PLACEHOLDER, '');
    if (!placeholders.length || /\$\{/.test(withoutValidPlaceholders)) {
        return 'layerProperties.externalData.validation.invalidPlaceholder';
    }
    if (DOUBLE_QUOTED_PLACEHOLDER.test(cqlFilter)) {
        return 'layerProperties.externalData.validation.invalidDoubleQuotedPlaceholder';
    }
    try {
        readCQL(cqlFilter.replace(PLACEHOLDER, '1'));
    } catch (e) {
        return 'layerProperties.externalData.validation.invalidCql';
    }
    return null;
};

/**
 * Interpolates an External Data CQL template with the properties of a source
 * feature. Quoted values are escaped, unquoted values must be literals.
 * @return {string} CQL filter ready for the external WFS request
 */
export const interpolateExternalDataCQL = (cqlFilter = '', feature = {}) => {
    const interpolatedCQL = cqlFilter.replace(PLACEHOLDER, (placeholder, dotProperty, bracketProperty, offset) => {
        const propertyName = dotProperty || bracketProperty;
        const properties = feature?.properties || {};
        if (!Object.prototype.hasOwnProperty.call(properties, propertyName)) {
            throw createError(`Missing source feature property: ${propertyName}`, 'MISSING_SOURCE_PROPERTY', { propertyName });
        }
        const value = properties[propertyName];
        if (value === null || value === undefined) {
            throw createError(`Null source feature property: ${propertyName}`, 'MISSING_SOURCE_PROPERTY', { propertyName });
        }
        const stringValue = `${value}`;
        if (isInsideQuotedLiteral(cqlFilter, offset)) {
            return escapeCQLStrings(stringValue);
        }
        if (!UNQUOTED_LITERAL.test(stringValue)) {
            throw createError(`Unsafe value for unquoted placeholder: ${propertyName}`, 'UNSAFE_SOURCE_VALUE', { propertyName });
        }
        return stringValue;
    });
    try {
        readCQL(interpolatedCQL);
    } catch (e) {
        throw createError('The interpolated CQL filter is not valid', 'INVALID_INTERPOLATED_CQL', { cqlFilter: interpolatedCQL });
    }
    return interpolatedCQL;
};
