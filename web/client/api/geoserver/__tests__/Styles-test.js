/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import API from '../Styles';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';

let mockAxios;

describe('Test styles rest API', () => {
    it('save style', (done) => {
        const STYLE_NAME = "test_TEST_LAYER_1";
        API.saveStyle("base/web/client/test-resources/geoserver/rest/", STYLE_NAME, "STYLE_BODY").then((response)=> {
            expect(response).toExist();
            done();
        });
    });
    it('test getStyle', (done) => {
        API.getStyle({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            styleName: 'test_TEST_LAYER_1'
        })
        .then((response)=> {
            try {
                expect(response.data).toEqual({
                    style: {
                        filename: 'test_TEST_LAYER_1.sld',
                        format: 'sld',
                        languageVersion: {version: '1.0.0'},
                        name: 'test_TEST_LAYER_1'
                    }
                });
            } catch(e) {
                done(e);
            }
            done();
        });
    });
    it('test getStylesInfo', (done) => {
        API.getStylesInfo({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            styles: [
                {
                    name: 'test_TEST_LAYER_1',
                    title: 'Solid fill',
                    _abstract: 'basic style'
                },
                {
                    name: 'test_TEST_LAYER_2',
                    title: 'Square',
                    _abstract: 'small square'
                }
            ]
        })
        .then((response)=> {
            expect(response).toEqual([{
                    filename: 'test_TEST_LAYER_1.sld',
                    format: 'sld',
                    languageVersion: {version: '1.0.0'},
                    name: 'test_TEST_LAYER_1',
                    title: 'Solid fill',
                    _abstract: 'basic style'
                },
                {
                    name: 'test_TEST_LAYER_2',
                    title: 'Square',
                    _abstract: 'small square'
                }]);
            done();
        });
    });
    it('test getStyleCodeByName', (done) => {
        API.getStyleCodeByName({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            styleName: 'test_style'
        }).then((response)=> {
            expect(response).toEqual({
                code: '* { stroke: #ff0000; }',
                filename: 'test_style.css',
                format: 'css',
                languageVersion: {version: '1.0.0'},
                name: 'test_style'
            });
            done();
        });
    });
});

describe('Test styles rest API, Content Type of SLD', () => {

    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('test createStyle with sld version 1.1.0', (done) => {

        mockAxios.onPost(/\/styles/).reply((config) => {
            expect(config.headers['Content-Type']).toBe('application/vnd.ogc.se+xml');
            expect(config.url).toBe('/geoserver/rest/styles.json');
            done();
            return [ 200, {}];
        });

        API.createStyle({
            baseUrl: '/geoserver/',
            code: '<StyledLayerDescriptor></StyledLayerDescriptor>',
            format: 'sld',
            styleName: 'style_name',
            languageVersion: { version: '1.1.0' }
        });
    });

    it('test createStyle with sld version 1.0.0', (done) => {

        mockAxios.onPost(/\/styles/).reply((config) => {
            expect(config.headers['Content-Type']).toBe('application/vnd.ogc.sld+xml');
            expect(config.url).toBe('/geoserver/rest/styles.json');
            done();
            return [ 200, {}];
        });

        API.createStyle({
            baseUrl: '/geoserver/',
            code: '<StyledLayerDescriptor></StyledLayerDescriptor>',
            format: 'sld',
            styleName: 'style_name',
            languageVersion: { version: '1.0.0' }
        });
    });

    it('test updateStyle with sld version 1.1.0', (done) => {
        mockAxios.onPut(/\/styles/).reply((config) => {
            expect(config.headers['Content-Type']).toBe('application/vnd.ogc.se+xml');
            expect(config.url).toBe('/geoserver/rest/styles/style_name');
            done();
            return [ 200, {}];
        });

        API.updateStyle({
            baseUrl: '/geoserver/',
            code: '<StyledLayerDescriptor></StyledLayerDescriptor>',
            format: 'sld',
            styleName: 'style_name',
            languageVersion: { version: '1.1.0' }
        });
    });

    it('test updateStyle with sld version 1.0.0', (done) => {
        mockAxios.onPut(/\/styles/).reply((config) => {
            expect(config.headers['Content-Type']).toBe('application/vnd.ogc.sld+xml');
            expect(config.url).toBe('/geoserver/rest/styles/style_name');
            done();
            return [ 200, {}];
        });

        API.updateStyle({
            baseUrl: '/geoserver/',
            code: '<StyledLayerDescriptor></StyledLayerDescriptor>',
            format: 'sld',
            styleName: 'style_name',
            languageVersion: { version: '1.0.0' }
        });
    });
});
