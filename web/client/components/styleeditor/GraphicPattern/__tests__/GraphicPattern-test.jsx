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
import GraphicPattern from '../GraphicPattern';

describe('GraphicPattern', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<svg id="container"></svg>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should return null when no graphic is provided', () => {
        const container = document.getElementById('container');
        ReactDOM.render(
            <GraphicPattern id="test-pattern" symbolizer={{}} type="polygon" />,
            container
        );
        expect(container.innerHTML).toBe('');
    });

    it('should render pattern with horizontal line mark for polygon graphic-fill', () => {
        const symbolizer = {
            "graphic-fill": {
                size: 10,
                opacity: 0.8,
                rotation: 0,
                graphics: [{
                    mark: "shape://horline",
                    stroke: "#000000",
                    "stroke-width": 2,
                    "stroke-opacity": 1
                }]
            },
            "vendor-options": {
                "graphic-margin": "2 2"
            }
        };

        const container = document.getElementById('container');
        ReactDOM.render(
            <GraphicPattern id="pattern-horline" symbolizer={symbolizer} type="polygon" />,
            container
        );

        const pattern = container.querySelector('pattern#pattern-horline');
        expect(pattern).toExist();
        const line = pattern.querySelector('line');
        expect(line).toExist();
        expect(line.getAttribute('stroke')).toBe('#000000');
        expect(line.getAttribute('stroke-width')).toBe('2');
    });

    it('should render pattern with circle mark for line graphic-stroke', () => {
        const symbolizer = {
            "graphic-stroke": {
                size: 12,
                opacity: 1,
                rotation: 45,
                graphics: [{
                    mark: "circle",
                    fill: "#FF0000",
                    "fill-opacity": 0.5,
                    stroke: "#000000",
                    "stroke-width": 1,
                    "stroke-opacity": 1
                }]
            }
        };

        const container = document.getElementById('container');
        ReactDOM.render(
            <GraphicPattern id="pattern-circle" symbolizer={symbolizer} type="line" />,
            container
        );

        const pattern = container.querySelector('pattern#pattern-circle');
        expect(pattern).toExist();
        const circle = pattern.querySelector('circle');
        expect(circle).toExist();
        expect(circle.getAttribute('fill')).toBe('#FF0000');
        expect(circle.getAttribute('stroke')).toBe('#000000');
    });
});


