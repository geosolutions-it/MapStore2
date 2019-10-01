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

import Overview from '../Overview';

import { Map, View } from 'ol';

describe('Openlayers Overview component', () => {
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

    it('create Overview with defaults', () => {
        const ov = ReactDOM.render(<Overview map={map}/>, document.getElementById("container"));
        expect(ov).toExist();
        const domMap = map.getViewport();
        const overview = domMap.getElementsByClassName('ol-overviewmap');
        expect(overview.length).toBe(1);
    });

    it('testing mouse events', () => {
        const ov = ReactDOM.render(<Overview map={map}/>, document.getElementById("container"));
        expect(ov).toExist();
        const domMap = map.getViewport();
        const overview = domMap.getElementsByClassName('ol-overviewmap');
        expect(overview.length).toBe(1);
        ov.box.onmousedown({
            pageX: 1,
            pageY: 1
        });
        ov.box.onmousemove({
            pageX: 3,
            pageY: 3,
            stopPropagation: () => {},
            preventDefault: () => {}
        });
        ov.box.onmouseup({
            pageX: 3,
            pageY: 3
        });
        expect(ov.box.onmouseup).toBe(null);
        expect(ov.box.onmousemove).toBe(null);
    });
});
