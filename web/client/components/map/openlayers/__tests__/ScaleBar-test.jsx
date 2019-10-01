/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ScaleBar from '../ScaleBar';

import { Map, View } from 'ol';

describe('Openlayers ScaleBar component', () => {
    let map;
    beforeEach((done) => {
        document.body.innerHTML = '<div id="map"></div><div id="container"></div>';
        map = new Map({
            layers: [
            ],
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 5
            })
        });
        setTimeout(done);
    });

    afterEach((done) => {
        map.setTarget(null);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('create ScaleBar with defaults', () => {
        const sb = ReactDOM.render(<ScaleBar map={map}/>, document.getElementById("container"));
        expect(sb).toExist();
        const domMap = map.getViewport();
        const scaleBars = domMap.getElementsByClassName('ol-scale-line');
        expect(scaleBars.length).toBe(1);
    });

    it('create ScaleBar with container', () => {
        const sb = ReactDOM.render(<ScaleBar map={map} container="#container"/>, document.getElementById("container"));
        expect(sb).toExist();
        const domMap = map.getViewport();
        let scaleBars = domMap.getElementsByClassName('ol-scale-line');
        expect(scaleBars.length).toBe(0);
        scaleBars = document.body.getElementsByClassName('ol-scale-line');
        expect(scaleBars.length).toBe(1);
    });
});
