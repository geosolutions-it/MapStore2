/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const ol = require('openlayers');
const {concat, head} = require('lodash');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const uuid = require('uuid');
const {isSimpleGeomType, getSimpleGeomType} = require('../../../utils/MapUtils');
const {reprojectGeoJson} = require('../../../utils/CoordinatesUtils');
const VectorStyle = require('./VectorStyle');

/**
 * Component that allows to draw and edit geometries as (Point, LineString, Polygon, Rectangle, Circle, MultiGeometries)
 * @class DrawSupport
 * @memberof components
 * @prop {object} map the map usedto drawing on
 * @prop {string} drawOwner the owner of the drawn features
 * @prop {string} drawStatus the status that allows to do different things. see componentWillReceiveProps method
 * @prop {string} drawMethod the method used to draw different geometries. can be Circle,BBOX, or a geomType from Point to MultiPolygons
 * @prop {object} options it contains the params used to enable the interactions or simply stop the DrawSupport after a ft is drawn
 * @prop {object[]} features an array of geojson features used as a starting point for drawing new shapes or edit them
 * @prop {func} onChangeDrawingStatus method use to change the status of the DrawSupport
 * @prop {func} onGeometryChanged when a features is edited or drawn this methos is fired
 * @prop {func} onDrawStopped action fired if the DrawSupport stops
 * @prop {func} onEndDrawing action fired when a shape is drawn
*/

class DrawSupport extends React.Component {
    static propTypes = {
        map: PropTypes.object,
        drawOwner: PropTypes.string,
        drawStatus: PropTypes.string,
        drawMethod: PropTypes.string,
        options: PropTypes.object,
        features: PropTypes.array,
        onChangeDrawingStatus: PropTypes.func,
        onGeometryChanged: PropTypes.func,
        onDrawStopped: PropTypes.func,
        onEndDrawing: PropTypes.func,
        style: PropTypes.object
    };

    static defaultProps = {
        map: null,
        drawOwner: null,
        drawStatus: null,
        drawMethod: null,
        features: null,
        options: {
            stopAfterDrawing: true
        },
        onChangeDrawingStatus: () => {},
        onGeometryChanged: () => {},
        onDrawStopped: () => {},
        onEndDrawing: () => {}
    };

/** Inside this lyfecycle method the status is checked to manipulate the behaviour of the DrawSupport.
 * @function componentWillReceiveProps
 * Here is the list of all status
 * create allows to create features
 * start allows to start drawing features
 * drawOrEdit allows to start drawing or editing the passed features or both
 * stop allows to stop drawing features
 * replace allows to replace all the features drawn by Drawsupport with new ones
 * clean it cleans the drawn features and stop the drawsupport
 * cleanAndContinueDrawing it cleares the drawn features and allows to continue drawing features
*/
    componentWillReceiveProps(newProps) {
        if (this.drawLayer) {
            this.updateFeatureStyles(newProps.features);
        }

        if (!newProps.drawStatus && this.selectInteraction) {
            this.selectInteraction.getFeatures().clear();
        }
        if ( this.props.drawStatus !== newProps.drawStatus || this.props.drawMethod !== newProps.drawMethod || this.props.features !== newProps.features) {
            switch (newProps.drawStatus) {
                case "create": this.addLayer(newProps); break;
                case "start":/* only starts draw*/ this.addInteractions(newProps); break;
                case "drawOrEdit": this.addDrawOrEditInteractions(newProps); break;
                case "stop": /* only stops draw*/ this.removeDrawInteraction(); break;
                case "replace": this.replaceFeatures(newProps); break;
                case "clean": this.clean(); break;
                case "cleanAndContinueDrawing": this.cleanAndContinueDrawing(); break;
                default : return;
            }
        }
    }

    render() {
        return null;
    }

    updateFeatureStyles = (features) => {
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
    };

