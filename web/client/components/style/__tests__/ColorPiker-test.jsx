
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ColorPicker from '../ColorPicker';
import TestUtils from 'react-dom/test-utils';

describe("Test the ColorPicker style component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        ReactDOM.render(<ColorPicker line/>, document.getElementById("container"));
        const cmp = document.querySelector('.ms-color-picker');
        expect(cmp).toBeTruthy();
    });
    it('should apply disabled class', () => {
        ReactDOM.render(<ColorPicker disabled/>, document.getElementById("container"));
        const cmp = document.querySelector('.ms-color-picker.ms-disabled');
        expect(cmp).toBeTruthy();
    });
    it('should accept string color (hex)', () => {
        ReactDOM.render(<ColorPicker value="#FFFFFF"/>, document.getElementById("container"));
        const swatchNode = document.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        expect(swatchNode.style.color).toBe('rgb(0, 0, 0)');
        expect(swatchNode.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });
    it('should accept string color (rgba)', () => {
        ReactDOM.render(<ColorPicker value="rgba(255, 255, 255, 0.5)"/>, document.getElementById("container"));
        const swatchNode = document.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        expect(swatchNode.style.color).toBe('rgb(0, 0, 0)');
        expect(swatchNode.style.backgroundColor).toBe('rgba(255, 255, 255, 0.5)');
    });
    it('should return color value based on format', (done) => {
        const OLD_COLOR = '0000ff';
        const COLOR = 'ff0000';
        ReactDOM.render(
            <ColorPicker
                value={`#${OLD_COLOR}`}
                format="hex"
                onChangeColor={(newColor) => {
                    expect(newColor).toBe(`#${COLOR}`);
                    done();
                }}
            />, document.getElementById("container"));
        const swatchNode = document.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        TestUtils.Simulate.click(swatchNode);
        const sketchPickerNode = document.querySelector('.sketch-picker');
        expect(sketchPickerNode).toBeTruthy();
        const [sketchPickerHexInputNode] = sketchPickerNode.querySelectorAll('input');
        expect(sketchPickerHexInputNode.value.toLowerCase()).toBe(OLD_COLOR);
        TestUtils.Simulate.change(sketchPickerHexInputNode, { target: { value: COLOR } });
        const coverNode = document.querySelector('.ms-color-picker-cover');
        TestUtils.Simulate.click(coverNode);
    });
    it('should render popover in a different container', () => {
        ReactDOM.render(
            <div>
                <ColorPicker
                    format="hex"
                    containerNode={document.body}
                />
            </div>, document.getElementById("container"));
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        TestUtils.Simulate.click(swatchNode);

        let overlayNode = colorPickerNode.querySelector('.ms-color-picker-overlay');
        expect(overlayNode).toBeFalsy();

        overlayNode = document.querySelector('body > .ms-color-picker-overlay');
        expect(overlayNode).toBeTruthy();
    });
});
