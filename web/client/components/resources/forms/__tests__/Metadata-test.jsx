/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const expect = require('expect');
const Metadata = require('../Metadata');
describe('Metadata component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Metadata rendering with defaults', () => {
        ReactDOM.render(<Metadata />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('input');
        expect(el.length).toBe(2);
    });
    it('Metadata rendering with meta-data', () => {
        const resource = {
            metadata: {
                name: "NAME",
                description: "DESCRIPTION"
            }
        };
        ReactDOM.render(<Metadata resource={resource}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('input');
        expect(el.length).toBe(2);
        expect(el[0].value).toBe("NAME");
        expect(el[1].value).toBe("DESCRIPTION");
    });
    it('Test Metadata onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<Metadata onChange={actions.onChange} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        input.value = "test";
        ReactTestUtils.Simulate.change(input); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
    });
});
