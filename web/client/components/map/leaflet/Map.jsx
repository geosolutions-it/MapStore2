/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L = require('leaflet');
var React = require('react');
var ConfigUtils = require('../../../utils/ConfigUtils');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var assign = require('object-assign');
var mapUtils = require('../../../utils/MapUtils');

require('./SingleClick');
let LeafletMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        onRightClick: React.PropTypes.func,
        mapOptions: React.PropTypes.object,
        zoomControl: React.PropTypes.bool,
        mousePointer: React.PropTypes.string,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        resize: React.PropTypes.number,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func,
        registerHooks: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          onClick: null,
          onMouseMove: () => {},
          zoomControl: true,
          mapOptions: {
              zoomAnimation: true,
              attributionControl: true
          },
          projection: "EPSG:3857",
          onLayerLoading: () => {},
          onLayerLoad: () => {},
          resize: 0,
          registerHooks: true
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var map = L.map(this.props.id, assign({zoomControl: this.props.zoomControl}, this.props.mapOptions) ).setView([this.props.center.y, this.props.center.x],
          this.props.zoom);

        this.map = map;
        this.map.on('moveend', this.updateMapInfoState);
        // this uses the hook defined in ./SingleClick.js for leaflet 0.7.*
        this.map.on('singleclick', (event) => {
            if (this.props.onClick) {
                this.props.onClick({
                    pixel: event.containerPoint,
                    latlng: event.latlng
                });
            }
        });
        this.map.on('dragstart', () => { this.map.off('mousemove', this.mouseMoveEvent); });
        this.map.on('dragend', () => { this.map.on('mousemove', this.mouseMoveEvent); });
        this.map.on('mousemove', this.mouseMoveEvent);
        this.map.on('contextmenu', () => {
            if (this.props.onRightClick) {
                this.props.onRightClick(event.containerPoint);
            }
        });

        this.updateMapInfoState();
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        this.map.on('layeradd', (event) => {
            // avoid binding if not possible, e.g. for measurement vector layers
            if (!event.layer.layerName) {
                return;
            }
            if (event && event.layer && event.layer.on) {
                // TODO check event.layer.on is a function
                this.props.onLayerLoading(event.layer.layerName);
                event.layer.on('loading', (loadingEvent) => { this.props.onLayerLoading(loadingEvent.target.layerName); });
                event.layer.on('load', (loadEvent) => { this.props.onLayerLoad(loadEvent.target.layerName); });
            }
        });

        this.drawControl = null;

        if (this.props.registerHooks) {
            this.registerHooks();
        }
    },
    componentWillReceiveProps(newProps) {

        if (newProps.mousePointer !== this.props.mousePointer) {
            this.setMousePointer(newProps.mousePointer);
        }
        // update the position if the map is not the source of the state change
        if (newProps.mapStateSource !== this.props.id) {
            this._updateMapPositionFromNewProps(newProps);
        }

        if (this.map && newProps.resize > this.props.resize) {
            setTimeout(() => {
                this.map.invalidateSize(false);
            }, 0);
        }
        return false;
    },
    componentWillUnmount() {
        this.map.remove();
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
        const currentCenter = this.map.getCenter();
        // current implementation will update the map only if the movement
        // between 12 decimals in the reference system to avoid rounded value
        // changes due to float mathematic operations.
        const isNearlyEqual = function(a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            return ( a.toFixed(12) - (b.toFixed(12))) === 0;
        };
        const centerIsUpdate = isNearlyEqual(newProps.center.x, currentCenter.lng) &&
                               isNearlyEqual(newProps.center.y, currentCenter.lat);
        const zoomChanged = newProps.zoom !== this.map.getZoom();

         // Do the change at the same time, to avoid glitches
        if (!centerIsUpdate && zoomChanged) {
            this.map.setView([newProps.center.y, newProps.center.x], newProps.zoom);
        } else if (zoomChanged) {
            this.map.setZoom(newProps.zoom);
        } else if (!centerIsUpdate) {
            this.map.setView([newProps.center.y, newProps.center.x]);
        }
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
            crs: 'EPSG:4326',
            rotation: 0
        }, size, this.props.id, this.props.projection );
    },
    setMousePointer(pointer) {
        if (this.map) {
            const mapDiv = this.map.getContainer();
            mapDiv.style.cursor = pointer || 'auto';
        }
    },
    mouseMoveEvent(event) {
        let pos = event.latlng.wrap();
        this.props.onMouseMove({
            x: pos.lng,
            y: pos.lat,
            crs: "EPSG:4326"
        });
    },
    registerHooks() {
        // mapUtils.registerHook(mapUtils.ZOOM_TO_EXTEND_HOOK, () => {});
        mapUtils.registerHook(mapUtils.EXTENT_TO_ZOOM_HOOK, (extent) => {
            var repojectedPointA = CoordinatesUtils.reproject([extent[0], extent[1]], this.props.projection, 'EPSG:4326');
            var repojectedPointB = CoordinatesUtils.reproject([extent[2], extent[3]], this.props.projection, 'EPSG:4326');
            return this.map.getBoundsZoom([[repojectedPointA.x, repojectedPointA.y], [repojectedPointB.x, repojectedPointB.y]]);
        });
    }
});

module.exports = LeafletMap;
