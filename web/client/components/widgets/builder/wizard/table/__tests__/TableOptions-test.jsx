/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { get } = require('lodash');
const describeStates = require('json-loader!../../../../../../test-resources/wfs/describe-states.json');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');

const TableOptions = require('../TableOptions');
describe('TableOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TableOptions rendering with defaults', () => {
        ReactDOM.render(<TableOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.chart-options-form');
        expect(el).toExist();
        const resetButton = document.querySelector('.btn');
        expect(resetButton).toNotExist();
    });
    it('Test TableOptions tools visibility', () => {

        ReactDOM.render(<TableOptions
            data={{ options: { columnSettings: { test: {} } } }}
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const switchEl = document.querySelector('.mapstore-switch-btn');
        expect(switchEl).toExist();
        const resetButton = document.querySelector('.btn');
        expect(resetButton).toExist();

    });
    it('Test TableOptions onChange', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<TableOptions
            data={{options: { columnSettings: {test: {}}}}}
            featureTypeProperties={get(describeStates, "featureTypes[0].properties")}
            onChange={actions.onChange}
            dependencies={{ viewport: {} }} />, document.getElementById("container"));
        const inputs = document.querySelectorAll('input');
        expect(inputs.length).toBe(16); // 15 + 1 mapSync because dependencies is present
        ReactTestUtils.Simulate.change(inputs[15]);
        expect(spyonChange.calls[0].arguments[0]).toBe("mapSync");
        expect(spyonChange.calls[0].arguments[1]).toBe(true);
        const resetButton = document.querySelector('.btn');
        expect(resetButton).toExist();
        ReactTestUtils.Simulate.click(resetButton);
        expect(spyonChange.calls[1].arguments[0]).toBe("options.columnSettings");
        expect(spyonChange.calls[1].arguments[1]).toBe(undefined);
    });
});
