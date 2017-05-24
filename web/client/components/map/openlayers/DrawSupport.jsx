/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ol = require('openlayers');
const {concat, head} = require('lodash');

const assign = require('object-assign');
const uuid = require('uuid');

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
        if (this.drawLayer) {
            this.updateFeatureStyles(newProps.features);
        }

        if (!newProps.drawStatus && this.selectInteraction) {
            this.selectInteraction.getFeatures().clear();
        }

        switch (newProps.drawStatus) {
            case ("create"):
                this.addLayer(newProps);
                break;
            case ("start"):
                this.addInteractions(newProps);
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
            case ("cleanAndContinueDrawing"):
                this.cleanAndContinueDrawing();
                break;
            default :
                return;
        }
    },
    render() {
        return null;
    },
	updateFeatureStyles(features) {
        if (features && features.length > 0) {
            features.map(f => {
                if (f.style) {
                    let olFeature = this.toOlFeature(f);
                    if (olFeature) {
                        olFeature.setStyle(this.toOlStyle(f.style, f.selected));
                    }
                }
            });
        }
    },
    addLayer: function(newProps, addInteraction) {
        this.geojson = new ol.format.GeoJSON();
        this.drawSource = new ol.source.Vector();
        this.drawLayer = new ol.layer.Vector({
            source: this.drawSource,
            zIndex: 1000000,
            style: this.toOlStyle(newProps.style)
        });

        this.props.map.addLayer(this.drawLayer);

        if (addInteraction) {
            this.addInteractions(newProps);
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
                    geometry = geom.radius && geom.center ?
                    ol.geom.Polygon.fromCircle(new ol.geom.Circle([geom.center.x, geom.center.y], geom.radius), 100) : new ol.geom.Polygon(geom.coordinates);
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
    addDrawInteraction(drawMethod, startingPoint, maxPoints) {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(drawMethod, maxPoints));

        this.drawInteraction.on('drawstart', function(evt) {
            this.sketchFeature = evt.feature;
            if (this.selectInteraction) {
                this.selectInteraction.getFeatures().clear();
                this.selectInteraction.setActive(false);
            }
        }, this);

        this.drawInteraction.on('drawend', function(evt) {
            this.sketchFeature = evt.feature;
            this.sketchFeature.set('id', uuid.v1());
            const feature = this.fromOLFeature(this.sketchFeature, this.props.drawMethod, startingPoint);

            this.props.onEndDrawing(feature, this.props.drawOwner);
            if (this.props.options.stopAfterDrawing) {
                this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner, this.props.features.concat([feature]));
            }
            if (this.selectInteraction) {
                this.selectInteraction.setActive(true);
            }
        }, this);

        this.props.map.addInteraction(this.drawInteraction);
        this.setDoubleClickZoomEnabled(false);
    },
    drawPropertiesForGeometryType(geometryType, maxPoints) {
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
            features: new ol.Collection(),
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
                roiProps.maxPoints = maxPoints;
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
        return assign({}, drawBaseProps, roiProps);
    },
    setDoubleClickZoomEnabled(enabled) {
        let interactions = this.props.map.getInteractions();
        for (let i = 0; i < interactions.getLength(); i++) {
            let interaction = interactions.item(i);
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(enabled);
                break;
            }
        }
    },
    updateFeatureExtent(event) {
        const movedFeatures = event.features.getArray();
        const updatedFeatures = this.props.features.map((f) => {
            const moved = head(movedFeatures.filter((mf) => this.fromOLFeature(mf, this.props.drawMethod).id === f.id));
            return moved ? assign({}, f, {
                geometry: moved.geometry,
                center: moved.center,
                extent: moved.extent,
                coordinate: moved.coordinates,
                radius: moved.radius
            }) : f;
        });

        this.props.onChangeDrawingStatus('replace', this.props.drawMethod, this.props.drawOwner, updatedFeatures);
    },
    addInteractions: function(newProps) {
        if (!this.drawLayer) {
            this.addLayer(newProps);
        }
        this.addDrawInteraction(newProps.drawMethod, newProps.options.startingPoint, newProps.options.maxPoints);
        if (newProps.options && newProps.options.editEnabled) {
            this.addSelectInteraction();

            if (this.translateInteraction) {
                this.props.map.removeInteraction(this.translateInteraction);
            }

            this.translateInteraction = new ol.interaction.Translate({
              features: this.selectInteraction.getFeatures()
            });

            this.translateInteraction.on('translateend', this.updateFeatureExtent);
            this.props.map.addInteraction(this.translateInteraction);


            if (this.modifyInteraction) {
                this.props.map.removeInteraction(this.modifyInteraction);
            }

            this.modifyInteraction = new ol.interaction.Modify({
              features: this.selectInteraction.getFeatures()
            });

            this.props.map.addInteraction(this.modifyInteraction);
        }
        this.drawSource.clear();
        if (newProps.features.length > 0 ) {
            this.addFeatures(newProps.features || []);
        }
    },
    addSelectInteraction() {
        if (this.selectInteraction) {
            this.props.map.removeInteraction(this.selectInteraction);
        }

        this.selectInteraction = new ol.interaction.Select({ layers: [this.drawLayer] });

        this.selectInteraction.on('select', () => {
            let features = this.props.features.map(f => {
                let selectedFeatures = this.selectInteraction.getFeatures().getArray();
                const selected = selectedFeatures.reduce((previous, current) => {
                    return current.get('id') === f.id ? true : previous;
                }, false);

                return assign({}, f, { selected: selected });
            });

            this.props.onChangeDrawingStatus('select', null, this.props.drawOwner, features);
        });

        this.props.map.addInteraction(this.selectInteraction);
    },
    removeDrawInteraction: function() {
        if (this.drawInteraction) {
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.sketchFeature = null;
            setTimeout(() => this.setDoubleClickZoomEnabled(true), 250);
        }
    },
    removeInteractions: function() {
        this.removeDrawInteraction();

        if (this.selectInteraction) {
            this.props.map.removeInteraction(this.drawInteraction);
        }

        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
        }

        if (this.translateInteraction) {
            this.props.map.removeInteraction(this.translateInteraction);
        }
    },
    clean: function() {
        this.removeInteractions();

        if (this.drawLayer) {
            this.props.map.removeLayer(this.drawLayer);
            this.geojson = null;
            this.drawLayer = null;
            this.drawSource = null;
        }
    },
    cleanAndContinueDrawing: function() {
        if (this.drawLayer) {
            this.props.map.removeLayer(this.drawLayer);
            this.geojson = null;
            this.drawLayer = null;
            this.drawSource = null;
        }
    },
    fromOLFeature: function(feature, drawMethod, startingPoint) {
        const geometry = feature.getGeometry();
        const extent = geometry.getExtent();
        const center = ol.extent.getCenter(geometry.getExtent());
        let coordinates = geometry.getCoordinates();
        let radius;

        const type = geometry.getType();
        if (startingPoint) {
            coordinates = concat(startingPoint, coordinates);
            geometry.setCoordinates(coordinates);
        }

        if (drawMethod === "Circle") {
            radius = Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2));
        }

        return {
          id: feature.get('id'),
          type: type,
          extent: extent,
          center: center,
          coordinates,
          radius: radius,
          style: this.fromOlStyle(feature.getStyle()),
          projection: this.props.map.getView().getProjection().getCode()
        };
    },
    toOlFeature: function(feature) {
        return head(this.drawSource.getFeatures().filter((f) => f.get('id') === feature.id));
    },
    fromOlStyle(olStyle) {
        if (!olStyle) {
            return {};
        }

        return {
            fillColor: this.rgbToHex(olStyle.getFill().getColor()),
            fillTransparency: olStyle.getFill().getColor()[3],
            strokeColor: olStyle.getStroke().getColor(),
            strokeWidth: olStyle.getStroke().getWidth(),
            text: olStyle.getText().getText()
        };
    },
    toOlStyle: function(style, selected) {
        let color = style && style.fillColor ? style.fillColor : [255, 255, 255, 0.2];
        if (typeof color === 'string') {
            color = this.hexToRgb(color);
        }

        if (style && style.fillTransparency) {
            color[3] = style.fillTransparency;
        }

        let strokeColor = style && style.strokeColor ? style.strokeColor : '#ffcc33';
        if (selected) {
            strokeColor = '#4a90e2';
        }

        return new ol.style.Style({
            fill: new ol.style.Fill({
              color: color
            }),
            stroke: new ol.style.Stroke({
              color: strokeColor,
              width: style && style.strokeWidth ? style.strokeWidth : 2
            }),
            image: new ol.style.Circle({
              radius: style && style.strokeWidth ? style.strokeWidth : 5,
              fill: new ol.style.Fill({ color: style && style.strokeColor ? style.strokeColor : '#ffcc33' })
            }),
            text: new ol.style.Text({
              text: style && style.text ? style.text : '',
              fill: new ol.style.Fill({ color: style && style.strokeColor ? style.strokeColor : '#000' }),
              stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
              font: style && style.fontSize ? style.fontSize + 'px helvetica' : ''
            })
        });
    },
    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        }));
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    },
    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    },
    rgbToHex(rgb) {
        return "#" + this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }
});

module.exports = DrawSupport;
