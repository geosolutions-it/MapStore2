
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
import Popover from '../Popover';
import { Simulate, act } from 'react-dom/test-utils';

describe("Popover style component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div><div id="test-overlay-target" style="transform:translate(0,0);position:fixed;left:0;top:0;width:1920px;height:1080px;"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render popover in a different container', () => {
        ReactDOM.render(
            <div className="test-popover-container">
                <Popover
                    containerNode={document.body}
                    content={<div className="test-content"></div>}
                >
                    <button className="test-button"></button>
                </Popover>
            </div>
            , document.getElementById("container"));
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        Simulate.click(buttonNode);

        const testContainer = document.querySelector('.test-popover-container');

        let overlayNode = testContainer.querySelector('.ms-popover-overlay');
        expect(overlayNode).toBeFalsy();

        overlayNode = document.querySelector('body > .ms-popover-overlay');
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
                        <Popover
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
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
                        <Popover
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
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
                        <Popover
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
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
                        <Popover
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
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
                        <Popover
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.opacity).toBe('0');
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
                        <Popover
                            placement="left"
                            containerNode={document.getElementById("test-overlay-target")}
                            content={<div className="test-content">Content</div>}
                        >
                            <button className="test-button">Button</button>
                        </Popover>
                    </div>
                </div>
                , document.getElementById("container"));
        });
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        act(() => {
            Simulate.click(buttonNode);
        });
        const popoverArrow = document.querySelector('.ms-popover-arrow');
        expect(popoverArrow).toBeTruthy();
        expect(popoverArrow.style.transform).toBe(`translate(-50%, -50%) rotateZ(${ARROW_ROTATION}deg) translateX(50%)`);
    });

    it('should use container node as function', () => {
        ReactDOM.render(
            <div className="test-popover-container">
                <Popover
                    format="hex"
                    containerNode={() => document.getElementById("test-overlay-target")}
                    content={<div className="test-content"></div>}
                >
                    <button className="test-button"></button>
                </Popover>
            </div>
            , document.getElementById("container"));
        const buttonNode = document.querySelector('.test-button');
        expect(buttonNode).toBeTruthy();
        Simulate.click(buttonNode);

        const testContainer = document.querySelector('.test-popover-container');

        let overlayNode = testContainer.querySelector('.ms-popover-overlay');
        expect(overlayNode).toBeFalsy();

        overlayNode = document.querySelector('#test-overlay-target > .ms-popover-overlay');
        expect(overlayNode).toBeTruthy();
    });
});
