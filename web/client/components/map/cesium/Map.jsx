/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Cesium = require('../../../libs/cesium');
var React = require('react');
var ConfigUtils = require('../../../utils/ConfigUtils');
var assign = require('object-assign');

let CesiumMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        mapOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          projection: "EPSG:3857",
          mapOptions: {}
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var map = new Cesium.Viewer(this.props.id, assign({
            baseLayerPicker: false,
            animation: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false
        }, this.props.mapOptions));
        map.imageryLayers.removeAll();
        map.camera.moveEnd.addEventListener(this.updateMapInfoState);
        map.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                this.props.center.x,
                this.props.center.y,
                this.getHeightFromZoom(this.props.zoom)
            )
        });

        this.map = map;
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        if (newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }
        return false;
    },
    componentWillUnmount() {
        this.map.destroy();
    },
    getCenter() {
        const center = this.map.camera.positionCartographic;
        return {
            longitude: center.longitude * 180 / Math.PI,
            latitude: center.latitude * 180 / Math.PI,
            height: center.height
        };
    },
    getZoomFromHeight(height) {
        return Math.log2(80000000 / height) + 1;
    },
    getHeightFromZoom(zoom) {
        return 80000000 / (Math.pow(2, zoom - 1));
    },
    render() {
        const map = this.map;
        const mapProj = this.props.projection;
        const children = map ? React.Children.map(this.props.children, child => {
            return child ? React.cloneElement(child, {map: map, projection: mapProj}) : null;
        }) : null;
        return (
            <div id={this.props.id}>
                {children}
            </div>
        );
    },
    _updateMapPositionFromNewProps(newProps) {
        // Do the change at the same time, to avoid glitches
        const currentCenter = this.getCenter();
        const currentZoom = this.getZoomFromHeight(currentCenter.height);
        // current implementation will update the map only if the movement
        // between 12 decimals in the reference system to avoid rounded value
        // changes due to float mathematic operations.
        const isNearlyEqual = function(a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            return ( a.toFixed(12) - (b.toFixed(12))) === 0;
        };
        const centerIsUpdate = isNearlyEqual(newProps.center.x, currentCenter.longitude) &&
                               isNearlyEqual(newProps.center.y, currentCenter.latitude);
        const zoomChanged = newProps.zoom !== currentZoom;

         // Do the change at the same time, to avoid glitches
        if (centerIsUpdate || zoomChanged) {
            this.map.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(
                    newProps.center.x,
                    newProps.center.y,
                    this.getHeightFromZoom(newProps.zoom)
                )
            });
        }
    },


    updateMapInfoState() {
        // const bbox = this.map.getBounds().toBBoxString().split(',');
        const size = {
            height: this.map._lastHeight,
            width: this.map._lastWidth
        };
        const center = this.getCenter();
        const zoom = this.getZoomFromHeight(center.height);
        this.props.onMapViewChanges({
            x: center.longitude,
            y: center.latitude,
            crs: "EPSG:4326"
        }, zoom, {
            /* bounds: {
                minx: bbox[0],
                miny: bbox[1],
                maxx: bbox[2],
                maxy: bbox[3]
            },
            crs: 'EPSG:4326',
            rotation: 0*/
        }, size, this.props.id, this.props.projection );
    }
});

module.exports = CesiumMap;
