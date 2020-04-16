/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var ReactTestUtils = require('react-dom/test-utils');
var General = require('../General');

var expect = require('expect');

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

    it('tests General component', () => {
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
        expect(inputs.length).toBe(18);

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
        expect(inputs.length).toBe(18);
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
        expect(forms.length).toBe(5);
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
        expect(labels.length).toBe(10);
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
        expect(labels.length).toBe(8);
        expect(labels[4].innerText).toBe("layerProperties.group");
    });

    it('tests Layer Properties Legend component', () => {
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
        const comp = ReactDOM.render(<General element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        expect(labels.length).toBe(10);
        expect(labels[7].innerText).toBe("layerProperties.legendOptions.title");
        expect(labels[8].innerText).toBe("layerProperties.legendOptions.legendWidth");
        expect(labels[9].innerText).toBe("layerProperties.legendOptions.legendHeight");
    });

    it('tests Layer Properties Legend component events', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            legendOptions: {
                legendWidth: 15,
                legendHeight: 15
            }
        };
        const settings = {
            options: {
                opacity: 1
            }
        };
        const handlers = {
            onChange() {}
        };
        let spy = expect.spyOn(handlers, "onChange");
        const comp = ReactDOM.render(<General element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(18);
        let legendWidth = inputs[16];
        let legendHeight = inputs[17];

        // With valid values
        legendWidth.value = 20;
        legendHeight.value = 20;
        ReactTestUtils.Simulate.change(legendWidth);
        ReactTestUtils.Simulate.blur(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual({ legendOptions: { legendWidth: 20, legendHeight: 15 } });
        ReactTestUtils.Simulate.change(legendHeight);
        ReactTestUtils.Simulate.blur(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments[0]).toEqual({ legendOptions: { legendWidth: 15, legendHeight: 20 } });
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toBe(2);

        // With Invalid values
        legendWidth.value = 10.2;
        legendHeight.value = 25.2;

        ReactTestUtils.Simulate.change(legendWidth);
        ReactTestUtils.Simulate.blur(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[2].arguments[0]).toEqual({ legendOptions: { legendWidth: 10, legendHeight: 15 } });
        ReactTestUtils.Simulate.change(legendHeight);
        ReactTestUtils.Simulate.blur(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[3].arguments[0]).toEqual({ legendOptions: { legendWidth: 15, legendHeight: 25 } });
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toBe(4);

    });

    it("tests Layer Properties Legend component with values from layers", () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            legendOptions: {
                legendWidth: 20,
                legendHeight: 40
            }
        };
        const settings = {
            options: {
                opacity: 1
            }
        };
        const comp = ReactDOM.render(<General element={l} settings={settings}/>, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(18);
        expect(inputs[16].value).toBe("20");
        expect(inputs[17].value).toBe("40");
    });
});
