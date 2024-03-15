/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';

import TextOptionsComp from '../TextOptions';

const TextOptions = dragDropContext(testBackend)(TextOptionsComp);
describe('TextOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TextOptions rendering', () => {
        // mock data for Text Editor
        const data = { title: "Test Title", text: "Test Description / Text" };
        ReactDOM.render(<TextOptions data={{ data }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container).toExist();
    });
});
