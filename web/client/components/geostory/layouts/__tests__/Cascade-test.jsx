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
import Cascade from '../Cascade';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('Cascade component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Cascade rendering with defaults', () => {
        ReactDOM.render(<Cascade />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toExist();
        expect(container.querySelector('.add-bar')).toExist(); // present for empty view
    });
    it('Cascade rendering with unknown type', () => {
        ReactDOM.render(<Cascade type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toExist();
    });
    it('Cascade rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Cascade {...STORY} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-cascade-story');
        expect(el.querySelector('.ms-section-paragraph > .ms-section-contents')).toExist();
        expect(el.querySelector('.add-bar')).toNotExist();
    });
    it('Cascade rendering mode edit', () => {
        ReactDOM.render(<Cascade {...STORY} mode="edit" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-edit');
        expect(el).toExist();
    });
});
