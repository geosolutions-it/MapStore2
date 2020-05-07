const PropTypes = require('prop-types');
const React = require('react');
const assign = require('object-assign');
var L = require('leaflet');
const {
    slice
} = require('lodash');
const {
    reproject,
    calculateAzimuth,
    calculateDistance,
    transformLineToArcs
} = require('../../../utils/CoordinatesUtils');
const {
    convertUom,
    getFormattedBearingValue
} = require('../../../utils/MeasureUtils');
require('leaflet-draw');

let defaultPrecision = {
    km: 2,
    ha: 2,
    m: 2,
    mi: 2,
    ac: 2,
    yd: 0,
    ft: 0,
    nm: 2,
    sqkm: 2,
    sqha: 2,
    sqm: 2,
    sqmi: 2,
    sqac: 2,
    sqyd: 2,
    sqft: 2,
    sqnm: 2
};


L.getMeasureWithTreshold = (value, threshold, source, dest, precision, sourceLabel, destLabel) => {
    if (value > threshold) {
        return L.GeometryUtil.formattedNumber(convertUom(value, source, dest), precision[dest]) + ' ' + destLabel;
    }
    return L.GeometryUtil.formattedNumber(value, precision[source]) + ' ' + sourceLabel;
};

/** @method readableDistance(distance, units): string
 * Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string
 *
 * @alternative
 * @method readableDistance(distance, isMetric, useFeet, isNauticalMile, precision, options): string
 * Converts metric distance to distance string.
 * The value will be rounded as defined by the precision option object.
 * this override is necesary due to the customization on how the measure label is presented and for adding bearing support
*/
const originalReadableDistance = L.GeometryUtil.readableDistance;


function readableDistance(distance, isMetric, isFeet, isNauticalMile, precision, options) {
    if (!options) {
        return originalReadableDistance.apply(null, arguments);
    }
    if (options.geomType === 'Bearing') {
        return options.bearing;
    }
    const p = L.Util.extend({}, defaultPrecision, precision);
    const {unit, label} = options.uom.length;

    let distanceStr = L.GeometryUtil.formattedNumber(convertUom(distance, "m", unit), p[unit]) + ' ' + label;
    if (options.useTreshold) {
        if (isMetric) {
            distanceStr = L.getMeasureWithTreshold(distance, 1000, "m", "km", p, "m", "km");
        }
        if (unit === "mi") {
            distanceStr = L.getMeasureWithTreshold(convertUom(distance, "m", "yd"), 1760, "yd", "mi", p, "yd", "mi");
        }
    }
    return distanceStr;
}
L.GeometryUtil.readableDistance = readableDistance;
/** @method readableArea(area, isMetric, precision): string
 * @return a readable area string in yards or metric.
 * The value will be rounded as defined by the precision option object.
 * this override is necesary due to the customization on how the area measure label is presented
 supporting also the square nautical miles and square feets
 */

const originalReadableArea = L.GeometryUtil.readableArea;

function readableArea(area, isMetric, precision, options) {
    if (!options) {
        return originalReadableArea.apply(null, arguments);
    }
    const {unit, label} = options.uom.area;
    const p = L.Util.extend({}, defaultPrecision, precision);
    let areaStr = L.GeometryUtil.formattedNumber(convertUom(area, "sqm", unit), p[unit]) + ' ' + label;
    if (options.useTreshold) {
        if (isMetric) {
            areaStr = L.getMeasureWithTreshold(area, 1000000, "sqm", "sqkm", p, "m²", "km²");
        }
        if (unit === "sqmi") {
            areaStr = L.getMeasureWithTreshold(convertUom(area, "sqm", "sqyd"), 3097600, "sqyd", "sqmi", p, "yd²", "mi²");
        }
    }
    return areaStr;
}
L.GeometryUtil.readableArea = readableArea;
/**
 * this is need to pass custom options as uom, useTreshold to the readableArea function
*/
const originalGetMeasurementStringPolygon = L.Draw.Polygon.prototype._getMeasurementString;

L.Draw.Polygon.prototype._getMeasurementString = function() {
    if (!this.options.uom) {
        return originalGetMeasurementStringPolygon.apply(this, arguments);
    }
    let area = this._area;
    let measurementString = '';
    if (!area && !this.options.showLength) {
        return null;
    }
    if (this.options.showLength) {
        measurementString = L.Draw.Polyline.prototype._getMeasurementString.call(this);
    }

    if (area) {
        // here is the custom option passed to geom util func
        const opt = {
            uom: this.options.uom,
            useTreshold: this.options.useTreshold
        };
        measurementString += this.options.showLength ? '<br>' : '' + L.GeometryUtil.readableArea(area, this.options.metric, this.options.precision, opt);
    }
    return measurementString;
};
/**
 * this is need to pass custom options as uom, useTreshold, bearing to the readableDistance function
*/
const originalGetMeasurementStringPolyline = L.Draw.Polyline.prototype._getMeasurementString;

