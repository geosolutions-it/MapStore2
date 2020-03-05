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
import {Provider} from 'react-redux';
import MediaModal from '../MediaModal';
// TODO: it fails on travis and not locally
describe.skip('MediaModal component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaModal rendering with defaults', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                <MediaModal open/>
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.modal-fixed')).toBeFalsy();
        expect(document.querySelector('.modal-fixed')).toBeTruthy();
    });
});

