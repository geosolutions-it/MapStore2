/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import ChartType from '../ChartType';
describe('ChartType component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ChartType rendering with defaults', () => {
        ReactDOM.render(<ChartType />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('button');
        expect(el).toBeTruthy();
        expect(el.length).toBe(3);
        expect(container.querySelector('.btn-success')).toBeFalsy();
    });
    it('ChartType selected', () => {
        ReactDOM.render(<ChartType type="bar"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
        expect(container.querySelector('.btn-success')).toBeTruthy();
    });
    it('Test ChartType onSelect', () => {
        const actions = {
            onSelect: () => {}
        };
        const spyonSelect = expect.spyOn(actions, 'onSelect');
        ReactDOM.render(<ChartType type="bar" onSelect={actions.onSelect}  />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelectorAll('button')[1]);
        expect(spyonSelect).toHaveBeenCalled();
        expect(spyonSelect.calls[0].arguments[0]).toBe("pie");
    });
});
