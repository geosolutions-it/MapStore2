/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var Map = require('../map.jsx');
var expect = require('expect');

describe('LeafletMap', function() {

  afterEach(function(done) {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = "";
        setTimeout(done);
  });

  it('creates a div for leaflet map with given id', function() {
    var map = React.render(<Map id="mymap" center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);
    expect(map).toExist();
    expect(React.findDOMNode(map).id).toBe('mymap');
  });

  it('creates a div for leaflet map with default id (map)', function() {
    var map = React.render(<Map center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);
    expect(map).toExist();
    expect(React.findDOMNode(map).id).toBe('map');
  });

  it('creates multiple maps for different containers', function() {
    var container = React.render(
    	(
    		<div>
    			<div id="container1"><Map id="map1" center={{lat: 43.9,lng: 10.3}} zoom={11}/></div>
    			<div id="container2"><Map id="map2" center={{lat: 43.9,lng: 10.3}} zoom={11}/></div>
    		</div>
    	), document.body);
    expect(container).toExist();
    
    expect(document.getElementById('map1')).toExist();
    expect(document.getElementById('map2')).toExist();
  });

  it('populates the container with leaflet objects', function() {
    var map = React.render(<Map center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);
    expect(map).toExist();
    expect(document.getElementsByClassName('leaflet-map-pane').length).toBe(1);
    expect(document.getElementsByClassName('leaflet-tile-pane').length).toBe(1);
    expect(document.getElementsByClassName('leaflet-objects-pane').length).toBe(1);
    expect(document.getElementsByClassName('leaflet-control-container').length).toBe(1);
  });

  it('enables leaflet controls', function() {
    var map = React.render(<Map center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);
    expect(map).toExist();
    expect(document.getElementsByClassName('leaflet-control-zoom-in').length).toBe(1);

    var leafletMap = map.state.map;
    expect(leafletMap).toExist();

    var zoomIn = document.getElementsByClassName('leaflet-control-zoom-in')[0];
	  zoomIn.click();
    expect(leafletMap.getZoom()).toBe(12);

    var zoomOut = document.getElementsByClassName('leaflet-control-zoom-out')[0];
	  zoomOut.click();
    expect(leafletMap.getZoom()).toBe(11);

  });
});