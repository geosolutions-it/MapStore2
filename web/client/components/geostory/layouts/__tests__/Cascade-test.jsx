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
import STORY from '../../../../test-resources/geostory/sampleStory_1.json';

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
        expect(container.querySelector('.ms-cascade-story')).toBeTruthy();
        expect(container.querySelector('.add-bar')).toBeTruthy(); // present for empty view
    });
    it('Cascade rendering with unknown type', () => {
        ReactDOM.render(<Cascade type="SOME_UNKNOWN_TYPE" />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-cascade-story')).toBeTruthy();
    });
    it('Cascade rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Cascade {...STORY} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-cascade-story');
        expect(el.querySelector('.ms-section-paragraph > .ms-section-contents')).toBeTruthy();
        expect(el.querySelector('.add-bar')).toBeFalsy();
    });
    it('Cascade rendering mode edit', () => {
        ReactDOM.render(<Cascade {...STORY} mode="edit" />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-edit');
        expect(el).toBeTruthy();
    });
    it('should apply layout class name on small devices', () => {
        ReactDOM.render(<div style={{ width: 400 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toBeTruthy();
        expect(mediumGeoStoryLayoutNode).toBeFalsy();
    });
    it('should apply layout class name on medium devices', () => {
        ReactDOM.render(<div style={{ width: 1000 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toBeFalsy();
        expect(mediumGeoStoryLayoutNode).toBeTruthy();
    });
    it('should not apply layout class name on large devices', () => {
        ReactDOM.render(<div style={{ width: 1920 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toBeFalsy();
        expect(mediumGeoStoryLayoutNode).toBeFalsy();
    });
    it('should not apply layout class name with edit mode', () => {
        ReactDOM.render(<div style={{ width: 400 }}><Cascade {...STORY} mode="edit" /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toBeFalsy();
        expect(mediumGeoStoryLayoutNode).toBeFalsy();
    });
});
