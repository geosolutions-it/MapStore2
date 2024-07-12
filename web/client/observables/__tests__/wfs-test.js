/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toDescribeURL, getFeatureUtilities } from '../wfs';
import expect from 'expect';

describe("WFS Observables", () => {
    it('toDescribeURL', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(toDescribeURL({ name: 'testName', search: { url: _url }}).split('?')[0]).toBe(_url[0]);
    });
    it('getFeatureUtilities', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(getFeatureUtilities(_url, 'filterObject').queryString.split('?')[0]).toBe(_url[0]);
    });
});
