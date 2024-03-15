/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TraceLegendOptions from '../TraceLegendOptions';
import { Simulate } from 'react-dom/test-utils';

describe('TraceLegendOptions', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<TraceLegendOptions />, document.getElementById('container'));
        expect(document.getElementById('container').children.length).toBe(0);
    });
    it('should render pie fields', () => {
        ReactDOM.render(<TraceLegendOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'pie'
                }]
            }]
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual(['widgets.advanced.includeLegendPercent']);
    });
    it('should trigger on change', (done) => {
        ReactDOM.render(<TraceLegendOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    id: 'trace-01',
                    type: 'pie'
                }]
            }]
        }}
        onChange={(key, value) => {
            try {
                expect(key).toBe('charts[chart-01].traces[trace-01].includeLegendPercent');
                expect(value).toBe(true);
            } catch (e) {
                done(e);
            }
            done();
        }}
        />, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual(['widgets.advanced.includeLegendPercent']);
        const checkboxInputNodes = document.querySelectorAll('input[type=\'checkbox\']');
        Simulate.change(checkboxInputNodes[0], { target: { checked: true }});
    });
});
