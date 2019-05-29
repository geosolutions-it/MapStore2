/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var API = require('../Styles');

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
