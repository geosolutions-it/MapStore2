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
import SectionsPreview from '../SectionsPreview';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

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
        ReactDOM.render(<SectionsPreview />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
    });
    it('SectionsPreview rendering with sections', () => {
        ReactDOM.render(<SectionsPreview sections={STORY.sections} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.msSideGrid');
        expect(el).toExist();
        // empty view when no session
        expect(el.querySelectorAll('.items-list > div').length).toBe(5); // 2 + 1 (first inner) + 2 (second inner)
    });
});
