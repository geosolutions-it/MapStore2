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
import Builder from '../Builder';
import STORY from '../../../../test-resources/geostory/sampleStory_1.json';

import {Provider} from 'react-redux';
import HTML5Backend from 'react-dnd-html5-backend';
const dragDropContext = require('react-dnd').DragDropContext;

const Comp = dragDropContext(HTML5Backend)(Builder);

describe('Builder component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Builder rendering with defaults', () => {
        ReactDOM.render(<Builder />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-builder');
        expect(el).toExist();
        expect(el.querySelectorAll('button').length).toBe(4);
    });
    it('Builder rendering with sections', () => {
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({})}}>
            <Comp story={STORY} />
        </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-builder');
        expect(el).toExist();
        expect(el.querySelector('.mapstore-side-preview')).toExist();
        expect(el.querySelectorAll('.mapstore-side-preview').length).toBe(4); // 4 sections

    });
    it('Builder rendering with sections, preview disabled', () => {
        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({})}}>
            <Comp story={STORY} isCollapsed={false}/>
        </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        expect(el.querySelector('.mapstore-side-preview')).toExist();
        expect(el.querySelectorAll('.ms-section-preview-icon').length).toBe(0); // 3 sections + 2 columns with preview disabled
    });
});
