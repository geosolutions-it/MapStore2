/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {get} from 'lodash';
import describeStates from '../../../../../../test-resources/wfs/describe-states.json';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import wfsChartOptions from '../wfsChartOptions';
import BasePanel from '../WPSWidgetOptions';
const WPSWidgetOptions = wfsChartOptions(BasePanel);
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
    it('Test WPSWidgetOptions onChange for chart context, WPS gs:Aggregate available', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions hasAggregateProcess featureTypeProperties={get(describeStates, "featureTypes[0].properties")} data={{ type: 'bar' }} onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[2].arguments[1]).toBe("Count");

        ReactTestUtils.Simulate.change(inputs[4]);
        expect(spyonChange.calls[3].arguments[0]).toBe("legend");
        expect(spyonChange.calls[3].arguments[1]).toBe(true);
    });
    it('Test WPSWidgetOptions onChange for chart context, WPS not available', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions featureTypeProperties={get(describeStates, "featureTypes[0].properties")} data={{ type: 'bar' }} onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(4); // operation is not visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[0], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[0], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");


        ReactTestUtils.Simulate.change(inputs[3]);
        expect(spyonChange.calls[2].arguments[0]).toBe("legend");
        expect(spyonChange.calls[2].arguments[1]).toBe(true);
    });
    it('Test WPSWidgetOptions onChange for counter context', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions hasAggregateProcess formOptions={{
            showColorRamp: false,
            showUom: true,
            showGroupBy: false,
            showLegend: false,
            advancedOptions: false
        }}
        featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
        onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(3); // groupBy and legend not visible
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
});
