/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import BackgroundLayersList from '../BackgroundLayersList';

describe("test the BackgroundLayersList", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test BackgroundLayersList default props', () => {
        ReactDOM.render(<BackgroundLayersList />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('div ._padding-lr-sm');
        expect(el).toExist();
    });
});
