/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { getFormatForResponse, getVisibleFeatureRow } from '../IdentifyUtils';
import { INFO_FORMATS } from '../FeatureInfoUtils';

describe('IdentifyUtils', () => {
    it('getFormatForResponse WMS response', () => {
        expect(getFormatForResponse({ queryParams: { info_format: INFO_FORMATS.HTML } })).toBe(INFO_FORMATS.HTML);
    });
    it('getFormatForResponse WFS response', () => {
        expect(getFormatForResponse({ queryParams: { outputFormat: INFO_FORMATS.JSON } })).toBe(INFO_FORMATS.JSON);
    });
    it('getVisibleFeatureRow keeps properties and fields when no field declares a visibility', () => {
        const feature = { properties: { a: 1, b: 2 } };
        const objectFields = [{ name: 'a' }, { name: 'b', alias: 'B' }];
        const objectRow = getVisibleFeatureRow(feature, objectFields);
        expect(objectRow.feature.properties).toBe(feature.properties);
        expect(objectRow.feature.mediaTypeValues).toEqual({});
        expect(objectRow.fields).toBe(objectFields);

        // vector, model, cog and flatgeobuf layers expose fields as plain names
        const nameFields = ['a', 'b'];
        const nameRow = getVisibleFeatureRow(feature, nameFields);
        expect(nameRow.feature.properties).toBe(feature.properties);
        expect(nameRow.feature.mediaTypeValues).toEqual({});
        expect(nameRow.fields).toBe(nameFields);
    });

    it('getVisibleFeatureRow keeps only the visible properties when visibility is configured', () => {
        const row = getVisibleFeatureRow(
            { properties: { a: 1, b: 2, unknown: 3 } },
            [
                { name: 'a', visible: true },
                { name: 'b', visible: false },
                { name: 'c' }
            ]
        );
        // a property without a matching field is dropped, a field without the flag stays visible
        expect(row.feature.properties).toEqual({ a: 1 });
        expect(row.fields.map(({ name }) => name)).toEqual(['a', 'c']);
    });
    it('getVisibleFeatureRow keeps only configured media type values', () => {
        const row = getVisibleFeatureRow(
            { properties: { resource: 'file.jpg', mimeType: 'image/jpeg', secret: 'hidden' } },
            [
                { name: 'resource', visible: true, displayType: 'media', mediaTypeAttribute: 'mimeType' },
                { name: 'mimeType', visible: false },
                { name: 'secret', visible: false }
            ]
        );
        expect(row.feature.mediaTypeValues).toEqual({ resource: 'image/jpeg' });
        expect(row.feature.mediaTypeValues.secret).toNotExist();
    });
    it('getVisibleFeatureRow does not alter the source feature', () => {
        const feature = {
            id: 'feature.1',
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { a: 1, b: 2 }
        };
        const row = getVisibleFeatureRow(feature, [
            { name: 'a', visible: true },
            { name: 'b', visible: false }
        ]);
        expect(feature.properties).toEqual({ a: 1, b: 2 });
        expect(row.feature).toNotBe(feature);
        expect(row.feature.id).toBe('feature.1');
        expect(row.feature.type).toBe('Feature');
        expect(row.feature.geometry).toBe(feature.geometry);
    });
});
