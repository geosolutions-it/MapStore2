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
import {MapForm} from '../MapForm';

describe('MapForm component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapForm rendering with defaults', () => {
        ReactDOM.render(<MapForm/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mapForm')).toExist();
        expect(container.querySelectorAll('input').length).toBe(3);
        expect(container.querySelector(".dropzone-thumbnail-container")).toExist();
    });
});
