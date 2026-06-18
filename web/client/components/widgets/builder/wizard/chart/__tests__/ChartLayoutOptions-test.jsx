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
import ChartLayoutOptions from '../ChartLayoutOptions';
import { Simulate } from 'react-dom/test-utils';

describe('ChartLayoutOptions', () => {
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
        ReactDOM.render(<ChartLayoutOptions />, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.displayCartesian',
            'widgets.displayLegend.default'
        ]);
    });
    it('should render pie fields', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'pie'
                }]
            }]
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual(['widgets.displayLegend.default']);
    });
    it('should render bar fields', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'bar'
                }]
            }]
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.displayCartesian',
            'widgets.displayLegend.default'
        ]);
    });
    it('should render multiple bar fields', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'bar'
                }, {
                    type: 'bar'
                }]
            }]
        }}/>, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText.trim())).toEqual([ 'widgets.advanced.barChartType', 'widgets.advanced.hovermode', 'styleeditor.color', 'styleeditor.fontSize', 'styleeditor.fontFamily' ]);
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.displayCartesian',
            'widgets.displayLegend.default'
        ]);
    });
    it('should render line fields', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{
                    type: 'line'
                }]
            }]
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.displayCartesian',
            'widgets.displayLegend.default'
        ]);
    });
    it('should trigger on change', (done) => {
        ReactDOM.render(<ChartLayoutOptions data={{
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
                expect(key).toBe('charts[chart-01].legend');
                expect(value).toBe(true);
            } catch (e) {
                done(e);
            }
            done();
        }}
        />, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.displayCartesian',
            'widgets.displayLegend.default'
        ]);
        const checkboxInputNodes = document.querySelectorAll('input[type=\'checkbox\']');
        Simulate.change(checkboxInputNodes[1], { target: { checked: true }});
    });
    it('should not render hovermode dropdown for pie chart', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{ type: 'pie' }]
            }]
        }}/>, document.getElementById('container'));
        expect(document.querySelector('.ms-chart-hovermode')).toBe(null);
    });
    it('should render hovermode dropdown for cartesian chart', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                traces: [{ type: 'line' }]
            }]
        }}/>, document.getElementById('container'));
        expect(document.querySelector('.ms-chart-hovermode')).toNotBe(null);
    });
    it('should render hovermode value from layout', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                layout: {
                    hovermode: 'closest'
                },
                traces: [{
                    type: 'line'
                }]
            }]
        }}/>, document.getElementById('container'));
        expect(document.querySelector('.ms-chart-hovermode .Select-value-label').innerText).toBe('widgets.advanced.hovermodeClosest');
    });
    it('should render disabled hovermode value from layout', () => {
        ReactDOM.render(<ChartLayoutOptions data={{
            selectedChartId: 'chart-01',
            charts: [{
                chartId: 'chart-01',
                layout: {
                    hovermode: false
                },
                traces: [{
                    type: 'line'
                }]
            }]
        }}/>, document.getElementById('container'));
        expect(document.querySelector('.ms-chart-hovermode .Select-value-label').innerText).toBe('widgets.advanced.hovermodeFalse');
    });
});
