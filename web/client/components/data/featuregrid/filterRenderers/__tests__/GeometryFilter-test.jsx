/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import ReactDOM from 'react-dom';
import GeometryFilter from '../GeometryFilter';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

describe('Test for GeometryFilter component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('GeometryFilter render with defaults', () => {
        ReactDOM.render(<GeometryFilter/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-geometry-filter")[0];
        expect(el).toExist();
    });
    it('GeometryFilter with enabled filter', () => {
        ReactDOM.render(<GeometryFilter filterEnabled/>, document.getElementById("container"));
        const el = document.getElementsByClassName("filter-enabled")[0];
        const glyph = document.getElementsByClassName("glyphicon-map-marker")[0];
        expect(el).toExist();
        expect(glyph).toExist();
    });
    it('GeometryFilter with enabled and applied filter', () => {
        ReactDOM.render(<GeometryFilter filterEnabled value={{}}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("filter-enabled")[0];
        const glyph = document.getElementsByClassName("glyphicon-remove-sign")[0];
        expect(el).toExist();
        expect(glyph).toExist();
    });
    it('GeometryFilter onChange callback with appliedFilter', () => {
        const actions = {
            onChange: () => {}
        };
        const spyOnChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<GeometryFilter filterEnabled value={{}} onChange={actions.onChange}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("featuregrid-geometry-filter")[0];
        expect(el).toExist();

        TestUtils.Simulate.click(el);
        expect(spyOnChange).toHaveBeenCalled();
        expect(spyOnChange).toHaveBeenCalledWith({enabled: false, type: 'geometry', attribute: undefined});
    });
});
