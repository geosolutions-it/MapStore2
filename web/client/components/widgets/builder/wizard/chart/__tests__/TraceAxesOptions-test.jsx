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
import TraceAxesOptions from '../TraceAxesOptions';
import { Simulate, act } from 'react-dom/test-utils';

describe('TraceAxesOptions', () => {
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
        ReactDOM.render(<TraceAxesOptions />, document.getElementById('container'));
        expect(document.getElementById('container').children.length).toBe(0);
    });
    it('should axis field render with line chart type', () => {
        ReactDOM.render(<TraceAxesOptions
            data={{
                selectedChartId: 'chart-01',
                charts: [{
                    chartId: 'chart-01',
                    traces: [{
                        type: 'line'
                    }]
                }]
            }}
        />, document.getElementById('container'));
        const controlLabelNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.yAxis',
            'widgets.advanced.xAxis'
        ]);
    });
    it('should axis field render with bar chart type', () => {
        ReactDOM.render(<TraceAxesOptions
            data={{
                selectedChartId: 'chart-01',
                charts: [{
                    chartId: 'chart-01',
                    traces: [{
                        type: 'bar'
                    }]
                }]
            }}
        />, document.getElementById('container'));
        const controlLabelNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.yAxis',
            'widgets.advanced.xAxis'
        ]);
    });
    it('should trigger on change function with multiple y axis are available', (done) => {
        act(() => {
            ReactDOM.render(<TraceAxesOptions
                data={{
                    selectedChartId: 'chart-01',
                    charts: [{
                        chartId: 'chart-01',
                        traces: [{
                            id: 'trace-01',
                            type: 'bar'
                        }],
                        yAxisOpts: [{ id: 0 }, { id: 'axis-01' }]
                    }]
                }}
                onChange={(key, value) => {
                    try {
                        expect(key).toBe('charts[chart-01].traces[trace-01].yaxis');
                        expect(value).toBe('axis-01');
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        const controlLabelNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.yAxis',
            'widgets.advanced.xAxis'
        ]);
        const selectFields = document.querySelectorAll('.Select-input > input');
        expect(selectFields.length).toBe(1);
        Simulate.focus(selectFields[0]);
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select first in menu
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select second in menu
        Simulate.keyDown(selectFields[0], { key: 'Enter', keyCode: 13 });
    });
    it('should trigger on change function with multiple x axis are available', (done) => {
        act(() => {
            ReactDOM.render(<TraceAxesOptions
                data={{
                    selectedChartId: 'chart-01',
                    charts: [{
                        chartId: 'chart-01',
                        traces: [{
                            id: 'trace-01',
                            type: 'bar'
                        }],
                        xAxisOpts: [{ id: 0 }, { id: 'axis-01' }]
                    }]
                }}
                onChange={(key, value) => {
                    try {
                        expect(key).toBe('charts[chart-01].traces[trace-01].xaxis');
                        expect(value).toBe('axis-01');
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        const controlLabelNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.yAxis',
            'widgets.advanced.xAxis'
        ]);
        const selectFields = document.querySelectorAll('.Select-input > input');
        expect(selectFields.length).toBe(1);
        Simulate.focus(selectFields[0]);
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select first in menu
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select second in menu
        Simulate.keyDown(selectFields[0], { key: 'Enter', keyCode: 13 });
    });
});
