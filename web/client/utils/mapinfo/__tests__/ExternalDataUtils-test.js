/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    interpolateExternalDataCQL,
    validateExternalDataConfiguration
} from '../ExternalDataUtils';

describe('ExternalDataUtils', () => {
    it('interpolates dot and bracket properties and escapes CQL string values', () => {
        const filter = interpolateExternalDataCQL(
            "code = '${properties.code}' AND label = '${properties['display-name']}'",
            {
                properties: {
                    code: "O'Brien",
                    'display-name': 'Main'
                }
            }
        );

        expect(filter).toBe("code = 'O''Brien' AND label = 'Main'");
    });

    it('interpolates numeric values without adding quotes', () => {
        expect(interpolateExternalDataCQL(
            'external_id = ${properties.id}',
            { properties: { id: 10 } }
        )).toBe('external_id = 10');
    });

    it('rejects placeholders surrounded by CQL double quotes', () => {
        expect(validateExternalDataConfiguration({
            url: '/geoserver/wfs',
            typeName: 'workspace:external',
            cqlFilter: 'code = "${properties.code}"'
        })).toBe('layerProperties.externalData.validation.invalidDoubleQuotedPlaceholder');

        expect(validateExternalDataConfiguration({
            url: '/geoserver/wfs',
            typeName: 'workspace:external',
            cqlFilter: "code = '${properties.code}'"
        })).toBe(null);
    });

    it('interpolates a quoted placeholder that is not adjacent to its quotes', () => {
        expect(interpolateExternalDataCQL(
            "label LIKE '${properties.prefix}%'",
            { properties: { prefix: "O'B" } }
        )).toBe("label LIKE 'O''B%'");
    });

    it('rejects a value that would alter the filter through an unquoted placeholder', () => {
        try {
            interpolateExternalDataCQL(
                'external_id = ${properties.id}',
                { properties: { id: '1 OR external_id > 0' } }
            );
            throw new Error('Expected interpolation to fail');
        } catch (error) {
            expect(error.code).toBe('UNSAFE_SOURCE_VALUE');
            expect(error.propertyName).toBe('id');
        }
    });

    it('accepts numeric and boolean values for unquoted placeholders', () => {
        expect(interpolateExternalDataCQL(
            'external_id = ${properties.id}',
            { properties: { id: -1.5 } }
        )).toBe('external_id = -1.5');

        expect(interpolateExternalDataCQL(
            'active = ${properties.active}',
            { properties: { active: true } }
        )).toBe('active = true');
    });

    it('throws a typed error when the interpolated filter is not valid CQL', () => {
        try {
            interpolateExternalDataCQL(
                "code = '${properties.code}' AND",
                { properties: { code: 'a' } }
            );
            throw new Error('Expected interpolation to fail');
        } catch (error) {
            expect(error.code).toBe('INVALID_INTERPOLATED_CQL');
            expect(error.cqlFilter).toBe("code = 'a' AND");
        }
    });

    it('throws a typed error when the source property is missing', () => {
        expect(() => interpolateExternalDataCQL(
            "code = '${properties.code}'",
            { properties: {} }
        )).toThrow(/Missing source feature property: code/);

        try {
            interpolateExternalDataCQL("code = '${properties.code}'", { properties: {} });
        } catch (error) {
            expect(error.code).toBe('MISSING_SOURCE_PROPERTY');
            expect(error.propertyName).toBe('code');
        }
    });

    it('throws a typed error when the source property is nullish', () => {
        [null, undefined].forEach((value) => {
            try {
                interpolateExternalDataCQL(
                    "code = '${properties.code}'",
                    { properties: { code: value } }
                );
                throw new Error('Expected interpolation to fail');
            } catch (error) {
                expect(error.message).toMatch(/Null source feature property: code/);
                expect(error.code).toBe('MISSING_SOURCE_PROPERTY');
                expect(error.propertyName).toBe('code');
            }
        });
    });
});
