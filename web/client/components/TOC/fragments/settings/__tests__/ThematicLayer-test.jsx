/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ThematicLayer = require('../ThematicLayer');

const expect = require('expect');
const TestUtils = require('react-dom/test-utils');

const layer = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl'
};

const layerWithUnconfiguredThematic = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl',
    thematic: {
        unconfigured: true
    }
};

const layerWithConfiguredThematic = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl',
    thematic: {
        current: {
            intervals: 3,
            ramp: "red",
            strokeColor: "#FF0000",
            strokeWeight: 1,
            strokeOn: true
        }
    }
};

const layerWithConfiguredThematicAndNoStroke = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl',
    thematic: {
        current: {
            intervals: 3,
            ramp: "red",
            strokeColor: "#FF0000",
            strokeWeight: 1,
            strokeOn: false
        }
    }
};

const params = [{
    "title": "PARAM",
    "field": "myparam",
    "defaultValue": 1,
    "values": [{
        name: "name1",
        value: 1
    }, {
        name: "name2",
        value: 2
    }]
}];

const layerWithConfiguredThematicAndParams = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl',
    thematic: {
        current: {},
        params
    }
};

const classification = [{
    min: 1,
    max: 10,
    color: '#ff0000'
}, {
    min: 10,
    max: 20,
    color: '#00ff00'
}, {
    min: 20,
    max: 30,
    color: '#0000ff'
}];

const layerWithConfiguredThematicCustomClassification = {
    name: 'layer00',
    title: 'Layer',
    visibility: true,
    storeIndex: 9,
    type: 'wms',
    url: 'fakeurl',
    thematic: {
        current: {
            classification
        },
        params
    }
};

const fields = [{
    name: 'myfield1'
}, {
    name: 'myfield2'
}];

const methods = ['equalIntervals', 'quantile'];

const colors = [{name: 'red', colors: ['#f00', '#000']}, {name: 'blue', colors: ['#00f', '#000']}];

