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
import MediaEditor from '../MediaEditor';
import {Provider} from 'react-redux';

describe('MediaEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaEditor rendering with defaults', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaEditor />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mediaEditor')).toExist();
    });
});
