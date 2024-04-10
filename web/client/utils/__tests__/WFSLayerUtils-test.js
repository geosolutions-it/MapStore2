/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { extractGeometryAttributeName, extractGeometryType, toDescribeURL } from '../WFSLayerUtils';
import describePois from '../../test-resources/wfs/describe-pois.json';
import expect from 'expect';

describe("WFSLayerUtils", () => {
    it('extractGeometryAttributeName', () => {
        expect(extractGeometryAttributeName(describePois)).toBe("the_geom");
    });
    it('extractGeometryType', () => {
        expect(extractGeometryType(describePois)).toBe("Point");
    });
    it('toDescribeURL', () => {
        const _url = [
            'http://gs-stable.geosolutionsgroup.com:443/geoserver1',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver2',
            'http://gs-stable.geosolutionsgroup.com:443/geoserver3'
        ];

        expect(toDescribeURL({ name: 'testName', search: { url: _url }}).split('?')[0]).toBe(_url[0]);
    });
});
