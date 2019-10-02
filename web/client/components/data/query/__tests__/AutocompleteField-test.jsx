/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');

const AutocompleteField = require('../AutocompleteField');

describe('AutocompleteField', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('create a AutocompleteField component without any props', () => {
        const cmp = ReactDOM.render(<AutocompleteField/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create a AutocompleteField with 2 options', () => {
        let conf = {
            filterField:
                        {options: [{
                            value: "val1",
                            label: "val1"
                        }, {
                            value: "val2",
                            label: "val2"
                        }]
                        },
            autocompleteEnabled: true
        };
        const cmp = ReactDOM.render(<AutocompleteField {...conf} />, document.getElementById("container"));
        expect(cmp).toExist();
        let node = ReactDOM.findDOMNode(cmp);
        expect(node).toExist();
        let inputs = node.getElementsByTagName("input");
        expect(inputs).toExist();
        expect(inputs.length).toBe(1);

    });
});
