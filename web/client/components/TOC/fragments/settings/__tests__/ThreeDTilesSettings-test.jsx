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
import ThreeDTilesSettings from '../ThreeDTilesSettings';
import { Simulate, act } from 'react-dom/test-utils';

describe('ThreeDTilesSettings', () => {
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
        ReactDOM.render(<ThreeDTilesSettings />, document.getElementById('container'));
        expect(document.getElementById('container').children.length).toBe(0);
    });
    it('should render default fields', () => {
        ReactDOM.render(<ThreeDTilesSettings layer={{
            type: '3dtiles'
        }}/>, document.getElementById('container'));
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.format',
            'layerProperties.heightOffset'
        ]);
    });
    it('should render point cloud fields', () => {
        ReactDOM.render(<ThreeDTilesSettings layer={{
            type: '3dtiles',
            format: 'pnts'
        }} onImageryLayersTreeUpdate={() => {}}/>, document.getElementById('container'));
        const checkboxNodes = document.querySelectorAll('.checkbox');
        expect([...checkboxNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.enableImageryOverlay',
            'layerProperties.3dTiles.pointCloudShading.attenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLighting'
        ]);
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.format',
            'layerProperties.heightOffset',
            'layerProperties.3dTiles.pointCloudShading.maximumAttenuation',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingStrength',
            'layerProperties.3dTiles.pointCloudShading.eyeDomeLightingRadius'
        ]);
    });
    it('should trigger on change with format input', (done) => {
        act(() => {
            ReactDOM.render(<ThreeDTilesSettings layer={{
                type: '3dtiles'
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('format');
                    expect(value).toBe('pnts');
                } catch (e) {
                    done(e);
                }
                done();
            }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.format',
            'layerProperties.heightOffset'
        ]);
        const selectFields = document.querySelectorAll('.Select-input > input');
        expect(selectFields.length).toBe(1);
        Simulate.focus(selectFields[0]);
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select first in menu
        Simulate.keyDown(selectFields[0], { key: 'ArrowDown', keyCode: 40 }); // select second in menu
        Simulate.keyDown(selectFields[0], { key: 'Enter', keyCode: 13 });
    });
    it('should trigger on change with heightOffset input', (done) => {
        act(() => {
            ReactDOM.render(<ThreeDTilesSettings layer={{
                type: '3dtiles'
            }}
            onChange={(key, value) => {
                try {
                    expect(key).toBe('heightOffset');
                    expect(value).toBe(10);
                } catch (e) {
                    done(e);
                }
                done();
            }}
            />, document.getElementById('container'));
        });
        const controlLabelsNodes = document.querySelectorAll('.control-label');
        expect([...controlLabelsNodes].map(node => node.innerText)).toEqual([
            'layerProperties.3dTiles.format',
            'layerProperties.heightOffset'
        ]);
        const inputNodes = document.querySelectorAll('input[type=\'number\']');
        Simulate.focus(inputNodes[0]);
        Simulate.change(inputNodes[0], { target: { value: 10 } });
    });
});
