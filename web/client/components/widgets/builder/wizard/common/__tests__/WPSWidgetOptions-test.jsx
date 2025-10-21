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
        expect(inputs.length).toBe(5); // operation is visible + 2 handle null checkboxes
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[3], { target: { value: 'Count' } });
        ReactTestUtils.Simulate.keyDown(inputs[3], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[2].arguments[0]).toBe("options.aggregateFunction");
        expect(spyonChange.calls[2].arguments[1]).toBe("Count");

    });
    it('Test WPSWidgetOptions onChange for chart context, WPS not available', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<WPSWidgetOptions featureTypeProperties={get(describeStates, "featureTypes[0].properties")} data={{ type: 'bar' }} onChange={actions.onChange} dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(5); // operation is not visible
        // simulate change with tab (for react-select)
        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
        expect(spyonChange.calls[0].arguments[1]).toBe("STATE_NAME");

        ReactTestUtils.Simulate.change(inputs[2], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[2], { keyCode: 9, key: 'Tab' });
        expect(spyonChange.calls[1].arguments[0]).toBe("options.aggregationAttribute");
        expect(spyonChange.calls[1].arguments[1]).toBe("STATE_NAME");

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
        expect(inputs.length).toBe(5); // groupBy and legend not visible + 2 checkboxes for null handling
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
    it('Test excludeNulls checkbox toggles nullPlaceholder input visibility', () => {
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{ type: 'bar', options: { groupByAttributes: 'STATE_NAME', useNullPlaceholderForGroupByFieldValue: true } }}
            onChange={() => {}}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        // Initially, excludeNulls is false, so useNullPlaceholder checkbox and input should be visible
        const excludeNullsCheckbox = container.querySelector('#excludeNullGroupByFieldValue');
        const useNullPlaceholderCheckbox = container.querySelector('#useNullPlaceholderForGroupByFieldValue');
        const placeholderInput = container.querySelector('#placeholderForNullGroupByField');

        expect(excludeNullsCheckbox).toExist();
        expect(excludeNullsCheckbox.checked).toBe(false);
        expect(useNullPlaceholderCheckbox).toExist();
        expect(placeholderInput).toExist();
    });
    it('Test placeholderForNullGroupByFieldValue auto-resets when groupByAttributes type changes', (done) => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');

        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{ type: 'bar', options: {} }}
            onChange={actions.onChange}
        />, document.getElementById("container"));

        const container = document.getElementById('container');
        const inputs = container.querySelectorAll('input');

        // Simulate selecting a groupByAttributes field
        ReactTestUtils.Simulate.change(inputs[1], { target: { value: 'STATE_NAME' } });
        ReactTestUtils.Simulate.keyDown(inputs[1], { keyCode: 9, key: 'Tab' });

        setTimeout(() => {
            // Check that onChange was called twice: once for groupByAttributes, once for placeholderForNullGroupByFieldValue reset
            expect(spyonChange.calls.length).toBeGreaterThan(1);
            expect(spyonChange.calls[0].arguments[0]).toBe("options.groupByAttributes");
            expect(spyonChange.calls[1].arguments[0]).toBe("options.placeholderForNullGroupByFieldValue");
            done();
        }, 500);
    });
    it('Test excludeNullGroupByFieldValue checkbox hides placeholder options when checked', () => {
        const actions = {
            onChange: () => { }
        };

        // Render with excludeNullGroupByFieldValue false (default)
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{ type: 'bar', options: { groupByAttributes: 'STATE_NAME', excludeNullGroupByFieldValue: false } }}
            onChange={actions.onChange}
        />, document.getElementById("container"));

        const container = document.getElementById('container');

        // Initially, both checkboxes should be visible
        expect(container.querySelector('#excludeNullGroupByFieldValue')).toExist();
        expect(container.querySelector('#useNullPlaceholderForGroupByFieldValue')).toExist();

        // Now render with excludeNullGroupByFieldValue true
        ReactDOM.render(<WPSWidgetOptions
            hasAggregateProcess
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            data={{ type: 'bar', options: { groupByAttributes: 'STATE_NAME', excludeNullGroupByFieldValue: true } }}
            onChange={actions.onChange}
        />, document.getElementById("container"));

        // When excludeNullGroupByFieldValue is true, useNullPlaceholder checkbox should be hidden
        expect(container.querySelector('#excludeNullGroupByFieldValue')).toExist();
        expect(container.querySelector('#useNullPlaceholderForGroupByFieldValue')).toNotExist();
    });
});
