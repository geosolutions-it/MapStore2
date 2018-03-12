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
    sqmTosqft,
    sqmTosqnm,
    sqmTosqmi,
    sqmTosqkm,
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
    nm: 2
};


/** @method readableDistance(distance, units): string
 * Converts a metric distance to one of [ feet, nauticalMile, metric or yards ] string
 *
 * @alternative
 * @method readableDistance(distance, isMetric, useFeet, isNauticalMile, precision, options): string
 * Converts metric distance to distance string.
 * The value will be rounded as defined by the precision option object.
*/
L.GeometryUtil.readableDistance = (distance, isMetric, isFeet, isNauticalMile, precision, options) => {
    let distanceStr;
    let units;
    let d = distance;
    let p = L.Util.extend({}, defaultPrecision, precision);

    if (isMetric) {
        units = typeof isMetric === 'string' ? isMetric : 'metric';
    } else if (isFeet) {
        units = 'feet';
    } else if (isNauticalMile) {
        units = 'nauticalMile';
    } else {
        units = 'yards';
    }
    if (options.geomType === 'Bearing') {
        return options.bearing;
    }
    switch (units) {
        // show meters when distance is < 1km, then show km
        case 'metric':
            if (options.distinctMeasure) {
                if (distance > 1000) {
                    distanceStr = L.GeometryUtil.formattedNumber(distance / 1000, p.km) + ' km';
                } else {
                    distanceStr = L.GeometryUtil.formattedNumber(distance, p.m) + ' m';
                }
            } else {
                distanceStr = options.uom.length.unit === "m" ? L.GeometryUtil.formattedNumber(distance, p.m) + ' m' : L.GeometryUtil.formattedNumber(distance / 1000, p.km) + ' km';
            }
            break;
        case 'feet':
            d *= 1.09361 * 3;
            distanceStr = L.GeometryUtil.formattedNumber(d, p.ft) + ' ft';
            break;
        case 'nauticalMile':
            d *= 0.53996;
            distanceStr = L.GeometryUtil.formattedNumber(d / 1000, p.nm) + ' nm';
            break;
        case 'yards':
        default:
            d *= 1.09361;
            if (options.distinctMeasure) {
                if (distance > 1760) {
                    distanceStr = L.GeometryUtil.formattedNumber(d / 1760, p.mi) + ' miles';
                } else {
                    distanceStr = L.GeometryUtil.formattedNumber(d, p.yd) + ' yd';
                }
            } else {
                distanceStr = options.uom.length.unit === "mi" ? L.GeometryUtil.formattedNumber(d / 1760, p.mi) + ' miles' : distanceStr = L.GeometryUtil.formattedNumber(d, p.yd) + ' yd';
            }
            break;
    }
    return distanceStr;
};

/** @method readableArea(area, isMetric, precision): string
 * @return a readable area string in yards or metric.
 * The value will be rounded as defined by the precision option object.
 */
