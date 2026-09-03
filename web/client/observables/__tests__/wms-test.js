/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AxiosMockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import { addSearch, toDescribeLayerURL } from '../wms';
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
    it('uses the primary URL for WMS DescribeLayer', () => {
        expect(toDescribeLayerURL({
            name: 'testName',
            url: 'wms-url',
            search: {url: 'linked-wfs-url'}
        }).split('?')[0]).toBe('wms-url');
    });
    it('allows an explicit DescribeLayer action to override the previous linked service', (done) => {
        const mockAxios = new AxiosMockAdapter(axios);
        mockAxios.onGet().reply(200, {
            layerDescriptions: [{
                owsURL: 'detected-wfs-url',
                typeName: 'workspace:detected'
            }]
        });
        addSearch({
            name: 'workspace:wms',
            url: 'wms-url',
            search: {
                type: 'wfs',
                url: 'custom-wfs-url',
                typeName: 'workspace:custom',
                custom: true
            }
        }, { detectedSearchOverrides: true })
            .toPromise()
            .then((layer) => {
                expect(layer.search).toEqual({
                    type: 'wfs',
                    url: 'detected-wfs-url',
                    typeName: 'workspace:detected',
                    custom: true
                });
                mockAxios.restore();
                done();
            })
            .catch((error) => {
                mockAxios.restore();
                done(error);
            });
    });
    it('supports the legacy nested DescribeLayer typeName response', (done) => {
        const mockAxios = new AxiosMockAdapter(axios);
        mockAxios.onGet().reply(200, {
            layerDescriptions: [{
                owsURL: 'detected-wfs-url',
                query: {typeName: 'workspace:nested'}
            }]
        });
        addSearch({
            name: 'workspace:wms',
            url: 'wms-url'
        })
            .toPromise()
            .then((layer) => {
                expect(layer.search.typeName).toBe('workspace:nested');
                mockAxios.restore();
                done();
            })
            .catch((error) => {
                mockAxios.restore();
                done(error);
            });
    });
});
