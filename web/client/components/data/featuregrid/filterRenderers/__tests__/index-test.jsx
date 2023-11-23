/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import {getFilterRenderer, registerFilterRenderer, unregisterFilterRenderer} from '../index';

describe('Test for filterRenderer function', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('register and unregister', () => {
        try {
            registerFilterRenderer("test", () => <div id="test-filter-renderer"></div>);
            expect(getFilterRenderer({name: "test"})).toExist();
            unregisterFilterRenderer("test");
            expect(getFilterRenderer({name: "test"})).toNotExist();
        } finally {
            unregisterFilterRenderer("test");
        }
    });
    it('render with defaults', () => {
        let Cmp = getFilterRenderer({type: "unknown"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "string"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "int"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "number"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "time"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "date"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        Cmp = getFilterRenderer({type: "date-time"});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
    });
    it('render with custom', () => {
        try {
            registerFilterRenderer("test", () => <div id="test-filter-renderer"></div>);
            let Cmp = getFilterRenderer({name: "test", type: "string"});
            ReactDOM.render(<Cmp />, document.getElementById("container"));
            expect(document.getElementById("test-filter-renderer")).toExist();
        } finally {
            unregisterFilterRenderer("test");
        }
    });
    it('render filter components for attribute table', () => {
        // default filter
        let Cmp = getFilterRenderer({type: "unknown", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        let operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        let input = document.getElementsByClassName("form-control input-sm")[0];
        expect(operatorDropdownEl).toExist();
        expect(input).toExist();
        // string filter
        Cmp = getFilterRenderer({type: "string", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        input = document.getElementsByClassName("form-control input-sm")[0];
        expect(operatorDropdownEl).toExist();
        expect(input).toExist();
        // number filter
        Cmp = getFilterRenderer({type: "int", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        input = document.getElementsByClassName("form-control input-sm")[0];
        expect(operatorDropdownEl).toExist();
        expect(input).toExist();
        // number filter
        Cmp = getFilterRenderer({type: "number", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        input = document.getElementsByClassName("form-control input-sm")[0];
        expect(operatorDropdownEl).toExist();
        expect(input).toExist();
        // time filter
        Cmp = getFilterRenderer({type: "time", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        expect(operatorDropdownEl).toExist();
        // date filter
        Cmp = getFilterRenderer({type: "date", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        expect(operatorDropdownEl).toExist();
        // date-time filter
        Cmp = getFilterRenderer({type: "date-time", isWithinAttrTbl: true});
        expect(Cmp).toExist();
        ReactDOM.render(<Cmp />, document.getElementById("container"));
        operatorDropdownEl = document.getElementsByClassName('rw-dropdownlist')[0];
        expect(operatorDropdownEl).toExist();
    });
});
