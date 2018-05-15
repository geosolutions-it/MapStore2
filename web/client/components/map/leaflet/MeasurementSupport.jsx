const PropTypes = require('prop-types');
const React = require('react');
const assign = require('object-assign');
var L = require('leaflet');
const {slice} = require('lodash');
const {reproject, calculateAzimuth, calculateDistance, transformLineToArcs} = require('../../../utils/CoordinatesUtils');
require('leaflet-draw');

class MeasurementSupport extends React.Component {
    static displayName = 'MeasurementSupport';

    static propTypes = {
        map: PropTypes.object,
        metric: PropTypes.bool,
        feet: PropTypes.bool,
        projection: PropTypes.string,
        measurement: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        messages: PropTypes.object,
        updateOnMouseMove: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        updateOnMouseMove: false,
        metric: true,
        feet: false
    };

    componentWillReceiveProps(newProps) {
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ) {
            this.addDrawInteraction(newProps);
        }
        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
    }

    onDrawStart = () => {
        this.removeArcLayer();
        this.drawing = true;
    };

    onDrawCreated = (evt) => {
        this.drawing = false;
        // let drawn geom stay on the map
        this.props.map.addLayer(evt.layer);
        // preserve the currently created layer to remove it later on
        this.lastLayer = evt.layer;

        let feature = this.lastLayer && this.lastLayer.toGeoJSON() || {};
        if (this.props.measurement.geomType === 'LineString') {
            feature = assign({}, feature, {
                geometry: assign({}, feature.geometry, {
                    coordinates: transformLineToArcs(feature.geometry.coordinates)
                })
            });
        }
        if (this.props.measurement.geomType === 'Point') {
            let pos = this.drawControl._marker.getLatLng();
            let point = {x: pos.lng, y: pos.lat, srs: 'EPSG:4326'};
            let newMeasureState = assign({}, this.props.measurement, {point: point, feature});
            this.props.changeMeasurementState(newMeasureState);
        } else {
            let newMeasureState = assign({}, this.props.measurement, {feature});
            this.props.changeMeasurementState(newMeasureState);
        }
        if (this.props.measurement.lineMeasureEnabled && this.lastLayer) {
            this.addArcsToMap([feature]);
        }
    };

    render() {
        // moved here the translations because when language changes it is forced a render of this component. (see connect of measure plugin)
        var drawingStrings = this.props.messages || (this.context.messages ? this.context.messages.drawLocal : false);
        if (drawingStrings) {
            L.drawLocal = drawingStrings;
        }
        return null;
    }

    /**
     * This method adds arcs converting from a LineString features
     */
    addArcsToMap = (features) => {
        this.removeLastLayer();
        let newFeatures = features.map(f => {
            return assign({}, f, {
                geometry: assign({}, f.geometry, {
                    coordinates: transformLineToArcs(f.geometry.coordinates)
                })
            });
        });
        this.arcLayer = L.geoJson(newFeatures, {
            style: {
                color: '#ffcc33',
                opacity: 1,
                weight: 1,
                fillColor: '#ffffff',
                fillOpacity: 0.2,
                clickable: false
            }
        });
        this.props.map.addLayer(this.arcLayer);
        if (newFeatures && newFeatures.length > 0) {
            this.arcLayer.addData(newFeatures);
        }
    }
    updateMeasurementResults = () => {
        if (!this.drawing || !this.drawControl) {
            return;
        }
        let distance = 0;
        let area = 0;
        let bearing = 0;

        let currentLatLng = this.drawControl._currentLatLng;
        if (this.props.measurement.geomType === 'LineString' && this.drawControl._markers && this.drawControl._markers.length > 1) {
            // calculate length
            const reprojectedCoords = this.drawControl._markers.reduce((p, c) => {
                const {lng, lat} = c.getLatLng();
                return [...p, [lng, lat]];
            }, []);

            distance = calculateDistance(reprojectedCoords, this.props.measurement.lengthFormula);

        } else if (this.props.measurement.geomType === 'Polygon' && this.drawControl._poly) {
            // calculate area
            let latLngs = [...this.drawControl._poly.getLatLngs(), currentLatLng];
            area = L.GeometryUtil.geodesicArea(latLngs);
        } else if (this.props.measurement.geomType === 'Bearing' && this.drawControl._markers && this.drawControl._markers.length > 0) {
            // calculate bearing
            let bearingMarkers = this.drawControl._markers;
            let coords1 = [bearingMarkers[0].getLatLng().lng, bearingMarkers[0].getLatLng().lat];
            let coords2;
            if (bearingMarkers.length === 1) {
                coords2 = [currentLatLng.lng, currentLatLng.lat];
            } else if (bearingMarkers.length === 2) {
                coords2 = [bearingMarkers[1].getLatLng().lng, bearingMarkers[1].getLatLng().lat];
            }
            // in order to align the results between leaflet and openlayers the coords are repojected only for leaflet
            coords1 = reproject(coords1, 'EPSG:4326', this.props.projection);
            coords2 = reproject(coords2, 'EPSG:4326', this.props.projection);
            // calculate the azimuth as base for bearing information
            bearing = calculateAzimuth(coords1, coords2, this.props.projection);
        }
        // let drawn geom stay on the map
        let newMeasureState = assign({}, this.props.measurement,
            {
                point: null, // Point is set in onDraw.created
                len: distance,
                area: area,
                bearing: bearing
            }
        );
        this.props.changeMeasurementState(newMeasureState);
    };

    mapClickHandler = () => {
        if (!this.drawing && this.drawControl !== null) {
            // re-enable draw control, since it is stopped after
            // every finished sketch
            this.props.map.removeLayer(this.lastLayer);
            this.drawControl.enable();
            this.drawing = true;
        } else {
            let bearingMarkers = this.drawControl._markers || [];

            if (this.props.measurement.geomType === 'Bearing' && bearingMarkers.length >= 2) {
                this.drawControl._markers = slice(this.drawControl._markers, 0, 2);
                this.drawControl._poly._latlngs = slice(this.drawControl._poly._latlngs, 0, 2);
                this.drawControl._poly._originalPoints = slice(this.drawControl._poly._originalPoints, 0, 2);
                this.updateMeasurementResults();
                this.drawControl._finishShape();
                this.drawControl.disable();
            } else {
                this.updateMeasurementResults();
            }
        }
    };

    addDrawInteraction = (newProps) => {

        this.removeDrawInteraction();

        this.props.map.on('draw:created', this.onDrawCreated, this);
        this.props.map.on('draw:drawstart', this.onDrawStart, this);
        this.props.map.on('click', this.mapClickHandler, this);
        if (this.props.updateOnMouseMove) {
            this.props.map.on('mousemove', this.updateMeasurementResults, this);
        }

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
                repeatMode: false,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                })
            });
        } else if (newProps.measurement.geomType === 'Polygon') {
            this.drawControl = new L.Draw.Polygon(this.props.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2,
                    fill: 'rgba(255, 255, 255, 0.2)'
                },
                repeatMode: false,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                })
            });
        }

        // start the draw control
        this.drawControl.enable();
    };

    removeDrawInteraction = () => {
        if (this.drawControl !== null && this.drawControl !== undefined) {
            this.drawControl.disable();
            this.drawControl = null;
            this.removeLastLayer();
            this.props.map.off('draw:created', this.onDrawCreated, this);
            this.props.map.off('draw:drawstart', this.onDrawStart, this);
            this.props.map.off('click', this.mapClickHandler, this);
            if (this.props.updateOnMouseMove) {
                this.props.map.off('mousemove', this.updateMeasurementResults, this);
            }
        }
    };
    removeLastLayer = () => {
        if (this.lastLayer) {
            this.props.map.removeLayer(this.lastLayer);
        }
    }
    removeArcLayer = () => {
        if (this.arcLayer) {
            this.props.map.removeLayer(this.arcLayer);
        }
    }
}

module.exports = MeasurementSupport;
