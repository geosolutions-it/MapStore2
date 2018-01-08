/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const StringSelector = require('../StringSelector');
describe('StringSelector component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('StringSelector rendering with defaults', () => {
        ReactDOM.render(<StringSelector />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.mapstore-string-select');
        expect(el).toExist();
    });
    it('Test StringSelector onSelect', () => {
        const actions = {
            onSelect: () => {}
        };
        const spyonSelect = expect.spyOn(actions, 'onSelect');
        const options = [{v: 1, l: "1"}, {v: 2, l: "2"}];
        ReactDOM.render(<StringSelector valueField="v" displayField="l" value={1} options={options} onSelect={actions.onSelect} />, document.getElementById("container"));
        const el = document.querySelector('.mapstore-string-select > :first-child');
        expect(el).toExist();
        expect(document.querySelector('.m-options')).toNotExist();
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(document.querySelector('.m-options')).toExist();
        ReactTestUtils.Simulate.click(document.querySelector('.m-options ul li'));
        expect(spyonSelect).toHaveBeenCalled();
        expect(document.querySelector('.m-options')).toNotExist();
        ReactTestUtils.Simulate.click(el);
        expect(document.querySelector('.m-options')).toExist();
        document.querySelector('#container').click();
        expect(document.querySelector('.m-options')).toNotExist();
    });
});
