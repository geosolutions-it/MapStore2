/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ol = require('openlayers');
var React = require('react');
var CoordinatesUtils = require('../../utils/CoordinatesUtils');

var OpenlayersMap = React.createClass({
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
        return { };
    },
    componentDidMount() {
        var center = CoordinatesUtils.reproject([this.props.center.lng, this.props.center.lat], 'EPSG:4326', 'EPSG:900913');
        var map = new ol.Map({
          layers: [
          ],
          controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
          }),
          target: this.props.id,
          view: new ol.View({
            center: [center.x, center.y],
            zoom: this.props.zoom
          })
        });

        this.map = map;
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
    },
    componentWillUnmount() {
        this.map.remove();
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map}) : null;
        }) : null;
        return (
            <div id={this.props.id}>
                {children}
            </div>
        );
    }
});

module.exports = OpenlayersMap;
