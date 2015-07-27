/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L = require('leaflet');
var React = require('react');

var Map = React.createClass({	
	propTypes: {
		id: React.PropTypes.string,
		center: React.PropTypes.object,
		zoom: React.PropTypes.number
	},
	getDefaultProps: function() {
    	return {
      		id: 'map'
    	};
  	},
	getInitialState: function() {
		return {
			map: null
		};
	},
	componentDidMount: function() {
		var map = L.map(this.props.id).setView([this.props.center.lat, this.props.center.lng], 
			this.props.zoom);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	    }).addTo(map);
		this.setState({map: map});
	},
	componentWillUnmount: function() {
		this.state.map.remove();
	},
	render: function() {
		return <div id={this.props.id}></div>;
	}
});

module.exports = Map;