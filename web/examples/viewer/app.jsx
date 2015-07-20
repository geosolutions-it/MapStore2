var React = require('react');
var Map = require('../../components/leaflet/map.jsx');

React.render(<Map center={{lat: 43.9,lng: 10.3}} zoom={11}/>, document.body);