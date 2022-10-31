/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Simulate, act } from 'react-dom/test-utils';

import DebouncedFormControl from '../DebouncedFormControl';

describe('DebouncedFormControl component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<DebouncedFormControl/>, document.getElementById('container'));
        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
    });
    it('should return on change after focus', (done) => {
        act(() => {
            ReactDOM.render(
                <DebouncedFormControl
                    value=""
                    onChange={(value) => {
                        expect(value).toBe('new value');
                        done();
                    }}
                />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: 'new value' } });
    });
    it('should restore fallback value on blur if value is empty', (done) => {
        const debounceTime = 10;
        act(() => {
            ReactDOM.render(
                <DebouncedFormControl
                    value={1}
                    type="number"
                    fallbackValue={12}
                    debounceTime={debounceTime}
                    onChange={(value) => {
                        // add a timeout to complete the next render
                        setTimeout(() => {
                            try {
                                expect(value).toBe(undefined);
                                const inputNode = document.querySelector('.form-control');
                                expect(inputNode.value).toBe('12');
                            } catch (e) {
                                done(e);
                            }
                            done();
                        });
                    }}
                />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '' } });
        setTimeout(() => {
            Simulate.blur(inputNode);
        }, debounceTime * 2);
    });
    it('should restore min value on blur if value is less than the min range', (done) => {
        const debounceTime = 10;
        act(() => {
            ReactDOM.render(
                <DebouncedFormControl
                    value={1}
                    type="number"
                    min={0}
                    fallbackValue={1}
                    debounceTime={debounceTime}
                    onChange={(value) => {
                        try {
                            expect(value).toBe(0);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '-1' } });
        setTimeout(() => {
            Simulate.blur(inputNode);
        }, debounceTime * 2);
    });
    it('should restore max value on blur if value is greater than the max range', (done) => {
        const debounceTime = 10;
        act(() => {
            ReactDOM.render(
                <DebouncedFormControl
                    value={1}
                    type="number"
                    max={100}
                    fallbackValue={1}
                    debounceTime={debounceTime}
                    onChange={(value) => {
                        try {
                            expect(value).toBe(100);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '200' } });
        setTimeout(() => {
            Simulate.blur(inputNode);
        }, debounceTime * 2);
    });
    it('should apply the latest value even if the debounce is not completed', (done) => {
        const debounceTime = 1000;
        act(() => {
            ReactDOM.render(
                <DebouncedFormControl
                    value={1}
                    type="number"
                    fallbackValue={1}
                    debounceTime={debounceTime}
                    onChange={(value) => {
                        try {
                            expect(value).toBe(200);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    }}
                />, document.getElementById('container'));
        });

        const inputNode = document.querySelector('.form-control');
        expect(inputNode).toBeTruthy();
        Simulate.focus(inputNode);
        Simulate.change(inputNode, { target: { value: '200' } });
        Simulate.blur(inputNode);
    });
});
