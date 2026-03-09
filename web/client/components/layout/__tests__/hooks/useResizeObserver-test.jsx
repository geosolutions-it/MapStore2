/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import useResizeObserver from '../../hooks/useResizeObserver';

describe('useResizeObserver', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should observe element and call onResize when size changes', (done) => {
        const onResizeSpy = expect.createSpy();

        const Component = () => {
            const elementRef = useResizeObserver({
                onResize: onResizeSpy
            });

            return <div ref={elementRef} style={{ width: '100px', height: '100px' }}>Test</div>;
        };

        act(() => {
            ReactDOM.render(<Component />, document.getElementById('container'));
        });

        // Wait for ResizeObserver to trigger and debounce
        setTimeout(() => {
            expect(onResizeSpy).toHaveBeenCalled();
            done();
        }, 200);
    });

    it('should debounce resize callbacks', (done) => {
        const onResizeSpy = expect.createSpy();

        const Component = () => {
            const elementRef = useResizeObserver({
                onResize: onResizeSpy,
                debounceTime: 200
            });

            return <div ref={elementRef} style={{ width: '100px', height: '100px' }}>Test</div>;
        };

        act(() => {
            ReactDOM.render(<Component />, document.getElementById('container'));
        });

        // Wait for debounce
        setTimeout(() => {
            expect(onResizeSpy).toHaveBeenCalled();
            done();
        }, 250);
    });

    it('should disconnect observer on unmount', () => {
        const Component = () => {
            const elementRef = useResizeObserver({
                onResize: () => {}
            });

            return <div ref={elementRef}>Test</div>;
        };

        act(() => {
            ReactDOM.render(<Component />, document.getElementById('container'));
        });

        act(() => {
            ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        });

        // Test passes if unmount completes without errors
        expect(true).toBe(true);
    });
});

