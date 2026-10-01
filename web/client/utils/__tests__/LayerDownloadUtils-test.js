/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

import {
    getVectorTimeAttributes,
    fetchVectorTimeAttributes,
    fetchRasterTimeAttributes,
    fetchTimeAttributes,
    buildTemporalFilter,
    filterFormatsByTimeState
} from '../LayerDownloadUtils';
import { NETCDF_FORMAT } from '../FileFormatUtils';

describe('LayerDownloadUtils', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('getVectorTimeAttributes', () => {
        it('extracts date/time attributes from attributes list', () => {
            const attrs = [
                { name: 'val', type: 'number' },
                { name: 'date_created', type: 'date' },
                { name: 'timestamp', type: 'date-time' }
            ];
            const result = getVectorTimeAttributes(null, attrs);
            expect(result).toContain('date_created');
            expect(result).toContain('timestamp');
            expect(result).toNotContain('val');
        });

        it('extracts date/time attributes from DescribeFeatureType schema', () => {
            const dft = {
                featureTypes: [{
                    properties: [
                        { name: 'the_geom', type: 'gml:Point' },
                        { name: 'recorded_at', type: 'xsd:dateTime', localType: 'date-time' }
                    ]
                }]
            };
            const result = getVectorTimeAttributes(dft);
            expect(result).toContain('recorded_at');
        });
    });

    describe('fetchVectorTimeAttributes', () => {
        it('returns attributes from options without network request', (done) => {
            const options = { attributes: [{ name: 'time_col', type: 'date' }] };
            fetchVectorTimeAttributes({ name: 'layer1' }, options).then((res) => {
                expect(res).toContain('time_col');
                done();
            }).catch(done);
        });

        it('fetches DescribeFeatureType from server when not provided in options', (done) => {
            mockAxios.onGet().reply(200, {
                featureTypes: [{
                    properties: [{ name: 'obs_date', type: 'xsd:date', localType: 'date' }]
                }]
            });
            fetchVectorTimeAttributes({
                name: 'workspace:layer1',
                search: { url: '/geoserver/wfs' }
            }).then((res) => {
                expect(res).toContain('obs_date');
                done();
            }).catch(done);
        });

        it('returns empty array on request error', (done) => {
            mockAxios.onGet().reply(500);
            fetchVectorTimeAttributes({
                name: 'workspace:layer1',
                search: { url: '/geoserver/wfs' }
            }).then((res) => {
                expect(res).toEqual([]);
                done();
            }).catch(done);
        });
    });

    describe('fetchRasterTimeAttributes', () => {
        it('returns fallback time attribute if layer has no URL or name', (done) => {
            fetchRasterTimeAttributes({}).then((res) => {
                expect(res).toEqual(['time']);
                done();
            }).catch(done);
        });

        it('discovers temporal attributes from GeoServer coverage index', (done) => {
            mockAxios.onGet('/geoserver/rest/layers/workspace%3Araster.json').reply(200, {
                layer: {
                    resource: {
                        href: '/geoserver/rest/workspaces/workspace/coveragestores/store/coverages/raster.json'
                    }
                }
            });
            mockAxios.onGet('/geoserver/rest/workspaces/workspace/coveragestores/store/coverages/raster/index.json').reply(200, {
                Schema: {
                    attributes: {
                        Attribute: [
                            { name: 'elevation', binding: 'java.lang.Double' },
                            { name: 'forecast_time', binding: 'java.util.Date' }
                        ]
                    }
                }
            });

            fetchRasterTimeAttributes({
                name: 'workspace:raster',
                url: '/geoserver/wms'
            }).then((res) => {
                expect(res).toEqual(['forecast_time']);
                done();
            }).catch(done);
        });

        it('falls back to [time] on error', (done) => {
            mockAxios.onGet().reply(404);
            fetchRasterTimeAttributes({
                name: 'workspace:raster',
                url: '/geoserver/wms'
            }).then((res) => {
                expect(res).toEqual(['time']);
                done();
            }).catch(done);
        });
    });

    describe('fetchTimeAttributes', () => {
        it('calls fetchRasterTimeAttributes for raster layer', (done) => {
            const rasterLayer = { name: 'workspace:raster', url: '/geoserver/wms' };
            mockAxios.onGet().reply(404);
            fetchTimeAttributes(rasterLayer).then((res) => {
                expect(res).toEqual(['time']);
                done();
            }).catch(done);
        });

        it('calls fetchVectorTimeAttributes for vector layer', (done) => {
            const vectorLayer = {
                name: 'workspace:vector',
                search: { url: '/geoserver/wfs' }
            };
            mockAxios.onGet().reply(404);
            fetchTimeAttributes(vectorLayer).then((res) => {
                expect(res).toEqual([]);
                done();
            }).catch(done);
        });
    });

    describe('buildTemporalFilter', () => {
        it('returns null if timeAttribute or currentTime is missing', () => {
            expect(buildTemporalFilter()).toBe(null);
            expect(buildTemporalFilter({ currentTime: '2024-01-01' })).toBe(null);
            expect(buildTemporalFilter({ timeAttribute: 'time' })).toBe(null);
        });

        it('builds single time filter', () => {
            const filter = buildTemporalFilter({
                timeAttribute: 'timestamp',
                currentTime: '2024-01-01T00:00:00.000Z'
            });
            expect(filter).toExist();
            expect(filter.isRange).toBe(false);
            expect(filter.cql).toBe("timestamp = '2024-01-01T00:00:00.000Z'");
            expect(filter.ogcFilterObj.filterFields[0]).toEqual({
                attribute: 'timestamp',
                type: 'date',
                operator: '=',
                value: {
                    startDate: '2024-01-01T00:00:00.000Z'
                }
            });
        });

        it('builds range time filter', () => {
            const filter = buildTemporalFilter({
                timeAttribute: 'timestamp',
                currentTime: '2024-01-01T00:00:00.000Z',
                offsetTime: '2024-01-10T00:00:00.000Z',
                offsetEnabled: true
            });
            expect(filter).toExist();
            expect(filter.isRange).toBe(true);
            expect(filter.cql).toBe("timestamp >= '2024-01-01T00:00:00.000Z' AND timestamp <= '2024-01-10T00:00:00.000Z'");
            expect(filter.ogcFilterObj.filterFields[0]).toEqual({
                attribute: 'timestamp',
                type: 'date',
                operator: '><',
                value: {
                    startDate: '2024-01-01T00:00:00.000Z',
                    endDate: '2024-01-10T00:00:00.000Z'
                }
            });
        });
    });

    describe('filterFormatsByTimeState', () => {
        const formats = [
            { name: 'geotiff', label: 'GeoTIFF' },
            { name: 'arcgrid', label: 'ArcGrid' },
            { name: NETCDF_FORMAT, label: 'NetCDF' }
        ];

        it('filters out NetCDF for raster layers when range is not enabled', () => {
            const resultSingle = filterFormatsByTimeState(formats, true, false);
            expect(resultSingle.map(f => f.name)).toEqual(['geotiff', 'arcgrid']);

            const resultNoTime = filterFormatsByTimeState(formats, false, false);
            expect(resultNoTime.map(f => f.name)).toEqual(['geotiff', 'arcgrid']);
        });

        it('restricts raster formats to only NetCDF when time dimension and range mode are active', () => {
            const result = filterFormatsByTimeState(formats, true, true);
            expect(result.map(f => f.name)).toEqual([NETCDF_FORMAT]);
        });
    });
});
