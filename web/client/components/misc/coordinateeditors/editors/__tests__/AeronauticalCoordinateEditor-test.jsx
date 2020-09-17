/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const AeronauticalCoordinateEditor = require('../AeronauticalCoordinateEditor');

describe('AeronauticalCoordinateEditor enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('AeronauticalCoordinateEditor rendering with defaults', () => {
        ReactDOM.render(<AeronauticalCoordinateEditor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
    });
    it('AeronauticalCoordinateEditor rendering from annotation viewer with defaults', () => {
        ReactDOM.render(<AeronauticalCoordinateEditor/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].disabled).toBe(false);
        expect(elements[1].disabled).toBe(false);
        expect(elements[2].disabled).toBe(false);
    });
    it('AeronauticalCoordinateEditor rendering with 13.3333333333', () => {
        ReactDOM.render(<AeronauticalCoordinateEditor value={13.3333333333} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('13');
        expect(elements[1].value).toBe('20');
        expect(elements[2].value).toBe('0');
    });
    it('Test AeronauticalCoordinateEditor onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<AeronauticalCoordinateEditor value={19} onChange={actions.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');

        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('19');
        expect(elements[1].value).toBe('0');
        expect(elements[2].value).toBe('0');
        ReactTestUtils.Simulate.change(elements[0], { target: { value: "20" } });
        expect(spyonChange).toHaveBeenCalled();
        expect(parseFloat(spyonChange.calls[0].arguments[0])).toBe(20);
    });
    it('Test AeronauticalCoordinateEditor onChange not exceed maxDegrees', () => {
        const actions = {
            onChange: () => { }
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<AeronauticalCoordinateEditor
            coordinate="lon"
            value={180}
            onChange={actions.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('180');
        expect(elements[1].value).toBe('0');
        expect(elements[2].value).toBe('0');
        ReactTestUtils.Simulate.change(elements[1], { target: { value: "20" } });
        ReactTestUtils.Simulate.blur(elements[1]);
        expect(spyonChange).toHaveBeenCalled();
        expect(parseFloat(spyonChange.calls[0].arguments[0])).toBe(180);
    });
    it('Test AeronauticalCoordinateEditor onKeyDown with enter ', () => {
        ReactDOM.render( <AeronauticalCoordinateEditor coordinate="lon" value={10} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(3);
        expect(elements[0].value).toBe('10');
        expect(elements[1].value).toBe('0');
        expect(elements[2].value).toBe('0');

        ReactTestUtils.Simulate.keyDown(elements[0], {
            keyCode: 13,
            preventDefault: () => {
                expect(true).toBe(true);
            },
            stopPropagation: () => {
                expect(true).toBe(true);
            }
        });
    });
});
