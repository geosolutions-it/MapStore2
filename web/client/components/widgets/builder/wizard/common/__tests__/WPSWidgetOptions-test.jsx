/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {get} = require('lodash');
const describeStates = require('../../../../../../test-resources/wfs/describe-states.json');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const wfsChartOptions = require('../wfsChartOptions');
const WPSWidgetOptions = wfsChartOptions(require('../WPSWidgetOptions'));
describe('WPSWidgetOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('WPSWidgetOptions rendering with defaults', () => {
        ReactDOM.render(<WPSWidgetOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
    });
    it('Test WPSWidgetOptions onChange for chart context', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions featureTypeProperties={get(describeStates, "featureTypes[0].properties") } data={{type: 'bar'}} onChange={actions.onChange} dependencies={{viewport: {}}}/>, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], {keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], {keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], {keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[2].arguments[1]).toBe("Count");

        ReactTestUtils.Simulate.change(inputs[4]);
        expect(spyonChange.calls[3].arguments[0]).toBe("legend");
        expect(spyonChange.calls[3].arguments[1]).toBe(true);

        ReactTestUtils.Simulate.change(inputs[6]);
        expect(spyonChange.calls[4].arguments[0]).toBe("cartesian");
        expect(spyonChange.calls[4].arguments[1]).toBe(false);

        ReactTestUtils.Simulate.change(inputs[7]);
        expect(spyonChange.calls[5].arguments[0]).toBe("yAxis");
        expect(spyonChange.calls[5].arguments[1]).toBe(true);

        ReactTestUtils.Simulate.change(inputs[8], { target: { value: 'Y axis label' } });
        expect(spyonChange.calls[6].arguments[0]).toBe("yAxisLabel");
        expect(spyonChange.calls[6].arguments[1]).toBe("Y axis label");


    });
    it('Test WPSWidgetOptions onChange for counter context', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions formOptions={{
            showColorRamp: false,
            showUom: true,
            showGroupBy: false,
            showLegend: false,
            advancedOptions: false
        }}
        featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
        onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");


        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[1].arguments[1]).toBe("Count");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'test' } });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.seriesOptions.[0].uom");
        expect(spyonChange.calls[2].arguments[1]).toBe("test");
    });

    it('Test WPSWidgetOptions with rotation slider ', () => {
        const actions = {
            onChange: () => { }
        };
        ReactDOM.render(<WPSWidgetOptions
            formOptions={{
                showColorRamp: false,
                showUom: true,
                showGroupBy: false,
                showLegend: false,
                advancedOptions: true
            }}
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }}
            data={{type: "line", xAxisAngle: 45}}/>, document.getElementById("container"));
        const slider = document.getElementsByClassName('mapstore-slider');
        expect(slider).toExist();
        const tooltip = document.getElementsByClassName('noUi-tooltip')[0];
        expect(tooltip.innerText).toBe("45");

    });
});
