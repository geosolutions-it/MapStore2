/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var MapViewController = require('../MapViewController.jsx');
var expect = require('expect');

describe('MapViewController', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates a MapViewController with the mock configuration', () => {
        var config = {
            zoom: 11,
            latLng: {
                lat: 12,
                lng: 10
            },
            layers: [{
                source: "osm",
                group: "background"
            }],
            sources: {
                osm: {
                    ptype: "gxp_osmsource"
            }}
        };
        // NOTE: the id will be used as the div id by convention
        const map = React.render(<MapViewController id="mymap" config={config}/>, document.body);
        expect(map).toExist();
        expect(React.findDOMNode(map).id).toBe('mymap');
    });
});
