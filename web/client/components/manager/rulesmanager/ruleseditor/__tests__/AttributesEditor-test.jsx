/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from "react-dom/test-utils";
import AttributesEditor from '../AttributesEditor.jsx';
const constraints = {
    attributes: {
        attribute: {access: "READONLY", name: "cat"}
    }
};
const attributes = [
    {
        "name": "the_geom",
        "type": "gml:Point",
        "localType": "Point"},
    {
        "name": "cat",
        "maxOccurs": 1,
        "type": "xsd:int",
        "localType": "int"}];

describe('Attributes Editor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render nothing if not  active', () => {
        ReactDOM.render(<AttributesEditor/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-rule-editor');
        expect(el).toExist();
        expect(el.style.display).toBe("none");
    });
    it('render attributes', () => {
        ReactDOM.render(<AttributesEditor attributes={attributes} active constraints={constraints} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.row');
        expect(rows).toExist();
        expect(rows.length).toBe(3);
    });
    it('render attributes on setOption', (done) => {
        TestUtils.act(() => {
            ReactDOM.render(<AttributesEditor
                setOption={(value) => {
                    try {
                        expect(value.key).toBe('attributes');
                        expect(value.value).toEqual({"attribute": [{"name": "the_geom", "access": "READONLY"}, {"access": "READONLY", "name": "cat"}]});
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
                attributes={attributes} active
                constraints={constraints}
            />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.row');
        expect(rows).toBeTruthy();
    });
    it('render attributes on change value', (done) => {
        TestUtils.act(() => {
            ReactDOM.render(<AttributesEditor
                setOption={(value) => {
                    try {
                        const isModified = value.value?.attribute?.some(attr => attr.access === 'READWRITE');
                        if (isModified) {
                            expect(value.key).toBe('attributes');
                            expect(value.value).toEqual({"attribute": [{"name": "cat", "access": "READWRITE"}]});
                        }
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
                attributes={attributes} active
                constraints={constraints}
            />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.row');
        expect(rows).toBeTruthy();
        const rule = document.querySelectorAll('.Select-control')[1];
        expect(rule).toBeTruthy();
        TestUtils.Simulate.mouseDown(rule, { button: 0 });
        TestUtils.Simulate.keyDown(rule, { keyCode: 40, key: 'ArrowDown' });
        TestUtils.Simulate.keyDown(rule, { key: 'Enter', keyCode: 13 });
    });
    it('render attributes with highlighted DD', () => {
        ReactDOM.render(<AttributesEditor editedAttributes={["cat"]} attributes={attributes} active constraints={constraints} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const rows = container.querySelectorAll('.row');
        const highlights = container.querySelectorAll('.highlighted-dd');
        expect(rows).toExist();
        expect(highlights).toExist();
        expect(rows.length).toBe(3);
        expect(highlights.length).toBe(1);
    });

});
