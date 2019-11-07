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
const ReactTestUtils = require('react-dom/test-utils');

const AutocompleteFieldHOC = require('../AutocompleteFieldHOC');

describe('AutocompleteFieldHOC', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('create a AutocompleteFieldHOC component without any props', () => {
        const cmp = ReactDOM.render(<AutocompleteFieldHOC/>, document.getElementById("container"));
        expect(cmp).toExist();
    });
    it('create a AutocompleteFieldHOC with 2 options', () => {
        let conf = {
            filterField: {
                attribute: "NAME",
                options: {
                    "NAME": [{
                        value: "val1",
                        label: "val1"
                    }, {
                        value: "val2",
                        label: "val2"
                    }]
                },
                value: "someVAlue",
                fieldOptions: {
                    valuesCount: 2,
                    currentPage: 1
                }
            },
            maxFeaturesWPS: 5
        };
        const cmp = ReactDOM.render(<AutocompleteFieldHOC {...conf} />, document.getElementById("container"));
        expect(cmp).toExist();

    });

    it('create a AutocompleteFieldHOC with pagination fields', () => {
        const props = {
            filterField: {
                attribute: "NAME",
                options: {
                    "NAME": ['val1', 'val2', 'val3', 'val4', 'val5']
                },
                fieldOptions: {
                    currentPage: 1,
                    valuesCount: 5,
                    maxFeaturesWPS: 3
                },
                loading: false
            }
        };

        const component = ReactDOM.render(<AutocompleteFieldHOC {...props} />, document.getElementById('container'));
        const DOM = ReactDOM.findDOMNode(component);
        ReactTestUtils.Simulate.click(DOM.querySelector('button'));
        const pagination = DOM.querySelector('.autocomplete-toolbar');
        expect(component).toExist();
        expect(pagination).toExist();
    });

    it('create a AutocompleteFieldHOC without pagination fields', () => {
        const props = {
            filterField: {
                attribute: "NAME",
                options: {
                    "NAME": ['val1']
                },
                fieldOptions: {},
                loading: false
            }
        };

        const component = ReactDOM.render(<AutocompleteFieldHOC {...props} />, document.getElementById('container'));
        const DOM = ReactDOM.findDOMNode(component);
        ReactTestUtils.Simulate.click(DOM.querySelector('button'));
        const pagination = DOM.querySelector('.autocomplete-toolbar');
        expect(component).toExist();
        expect(pagination).toBe(null);
    });
});