L.GeometryUtil.readableArea = (area, isMetric, precision, options) => {
    let areaStr;
    let units;
    let type;
    const {unit} = options.uom.area;
    let p = L.Util.extend({}, defaultPrecision, precision);
    let a = area;
    if (options.distinctMeasure) { // this is done for retrocompatibility
        if (isMetric) {
            units = ['ha', 'm', 'km']; // added km
            type = typeof isMetric;
            if (type === 'string') {
                units = [isMetric];
            } else if (type !== 'boolean') {
                units = isMetric;
            }
            if (area >= 1000000 && units.indexOf('km') !== -1) {
                areaStr = L.GeometryUtil.formattedNumber(area * 0.000001, p.km) + ' km²';
            } else if (area >= 10000 && units.indexOf('ha') !== -1) {
                areaStr = L.GeometryUtil.formattedNumber(area * 0.0001, p.ha) + ' ha';
            } else {
                areaStr = L.GeometryUtil.formattedNumber(area, p.m) + ' m²';
            }
        } else {
            a /= 0.836127; // Square yards in 1 meter
            if (a >= 3097600) { // 3097600 square yards in 1 square mile
                areaStr = L.GeometryUtil.formattedNumber(a / 3097600, p.mi) + ' mi²';
            } else if (a >= 4840) { // 4840 square yards in 1 acre
                areaStr = L.GeometryUtil.formattedNumber(a / 4840, p.ac) + ' acres';
            } else {
                areaStr = L.GeometryUtil.formattedNumber(a, p.yd) + ' yd²';
            }
        }
    } else {
        if (unit === "sqkm") {
            areaStr = L.GeometryUtil.formattedNumber(sqmTosqkm(area), p.km) + ' km²';
        } else if (unit === "sqm") {
            areaStr = L.GeometryUtil.formattedNumber(area, p.ft) + ' m²';
        } else if (unit === "sqft") {
            areaStr = L.GeometryUtil.formattedNumber(sqmTosqft(area), p.ft) + ' ft²';
        } else if (unit === "sqnm") {
            areaStr = L.GeometryUtil.formattedNumber(sqmTosqnm(area), p.nm) + ' nm²';
        } else { // default square miles
            areaStr = L.GeometryUtil.formattedNumber(sqmTosqmi(area), p.mi) + ' mi²';
        }
    }
    return areaStr;
};

L.Draw.Polygon.prototype._getMeasurementString = function() {
    let area = this._area;
    let measurementString = '';
    if (!area && !this.options.showLength) {
        return null;
    }
    if (this.options.showLength) {
        measurementString = L.Draw.Polyline.prototype._getMeasurementString.call(this);
    }

    if (area) {
        const opt = {
            uom: this.options.uom,
            distinctMeasure: this.options.distinctMeasure,
            geomType: this.options.geomType
        };
        measurementString += this.options.showLength ? '<br>' : '' + L.GeometryUtil.readableArea(area, this.options.metric, this.options.precision, opt);
    }
    return measurementString;
};
L.Draw.Polyline.prototype._getMeasurementString = function() {
    let currentLatLng = this._currentLatLng;
    let previousLatLng = this._markers[this._markers.length - 1].getLatLng();
    let distance;

    // Calculate the distance from the last fixed point to the mouse position based on the version
    if (L.GeometryUtil.isVersion07x()) {
        distance = previousLatLng && currentLatLng && currentLatLng.distanceTo ? this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
    } else {
        distance = previousLatLng && currentLatLng ? this._measurementRunningTotal + this._map.distance(currentLatLng, previousLatLng) * (this.options.factor || 1) : this._measurementRunningTotal || 0;
    }
    const opt = {
        uom: this.options.uom,
        distinctMeasure: this.options.distinctMeasure,
        geomType: this.options.geomType,
        bearing: this.options.bearing ? getFormattedBearingValue(this.options.bearing) : 0
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
        distinctMeasure: PropTypes.bool,
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
        distinctMeasure: false,
        feet: false
    };


    componentWillReceiveProps(newProps) {
        if ((newProps && newProps.uom && newProps.uom.length && newProps.uom.length.unit) !== (this.props && this.props.uom && this.props.uom.length && this.props.uom.length.unit) && this.drawControl) {
            const uomOptions = this.uomLengthOptions(newProps);
            this.drawControl.setOptions({...uomOptions, uom: newProps.uom});
        }
        if ((newProps && newProps.uom && newProps.uom.area && newProps.uom.area.unit) !== (this.props && this.props.uom && this.props.uom.area && this.props.uom.area.unit) && this.drawControl) {
            const uomOptions = this.uomAreaOptions(newProps);
            this.drawControl.setOptions({...uomOptions, uom: newProps.uom});
        }
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType) {
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
                distinctMeasure: newProps.distinctMeasure,
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
                })
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
                distinctMeasure: newProps.distinctMeasure,
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
            this.props.map.off('draw:created', this.onDrawCreated, this);
            this.props.map.off('draw:drawstart', this.onDrawStart, this);
            this.props.map.off('mousemove', this.updateBearing, this);
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
            this.drawControl.setOptions({ bearing: this.calculateBearing() });
        }
    }
}

module.exports = MeasurementSupport;
