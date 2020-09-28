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
    it('should apply layout class name on small devices', () => {
        ReactDOM.render(<div style={{ width: 400 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toExist();
        expect(mediumGeoStoryLayoutNode).toNotExist();
    });
    it('should apply layout class name on medium devices', () => {
        ReactDOM.render(<div style={{ width: 1000 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toNotExist();
        expect(mediumGeoStoryLayoutNode).toExist();
    });
    it('should not apply layout class name on large devices', () => {
        ReactDOM.render(<div style={{ width: 1920 }}><Cascade {...STORY} /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toNotExist();
        expect(mediumGeoStoryLayoutNode).toNotExist();
    });
    it('should not apply layout class name with edit mode', () => {
        ReactDOM.render(<div style={{ width: 400 }}><Cascade {...STORY} mode="edit" /></div>, document.getElementById("container"));
        const container = document.getElementById('container');
        const smallGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-sm');
        const mediumGeoStoryLayoutNode = container.querySelector('.ms-sections-container.ms-md');
        expect(smallGeoStoryLayoutNode).toNotExist();
        expect(mediumGeoStoryLayoutNode).toNotExist();
    });
    it('should apply custom theme on the story', () => {
        const COLOR = '#ffffff';
        const BACKGROUND_COLOR = '#000000';
        ReactDOM.render(<Cascade {...STORY} theme={{general: { color: COLOR, backgroundColor: BACKGROUND_COLOR }, overlay: {color: COLOR, backgroundColor: BACKGROUND_COLOR}}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const sectionsContainerNode = container.querySelector('.ms-sections-container');
        expect(sectionsContainerNode).toBeTruthy();
        expect(sectionsContainerNode.style.color).toBe('rgb(255, 255, 255)');
        expect(sectionsContainerNode.style.backgroundColor).toBe('rgb(0, 0, 0)');
    });
    it('should apply custom links color on the story', () => {
        const COLOR = '#ffffff';
        const BACKGROUND_COLOR = '#000000';
        ReactDOM.render(<Cascade {...STORY} theme={{link: { color: COLOR }, general: { color: COLOR, backgroundColor: BACKGROUND_COLOR }, overlay: {color: COLOR, backgroundColor: BACKGROUND_COLOR}}}/>, document.getElementById("container"));
        const container = document.getElementById('container');

        // We expect to have a class that we use to add custom color to hyperlinks
        const sectionsContainerNode = container.querySelector('.ms-sections-hyperlinks');
        expect(sectionsContainerNode).toBeTruthy();
        const tag = document.getElementsByTagName('a')[0];
        const tagStyle = window.getComputedStyle(tag);
        expect(tagStyle.getPropertyValue('color')).toBe('rgb(255, 255, 255)');
    });
});
