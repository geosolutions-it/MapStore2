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
import GET_CAP_RESPONSE from 'raw-loader!../../../../../test-resources/wms/GetCapabilities-1.1.1.xml';
import Display from '../Display';
import MockAdapter from "axios-mock-adapter";
import axios from "../../../../../libs/ajax";
import { setConfigProp } from "../../../../../utils/ConfigUtils";
let mockAxios;
describe('test Layer Properties Display module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        setConfigProp('miscSettings', { experimentalInteractiveLegend: true });
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        mockAxios.restore();
        setConfigProp('miscSettings', { });
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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(5);
        ReactTestUtils.Simulate.focus(inputs[0]);
        expect(inputs[0].value).toBe('100');
    });
    it('tests Display component for wms for map viewer', () => {
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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(13);
        ReactTestUtils.Simulate.focus(inputs[2]);
        expect(inputs[2].value).toBe('70');
        inputs[8].click();
        expect(spy.calls.length).toBe(1);
    });
    it('tests Display component for wms for dashboard or geostory', () => {
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
        const comp = ReactDOM.render(<Display element={l} hideInteractiveLegendOption settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(12);
        ReactTestUtils.Simulate.focus(inputs[2]);
        expect(inputs[2].value).toBe('70');
        inputs[8].click();
        expect(spy.calls.length).toBe(1);
    });
    it('tests Display component for wms with format fetch', (done) => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'some url'
        };
        const settings = {
            options: {opacity: 0.7}
        };
        mockAxios.onGet().reply(() => {
            return [200, GET_CAP_RESPONSE];
        });
        const handlers = {
            onChange: (prop, value) =>{
                try {
                    expect(prop).toBe("imageFormats");
                    expect(value).toBeTruthy();
                    expect(value[0]).toEqual("image/png");
                    done();
                } catch (e) {
                    done(e);
                }
            }
        };

        const comp = ReactDOM.render(<Display element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const formatRefresh = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "format-refresh" );
        ReactTestUtils.Simulate.click(formatRefresh[0]);
    });

    it('tests Display component for wms with format fetch on select open if the imageFormats options is empty', (done) => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'some url'
        };
        const settings = {
            options: {opacity: 0.7}
        };
        mockAxios.onGet().reply(() => {
            return [200, GET_CAP_RESPONSE];
        });
        const handlers = {
            onChange: (prop, value) =>{
                try {
                    expect(prop).toBe("imageFormats");
                    expect(value).toBeTruthy();
                    expect(value[0]).toEqual("image/png");
                    done();
                } catch (e) {
                    done(e);
                }
            }
        };

        ReactDOM.render(<Display element={l} settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        const selectFormat = document.querySelector('.format-select .Select-input > input');
        expect(selectFormat).toBeTruthy();
        ReactTestUtils.act(() => {
            ReactTestUtils.Simulate.focus(selectFormat);
            ReactTestUtils.Simulate.keyDown(selectFormat, { key: 'ArrowDown', keyCode: 40 });
        });
    });

    it('tests Display component for wms with localized layer styles enabled', () => {
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
        ReactDOM.render(<Display isLocalizedLayerStylesEnabled element={l} settings={settings}/>, document.getElementById("container"));
        const isLocalizedLayerStylesOption = document.querySelector('[data-qa="display-lacalized-layer-styles-option"]');
        expect(isLocalizedLayerStylesOption).toBeTruthy();
    });


    it('tests Layer Properties Legend component for map viewer only', () => {
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
        expect(comp).toBeTruthy();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendWidth = inputs[11];
        const legendHeight = inputs[12];
        // Default legend values
        expect(legendWidth.value).toBe('12');
        expect(legendHeight.value).toBe('12');
        expect(labels.length).toBe(8);
        expect(labels[4].innerText).toBe("layerProperties.legendOptions.title");
        expect(labels[5].innerText).toBe("layerProperties.legendOptions.legendWidth");
        expect(labels[6].innerText).toBe("layerProperties.legendOptions.legendHeight");
        expect(labels[7].innerText).toBe("layerProperties.legendOptions.legendPreview");
    });
    it('tests Layer Properties Legend component for dashboard or geostory', () => {
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
        const comp = ReactDOM.render(<Display element={l} hideInteractiveLegendOption settings={settings} onChange={handlers.onChange}/>, document.getElementById("container"));
        expect(comp).toBeTruthy();
        const labels = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "control-label" );
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendWidth = inputs[10];
        const legendHeight = inputs[11];
        // Default legend values
        expect(legendWidth.value).toBe('12');
        expect(legendHeight.value).toBe('12');
        expect(labels.length).toBe(8);
        expect(labels[4].innerText).toBe("layerProperties.legendOptions.title");
        expect(labels[5].innerText).toBe("layerProperties.legendOptions.legendWidth");
        expect(labels[6].innerText).toBe("layerProperties.legendOptions.legendHeight");
        expect(labels[7].innerText).toBe("layerProperties.legendOptions.legendPreview");
    });
    it('tests wms Layer Properties Legend component events', () => {
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
            },
            enableInteractiveLegend: false
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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendPreview = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "legend-preview" );
        expect(legendPreview).toBeTruthy();
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(13);
        let interactiveLegendConfig = inputs[10];
        let legendWidth = inputs[11];
        let legendHeight = inputs[12];
        const img = ReactTestUtils.scryRenderedDOMComponentsWithTag(comp, 'img');

        // Check value in img src
        let params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('15');
        expect(params.get("height")).toBe('15');

        // With valid values
        legendWidth.value = 20;
        ReactTestUtils.Simulate.change(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual({ legendOptions: { legendWidth: 20, legendHeight: 15 } });

        legendHeight.value = 20;
        ReactTestUtils.Simulate.change(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[1].arguments[0]).toEqual({ legendOptions: { legendWidth: 20, legendHeight: 20 } });
        expect(spy.calls.length).toBe(2);

        // Check value in img src
        params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('20');
        expect(params.get("height")).toBe('20');

        // With Invalid values
        legendWidth.value = 1.2;
        ReactTestUtils.Simulate.change(legendWidth);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[2].arguments[0]).toEqual({ legendOptions: { legendWidth: 1, legendHeight: 20 } });
        legendHeight.value = 25.2;
        ReactTestUtils.Simulate.change(legendHeight);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[3].arguments[0]).toEqual({ legendOptions: { legendWidth: 1, legendHeight: 25 } });
        expect(spy.calls.length).toBe(4);

        // If either of the value is invalid, take default width and height
        params = new URLSearchParams(img[0].src);
        expect(params.get("width")).toBe('12');
        expect(params.get("height")).toBe('12');

        // change enableInteractiveLegend to enable interactive legend
        interactiveLegendConfig.checked = true;
        ReactTestUtils.Simulate.change(interactiveLegendConfig);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[4].arguments[0]).toEqual("enableInteractiveLegend");
        expect(spy.calls[4].arguments[1]).toEqual(true);


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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(13);
        expect(inputs[11].value).toBe("20");
        expect(inputs[12].value).toBe("40");
    });
    it('tests wfs Layer Properties Legend component events', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'wfs',
            url: 'fakeurl',
            legendOptions: {
                legendWidth: 15,
                legendHeight: 15
            },
            enableInteractiveLegend: false
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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendPreview = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "legend-preview" );
        expect(legendPreview).toBeTruthy();
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(6);
        let interactiveLegendConfig = document.querySelector(".legend-options input[data-qa='display-interactive-legend-option']");
        // change enableInteractiveLegend to enable interactive legend
        interactiveLegendConfig.checked = true;
        ReactTestUtils.Simulate.change(interactiveLegendConfig);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual("enableInteractiveLegend");
        expect(spy.calls[0].arguments[1]).toEqual(true);
    });
    it('tests vector Layer Properties Legend component events', () => {
        const l = {
            name: 'layer00',
            title: 'Layer',
            visibility: true,
            storeIndex: 9,
            type: 'vector',
            url: 'fakeurl',
            legendOptions: {
                legendWidth: 15,
                legendHeight: 15
            },
            enableInteractiveLegend: false
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
        expect(comp).toBeTruthy();
        const inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag( comp, "input" );
        const legendPreview = ReactTestUtils.scryRenderedDOMComponentsWithClass( comp, "legend-preview" );
        expect(legendPreview).toBeTruthy();
        expect(inputs).toBeTruthy();
        expect(inputs.length).toBe(6);
        let interactiveLegendConfig = document.querySelector(".legend-options input[data-qa='display-interactive-legend-option']");
        // change enableInteractiveLegend to enable interactive legend
        interactiveLegendConfig.checked = true;
        ReactTestUtils.Simulate.change(interactiveLegendConfig);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual("enableInteractiveLegend");
        expect(spy.calls[0].arguments[1]).toEqual(true);
    });

});
