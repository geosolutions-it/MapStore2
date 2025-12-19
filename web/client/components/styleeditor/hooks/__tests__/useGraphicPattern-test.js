/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import useGraphicPattern from '../useGraphicPattern';

describe('useGraphicPattern', () => {
    let hookResult;

    const TestComponent = ({ symbolizer, type }) => {
        hookResult = useGraphicPattern(symbolizer, type);
        return <svg id="result" />;
    };

    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        hookResult = null;
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        hookResult = null;
        setTimeout(done);
    });

    it('should return plain stroke and no defs for line without graphic-stroke', () => {
        const symbolizer = {
            stroke: '#AA3333',
            'stroke-width': 2
        };

        act(() => {
            ReactDOM.render(
                <TestComponent symbolizer={symbolizer} type="line" />,
                document.getElementById('container')
            );
        });

        expect(hookResult).toBeTruthy();
        expect(hookResult.defs).toBe(null);
        expect(hookResult.stroke).toBe('#AA3333');
    });

    it('should return defs and pattern url stroke for line with graphic-stroke', () => {
        const symbolizer = {
            stroke: '#AA3333',
            'stroke-width': 2,
            'graphic-stroke': {
                size: 8,
                opacity: 1,
                graphics: [{
                    mark: 'shape://vertline',
                    stroke: '#AA3333',
                    'stroke-width': 2,
                    'stroke-opacity': 1
                }]
            },
            'vendor-options': {
                'graphic-margin': '1 1'
            }
        };

        act(() => {
            ReactDOM.render(
                <TestComponent symbolizer={symbolizer} type="line" />,
                document.getElementById('container')
            );
        });

        expect(hookResult).toBeTruthy();
        expect(hookResult.defs).toExist();
        expect(hookResult.stroke).toMatch(/^url\(#pattern-/);
    });

    it('should return plain fill and no defs for polygon without graphic-fill', () => {
        const symbolizer = {
            fill: '#AA3333',
            'fill-width': 2
        };

        act(() => {
            ReactDOM.render(
                <TestComponent symbolizer={symbolizer} type="polygon" />,
                document.getElementById('container')
            );
        });

        expect(hookResult).toBeTruthy();
        expect(hookResult.defs).toBe(null);
        expect(hookResult.fill).toBe('#AA3333');
    });

    it('should return defs and pattern url fill for polygon with graphic-fill', () => {
        const symbolizer = {
            fill: '#AA3333',
            'fill-width': 2,
            'graphic-fill': {
                size: 8,
                opacity: 1,
                graphics: [{
                    mark: 'shape://vertline',
                    fill: '#AA3333',
                    'fill-width': 2,
                    'fill-opacity': 1
                }]
            },
            'vendor-options': {
                'graphic-margin': '1 1'
            }
        };

        act(() => {
            ReactDOM.render(
                <TestComponent symbolizer={symbolizer} type="polygon" />,
                document.getElementById('container')
            );
        });

        expect(hookResult).toBeTruthy();
        expect(hookResult.defs).toExist();
        expect(hookResult.fill).toMatch(/^url\(#pattern-/);
    });
});


