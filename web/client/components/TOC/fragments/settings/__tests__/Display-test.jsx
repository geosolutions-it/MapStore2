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
var Display = require('../Display');

var expect = require('expect');

describe('test Layer Properties Display module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('tests Display component', () => {
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
        const comp = ReactDOM.render(<Display element={l} settings={settings} />, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);
        expect(inputs[0].getAttribute('type')).toBe('number');
        expect(inputs[0].value).toBe('100');
    });
    it('tests Display component for wms', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const settings = {
            options: {opacity: 0.7}
        };
        const handlers = {
            onChange() {}
        };
        let spy = expect.spyOn(handlers, "onChange");
        // wrap in a stateful component, stateless components render return null
        // see: https://facebook.github.io/react/docs/top-level-api.html#reactdom.render
        const comp = ReactDOM.render(<Display element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(6);
        expect(inputs[0].getAttribute('type')).toBe('number');
        expect(inputs[0].value).toBe('70');
        inputs[1].click();
        expect(spy.calls.length).toBe(1);
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
        const comp = ReactDOM.render(<Display element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        expect(labels.length).toBe(6);
        expect(labels[2].innerText).toBe("layerProperties.legendOptions.title");
        expect(labels[3].innerText).toBe("layerProperties.legendOptions.legendWidth");
        expect(labels[4].innerText).toBe("layerProperties.legendOptions.legendHeight");
        expect(labels[5].innerText).toBe("layerProperties.legendOptions.legendPreview");
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
        const comp = ReactDOM.render(<Display element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendPreview = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "legend-preview" );
        expect(legendPreview).toExist();
        expect(inputs).toExist();
        expect(inputs.length).toBe(6);
        let legendWidth = inputs[4];
        let legendHeight = inputs[5];
        const img = ReactTestUtils.scryRenderedDOMComponentsWithTag(comp, 'img');

        // Check value in img src
        let params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('15');
        expect(params.get("height")).toBe('15');

        // With valid values
        legendWidth.value = 20;
        ReactTestUtils.Simulate.change(legendWidth);
        ReactTestUtils.Simulate.blur(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual({ legendOptions: { legendWidth: 20, legendHeight: 15 } });
        legendHeight.value = 20;
        ReactTestUtils.Simulate.change(legendHeight);
        ReactTestUtils.Simulate.blur(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[2].arguments[0]).toEqual({ legendOptions: { legendWidth: 20, legendHeight: 20 } });
        expect(spy.calls.length).toBe(4);

        // Check value in img src
        params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('20');
        expect(params.get("height")).toBe('20');

        // With Invalid values
        legendWidth.value = 1.2;
        ReactTestUtils.Simulate.change(legendWidth);
        ReactTestUtils.Simulate.blur(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[4].arguments[0]).toEqual({ legendOptions: { legendWidth: 1, legendHeight: 20 } });
        legendHeight.value = 25.2;
        ReactTestUtils.Simulate.change(legendHeight);
        ReactTestUtils.Simulate.blur(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[6].arguments[0]).toEqual({ legendOptions: { legendWidth: 1, legendHeight: 25 } });
        expect(spy.calls.length).toBe(8);

        // If either of the value is invalid, take default width and height
        params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('12');
        expect(params.get("height")).toBe('12');

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
        const comp = ReactDOM.render(<Display element={l} settings={settings}/>, document.getElementById("container"));
        expect(comp).toExist();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toExist();
        expect(inputs.length).toBe(6);
        expect(inputs[4].value).toBe("20");
        expect(inputs[5].value).toBe("40");
    });
});
