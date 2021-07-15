/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import expect from 'expect';
import {Provider} from "react-redux";
import VectorInfoViewer from "../VectorInfoViewer";
import TEST_STORY from "../../../../../test-resources/geostory/sampleStory_1.json";

describe('VectorInfoViewer component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('VectorInfoViewer rendering with defaults', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, dispatch: () => {}, getState: () => ({})}}>
                <VectorInfoViewer/>
            </Provider>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geostory-carousel-viewer');
        expect(el).toExist();
    });
    it('VectorInfoViewer render card with title', () => {
        const responses = [{queryParams: {}, layerMetadata: {title: 'Geostory'}, response: {features: [{
            contentRefId: "ccol1"
        }]}}];
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, dispatch: () => {}, getState: () => ({geostory: {currentStory: {...TEST_STORY}}})}}>
                <VectorInfoViewer responses={responses} layerInfo={'geostory'}/>
            </Provider>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geostory-carousel-viewer');
        expect(el).toExist();
        expect(el.textContent).toBe('Card one');
    });
    it('VectorInfoViewer render card trigger onClickMarker', () => {
        const responses = [{queryParams: {}, layerMetadata: {title: 'Geostory'}, response: {features: [{
            contentRefId: "ccol1"
        }]}}];
        const store = {subscribe: () => {}, dispatch: () => {}, getState: () => ({geostory: {currentStory: {...TEST_STORY}}})};
        const spyOnClickMarker = expect.spyOn(store, "dispatch");
        ReactDOM.render(
            <Provider store={store}>
                <VectorInfoViewer responses={responses} layerInfo={'geostory'}/>
            </Provider>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-geostory-carousel-viewer');
        expect(el).toExist();
        expect(spyOnClickMarker).toHaveBeenCalled();
        const { path, element, mode } = spyOnClickMarker.calls[0].arguments[0];
        expect(path).toContain('carouselToggle');
        expect(element).toBeTruthy();
        expect(mode).toBe('replace');
    });
});
