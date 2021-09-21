/**
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import CSWFilters from '../CSWFilters';

describe('Test CSWFilters', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('creates the component with defaults', () => {
        ReactDOM.render(<CSWFilters/>, document.getElementById("container"));
        const [catalog] = document.getElementsByClassName("catalog-csw-filters");
        expect(catalog).toBeTruthy();
    });
    it('render component with filter fields', () => {
        const filterProp = {staticFilter: "<h1>test</h1>", dynamicFilter: "<h2>Test</h2>"};
        ReactDOM.render(<CSWFilters filter={filterProp}/>, document.getElementById("container"));
        const [catalog] = document.getElementsByClassName("catalog-csw-filters");
        expect(catalog).toBeTruthy();
        const filters = document.getElementsByClassName('react-codemirror2');
        expect(filters.length).toBe(2);

        const labels = document.getElementsByClassName('control-label');
        expect(labels.length).toBe(2);
        expect(labels[0].textContent).toBe('catalog.filter.static.label');
        expect(labels[1].textContent).toBe('catalog.filter.dynamic.label');

        const codes = document.getElementsByClassName('CodeMirror-line');
        expect(codes.length).toBe(2);
        expect(codes[0].textContent).toBe(filterProp.staticFilter);
        expect(codes[1].textContent).toBe(filterProp.dynamicFilter);

    });
    it('render component with invalid filter', () => {
        const filterProp = {dynamicFilter: '<h1>test</h1><s>'};
        ReactDOM.render(<CSWFilters filter={filterProp}/>, document.getElementById("container"));
        const [catalog] = document.getElementsByClassName("catalog-csw-filters");
        expect(catalog).toBeTruthy();
        const filters = document.getElementsByClassName('react-codemirror2');
        expect(filters.length).toBe(2);
        const error = document.querySelector('.glyphicon-exclamation-mark');
        expect(error).toBeTruthy();
    });
    it('test component onChangeServiceProperty', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<CSWFilters onChangeServiceProperty={action.onChangeServiceProperty} filter={{dynamicFilter: '<h1>test</h1>'}}/>, document.getElementById("container"));
        const [catalog] = document.getElementsByClassName("catalog-csw-filters");
        expect(catalog).toBeTruthy();
        const filters = document.getElementsByClassName('react-codemirror2');
        expect(filters.length).toBe(2);
        expect(spyOn).toNotHaveBeenCalled();
    });
});
