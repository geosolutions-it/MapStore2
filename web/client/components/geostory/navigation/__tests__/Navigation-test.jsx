/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from "react-dom/test-utils";

import STORY from '../../../../test-resources/geostory/sampleStory_1.json';
import expect from 'expect';
import Navigation from '../Navigation';
const SELECTED_ID = STORY.sections[0].id;

describe('GeoStory Navigation component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Rendering with defaults', () => {
        ReactDOM.render(<Navigation />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-navigation-bar');
        expect(el).toExist();
    });
    it('Test Navigation custom buttons (setEditing)', () => {
        const actions = {
            setEditing: () => {}
        };
        const buttons = [{
            Element: () => <button className="test-button" onClick={() => actions.setEditing(true)}></button>
        }];
        const spySetEditing = expect.spyOn(actions, 'setEditing');
        ReactDOM.render(<Navigation buttons={buttons} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.test-button')); // <-- trigger switch edit mode button
        expect(spySetEditing).toHaveBeenCalled();
        expect(spySetEditing.calls[0].arguments[0]).toBe(true);
    });
    it('render sections entries and trigger handlers', () => {
        const actions = {
            scrollTo: () => { }
        };
        const spyScrollTo = expect.spyOn(actions, 'scrollTo');
        ReactDOM.render(<Navigation settings={{isNavbarEnabled: true}} currentPage={{ sectionId: SELECTED_ID}}  navigableItems={STORY.sections} scrollTo={actions.scrollTo} />, document.getElementById("container"));
        expect(document.querySelectorAll('.btn-tray').length).toBe(3);
        ReactTestUtils.Simulate.click(document.querySelector('.btn-tray')); // <-- trigger
        expect(spyScrollTo).toHaveBeenCalled();
        expect(spyScrollTo.calls[0].arguments[0]).toBe(STORY.sections[1].id);
    });
    it('current section page is highlighted', () => {
        ReactDOM.render(<Navigation settings={{isNavbarEnabled: true}} currentPage={{ sectionId: SELECTED_ID}} navigableItems={STORY.sections} />, document.getElementById("container"));
        const selectedElement = document.querySelector("button.active");
        expect(selectedElement).toExist();
        expect(selectedElement.innerText).toBe("Abstract");
    });
    it('should render home icon', () => {
        ReactDOM.render(<Navigation router={{ pathname: '/geostory/shared/1', search: '?showHome=true' }} />, document.getElementById('container'));
        expect(document.querySelector('#home-button')).toBeTruthy();
    });
    it('should hide home icon when showHome is false', () => {
        ReactDOM.render(<Navigation router={{ pathname: '/geostory/shared/1', search: '?showHome=false' }} />, document.getElementById('container'));
        expect(document.querySelector('#home-button')).toBeFalsy();
    });
    it('should hide home icon without search query', () => {
        ReactDOM.render(<Navigation router={{ pathname: '/geostory/shared/1' }} />, document.getElementById('container'));
        expect(document.querySelector('#home-button')).toBeFalsy();
    });

    it('should hide all navigation tools', () => {
        ReactDOM.render(<Navigation
            router={{ pathname: '/geostory/shared/1' }}
            settings={{
                isTitleEnabled: false,
                isLogoEnabled: false,
                isNavbarEnabled: false
            }}
            buttons={[]}
            navigableItems={[]}
        />, document.getElementById('container'));
        expect(document.querySelector('.ms-geostory-navigation-tools')).toBeFalsy();
    });
});
