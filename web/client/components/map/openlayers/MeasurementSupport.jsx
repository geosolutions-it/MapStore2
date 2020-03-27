/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import round from 'lodash/round';
import isEqual from 'lodash/isEqual';
import dropRight from 'lodash/dropRight';
import pick from 'lodash/pick';
import get from 'lodash/get';
import last from 'lodash/last';

import assign from 'object-assign';

import {
    reprojectGeoJson,
    reproject,
    pointObjectToArray,
    calculateAzimuth,
    calculateDistance,
    transformLineToArcs,
    midpoint
} from '../../../utils/CoordinatesUtils';
import {convertUom, getFormattedBearingValue} from '../../../utils/MeasureUtils';
import {set} from '../../../utils/ImmutableUtils';
import {startEndPolylineStyle} from './VectorStyle';
import {getMessageById} from '../../../utils/LocaleUtils';
import {createOLGeometry} from '../../../utils/openlayers/DrawUtils';

import {Polygon, LineString} from 'ol/geom';
import Overlay from 'ol/Overlay';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import {Stroke, Fill, Style} from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import {unByKey} from 'ol/Observable';
import {getArea} from 'ol/sphere';

const getProjectionCode = (olMap) => {
    return olMap.getView().getProjection().getCode();
};

export default class MeasurementSupport extends React.Component {
    static propTypes = {
        startEndPoint: PropTypes.object,
        map: PropTypes.object,
        measurement: PropTypes.object,
        enabled: PropTypes.bool,
        uom: PropTypes.object,
        formatNumber: PropTypes.func,
        changeMeasurementState: PropTypes.func,
        updateMeasures: PropTypes.func,
        resetGeometry: PropTypes.func,
        changeGeometry: PropTypes.func,
        updateOnMouseMove: PropTypes.bool,
        setTextLabels: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        changeMeasurementState: () => {},
        resetGeometry: () => {},
        updateMeasures: () => {},
        changeGeometry: () => {},
        formatNumber: n => n,
        setTextLabels: () => {},
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
    UNSAFE_componentWillReceiveProps(newProps) {
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
            this.removeMeasureTooltips();
            this.removeSegmentLengthOverlays();
            this.textLabels = [];
            this.segmentLengths = [];
            this.props.map.removeLayer(this.measureLayer);
            this.vector = null;
            this.measureLayer = null;
            if (newProps.measurement.features && newProps.measurement.features.length > 0) {
                this.props.changeGeometry([]);
            }
            if (newProps.measurement.textLabels && newProps.measurement.textLabels.length > 0) {
                this.props.setTextLabels([]);
            }
            if (this.source) {
                this.source.clear();
                this.source = null;
            }
        }
        let oldFt = this.props.measurement.features;
        let newFt = newProps.measurement.features;
        /**
         * update the feature drawn and recalculate the measures and tooltips
         * then update the stae with only the new measures calculated
         */
        if (newProps.measurement.updatedByUI && (!isEqual(oldFt, newFt) || !isEqual(this.props.uom, newProps.uom))) {
            this.updateMeasures(newProps);
        }
    }

    getLength = (coords, props) => {
        if (props.measurement.geomType === 'Bearing' && coords.length > 1) {
            // calculate the azimuth as base for bearing information
            return calculateAzimuth(coords[0], coords[1], getProjectionCode(props.map));
        }
        const reprojectedCoords = this.reprojectedCoordinatesIn4326(coords);
        return calculateDistance(reprojectedCoords, props.measurement.lengthFormula);
    }

