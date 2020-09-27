/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {round, get, isEqual, dropRight, last} from 'lodash';

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
        if (this.measureTooltipElements && newProps.measurement.showLabel !== this.props.measurement.showLabel) {
            for (let i = 0; i < this.measureTooltipElements.length; ++i) {
                if (this.measureTooltipElements[i]) {
                    this.measureTooltipElements[i].style.display = newProps.measurement.showLabel ? '' : 'none';
                }
            }
        }
        if (this.segmentOverlayElements && newProps.measurement.showSegmentLengths) {
            for (let i = 0; i < this.segmentOverlayElements.length; ++i) {
                if (this.segmentOverlayElements[i]) {
                    this.segmentOverlayElements[i].style.display = newProps.measurement.showSegmentLengths ? '' : 'none';
                }
            }
        }
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ||
            /* check also when a measure tool is enabled
             * if so the first condition does not match
             * because the old geomType is not changed (it was already defined as default)
             * and the measure tool is getting enabled
            */
            (newProps.measurement.geomType && (newProps.measurement.lineMeasureEnabled || newProps.measurement.areaMeasureEnabled || newProps.measurement.bearingMeasureEnabled) && !this.props.enabled && newProps.enabled) ) {
            this.restoreDrawState();
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
        if (newProps.measurement.updatedByUI && !isEqual(oldFt, newFt)) {
            this.updateFeatures(newProps);
        } else if (newProps.measurement.updatedByUI && !isEqual(this.props.uom, newProps.uom)) {
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
    updateFeatures = (props) => {
        const oldFeatures = this.source.getFeatures();

        this.removeMeasureTooltips();
        this.removeSegmentLengthOverlays();
        this.source.clear();
        this.textLabels = [];
        this.segmentLengths = [];

        const results = props.measurement.features.map((feature, index) => {
            if (get(feature, 'properties.disabled')) {
                return [feature, oldFeatures && oldFeatures[index] && oldFeatures[index].getGeometry()];
            }

            const geomType = feature.geometry.type;
            const featureValues = get(feature, 'properties.values', []);
            const isBearing = (featureValues[0] || {}).type === 'bearing' ||
                (!(featureValues[0] || {}).type && props.measurement.bearingMeasureEnabled);
            const coords = geomType === 'Polygon' ? feature.geometry.coordinates[0] : feature.geometry.coordinates;
            const reprojectedCoords = this.reprojectedCoordinatesFrom4326(coords);
            const geometryObj = geomType === 'Polygon' ? new Polygon([reprojectedCoords]) : new LineString(reprojectedCoords);

            const getMeasureValue = {
                'Point': () => coords,
                'LineString': () => isBearing ?
                    calculateAzimuth(coords[0], coords[1], 'EPSG:4326') :
                    calculateDistance(coords, props.measurement.lengthFormula),
                'Polygon': () => this.getArea(geometryObj)
            };

            const getFormattedValue = {
                'LineString': () => this.formatLengthValue(
                    isBearing ? calculateAzimuth(coords[0], coords[1], 'EPSG:4326') : calculateDistance(coords, props.measurement.lengthFormula),
                    props.uom,
                    isBearing,
                    props.measurement.trueBearing
                ),
                'Polygon': () => this.formatAreaValue(this.getArea(geometryObj), props.uom)
            };

            // recalculate segments
            if (!isBearing) {
                for (let i = 0; i < coords.length - 1; ++i) {
                    this.createSegmentLengthOverlay();

                    const segmentLengthBearing = calculateAzimuth(coords[i], coords[i + 1], 'EPSG:4326');
                    const segmentLengthDistance = calculateDistance([coords[i], coords[i + 1]], props.measurement.lengthFormula);
                    const bearingText = this.props.measurement && this.props.measurement.showLengthAndBearingLabel && " | " + getFormattedBearingValue(segmentLengthBearing, this.props.measurement.trueBearing) || "";
                    const overlayText = this.formatLengthValue(segmentLengthDistance, props.uom, isBearing) + bearingText;
                    last(this.segmentOverlayElements).innerHTML = overlayText;
                    last(this.segmentOverlays).setPosition(midpoint(reprojectedCoords[i], reprojectedCoords[i + 1], true));
                    this.textLabels[this.segmentOverlays.length - 1] = {
                        text: overlayText,
                        position: midpoint(coords[i], coords[i + 1], true)
                    };
                    this.segmentLengths[this.segmentOverlays.length - 1] = {
                        value: segmentLengthDistance,
                        type: isBearing ? 'bearing' : 'length'
                    };
                }
            }

            // recalculate measure values
            this.createMeasureTooltip();
            if (geomType === 'Polygon') {
                this.createMeasureTooltip();
            }

            this.tooltipCoord = geomType === 'LineString' ?
                last(reprojectedCoords) :
                this.tooltipCoord = geometryObj.getInteriorPoint().getCoordinates();

            last(this.measureTooltipElements).innerHTML = getFormattedValue[geomType]();
            last(this.measureTooltips).setPosition(this.tooltipCoord);
            this.outputValues[this.measureTooltipElements.length - 1] = {
                value: getMeasureValue[geomType](),
                type: geomType === 'Polygon' ? 'area' : isBearing ? 'bearing' : 'length'
            };

            if (geomType === 'Polygon') {
                const length = calculateDistance(coords, props.measurement.lengthFormula);

                this.measureTooltipElements[this.measureTooltipElements.length - 2].innerHTML =
                    this.formatLengthValue(length, props.uom, false);
                this.outputValues[this.measureTooltipElements.length - 2] = {
                    value: length,
                    type: 'length'
                };
                this.perimeterTooltipCoord = last(reprojectedCoords);
                this.measureTooltips[this.measureTooltipElements.length - 2].setPosition(this.perimeterTooltipCoord);
                this.measureTooltips[this.measureTooltipElements.length - 2].setOffset([0, -7]);
            }

            let newFeature = {...feature};
            newFeature.properties = feature.properties ? {...feature.properties} : {};
            newFeature.properties.values = [{
                value: (getMeasureValue[geomType] || (() => null))(),
                formattedValue: (getFormattedValue[geomType] || (() => null))(),
                position: geomType === 'Polygon' ?
                    pointObjectToArray(reproject(geometryObj.getInteriorPoint().getCoordinates(), getProjectionCode(props.map), 'EPSG:4326')) :
                    last(coords),
                type: (featureValues[0] || {}).type || // if type is not present then the feature was created in CoordinateEditor
                    (props.measurement.pointMeasureEnabled ? 'point' :
                        props.measurement.lineMeasureEnabled ? 'length' :
                            props.measurement.areaMeasureEnabled ? 'area' :
                                props.measurement.bearingMeasureEnabled ? 'bearing' : undefined)
            }, ...(geomType === 'Polygon' ? [{
                value: calculateDistance(coords, props.measurement.lengthFormula),
                formattedValue: this.formatLengthValue(calculateDistance(coords, props.measurement.lengthFormula), props.uom, false),
                position: last(coords),
                uom: props.uom,
                type: 'length'
            }] : [])];

            return [newFeature, geometryObj];
        });

        const newFeatures = results.map(result => result[0]);
        const geometries = results.map(result => result[1]);

        this.source.addFeatures(geometries.filter(g => !!g).map(geometry => new Feature({geometry})));
        const tempTextLabels = [...this.textLabels];
        newFeatures.map((newFeature) => {
            const isBearing = !!newFeature.properties?.values?.find(val=>val.type === 'bearing');
            newFeature.geometry = newFeature.geometry || {};
            const isPolygon = newFeature.geometry.type === "Polygon";
            const sliceVal = (isPolygon || isBearing) ? 0 : 1;
            const coordinates = isPolygon ? newFeature.geometry.coordinates[0] : newFeature.geometry.coordinates;
            const tempCoordinateLengthCurr = isPolygon ? coordinates.length - 1 : isBearing ? 0 : coordinates.length;
            newFeature.geometry.textLabels =  tempTextLabels.splice(0, tempCoordinateLengthCurr - sliceVal) || [];
            return newFeature;
        });

        this.props.changeGeometry(newFeatures);
        this.props.setTextLabels([...this.textLabels]);

        for (let i = 0; i < this.measureTooltipElements.length; ++i) {
            if (this.measureTooltipElements[i]) {
                this.measureTooltipElements[i].className = 'tooltip tooltip-static';
            }
        }
        for (let i = 0; i < this.segmentOverlayElements.length; ++i) {
            if (this.segmentOverlayElements[i]) {
                this.segmentOverlayElements[i].className = 'segment-overlay segment-overlay-static';
            }
        }
    };
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
            return this.formatLengthValue(value, props.uom, true, props.measurement.trueBearing);
        };

        this.outputValues = this.outputValues || [];
        this.segmentOverlayElements = this.segmentOverlayElements || [];
        this.textLabels = this.textLabels || [];

        for (let i = 0; i < this.outputValues.length; ++i) {
            if (!this.outputValues[i]) continue;
            this.measureTooltipElements[i].innerHTML = converter(this.outputValues[i]);
        }
        for (let i = 0; i < this.segmentOverlayElements.length; ++i) {
            if (!this.segmentOverlayElements[i]) continue;
            const text = converter(this.segmentLengths[i]);
            let textLabel = this.textLabels[i].text;
            const index = textLabel.indexOf(" | ");
            textLabel = textLabel.replace(textLabel.substring(0, index !== -1 ? index : textLabel.length), text);
            this.segmentOverlayElements[i].innerHTML = textLabel;
            this.textLabels[i].text = textLabel;
        }

        if (!this.drawing) {
            this.props.setTextLabels([...this.textLabels]);
        }

        const newFeatures = (props.measurement.features || []).map(feature => ({
            ...feature,
            ...(feature.properties ? {
                properties: {
                    ...feature.properties,
                    values: (feature.properties.values || []).map(value => ({
                        ...value,
                        formattedValue: converter({
                            type: value.type,
                            value: value.value
                        })
                    }))
                }
            } : {})
        }));

        this.props.changeGeometry(newFeatures);
    };

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

    saveDrawState = () => {
        this.savedDrawState = {
            textLabels: this.textLabels.slice(),
            segmentLengths: this.segmentLengths.slice(),
            measureTooltipsLength: this.measureTooltips?.length ?? 0,
            segmentOverlaysLength: this.segmentOverlays?.length ?? 0
        };
    };

    discardDrawState = () => {
        this.savedDrawState = null;
    };

    restoreDrawState = () => {
        if (!this.savedDrawState) {
            return;
        }

        this.textLabels = this.savedDrawState.textLabels;
        this.segmentLengths = this.savedDrawState.segmentLengths;

        for (let i = this.savedDrawState.measureTooltipsLength; i < this.measureTooltips.length; ++i) {
            this.props.map.removeOverlay(this.measureTooltips[i]);
            this.measureTooltipElements[i].parentNode.removeChild(this.measureTooltipElements[i]);
        }
        for (let i = this.savedDrawState.segmentOverlaysLength; i < this.segmentOverlays.length; ++i) {
            this.props.map.removeOverlay(this.segmentOverlays[i]);
            this.segmentOverlayElements[i].parentNode.removeChild(this.segmentOverlayElements[i]);
        }

        this.measureTooltips.splice(this.savedDrawState.measureTooltipsLength);
        this.measureTooltipElements.splice(this.savedDrawState.measureTooltipsLength);
        this.outputValues.splice(this.savedDrawState.measureTooltipsLength);
        this.segmentOverlays.splice(this.savedDrawState.segmentOverlaysLength);
        this.segmentOverlayElements.splice(this.savedDrawState.segmentOverlaysLength);

        this.curPolygonLength = undefined;
        this.curLineStringLength = undefined;
        this.savedDrawState = null;
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

            if (!this.props.measurement.disableLabels) {
                this.saveDrawState();

                this.createMeasureTooltip(this.props.measurement.geomType === 'Polygon' ? [0, 0] : undefined);
                if (this.props.measurement.geomType === 'Polygon') {
                    this.createMeasureTooltip();
                }

                if (this.props.measurement.geomType === 'Polygon') {
                    this.createSegmentLengthOverlay();
                }
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

                    if (!this.props.measurement.disableLabels) {
                        if (this.curPolygonLength === undefined || this.curPolygonLength < coords.length) {
                            this.createSegmentLengthOverlay();
                            this.curPolygonLength = coords.length;
                        }

                        if (coords.length > 2) {
                            segments.push(midpoint(coords[coords.length - 1], coords[coords.length - 2], true));
                            segments.push(midpoint(coords[coords.length - 2], coords[coords.length - 3], true));
                            for (let i = 0; i < segments.length; ++i) {
                                const segment = coords.slice(coords.length - 2 - i, coords.length - i);
                                const length = this.getLength(segment, this.props);
                                const bearingText = this.props.measurement && this.props.measurement.showLengthAndBearingLabel && " | " + getFormattedBearingValue(calculateAzimuth(segment[0], segment[1], getProjectionCode(this.props.map)), this.props.measurement.trueBearing) || "";
                                const text = this.formatLengthValue(length, this.props.uom, false) + bearingText;
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
                    }

                } else if (geom instanceof LineString) {
                    const coords = geom.getCoordinates();
                    const lastSegment = [coords[coords.length - 2], coords[coords.length - 1]];

                    if (!this.props.measurement.disableLabels && !this.props.measurement.bearingMeasureEnabled &&
                        (this.curLineStringLength === undefined || this.curLineStringLength < coords.length)) {
                        this.createSegmentLengthOverlay();
                        this.curLineStringLength = coords.length;
                    }

                    const length = this.getLength(coords, this.props);
                    const lastSegmentLength = this.getLength(lastSegment, this.props);

                    output = this.formatLengthValue(length, this.props.uom, this.props.measurement.geomType === 'Bearing', this.props.measurement.trueBearing);
                    this.tooltipCoord = geom.getLastCoordinate();

                    if (!this.props.measurement.disableLabels && !this.props.measurement.bearingMeasureEnabled) {
                        const bearingText = this.props.measurement && this.props.measurement.showLengthAndBearingLabel && " | " +
                            getFormattedBearingValue(calculateAzimuth(lastSegment[0], lastSegment[1], getProjectionCode(this.props.map)), this.props.measurement.trueBearing) || "";
                        const overlayText = this.formatLengthValue(lastSegmentLength, this.props.uom, this.props.measurement.geomType === 'Bearing', this.props.measurement.trueBearing) + bearingText;

                        last(this.segmentOverlayElements).innerHTML = overlayText;
                        last(this.segmentOverlays).setPosition(midpoint(lastSegment[0], lastSegment[1], true));
                        this.textLabels[this.segmentOverlays.length - 1] = {
                            text: overlayText,
                            position: pointObjectToArray(reproject(
                                midpoint(lastSegment[0], lastSegment[1], true), getProjectionCode(this.props.map), 'EPSG:4326'
                            ))
                        };
                        this.segmentLengths[this.segmentOverlays.length - 1] = {
                            value: lastSegmentLength,
                            type: this.props.measurement.geomType === 'Bearing' ? 'bearing' : 'length'
                        };
                    }

                    outputValue = {
                        value: length,
                        type: this.props.measurement.geomType === 'Bearing' ? 'bearing' : 'length'
                    };
                }
                if (!this.props.measurement.disableLabels) {
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
            const geometry = evt.feature.getGeometry();
            const coords = geometry.getCoordinates();
            const geojsonFormat = new GeoJSON();

            const getMeasureValue = {
                'Point': () => reproject(coords, getProjectionCode(this.props.map), 'EPSG:4326'),
                'LineString': () => this.getLength(coords, this.props),
                'Polygon': () => this.getArea(geometry),
                'Bearing': () => calculateAzimuth(coords[0], coords[1], getProjectionCode(this.props.map))
            };

            const getFormattedValue = {
                'LineString': () => this.formatLengthValue(this.getLength(coords, this.props), this.props.uom, false),
                'Polygon': () => this.formatAreaValue(this.getArea(geometry), this.props.uom),
                'Bearing': () => this.formatLengthValue(
                    calculateAzimuth(coords[0], coords[1], getProjectionCode(this.props.map)),
                    this.props.uom,
                    true,
                    this.props.measurement.trueBearing
                )
            };

            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(evt.feature.clone()), getProjectionCode(this.props.map), "EPSG:4326");
            newFeature.properties = newFeature.properties || {};
            newFeature.properties.values = [{
                value: (getMeasureValue[this.props.measurement.geomType] || (() => null))(),
                formattedValue: (getFormattedValue[this.props.measurement.geomType] || (() => null))(),
                position: pointObjectToArray(reproject(this.props.measurement.geomType === 'Polygon' ?
                    geometry.getInteriorPoint().getCoordinates() :
                    last(coords),
                getProjectionCode(this.props.map), 'EPSG:4326')),
                type: this.props.measurement.pointMeasureEnabled ? 'point' :
                    this.props.measurement.lineMeasureEnabled ? 'length' :
                        this.props.measurement.areaMeasureEnabled ? 'area' :
                            this.props.measurement.bearingMeasureEnabled ? 'bearing' : undefined
            }, ...(this.props.measurement.geomType === 'Polygon' ? [{
                value: (this.outputValues[this.measureTooltipElements.length - 2] || {}).value || 0,
                formattedValue: this.formatLengthValue(
                    (this.outputValues[this.measureTooltipElements.length - 2] || {}).value || 0, this.props.uom, false),
                position: pointObjectToArray(reproject(last(coords[0]), getProjectionCode(this.props.map), 'EPSG:4326')),
                uom: this.props.uom,
                type: 'length'
            }] : [])];


            let clonedNewFeature = {...newFeature};
            if (this.props.measurement.lineMeasureEnabled) {
                // Calculate arc
                let oldCoords = clonedNewFeature.geometry.coordinates;
                let newCoords = transformLineToArcs(oldCoords);

                if (!this.props.measurement.disableLabels) {
                    // the last overlay is a dummy
                    this.removeLastSegment();

                    // Generate correct textLabels and update segment overlays
                    for (let i = 0; i < oldCoords.length - 1; ++i) {
                        const middlePoint = newCoords[100 * i + 50];
                        if (middlePoint) {
                            this.textLabels[this.segmentOverlays.length - oldCoords.length + 1 + i].position = middlePoint;
                            this.segmentOverlays[this.segmentOverlays.length - oldCoords.length + 1 + i].setPosition(
                                pointObjectToArray(reproject(middlePoint, 'EPSG:4326', getProjectionCode(this.props.map)))
                            );
                        }
                    }
                }

                clonedNewFeature = set("geometry.coordinates", newCoords, clonedNewFeature);
            } else if (!this.props.measurement.disableLabels && this.props.measurement.areaMeasureEnabled) {
                // the one before the last is a dummy
                this.textLabels.splice(this.segmentOverlays.length - 2, 1);
                this.props.map.removeOverlay(this.segmentOverlays[this.segmentOverlays.length - 2]);
                this.segmentOverlayElements[this.segmentOverlays.length - 2].parentNode.removeChild(
                    this.segmentOverlayElements[this.segmentOverlays.length - 2]
                );
                this.segmentOverlayElements.splice(this.segmentOverlays.length - 2, 1);
                this.segmentOverlays.splice(this.segmentOverlays.length - 2, 1);
            }
            // this.props.setTextLabels(this.textLabels);
            const labelsLength = this.textLabels.length;
            newFeature.geometry = newFeature.geometry || {};
            newFeature.geometry.coordinates = newFeature.geometry.coordinates || [];
            const coordinatesLength = newFeature.geometry.coordinates.length;
            newFeature.geometry.textLabels = this.textLabels.slice(labelsLength - (newFeature.geometry.type === "Polygon" ? 3 : coordinatesLength - 1), labelsLength);
            this.props.changeGeometry([...currentFeatures, newFeature]);
            this.props.setTextLabels([...this.textLabels]);

            this.addFeature(clonedNewFeature);
            if (!this.props.measurement.disableLabels) {
                last(this.measureTooltipElements).className = 'tooltip tooltip-static';
                last(this.measureTooltips).setOffset([0, -7]);
                if (this.props.measurement.geomType === 'Polygon') {
                    this.measureTooltipElements[this.measureTooltipElements.length - 2].className = 'tooltip tooltip-static';
                    this.measureTooltips[this.measureTooltipElements.length - 2].setOffset([0, -7]);
                }
                for (let i = 0; i < this.segmentOverlayElements.length; ++i) {
                    if (this.segmentOverlayElements[i]) {
                        this.segmentOverlayElements[i].className = 'segment-overlay segment-overlay-static';
                    }
                }
            }
            unByKey(this.listener);

            this.curPolygonLength = undefined;
            this.curLineStringLength = undefined;

            this.discardDrawState();
        });

        this.props.map.addInteraction(draw);
        this.createHelpTooltip();

        this.drawInteraction = draw;
        this.measureLayer = this.vector;
    };

    removeLastSegment = () => {
        this.textLabels.pop();
        this.segmentLengths.pop();
        this.props.map.removeOverlay(last(this.segmentOverlays));
        last(this.segmentOverlayElements).parentNode.removeChild(last(this.segmentOverlayElements));
        this.segmentOverlays.pop();
        this.segmentOverlayElements.pop();
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

    updateMeasurementResults = (props) => {
        if (!this.sketchFeature) {
            return;
        }
        let sketchCoords = this.sketchFeature.getGeometry().getCoordinates();

        if (props.measurement.geomType === 'Bearing' && sketchCoords.length > 1) {
            // calculate the azimuth as base for bearing information
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
    };

    reprojectedCoordinatesFrom4326 = (coordinates) => {
        return coordinates.map((coordinate) => {
            let reprojectedCoordinate = reproject(coordinate, 'EPSG:4326', getProjectionCode(this.props.map));
            return [reprojectedCoordinate.x, reprojectedCoordinate.y];
        });
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
        measureTooltipElement.style.display = this.props.measurement.showLabel ? '' : 'none';

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
    createSegmentLengthOverlay = (hideOverlay) => {
        if (!this.segmentOverlayElements) {
            this.segmentOverlayElements = [];
        }
        if (!this.segmentOverlays) {
            this.segmentOverlays = [];
        }

        let segmentOverlayElement = document.createElement('div');
        segmentOverlayElement.className = 'segment-overlay';
        segmentOverlayElement.style.display = this.props.measurement.showSegmentLengths && !hideOverlay ? '' : 'none';

        this.segmentOverlayElements.push(segmentOverlayElement);

        let segmentOverlay = new Overlay({
            element: segmentOverlayElement,
            offset: [0, 0],
            positioning: 'center-center'
        });

        this.props.map.addOverlay(segmentOverlay);

        this.segmentOverlays.push(segmentOverlay);
    }

    formatLengthValue = (value, uom, isBearing, trueBearing = {}) => {
        if (isBearing) {
            return getFormattedBearingValue(value, trueBearing);
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
        if (this.helpTooltip) {
            this.props.map.removeOverlay(this.helpTooltip);
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
