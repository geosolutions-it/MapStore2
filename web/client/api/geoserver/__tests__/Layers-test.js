/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import API from '../Layers';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../../libs/ajax';

let mockAxios;

describe('Test layers rest API', () => {
    it('get layer', (done) => {
        const LAYER_NAME = "TEST_LAYER_1";
        API.getLayer("base/web/client/test-resources/geoserver/rest/", LAYER_NAME).then((layer)=> {
            expect(layer).toExist();
            expect(layer.name).toBe(LAYER_NAME);
            done();
        });
    });
    it('test removeStyles', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        API.removeStyles({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styles: [{name: 'generic'}]
        }).then((layer)=> {
            expect(layer).toExist();
            expect(layer.layer.styles.style.length).toBe(1);
            expect(layer.layer.styles.style[0].name).toBe('point');
            done();
        });
    });
    it('test updateAvailableStyles', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        API.updateAvailableStyles({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styles: [{name: 'polygon'}]
        }).then((layer)=> {
            expect(layer).toExist();
            expect(layer.layer.styles.style.length).toBe(3);
            expect(layer.layer.styles.style[0].name).toBe('point');
            expect(layer.layer.styles.style[1].name).toBe('generic');
            expect(layer.layer.styles.style[2].name).toBe('polygon');
            done();
        });
    });

    it('test updateDefaultStyle', (done) => {
        const LAYER_NAME = "TEST_LAYER_2";
        const newDefaultStyle = 'point';
        API.updateDefaultStyle({
            baseUrl: 'base/web/client/test-resources/geoserver/',
            layerName: LAYER_NAME,
            styleName: newDefaultStyle
        }).then((layerObj)=> {
            expect(layerObj).toExist();
            expect(layerObj.layer.defaultStyle.name).toBe(newDefaultStyle);
            expect(layerObj.layer.styles.style.length).toBe(3);
            expect(layerObj.layer.styles.style[0].name).toBe('test_TEST_LAYER_1');
            expect(layerObj.layer.styles.style[1].name).toBe('point');
            expect(layerObj.layer.styles.style[2].name).toBe('generic');
            done();
        }).catch(e => {
            done(e);
        });
    });
});

describe('Test default style update with layers rest API', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });

    it('test updateDefaultStyle, move old default style to available style', (done) => {

        const OLD_DEFAULT_STYLE = {
            name: 'workspace001:old_default_style',
            workspace: 'workspace001',
            href: '/geoserver/rest/workspaces/workspace001/styles/old_default_style.json'
        };

        mockAxios.onGet(/\/layers/).reply((config) => {
            expect(config.url).toBe('/geoserver/rest/workspaces/workspace001/layers/layer001.json');
            return [ 200, {
                "layer": {
                    "name": "layer001",
                    "defaultStyle": OLD_DEFAULT_STYLE,
                    "styles": {
                        "@class": "linked-hash-set",
                        "style": [{
                            "name": "workspace001:new_default_style",
                            "workspace": "workspace001",
                            "href": "\/geoserver\/rest\/workspaces\/workspace001\/styles\/new_default_style.json"
                        }]
                    }
                }
            }];
        });

        mockAxios.onPut(/\/layers/).reply((config) => {
            try {
                const layer = JSON.parse(config.data).layer;
                expect(layer.defaultStyle).toEqual({ "name": "workspace001:new_default_style" });
                expect(layer.styles.style).toEqual([
                    OLD_DEFAULT_STYLE,
                    {
                        "name": "workspace001:new_default_style",
                        "workspace": "workspace001",
                        "href": "/geoserver/rest/workspaces/workspace001/styles/new_default_style.json"
                    }
                ]);
            } catch (e) {
                done(e);
            }
            done();
            return [ 200, {}];
        });

        API.updateDefaultStyle({
            baseUrl: '/geoserver/',
            layerName: 'workspace001:layer001',
            styleName: 'workspace001:new_default_style'
        });
    });

    it('test updateDefaultStyle, available style must have unique name', (done) => {

        const OLD_DEFAULT_STYLE = {
            name: 'workspace001:old_default_style',
            workspace: 'workspace001',
            href: '/geoserver/rest/workspaces/workspace001/styles/old_default_style.json'
        };

        mockAxios.onGet(/\/layers/).reply((config) => {
            expect(config.url).toBe('/geoserver/rest/workspaces/workspace001/layers/layer001.json');
            return [ 200, {
                layer: {
                    name: 'layer001',
                    defaultStyle: OLD_DEFAULT_STYLE,
                    styles: {
                        '@class': 'linked-hash-set',
                        style: [
                            OLD_DEFAULT_STYLE,
                            {
                                name: 'workspace001:new_default_style',
                                workspace: 'workspace001',
                                href: '/geoserver/rest/workspaces/workspace001/styles/new_default_style.json'
                            },
                            {
                                name: 'workspace001:other_style',
                                workspace: 'workspace001',
                                href: '/geoserver/rest/workspaces/workspace001/styles/other_style.json'
                            },
                            {
                                name: 'workspace001:other_style',
                                workspace: 'workspace001',
                                href: '/geoserver/rest/workspaces/workspace001/styles/other_style.json'
                            },
                            {
                                name: 'workspace001:other_style',
                                workspace: 'workspace001',
                                href: '/geoserver/rest/workspaces/workspace001/styles/other_style.json'
                            }
                        ]
                    }
                }
            }];
        });

        mockAxios.onPut(/\/layers/).reply((config) => {
            try {
                const layer = JSON.parse(config.data).layer;
                expect(layer.defaultStyle).toEqual({ "name": "workspace001:new_default_style" });
                expect(layer.styles.style).toEqual([
                    OLD_DEFAULT_STYLE,
                    {
                        "name": "workspace001:new_default_style",
                        "workspace": "workspace001",
                        "href": "/geoserver/rest/workspaces/workspace001/styles/new_default_style.json"
                    },
                    {
                        "name": "workspace001:other_style",
                        "workspace": "workspace001",
                        "href": "/geoserver/rest/workspaces/workspace001/styles/other_style.json"
                    }
                ]);
            } catch (e) {
                done(e);
            }
            done();
            return [ 200, {}];
        });

        API.updateDefaultStyle({
            baseUrl: '/geoserver/',
            layerName: 'workspace001:layer001',
            styleName: 'workspace001:new_default_style'
        });
    });
    it('test updateDefaultStyle, when styles are not available, it have to add the new style to the list', (done) => {

        const OLD_DEFAULT_STYLE = {
            name: 'workspace001:old_default_style',
            workspace: 'workspace001',
            href: '/geoserver/rest/workspaces/workspace001/styles/old_default_style.json'
        };

        mockAxios.onGet(/\/layers/).reply((config) => {
            expect(config.url).toBe('/geoserver/rest/workspaces/workspace001/layers/layer001.json');
            return [200, {
                layer: {
                    name: 'layer001',
                    defaultStyle: OLD_DEFAULT_STYLE
                }
            }];
        });

        mockAxios.onPut(/\/layers/).reply((config) => {
            try {
                const layer = JSON.parse(config.data).layer;
                expect(layer.defaultStyle).toEqual({ "name": "workspace001:new_default_style" });
                expect(layer.styles.style).toEqual([
                    OLD_DEFAULT_STYLE
                ]);
            } catch (e) {
                done(e);
            }
            done();
            return [200, {}];
        });

        API.updateDefaultStyle({
            baseUrl: '/geoserver/',
            layerName: 'workspace001:layer001',
            styleName: 'workspace001:new_default_style'
        });
    });
});
