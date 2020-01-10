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
            modifiedAt: new Date(),
            createdAt: new Date(),
            metadata: {
                name: "NAME",
                description: "DESCRIPTION"
            }
        };
        ReactDOM.render(<Metadata resource={resource}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('input');
        const labels = container.querySelectorAll('label');
        expect(labels.length).toBe(6);
        expect(el[0].value).toBe("NAME");
        expect(el[1].value).toBe("DESCRIPTION");
    });
    it('Metadata rendering without timestamp', () => {
        const resource = {
            metadata: {
                name: "NAME",
                description: "DESCRIPTION"
            }
        };
        ReactDOM.render(<Metadata resource={resource}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const labels = container.querySelectorAll('label');
        expect(labels.length).toBe(2);
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
    it('Test Metadata nameFieldFilter', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<Metadata onChange={actions.onChange} nameFieldFilter={name => name.replace(/\./g, ',')}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const input = container.querySelector('input');
        input.value = "test.text.stuff";
        ReactTestUtils.Simulate.change(input); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[1]).toBe('test,text,stuff');
    });
    it('Metadata rendering Modified At label when modifiedAt prop is undefined', () => {
        const resource = {
            modifiedAt: undefined,
            createdAt: new Date(),
            metadata: {
                name: "NAME",
                description: "DESCRIPTION"
            }
        };
        ReactDOM.render(<Metadata resource={resource} createdAtFieldText="Created" modifiedAtFieldText="Modified"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const labels = container.querySelectorAll('label');
        expect(labels.length).toBe(6);
        expect(labels[2].innerText).toBe('Created');
        expect(labels[4].innerText).toBe('Modified');
    });
});