    getArea = (polygon) => {
        return this.calculateGeodesicArea(polygon.getLinearRing(0).getCoordinates());
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
        const converter = ({type, value}) => {
            if (type === 'length') {
                return this.formatLengthValue(value, props.uom, false);
            } else if (type === 'area') {
                return this.formatAreaValue(value, props.uom);
            }
            return this.formatLengthValue(value, props.uom, true);
        };

        for (let i = 0; i < this.outputValues.length; ++i) {
            if (!this.outputValues[i]) continue;
            this.measureTooltipElements[i].innerHTML = converter(this.outputValues[i]);
        }
        for (let i = 0; i < this.segmentOverlayElements.length; ++i) {
            if (!this.segmentOverlayElements[i]) continue;
            const text = converter(this.segmentLengths[i]);
            this.segmentOverlayElements[i].innerHTML = text;
            this.textLabels[i].text = text;
        }

        if (!this.drawing) {
            this.props.setTextLabels(this.textLabels);
        }
    }

    addFeature = (featureObj) => {
        let newSource = false;

        if (!this.source) {
            this.source = new VectorSource();
            newSource = true;
        }

        let geometry = reprojectGeoJson(featureObj, "EPSG:4326", getProjectionCode(this.props.map)).geometry;
        const feature = new Feature({
            geometry: createOLGeometry(geometry)
        });
        this.source.addFeature(feature);

        if (newSource) {
            this.measureLayer.setSource(this.source);
        }
    };

    resetGeometry = () => {
        this.source.clear();
        this.props.resetGeometry();
    };

    addDrawInteraction = (newProps) => {
        let draw;
        let geometryType;
        let {startEndPoint} = newProps.measurement;
        this.continueLineMsg = getMessageById(this.context.messages, "measureSupport.continueLine");
        this.continuePolygonMsg = getMessageById(this.context.messages, "measureSupport.continuePolygon");

        // cleanup old interaction
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }

