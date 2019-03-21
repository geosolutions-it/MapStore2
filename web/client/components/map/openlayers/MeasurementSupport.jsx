/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {round, isEqual, dropRight, pick} = require('lodash');
const assign = require('object-assign');
const ol = require('openlayers');
const wgs84Sphere = new ol.Sphere(6378137);
const {reprojectGeoJson, reproject, calculateAzimuth, calculateDistance, transformLineToArcs} = require('../../../utils/CoordinatesUtils');
const {convertUom, getFormattedBearingValue} = require('../../../utils/MeasureUtils');
const {set} = require('../../../utils/ImmutableUtils');
const {startEndPolylineStyle} = require('./VectorStyle');
const {getMessageById} = require('../../../utils/LocaleUtils');
const {createOLGeometry} = require('../../../utils/openlayers/DrawUtils');

const getProjectionCode = (olMap) => {
    return olMap.getView().getProjection().getCode();
};

class MeasurementSupport extends React.Component {
    static propTypes = {
        startEndPoint: PropTypes.object,
        map: PropTypes.object,
        measurement: PropTypes.object,
        enabled: PropTypes.bool,
        uom: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        updateMeasures: PropTypes.func,
        resetGeometry: PropTypes.func,
        changeGeometry: PropTypes.func,
        updateOnMouseMove: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        changeMeasurementState: () => {},
        resetGeometry: () => {},
        updateMeasures: () => {},
        changeGeometry: () => {},
        startEndPoint: {
            startPointOptions: {
                radius: 3,
                fillColor: "green"
            },
            endPointOptions: {
                radius: 3,
                fillColor: "red"
            }
        },
        updateOnMouseMove: false
    };

