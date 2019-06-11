/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const StyleTemplates = require('../StyleTemplates');
const TestUtils = require('react-dom/test-utils');
const expect = require('expect');

const tempates = [
    {
        types: ['point', 'vector'],
        title: 'Point style',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\mark: symbol(square);\n}",
        preview: '',
        styleId: '001'
    },
    {
        types: ['linestring', 'vector'],
        title: 'LineString style',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #777777;\n}",
        preview: '',
        styleId: '002'
    },
    {
        types: ['polygon', 'vector'],
        title: 'Polygon fill',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tfill: #777777;\n}",
        preview: '',
        styleId: '003'
    },
    {
        types: ['raster'],
        title: 'Raster',
        format: 'css',
        code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #777777;\n}",
        preview: '',
        styleId: '004'
    }
];

describe('test StyleTemplates module component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test StyleTemplates geometryType', () => {

        ReactDOM.render(<StyleTemplates
            templates={tempates}
            geometryType="vector"/>, document.getElementById("container"));
        let cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(3);

        ReactDOM.render(<StyleTemplates
            templates={tempates}
            geometryType="point"/>, document.getElementById("container"));
        cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(1);

        ReactDOM.render(<StyleTemplates
            templates={tempates}
            geometryType="linestring"/>, document.getElementById("container"));
        cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(1);

        ReactDOM.render(<StyleTemplates
            templates={tempates}
            geometryType="polygon"/>, document.getElementById("container"));
        cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(1);

        ReactDOM.render(<StyleTemplates
            templates={tempates}
            geometryType="raster"/>, document.getElementById("container"));
        cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(1);
    });

    it('test StyleTemplates onSelect', done => {
        ReactDOM.render(<StyleTemplates
            templates={tempates}
            onSelect={value => {
                expect(value).toEqual({
                    code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\mark: symbol(square);\n}",
                    templateId: '001',
                    format: 'css'
                });
                done();
            }}
            geometryType="vector"/>, document.getElementById("container"));
        const cards = document.querySelectorAll('.ms-square-card');
        expect(cards.length).toBe(3);
        TestUtils.Simulate.click(cards[0]);
    });

    it('test StyleTemplates modal uses portal', () => {
        ReactDOM.render(<StyleTemplates add />, document.getElementById("container"));
        const modalContainer = document.body.children[1].querySelector('.ms-resizable-modal');
        expect(modalContainer).toExist();
    });
});
