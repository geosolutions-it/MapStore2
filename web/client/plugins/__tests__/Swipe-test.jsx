/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import Map from 'ol/Map';
import View from 'ol/View';

import { getPluginForTest } from './pluginsTestUtils';

import SwipePlugin, { Support } from '../Swipe';

describe('SwipePlugin', () => {
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

    it('shows SwipePlugin', () => {
        const { Plugin } = getPluginForTest(SwipePlugin, {});
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.querySelector('.mapstore-swipe-settings')).toExist();
    });

    describe('Support', () => {
        it('should add SliderSwipeSupport as default', () => {
            const props = {
                active: true,
                map,
                layer: "test-layer-id",
                swipeModeSettings: {direction: "cut-vertical"}
            };

            ReactDOM.render(<Support {...props} />, document.getElementById("container"));
            const swiper = document.getElementsByClassName("mapstore-swipe-slider")[0];
            expect(swiper).toExist();
        });
        it('should add SpyGlassSupport', () => {
            const props = {
                mode: "spy",
                active: true,
                map,
                layer: "test-layer-id",
                spyModeSettings: {radius: 80}
            };
            ReactDOM.render(<Support {...props} />, document.getElementById("container"));
            const swiper = document.getElementsByClassName("mapstore-swipe-slider")[0];

            // the slider from SliderSwipe should not be there
            expect(swiper).toNotExist();
        });
    });
});
