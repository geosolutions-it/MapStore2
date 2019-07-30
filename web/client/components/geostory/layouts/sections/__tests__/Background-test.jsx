/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Background from '../Background';

describe('Background component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render and verify the props hight on background container node', () => {
        const VIEW_HEIGHT = 800;
        ReactDOM.render(<Background
            width={1024}
            height={VIEW_HEIGHT}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
    });
});
