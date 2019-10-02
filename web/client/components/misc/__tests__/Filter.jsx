/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const Filter = require('../Filter');
const expect = require('expect');

const TestUtils = require('react-dom/test-utils');

describe('TOC Filter', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {
        const actions = {
            onFilter: () => {},
            onFocus: () => {}
        };
        const spyFilter = expect.spyOn(actions, 'onFilter');
        const spyFocus = expect.spyOn(actions, 'onFocus');

        const cmp = ReactDOM.render(<Filter onFilter={actions.onFilter}
            onFocus={actions.onFocus}/>, document.getElementById("container"));
        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();

        const input = el.getElementsByTagName('INPUT');
        input.value = 'filter text';
        TestUtils.Simulate.focus(input);
        expect(spyFocus).toHaveBeenCalled();
        TestUtils.Simulate.change(input);
        expect(spyFilter).toHaveBeenCalledWith('filter text');

        const glyphs = el.getElementsByClassName('glyphicon');
        expect(glyphs.length).toBe(1);

        const glyphType = el.getElementsByClassName('glyphicon-filter');
        expect(glyphType).toExist();
    });

    it('clear filter', () => {
        const actions = {
            onFilter: () => {}
        };
        const spyFilter = expect.spyOn(actions, 'onFilter');

        const cmp = ReactDOM.render(<Filter onFilter={actions.onFilter}
            onFocus={actions.onFocus}/>, document.getElementById("container"));
        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();

        const glyphs = el.getElementsByClassName('glyphicon');
        expect(glyphs.length).toBe(1);

        TestUtils.Simulate.click(glyphs.item(0));

        expect(spyFilter).toHaveBeenCalledWith('');
    });
});
