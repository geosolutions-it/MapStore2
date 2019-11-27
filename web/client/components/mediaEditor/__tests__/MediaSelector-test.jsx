/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import expect from 'expect';
import MediaSelector from '../MediaSelector';


describe('MediaSelector component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaSelector rendering with defaults', () => {
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({})}}>
            <MediaSelector />
        </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mediaList')).toExist();
    });
});
