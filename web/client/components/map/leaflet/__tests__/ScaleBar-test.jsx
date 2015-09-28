/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var L = require('leaflet');
var ScaleBar = require('../ScaleBar');
var expect = require('expect');

describe('leaflet ScaleBar component', () => {
    document.body.innerHTML = '<div id="map"></div>';
    let map = L.map('map');

    afterEach((done) => {
        document.body.innerHTML = '<div id="map"></div>';
        map = L.map('map');
        setTimeout(done);
    });

    it('create ScaleBar with defaults', () => {
        const sb = React.render(<ScaleBar map={map}/>, document.body);
        expect(sb).toExist();
        const domMap = map.getContainer();
        const scaleBars = domMap.getElementsByClassName('leaflet-control-scale-line');
        expect(scaleBars.length).toBe(1);
    });
});
