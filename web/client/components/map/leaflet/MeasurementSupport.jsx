/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
var L = require('leaflet');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');

require('leaflet-draw');

const MeasurementSupport = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        metric: React.PropTypes.bool,
        feet: React.PropTypes.bool,
        projection: React.PropTypes.string,
        measurement: React.PropTypes.object,
        changeMeasurementState: React.PropTypes.func,
        messages: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    componentWillReceiveProps(newProps) {
        var drawingStrings = this.props.messages || (this.context.messages) ? this.context.messages.drawLocal : false;
        if (drawingStrings) {
            L.drawLocal = drawingStrings;
        }

        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ) {
            this.addDrawInteraction(newProps);
        }

        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
    },
    onDraw: {
        drawStart() {
            this.drawing = true;
        },
        created(evt) {
            this.drawing = false;
            // let drawn geom stay on the map
            this.props.map.addLayer(evt.layer);
            // preserve the currently created layer to remove it later on
            this.lastLayer = evt.layer;

            if (this.props.measurement.geomType === 'Point') {
                let pos = this.drawControl._marker.getLatLng();
                let point = {x: pos.lng, y: pos.lat, srs: 'EPSG:4326'};
                let newMeasureState = assign({}, this.props.measurement, {point: point});
                this.props.changeMeasurementState(newMeasureState);
            }
        }
    },
    render() {
        return null;
    },
    mapClickHandler: function() {
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
            this.props.map.removeLayer(this.lastLayer);
            this.drawControl.enable();
            this.drawing = true;

        } else {
            // update measurement results for every new vertex drawn

            // calculate  area
            if (this.props.measurement.geomType === 'Polygon') {
                let latLngs = this.drawControl._poly.getLatLngs();
                area = L.GeometryUtil.geodesicArea(latLngs);
            }

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
                pointMeasureEnabled: this.props.measurement.pointMeasureEnabled,
                lineMeasureEnabled: this.props.measurement.lineMeasureEnabled,
                areaMeasureEnabled: this.props.measurement.areaMeasureEnabled,
                bearingMeasureEnabled: this.props.measurement.bearingMeasureEnabled,
                geomType: this.props.measurement.geomType,
                point: null, // handled in onDraw.created
                len: this.props.measurement.geomType === 'LineString' ? this.drawControl._measurementRunningTotal : 0,
                area: this.props.measurement.geomType === 'Polygon' ? area : 0,
                bearing: bearing
            };
            this.props.changeMeasurementState(newMeasureState);
        }
    },
    addDrawInteraction: function(newProps) {

        this.removeDrawInteraction();

        this.props.map.on('draw:created', this.onDraw.created, this);
        this.props.map.on('draw:drawstart', this.onDraw.drawStart, this);
        this.props.map.on('click', this.mapClickHandler, this);

        if (newProps.measurement.geomType === 'Point') {
            this.drawControl = new L.Draw.Marker(this.props.map, {
                repeatMode: false
            });
        } else if (newProps.measurement.geomType === 'LineString' ||
                newProps.measurement.geomType === 'Bearing') {
            this.drawControl = new L.Draw.Polyline(this.props.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2
                },
                metric: this.props.metric,
                feet: this.props.feet,
                repeatMode: false
            });
        } else if (newProps.measurement.geomType === 'Polygon') {
            this.drawControl = new L.Draw.Polygon(this.props.map, {
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
    },
    removeDrawInteraction: function() {
        if (this.drawControl !== null && this.drawControl !== undefined) {
            this.drawControl.disable();
            this.drawControl = null;
            if (this.lastLayer) {
                this.props.map.removeLayer(this.lastLayer);
            }
            this.props.map.off('draw:created', this.onDraw.created, this);
            this.props.map.off('draw:drawstart', this.onDraw.drawStart, this);
            this.props.map.off('click', this.mapClickHandler, this);
        }
    }
});

module.exports = MeasurementSupport;
