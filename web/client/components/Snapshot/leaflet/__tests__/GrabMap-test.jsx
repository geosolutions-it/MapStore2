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
var LeafletMap = require('../../../map/leaflet/Map.jsx');
var LeafLetLayer = require('../../../map/leaflet/Layer.jsx');


require('../../../../utils/leaflet/Layers');
require('../../../map/leaflet/plugins/OSMLayer');

describe("test the Leaflet GrabMap component", () => {
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
        let status;
        const onStatusChange = (val) => {status = val; };
        const tb = ReactDOM.render(<GrabMap active={true} onStatusChange={onStatusChange}/>, document.getElementById("container"));
        expect(tb).toExist();
        tb.setProps({active: false, snapstate: {error: "Test"}});
        expect(status).toEqual("DISABLED");
    });

    it('test snapshot creation', (done) => {
        document.getElementById("container").innerHTML = '<div id="map"></div><div id="snap"></div>';
        let options = {
            "visibility": true
        };
        const map = ReactDOM.render(<LeafletMap center={{y: 43.9, x: 10.3}} zoom={11}>
            <LeafLetLayer type="osm" options={options} />
            <LeafLetLayer type="osm" options={options} />
        </LeafletMap>, document.getElementById("map"));
        expect(map).toExist();
        expect(document.getElementsByClassName('leaflet-map-pane').length).toBe(1);
        expect(document.getElementsByClassName('leaflet-layer').length).toBe(2);
        const tb = ReactDOM.render(<GrabMap active={false} onSnapshotReady={() => done()} layers={[{loading: false}, {loading: false}]}/>, document.getElementById("snap"));
        expect(tb).toExist();
        tb.setProps({active: true});
    });
});