    addLayer = (newProps, addInteraction) => {
        this.geojson = new ol.format.GeoJSON();
        this.drawSource = new ol.source.Vector();
        this.drawLayer = new ol.layer.Vector({
            source: this.drawSource,
            zIndex: 100000000,
            style: this.toOlStyle(newProps.style)
        });

        this.props.map.addLayer(this.drawLayer);

        if (addInteraction) {
            this.addInteractions(newProps);
        }

        this.addFeatures(newProps);
    };

    addFeatures = ({features, drawMethod, options}) => {
        features.forEach((g) => {
            let geometry = g;
            if (geometry.geometry) {
                geometry = reprojectGeoJson(geometry, this.props.options.featureProjection, this.props.map.getView().getProjection().getCode()).geometry;
            }
            const feature = new ol.Feature({
                geometry: this.createOLGeometry(geometry)
            });
            this.drawSource.addFeature(feature);
        });
        this.updateFeatureStyles(features);
        if (features.length === 0 && (options.editEnabled || options.drawEnabled)) {
            const feature = new ol.Feature({
                geometry: this.createOLGeometry({type: drawMethod, coordinates: null})
            });
            this.drawSource.addFeature(feature);
        }
    };

    replaceFeatures = (newProps) => {
        if (!this.drawLayer) {
            this.addLayer(newProps, true);
        } else {
            this.drawSource.clear();
            this.addFeatures(newProps);
            if (newProps.style) {
                this.drawLayer.setStyle(this.toOlStyle(newProps.style));
            }
        }
    };

