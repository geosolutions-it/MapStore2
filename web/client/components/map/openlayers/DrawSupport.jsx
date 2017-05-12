/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ol = require('openlayers');
const {concat} = require('lodash');

const assign = require('object-assign');

const DrawSupport = React.createClass({
    propTypes: {
        map: React.PropTypes.object,
        drawOwner: React.PropTypes.string,
        drawStatus: React.PropTypes.string,
        drawMethod: React.PropTypes.string,
        options: React.PropTypes.object,
        features: React.PropTypes.array,
        onChangeDrawingStatus: React.PropTypes.func,
        onEndDrawing: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            map: null,
            drawOwner: null,
            drawStatus: null,
            drawMethod: null,
            features: null,
            options: {
                stopAfterDrawing: true
            },
            onChangeDrawingStatus: () => {},
            onEndDrawing: () => {}
        };
    },
    componentWillReceiveProps(newProps) {
        switch (newProps.drawStatus) {
            case ("create"):
                this.addLayer(newProps);
                break;
            case ("start"):
                this.addDrawInteraction(newProps);
                break;
            case ("stop"):
                this.removeDrawInteraction();
                break;
            case ("replace"):
                this.replaceFeatures(newProps);
                break;
            case ("clean"):
                this.clean();
                break;
            default :
                return;
        }
    },
    render() {
        return null;
    },
    addLayer: function(newProps, addInteraction) {
        var source;
        var vector;
        this.geojson = new ol.format.GeoJSON();

        // create a layer to draw on
        source = new ol.source.Vector();
        vector = new ol.layer.Vector({
            source: source,
            zIndex: 1000000,
            style: new ol.style.Style({
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
            })
        });

        this.props.map.addLayer(vector);

        this.drawSource = source;
        this.drawLayer = vector;
        if (addInteraction) {
            this.addDrawInteraction(newProps);
        }

        this.addFeatures(newProps.features || []);
    },
    addFeatures(features) {
        features.forEach((geom) => {
            let geometry;

            switch (geom.type) {
                case "Point": {
                    geometry = new ol.geom.Point(geom.coordinates); break;
                }
                case "LineString": {
                    geometry = new ol.geom.LineString(geom.coordinates); break;
                }
                case "Polygon": {
                    geometry = new ol.geom.Polygon(geom.coordinates); break;
                }
                default: {
                    geometry = geom.radius && geom.center ?
                    ol.geom.Polygon.fromCircle(new ol.geom.Circle([geom.center.x, geom.center.y], geom.radius), 100) : new ol.geom.Polygon(geom.coordinates);
                }
            }
            const feature = new ol.Feature({
                geometry
            });

            this.drawSource.addFeature(feature);
        });
    },
    replaceFeatures: function(newProps) {
        if (!this.drawLayer) {
            this.addLayer(newProps, true);
        } else {
            this.drawSource.clear();
            this.addFeatures(newProps.features || []);
        }
    },
    addDrawInteraction: function(newProps) {
        let draw;
        let geometryType = newProps.drawMethod;

        if (!this.drawLayer) {
            this.addLayer(newProps);
        }

        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        let features = new ol.Collection();
        let drawBaseProps = {
            source: this.drawSource,
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
            }),
            features: features,
            condition: ol.events.condition.always
        };
        // Prepare the properties for the BBOX drawing
        let roiProps = {};
        switch (geometryType) {
            case "BBOX": {
                roiProps.type = "LineString";
                roiProps.maxPoints = 2;
                roiProps.geometryFunction = function(coordinates, geometry) {
                    let geom = geometry;
                    if (!geom) {
                        geom = new ol.geom.Polygon(null);
                    }
                    let start = coordinates[0];
                    let end = coordinates[1];
                    geom.setCoordinates(
                        [
                            [
                                start,
                                [start[0], end[1]],
                                end,
                                [end[0],
                                start[1]], start
                            ]
                    ]);
                    return geom;
                };
                break;
            }
            case "Circle": {
                roiProps.maxPoints = 100;
                roiProps.geometryFunction = ol.interaction.Draw.createRegularPolygon(roiProps.maxPoints);
                break;
            }
            case "Point": {
                roiProps.type = "Point";
                roiProps.geometryFunction = function(coordinates, geometry) {
                    let geom = geometry;
                    if (!geom) {
                        geom = new ol.geom.Point(null);
                    }
                    geom.setCoordinates(coordinates);
                    return geom;
                };
                break;
            }
            case "LineString": {
                roiProps.type = "LineString";
                roiProps.maxPoints = newProps.options.maxPoints;
                roiProps.geometryFunction = function(coordinates, geometry) {
                    let geom = geometry;
                    if (!geom) {
                        geom = new ol.geom.LineString(null);
                    }
                    geom.setCoordinates(coordinates);
                    return geom;
                };
                break;
            }
            case "Polygon": {
                roiProps.type = "Polygon";
                roiProps.geometryFunction = function(coordinates, geometry) {
                    let geom = geometry;
                    if (!geom) {
                        geom = new ol.geom.Polygon(null);
                    }
                    geom.setCoordinates(coordinates);
                    return geom;
                };
                break;
            }
            default : return {};
        }
        let drawProps = assign({}, drawBaseProps, roiProps);

        // create an interaction to draw with
        draw = new ol.interaction.Draw(drawProps);

        draw.on('drawstart', function(evt) {
            this.sketchFeature = evt.feature;
            this.drawSource.clear();
        }, this);

        draw.on('drawend', function(evt) {
            this.sketchFeature = evt.feature;
            let startingPoint = newProps.options.startingPoint;
            let drawnGeometry = this.sketchFeature.getGeometry();
            let radius;
            let extent = drawnGeometry.getExtent();
            let type = drawnGeometry.getType();
            let center = ol.extent.getCenter(drawnGeometry.getExtent());
            let coordinates = drawnGeometry.getCoordinates();
            if (startingPoint) {
                coordinates = concat(startingPoint, coordinates);
                drawnGeometry.setCoordinates(coordinates);
            }
            if (type === "Circle") {
                radius = Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2));
            }

            let geometry = {
                type,
                extent: extent,
                center: center,
                coordinates: type === "Polygon" ? coordinates[0].concat([coordinates[0][0]]) : coordinates,
                radius: radius,
                projection: this.props.map.getView().getProjection().getCode()
            };
            /*let modifyProps = assign({}, drawProps, {
                features: features,
                deleteCondition: () => false,
                condition: ol.events.condition.never // TODO customize this part to edit
            });
            let modify = new ol.interaction.Modify(modifyProps);
            this.props.map.addInteraction(modify);*/
            this.props.onEndDrawing(geometry, this.props.drawOwner);
            if (this.props.options.stopAfterDrawing) {
                this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner);
            }
        }, this);

        this.props.map.addInteraction(draw);
        this.drawInteraction = draw;
        this.drawSource.clear();
        if (newProps.features.length > 0 ) {
            this.addFeatures(newProps.features || []);
        }
    },
    removeDrawInteraction: function() {
        if (this.drawInteraction !== null) {
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.sketchFeature = null;
        }
    },
    clean: function() {
        this.removeDrawInteraction();

        if (this.drawLayer) {
            this.props.map.removeLayer(this.drawLayer);
            this.geojson = null;
            this.drawLayer = null;
            this.drawSource = null;
        }
    }
});

module.exports = DrawSupport;
