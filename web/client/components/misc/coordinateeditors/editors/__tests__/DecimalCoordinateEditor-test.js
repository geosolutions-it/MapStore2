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
const DecimalCoordinateEditor = require('../DecimalCoordinateEditor');

describe('DecimalCoordinateEditor enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('DecimalCoordinateEditor rendering with defaults', () => {
        ReactDOM.render(<DecimalCoordinateEditor />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(1);
    });
    it('DecimalCoordinateEditor rendering from annotation viewer with defaults', () => {
        ReactDOM.render(<DecimalCoordinateEditor canEdit={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(1);
        expect(elements[0].disabled).toBe(false);
    });
    it('Test DecimalCoordinateEditor onKeyDown with keyCode 69 "e" ', () => {
        ReactDOM.render( <DecimalCoordinateEditor value={19} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(1);
        expect(elements[0].value).toBe('19');

        ReactTestUtils.Simulate.keyDown(elements[0], {
            keyCode: 69,
            preventDefault: () => {
                expect(true).toBe(true);
            }
        });
    });
    it('Test DecimalCoordinateEditor onKeyDown with a number ', () => {
        ReactDOM.render( <DecimalCoordinateEditor value={1} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(1);
        expect(elements[0].value).toBe('1');

        ReactTestUtils.Simulate.keyDown(elements[0], {
            keyCode: 19,
            preventDefault: () => {
                // this is expected to not be called
                expect(true).toBe(false);
            }
        });
    });
    it('Test DecimalCoordinateEditor onKeyDown with enter ', () => {
        ReactDOM.render( <DecimalCoordinateEditor value={2} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const elements = container.querySelectorAll('input');
        expect(elements.length).toBe(1);
        expect(elements[0].value).toBe('2');

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
