/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { extractGeometryAttributeName, extractGeometryType, needsReload, toDescribeURL } from '../WFSLayerUtils';
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
    it('reloads native WFS data when its URL changes', () => {
        expect(needsReload({url: 'old-url'}, {url: 'new-url'})).toBe(true);
        expect(needsReload({url: ['old-url']}, {url: ['old-url']})).toBe(false);
    });
    it('reloads native WFS data when its service layer name changes', () => {
        expect(needsReload({name: 'old-name'}, {name: 'new-name'})).toBe(true);
        expect(needsReload({name: 'same-name'}, {name: 'same-name', title: 'New title'})).toBe(false);
    });
});
