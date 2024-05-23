/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    isImageServerUrl,
    isMapServerUrl
} from '../ArcGISUtils';

describe('ArcGISUtils', () => {
    it('isImageServerUrl', () => {
        expect(isImageServerUrl()).toBeFalsy();
        expect(isImageServerUrl('https://localhost/arcgis/rest/services/Name/MapServer')).toBeFalsy();
        expect(isImageServerUrl('https://localhost/arcgis/rest/services/Name/ImageServer')).toBeTruthy();
    });
    it('isMapServerUrl', () => {
        expect(isMapServerUrl()).toBeFalsy();
        expect(isMapServerUrl('https://localhost/arcgis/rest/services/Name/ImageServer')).toBeFalsy();
        expect(isMapServerUrl('https://localhost/arcgis/rest/services/Name/MapServer')).toBeTruthy();
    });
});
