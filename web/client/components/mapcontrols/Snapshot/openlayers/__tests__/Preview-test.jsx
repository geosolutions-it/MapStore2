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
var GrabMap = require('../Preview');
var OLMap = require('../../../../map/openlayers/Map.jsx');


require('../../../../../utils/openlayers/Layers');
require('../../../../map/openlayers/plugins/OSMLayer');

describe("test the OL Snapshot Preview component", () => {
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
        const tb = ReactDOM.render(<GrabMap active={false}/>, document.getElementById("container"));
        expect(tb).toExist();
    });
    it('test component snapshot img creation', (done) => {
        document.getElementById("container").innerHTML = '<div id="map"></div><div id="snap"></div>';
        const map = ReactDOM.render(<OLMap center={{y: 43.9, x: 10.3}} zoom={11} />, document.getElementById("map"));
        expect(map).toExist();
        const tb = ReactDOM.render(<GrabMap mapId="container" snapstate={{error: "Test"}} active={false} timeout={0} onSnapshotReady={() => { expect(tb.isTainted(false)); expect(tb.exportImage()).toExist(); done(); }}/>, document.getElementById("container"));
        expect(tb).toExist();
        tb.setProps({active: true});
    });
    it('test component timeout clean do not generate snapshot', () => {
        document.getElementById("container").innerHTML = '<div id="map"></div><div id="snap"></div>';
        const map = ReactDOM.render(<OLMap center={{y: 43.9, x: 10.3}} zoom={11} />, document.getElementById("map"));
        expect(map).toExist();
        const tb = ReactDOM.render(<GrabMap mapId="container" snapstate={{error: "Test"}} active={true} timeout={1000} onSnapshotReady={() => { expect(true).toBe(false); }}/>, document.getElementById("container"));
        expect(tb).toExist();
        tb.setProps({active: false});
    });

});
