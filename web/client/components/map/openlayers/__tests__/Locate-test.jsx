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

import Locate from '../Locate';

import { Map, View } from 'ol';

describe('Openlayers Locate component', () => {
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

    it('create Locate with defaults', () => {
        const ov = ReactDOM.render(<Locate map={map}/>, document.getElementById("container"));
        expect(ov).toExist();
    });
});