L.Draw.Polyline.prototype._getMeasurementString = function() {
    if (!this.options.uom) {
        return originalGetMeasurementStringPolyline.apply(this, arguments);
    }
    let currentLatLng = this._currentLatLng;
    let previousLatLng = this._markers[this._markers.length - 1].getLatLng();
    let distance;

    // Calculate the distance from the last fixed point to the mouse position based on the version
    if (L.GeometryUtil.isVersion07x()) {
        distance = previousLatLng && currentLatLng && currentLatLng.distanceTo ? this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
    } else {
        distance = previousLatLng && currentLatLng ? this._measurementRunningTotal + this._map.distance(currentLatLng, previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
    }
    // here is the custom option passed to geom util func
    const opt = {
        uom: this.options.uom,
        useTreshold: this.options.useTreshold,
        geomType: this.options.geomType,
        bearing: this.options.bearing ? getFormattedBearingValue(this.options.bearing, this.options.trueBearing) : 0
    };
    return L.GeometryUtil.readableDistance(distance, this.options.metric, this.options.feet, this.options.nautic, this.options.precision, opt);
};

class MeasurementSupport extends React.Component {
    static displayName = 'MeasurementSupport';

    static propTypes = {
        map: PropTypes.object,
        metric: PropTypes.bool,
        feet: PropTypes.bool,
        nautic: PropTypes.bool,
        enabled: PropTypes.bool,
        useTreshold: PropTypes.bool,
        projection: PropTypes.string,
        measurement: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        messages: PropTypes.object,
        uom: PropTypes.object,
        updateOnMouseMove: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        uom: {
            length: {unit: 'm', label: 'm'},
            area: {unit: 'sqm', label: 'm²'}
        },
        updateOnMouseMove: false,
        metric: true,
        nautic: false,
        useTreshold: false,
        feet: false
    };


    UNSAFE_componentWillReceiveProps(newProps) {
        if ((newProps && newProps.uom && newProps.uom.length && newProps.uom.length.unit) !== (this.props && this.props.uom && this.props.uom.length && this.props.uom.length.unit) && this.drawControl) {
            const uomOptions = this.uomLengthOptions(newProps);
            this.drawControl.setOptions({...uomOptions, uom: newProps.uom});
        }
        if ((newProps && newProps.uom && newProps.uom.area && newProps.uom.area.unit) !== (this.props && this.props.uom && this.props.uom.area && this.props.uom.area.unit) && this.drawControl) {
            const uomOptions = this.uomAreaOptions(newProps);
            this.drawControl.setOptions({...uomOptions, uom: newProps.uom});
        }
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ||
            /* check also when a default is set
             * if so the first condition does not match
             * because the old geomType is not changed (it was already defined as default)
             * and the measure tool is getting enabled
            */
            (newProps.measurement.geomType && this.props.measurement.geomType && (newProps.measurement.lineMeasureEnabled || newProps.measurement.areaMeasureEnabled || newProps.measurement.bearingMeasureEnabled) && !this.props.enabled && newProps.enabled) ) {
            this.addDrawInteraction(newProps);
        }
        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
    }
    onDrawStart = () => {
        this.props.map.off('click', this.restartDrawing, this);
        this.removeArcLayer();
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.disable();
        }
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
            let point = {
                x: pos.lng,
                y: pos.lat,
                srs: 'EPSG:4326'
            };
            let newMeasureState = assign({}, this.props.measurement, {
                point: point,
                feature
            });
            this.props.changeMeasurementState(newMeasureState);
        } else {
            let newMeasureState = assign({}, this.props.measurement, {
                feature
            });
            this.props.changeMeasurementState(newMeasureState);
        }
        if (this.props.measurement.lineMeasureEnabled && this.lastLayer) {
            this.addArcsToMap([feature]);
        }
        setTimeout(() => {
            this.props.map.off('click', this.restartDrawing, this);
            this.props.map.on('click', this.restartDrawing, this);
        }, 100);
    };

    onDrawVertex = () => {
        let bearingMarkers = this.drawControl._markers || [];

        if (this.props.measurement.geomType === 'Bearing' && bearingMarkers.length >= 2) {
            setTimeout(() => {
                this.drawControl._markers = slice(this.drawControl._markers, 0, 2);
                this.drawControl._poly._latlngs = slice(this.drawControl._poly._latlngs, 0, 2);
                this.drawControl._poly._originalPoints = slice(this.drawControl._poly._originalPoints, 0, 2);
                this.updateMeasurementResults();
                this.drawControl._finishShape();
                this.drawControl.disable();
            }, 100);
        } else {
            this.updateMeasurementResults();
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
                const { lng, lat } = c.getLatLng();
                return [...p, [lng, lat]];
            }, []);

            distance = calculateDistance(reprojectedCoords, this.props.measurement.lengthFormula);

        } else if (this.props.measurement.geomType === 'Polygon' && this.drawControl._poly) {
            // calculate area
            let latLngs = [...this.drawControl._poly.getLatLngs(), currentLatLng];
            area = L.GeometryUtil.geodesicArea(latLngs);
        } else if (this.props.measurement.geomType === 'Bearing' && this.drawControl._markers && this.drawControl._markers.length > 0) {
            // calculate bearing
            bearing = this.calculateBearing();
        }
        // let drawn geom stay on the map
        let newMeasureState = assign({}, this.props.measurement, {
            point: null, // Point is set in onDraw.created
            len: distance,
            area: area,
            bearing: bearing
        });
        this.props.changeMeasurementState(newMeasureState);
    };

    restartDrawing = () => {
        this.props.map.off('click', this.restartDrawing, this);
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.enable();
        }
        // re-enable draw control, since it is stopped after
        // every finished sketch
        this.props.map.removeLayer(this.lastLayer);
        this.drawControl.enable();
        this.drawing = true;
    };

    addDrawInteraction = (newProps) => {

        this.removeDrawInteraction();

        this.props.map.on('draw:created', this.onDrawCreated, this);
        this.props.map.on('draw:drawstart', this.onDrawStart, this);
        this.props.map.on('draw:drawvertex', this.onDrawVertex, this);
        // this.props.map.on('click', this.mapClickHandler, this);
        this.props.map.on('mousemove', this.updateBearing, this);

        if (this.props.updateOnMouseMove) {
            this.props.map.on('mousemove', this.updateMeasurementResults, this);
        }
        if (newProps.measurement.geomType === 'Point') {
            this.drawControl = new L.Draw.Marker(this.props.map, {
                repeatMode: false
            });
        } else if (newProps.measurement.geomType === 'LineString' ||
            newProps.measurement.geomType === 'Bearing') {
            const uomOptions = this.uomLengthOptions(newProps);
            this.drawControl = new L.Draw.Polyline(this.props.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2
                },
                showLength: true,
                useTreshold: newProps.useTreshold,
                uom: newProps.uom,
                geomType: newProps.measurement.geomType,
                ...uomOptions,
                repeatMode: false,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                }),
                trueBearing: newProps.measurement.trueBearing
            });
        } else if (newProps.measurement.geomType === 'Polygon') {
            const uomOptions = this.uomAreaOptions(newProps);
            this.drawControl = new L.Draw.Polygon(this.props.map, {
                shapeOptions: {
                    color: '#ffcc33',
                    weight: 2,
                    fill: 'rgba(255, 255, 255, 0.2)'
                },
                showArea: true,
                allowIntersection: false,
                showLength: false,
                repeatMode: false,
                useTreshold: newProps.useTreshold,
                uom: newProps.uom,
                geomType: newProps.measurement.geomType,
                ...uomOptions,
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
            this.removeArcLayer();
            this.props.map.off('draw:created', this.onDrawCreated, this);
            this.props.map.off('draw:drawstart', this.onDrawStart, this);
            this.props.map.off('draw:drawvertex', this.onDrawVertex, this);
            this.props.map.off('mousemove', this.updateBearing, this);
            this.props.map.off('click', this.restartDrawing, this);
            // this.props.map.off('click', this.mapClickHandler, this);
            if (this.props.updateOnMouseMove) {
                this.props.map.off('mousemove', this.updateMeasurementResults, this);
            }
            if (this.props.map.doubleClickZoom) {
                this.props.map.doubleClickZoom.enable();
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

    uomLengthOptions = (props) => {
        let {
            unit
        } = props.uom.length;
        const metric = unit === "m" || unit === "km"; // false = miles&yards
        const nautic = unit === "nm";
        const feet = unit === "ft";
        return {
            metric,
            nautic,
            feet
        };
    }
    uomAreaOptions = (props) => {
        let {
            unit
        } = props.uom.area;
        const metric = unit === "sqm" || unit === "sqkm"; // false = miles
        const nautic = unit === "sqnm";
        const feet = unit === "sqft";
        return {
            metric,
            nautic,
            feet
        };
    }

    calculateBearing = () => {
        let currentLatLng = this.drawControl._currentLatLng;
        let bearing = 0;
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
        return bearing;
    }
    updateBearing = () => {
        if (this.props.measurement.geomType === 'Bearing' && this.drawControl._markers && this.drawControl._markers.length > 0) {
            const trueBearing = this.props.measurement && this.props.measurement.trueBearing;
            this.drawControl.setOptions({ bearing: this.calculateBearing(), trueBearing });
        }
    }
}

module.exports = MeasurementSupport;
