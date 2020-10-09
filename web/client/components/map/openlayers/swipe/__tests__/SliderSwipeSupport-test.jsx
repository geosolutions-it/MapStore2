/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Map from 'ol/Map';
import View from 'ol/View';

import SliderSwipeSupport from '../SliderSwipeSupport';

describe("SliderSwipeSupport", () => {
    let map;
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div><div id="map"></div>';

        map = new Map({
            view: new View({
                center: [0, 0],
                zoom: 1
            }),
            layers: [],
            target: 'map'
        });
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it("should not render any slider when no layer is selected", () => {
        // No layer prop is passed to XYSwipeSupport
        ReactDOM.render(<SliderSwipeSupport map={map} />, document.getElementById("container"));
        const swiper = document.getElementsByClassName("mapstore-swipe-slider")[0];
        expect(swiper).toNotExist();
    });

    it("should render vertical swiper as default when tool is active", () => {
        ReactDOM.render(<SliderSwipeSupport active map={map} layer="test-layer-id" />, document.getElementById("container"));
        const swiper = document.getElementsByClassName("mapstore-swipe-slider")[0];
        expect(swiper).toExist();
        expect(swiper.style.cursor).toBe("col-resize");

        // Swiper runs from top to bottom
        expect(swiper.style.top).toBe("0px");
        expect(swiper.style.height).toBe("100%");
    });

    it("should render horizontal swiper when type is 'cut-horizontal' when tool is active", () => {
        ReactDOM.render(<SliderSwipeSupport active map={map} type="cut-horizontal" layer="test-layer-id" />, document.getElementById("container"));
        const swiper = document.getElementsByClassName("mapstore-swipe-slider")[0];
        expect(swiper).toExist();
        expect(swiper.style.cursor).toBe("row-resize");

        // Swiper runs from left to right
        expect(swiper.style.left).toBe("0px");
        expect(swiper.style.width).toBe("100%");
    });
});
