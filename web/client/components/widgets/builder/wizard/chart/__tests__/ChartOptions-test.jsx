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
const describeStates = require('json-loader!../../../../../../test-resources/wfs/describe-states.json');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const wfsChartOptions = require('../wfsChartOptions');
const ChartOptions = wfsChartOptions(require('../ChartOptions'));
describe('ChartOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartOptions rendering with defaults', () => {
        ReactDOM.render(<ChartOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
    });
    it('Test ChartOptions onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<ChartOptions featureTypeProperties={get(describeStates, "featureTypes[0].properties") } onChange={actions.onChange} />, document.getElementById("container"));
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


        ReactTestUtils.Simulate.change(inputs[3]);
        expect(spyonChange.calls[3].arguments[0]).toBe("mapSync");
        expect(spyonChange.calls[3].arguments[1]).toBe(true);

        ReactTestUtils.Simulate.change(inputs[4]);
        expect(spyonChange.calls[4].arguments[0]).toBe("legend");
        expect(spyonChange.calls[4].arguments[1]).toBe(true);
    });
});
