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
        zoom: React.PropTypes.number,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          projection: 'EPSG:3857'
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var center = CoordinatesUtils.reproject([this.props.center.lng, this.props.center.lat], 'EPSG:4326', this.props.projection);
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
        map.on('moveend', () => {
            let view = map.getView();
            let c = this.normalizeCenter(view.getCenter());
            this.props.onMapViewChanges({lng: c[0], lat: c[1]}, view.getZoom());
        });

        this.map = map;
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        var view = this.map.getView();
        const currentCenter = this.normalizeCenter(view.getCenter());
        const centerIsUpdated = newProps.center.lat === currentCenter[1] &&
                               newProps.center.lng === currentCenter[0];

        if (!centerIsUpdated) {
            view.setCenter([newProps.center.lng, newProps.center.lat]);
        }
        if (newProps.zoom !== view.getZoom()) {
            view.setZoom(newProps.zoom);
        }
    },
    componentWillUnmount() {
        this.map.setTarget(null);
    },
    render() {
        const map = this.map;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map, mapId: this.props.id}) : null;
        }) : null;

        return (
            <div id={this.props.id}>
                {children}
            </div>
        );
    },
    normalizeCenter: function(center) {
        return ol.proj.transform(center, this.props.projection, 'EPSG:4326');
    }
});

module.exports = OpenlayersMap;
