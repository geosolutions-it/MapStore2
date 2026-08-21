/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import AxiosMockAdapter from 'axios-mock-adapter';
import { waitFor } from '@testing-library/react';

import General from '../General';
import axios from '../../../../../libs/ajax';

const editLayerName = (name) => {
    const getInput = () => document.querySelector('[data-qa="layer-properties-name"]');
    const getEditButton = () => getInput().parentElement.querySelector('.input-group-addon');
    ReactTestUtils.act(() => {
        ReactTestUtils.Simulate.click(getEditButton());
    });
    ReactTestUtils.act(() => {
        ReactTestUtils.Simulate.change(getInput(), {target: {value: name}});
    });
    ReactTestUtils.act(() => {
        ReactTestUtils.Simulate.click(getEditButton());
    });
};

describe('test  Layer Properties General module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    ['wmts', 'vector', 'shapefile'].forEach((type) => {
        it(`does not show LayerNameEditField for ${type}`, () => {
            const l = {
                name: 'layer00',
                title: 'Layer',
                visibility: true,
                storeIndex: 9,
                type,
                url: 'fakeurl'
            };
            const settings = {
                options: {opacity: 1}
            };

            const comp = ReactDOM.render(<General element={l} settings={settings} />, document.getElementById("container"));
            expect(comp).toExist();
            expect(document.querySelector('[data-qa="layer-properties-name"]')).toBeFalsy();
        });
    });
    ['wms', 'wfs', 'arcgis', 'arcgis-feature'].forEach((type) => {
        it(`tests General component show LayerNameEditField for ${type}`, () => {
            const l = {
                name: 'layer00',
                title: 'Layer',
                visibility: true,
                storeIndex: 9,
                type,
                url: 'fakeurl'
            };
            const settings = {
                options: {opacity: 1}
            };

            const comp = ReactDOM.render(<General element={l} settings={settings} />, document.getElementById("container"));
            expect(comp).toExist();
            expect(document.querySelector('[data-qa="layer-properties-name"]')).toBeTruthy();
        });
    });
    [undefined, null, ''].forEach((name) => {
        it(`does not show LayerNameEditField for a service-level arcgis layer with name ${name}`, () => {
            const element = {
                name,
                title: 'ArcGIS service',
                type: 'arcgis',
                url: 'https://example.com/arcgis/rest/services/Test/MapServer'
            };
            const comp = ReactDOM.render(<General element={element}/>, document.getElementById("container"));
            expect(comp).toExist();
            expect(document.querySelector('[data-qa="layer-properties-name"]')).toBeFalsy();
        });
    });
    it('does not show LayerNameEditField for groups', () => {
        const element = {
            name: 'group00',
            title: 'Group',
            type: 'wms'
        };
        const comp = ReactDOM.render(<General element={element} nodeType="groups" />, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('[data-qa="layer-properties-name"]')).toBeFalsy();
    });
    it('refreshes and merges fields when changing a WFS layer name', (done) => {
        const mockAxios = new AxiosMockAdapter(axios);
        mockAxios.onGet().reply((config) => {
            expect(decodeURIComponent(config.url)).toContain('typeName=topp:new');
            return [200, {
                featureTypes: [{
                    typeName: 'topp:new',
                    properties: [{name: 'kept', localType: 'string'}, {name: 'added', localType: 'number'}]
                }]
            }];
        });
        const handlers = {onChange: () => {}};
        const spy = expect.spyOn(handlers, 'onChange');
        const element = {
            type: 'wfs',
            name: 'topp:old',
            url: '/geoserver/wfs',
            fields: [
                {name: 'kept', type: 'string', alias: 'Custom alias'},
                {name: 'removed', type: 'string', alias: 'Removed'}
            ]
        };
        ReactDOM.render(<General element={element} onChange={handlers.onChange}/>, document.getElementById("container"));

        editLayerName('topp:new');

        waitFor(() => expect(spy).toHaveBeenCalled())
            .then(() => {
                expect(spy.calls[0].arguments).toEqual([{
                    name: 'topp:new',
                    fields: [
                        {name: 'kept', type: 'string', alias: 'Custom alias'},
                        {name: 'added', type: 'number'}
                    ]
                }]);
                mockAxios.restore();
                done();
            })
            .catch((error) => {
                mockAxios.restore();
                done(error);
            });
    });
    it('refreshes linked WFS fields when its type name follows the WMS layer name', (done) => {
        const mockAxios = new AxiosMockAdapter(axios);
        mockAxios.onGet().reply((config) => {
            expect(decodeURIComponent(config.url)).toContain('typeName=topp:new');
            return [200, {
                featureTypes: [{
                    typeName: 'topp:new',
                    properties: [{name: 'newField', localType: 'string'}]
                }]
            }];
        });
        const handlers = {onChange: () => {}};
        const spy = expect.spyOn(handlers, 'onChange');
        const element = {
            type: 'wms',
            name: 'topp:old',
            url: '/geoserver/wms',
            search: {type: 'wfs', url: '/geoserver/wfs'}
        };
        ReactDOM.render(<General element={element} onChange={handlers.onChange}/>, document.getElementById("container"));

        editLayerName('topp:new');

        waitFor(() => expect(spy).toHaveBeenCalled())
            .then(() => {
                expect(spy.calls[0].arguments).toEqual([{
                    name: 'topp:new',
                    fields: [{name: 'newField', type: 'string'}]
                }]);
                mockAxios.restore();
                done();
            })
            .catch((error) => {
                mockAxios.restore();
                done(error);
            });
    });
    it('does not refresh linked WFS fields when it has an explicit type name', () => {
        const handlers = {onChange: () => {}};
        const spy = expect.spyOn(handlers, 'onChange');
        const element = {
            type: 'wms',
            name: 'topp:old',
            url: '/geoserver/wms',
            search: {type: 'wfs', url: '/geoserver/wfs', typeName: 'topp:search'}
        };
        ReactDOM.render(<General element={element} onChange={handlers.onChange}/>, document.getElementById("container"));

        editLayerName('topp:new');

        expect(spy.calls[0].arguments).toEqual([{name: 'topp:new'}]);
    });
    it('refreshes ArcGIS FeatureServer schema when changing the layer name', (done) => {
        const mockAxios = new AxiosMockAdapter(axios);
        mockAxios.onGet('/arcgis/rest/services/SchemaRefresh/FeatureServer/1').reply(200, {
            geometryType: 'esriGeometryPoint',
            fields: [
                {name: 'kept', alias: 'Server alias', type: 'esriFieldTypeString', nullable: false},
                {name: 'added', alias: 'Added', type: 'esriFieldTypeInteger'}
            ]
        });
        const handlers = {onChange: () => {}};
        const spy = expect.spyOn(handlers, 'onChange');
        const element = {
            type: 'arcgis-feature',
            name: '0',
            url: '/arcgis/rest/services/SchemaRefresh/FeatureServer',
            fields: [
                {name: 'kept', alias: 'Custom alias', type: 'esriFieldTypeString', nullable: true},
                {name: 'removed', alias: 'Removed', type: 'esriFieldTypeString'}
            ]
        };
        ReactDOM.render(<General element={element} onChange={handlers.onChange}/>, document.getElementById("container"));

        editLayerName('1');

        waitFor(() => expect(spy).toHaveBeenCalled())
            .then(() => {
                expect(spy.calls[0].arguments).toEqual([{
                    name: '1',
                    fields: [
                        {name: 'kept', alias: 'Custom alias', type: 'esriFieldTypeString', nullable: false},
                        {name: 'added', alias: 'Added', type: 'esriFieldTypeInteger'}
                    ],
                    properties: {kept: '', added: 0},
                    geometryType: 'Point'
                }]);
                mockAxios.restore();
                done();
            })
            .catch((error) => {
                mockAxios.restore();
                done(error);
            });
    });
    it('tests Layer Properties Display component events', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 1}
        };
        const handlers = {
            onChange() {}
        };
        let spy = expect.spyOn(handlers, "onChange");
        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<General element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        ReactTestUtils.Simulate.blur(document.querySelector('textarea'), {target: {value: 'Updated description'}});
        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments).toEqual(['description', 'Updated description']);
    });
    it('tests hidden title translations', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 1}
        };
        const handlers = {
            onChange() {}
        };
        const pluginCfg = {
            hideTitleTranslations: true
        };
        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<General pluginCfg={pluginCfg} element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        expect(document.querySelector('.glyphicon-flag')).toBeFalsy();
    });

    it('TEST showTooltipOptions = true', () => {
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 1}
        };
        const comp = ReactDOM.render(<General pluginCfg={{}} element={layer} settings={settings}/>, document.getElementById("container"));
        expect(comp).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        const labelIds = labels.map(({innerText}) => innerText);
        expect(labelIds).toContain("layerProperties.group");
        expect(labelIds).toContain("layerProperties.tooltip.label");
        expect(labelIds).toContain("layerProperties.tooltip.labelPlacement");
    });

    it('TEST showTooltipOptions = false', () => {
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 1}
        };
        const comp = ReactDOM.render(<General pluginCfg={{}} element={layer} showTooltipOptions={false} settings={settings}/>, document.getElementById("container"));
        expect(comp).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        const labelIds = labels.map(({innerText}) => innerText);
        expect(labelIds).toContain("layerProperties.group");
        expect(labelIds).toNotContain("layerProperties.tooltip.label");
        expect(labelIds).toNotContain("layerProperties.tooltip.labelPlacement");
    });
    it('TEST layer group dropdown', () => {
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            group: 'first'
        };
        const settings = {
            options: {opacity: 1}
        };
        const groups = [{
            "id": "first",
            "title": "First",
            "name": "first",
            "nodes": [
                {
                    "id": "first.second",
                    "title": "second",
                    "name": "second",
                    "nodes": [
                        {
                            "id": "first.second.third",
                            "title": "third",
                            "name": "third",
                            "nodes": [
                                {
                                    "id": "topp:states__6",
                                    "name": "topp:states",
                                    "title": "USA Population"
                                }
                            ]
                        }
                    ]
                }
            ]
        }];
        const comp = ReactDOM.render(<General pluginCfg={{}} element={layer} groups={groups} showTooltipOptions={false} settings={settings}/>, document.getElementById("container"));
        expect(comp).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        expect(labels.map(({innerText}) => innerText)).toContain("layerProperties.group");
        const cmp = document.getElementById('container');
        let selectValue = cmp.querySelector('.Select-value-label');
        let input = cmp.querySelector('.Select-input > input');
        expect(selectValue.innerText).toBe("First");

        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.focus(input);
            ReactTestUtils.Simulate.keyDown(input, { key: 'ArrowDown', keyCode: 40 });
        });
        const selectMenuOptionNodes = cmp.querySelectorAll('.Select-option');
        expect(selectMenuOptionNodes.length).toBe(4);
    });
    it('tests read only attribute field', () => {
        const handlers = {
            onChange() {}
        };
        const spyOn = expect.spyOn(handlers, 'onChange');
        const settings = {
            options: {opacity: 0.7}
        };
        const mapInfo = {canEdit: true, id: "1"};
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<General onChange={handlers.onChange} pluginCfg={{}} showFeatureEditOption element={layer} settings={settings} mapInfo={mapInfo}/>, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const disableFeaturesEditing = document.querySelector('[data-qa="general-read-only-attribute"]');
        ReactTestUtils.Simulate.change(disableFeaturesEditing, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'disableFeaturesEditing', true ]);
    });
    it('tests read only attribute field on new map', () => {
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const comp = ReactDOM.render(<General pluginCfg={{}} element={layer} showFeatureEditOption  />, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const disableFeaturesEditing = document.querySelector('[data-qa="general-read-only-attribute"]');
        expect(disableFeaturesEditing).toBeTruthy();
    });
    it('tests read only attribute field without permission', () => {
        const layer = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const mapInfo = {canEdit: false, id: "1"};
        const comp = ReactDOM.render(<General pluginCfg={{}} element={layer} mapInfo={mapInfo} showFeatureEditOption={false}  />, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const disableFeaturesEditing = document.querySelector('[data-qa="general-read-only-attribute"]');
        expect(disableFeaturesEditing).toBeFalsy();
    });
});
