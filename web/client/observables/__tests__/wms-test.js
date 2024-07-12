/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toDescribeLayerURL } from '../wms';
import expect from 'expect';

describe("WMS Observables", () => {
    it('toDescribeLayerURL', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(toDescribeLayerURL({ name: 'testName', search: { url: _url }}).split('?')[0]).toBe(_url[0]);
    });
});