    /**
     * we assume that only valid features are passed to the draw tools
     */
    componentWillReceiveProps(newProps) {
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ||
            /* check also when a measure tool is enabled
             * if so the first condition does not match
             * because the old geomType is not changed (it was already defined as default)
             * and the measure tool is getting enabled
            */
            (newProps.measurement.geomType && (newProps.measurement.lineMeasureEnabled || newProps.measurement.areaMeasureEnabled || newProps.measurement.bearingMeasureEnabled) && !this.props.enabled && newProps.enabled) ) {
            this.addDrawInteraction(newProps);
        }
        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
        let oldFt = this.props.measurement.feature;
        let newFt = newProps.measurement.feature;
        /**
         * update the feature drawn and recalculate the measures and tooltips
         * then update the stae with only the new measures calculated
         */
        if (newFt && newFt.geometry && newProps.measurement.updatedByUI && (!isEqual(oldFt, newFt) || !isEqual(this.props.uom, newProps.uom))) {
            this.updateMeasures(newProps);
        }
    }

    render() {
        return null;
    }

    validateCoords = (coords) => {
        return coords.filter((c) => !isNaN(parseFloat(c[0])) && !isNaN(parseFloat(c[1])));
    }
    /**
     * This method takes the feature from properties and
     * it updated the drawn feature and its measure tooltip
     * It must receive only valid coordinates
    */
    updateMeasures = (props) => {
        this.replaceFeatures([props.measurement.feature], props);

        // update measure tooltip
        if (props.measurement.showLabel) {
            this.removeMeasureTooltips();
            this.measureTooltipElement = document.createElement("div");
            this.measureTooltipElement.className = this.drawing ? "tooltip tooltip-measure" : "tooltip tooltip-static";

            let geom = this.source.getFeatures()[0].getGeometry();
            let output;
            if (geom instanceof ol.geom.Polygon) {
                output = this.formatArea(geom, props);
                this.tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = this.formatLength(geom, props);
                this.tooltipCoord = geom.getLastCoordinate();
            }
            this.measureTooltipElement.innerHTML = output;
            this.measureTooltip = new ol.Overlay({
                element: this.measureTooltipElement,
                offset: [0, -7],
                positioning: 'bottom-center'
            });
            this.measureTooltip.setPosition(this.tooltipCoord);
            props.map.addOverlay(this.measureTooltip);
        }
        this.sketchFeature = this.source.getFeatures()[0];
        this.updateMeasurementResults(props, true);
    }

    /**
     * takes features form props and
     * it adds it to the measure vector layer
    */
    replaceFeatures = (features, props) => {
        let featuresToReplace = features;
        if (props.measurement.lineMeasureEnabled) {
            // creatin arcs for distance measure
            let newCoords = transformLineToArcs(props.measurement.feature.geometry.coordinates);
            let ft = set("geometry.coordinates", newCoords, features[0]);
            featuresToReplace = [ft];
        }
        this.source = new ol.source.Vector();
        featuresToReplace.forEach((geoJSON) => {
            let geometry = reprojectGeoJson(geoJSON, "EPSG:4326", getProjectionCode(this.props.map)).geometry;
            const feature = new ol.Feature({
                geometry: createOLGeometry(geometry)
            });
            this.source.addFeature(feature);
        });
        this.measureLayer.setSource(this.source);
    };

    addDrawInteraction = (newProps) => {
        let vector;
        let draw;
        let geometryType;
        let {startEndPoint} = newProps.measurement;
        this.continueLineMsg = getMessageById(this.context.messages, "measureSupport.continueLine");
        this.continuePolygonMsg = getMessageById(this.context.messages, "measureSupport.continuePolygon");

        // cleanup old interaction
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        // create a layer to draw on
        this.source = new ol.source.Vector();
        let styles = [
            new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })];
        let startEndPointStyles = [];
        let applyStartEndPointStyle = startEndPoint || startEndPoint === true;
        if (applyStartEndPointStyle || startEndPoint === undefined ) {
            // if startPointOptions or endPointOptions is undefined it will use the default values set in VectorStyle for that point
            let options = applyStartEndPointStyle ? startEndPoint === undefined ? {} : startEndPoint : newProps.startEndPoint;
            startEndPointStyles = startEndPolylineStyle(options.startPointOptions, options.endPointOptions);
        }

        vector = new ol.layer.Vector({
            source: this.source,
            zIndex: 1000000,
            style: [...styles, ...startEndPointStyles]
        });

        this.props.map.addLayer(vector);

        if (newProps.measurement.geomType === 'Bearing') {
            geometryType = 'LineString';
        } else {
            geometryType = newProps.measurement.geomType;
        }
        // create an interaction to draw with
        draw = new ol.interaction.Draw({
            source: this.source,
            type: /** @type {ol.geom.GeometryType} */ geometryType,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });

        this.clickListener = this.props.map.on('click', () => this.updateMeasurementResults(this.props), this);
        if (this.props.updateOnMouseMove) {
            this.props.map.on('pointermove', () => this.updateMeasurementResults(this.props), this);
        }

        this.props.map.on('pointermove', this.pointerMoveHandler, this);

        draw.on('drawstart', function(evt) {
            // preserve the sketch feature of the draw controller
            // to update length/area on drawing a new vertex
            this.sketchFeature = evt.feature;
            this.drawing = true;
            let oldtooltips = document.getElementsByClassName("tooltip-static") || [];
            for (let i = 0; i < oldtooltips.length; i++) {
                oldtooltips[i].parentNode.removeChild(oldtooltips[i]);
            }

            if (this.props.measurement.showLabel) {
                this.createMeasureTooltip();
            }
            // clear previous measurements, but only if the event is dispatch by the click event not by ui
            this.source.clear();
            this.listener = this.sketchFeature.getGeometry().on('change', (e) => {
                let geom = e.target;
                let output;
                if (geom instanceof ol.geom.Polygon) {
                    output = this.formatArea(geom, this.props);
                    this.tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    output = this.formatLength(geom, this.props);
                    this.tooltipCoord = geom.getLastCoordinate();
                }
                if (this.props.measurement.showLabel) {
                    this.measureTooltipElement.innerHTML = output;
                    this.measureTooltip.setPosition(this.tooltipCoord);
                }
            }, this);
            this.props.resetGeometry();
        }, this);
        draw.on('drawend', function(evt) {
            this.drawing = false;
            const geojsonFormat = new ol.format.GeoJSON();
            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(evt.feature.clone()), getProjectionCode(this.props.map), "EPSG:4326");
            this.props.changeGeometry(newFeature);
            if (this.props.measurement.lineMeasureEnabled) {
                // Calculate arc
                let newCoords = transformLineToArcs(newFeature.geometry.coordinates);
                newFeature = set("geometry.coordinates", newCoords, newFeature);
            }
            this.replaceFeatures([newFeature], this.props);
            if (this.props.measurement.showLabel) {
                this.measureTooltipElement.className = 'tooltip tooltip-static';
                this.measureTooltip.setOffset([0, -7]);
                ol.Observable.unByKey(this.listener);
            }
        }, this);

        this.props.map.addInteraction(draw);
        if (this.props.measurement.showLabel) {
            this.createMeasureTooltip();
        }
        this.createHelpTooltip();

        this.drawInteraction = draw;
        this.measureLayer = vector;
    };

    removeDrawInteraction = () => {
        if (this.drawInteraction !== null) {
            this.removeHelpTooltip();
            this.removeMeasureTooltips();
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.props.map.removeLayer(this.measureLayer);
            this.sketchFeature = null;
            this.props.map.un('click', () => this.updateMeasurementResults(this.props), this);
            ol.Observable.unByKey(this.clickListener);
            if (this.props.updateOnMouseMove) {
                this.props.map.un('pointermove', () => this.updateMeasurementResults(this.props), this);
            }
        }
    };

    /**
     * Handle pointer move.
     * @param {ol.MapBrowserEvent} evt The event.
     */
    pointerMoveHandler = function(evt) {
        if (evt.dragging) {
            return null;
        }
        /** @type {string} */
        let helpMsg = getMessageById(this.context.messages, "measureSupport.startDrawing");

        if (this.sketchFeature && this.drawing) {
            let geom = (this.sketchFeature.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = this.continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = this.continueLineMsg;
            }
        }
        this.helpTooltipElement.innerHTML = helpMsg;
        this.helpTooltip.setPosition(evt.coordinate);

        this.helpTooltipElement.classList.remove('hidden');
    };

    /** trigger the action for updating the state.
     * if invalid coords are passed to this they needs to be repushed to the state.
     * @param {object} props to be used for calculating measures and other info
     * @param {boolean} updatedByUI used for updating the state
    */
    updateMeasurementResults = (props, updatedByUI) => {
        if (!this.sketchFeature) {
            return;
        }
        let bearing = 0;
        let sketchCoords = this.sketchFeature.getGeometry().getCoordinates();

        if (props.measurement.geomType === 'Bearing' && sketchCoords.length > 1) {
            // calculate the azimuth as base for bearing information
            bearing = calculateAzimuth(sketchCoords[0], sketchCoords[1], getProjectionCode(props.map));
            if (sketchCoords.length > 2) {
                this.drawInteraction.sketchCoords_ = [sketchCoords[0], sketchCoords[1], sketchCoords[0]];
                while (this.sketchFeature.getGeometry().getCoordinates().length > 3) {
                    /*
                    * In some cases, if the user is too quick changing direction after the creation of the second point
                    * (before the draw interaction stops) new point are created in the interaction and have to be removed
                    * note: `> 3` is because the last point of the sketchFeature is the current mouse position
                    */
                    this.drawInteraction.removeLastPoint();
                }
                this.sketchFeature.getGeometry().setCoordinates([sketchCoords[0], sketchCoords[1]]);
                this.drawInteraction.sketchFeature_ = this.sketchFeature;
                this.drawInteraction.finishDrawing();
            }
        }
        const geojsonFormat = new ol.format.GeoJSON();
        let feature = reprojectGeoJson(geojsonFormat.writeFeatureObject(this.sketchFeature.clone()), getProjectionCode(props.map), "EPSG:4326");

        // it will no longer create 100 points for arcs to put in the state
        let newMeasureState = assign({}, props.measurement,
            {
                point: props.measurement.geomType === 'Point' ? reproject(sketchCoords, getProjectionCode(this.props.map), 'EPSG:4326') : null,
                len: props.measurement.geomType === 'LineString' ? calculateDistance(this.reprojectedCoordinatesIn4326(sketchCoords), props.measurement.lengthFormula) : 0,
                area: props.measurement.geomType === 'Polygon' ? this.calculateGeodesicArea(this.sketchFeature.getGeometry().getLinearRing(0).getCoordinates()) : 0,
                bearing: props.measurement.geomType === 'Bearing' ? bearing : 0,
                lenUnit: props.measurement.lenUnit,
                areaUnit: props.measurement.areaUnit,
                feature: set("geometry.coordinates", this.drawing ?
                    props.measurement.geomType === 'Polygon' ? [dropRight(feature.geometry.coordinates[0], feature.geometry.coordinates[0].length <= 2 ? 0 : 1)] : dropRight(feature.geometry.coordinates) :
                    feature.geometry.coordinates, feature)
            }
        );
        if (updatedByUI) {
            // update only re-calculated measures
            this.props.updateMeasures(pick(newMeasureState, ["bearing", "area", "len", "point"]));
        } else {
            // update also the feature
            this.props.changeMeasurementState(newMeasureState);
        }
    };

    reprojectedCoordinatesIn4326 = (coordinates) => {
        return coordinates.map((coordinate) => {
            let reprojectedCoordinate = reproject(coordinate, getProjectionCode(this.props.map), 'EPSG:4326');
            return [reprojectedCoordinate.x, reprojectedCoordinate.y];
        });
    };

    calculateGeodesicArea = (coordinates) => {
        if (coordinates.length >= 4 ) {
            let reprojectedCoordinatesIn4326 = this.reprojectedCoordinatesIn4326(coordinates);
            return Math.abs(wgs84Sphere.geodesicArea(reprojectedCoordinatesIn4326));
        }
        return 0;
    };

    /**
     * Creates a new help tooltip
     */
    createHelpTooltip = () => {
        this.removeHelpTooltip();
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltip = new ol.Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        this.props.map.addOverlay(this.helpTooltip);
    }
    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip = () => {
        this.removeMeasureTooltips();
        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = 'tooltip tooltip-measure';
        this.measureTooltip = new ol.Overlay({
            element: this.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        this.props.map.addOverlay(this.measureTooltip);
    }
    /**
       * Format length output.
       * @param {ol.geom.LineString} line The line.
       * @return {string} The formatted length with uom chosen.
       */
    formatLength = (line, props) => {
        const sketchCoords = line.getCoordinates();
        if (props.measurement.geomType === 'Bearing' && sketchCoords.length > 1) {
            // calculate the azimuth as base for bearing information
            const bearing = calculateAzimuth(sketchCoords[0], sketchCoords[1], getProjectionCode(props.map));
            return getFormattedBearingValue(bearing);
        }
        const reprojectedCoords = this.reprojectedCoordinatesIn4326(sketchCoords);
        const length = calculateDistance(reprojectedCoords, props.measurement.lengthFormula);
        const {label, unit} = props.uom && props.uom.length;
        const output = round(convertUom(length, "m", unit), 2);
        return output + " " + (label);
    };

    /**
     * Format area output.
     * @param {ol.geom.Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    formatArea = (polygon, props) => {
        const area = this.calculateGeodesicArea(polygon.getLinearRing(0).getCoordinates());
        const {label, unit} = props.uom && props.uom.area;
        const output = round(convertUom(area, "sqm", unit), 2);

        return output + " " + label;
    };

    removeHelpTooltip = () => {
        if (this.helpTooltipElement && this.helpTooltipElement.parentNode) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
    }
    removeMeasureTooltips = () => {
        if (this.measureTooltipElement && this.measureTooltipElement.parentNode) {
            let oldtooltips = document.getElementsByClassName("tooltip-static") || [];
            for (let i = 0; i < oldtooltips.length; i++) {
                oldtooltips[i].parentNode.removeChild(oldtooltips[i]);
            }
            oldtooltips = document.getElementsByClassName("tooltip-measure") || [];
            for (let i = 0; i < oldtooltips.length; i++) {
                oldtooltips[i].parentNode.removeChild(oldtooltips[i]);
            }
        }
    }
}

module.exports = MeasurementSupport;
