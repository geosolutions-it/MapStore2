/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import NewMapDialog from '../NewMapDialog';

describe('NewMapDialog component', () => {
    let mockAxios;

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('NewMapDialog with defaults', () => {
        mockAxios.onGet(200, {
            results: {
                id: 11,
                name: 'context',
                description: 'context'
            },
            totalCount: 1
        });
        ReactDOM.render(<NewMapDialog show/>, document.getElementById("container"));
        const rootDiv = document.getElementsByClassName('new-map-dialog')[0];
        expect(rootDiv).toExist();
    });
});
