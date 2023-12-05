/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ChartTraceEditSelector from '../ChartTraceEditSelector';

describe('ChartTraceEditSelector', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<ChartTraceEditSelector />, document.getElementById('container'));
        const formGroupNodes = document.querySelectorAll('.form-group');
        expect(formGroupNodes.length).toBe(1);
    });
    it('should charts and traces fields with editing set to true', () => {
        ReactDOM.render(<ChartTraceEditSelector editing/>, document.getElementById('container'));
        const formGroupNodes = document.querySelectorAll('.form-group');
        expect(formGroupNodes.length).toBe(2);
    });
});
