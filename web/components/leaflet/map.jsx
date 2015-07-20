var L = require('leaflet');
var React = require('react');

var Map = React.createClass({
	getInitialState: function() {
		return {
			id : this.props.id || 'map'
		};
	},
	componentDidMount: function() {
		var map = L.map(this.state.id, this.props).setView([this.props.center.lat, this.props.center.lng], 
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
		return <div id={this.state.id}></div>;
	}
});

module.exports = Map;