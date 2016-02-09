/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var ReactDOM = require('react-dom');
var GrabMap = require('../GrabMap');

describe("test the OL GrabMap component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<GrabMap />, document.getElementById("container"));
        expect(tb).toExist();
    });
    it('test component snapshot img creation', (done) => {
        let layers = [{type: "wms", url: ["http://demo.geo-solutions.it/geoserver/wms", "http://188.165.246.13/geoserver/wms"], visibility: true, title: "Weather data",
        name: "nurc:Arc_Sample", group: "background", format: "image/png", id: "nurc:Arc_Sample__6"}];
        let map = {projection: "EPSG:900913", units: "m", center: { x: 11.25, y: 43.40, crs: "EPSG:4326"},
                    zoom: 5, maxExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
                    bbox: {bounds: {minx: -18.6328125, miny: 31.728167146023935, maxx: 41.1328125, maxy: 53.199451902831555 },
                     crs: "EPSG:4326", rotation: 0}, size: {height: 673, width: 1360}, mapStateSource: "map"};
        const tb = ReactDOM.render(<GrabMap config={map} layers={layers} snapstate={{error: "Test"}} active={true} onSnapshotReady={() => done()}/>, document.getElementById("container"));
        expect(tb).toExist();
        tb.setProps({active: false});
        tb.setProps({active: true});
    });

});
