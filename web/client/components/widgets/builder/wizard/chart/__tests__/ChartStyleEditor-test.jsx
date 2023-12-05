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
import ChartStyleEditor from '../ChartStyleEditor';
import { Simulate, act } from 'react-dom/test-utils';

describe('ChartStyleEditor', () => {
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
        ReactDOM.render(<ChartStyleEditor />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children.length).toBe(0);
    });
    it('should render line chart style editor (mode lines)', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'line',
                style: {
                    mode: 'lines'
                }
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'widgets.advanced.lineColor',
            'widgets.advanced.lineWidth'
        ]);
    });
    it('should render line chart style editor (mode markers)', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'line',
                style: {
                    mode: 'markers'
                }
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'widgets.advanced.markerColor',
            'widgets.advanced.markerSize'
        ]);
    });
    it('should render line chart style editor (mode lines+markers)', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'line',
                style: {
                    mode: 'lines+markers'
                }
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'widgets.advanced.lineColor',
            'widgets.advanced.lineWidth',
            'widgets.advanced.markerColor',
            'widgets.advanced.markerSize'
        ]);
    });
    it('should render bar chart style editor (nsMode simple)', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'bar',
                style: {
                    msMode: 'simple'
                }
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'styleeditor.fill',
            'styleeditor.outlineColor',
            'styleeditor.outlineWidth'
        ]);
    });
    it('should render bar chart style editor (nsMode classification)', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'bar',
                style: {
                    msMode: 'classification'
                }
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'widgets.builder.wizard.classAttributes.classificationAttribute',
            'styleeditor.method',
            'widgets.advanced.sortBy',
            'styleeditor.colorRamp',
            'styleeditor.intervals',
            'styleeditor.outlineColor',
            'styleeditor.outlineWidth'
        ]);
    });
    it('should render pie chart style editor', () => {
        ReactDOM.render(<ChartStyleEditor
            data={{
                type: 'pie'
            }}
        />, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.builder.wizard.classAttributes.classificationAttribute',
            'styleeditor.method',
            'widgets.advanced.sortBy',
            'styleeditor.colorRamp',
            'styleeditor.intervals',
            'styleeditor.outlineColor',
            'styleeditor.outlineWidth'
        ]);
    });
    it('should trigger on change', (done) => {
        act(() => {
            ReactDOM.render(<ChartStyleEditor
                data={{
                    type: 'line',
                    style: {
                        mode: 'lines',
                        line: {
                            color: '#ff0000',
                            width: 1
                        }
                    }
                }}
                onChange={(key, value) => {
                    try {
                        expect(key).toBe('style');
                        expect(value).toEqual({
                            mode: 'lines',
                            line: {
                                color: '#ff0000',
                                width: 3
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'widgets.advanced.mode',
            'widgets.advanced.lineColor',
            'widgets.advanced.lineWidth'
        ]);

        const inputsNodes = document.querySelectorAll('input');
        expect(inputsNodes.length).toBe(2);
        Simulate.focus(inputsNodes[1]);
        Simulate.change(inputsNodes[1], { target: { value: 3 } });
    });
});
