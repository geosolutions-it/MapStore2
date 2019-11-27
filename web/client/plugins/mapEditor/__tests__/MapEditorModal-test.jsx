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
import MapEditorModal from '../MapEditorModal';
// TODO: it fails on travis and not locally
describe('MapEditorModal component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('MapEditorModal rendering with defaults config', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, dispatch: () => {}, getState: () => ({mapEditor: {open: true}})}}>
                <MapEditorModal open/>
            </Provider>, document.getElementById("container"));
        expect(document.querySelector('.modal-fixed')).toExist();
    });
});
