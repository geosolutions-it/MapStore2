/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const ol = require('openlayers');
const {concat, head, find} = require('lodash');
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

// TODO FIX doc
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
        onTextChanged: PropTypes.func,
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
        onEndDrawing: () => {},
        onTextChanged: () => {}
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
                case "create": this.addLayer(newProps); break; // deprecated, not used (addLayer is automatically called by other commands when needed)
                case "start":/* only starts draw*/ this.addInteractions(newProps); break;
                case "drawOrEdit": this.addDrawOrEditInteractions(newProps); break;
                case "stop": /* only stops draw*/ this.removeDrawInteraction(); break;
                case "replace": this.replaceFeatures(newProps); break;
                case "clean": this.clean(); break;
                case "cleanAndContinueDrawing": this.clean(true); break;
                default : return;
            }
        }
    }

    render() {
        return null;
    }

    updateFeatureStyles = (features) => {
        if (features && features.length > 0) {
            features.forEach(f => {
                if (f.style) {
                    let olFeature = this.toOlFeature(f);
                    if (olFeature) {
                        olFeature.setStyle(f.style && f.style.type ? VectorStyle.getStyle(f) : this.toOlStyle(f.style, f.selected));
                    }
                }
            });
        }
    };

    addLayer = (newProps, addInteraction) => {
        let layerStyle = null;
        const styleType = this.convertGeometryTypeToStyleType(newProps.drawMethod);
        if (newProps.style) {
            layerStyle = newProps.style.type ? VectorStyle.getStyle(newProps, false, newProps.features[0] && newProps.features[0].properties && newProps.features[0].properties.textValues || [] ) : this.toOlStyle(newProps.style, null, newProps.features[0] && newProps.features[0].type);
        } else {
            const style = VectorStyle.defaultStyles[styleType] || VectorStyle.defaultStyles;
            layerStyle = VectorStyle.getStyle({ ...newProps, style: {...style, type: styleType }}, false, newProps.features[0] && newProps.features[0].properties && newProps.features[0].properties.textValues || [] );
        }
        this.geojson = new ol.format.GeoJSON();
        this.drawSource = new ol.source.Vector();
        this.drawLayer = new ol.layer.Vector({
            source: this.drawSource,
            zIndex: 100000000,
            style: layerStyle
        });

        this.props.map.addLayer(this.drawLayer);

        if (addInteraction) {
            this.addInteractions(newProps);
        }

        this.addFeatures(newProps);
    };

    addFeatures = ({features, drawMethod, options}) => {
        features.forEach((f) => {
            let geometry = f;
            if (geometry.geometry && geometry.geometry.type !== "GeometryCollection") {
                geometry = reprojectGeoJson(geometry, geometry.featureProjection, this.props.map.getView().getProjection().getCode()).geometry;
            }
            if (geometry.type !== "GeometryCollection") {
                const feature = new ol.Feature({
                    geometry: this.createOLGeometry(geometry.geometry ? geometry.geometry : geometry)
                });
                feature.set("textGeometriesIndexes", f.properties && f.properties.textGeometriesIndexes);
                feature.set("textValues", f.properties && f.properties.textValues);
                this.drawSource.addFeature(feature);
            }
        });

        if (features.length === 0 && (options.editEnabled || options.drawEnabled)) {
            const feature = new ol.Feature({
                geometry: this.createOLGeometry({type: drawMethod, coordinates: null})
            });
            this.drawSource.addFeature(feature);
        } else {
            if (features[0] && features[0].type === "GeometryCollection" ) {
                this.drawSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(features[0])
                });
                this.drawSource.getFeatures()[0].set("textGeometriesIndexes", features[0].properties && features[0].properties.textGeometriesIndexes);
                this.drawSource.getFeatures()[0].set("textValues", features[0].properties && features[0].properties.textValues);
                this.drawLayer.setSource(this.drawSource);
            }
            if (features[0] && features[0].geometry && features[0].geometry.type === "GeometryCollection" ) {
                let feature = reprojectGeoJson(features[0], options.featureProjection, this.props.map.getView().getProjection().getCode()).geometry;
                this.drawSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(feature)
                });
                this.drawSource.getFeatures()[0].set("textGeometriesIndexes", features[0].properties && features[0].properties.textGeometriesIndexes);
                this.drawSource.getFeatures()[0].set("textValues", features[0].properties && features[0].properties.textValues);
                this.drawLayer.setSource(this.drawSource);
            }
        }
        this.updateFeatureStyles(features);

    };

    replaceFeatures = (newProps) => {
        if (!this.drawLayer) {
            this.addLayer(newProps, true);
        } else {
            this.drawSource.clear();
            this.addFeatures(newProps);
            if (newProps.style) {
                /*let layerStyle = null;
                if (newProps.style) {
                    layerStyle = newProps.style.type ? VectorStyle.getStyle(newProps) : this.toOlStyle(newProps.style, null, newProps.features[0] && newProps.features[0].type);
                }*/
                this.drawLayer.setStyle(VectorStyle.getStyle(newProps, false, newProps.features[0] && newProps.features[0].properties && newProps.features[0].properties.textValues || [] ));
            }
        }
    };

    addDrawInteraction = (drawMethod, startingPoint, maxPoints) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(drawMethod, maxPoints, this.drawSource, this.props.style));
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
    handleDrawAndEdit = (drawMethod, startingPoint, maxPoints, style) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(getSimpleGeomType(drawMethod), maxPoints, isSimpleGeomType(drawMethod) ? this.drawSource : null, style ));
        this.props.map.disableEventListener('singleclick');
        this.drawInteraction.on('drawstart', function(evt) {
            this.sketchFeature = evt.feature;
            if (this.selectInteraction) {
                this.selectInteraction.getFeatures().clear();
                this.selectInteraction.setActive(false);
            }
        }, this);
        this.drawInteraction.on('drawend', function(evt) {
            // let textIndex;
            this.sketchFeature = evt.feature;
            this.sketchFeature.set('id', uuid.v1());
            if (drawMethod === "Text" || drawMethod === "MultiPoint") {
                let newDrawMethod = "MultiPoint";
                let drawnGeom = evt.feature.getGeometry();
                let previousGeometries;
                let drawnFeatures = this.drawLayer.getSource().getFeatures();
                let features = this.props.features;
                let newMultiGeom = this.toMulti(this.createOLGeometry({type: newDrawMethod, coordinates: [drawnGeom.getCoordinates()]}));
                let geomCollection;
                if (features.length === 1 && !features[0].geometry) {
                    previousGeometries = []; // this.toMulti(this.createOLGeometry({type: newDrawMethod, coordinates: null}));
                //    textIndex = 0;
                    geomCollection = new ol.geom.GeometryCollection([newMultiGeom]);
                } else {
                    previousGeometries = this.toMulti(head(drawnFeatures).getGeometry());
                    if (previousGeometries.getGeometries) {
                    //    textIndex = previousGeometries.getGeometries().length;
                        geomCollection = new ol.geom.GeometryCollection([...previousGeometries.getGeometries(), newMultiGeom]);
                    } else {
                    //    textIndex = 1;
                        geomCollection = new ol.geom.GeometryCollection([previousGeometries, newMultiGeom]);
                    }
                }
                this.sketchFeature.setGeometry(geomCollection);
            } else if (!isSimpleGeomType(drawMethod)) {
                let drawnGeom = evt.feature.getGeometry();
                let newMultiGeom;
                let previousGeometries;
                let geomCollection = null;
                let drawnFeatures = this.drawLayer.getSource().getFeatures();
                let features = this.props.features;
                if (features.length === 1 && !features[0].geometry) {
                    previousGeometries = this.toMulti(this.createOLGeometry({type: drawMethod, coordinates: null}));
                } else {
                    previousGeometries = this.toMulti(head(drawnFeatures).getGeometry());
                }

                // find geometry of same type
                let geometries = drawnFeatures.map(f => {
                    if (f.getGeometry().getType() === "GeometryCollection") {
                        return f.getGeometry().getGeometries();
                    }
                    return f.getGeometry();
                });
                if (drawnFeatures[0].getGeometry().getType() === "GeometryCollection") {
                    geometries = geometries[0];
                }
                let geomAlreadyPresent = find(geometries, (olGeom) => olGeom.getType() === drawMethod);
                if (geomAlreadyPresent) {
                    // append
                    this.appendToMultiGeometry(drawMethod, geomAlreadyPresent, drawnGeom);
                } else {
                    // create new multi geom
                    newMultiGeom = this.toMulti(this.createOLGeometry({type: drawMethod, coordinates: [drawnGeom.getCoordinates()]}));
                }

                if (drawnGeom.getType() !== getSimpleGeomType(previousGeometries.getType())) {
                    if (geomAlreadyPresent) {
                        let geoms = previousGeometries.getGeometries();
                        let newGeoms = geoms.map(gg => {
                            return gg.getType() === geomAlreadyPresent.getType() ? geomAlreadyPresent : gg;
                        });
                        geomCollection = new ol.geom.GeometryCollection(newGeoms);
                    } else {
                        if (previousGeometries.getType() === "GeometryCollection") {
                            geomCollection = new ol.geom.GeometryCollection([...previousGeometries.getGeometries(), newMultiGeom]);
                        } else {
                            if (drawMethod === "Text") {
                                geomCollection = new ol.geom.GeometryCollection([newMultiGeom]);
                            } else {
                                geomCollection = new ol.geom.GeometryCollection([previousGeometries, newMultiGeom]);
                            }
                        }
                    }
                    this.sketchFeature.setGeometry(geomCollection);
                } else {
                    this.sketchFeature.setGeometry(geomAlreadyPresent);
                }
            }
            let feature = this.fromOLFeature(this.sketchFeature, startingPoint);
            const vectorSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(feature)
              });
            this.drawLayer.setSource(vectorSource);
        //     let previousTexts = this.drawLayer.getSource().getFeatures()[0].get("textGeometriesIndexes") || [];

            // this.drawLayer.getSource().getFeatures()[0].set("textGeometriesIndexes", previousTexts.concat([textIndex]));
            // this.drawLayer.getSource().getFeatures()[0].set("textValues", previousTexts.concat(["dsfgsdgsgs"]));

            const geojsonFormat = new ol.format.GeoJSON();
            let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(this.sketchFeature.clone()), this.props.map.getView().getProjection().getCode(), this.props.options.featureProjection);
            if (newFeature.geometry.type === "Polygon") {
                newFeature.geometry.coordinates[0].push(newFeature.geometry.coordinates[0][0]);
            }

            this.props.onGeometryChanged([newFeature], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "", drawMethod === "Text");
            this.props.onEndDrawing(feature, this.props.drawOwner);
            feature = reprojectGeoJson(feature, this.props.map.getView().getProjection().getCode(), this.props.options.featureProjection);
            let properties = this.props.features[0].properties;
            if (drawMethod === "Text") {
                properties = assign({}, this.props.features[0].properties, {
                        textValues: (this.props.features[0].properties.textValues || []).concat(["."]),
                        textGeometriesIndexes: (this.props.features[0].properties.textGeometriesIndexes || []).concat([feature.geometry.geometries.length - 1])
                    });
            }
            const newFeatures = isSimpleGeomType(this.props.drawMethod) ?
                this.props.features.concat([{...feature, properties}]) :
                [{...feature, properties}];
            if (this.props.options.stopAfterDrawing) {
                this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner, newFeatures);
            } else {
                this.props.onChangeDrawingStatus('replace', this.props.drawMethod, this.props.drawOwner,
                    newFeatures.map((f) => reprojectGeoJson(f, this.props.options.featureProjection, this.props.map.getView().getProjection().getCode())),
                    assign({}, this.props.options, { featureProjection: this.props.map.getView().getProjection().getCode()}));
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
            case "Point": case "Text": case "LineString": case "Polygon": case "MultiPoint": case "MultiLineString": case "MultiPolygon": case "GeometryCollection": {
                if (geometryType === "LineString") {
                    roiProps.maxPoints = maxPoints;
                }
                let geomType = geometryType === "Text" ? "Point" : geometryType;
                roiProps.type = geomType;
                roiProps.geometryFunction = (coordinates, geometry) => {
                    let geom = geometry;
                    if (!geom) {
                        geom = this.createOLGeometry({type: geomType, coordinates: null});
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
        const props = assign({}, newProps, {features: newFeature.geometry ? [{...newFeature.geometry, properties: newFeature.properties}] : []});
        if (!this.drawLayer) {
            this.addLayer(props);
        } else {
            this.drawSource.clear();

            this.addFeatures(props);
        }
        if (newProps.options.editEnabled) {
            this.addModifyInteraction();
            // removed for polygon because of the issue https://github.com/geosolutions-it/MapStore2/issues/2378
            if (getSimpleGeomType(newProps.drawMethod) !== "Polygon" && getSimpleGeomType(newProps.drawMethod) !== "GeometryCollection") {
                this.addTranslateInteraction();
            }
        }

        if (newProps.options.drawEnabled) {
            this.handleDrawAndEdit(newProps.drawMethod, newProps.options.startingPoint, newProps.options.maxPoints, newProps.style);
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

    clean = (continueDrawing) => {
        if (!continueDrawing) {
            this.removeInteractions();
        }
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
        let radius;
        let type = geometry.getType();
        if (geometry.getCoordinates) {
            let coordinates = geometry.getCoordinates();
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
        }
        let geometries = geometry.getGeometries().map(g => {
            extent = g.getExtent();
            center = ol.extent.getCenter(extent);
            let coordinates = g.getCoordinates();
            if (startingPoint) {
                coordinates = concat(startingPoint, coordinates);
                g.setCoordinates(coordinates);
            }
            if (this.props.drawMethod === "Circle") {
                radius = Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2));
            }
            return assign({}, {
                id: feature.get('id'),
                type: g.getType(),
                extent,
                center,
                coordinates,
                radius,
                style: this.fromOlStyle(feature.getStyle()),
                projection: this.props.map.getView().getProjection().getCode()
            });
        });
        type = "GeometryCollection";
        return assign({}, {
            type: "Feature",
            id: feature.get('id'),
            style: this.fromOlStyle(feature.getStyle()),
            geometry: {
                type,
                geometries
            }
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

    toOlStyle = (style, selected, type) => {
        let fillColor = style && style.fillColor ? style.fillColor : [255, 255, 255, 0.2];
        if (typeof fillColor === 'string') {
            fillColor = this.hexToRgb(fillColor).concat([style.fillOpacity >= 0 && style.fillOpacity <= 1 ? style.fillOpacity : 1]);
        }

        if (style && style.fillTransparency) {
            fillColor[3] = style.fillTransparency;
        }

        let strokeColor = style && (style.strokeColor || style.color) ? style.strokeColor || style.color : '#ffcc33';
        if (selected) {
            strokeColor = '#4a90e2';
        }
        strokeColor = this.hexToRgb(strokeColor).concat([style && style.opacity || 1]);
        let newStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: fillColor
            }),
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: style && (style.strokeWidth || style.weight) ? style.strokeWidth || style.weight : 2
            }),
            text: new ol.style.Text({
                text: style && style.text ? style.text : '',
                fill: new ol.style.Fill({ color: style && (style.strokeColor || style.color) ? style.strokeColor || style.color : '#000' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
                font: style && style.fontSize ? style.fontSize + 'px helvetica' : ''
            })
        });


        if (type === "GeometryCollection") {
            return [...VectorStyle.getMarkerStyle({
                    style: { iconGlyph: 'comment',
                        iconShape: 'square',
                        iconColor: 'blue' }
                }), newStyle];
        }
        if (style && (style.iconUrl || style.iconGlyph)) {
            return VectorStyle.getMarkerStyle({
                style
            });
        }


        return newStyle;
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

            this.props.onGeometryChanged(features, this.props.drawOwner, false, "editing"); // TODO FIX THIS
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

            this.props.onGeometryChanged(features, this.props.drawOwner, this.props.drawOwner, false, this.props.drawMethod === "Text");
        });
        this.props.map.addInteraction(this.translateInteraction);
    }

    createOLGeometry = ({type, coordinates, radius, center, geometries}) => {
        if (type === "GeometryCollection") {
            return geometries && geometries.length ? new ol.geom.GeometryCollection(geometries.map(g => this.olGeomFromType({type: g.type}))) : new ol.geom.GeometryCollection([]);
        }
        return this.olGeomFromType({type, coordinates, radius, center});
    };

    olGeomFromType = ({type, coordinates, radius, center}) => {
        let geometry;
        switch (type) {
            case "Point": { geometry = new ol.geom.Point(coordinates ? coordinates : []); break; }
            case "LineString": { geometry = new ol.geom.LineString(coordinates ? coordinates : []); break; }
            case "MultiPoint": case "Text": { geometry = new ol.geom.MultiPoint(coordinates ? coordinates : []); break; }
            case "MultiLineString": { geometry = new ol.geom.MultiLineString(coordinates ? coordinates : []); break; }
            case "MultiPolygon": { geometry = new ol.geom.MultiPolygon(coordinates ? coordinates : []); break; }
            // defaults is Polygon
            default: { geometry = radius && center ?
                    ol.geom.Polygon.fromCircle(new ol.geom.Circle([center.x, center.y], radius), 100) : new ol.geom.Polygon(coordinates ? coordinates : []);
            }
        }
        return geometry;
    }
    convertGeometryTypeToStyleType = (geomType) => {
        switch (geomType) {
            case "BBOX": return "LineString";
            case "Circle": return "LineString";
            default: return geomType;
        }
    }

    appendToMultiGeometry = (drawMethod, geometry, drawnGeom) => {
        switch (drawMethod) {
            case "MultiPoint": geometry.appendPoint(drawnGeom); break;
            case "MultiLineString": geometry.appendLineString(drawnGeom); break;
            case "MultiPolygon": {
                let coords = drawnGeom.getCoordinates();
                coords[0].push(coords[0][0]);
                drawnGeom.setCoordinates(coords);
                geometry.appendPolygon(drawnGeom); break;
            }
            default: break;
        }
    }
}
module.exports = DrawSupport;
