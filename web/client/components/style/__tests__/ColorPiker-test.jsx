
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
import { Simulate, act } from 'react-dom/test-utils';

describe("Test the ColorPicker style component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div><div id="test-overlay-target" style="transform:translate(0,0);position:fixed;left:0;top:0;width:1920px;height:1080px;"></div>';
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
        Simulate.click(swatchNode);
        const sketchPickerNode = document.querySelector('.sketch-picker');
        expect(sketchPickerNode).toBeTruthy();
        const [sketchPickerHexInputNode] = sketchPickerNode.querySelectorAll('input');
        expect(sketchPickerHexInputNode.value.toLowerCase()).toBe(OLD_COLOR);
        Simulate.change(sketchPickerHexInputNode, { target: { value: COLOR } });
        const coverNode = document.querySelector('.ms-color-picker-cover');
        Simulate.click(coverNode);
    });
    it('should render popover in a different container', () => {
        ReactDOM.render(
            <ColorPicker
                format="hex"
                containerNode={document.body}
            />
            , document.getElementById("container"));
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        Simulate.click(swatchNode);

        let overlayNode = colorPickerNode.querySelector('.ms-color-picker-overlay');
        expect(overlayNode).toBeFalsy();

        overlayNode = document.querySelector('body > .ms-color-picker-overlay');
        expect(overlayNode).toBeTruthy();
    });

    it('should be placed on top', () => {
        const ARROW_ROTATION = 270;
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: 0
                        }}>
                        <ColorPicker
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });
    it('should be placed on right', () => {
        const ARROW_ROTATION = 0;
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0
                        }}>
                        <ColorPicker
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });
    it('should be placed on bottom', () => {
        const ARROW_ROTATION = 90;
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0
                        }}>
                        <ColorPicker
                            format="hex"
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });
    it('should be placed on left', () => {
        const ARROW_ROTATION = 180;
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: 0
                        }}>
                        <ColorPicker
                            format="hex"
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });
    it('should be placed on center (not found available position)', () => {
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}>
                        <ColorPicker
                            format="hex"
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.opacity).toBe('0');
    });

    it('should use declared placement', () => {
        const ARROW_ROTATION = 180;
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%'
                        }}>
                        <ColorPicker
                            placement="left"
                            containerNode={document.getElementById("test-overlay-target")}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const pickerArrow = document.querySelector('.ms-sketch-picker-arrow');
        expect(pickerArrow).toBeTruthy();
        expect(pickerArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });

    it('should use container node as function', () => {
        act(() => {
            ReactDOM.render(
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 1920,
                        height: 1080
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%'
                        }}>
                        <ColorPicker
                            placement="left"
                            containerNode={() => document.querySelector('#test-overlay-target')}
                        />
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const colorPickerNode = document.querySelector('.ms-color-picker');
        expect(colorPickerNode).toBeTruthy();
        const swatchNode = colorPickerNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        act(() => {
            Simulate.click(swatchNode);
        });
        const colorPickerOverlaynode = document.querySelector('.ms-color-picker-overlay');
        expect(colorPickerOverlaynode).toBeTruthy();
        expect(colorPickerOverlaynode.parentNode.getAttribute('id')).toBe('test-overlay-target');
    });
});
