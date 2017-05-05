/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Cesium = require('../../../libs/cesium');
var React = require('react');
var ReactDOM = require('react-dom');
var ConfigUtils = require('../../../utils/ConfigUtils');
var ClickUtils = require('../../../utils/cesium/ClickUtils');
var assign = require('object-assign');
const {throttle} = require('lodash');

let CesiumMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        onMouseMove: React.PropTypes.func,
        mapOptions: React.PropTypes.object,
        standardWidth: React.PropTypes.number,
        standardHeight: React.PropTypes.number,
        mousePointer: React.PropTypes.string,
        zoomToHeight: React.PropTypes.number,
        viewerOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          onClick: () => {},
          projection: "EPSG:3857",
          mapOptions: {},
          standardWidth: 512,
          standardHeight: 512,
          zoomToHeight: 80000000,
          viewerOptions: {
              orientation: {
                  heading: 0,
                  pitch: -1 * Math.PI / 2,
                  roll: 0
              }
          }
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
        }, this.getMapOptions(this.props.mapOptions)));
        map.imageryLayers.removeAll();
        map.camera.moveEnd.addEventListener(this.updateMapInfoState);
        this.hand = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);
        this.hand.setInputAction((movement) => {
            this.onClick(map, movement);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.hand.setInputAction(throttle(this.onMouseMove.bind(this), 500), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        map.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                this.props.center.x,
                this.props.center.y,
                this.getHeightFromZoom(this.props.zoom)
            )
        });

        this.setMousePointer(this.props.mousePointer);

        this.map = map;
        this.forceUpdate();
    },
    componentWillReceiveProps(newProps) {
        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }
        if (newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }
        return false;
    },
    componentWillUnmount() {
        this.hand.destroy();
        this.map.destroy();
    },
    onClick(map, movement) {

        if (this.props.onClick && movement.position !== null) {
            const cartesian = map.camera.pickEllipsoid(movement.position, map.scene.globe.ellipsoid);
            let cartographic = ClickUtils.getMouseXYZ(map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                const latitude = cartographic.latitude * 180.0 / Math.PI;
                const longitude = cartographic.longitude * 180.0 / Math.PI;

                const y = ((90.0 - latitude) / 180.0) * this.props.standardHeight * (this.props.zoom + 1);
                const x = ((180.0 + longitude) / 360.0) * this.props.standardWidth * (this.props.zoom + 1);
                this.props.onClick({
                    pixel: {
                        x: x,
                        y: y
                    },
                    height: this.props.mapOptions && this.props.mapOptions.terrainProvider ? cartographic.height : undefined,
                    cartographic,
                    latlng: {
                        lat: latitude,
                        lng: longitude
                    },
                    crs: "EPSG:4326"
                });
            }
        }
    },
    onMouseMove(movement) {
        if (this.props.onMouseMove && movement.endPosition) {
            const cartesian = this.map.camera.pickEllipsoid(movement.endPosition, this.map.scene.globe.ellipsoid);
            let cartographic = ClickUtils.getMouseXYZ(this.map, movement) || cartesian && Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic) {
                this.props.onMouseMove({
                    y: cartographic.latitude * 180.0 / Math.PI,
                    x: cartographic.longitude * 180.0 / Math.PI,
                    crs: "EPSG:4326"
                });
            }
        }
    },
    getMapOptions(rawOptions) {
        let overrides = {};
        if (rawOptions.terrainProvider) {
            let {type, ...tpOptions} = rawOptions.terrainProvider;
            switch (type) {
                case "cesium": {
                    overrides.terrainProvider = new Cesium.CesiumTerrainProvider(tpOptions);
                    break;
                }
                default:
                    break;
            }
        }
        return assign({}, rawOptions, overrides);
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
        return Math.log2(this.props.zoomToHeight / height) + 1;
    },
    getHeightFromZoom(zoom) {
        return this.props.zoomToHeight / (Math.pow(2, zoom - 1));
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
    setMousePointer(pointer) {
        if (this.map) {
            const mapDiv = ReactDOM.findDOMNode(this).getElementsByClassName("cesium-viewer")[0];
            mapDiv.style.cursor = pointer || 'auto';
        }
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
            // avoid errors like 44.40641479 !== 44.40641478999999
            return ( a.toFixed(12) - (b.toFixed(12))) <= 0.000000000001;
        };
        const centerIsUpdate = !isNearlyEqual(newProps.center.x, currentCenter.longitude) ||
                               !isNearlyEqual(newProps.center.y, currentCenter.latitude);
        const zoomChanged = newProps.zoom !== currentZoom;

         // Do the change at the same time, to avoid glitches
        if (centerIsUpdate || zoomChanged) {
            const position = {
                destination: Cesium.Cartesian3.fromDegrees(
                    newProps.center.x,
                    newProps.center.y,
                    this.getHeightFromZoom(newProps.zoom)
                ),
                orientation: newProps.viewerOptions.orientation
            };
            this.setView(position);
        }
    },
    setView(position) {
        if (this.props.mapOptions && this.props.mapOptions.flyTo) {
            this.map.camera.flyTo(position, this.props.mapOptions.defaultFlightOptions);
        } else {
            this.map.camera.setView(position);
        }
    },
    updateMapInfoState() {
        const center = this.getCenter();
        const zoom = this.getZoomFromHeight(center.height);
        const size = {
            height: Math.round(this.props.standardWidth * (zoom + 1)),
            width: Math.round(this.props.standardHeight * (zoom + 1))
        };
        this.props.onMapViewChanges({
            x: center.longitude,
            y: center.latitude,
            crs: "EPSG:4326"
        }, zoom, {
            bounds: {
                minx: -180.0,
                miny: -90.0,
                maxx: 180.0,
                maxy: 90.0
            },
            crs: 'EPSG:4326',
            rotation: 0
        }, size, this.props.id, this.props.projection, {
            orientation: {
                heading: this.map.camera.heading,
                pitch: this.map.camera.pitch,
                roll: this.map.camera.roll
            }
        });
    }
});

module.exports = CesiumMap;
