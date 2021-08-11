/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM from "react-dom";
import ViewerSlider from "../ViewerSlider";
import expect from "expect";
import TestUtils from 'react-dom/test-utils';

describe('ViewerSlider component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('ViewerSlider rendering with defaults', () => {
        ReactDOM.render(<ViewerSlider/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelectorAll('.ms-carousel-slider');
        expect(el.length).toBe(2);
        expect(el[0].querySelector('.glyphicon-chevron-left')).toBeTruthy();
        expect(el[1].querySelector('.glyphicon-chevron-right')).toBeTruthy();
    });
    it('ViewerSlider rendering with left arrow disabled', () => {
        ReactDOM.render(<ViewerSlider currentIndex={0}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const leftNav = container.querySelector('.ms-carousel-slider.left-arrow');
        expect(leftNav).toBeTruthy();
        expect(leftNav.classList.contains('disabled')).toBeTruthy();
    });
    it('ViewerSlider rendering with right arrow disabled', () => {
        ReactDOM.render(<ViewerSlider currentIndex={1} contents={[1, 2]}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const rightNav = container.querySelector('.ms-carousel-slider.right-arrow');
        expect(rightNav).toBeTruthy();
        expect(rightNav.classList.contains('disabled')).toBeTruthy();
    });
    it('ViewerSlider test onTraverseCard left', () => {
        const action = {onTraverseCard: () => {}};
        const spyOnTraverse = expect.spyOn(action, 'onTraverseCard');
        ReactDOM.render(<ViewerSlider currentIndex={1} contents={[1, 2]} onTraverseCard={action.onTraverseCard}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const leftNav = container.querySelector('.ms-carousel-slider.left-arrow');
        expect(leftNav).toBeTruthy();
        TestUtils.Simulate.click(leftNav);
        expect(spyOnTraverse).toHaveBeenCalled();
    });
    it('ViewerSlider test onTraverseCard right', () => {
        const action = {onTraverseCard: () => {}};
        const spyOnTraverse = expect.spyOn(action, 'onTraverseCard');
        ReactDOM.render(<ViewerSlider currentIndex={0} contents={[1, 2]} onTraverseCard={action.onTraverseCard}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const rightNav = container.querySelector('.ms-carousel-slider.right-arrow');
        expect(rightNav).toBeTruthy();
        TestUtils.Simulate.click(rightNav);
        expect(spyOnTraverse).toHaveBeenCalled();
        expect(spyOnTraverse.calls[0].arguments[0]).toBe('right');
    });
});
