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
import ModelTransformation from '../ModelTransformation';
import { Simulate, act } from 'react-dom/test-utils';

describe('ModelTransformation', () => {
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
        ReactDOM.render(<ModelTransformation />, document.getElementById('container'));
        expect(document.getElementById('container').children.length).toBe(0);
    });
    it('should render default fields', () => {
        ReactDOM.render(<ModelTransformation layer={{
            type: 'model'
        }}/>, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.modelLayer.modelCenterLng',
            'layerProperties.modelLayer.modelCenterLat',
            'layerProperties.heightOffset'
        ]);
    });
    it('should trigger on change with model center lng input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model'
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('center');
                    expect(value[0]).toBe(2);
                    expect(value[1]).toBe(0);
                    expect(value[2]).toBe(0);
                } catch (e) {
                    done(e);
                }
                done();
            }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.modelLayer.modelCenterLng',
            'layerProperties.modelLayer.modelCenterLat',
            'layerProperties.heightOffset'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[0]);
        Simulate.change(inputNodes[0], { target: { value: 2 } });
    });
    it('should trigger on change with model center lat input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model'
            }}
            onChange={(key, value) => {
                try {
				 	expect(key).toBe('center');
                    expect(value[0]).toBe(0);
                    expect(value[1]).toBe(1);
                    expect(value[2]).toBe(0);
                } catch (e) {
                    done(e);
                }
                done();
            }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.modelLayer.modelCenterLng',
            'layerProperties.modelLayer.modelCenterLat',
            'layerProperties.heightOffset'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[1]);
        Simulate.change(inputNodes[1], { target: { value: 1 } });
    });
    it('should trigger on change with heightOffset input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model', center: [0, 0, 0]
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('center');
                    expect(value[0]).toBe(0);
                    expect(value[1]).toBe(0);
                    expect(value[2]).toBe(10);
                } catch (e) {
                    done(e);
                }
                done();
            }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.modelLayer.modelCenterLng',
            'layerProperties.modelLayer.modelCenterLat',
            'layerProperties.heightOffset'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[2]);
        Simulate.change(inputNodes[2], { target: { value: 10 } });
    });
});
