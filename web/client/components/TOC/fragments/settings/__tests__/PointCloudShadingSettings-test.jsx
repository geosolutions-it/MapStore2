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
import PointCloudShadingSettings from '../PointCloudShadingSettings';
import { Simulate, act } from 'react-dom/test-utils';

describe('PointCloudShadingSettings', () => {
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
        ReactDOM.render(<PointCloudShadingSettings />, document.getElementById('container'));
        expect(document.getElementById('container').children.length).toBe(0);
    });
    it('should render point cloud fields', () => {
        ReactDOM.render(<PointCloudShadingSettings layer={{
            type: '3dtiles',
            format: 'pnts'
        }}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.pointCloudShading.attenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLighting'
        ]);
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.pointCloudShading.maximumAttenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius'
        ]);
    });
    it('should trigger on change with attenuation checkbox', (done) => {
        ReactDOM.render(<PointCloudShadingSettings  layer={{
            type: '3dtiles',
            format: 'pnts'
        }}
        onChange={(key, value) => {
            try {
                expect(key).toBe('pointCloudShading');
                expect(value).toEqual({
                    attenuation: true,
                    maximumAttenuation: 4,
                    eyeDomeLighting: true
                });
            } catch (e) {
                done(e);
            }
            done();
        }}
        />, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.pointCloudShading.attenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLighting'
        ]);
        const checkboxInputNodes = document.querySelectorAll('input[type=\'checkbox\']');
        Simulate.change(checkboxInputNodes[0], { target: { checked: true }});
    });
    it('should trigger on change with eyeDomeLighting checkbox', (done) => {
        ReactDOM.render(<PointCloudShadingSettings  layer={{
            type: '3dtiles',
            format: 'pnts',
            pointCloudShading: {
                attenuation: true
            }
        }}
        onChange={(key, value) => {
            try {
                expect(key).toBe('pointCloudShading');
                expect(value).toEqual({
                    attenuation: true,
                    eyeDomeLighting: true
                });
            } catch (e) {
                done(e);
            }
            done();
        }}
        />, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.pointCloudShading.attenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLighting'
        ]);
        const checkboxInputNodes = document.querySelectorAll('input[type=\'checkbox\']');
        Simulate.change(checkboxInputNodes[1], { target: { checked: true }});
    });
    it('should trigger on change with maximumAttenuation input', (done) => {
        act(() => {
            ReactDOM.render(<PointCloudShadingSettings  layer={{
                type: '3dtiles',
                format: 'pnts',
                pointCloudShading: {
                    attenuation: true
                }
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('pointCloudShading');
                    expect(value).toEqual({
                        attenuation: true,
                        maximumAttenuation: 3
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
            'layerProperties.3dTiles.pointCloudShading.maximumAttenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[0]);
        Simulate.change(inputNodes[0], { target: { value: 3 } });
    });
    it('should trigger on change with eyeDomeLightingStrength input', (done) => {
        act(() => {
            ReactDOM.render(<PointCloudShadingSettings  layer={{
                type: '3dtiles',
                format: 'pnts',
                pointCloudShading: {
                    attenuation: true,
                    eyeDomeLighting: true
                }
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('pointCloudShading');
                    expect(value).toEqual({
                        attenuation: true,
                        eyeDomeLighting: true,
                        eyeDomeLightingStrength: 2
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
            'layerProperties.3dTiles.pointCloudShading.maximumAttenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[1]);
        Simulate.change(inputNodes[1], { target: { value: 2 } });
    });
    it('should trigger on change with eyeDomeLightingRadius input', (done) => {
        act(() => {
            ReactDOM.render(<PointCloudShadingSettings  layer={{
                type: '3dtiles',
                format: 'pnts',
                pointCloudShading: {
                    attenuation: true,
                    eyeDomeLighting: true
                }
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('pointCloudShading');
                    expect(value).toEqual({
                        attenuation: true,
                        eyeDomeLighting: true,
                        eyeDomeLightingRadius: 0.5
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
            'layerProperties.3dTiles.pointCloudShading.maximumAttenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[2]);
        Simulate.change(inputNodes[2], { target: { value: 0.5 } });
    });
});