    addDrawInteraction = (drawMethod, startingPoint, maxPoints) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(drawMethod, maxPoints, this.drawSource));
        this.props.map.disableEventListener('singleclick');
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
            const feature = this.fromOLFeature(this.sketchFeature, startingPoint);

            this.props.onEndDrawing(feature, this.props.drawOwner);
            if (this.props.options.stopAfterDrawing) {
                this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner, this.props.features.concat([feature]));
            }
            if (this.selectInteraction) {
                // TODO update also the selected features
                this.addSelectInteraction();
                this.selectInteraction.setActive(true);
            }
        }, this);

        this.props.map.addInteraction(this.drawInteraction);
        this.setDoubleClickZoomEnabled(false);
    };

    toMulti = (geometry) => {
        if (geometry.getType() === 'Point') {
            return new ol.geom.MultiPoint([geometry.getCoordinates()]);
        }
        return geometry;
    };
    handleDrawAndEdit = (drawMethod, startingPoint, maxPoints) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(getSimpleGeomType(drawMethod), maxPoints, isSimpleGeomType(drawMethod) ? this.drawSource : null ));
        this.props.map.disableEventListener('singleclick');
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

            if (!isSimpleGeomType(this.props.drawMethod)) {
                let geom = evt.feature.getGeometry();
                let g;
                let features = head(this.drawSource.getFeatures());
                if (features === undefined) {
                    g = this.toMulti(this.createOLGeometry({type: drawMethod, coordinates: null}));
                } else {
                    g = this.toMulti(head(this.drawSource.getFeatures()).getGeometry());
                }
                switch (this.props.drawMethod) {
                    case "MultiPoint": g.appendPoint(geom); break;
                    case "MultiLineString": g.appendLineString(geom); break;
                    case "MultiPolygon": {
                        let coords = geom.getCoordinates();
                        coords[0].push(coords[0][0]);
                        geom.setCoordinates(coords);
                        head(this.drawSource.getFeatures()).getGeometry().appendPolygon(geom);
                        break;
                    }
                    default: break;
                }
                this.sketchFeature.setGeometry(g);
            }
            const feature = this.fromOLFeature(this.sketchFeature, startingPoint);
            // this.addModifyInteraction();
            const geojsonFormat = new ol.format.GeoJSON();
            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(this.sketchFeature.clone()), this.props.map.getView().getProjection().getCode(), this.props.options.featureProjection);
            if (newFeature.geometry.type === "Polygon") {
                newFeature.geometry.coordinates[0].push(newFeature.geometry.coordinates[0][0]);
            }
            this.props.onGeometryChanged([newFeature], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "");

            this.props.onEndDrawing(feature, this.props.drawOwner);
            const newFeatures = isSimpleGeomType(this.props.drawMethod) ? this.props.features.concat([feature]) : [feature];
            if (this.props.options.stopAfterDrawing) {
                this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner, newFeatures);
            } else {
                this.props.onChangeDrawingStatus('replace', this.props.drawMethod, this.props.drawOwner, newFeatures, this.props.options);
            }
            if (this.selectInteraction) {
                // TODO update also the selected features
                this.addSelectInteraction();
                this.selectInteraction.setActive(true);
            }
        }, this);

        this.props.map.addInteraction(this.drawInteraction);
        this.setDoubleClickZoomEnabled(false);
    };

    drawPropertiesForGeometryType = (geometryType, maxPoints, source) => {
        let drawBaseProps = {
            source,
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
            case "Point": case "LineString": case "Polygon": case "MultiPoint": case "MultiLineString": case "MultiPolygon": {
                if (geometryType === "LineString") {
                    roiProps.maxPoints = maxPoints;
                }
                roiProps.type = geometryType;
                roiProps.geometryFunction = (coordinates, geometry) => {
                    let geom = geometry;
                    if (!geom) {
                        geom = this.createOLGeometry({type: geometryType, coordinates: null});
                    }
                    geom.setCoordinates(coordinates);
                    return geom;
                };
                break;
            }
            default : return {};
        }
        return assign({}, drawBaseProps, roiProps);
    };

    setDoubleClickZoomEnabled = (enabled) => {
        let interactions = this.props.map.getInteractions();
        for (let i = 0; i < interactions.getLength(); i++) {
            let interaction = interactions.item(i);
            if (interaction instanceof ol.interaction.DoubleClickZoom) {
                interaction.setActive(enabled);
                break;
            }
        }
    };

    updateFeatureExtent = (event) => {
        const movedFeatures = event.features.getArray();
        const updatedFeatures = this.props.features.map((f) => {
            const moved = head(movedFeatures.filter((mf) => this.fromOLFeature(mf).id === f.id));
            return moved ? assign({}, f, {
                geometry: moved.geometry,
                center: moved.center,
                extent: moved.extent,
                coordinate: moved.coordinates,
                radius: moved.radius
            }) : f;
        });

        this.props.onChangeDrawingStatus('replace', this.props.drawMethod, this.props.drawOwner, updatedFeatures);
    };

    addInteractions = (newProps) => {
        this.clean();
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
            this.addFeatures(newProps);
        }
    };

    addDrawOrEditInteractions = (newProps) => {
        this.clean();
        const newFeature = reprojectGeoJson(head(newProps.features), newProps.options.featureProjection, this.props.map.getView().getProjection().getCode());
        const props = assign({}, newProps, {features: newFeature.geometry ? [newFeature.geometry] : []});
        if (!this.drawLayer) {
            this.addLayer(props);
        } else {
            this.drawSource.clear();

            this.addFeatures(props);
        }
        if (newProps.options.editEnabled) {
            this.addModifyInteraction();
            // removed for polygon because of the issue https://github.com/geosolutions-it/MapStore2/issues/2378
            if (getSimpleGeomType(newProps.drawMethod) !== "Polygon") {
                this.addTranslateInteraction();
            }
        }

        if (newProps.options.drawEnabled) {
            this.handleDrawAndEdit(newProps.drawMethod, newProps.options.startingPoint, newProps.options.maxPoints);
        }
    };

    addSelectInteraction = () => {
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
    };

    removeDrawInteraction = () => {
        if (this.drawInteraction) {
            this.props.map.removeInteraction(this.drawInteraction);
            this.drawInteraction = null;
            this.sketchFeature = null;
            /** Map Singleclick event is dealyed by 250 ms see here
              * https://openlayers.org/en/latest/apidoc/ol.MapBrowserEvent.html#event:singleclick
              * This timeout prevents ol map to throw mapClick event that has alredy been managed
              * by the draw interaction.
             */
            setTimeout(() => this.props.map.enableEventListener('singleclick'), 500);
            setTimeout(() => this.setDoubleClickZoomEnabled(true), 250);
        }
    };

    removeInteractions = () => {
        this.removeDrawInteraction();

        if (this.selectInteraction) {
            this.props.map.enableEventListener('singleclick');
            this.props.map.removeInteraction(this.drawInteraction);
        }

        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
        }

        if (this.translateInteraction) {
            this.props.map.removeInteraction(this.translateInteraction);
        }
    };

    clean = () => {
        this.removeInteractions();

        if (this.drawLayer) {
            this.props.map.removeLayer(this.drawLayer);
            this.geojson = null;
            this.drawLayer = null;
            this.drawSource = null;
        }
    };

    cleanAndContinueDrawing = () => {
        if (this.drawLayer) {
            this.props.map.removeLayer(this.drawLayer);
            this.geojson = null;
            this.drawLayer = null;
            this.drawSource = null;
        }
    };

    fromOLFeature = (feature, startingPoint) => {
        let geometry = feature.getGeometry();
        let extent = geometry.getExtent();
        let center = ol.extent.getCenter(extent);
        let coordinates = geometry.getCoordinates();
        let radius;

        let type = geometry.getType();
        if (startingPoint) {
            coordinates = concat(startingPoint, coordinates);
            geometry.setCoordinates(coordinates);
        }

        if (this.props.drawMethod === "Circle") {
            radius = Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2));
        }

        return assign({}, {
            id: feature.get('id'),
            type,
            extent,
            center,
            coordinates,
            radius,
            style: this.fromOlStyle(feature.getStyle()),
            projection: this.props.map.getView().getProjection().getCode()
        });
    };

    toOlFeature = (feature) => {
        return head(this.drawSource.getFeatures().filter((f) => f.get('id') === feature.id));
    };

    fromOlStyle = (olStyle) => {
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
    };

    toOlStyle = (style, selected) => {
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

        if (style && (style.iconUrl || style.iconGlyph)) {
            return VectorStyle.getMarkerStyle({
                style
            });
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
    };

    hexToRgb = (hex) => {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        }));
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };

    componentToHex = (c) => {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    rgbToHex = (rgb) => {
        return "#" + this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    };

    addModifyInteraction = () => {
        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
        }
        this.modifyInteraction = new ol.interaction.Modify({
                features: new ol.Collection(this.drawLayer.getSource().getFeatures())
            });
        this.modifyInteraction.on('modifyend', (e) => {

            const geojsonFormat = new ol.format.GeoJSON();
            let features = e.features.getArray().map((f) => {
                return reprojectGeoJson(geojsonFormat.writeFeatureObject(f.clone()), this.props.map.getView().getProjection().getCode(), this.props.options.featureProjection);
            });

            this.props.onGeometryChanged(features, this.props.drawOwner);
        });
        this.props.map.addInteraction(this.modifyInteraction);
    }

    addTranslateInteraction = () => {
        if (this.translateInteraction) {
            this.props.map.removeInteraction(this.translateInteraction);
        }
        this.translateInteraction = new ol.interaction.Translate({
                features: new ol.Collection(this.drawLayer.getSource().getFeatures())
            });
        this.translateInteraction.on('translateend', (e) => {

            const geojsonFormat = new ol.format.GeoJSON();
            let features = e.features.getArray().map((f) => {
                return reprojectGeoJson(geojsonFormat.writeFeatureObject(f.clone()), this.props.map.getView().getProjection().getCode(), this.props.options.featureProjection);
            });

            this.props.onGeometryChanged(features, this.props.drawOwner);
        });
        this.props.map.addInteraction(this.translateInteraction);
    }

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
}
module.exports = DrawSupport;
