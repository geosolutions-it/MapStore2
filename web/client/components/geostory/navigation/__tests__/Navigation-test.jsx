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
import Navigation from '../Navigation';
import ReactTestUtils from "react-dom/test-utils";
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';


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
    it('Test Navigation setEditing', () => {
        const actions = {
            setEditing: () => {}
        };
        const spySetEditing = expect.spyOn(actions, 'setEditing');
        ReactDOM.render(<Navigation setEditing={actions.setEditing} />, document.getElementById("container"));
        ReactTestUtils.Simulate.click(document.querySelector('.glyphicon-pencil')); // <-- trigger switch edit mode button
        expect(spySetEditing).toHaveBeenCalled();
        expect(spySetEditing.calls[0].arguments[0]).toBe(true);
    });
    it('render sections entries and trigger handlers', () => {
        const actions = {
            scrollTo: () => { }
        };
        const spyScrollTo = expect.spyOn(actions, 'scrollTo');
        ReactDOM.render(<Navigation story={STORY} scrollTo={actions.scrollTo} />, document.getElementById("container"));
        expect(document.querySelectorAll('.btn-tray').length).toBe(2);
        ReactTestUtils.Simulate.click(document.querySelector('.btn-tray')); // <-- trigger
        expect(spyScrollTo).toHaveBeenCalled();
        expect(spyScrollTo.calls[0].arguments[0]).toBe(STORY.sections[0].id);
    });

});
