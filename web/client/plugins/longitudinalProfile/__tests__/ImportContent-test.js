/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import expect from 'expect';
import ReactDOM from "react-dom";

import ImportContent from "../ImportContent";

describe('ImportContent', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test render ImportContent component', () => {
        ReactDOM.render(<ImportContent openFileDialog={() => {}}/>, document.getElementById("container"));
        const elements = document.getElementsByClassName('longitudinal-import');
        expect(elements.length).toBe(1);
    });

    it('test render ImportContent component - loading state', () => {
        ReactDOM.render(<ImportContent openFileDialog={() => {}} loading/>, document.getElementById("container"));
        const elements = document.getElementsByClassName('mapstore-medium-size-loader');
        expect(elements.length).toBe(1);
    });

    it('test render ImportContent component - error state', () => {
        ReactDOM.render(<ImportContent openFileDialog={() => {}} error={{message: "Some error"}}/>, document.getElementById("container"));
        const glyphs = document.getElementsByClassName('glyphicon-exclamation-mark');
        const alerts = document.getElementsByClassName('alert-warning');
        expect(glyphs.length).toBe(1);
        expect(alerts.length).toBe(1);
    });

});
