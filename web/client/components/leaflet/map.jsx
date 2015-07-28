/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L = require('leaflet');
var React = require('react');

var LeafletMap = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    center: React.PropTypes.object,
    zoom: React.PropTypes.number
  },
  getDefaultProps() {
      return {
          id: 'map'
      };
    },
  getInitialState() {
    return {
      map: null
    };
  },
  componentDidMount() {
    var map = L.map(this.props.id).setView([this.props.center.lat, this.props.center.lng],
      this.props.zoom);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    this.map = map;
  },
  componentWillUnmount() {
    this.map.remove();
  },
  render() {
    return <div id={this.props.id}></div>;
  }
});

module.exports = LeafletMap;
