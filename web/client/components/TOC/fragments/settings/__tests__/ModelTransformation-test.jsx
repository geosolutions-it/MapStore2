/*
 * Copyright 2024, GeoSolutions Sas.
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
            'layerProperties.modelLayer.height',
            'layerProperties.modelLayer.heading'
        ]);
    });
    it('should trigger on change with model center lng input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model',  features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } }]
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('features');
                    expect(value[0]).toEqual({ properties: {}, type: 'Feature', geometry: { type: 'Point', coordinates: [ 2, 0, 0 ] } });
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
            'layerProperties.modelLayer.height',
            'layerProperties.modelLayer.heading'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[0]);
        Simulate.change(inputNodes[0], { target: { value: 2 } });
    });
    it('should trigger on change with model center lat input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model',  features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } }]
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('features');
                    expect(value[0]).toEqual({ properties: {}, type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 1, 0 ] } });
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
            'layerProperties.modelLayer.height',
            'layerProperties.modelLayer.heading'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[1]);
        Simulate.change(inputNodes[1], { target: { value: 1 } });
    });
    it('should trigger on change with height input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model', center: [0, 0, 0], features: [ { type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } }]
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('features');
                    expect(value[0]).toEqual({ properties: {}, type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 10 ] } });
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
            'layerProperties.modelLayer.height',
            'layerProperties.modelLayer.heading'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[2]);
        Simulate.change(inputNodes[2], { target: { value: 10 } });
    });
    it('should trigger on change with heading input', (done) => {
        act(() => {
            ReactDOM.render(<ModelTransformation layer={{
                type: 'model', center: [0, 0, 0], features: [ {  properties: { heading: 0, pitch: 0, roll: 0, scale: 1 }, type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } }]
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('features');
                    expect(value[0]).toEqual({  properties: { heading: 10, pitch: 0, roll: 0, scale: 1 }, type: 'Feature', geometry: { type: 'Point', coordinates: [ 0, 0, 0 ] } });
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
            'layerProperties.modelLayer.height',
            'layerProperties.modelLayer.heading'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[3]);
        Simulate.change(inputNodes[3], { target: { value: 10 } });
    });
});
