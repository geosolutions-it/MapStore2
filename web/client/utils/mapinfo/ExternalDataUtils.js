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
const escapeCQLStrings = (value) => value?.replace ? value.replace(/'/g, "''") : value;

/**
 * Validates the required fields, property placeholders and CQL syntax.
 * @return {string|null} translation key for the error, or null when valid
 */
export const validateExternalDataConfiguration = ({ url, layerName, cqlFilter } = {}) => {
    if (!url?.trim() || !layerName?.trim() || !cqlFilter?.trim()) {
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
 * feature. Quotes remain part of the configured template; interpolated string
 * content is escaped according to CQL single-quote rules.
 * @return {string} CQL filter ready for the external WFS request
 */
export const interpolateExternalDataCQL = (cqlFilter = '', feature = {}) =>
    cqlFilter.replace(PLACEHOLDER, (placeholder, dotProperty, bracketProperty) => {
        const propertyName = dotProperty || bracketProperty;
        const properties = feature?.properties || {};
        if (!Object.prototype.hasOwnProperty.call(properties, propertyName)) {
            const error = new Error(`Missing source feature property: ${propertyName}`);
            error.code = 'MISSING_SOURCE_PROPERTY';
            error.propertyName = propertyName;
            throw error;
        }
        const value = properties[propertyName];
        if (value === null || value === undefined) {
            const error = new Error(`Null source feature property: ${propertyName}`);
            error.code = 'MISSING_SOURCE_PROPERTY';
            error.propertyName = propertyName;
            throw error;
        }
        return escapeCQLStrings(`${value}`);
    });
