/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const AttributesEditor = require('../AttributesEditor.jsx');
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

});
