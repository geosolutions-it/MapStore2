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
import Column from '../Column';
import { ContentTypes, Modes } from '../../../../utils/GeoStoryUtils';

describe('Column component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Column rendering with defaults', () => {
        ReactDOM.render(<Column />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-column');
        expect(el).toExist();
    });
    it('Column rendering contents', () => {
        ReactDOM.render(<Column contents={[{ type: ContentTypes.TEXT, html: '<p id="TEST_HTML">something</p>' }]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#TEST_HTML');
        expect(el).toExist();
    });
    it('Column edit mode has add button', () => {
        ReactDOM.render(<Column mode={Modes.EDIT} contents={[{ type: ContentTypes.TEXT, html: '<p id="TEST_HTML">something</p>' }]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.add-bar');
        expect(el).toExist();
    });
});
