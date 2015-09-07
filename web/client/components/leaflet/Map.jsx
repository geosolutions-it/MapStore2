/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L = require('leaflet');
var React = require('react');
var ConfigUtils = require('../../utils/ConfigUtils');

var LeafletMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges() {}
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var map = L.map(this.props.id).setView([this.props.center.y, this.props.center.x],
          this.props.zoom);

        this.map = map;
        this.map.on('moveend', this.updateMapInfoState);
        this.map.on('click', (event) => { this.props.onClick(event.containerPoint); });

        this.updateMapInfoState();
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        const currentCenter = this.map.getCenter();
        const centerIsUpdate = newProps.center.y === currentCenter.lat &&
                               newProps.center.x === currentCenter.lng;

        if (!centerIsUpdate) {
            this.map.setView([newProps.center.y, newProps.center.x]);
        }
        if (newProps.zoom !== this.map.getZoom()) {
            this.map.setZoom(newProps.zoom);
        }
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
    },
    updateMapInfoState() {
        const bbox = this.map.getBounds().toBBoxString().split(',');
        const size = {
            height: this.map.getSize().y,
            width: this.map.getSize().x
        };
        var center = this.map.getCenter();
        this.props.onMapViewChanges({x: center.lng, y: center.lat, crs: "EPSG:4326"}, this.map.getZoom(), {
            bounds: {
                minx: bbox[0],
                miny: bbox[1],
                maxx: bbox[2],
                maxy: bbox[3]
            },
            crs: 'EPSG:4326'
        }, size);
    }
});

module.exports = LeafletMap;
