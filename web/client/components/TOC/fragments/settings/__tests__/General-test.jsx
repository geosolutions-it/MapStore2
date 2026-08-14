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

import General from '../General';

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

    it('tests General component show LayerNameEditField = FALSE', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'shapefile',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 1}
        };

        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<General element={l} settings={settings} />, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(4);
    });
    it('tests General component show LayerNameEditField = TRUE', () => {
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

        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<General element={l} settings={settings} />, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(9);
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
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(9);
        ReactTestUtils.Simulate.change(inputs[0]);
        ReactTestUtils.Simulate.blur(inputs[1]);
        expect(spy.calls.length).toBe(1);
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
        const forms = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "form-group" );
        expect(forms).toExist();
        expect(forms.length).toBe(7);
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
        expect(labels.length).toBe(9);
        expect(labels[4].innerText).toBe("layerProperties.group");
        expect(labels[5].innerText).toBe("layerProperties.tooltip.label");
        expect(labels[6].innerText).toBe("layerProperties.tooltip.labelPlacement");
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
        expect(labels.length).toBe(7);
        expect(labels[4].innerText).toBe("layerProperties.group");
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
        expect(labels.length).toBe(7);
        expect(labels[4].innerText).toBe("layerProperties.group");
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
    it('edits WMS multi URLs using the catalog comma convention', () => {
        const onChange = expect.createSpy();
        ReactDOM.render(<General
            element={{name: 'layer00', title: 'Layer', type: 'wms', url: ['url-1', 'url-2']}}
            settings={{options: {opacity: 1}}}
            onChange={onChange}/>, document.getElementById("container"));
        const input = document.querySelector('[data-qa="layer-properties-url"]');
        const edit = document.querySelector('[data-qa="layer-properties-url-edit"]');
        expect(input.value).toBe('url-1, url-2');
        ReactTestUtils.Simulate.click(edit);
        ReactTestUtils.Simulate.change(input, {target: {value: 'url-3, url-4'}});
        ReactTestUtils.Simulate.click(edit);
        expect(onChange).toHaveBeenCalledWith('url', ['url-3', 'url-4']);
    });
    it('edits native WFS URL without adding a TypeName editor', () => {
        ReactDOM.render(<General
            element={{name: 'workspace:features', title: 'Layer', type: 'wfs', url: 'wfs-url'}}
            settings={{options: {opacity: 1}}}/>, document.getElementById("container"));
        expect(document.querySelector('[data-qa="layer-properties-url"]')).toExist();
        expect(document.querySelector('[data-qa="layer-properties-search-type-name"]')).toNotExist();
    });
    it('adds and removes a linked WFS service', () => {
        const onAdd = expect.createSpy();
        ReactDOM.render(<General
            element={{name: 'workspace:layer', title: 'Layer', type: 'wms', url: 'wms-url'}}
            settings={{options: {opacity: 1}}}
            onChange={onAdd}/>, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.mapstore-switch-panel .m-slider'));
        expect(onAdd).toHaveBeenCalledWith('search', {
            type: 'wfs',
            url: '',
            typeName: 'workspace:layer'
        });

        const onRemove = expect.createSpy();
        ReactDOM.render(<General
            element={{name: 'workspace:layer', title: 'Layer', type: 'wms', url: 'wms-url', search: {type: 'wfs', url: 'wfs-url'}}}
            settings={{options: {opacity: 1}}}
            onChange={onRemove}/>, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.mapstore-switch-panel .m-slider'));
        expect(onRemove).toHaveBeenCalledWith('search', undefined);
    });
    it('uses the legacy TypeName fallback and preserves linked service properties', () => {
        const onChange = expect.createSpy();
        ReactDOM.render(<General
            element={{
                name: 'workspace:layer',
                title: 'Layer',
                type: 'wms',
                url: 'wms-url',
                search: {type: 'wfs', url: 'old-wfs-url', custom: 'value'}
            }}
            settings={{options: {opacity: 1}}}
            onChange={onChange}/>, document.getElementById("container"));
        expect(document.querySelector('[data-qa="layer-properties-search-type-name"]').value).toBe('workspace:layer');
        const input = document.querySelector('[data-qa="layer-properties-search-url"]');
        const edit = document.querySelector('[data-qa="layer-properties-search-url-edit"]');
        ReactTestUtils.Simulate.click(edit);
        ReactTestUtils.Simulate.change(input, {target: {value: 'new-wfs-url'}});
        ReactTestUtils.Simulate.click(edit);
        expect(onChange).toHaveBeenCalledWith('search', {
            type: 'wfs',
            url: 'new-wfs-url',
            custom: 'value'
        });
        const typeNameInput = document.querySelector('[data-qa="layer-properties-search-type-name"]');
        const typeNameEdit = document.querySelector('[data-qa="layer-properties-search-type-name-edit"]');
        ReactTestUtils.Simulate.click(typeNameEdit);
        ReactTestUtils.Simulate.change(typeNameInput, {target: {value: 'workspace:linked'}});
        ReactTestUtils.Simulate.click(typeNameEdit);
        expect(onChange).toHaveBeenCalledWith('search', {
            type: 'wfs',
            url: 'old-wfs-url',
            typeName: 'workspace:linked',
            custom: 'value'
        });
    });
});
