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
import ChartAxisOptions from '../ChartAxisOptions';
import { Simulate } from 'react-dom/test-utils';

describe('ChartAxisOptions', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<ChartAxisOptions />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            // y
            'widgets.advanced.yAxisType',
            'styleeditor.color',
            'styleeditor.fontSize',
            'styleeditor.fontFamily',
            'widgets.advanced.prefix',
            'widgets.advanced.format ',
            'widgets.advanced.suffix',
            'widgets.advanced.side',
            'widgets.advanced.anchor',
            // x
            'widgets.advanced.xAxisType',
            'styleeditor.color',
            'styleeditor.fontSize',
            'styleeditor.fontFamily',
            'widgets.advanced.side',
            'widgets.advanced.anchor'
        ]);
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            // y
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels',

            // x
            'widgets.advanced.forceTicks',
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels'
        ]);
    });
    it('should trigger on change', (done) => {
        ReactDOM.render(<ChartAxisOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'line'
                }]
            }]
        }}
        onChange={(key, value) => {
            try {
                expect(key).toBe('charts[chart-01].yAxisOpts');
                expect(value).toEqual([ { id: 0, hide: true } ]);
            } catch (e) {
                done(e);
            }
            done();
        }}/>, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            // y
            'widgets.advanced.yAxisType',
            'styleeditor.color',
            'styleeditor.fontSize',
            'styleeditor.fontFamily',
            'widgets.advanced.prefix',
            'widgets.advanced.format ',
            'widgets.advanced.suffix',
            'widgets.advanced.side',
            'widgets.advanced.anchor',
            // x
            'widgets.advanced.xAxisType',
            'styleeditor.color',
            'styleeditor.fontSize',
            'styleeditor.fontFamily',
            'widgets.advanced.side',
            'widgets.advanced.anchor'
        ]);
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            // y
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels',

            // x
            'widgets.advanced.forceTicks',
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels'
        ]);
        const checkboxInputNodes = document.querySelectorAll('input[type=\'checkbox\']');
        Simulate.change(checkboxInputNodes[1], { target: { checked: true }});
    });
    it('should display the checkbox to display current time', (done) => {
        ReactDOM.render(<ChartAxisOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'line'
                }],
                xAxisOpts: [{ id: 0, type: 'date' }]
            }]
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            // y
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels',

            // x
            'widgets.advanced.forceTicks',
            'widgets.advanced.xAxisAngle',
            'widgets.advanced.hideLabels',
            'widgets.advanced.showCurrentTime'
        ]);
        done();
    });
});
