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
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

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
        // empty view when no session
        expect(el.querySelector('.empty-state-container')).toExist();
    });
    it('Builder rendering with sections', () => {
        ReactDOM.render(<Builder story={STORY} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-builder');
        expect(el).toExist();
        // empty view when no session
        expect(el.querySelector('.empty-state-container')).toNotExist();
        expect(el.querySelector('.mapstore-side-preview')).toExist();
        expect(el.querySelectorAll('.ms-section-preview').length).toBe(2); // 2 sections but preview disabled

    });
    it.only('Builder rendering with sections, preview disabled', () => {
        ReactDOM.render(<Builder story={STORY} cardPreviewEnabled={false}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        // empty view when no session
        expect(el.querySelector('.empty-state-container')).toNotExist();
        expect(el.querySelector('.mapstore-side-preview')).toExist();
        expect(el.querySelectorAll('.ms-section-preview').length).toBe(0); // 2 sections but preview disabled
    });
});
