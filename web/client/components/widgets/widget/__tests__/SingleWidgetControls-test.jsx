/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import SingleWidgetControls from "../SingleWidgetControls";
describe('SingleWidgetControls component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SingleWidgetControls rendering with list of widgets', () => {
        const options = {
            activeWidget: {
                id: 1,
                title: 'Another Widget'
            },
            dropdownWidgets: [
                {id: 2, title: 'Test Widget'},
                {id: 1, title: 'Another Widget'}
            ]
        };
        ReactDOM.render(<SingleWidgetControls options={options} />, document.getElementById("container"));
        const container = document.getElementById('container');

        const el = container.querySelector('.widget-selector');
        const left = container.querySelector('.previous-widget');
        const right = container.querySelector('.next-widget');
        const label = container.querySelector('.Select-value .Select-value-label');

        expect(el).toExist();
        expect(left).toExist();
        expect(right).toExist();
        expect(label.textContent).toBe('Another Widget');

        ReactDOM.render(<SingleWidgetControls options={{...options, activeWidget: { id: 2, title: 'Test Widget'}}} />, document.getElementById("container"));
        expect(label.textContent).toBe('Test Widget');
    });
});
