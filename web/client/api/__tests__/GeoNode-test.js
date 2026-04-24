/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import * as API from '../GeoNode';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';

describe('Test correctness of the GeoNode APIs', () => {
    it('getQueryParams merges custom filters and drops f', () => {
        const params = {
            f: ['published', 'owner'],
            page: 2,
            owner: 'team'
        };
        const customFilters = [
            { id: 'published', query: { 'filter{is_published}': true } },
            { id: 'owner', query: { owner: ['me'] } }
        ];
        const result = API.getQueryParams(params, customFilters);
        expect(result).toEqual({
            page: 2,
            owner: ['team', 'me'],
            'filter{is_published}': true
        });
    });

    it('getEndpointUrl handles base and special constants', () => {
        expect(API.getEndpointUrl('https://example.com/', API.RESOURCES))
            .toBe('https://example.com/api/v2/resources');
        expect(API.getEndpointUrl(API.RESOURCES, API.RESOURCES))
            .toBe('/api/v2/resources');
        expect(API.getEndpointUrl('https://example.com', '/api/custom'))
            .toBe('https://example.com/api/custom');
    });

    it('paramsSerializer uses bracket arrays for include/exclude/sort', () => {
        const serialize = API.paramsSerializer().paramsSerializer.serialize;
        const query = serialize({
            include: ['a', 'b'],
            exclude: ['c'],
            sort: ['d'],
            page: 1
        });
        expect(query).toContain('include[]=a');
        expect(query).toContain('include[]=b');
        expect(query).toContain('exclude[]=c');
        expect(query).toContain('sort[]=d');
        expect(query).toContain('page=1');
    });
});

describe('Test correctness of the GeoNode APIs (mock axios)', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    it('getResources builds request params and maps response', (done) => {
        mockAxios.onGet().reply((config) => {
            try {
                expect(config.url).toBe('https://example.com/api/v2/resources');
                expect(config.params).toEqual({
                    'filter{metadata_only}': false,
                    api_preset: 'catalog_list',
                    'filter{resource_type.in}': ['dataset'],
                    page: 2,
                    page_size: 2,
                    search: 'roads',
                    search_fields: ['title', 'abstract'],
                    sort: ['title']
                });
            } catch (e) {
                done(e);
            }
            return [200, {
                resources: [{ id: 1 }, { id: 2 }],
                total: 5,
                page: 2,
                page_size: 2,
                links: { next: '/api/v2/resources?page=3' }
            }];
        });

        API.getResources({
            q: 'roads',
            pageSize: 2,
            page: 2,
            sort: 'title',
            baseUrl: 'https://example.com'
        }).then((result) => {
            try {
                expect(result).toEqual({
                    numberOfRecordsMatched: 5,
                    numberOfRecordsReturned: 2,
                    nextRecord: 5,
                    records: [{ id: 1 }, { id: 2 }]
                });
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('getRecords forwards pagination and filters', (done) => {
        mockAxios.onGet().reply((config) => {
            try {
                expect(config.url).toBe('https://example.com/api/v2/resources');
                expect(config.params).toEqual({
                    'filter{metadata_only}': false,
                    api_preset: 'catalog_list',
                    'filter{resource_type.in}': ['dataset'],
                    page: 3,
                    page_size: 4,
                    search: 'buildings',
                    search_fields: ['title', 'abstract'],
                    sort: ['title']
                });
            } catch (e) {
                done(e);
            }
            return [200, {
                resources: [{ id: 7 }],
                total: 1,
                page: 3,
                page_size: 4,
                links: {}
            }];
        });

        API.getRecords('https://example.com', 9, 4, 'buildings', {
            options: { sort: 'title' }
        }).then((result) => {
            try {
                expect(result).toEqual({
                    numberOfRecordsMatched: 1,
                    numberOfRecordsReturned: 1,
                    nextRecord: 0,
                    records: [{ id: 7 }]
                });
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