        if (!this.vector) {
            // create a layer to draw on
            this.source = new VectorSource();
            let styles = [
                new Style({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
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

            const vectorStyle = [...styles, ...startEndPointStyles];

            this.vector = new VectorLayer({
                source: this.source,
                zIndex: 1000000,
                style: vectorStyle
            });

            this.props.map.addLayer(this.vector);
        }

        if (newProps.measurement.geomType === 'Bearing') {
            geometryType = 'LineString';
        } else {
            geometryType = newProps.measurement.geomType;
        }
        // create an interaction to draw with
        draw = new Draw({
            source: new VectorSource(),
            type: /** @type {ol.geom.GeometryType} */ geometryType,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 5,
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });

        this.clickListener = this.props.map.on('click', () => this.updateMeasurementResults(this.props));
        if (this.props.updateOnMouseMove) {
            this.props.map.on('pointermove', () => this.updateMeasurementResults(this.props));
        }

        this.props.map.on('pointermove', (evt) => this.pointerMoveHandler(evt));

        draw.on('drawstart', (evt) => {
            // preserve the sketch feature of the draw controller
            // to update length/area on drawing a new vertex
            this.sketchFeature = evt.feature;
            this.drawing = true;

            if (!this.textLabels) {
                this.textLabels = [];
            }
            if (!this.segmentLengths) {
                this.segmentLengths = [];
            }
            if (this.props.measurement.showLabel) {
                this.createMeasureTooltip(this.props.measurement.geomType === 'Polygon' ? [0, 0] : undefined);
                if (this.props.measurement.geomType === 'Polygon') {
                    this.createMeasureTooltip();
                }
            }
            if (this.props.measurement.showSegmentLengths && this.props.measurement.geomType === 'Polygon') {
                this.createSegmentLengthOverlay();
            }

            this.listener = this.sketchFeature.getGeometry().on('change', (e) => {
                let geom = e.target;
                let output;
                let outputValue;
                if (geom instanceof Polygon) {
                    outputValue = {
                        value: this.getArea(geom),
                        type: 'area'
                    };
                    output = this.formatAreaValue(outputValue.value, this.props.uom);
                    this.tooltipCoord = geom.getInteriorPoint().getCoordinates();

                    const coords = geom.getCoordinates()[0];
                    let segments = [];

                    if (this.props.measurement.showSegmentLengths &&
                        (this.curPolygonLength === undefined || this.curPolygonLength < coords.length)) {
                        this.createSegmentLengthOverlay();
                        this.curPolygonLength = coords.length;
                    }

                    if (coords.length > 2) {
                        segments.push(midpoint(coords[coords.length - 1], coords[coords.length - 2], true));
                        segments.push(midpoint(coords[coords.length - 2], coords[coords.length - 3], true));
                        for (let i = 0; i < segments.length; ++i) {
                            const length = this.getLength(coords.slice(coords.length - 2 - i, coords.length - i), this.props);
                            const text = this.formatLengthValue(length, this.props.uom, false);

                            this.segmentOverlayElements[this.segmentOverlays.length - i - 1].innerHTML = text;
                            this.segmentOverlays[this.segmentOverlays.length - i - 1].setPosition(segments[i]);
                            this.segmentLengths[this.segmentOverlays.length - i - 1] = {
                                value: length,
                                type: 'length'
                            };
                            this.textLabels[this.segmentOverlays.length - i - 1] = {
                                text,
                                position: pointObjectToArray(reproject(segments[i], getProjectionCode(this.props.map), 'EPSG:4326'))
                            };
                        }
                    }

                } else if (geom instanceof LineString) {
                    const coords = geom.getCoordinates();
                    const lastSegment = [coords[coords.length - 2], coords[coords.length - 1]];

                    if (this.props.measurement.showSegmentLengths &&
                        (this.curLineStringLength === undefined || this.curLineStringLength < coords.length)) {
                        this.createSegmentLengthOverlay();
                        this.curLineStringLength = coords.length;
                    }

                    const length = this.getLength(coords, this.props);
                    const lastSegmentLength = this.getLength(lastSegment, this.props);

                    output = this.formatLengthValue(length, this.props.uom, this.props.measurement.geomType === 'Bearing');
                    this.tooltipCoord = geom.getLastCoordinate();

                    const overlayText = this.formatLengthValue(lastSegmentLength, this.props.uom, this.props.measurement.geomType === 'Bearing');
                    last(this.segmentOverlayElements).innerHTML = overlayText;
                    last(this.segmentOverlays).setPosition(midpoint(lastSegment[0], lastSegment[1], true));
                    this.textLabels[this.segmentOverlays.length - 1] = {
                        text: overlayText
                    };
                    this.segmentLengths[this.segmentOverlays.length - 1] = {
                        value: lastSegmentLength,
                        type: this.props.measurement.geomType === 'Bearing' ? 'bearing' : 'length'
                    };

                    outputValue = {
                        value: length,
                        type: this.props.measurement.geomType === 'Bearing' ? 'bearing' : 'length'
                    };
                }
                if (this.props.measurement.showLabel) {
                    last(this.measureTooltipElements).innerHTML = output;
                    last(this.measureTooltips).setPosition(this.tooltipCoord);
                    this.outputValues[this.outputValues.length - 1] = outputValue;

                    if (geom instanceof Polygon) {
                        const coords = geom.getCoordinates()[0];
                        const length = this.getLength(coords.length === 3 ? dropRight(coords) : coords, this.props);

                        this.measureTooltipElements[this.measureTooltipElements.length - 2].innerHTML =
                            this.formatLengthValue(length, this.props.uom, false);
                        this.outputValues[this.measureTooltipElements.length - 2] = {
                            value: length,
                            type: 'length'
                        };
                        this.perimeterTooltipCoord = geom.getLastCoordinate();
                        this.measureTooltips[this.measureTooltipElements.length - 2].setPosition(this.perimeterTooltipCoord);
                    }
                }
            });
        });
        draw.on('drawend', (evt) => {
            this.drawing = false;
            const currentFeatures = get(this.props.measurement, 'features', []);
            const geojsonFormat = new GeoJSON();

            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(evt.feature.clone()), getProjectionCode(this.props.map), "EPSG:4326");
            newFeature.properties = newFeature.properties || {};
            newFeature.properties.values = this.props.measurement.values;

            this.props.changeGeometry([...currentFeatures, newFeature]);
            if (this.props.measurement.lineMeasureEnabled) {
                // Calculate arc
                let oldCoords = newFeature.geometry.coordinates;
                let newCoords = transformLineToArcs(oldCoords);

                // the last overlay is a dummy
                this.textLabels.pop();
                this.segmentLengths.pop();
                this.props.map.removeOverlay(last(this.segmentOverlays));
                last(this.segmentOverlayElements).parentNode.removeChild(last(this.segmentOverlayElements));
                this.segmentOverlays.pop();
                this.segmentOverlayElements.pop();

                // Generate correct textLabels and update segment overlays
                for (let i = 0; i < oldCoords.length - 1; ++i) {
                    const middlePoint = newCoords[100 * i + 50];
                    this.textLabels[this.segmentOverlays.length - oldCoords.length + 1 + i].position = middlePoint;
                    this.segmentOverlays[this.segmentOverlays.length - oldCoords.length + 1 + i].setPosition(
                        pointObjectToArray(reproject(middlePoint, 'EPSG:4326', getProjectionCode(this.props.map)))
                    );
                }

                newFeature = set("geometry.coordinates", newCoords, newFeature);
            }
            this.props.setTextLabels(this.textLabels);

            this.addFeature(newFeature);
            if (this.props.measurement.showLabel) {
                last(this.measureTooltipElements).className = 'tooltip tooltip-static';
                last(this.measureTooltips).setOffset([0, -7]);
                if (this.props.measurement.geomType === 'Polygon') {
                    this.measureTooltipElements[this.measureTooltipElements.length - 2].className = 'tooltip tooltip-static';
                    this.measureTooltips[this.measureTooltipElements.length - 2].setOffset([0, -7]);
                }
                unByKey(this.listener);
            }

            this.curPolygonLength = undefined;
            this.curLineStringLength = undefined;
        });

        this.props.map.addInteraction(draw);
        if (this.props.measurement.showLabel) {
            this.createMeasureTooltip();
        }
        this.createHelpTooltip();

        this.drawInteraction = draw;
        this.measureLayer = this.vector;
    };

    removeDrawInteraction = () => {
        if (this.drawInteraction !== null) {
            this.removeHelpTooltip();
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.sketchFeature = null;
            this.props.map.un('click', () => this.updateMeasurementResults(this.props), this);
            unByKey(this.clickListener);
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
            return;
        }
        /** @type {string} */
        let helpMsg = getMessageById(this.context.messages, "measureSupport.startDrawing");

        if (this.sketchFeature && this.drawing) {
            let geom = (this.sketchFeature.getGeometry());
            if (geom instanceof Polygon) {
                helpMsg = this.continuePolygonMsg;
            } else if (geom instanceof LineString) {
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
        const geojsonFormat = new GeoJSON();
        let feature = reprojectGeoJson(geojsonFormat.writeFeatureObject(this.sketchFeature.clone()), getProjectionCode(props.map), "EPSG:4326");

        const getMeasureValue = {
            'Point': () => reproject(sketchCoords, getProjectionCode(this.props.map), 'EPSG:4326'),
            'LineString': () => calculateDistance(this.reprojectedCoordinatesIn4326(sketchCoords), props.measurement.lengthFormula),
            'Polygon': () => this.calculateGeodesicArea(this.sketchFeature.getGeometry().getLinearRing(0).getCoordinates()),
            'Bearing': () => bearing
        };

        // it will no longer create 100 points for arcs to put in the state
        let newMeasureState = assign({}, props.measurement,
            {
                values: [{
                    value: (getMeasureValue[props.measurement.geomType] || (() => null))(),
                    position: pointObjectToArray(reproject(props.measurement.geomType === 'Polygon' ?
                        this.sketchFeature.getGeometry().getInteriorPoint().getCoordinates() :
                        last(sketchCoords),
                    getProjectionCode(this.props.map), 'EPSG:4326')),
                    type: props.measurement.pointMeasureEnabled ? 'point' :
                        props.measurement.lineMeasureEnabled ? 'length' :
                            props.measurement.areaMeasureEnabled ? 'area' :
                                props.measurement.bearingMeasureEnabled ? 'bearing' : undefined
                }, ...(props.measurement.geomType === 'Polygon' ? [{
                    value: (this.outputValues[this.measureTooltipElements.length - 2] || {}).value || 0,
                    position: pointObjectToArray(reproject(last(sketchCoords[0]), getProjectionCode(this.props.map), 'EPSG:4326')),
                    uom: props.uom,
                    type: 'length'
                }] : [])],
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
            const reprojectedCoordinatesIn4326 = this.reprojectedCoordinatesIn4326(coordinates);
            return Math.abs(getArea(new Polygon([reprojectedCoordinatesIn4326]), { projection: 'EPSG:4326' }));
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
        this.helpTooltip = new Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        this.props.map.addOverlay(this.helpTooltip);
    }
    /**
     * Creates a new measure tooltip
     */
    createMeasureTooltip = (offset = [0, -15]) => {
        if (!this.measureTooltipElements) {
            this.measureTooltipElements = [];
        }
        if (!this.measureTooltips) {
            this.measureTooltips = [];
        }
        if (!this.outputValues) {
            this.outputValues = [];
        }

        let measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';

        this.measureTooltipElements.push(measureTooltipElement);

        let measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset,
            positioning: 'bottom-center'
        });
        this.props.map.addOverlay(measureTooltip);

        this.measureTooltips.push(measureTooltip);
        this.outputValues.push(null);
    }
    /**
     * Create new segment length overlays
     */
    createSegmentLengthOverlay = () => {
        if (!this.segmentOverlayElements) {
            this.segmentOverlayElements = [];
        }
        if (!this.segmentOverlays) {
            this.segmentOverlays = [];
        }

        let segmentOverlayElement = document.createElement('div');
        segmentOverlayElement.style = '';

        this.segmentOverlayElements.push(segmentOverlayElement);

        let segmentOverlay = new Overlay({
            element: segmentOverlayElement,
            offset: [0, 0],
            positioning: 'center-center'
        });

        this.props.map.addOverlay(segmentOverlay);

        this.segmentOverlays.push(segmentOverlay);
    }

    formatLengthValue = (value, uom, isBearing) => {
        if (isBearing) {
            return getFormattedBearingValue(value);
        }
        const {label, unit} = uom && uom.length;
        const output = round(convertUom(value, "m", unit), 2);
        return this.props.formatNumber(output) + " " + (label);
    }

    formatAreaValue = (value, uom) => {
        const {label, unit} = uom && uom.area;
        const output = round(convertUom(value, "sqm", unit), 2);

        return this.props.formatNumber(output) + " " + label;
    }

    removeHelpTooltip = () => {
        if (this.helpTooltipElement && this.helpTooltipElement.parentNode) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
    }
    removeMeasureTooltips = () => {
        (this.measureTooltips || []).forEach(measureTooltip => {
            this.props.map.removeOverlay(measureTooltip);
        });
        let oldtooltips = document.getElementsByClassName("tooltip-static") || [];
        for (let i = 0; i < oldtooltips.length; i++) {
            oldtooltips[i].parentNode.removeChild(oldtooltips[i]);
        }
        oldtooltips = document.getElementsByClassName("tooltip-measure") || [];
        for (let i = 0; i < oldtooltips.length; i++) {
            oldtooltips[i].parentNode.removeChild(oldtooltips[i]);
        }

        this.measureTooltips = [];
        this.measureTooltipElements = [];
        this.outputValues = [];
    }
    removeSegmentLengthOverlays = () => {
        (this.segmentOverlays || []).forEach(segmentOverlay => {
            this.props.map.removeOverlay(segmentOverlay);
        });
        (this.segmentOverlayElements || []).forEach(element => {
            element.parentNode.removeChild(element);
        });

        this.segmentOverlays = [];
        this.segmentOverlayElements = [];
    }
}
