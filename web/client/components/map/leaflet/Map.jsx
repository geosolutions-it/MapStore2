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

var LeafletMap = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        center: ConfigUtils.PropTypes.center,
        zoom: React.PropTypes.number.isRequired,
        mapStateSource: ConfigUtils.PropTypes.mapStateSource,
        projection: React.PropTypes.string,
        onMapViewChanges: React.PropTypes.func,
        onClick: React.PropTypes.func,
        mapOptions: React.PropTypes.object,
        mousePointer: React.PropTypes.string,
        onMouseMove: React.PropTypes.func,
        onLayerLoading: React.PropTypes.func,
        onLayerLoad: React.PropTypes.func,
        resize: React.PropTypes.number,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func
    },
    getDefaultProps() {
        return {
          id: 'map',
          onMapViewChanges: () => {},
          onClick: null,
          onMouseMove: () => {},
          mapOptions: {
              zoomAnimation: true,
              attributionControl: true
          },
          projection: "EPSG:3857",
          onLayerLoading: () => {},
          onLayerLoad: () => {},
          resize: 0
        };
    },
    getInitialState() {
        return { };
    },
    componentDidMount() {
        var map = L.map(this.props.id, this.props.mapOptions).setView([this.props.center.y, this.props.center.x],
          this.props.zoom);

        this.map = map;
        this.map.on('moveend', this.updateMapInfoState);
        this.map.on('click', (event) => {
            if (this.props.onClick) {
                this.props.onClick(event.containerPoint);
            }
        });
        this.map.on('dragstart', () => { this.map.off('mousemove', this.mouseMoveEvent); });
        this.map.on('dragend', () => { this.map.on('mousemove', this.mouseMoveEvent); });
        this.map.on('mousemove', this.mouseMoveEvent);

        this.updateMapInfoState();
        this.setMousePointer(this.props.mousePointer);
        // NOTE: this re-call render function after div creation to have the map initialized.
        this.forceUpdate();

        this.map.on('layeradd', (event) => {
            // avoid binding if not possible, e.g. for measurement vector layers
            if (!event.layer.on) {
                return;
            }
            this.props.onLayerLoading(event.layer.layerName);
            event.layer.on('loading', (loadingEvent) => { this.props.onLayerLoading(loadingEvent.target.layerName); });
            event.layer.on('load', (loadEvent) => { this.props.onLayerLoad(loadEvent.target.layerName); });
        });

        this.drawControl = null;
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

        if (this.props.measurement.geomType !== newProps.measurement.geomType &&
                newProps.measurement.geomType !== null) {
            this.addDrawInteraction(newProps);
        }
        if (newProps.measurement.geomType === null) {
            this.removeDrawInteraction();
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
        }, size, this.props.id );
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
    addDrawInteraction: function(newProps) {

        this.removeDrawInteraction();

        if (newProps.measurement.geomType === 'LineString' ||
                newProps.measurement.geomType === 'Bearing') {
            this.drawControl = new L.Draw.Polyline(this.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2
                },
                repeatMode: false
            });
        } else if (newProps.measurement.geomType === 'Polygon') {
            this.drawControl = new L.Draw.Polygon(this.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2,
                    fill: 'rgba(255, 255, 255, 0.2)'
                },
                repeatMode: false
            });
        }
        // start the draw control
        this.drawControl.enable();
        this.drawing = true;

        this.map.on('draw:created', function(evt) {
            this.drawing = false;
            // let drawn geom stay on the map
            this.map.addLayer(evt.layer);
            // preserve the currently created layer to remove it later on
            this.lastLayer = evt.layer;
        }, this);

        this.map.on('draw:drawstart', function() {
            this.drawing = true;
        }, this);

        this.map.on('click', this.mapClickHandler, this);

    },
    removeDrawInteraction: function() {
        if (this.drawControl !== null) {
            this.drawControl.disable();
            this.drawControl = null;
            this.map.removeLayer(this.lastLayer);
            this.map.off('click', this.mapClickHandler, this);
        }
    },
    mapClickHandler: function() {
        var latLngs;
        var area;
        var newMeasureState;
        var bearingMarkers;
        var bearingLatLng1;
        var bearingLatLng2;
        var coords1;
        var coords2;
        var bearing = 0;

        if (!this.drawing && this.drawControl !== null) {
            // re-enable draw control, since it is stopped after
            // every finished sketch
            this.map.removeLayer(this.lastLayer);
            this.drawControl.enable();
            this.drawing = true;

        } else {
            // update measurement results for every new vertex drawn

            // calculate possible length / area
            latLngs = this.drawControl._poly.getLatLngs();
            area = L.GeometryUtil.geodesicArea(latLngs);

            // calculate bearing
            if (this.props.measurement.geomType === 'Bearing') {
                bearingMarkers = this.drawControl._markers;

                if (bearingMarkers.length > 1) {
                    // restrict line drawing to 2 vertices
                    this.drawControl._finishShape();
                    this.drawControl.disable();
                    this.drawing = false;

                    bearingLatLng1 = bearingMarkers[0].getLatLng();
                    bearingLatLng2 = bearingMarkers[1].getLatLng();
                    coords1 = [bearingLatLng1.lng, bearingLatLng1.lat];
                    coords2 = [bearingLatLng2.lng, bearingLatLng2.lat];

                    // calculate the azimuth as base for bearing information
                    bearing = CoordinatesUtils.calculateAzimuth(
                        coords1, coords2, this.props.projection);
                }
            }

            newMeasureState = {
                lineMeasureEnabled: this.props.measurement.lineMeasureEnabled,
                areaMeasureEnabled: this.props.measurement.areaMeasureEnabled,
                bearingMeasureEnabled: this.props.measurement.bearingMeasureEnabled,
                geomType: this.props.measurement.geomType,
                len: this.props.measurement.geomType === 'LineString' ? this.drawControl._measurementRunningTotal : 0,
                area: this.props.measurement.geomType === 'Polygon' ? area : 0,
                bearing: bearing
            };
            this.props.changeMeasurementState(newMeasureState);
        }
    }

});

module.exports = LeafletMap;
