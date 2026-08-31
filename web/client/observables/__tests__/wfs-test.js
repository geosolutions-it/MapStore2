/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { parse } from 'url';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import { toDescribeURL, getFeatureUtilities, getLayerJSONFeature } from '../wfs';
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
    it('uses the linked WFS type name in DescribeFeatureType requests', () => {
        const parsed = parse(toDescribeURL({
            type: 'wms',
            name: 'workspace:wms-name',
            url: 'wms-url',
            search: {url: 'wfs-url', typeName: 'workspace:wfs-name'}
        }), true);
        expect(parsed.query.typeName).toBe('workspace:wfs-name');
    });
    it('falls back to the WMS name and ignores search.typeName for native WFS', () => {
        expect(parse(toDescribeURL({
            type: 'wms',
            name: 'workspace:wms-name',
            search: {url: 'wfs-url'}
        }), true).query.typeName).toBe('workspace:wms-name');
        expect(parse(toDescribeURL({
            type: 'wfs',
            name: 'workspace:native-wfs-name',
            url: 'wfs-url',
            search: {typeName: 'workspace:ignored'}
        }), true).query.typeName).toBe('workspace:native-wfs-name');
    });
    it('uses the linked WFS type name in GetFeature requests', (done) => {
        const mockAxios = new MockAdapter(axios);
        mockAxios.onPost().reply(({data}) => {
            expect(data).toContain('typeName="workspace:linked"');
            return [200, {type: 'FeatureCollection', features: []}];
        });
        getLayerJSONFeature({
            type: 'wms',
            name: 'workspace:rendered',
            search: {url: 'wfs-url', typeName: 'workspace:linked'}
        }).subscribe(() => {
            mockAxios.restore();
            done();
        }, (error) => {
            mockAxios.restore();
            done(error);
        });
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
