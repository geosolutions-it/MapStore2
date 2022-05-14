/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM from "react-dom";
import InfoCarousel from "../InfoCarousel";
import expect from "expect";

describe('InfoCarousel component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('InfoCarousel rendering with defaults', () => {
        ReactDOM.render(<InfoCarousel/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-carousel-add-info');
        expect(el).toExist();
        expect(el.textContent).toBe('geostory.carouselAddItemInfo');
    });
    it('InfoCarousel rendering with defaults', () => {
        ReactDOM.render(<InfoCarousel/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-carousel-add-info');
        expect(el).toExist();
        expect(el.textContent).toBe('geostory.carouselAddItemInfo');
    });
    it('InfoCarousel rendering of type addMap', () => {
        ReactDOM.render(<InfoCarousel type={'addMap'}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-carousel-map-info');
        expect(el).toExist();
        expect(el.textContent).toBe('geostory.carouselAddMapInfo');
    });
    it('InfoCarousel rendering of type addMarker', () => {
        ReactDOM.render(<InfoCarousel type={'addMarker'}/>, document.getElementById("container"));
        const container = document.getElementById("container");
        const el = container.querySelector('.ms-carousel-marker-info');
        expect(el).toExist();
        expect(el.textContent).toBe('geostory.carouselPlaceMarkerInfo');
    });
});
