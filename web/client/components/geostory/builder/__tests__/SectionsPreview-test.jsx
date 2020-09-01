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
import HTML5Backend from 'react-dnd-html5-backend';
const dragDropContext = require('react-dnd').DragDropContext;

import SectionsPreview from '../SectionsPreview';
const Comp = dragDropContext(HTML5Backend)(SectionsPreview);
import STORY from '../../../../test-resources/geostory/sampleStory_1.json';

describe('SectionsPreview component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('SectionsPreview rendering with defaults', () => {
        ReactDOM.render(<SectionsPreview/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
    });
    it('SectionsPreview rendering with sections, preview enabled', () => {

        ReactDOM.render(<Provider store={{subscribe: () => {}, getState: () => ({})}}>
            <Comp sections={STORY.sections} isCollapsed />
        </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        expect(el.querySelectorAll('.items-list > div').length).toBe(4); // 4 (sections) + 2 (first inner) + 2 (second inner) + 1 (title inner)
        expect(el.querySelectorAll('.mapstore-side-preview').length).toBe(4);
    });

    it('SectionsPreview rendering with sections, preview disabled', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <Comp sections={STORY.sections} isCollapsed={false}/>
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        expect(el.querySelectorAll('.items-list > div').length).toBe(12); // one for each card in the side grid
        expect(el.querySelectorAll('.mapstore-side-preview').length).toBe(12);
    });
});
