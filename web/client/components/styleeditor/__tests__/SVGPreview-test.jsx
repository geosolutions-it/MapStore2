/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const SVGPreview = require('../SVGPreview');

const expect = require('expect');

describe('test SVGPreview module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test SVGPreview creation', () => {
        ReactDOM.render(<SVGPreview />, document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(1);
    });

    it('test SVGPreview point', () => {
        ReactDOM.render(
            <SVGPreview
                type="point"
                paths={[
                    {
                        d: 'M30 160 L100 40',
                        stroke: '#999999'
                    }
                ]}/>
            , document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(2);
        expect(paths[1].getAttribute('d')).toBe('M30 160 L100 40');
        expect(paths[1].getAttribute('stroke')).toBe('#999999');
    });

    it('test SVGPreview linestring', () => {
        ReactDOM.render(
            <SVGPreview
                type="linestring"
                paths={[
                    {
                        stroke: '#999999',
                        strokeWidth: 6
                    },
                    {
                        stroke: '#ffffff',
                        strokeWidth: 2
                    }
                ]}/>
            , document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(3);
        expect(paths[1].getAttribute('d')).toBe('M30 160 L100 40 L170 160');
        expect(paths[1].getAttribute('stroke')).toBe('#999999');
        expect(paths[2].getAttribute('d')).toBe('M30 160 L100 40 L170 160');
        expect(paths[2].getAttribute('stroke')).toBe('#ffffff');
    });

    it('test SVGPreview polygon', () => {
        ReactDOM.render(
            <SVGPreview
                type="polygon"
                paths={[
                    {
                        fill: '#999999'
                    }
                ]}/>
            , document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(2);
        expect(paths[1].getAttribute('d')).toBe('M20 20 L180 20 L180 180 L20 180Z');
        expect(paths[1].getAttribute('fill')).toBe('#999999');
    });

    it('test SVGPreview polygon with pattern', () => {
        ReactDOM.render(
            <SVGPreview
                type="polygon"
                paths={[
                    { fill: "#c1ffb3"},
                    {fill: "url(#tree)"}
                ]}
                patterns={[{
                    id: 'tree', icon: { d: 'M0.1 0.9 L0.5 0.1 L0.9 0.9Z', fill: '#98c390'}
                }]}/>
            , document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(4);

        const patterns = document.querySelectorAll('pattern');
        expect(patterns.length).toBe(1);

        expect(paths[0].getAttribute('d')).toBe('M0.1 0.9 L0.5 0.1 L0.9 0.9Z');
        expect(paths[0].getAttribute('fill')).toBe('#98c390');

        expect(paths[2].getAttribute('d')).toBe('M20 20 L180 20 L180 180 L20 180Z');
        expect(paths[2].getAttribute('fill')).toBe('#c1ffb3');
        expect(paths[3].getAttribute('d')).toBe('M20 20 L180 20 L180 180 L20 180Z');
        expect(paths[3].getAttribute('fill')).toBe('url(#tree)');

    });

    it('test SVGPreview text', () => {
        ReactDOM.render(
            <SVGPreview
                backgroundColor="#333333"
                texts={[
                    {
                        text: 'HELLO',
                        fill: '#f2f2f2',
                        style: {
                            fontSize: 70,
                            fontWeight: 'bold'
                        }
                    }]}/>
            , document.getElementById("container"));
        const paths = document.querySelectorAll('path');
        expect(paths.length).toBe(1);

        expect(paths[0].getAttribute('fill')).toBe('#333333');

        const text = document.querySelectorAll('text');
        expect(text.length).toBe(1);

        expect(text[0].innerHTML).toBe('HELLO');
    });

});