describe('test ThematicLayer module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests ThematicLayer component creation', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layer} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
    });

    it('tests ThematicLayer component with unconfigured thematic no admin', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithUnconfiguredThematic} adminCfg={{open: true, current: "{}"}}/>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(0);
    });

    it('tests ThematicLayer component with unconfigured thematic admin', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithUnconfiguredThematic} canEditThematic adminCfg={{ open: true, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('react-codemirror2').length).toBe(1);
    });

    it('tests ThematicLayer component with configured thematic admin panel open', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} adminCfg={{ open: true, current: "{}" }} canEditThematic/>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('react-codemirror2').length).toBe(1);
    });

    it('tests ThematicLayer component with configured thematic admin panel close', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('react-codemirror2').length).toBe(0);
    });

    it('tests ThematicLayer component with configured thematic thema style', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('mapstore-switch-panel').length).toBe(2);
    });

    it('tests ThematicLayer component with configured thematic thema style admin buttons for admin', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('mapstore-switch-panel')[0].querySelector('button.square-button-sm')).toExist();
    });

    it('tests ThematicLayer component with configured thematic thema style admin buttons for no admin', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName('mapstore-switch-panel')[0].querySelector('button.square-button-sm')).toNotExist();
    });

    it('tests ThematicLayer component with configured thematic thema style toggle configuration', () => {
        const actions = {
            onChangeConfiguration: () => { }
        };
        const spyConfigurationChange = expect.spyOn(actions, 'onChangeConfiguration');

        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} onChangeConfiguration={actions.onChangeConfiguration}
            adminCfg={{ open: false, current: "{}" }} canEditThematic/>, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const cfgButton = domNode.getElementsByClassName('mapstore-switch-panel')[0].querySelector('button.square-button-sm');
        TestUtils.Simulate.click(cfgButton);
        expect(spyConfigurationChange.calls.length).toBe(2);
    });

    it('tests ThematicLayer component with configured thematic thema style change configuration', () => {
        const actions = {
            onChangeConfiguration: () => { }
        };
        const spyConfigurationChange = expect.spyOn(actions, 'onChangeConfiguration');

        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic} onChangeConfiguration={actions.onChangeConfiguration}
            adminCfg={{ open: true, current: "{}" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const doc = comp.cfgEditor.editor.getDoc();
        doc.replaceRange('{', {line: 1, ch: 1});
        expect(spyConfigurationChange.calls.length).toBe(2);
        expect(spyConfigurationChange.calls[1].arguments.length).toBe(3);
        expect(spyConfigurationChange.calls[1].arguments[2]).toBe('{}{');
    });

    it('tests ThematicLayer component with configured thematic thema style invalid configuration', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic}
            adminCfg={{ open: true, current: "{" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName("text-danger").length).toBe(1);
    });

    it('tests ThematicLayer component with configured thematic thema style valid configuration', () => {
        const comp = ReactDOM.render(<ThematicLayer layer={layerWithConfiguredThematic}
            adminCfg={{ open: true, current: "{}" }} canEditThematic />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.getElementsByClassName("text-danger").length).toBe(0);
    });

    it('tests ThematicLayer component with configured thematic thema style fields', () => {
        const comp = ReactDOM.render(<ThematicLayer fields={fields}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const fieldsCombo = domNode.querySelectorAll('.rw-combobox')[0];
        TestUtils.Simulate.click(fieldsCombo.querySelector('button'));
        const fieldsOptions = fieldsCombo.querySelectorAll('.rw-popup li');
        expect(fieldsOptions.length).toBe(2);
    });

    it('tests ThematicLayer component with configured thematic thema style choose field', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');


        const comp = ReactDOM.render(<ThematicLayer fields={fields} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const fieldsCombo = domNode.querySelectorAll('.rw-combobox')[0];
        TestUtils.Simulate.click(fieldsCombo.querySelector('button'));
        const fieldsOptions = fieldsCombo.querySelectorAll('.rw-popup li');
        TestUtils.Simulate.click(fieldsOptions[0]);
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.field).toBe('myfield1');
        expect(spyClassify).toHaveBeenCalled();
        expect(spyClassify.calls[0].arguments[0].thematic.current.field).toBe('myfield1');
    });

    it('tests ThematicLayer component with configured thematic thema style method', () => {
        const comp = ReactDOM.render(<ThematicLayer methods={methods}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const methodsCombo = domNode.querySelectorAll('.rw-combobox')[1];
        TestUtils.Simulate.click(methodsCombo.querySelector('button'));
        const fieldsOptions = methodsCombo.querySelectorAll('.rw-popup li');
        expect(fieldsOptions.length).toBe(2);
    });

    it('tests ThematicLayer component with configured thematic geometry linestring', () => {
        const comp = ReactDOM.render(<ThematicLayer geometryType="LineString"
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const strokeToggle = domNode.querySelectorAll('input[type="checkbox"]')[0];
        expect(strokeToggle).toNotExist();
        const colorPicker = domNode.querySelector('.ms-color-picker-swatch');
        expect(colorPicker).toNotExist();
        const weightPicker = domNode.querySelectorAll('.rw-numberpicker')[1];
        expect(weightPicker).toNotExist();
    });

    it('tests ThematicLayer component with configured thematic thema style choose method', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');


        const comp = ReactDOM.render(<ThematicLayer methods={methods} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const methodsCombo = domNode.querySelectorAll('.rw-combobox')[1];
        TestUtils.Simulate.click(methodsCombo.querySelector('button'));
        const methodsOptions = methodsCombo.querySelectorAll('.rw-popup li');
        TestUtils.Simulate.click(methodsOptions[0]);
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.method).toBe('equalIntervals');
        expect(spyClassify).toHaveBeenCalled();
        expect(spyClassify.calls[0].arguments[0].thematic.current.method).toBe('equalIntervals');
    });

    it('tests ThematicLayer component with configured thematic thema style intervals', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const intervalsPicker = domNode.querySelectorAll('.rw-numberpicker')[0];
        expect(intervalsPicker).toExist();
        TestUtils.Simulate.mouseDown(intervalsPicker.querySelector('.rw-btn'));
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.intervals).toBe(4);
        expect(spyClassify).toHaveBeenCalled();
        expect(spyClassify.calls[0].arguments[0].thematic.current.intervals).toBe(4);
    });

    it('tests ThematicLayer component with configured thematic thema style colors', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer colors={colors} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toBeTruthy();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const colorsSelector = domNode.querySelectorAll('.color-ramp-selector')[0];
        expect(colorsSelector).toBeTruthy();
        const inputs = colorsSelector.querySelectorAll('input');
        TestUtils.Simulate.keyDown(inputs[0], { keyCode: 40 }); // arrow down to open select
        const colorsOptions = colorsSelector.querySelectorAll('.Select-option');
        expect(colorsOptions.length).toBe(2);
        TestUtils.Simulate.keyDown(inputs[0], { keyCode: 40 }); // arrow down to blue option
        TestUtils.Simulate.keyDown(inputs[0], { keyCode: 13 }); // select option
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.ramp).toBe('blue');
        expect(spyClassify).toHaveBeenCalled();
        expect(spyClassify.calls[0].arguments[0].thematic.current.ramp).toBe('blue');
    });

    it('tests ThematicLayer component with configured thematic thema style stroke off', () => {
        const comp = ReactDOM.render(<ThematicLayer colors={colors}
            layer={layerWithConfiguredThematicAndNoStroke} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const strokeToggle = domNode.querySelectorAll('input[type="checkbox"]')[0];
        expect(strokeToggle).toExist();
        const colorPicker = domNode.querySelector('.ms-color-picker.ms-disabled');
        expect(colorPicker).toExist();
        const weightPicker = domNode.querySelectorAll('.rw-numberpicker')[1];
        expect(weightPicker.className.indexOf('rw-state-disabled') !== -1).toBe(true);
    });

    it('tests ThematicLayer component with configured thematic thema style strokeOn', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer colors={colors} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const strokeToggle = domNode.querySelectorAll('input[type="checkbox"]')[0];
        expect(strokeToggle).toExist();
        TestUtils.Simulate.change(strokeToggle, { "target": { "checked": false } });
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.strokeOn).toBe(false);
        expect(spyClassify).toNotHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style strokeWeight', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer colors={colors} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const weightPicker = domNode.querySelectorAll('.rw-numberpicker')[1];
        expect(weightPicker).toExist();
        TestUtils.Simulate.mouseDown(weightPicker.querySelector('.rw-btn'));
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.strokeWeight).toBe(2);
        expect(spyClassify).toNotHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style strokeColor', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer colors={colors} onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const colorPicker = domNode.querySelector('.ms-color-picker-swatch');
        expect(colorPicker).toExist();
        TestUtils.Simulate.click(colorPicker);
        // query in the document because now the overlay picker container is related to container node (portal)
        const sampleColor = document.querySelector('div[title="#D0021B"]');
        TestUtils.Simulate.click(sampleColor);
        // query in the document because now the overlay picker container is related to container node (portal)
        TestUtils.Simulate.click(document.querySelector('.ms-color-picker-cover'));
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls.length).toBe(2);
        expect(spyChange.calls[1].arguments[0]).toBe('thematic');
        expect(spyChange.calls[1].arguments[1].current.strokeColor.toUpperCase()).toBe('#D0021B');
        expect(spyClassify).toNotHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style strokeColor not chosen', () => {
        const actions = {
            onChange: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');

        const comp = ReactDOM.render(<ThematicLayer colors={colors} onChange={actions.onChange}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const colorPicker = domNode.querySelector('.ms-color-picker-swatch');
        expect(colorPicker).toExist();
        TestUtils.Simulate.click(colorPicker);
        // query in the document because now the cover is a global overlay
        TestUtils.Simulate.click(document.querySelector('.ms-color-picker-cover'));
        expect(spyChange.calls.length).toBe(1);
    });

    it('tests ThematicLayer component with configured thematic thema style params', () => {
        const actions = {
            onChange: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');

        const comp = ReactDOM.render(<ThematicLayer onChange={actions.onChange}
            layer={layerWithConfiguredThematicAndParams} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.querySelectorAll('.rw-combobox').length).toBe(3);

        const paramCombo = domNode.querySelectorAll('.rw-combobox')[1];
        TestUtils.Simulate.click(paramCombo.querySelector('button'));
        const paramsOptions = paramCombo.querySelectorAll('.rw-popup li');
        expect(paramsOptions.length).toBe(1);
        TestUtils.Simulate.click(paramsOptions[0]);
        expect(spyChange).toHaveBeenCalled();
        expect(spyChange.calls[0].arguments.length).toBe(2);
        expect(spyChange.calls[0].arguments[0]).toBe('thematic');
        expect(spyChange.calls[0].arguments[1].current.myparam).toBe(1);
    });

    it('tests ThematicLayer component with configured thematic thema style classification', () => {
        const comp = ReactDOM.render(<ThematicLayer classification={classification}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        expect(domNode.querySelector('.thema-classes-editor')).toExist();
    });

    it('tests ThematicLayer component with configured thematic thema style remove style button', () => {
        const actions = {
            onChange: () => {},
            removeThematicStyle: () => {}
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyRemove = expect.spyOn(actions, 'removeThematicStyle');

        const comp = ReactDOM.render(<ThematicLayer enableRemoveStyle hasThematicStyle={() => true} removeThematicStyle={actions.removeThematicStyle}
            onChange={actions.onChange}
            layer={layerWithConfiguredThematicAndParams} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const removeButton = domNode.querySelector('.glyphicon-trash');
        TestUtils.Simulate.click(removeButton);
        expect(spyRemove).toHaveBeenCalled();
        expect(spyChange).toHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style undo style button', () => {
        const actions = {
            onChange: () => { },
            onClassify: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');
        const spyClassify = expect.spyOn(actions, 'onClassify');

        const comp = ReactDOM.render(<ThematicLayer
            onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematicCustomClassification} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const undoButton = domNode.querySelector('.glyphicon-undo');
        TestUtils.Simulate.click(undoButton);
        expect(spyChange).toHaveBeenCalled();
        expect(spyClassify).toHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style refresh style button', () => {
        const actions = {
            onChange: () => { }
        };
        const spyChange = expect.spyOn(actions, 'onChange');

        const comp = ReactDOM.render(<ThematicLayer
            onChange={actions.onChange} onClassify={actions.onClassify}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const refreshButton = domNode.querySelector('.glyphicon-ok');
        TestUtils.Simulate.click(refreshButton);
        expect(spyChange).toHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style invalid input', () => {
        const comp = ReactDOM.render(<ThematicLayer colors={colors}
            layer={layerWithConfiguredThematic}
            invalidInputs={{
                intervals: {
                    message: 'myerror',
                    params: {}
                }
            }}
            adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        expect(document.getElementsByClassName('thematic_layer').length).toBe(1);
        expect(document.getElementsByClassName('thematic_layer')[0].childNodes.length).toBe(1);
        const error = domNode.querySelectorAll('.alert-danger')[0];
        expect(error).toExist();
        expect(error.innerText.indexOf('myerror') !== -1).toBe(true);
    });

    it('tests ThematicLayer component with configured thematic thema style invalid intervals', () => {
        const actions = {
            onInvalidInput: () => { }
        };
        const spyInvalid = expect.spyOn(actions, 'onInvalidInput');

        const comp = ReactDOM.render(<ThematicLayer
            onInvalidInput={actions.onInvalidInput}
            maxClasses={3}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const intervalsPicker = domNode.querySelectorAll('.rw-numberpicker')[0];
        expect(intervalsPicker).toExist();
        TestUtils.Simulate.mouseDown(intervalsPicker.querySelector('.rw-btn'));
        expect(spyInvalid).toHaveBeenCalled();
    });

    it('tests ThematicLayer component with configured thematic thema style invalid classification', () => {
        const actions = {
            onInvalidInput: () => { }
        };
        const spyInvalid = expect.spyOn(actions, 'onInvalidInput');

        const comp = ReactDOM.render(<ThematicLayer
            onInvalidInput={actions.onInvalidInput}
            maxClasses={3}
            layer={layerWithConfiguredThematic} adminCfg={{ open: false, current: "{}" }} classification={classification} />, document.getElementById("container"));

        const domNode = ReactDOM.findDOMNode(comp);
        expect(domNode).toExist();
        const input = domNode.querySelectorAll('input.rw-input')[7];
        TestUtils.Simulate.change(input, { "target": { "value": "5" } });
        expect(spyInvalid).toHaveBeenCalled();
    });
});
