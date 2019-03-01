/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const {round, isEqual, dropRight, slice} = require('lodash');
const assign = require('object-assign');
const ol = require('openlayers');
const wgs84Sphere = new ol.Sphere(6378137);
const {reprojectGeoJson, reproject, calculateAzimuth, calculateDistance, transformLineToArcs} = require('../../../utils/CoordinatesUtils');
const {convertUom, getFormattedBearingValue, isValidGeometry} = require('../../../utils/MeasureUtils');
const {set} = require('../../../utils/ImmutableUtils');
const {startEndPolylineStyle} = require('./VectorStyle');
const {getMessageById} = require('../../../utils/LocaleUtils');

class MeasurementSupport extends React.Component {
    static propTypes = {
        startEndPoint: PropTypes.object,
        map: PropTypes.object,
        projection: PropTypes.string,
        measurement: PropTypes.object,
        enabled: PropTypes.bool,
        uom: PropTypes.object,
        changeMeasurementState: PropTypes.func,
        resetGeometry: PropTypes.func,
        changeGeometry: PropTypes.func,
        updateOnMouseMove: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
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

    componentWillReceiveProps(newProps) {
        this.invalidCoordinates = [];
        if (newProps.measurement.geomType && newProps.measurement.geomType !== this.props.measurement.geomType ||
            /* check also when a default is set
             * if so the first condition does not match
             * because the old geomType is not changed (it was laready defined as default)
             * and the measure tool is getting enabled
            */
            (newProps.measurement.geomType && this.props.measurement.geomType && (newProps.measurement.lineMeasureEnabled || newProps.measurement.areaMeasureEnabled || newProps.measurement.bearingMeasureEnabled) && !this.props.enabled && newProps.enabled) ) {
            this.addDrawInteraction(newProps);
        }
        if (!newProps.measurement.geomType) {
            this.removeDrawInteraction();
        }
        /**
         * TODO if invalid coords are sent here just clear the source or draw only those are valid ?
         */
        let ft = newProps.measurement.feature;
        if (ft && ft.geometry && !isEqual(ft.geometry, this.props.measurement.feature.geometry) && !isValidGeometry(ft.geometry)) {
            // filtering out the invalid coords
            let props = set("measurement.feature.geometry.coordinates", (ft.geometry.type === "Polygon" ? ft.geometry.coordinates[0] : ft.geometry.coordinates)
                .filter((c, i) => {
                    const isValid = !isNaN(parseFloat(c[0])) && !isNaN(parseFloat(c[1]));
                    if (!isValid) {
                        this.invalidCoordinates.push({coord: c, index: i});
                    }
                    return isValid;
                }
            ), newProps);
            if (ft.geometry.type === "Polygon") {
                props = set("measurement.feature.geometry.coordinates", [props.measurement.feature.geometry.coordinates], props);
            }
            this.updateFeatures(props);
        }
        /**
         * this is needed to update the feature drawn by this tool and recalculate the measures,
         * although the recalculation should be moved in the reducer. so we can avoid to to weird stuff here if there is another plugin / component
         * that is going to update the coordinates via UI or any other action
         */
        if (!isEqual(this.props.measurement.feature, ft) && ft && ft.geometry && isValidGeometry(ft.geometry) && newProps.measurement.updatedByUI ||
        !isEqual(this.props.uom, newProps.uom) && ft && ft.geometry && isValidGeometry(ft.geometry) && newProps.measurement.updatedByUI) {

            this.updateFeatures(newProps);
        }
    }

    getPointCoordinate = (coordinate) => {
        return reproject(coordinate, this.props.projection, 'EPSG:4326');
    };

    render() {
        return null;
    }

    isPolygon = (feature) => {
        return feature.geometry.type === "Polygon";
    }
    updateFeatures = (props) => {
        let ft = props.measurement.feature;
        if (props.measurement.lineMeasureEnabled) {
            let newCoords = transformLineToArcs(props.measurement.feature.geometry.coordinates);
            ft = set("geometry.coordinates", newCoords, ft);
        }
        this.replaceFeatures([ft]);

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
        this.updateMeasurementResults(props, this.source.getFeatures()[0]);
    }

    replaceFeatures = (features) => {
        this.source = new ol.source.Vector();
        features.forEach((geoJSON) => {
            let geoJSONFT = geoJSON;
            if (geoJSONFT.geometry.type === "Polygon" && geoJSONFT.geometry.coordinates[0].length >= 3) {
                if (!isEqual(geoJSONFT.geometry.coordinates[0][0], geoJSONFT.geometry.coordinates[0][geoJSONFT.geometry.coordinates[0].length - 1])) {
                    geoJSONFT = set("geometry.coordinates", [geoJSONFT.geometry.coordinates[0].concat([geoJSONFT.geometry.coordinates[0][0]])], geoJSONFT);
                }
            }
            let geometry = reprojectGeoJson(geoJSONFT, "EPSG:4326", this.props.map.getView().getProjection().getCode()).geometry;
            const feature = new ol.Feature({
                geometry: this.createOLGeometry(geometry)
            });
            this.source.addFeature(feature);
        });
        this.measureLayer.setSource(this.source);
    };

    createOLGeometry = ({type, coordinates, radius, center}) => {
        let geometry;
        switch (type) {
            case "Point": { geometry = new ol.geom.Point(coordinates ? coordinates : []); break; }
            case "LineString": { geometry = new ol.geom.LineString(coordinates ? coordinates : []); break; }
            case "MultiPoint": { geometry = new ol.geom.MultiPoint(coordinates ? coordinates : []); break; }
            case "MultiLineString": { geometry = new ol.geom.MultiLineString(coordinates ? coordinates : []); break; }
            case "MultiPolygon": { geometry = new ol.geom.MultiPolygon(coordinates ? coordinates : []); break; }
            // defaults is Polygon
            default: { geometry = radius && center ?
                    ol.geom.Polygon.fromCircle(new ol.geom.Circle([center.x, center.y], radius), 100) : new ol.geom.Polygon(coordinates ? coordinates : []);
            }
        }
        return geometry;
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
            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(evt.feature.clone()), this.props.map.getView().getProjection().getCode(), "EPSG:4326");
            this.props.changeGeometry(newFeature);
            if (this.props.measurement.lineMeasureEnabled) {
                // Calculate arc
                let newCoords = transformLineToArcs(newFeature.geometry.coordinates);
                newFeature = set("geometry.coordinates", newCoords, newFeature);
            }
            this.replaceFeatures([newFeature]);
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

    updateMeasurementResults = (props, olFeatureUpdateByUI) => {
        let olFeatureToUse = this.sketchFeature;
        if (!this.sketchFeature) {
            return;
        }
        if (olFeatureUpdateByUI) {
            olFeatureToUse = olFeatureUpdateByUI;
            this.sketchFeature = olFeatureUpdateByUI;
        }
        let bearing = 0;
        let sketchCoords = olFeatureToUse.getGeometry().getCoordinates();

        if (props.measurement.geomType === 'Bearing' && sketchCoords.length > 1) {
            // calculate the azimuth as base for bearing information
            bearing = calculateAzimuth(sketchCoords[0], sketchCoords[1], props.projection);
            if (sketchCoords.length > 2) {
                this.drawInteraction.sketchCoords_ = [sketchCoords[0], sketchCoords[1], sketchCoords[0]];
                olFeatureToUse.getGeometry().setCoordinates([sketchCoords[0], sketchCoords[1]]);
                this.drawInteraction.sketchFeature_ = olFeatureToUse;
                this.drawInteraction.finishDrawing();
            }
        }
        const geojsonFormat = new ol.format.GeoJSON();
        let feature = reprojectGeoJson(geojsonFormat.writeFeatureObject(olFeatureToUse.clone()), props.map.getView().getProjection().getCode(), "EPSG:4326");

        // it will no longer create 100 points for arcs to put in the state
        let newMeasureState = assign({}, props.measurement,
            {
                point: props.measurement.geomType === 'Point' ?
                this.getPointCoordinate(sketchCoords) : null,
                len: props.measurement.geomType === 'LineString' ? calculateDistance(this.reprojectedCoordinates(sketchCoords), props.measurement.lengthFormula) : 0,
                area: props.measurement.geomType === 'Polygon' ?
                this.calculateGeodesicArea(olFeatureToUse.getGeometry().getLinearRing(0).getCoordinates()) : 0,
                bearing: props.measurement.geomType === 'Bearing' ? bearing : 0,
                lenUnit: props.measurement.lenUnit,
                areaUnit: props.measurement.areaUnit,
                updatedByUI: !!olFeatureUpdateByUI
            },
            // this should not change if the changes comes from ui i.e. olFeatureUpdateByUI
            !olFeatureUpdateByUI ? {
                feature: set("geometry.coordinates", this.drawing ? props.measurement.geomType === 'Polygon' ? [dropRight(feature.geometry.coordinates[0], feature.geometry.coordinates[0].length <= 2 ? 0 : 1)] : dropRight(feature.geometry.coordinates) : feature.geometry.coordinates, feature)} : {}
        );
        // checks for invalid coords that needs to be re-added
        if (this.invalidCoordinates.length) {
            let newCoords;
            this.invalidCoordinates.forEach(c => {
                let coords = props.measurement.geomType === 'Polygon' ? newMeasureState.feature.geometry.coordinates[0] : newMeasureState.feature.geometry.coordinates;
                newCoords = slice(coords, 0, c.index);
                newCoords = newCoords.concat([c.coord]);
                newCoords = newCoords.concat(slice(coords, c.index, coords.length));
                newMeasureState = set("feature.geometry.coordinates", props.measurement.geomType === 'Polygon' ? [newCoords] : newCoords, newMeasureState);
            });

            if (props.measurement.geomType === 'Polygon' && (!isEqual(newCoords[0], newCoords[newCoords.length - 1]))) {
                newCoords = newCoords.concat([newCoords[0]]);
                newMeasureState = set("feature.geometry.coordinates", [newCoords], newMeasureState);
            }
        }
        this.invalidCoordinates = [];
        this.props.changeMeasurementState(newMeasureState);
    };

    reprojectedCoordinates = (coordinates) => {
        return coordinates.map((coordinate) => {
            let reprojectedCoordinate = reproject(coordinate, this.props.projection, 'EPSG:4326');
            return [reprojectedCoordinate.x, reprojectedCoordinate.y];
        });
    };

    calculateGeodesicArea = (coordinates) => {
        let reprojectedCoordinates = this.reprojectedCoordinates(coordinates);
        return Math.abs(wgs84Sphere.geodesicArea(reprojectedCoordinates));
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
            const bearing = calculateAzimuth(sketchCoords[0], sketchCoords[1], props.projection);
            return getFormattedBearingValue(bearing);
        }
        const reprojectedCoords = this.reprojectedCoordinates(sketchCoords);
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
