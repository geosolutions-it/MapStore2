/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    getDefaultSupportedGetFeatureInfoFormats,
    getDefaultSupportedGetMapFormat,
    isValidGetMapFormat,
    isValidGetFeatureInfoFormat,
    getLayerOptions
} from '../WMSUtils';
import { setConfigProp } from '../ConfigUtils';

describe('Test the WMSUtils', () => {
    it('getDefaultSupportedGetFeatureInfoFormats', () => {
        expect(getDefaultSupportedGetFeatureInfoFormats()).toEqual(['text/plain', 'text/html', 'application/json']);
    });
    it('getDefaultSupportedGetMapFormat', () => {
        expect(getDefaultSupportedGetMapFormat()).toEqual(['image/png', 'image/gif', 'image/jpeg', 'image/png8', 'image/png; mode=8bit', 'image/png; mode=24bit', 'image/vnd.jpeg-png', 'image/vnd.jpeg-png8']);
    });
    it('getDefaultSupportedGetMapFormat with custom formats', () => {
        const customFormat = 'image/png; mode:16bit';
        setConfigProp('supportedGetMapFormats', [customFormat]);
        expect(getDefaultSupportedGetMapFormat().includes(customFormat)).toBe(true);
        setConfigProp('supportedGetMapFormats', undefined);
    });
    it('isValidGetMapFormat', () => {
        expect(isValidGetMapFormat('image/png')).toBe(true);
        expect(isValidGetMapFormat('image/svg')).toBe(false);
    });
    it('isValidGetFeatureInfoFormat', () => {
        expect(isValidGetFeatureInfoFormat('text/plain')).toBe(true);
        expect(isValidGetFeatureInfoFormat('application/vnd.ogc.gml')).toBe(false);
    });
    it('test getLayerOptions', () => {
        expect(getLayerOptions()).toEqual({});
        const capabilities = {
            Style: { Name: 'generic' },
            Abstract: 'description',
            LatLonBoundingBox: {$: { minx: -180, miny: -90, maxx: 180, maxy: 90 }}
        };
        expect(getLayerOptions(capabilities))
            .toEqual({
                capabilities,
                description: 'description',
                boundingBox: { minx: -180, miny: -90, maxx: 180, maxy: 90 },
                availableStyles: [{ name: 'generic' }]
            });
    });
});
