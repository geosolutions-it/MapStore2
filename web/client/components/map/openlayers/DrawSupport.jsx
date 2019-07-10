/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const ol = require('openlayers');
const {concat, head, find, slice, omit, isArray, last, filter, isNil, castArray} = require('lodash');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const uuid = require('uuid');
const axios = require('axios');
const {isSimpleGeomType, getSimpleGeomType} = require('../../../utils/MapUtils');
const {reprojectGeoJson, calculateDistance, reproject} = require('../../../utils/CoordinatesUtils');
const {createStylesAsync} = require('../../../utils/VectorStyleUtils');
const wgs84Sphere = new ol.Sphere(6378137);
const {transformPolygonToCircle} = require('../../../utils/DrawSupportUtils');
const {isCompletePolygon} = require('../../../utils/AnnotationsUtils');
const VectorStyle = require('./VectorStyle');
const {parseStyles} = require('./VectorStyle');
const geojsonFormat = new ol.format.GeoJSON();

/**
 * Component that allows to draw and edit geometries as (Point, LineString, Polygon, Rectangle, Circle, MultiGeometries)
 Feature* @class DrawSupport
 * @memberof components
 * @prop {object} map the map usedto drawing on
 * @prop {string} drawOwner the owner of the drawn features
 * @prop {string} drawStatus the status that allows to do different things. see componentWillReceiveProps method
 * @prop {string} drawMethod the method used to draw different geometries. can be Circle,BBOX, or a geomType from Point to MultiPolygons
 * @prop {object} options it contains the params used to enable the interactions or simply stop the DrawSupport after a ft is drawn
 * @prop {boolean} options.geodesic enable to draw a geodesic geometry (supported only for Circle)
 * @prop {object[]} features an array of geojson features used as a starting point for drawing new shapes or edit them
 * @prop {function} onChangeDrawingStatus method use to change the status of the DrawSupport
 * @prop {function} onGeometryChanged when a features is edited or drawn this methos is fired
 * @prop {function} onDrawStopped action fired if the DrawSupport stops
 * @prop {function} onDrawingFeatures triggered when user clicks on a map in order to draw something
 * @prop {function} onSelectFeatures triggered when select interaction is enabled and user click on map in order to draw something, without using drawinteraction
 * @prop {function} onEndDrawing action fired when a shape is drawn
 * @prop {object} style
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
        onDrawingFeatures: PropTypes.func,
        onSelectFeatures: PropTypes.func,
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
        onDrawingFeatures: () => {},
        onSelectFeatures: () => {},
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
 * endDrawing as for 'replace' action allows to replace all the features in addition triggers end drawing action to store data in state
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
                case "updateStyle": this.updateOnlyFeatureStyles(newProps); break;
                case "clean": this.clean(); break;
                case "cleanAndContinueDrawing": this.clean(true); break;
                case "endDrawing": this.endDrawing(newProps); break;
                default : return;
            }
        }

    }
    getNewFeature = (newDrawMethod, coordinates, radius, center) => {
        return new ol.Feature({
            geometry: this.createOLGeometry({type: newDrawMethod, coordinates, radius, center})
        });
    }
    getMapCrs = () => {
        return this.props.map.getView().getProjection().getCode();
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
                        olFeature.setStyle(f.style ? VectorStyle.getStyle(f) : this.toOlStyle(f.style, f.selected));
                    }
                }
            });
        }
    };

    updateOnlyFeatureStyles = (newProps) => {
        if (this.drawLayer) {
            this.drawLayer.getSource().getFeatures().forEach(ftOl => {

                let features = head(newProps.features).features || newProps.features; // checking FeatureCollection or an array of simple features

                let originalGeoJsonFeature = find(features, ftTemp => ftTemp.properties.id === ftOl.getProperties().id);
                if (originalGeoJsonFeature) {
                    // only if it finds a feature drawn then update its style
                    let promises = createStylesAsync(castArray(originalGeoJsonFeature.style));
                    axios.all(promises).then((styles) => {
                        ftOl.setStyle(() => parseStyles({...originalGeoJsonFeature, style: styles}));
                    });
                }
            });
        }
    }

    addLayer = (newProps, addInteraction) => {
        let layerStyle = null;
        const styleType = this.convertGeometryTypeToStyleType(newProps.drawMethod);
        /**
            This is a style function that applies array of styles to the features.
            It takes the style from the features in the props being drawn because
            the style array from the geojson feature model is not passed to ol.feature
            @param {object} ftOl it is an ol.Feature object
        */
        layerStyle = (ftOl) => {
            let originalFeature = head(newProps.features) && find(head(newProps.features).features, ftTemp => ftTemp.properties.id === ftOl.getProperties().id) || null;
            if (originalFeature) {
                let promises = createStylesAsync(castArray(originalFeature.style));
                axios.all(promises).then((styles) => {
                    ftOl.setStyle(() => parseStyles({...originalFeature, style: styles}));
                });
            } else {
                // if the styles is not present in the feature it uses a default one based on the drawMethod basically
                return parseStyles({style: VectorStyle.defaultStyles[styleType]});
            }
        };
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
        let newFeature = head(newProps.features);
        if (newFeature && newFeature.features && newFeature.features.length) {
            // filtering invalid circles features or keep all when drawing is disabled
            const featuresFiltered = newFeature.features.filter(f => !f.properties.isCircle || f.properties.isCircle && !f.properties.canEdit || !newProps.options.drawEnabled);
            return this.addFeatures(assign({}, newProps, {features: [{...newFeature, features: featuresFiltered }]}));
        }
        return this.addFeatures(newProps);

    };

    addFeatures = ({features, drawMethod, options}) => {
        const mapCrs = this.getMapCrs();
        let feature;
        features.forEach((f) => {
            if (f.type === "FeatureCollection") {
                let featuresOL = (new ol.format.GeoJSON()).readFeatures(f);
                featuresOL = featuresOL.map(ft => transformPolygonToCircle(ft, mapCrs));
                this.drawSource = new ol.source.Vector({
                    features: featuresOL
                });
                this.drawLayer.setSource(this.drawSource);
            } else {
                let center = null;
                let geometry = f;
                if (geometry.geometry && geometry.geometry.type !== "GeometryCollection") {
                    geometry = reprojectGeoJson(geometry, geometry.featureProjection, mapCrs).geometry;
                }
                if (geometry.type !== "GeometryCollection") {
                    if (drawMethod === "Circle" && geometry && (geometry.properties && geometry.properties.center || geometry.center)) {
                        center = geometry.properties && geometry.properties.center ? reproject(geometry.properties.center, "EPSG:4326", mapCrs) : geometry.center;
                        center = [center.x, center.y];
                        feature = new ol.Feature({
                            geometry: this.createOLGeometry({type: "Circle", center, projection: "EPSG:3857", radius: geometry.properties && geometry.properties.radius || geometry.radius})
                        });
                    } else {
                        feature = new ol.Feature({
                            geometry: this.createOLGeometry(geometry.geometry ? geometry.geometry : {...geometry, ...geometry.properties, center })
                        });
                    }
                    feature.setProperties(f.properties);
                    this.drawSource.addFeature(feature);
                }
            }
        });

        // TODO CHECK THIS WITH FeatureCollection
        if (features.length === 0 && (options.editEnabled || options.drawEnabled)) {
            if (options.transformToFeatureCollection) {
                this.drawSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(
                        {
                            type: "FeatureCollection", features: []
                        })
                });
                this.drawLayer.setSource(this.drawSource);
            } else {
                feature = new ol.Feature({
                    geometry: this.createOLGeometry({type: drawMethod, coordinates: null})
                });
                this.drawSource.addFeature(feature);
            }
        } else {
            if (features[0] && features[0].type === "GeometryCollection" ) {
                // HERE IT ENTERS WITH EDIT
                this.drawSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(features[0])
                });

                let geoms = this.replacePolygonsWithCircles(this.drawSource.getFeatures()[0]);
                this.drawSource.getFeatures()[0].getGeometry().setGeometries(geoms);
                this.drawLayer.setSource(this.drawSource);
            }
            if (features[0] && features[0].geometry && features[0].geometry.type === "GeometryCollection" ) {
                // HERE IT ENTERS WITH REPLACE
                feature = reprojectGeoJson(features[0], options.featureProjection, mapCrs).geometry;
                this.drawSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(feature)
                });
                // TODO remove this props
                this.drawSource.getFeatures()[0].set("textGeometriesIndexes", features[0].properties && features[0].properties.textGeometriesIndexes);
                this.drawSource.getFeatures()[0].set("textValues", features[0].properties && features[0].properties.textValues);
                this.drawSource.getFeatures()[0].set("circles", features[0].properties && features[0].properties.circles);
                this.drawLayer.setSource(this.drawSource);
            }
        }
        this.updateFeatureStyles(features);
        return feature;
    };

    replaceFeatures = (newProps) => {
        let feature;
        if (!this.drawLayer) {
            feature = this.addLayer(newProps, newProps.options && newProps.options.drawEnabled || false);
        } else {
            this.drawSource.clear();
            feature = this.addFeatures(newProps);
            if (newProps.style) {
                this.drawLayer.setStyle((ftOl) => {
                    let originalFeature = find(head(newProps.features).features, ftTemp => ftTemp.properties.id === ftOl.getProperties().id);
                    if (originalFeature) {
                        let promises = createStylesAsync(castArray(originalFeature.style));
                        axios.all(promises).then((styles) => {
                            ftOl.setStyle(() => parseStyles({...originalFeature, style: styles}));
                        });
                    } else {
                        const styleType = this.convertGeometryTypeToStyleType(newProps.drawMethod);
                        // if the styles is not present in the feature it uses a default one based on the drawMethod basically
                        return parseStyles({style: VectorStyle.defaultStyles[styleType]});
                    }
                });
            }
        }
        return feature;
    };

    endDrawing = (newProps) => {
        const olFeature = this.replaceFeatures(newProps);
        if (olFeature) {
            const feature = this.fromOLFeature(olFeature);
            if (newProps.drawMethod === "Circle" && newProps && newProps.features && newProps.features.length && newProps.features[0] && newProps.features[0].radius >= 0) {
                // this prevents the radius coming from `fromOLFeature` to override the radius set from an external tool
                // this is because `endDrawing` need to impose the radius value, without any re-calculation or approximation
                feature.radius = newProps.features[0].radius;
            }
            this.props.onEndDrawing(feature, newProps.drawOwner);
        }
    }

    addDrawInteraction = (drawMethod, startingPoint, maxPoints, newProps) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(drawMethod, maxPoints, this.drawSource, newProps));
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
            let feature;
            if (this.props.drawMethod === "Circle" && this.sketchFeature.getGeometry().getType() === "Circle") {
                const radius = this.sketchFeature.getGeometry().getRadius();
                const center = this.sketchFeature.getGeometry().getCenter();
                this.sketchFeature.setGeometry(this.polygonFromCircle(center, radius));
            }
            feature = this.fromOLFeature(this.sketchFeature, startingPoint);

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
    handleDrawAndEdit = (drawMethod, startingPoint, maxPoints, newProps) => {
        if (this.drawInteraction) {
            this.removeDrawInteraction();
        }
        this.drawInteraction = new ol.interaction.Draw(this.drawPropertiesForGeometryType(getSimpleGeomType(drawMethod), maxPoints, isSimpleGeomType(drawMethod) ? this.drawSource : null, newProps ));
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
            let drawnGeom = this.sketchFeature.getGeometry();
            let drawnFeatures = this.drawLayer.getSource().getFeatures();
            let previousGeometries;
            let features = this.props.features;
            let geomCollection;
            let newDrawMethod;
            if (this.props.options.transformToFeatureCollection) {
                let newFeature;
                if (drawMethod === "Circle") {
                    newDrawMethod = "Polygon";
                    const radius = drawnGeom.getRadius();
                    let center = drawnGeom.getCenter();
                    const coordinates = this.polygonCoordsFromCircle(center, radius);
                    newFeature = this.getNewFeature(newDrawMethod, coordinates);
                    // TODO verify center is projected in 4326 and is an array
                    center = reproject(center, this.getMapCrs(), "EPSG:4326", false);
                    const originalId = newProps && newProps.features && newProps.features.length && newProps.features[0] && newProps.features[0].features && newProps.features[0].features.length && newProps.features[0].features.filter(f => f.properties.isDrawing)[0].properties.id || this.sketchFeature.get("id");
                    // this.sketchFeature.set('id', originalId);
                    newFeature.setProperties({isCircle: true, radius, center: [center.x, center.y], id: originalId});
                } else if (drawMethod === "Polygon") {
                    newDrawMethod = this.props.drawMethod;
                    let coordinates = drawnGeom.getCoordinates();
                    coordinates[0].push(coordinates[0][0]);
                    newFeature = this.getNewFeature(newDrawMethod, coordinates);
                } else {
                    newDrawMethod = (drawMethod === "Text") ? "Point" : this.props.drawMethod;
                    let coordinates = drawnGeom.getCoordinates();
                    newFeature = this.getNewFeature(newDrawMethod, coordinates);
                    if (drawMethod === "Text") {
                        newFeature.setProperties({isText: true, valueText: "."});
                    }
                }
                // drawnFeatures is array of ol.Feature
                const previousFeatures = drawnFeatures.length >= 1 ? [...this.replaceCirclesWithPolygonsInFeatureColl(drawnFeatures)] : [];
                if (!newFeature.getProperties().id) {
                    newFeature.setProperties({id: uuid.v1()});
                }
                const newFeatures = [...previousFeatures, newFeature];
                // create FeatureCollection externalize as function
                let newFeatureColl = geojsonFormat.writeFeaturesObject(newFeatures);
                const vectorSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(newFeatureColl)
                  });
                this.drawLayer.setSource(vectorSource);
                let feature = reprojectGeoJson(newFeatureColl, this.getMapCrs(), "EPSG:4326");
                this.props.onGeometryChanged([feature], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "", drawMethod === "Text", drawMethod === "Circle");
                this.props.onEndDrawing(feature, this.props.drawOwner);
                this.props.onDrawingFeatures([last(feature.features)]);

            } else {
                if (drawMethod === "Circle") {
                    newDrawMethod = "Polygon";
                    const radius = drawnGeom.getRadius();
                    const center = drawnGeom.getCenter();
                    const coordinates = this.polygonCoordsFromCircle(center, radius);
                    const newMultiGeom = this.toMulti(this.createOLGeometry({type: newDrawMethod, coordinates}));
                    if (features.length === 1 && features[0] && !features[0].geometry) {
                        previousGeometries = [];
                        geomCollection = new ol.geom.GeometryCollection([newMultiGeom]);
                    } else {
                        previousGeometries = this.toMulti(head(drawnFeatures).getGeometry());
                        if (previousGeometries.getGeometries) {
                            // transform also previous circles into polygon
                            const geoms = this.replaceCirclesWithPolygons(head(drawnFeatures));
                            geomCollection = new ol.geom.GeometryCollection([...geoms, newMultiGeom]);
                        } else {
                            geomCollection = new ol.geom.GeometryCollection([previousGeometries, newMultiGeom]);
                        }
                    }
                    this.sketchFeature.setGeometry(geomCollection);

                } else if (drawMethod === "Text" || drawMethod === "MultiPoint") {
                    let coordinates = drawnGeom.getCoordinates();
                    newDrawMethod = "MultiPoint";
                    let newMultiGeom = this.toMulti(this.createOLGeometry({type: newDrawMethod, coordinates: [coordinates]}));
                    if (features.length === 1 && !features[0].geometry) {
                        previousGeometries = [];
                        geomCollection = new ol.geom.GeometryCollection([newMultiGeom]);
                    } else {
                        previousGeometries = this.toMulti(head(drawnFeatures).getGeometry());
                        if (previousGeometries.getGeometries) {
                            let geoms = this.replaceCirclesWithPolygons(head(drawnFeatures));
                            geomCollection = new ol.geom.GeometryCollection([...geoms, newMultiGeom]);
                        } else {
                            geomCollection = new ol.geom.GeometryCollection([previousGeometries, newMultiGeom]);
                        }
                    }
                    this.sketchFeature.setGeometry(geomCollection);
                } else if (!isSimpleGeomType(drawMethod)) {
                    let newMultiGeom;
                    geomCollection = null;
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
                        let geoms = head(drawnFeatures).getGeometry().getGeometries ? this.replaceCirclesWithPolygons(head(drawnFeatures)) : [];
                        if (geomAlreadyPresent) {
                            let newGeoms = geoms.map(gg => {
                                return gg.getType() === geomAlreadyPresent.getType() ? geomAlreadyPresent : gg;
                            });
                            geomCollection = new ol.geom.GeometryCollection(newGeoms);
                        } else {
                            if (previousGeometries.getType() === "GeometryCollection") {
                                geomCollection = new ol.geom.GeometryCollection([...geoms, newMultiGeom]);
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
                let properties = this.props.features[0].properties;
                if (drawMethod === "Text") {
                    properties = assign({}, this.props.features[0].properties, {
                            textValues: (this.props.features[0].properties.textValues || []).concat(["."]),
                            textGeometriesIndexes: (this.props.features[0].properties.textGeometriesIndexes || []).concat([this.sketchFeature.getGeometry().getGeometries().length - 1])
                        });
                }
                if (drawMethod === "Circle") {
                    properties = assign({}, properties, {
                            circles: (this.props.features[0].properties.circles || []).concat([this.sketchFeature.getGeometry().getGeometries().length - 1])
                        });
                }
                let feature = this.fromOLFeature(this.sketchFeature, startingPoint, properties);
                const vectorSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(feature)
                  });
                this.drawLayer.setSource(vectorSource);

                let newFeature = reprojectGeoJson(geojsonFormat.writeFeatureObject(this.sketchFeature.clone()), this.getMapCrs(), "EPSG:4326");
                if (newFeature.geometry.type === "Polygon") {
                    newFeature.geometry.coordinates[0].push(newFeature.geometry.coordinates[0][0]);
                }

                this.props.onGeometryChanged([newFeature], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "", drawMethod === "Text", drawMethod === "Circle");
                this.props.onEndDrawing(feature, this.props.drawOwner);
                feature = reprojectGeoJson(feature, this.getMapCrs(), "EPSG:4326");

                const newFeatures = isSimpleGeomType(this.props.drawMethod) ?
                    this.props.features.concat([{...feature, properties}]) :
                    [{...feature, properties}];
                if (this.props.options.stopAfterDrawing) {
                    this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner, newFeatures);
                } else {
                    this.props.onChangeDrawingStatus('replace', this.props.drawMethod, this.props.drawOwner,
                        newFeatures.map((f) => reprojectGeoJson(f, "EPSG:4326", this.getMapCrs())),
                        assign({}, this.props.options, { featureProjection: this.getMapCrs()}));
                }
                if (this.selectInteraction) {
                    // TODO update also the selected features
                    this.addSelectInteraction();
                    this.selectInteraction.setActive(true);
                }
            }

        }, this);

        this.props.map.addInteraction(this.drawInteraction);
        this.setDoubleClickZoomEnabled(false);
    };

    drawPropertiesForGeometryType = (geometryType, maxPoints, source, newProps = {}) => {
        let drawBaseProps = {
            source: this.drawSource || source,
            type: /** @type {ol.geom.GeometryType} */ geometryType,
            style: geometryType === "Marker" ? VectorStyle.getMarkerStyle(newProps.style) : new ol.style.Style({
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
                if (newProps.options && newProps.options.geodesic) {
                    roiProps.geometryFunction = (coordinates, geometry) => {
                        let geom = geometry;
                        if (!geom) {
                            geom = new ol.geom.Polygon(null);
                            geom.setProperties({geodesicCenter: [...coordinates[0]]}, true);
                        }
                        let projection = this.props.map.getView().getProjection().getCode();
                        let wgs84Coordinates = [...coordinates].map((coordinate) => {
                            return this.reprojectCoordinatesToWGS84(coordinate, projection);
                        });
                        let radius = calculateDistance(wgs84Coordinates, 'haversine');
                        let coords = ol.geom.Polygon.circular(wgs84Sphere, wgs84Coordinates[0], radius, roiProps.maxPoints).clone().transform('EPSG:4326', projection).getCoordinates();
                        geom.setCoordinates(coords);
                        return geom;
                    };
                } else {
                    roiProps.type = geometryType;
                }
                break;
            }
            case "Marker": case "Point": case "Text": case "LineString": case "Polygon": case "MultiPoint": case "MultiLineString": case "MultiPolygon": case "GeometryCollection": {
                if (geometryType === "LineString") {
                    roiProps.maxPoints = maxPoints;
                }
                let geomType = geometryType === "Text" || geometryType === "Marker" ? "Point" : geometryType;
                roiProps.type = geomType;
                roiProps.geometryFunction = (coordinates, geometry) => {
                    let geom = geometry;
                    if (!geom) {
                        geom = this.createOLGeometry({type: geomType, coordinates: null, options: newProps.options});
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
        this.addDrawInteraction(newProps.drawMethod, newProps.options.startingPoint, newProps.options.maxPoints, newProps);
        if (newProps.options && newProps.options.editEnabled) {
            this.addSelectInteraction();
            if (this.translateInteraction) {
                this.props.map.removeInteraction(this.translateInteraction);
            }

            this.translateInteraction = new ol.interaction.Translate({
                features: this.selectInteraction.getFeatures()
            });
            this.translateInteraction.setActive(false);

            this.translateInteraction.on('translateend', this.updateFeatureExtent);
            this.props.map.addInteraction(this.translateInteraction);

            this.addTranslateListener();
            if (this.modifyInteraction) {
                this.props.map.removeInteraction(this.modifyInteraction);
            }

            this.modifyInteraction = new ol.interaction.Modify({
                features: this.selectInteraction.getFeatures(),
                condition: (e) => {
                    return ol.events.condition.primaryAction(e) && !ol.events.condition.altKeyOnly(e);
                }
            });

            this.props.map.addInteraction(this.modifyInteraction);
        }
        this.drawSource.clear();
        if (newProps.features.length > 0 ) {
            this.addFeatures(newProps);
        }
    };
    addSingleClickListener = (singleclickCallback, props) => {
        let evtKey = props.map.on('singleclick', singleclickCallback);
        return evtKey;
    };


    addDrawOrEditInteractions = (newProps) => {
        if (this.state && this.state.keySingleClickCallback) {
            ol.Observable.unByKey(this.state.keySingleClickCallback);
        }
        const singleClickCallback = (event) => {
            if (this.drawSource && newProps.options) {
                let previousFeatures = this.drawSource.getFeatures();
                let previousFtIndex = 0;

                const previousFt = previousFeatures && previousFeatures.length && previousFeatures.filter((f, i) => {
                    if (f.getProperties().canEdit) {
                        previousFtIndex = i;
                    }
                    return f.getProperties().canEdit;
                })[0] || null;
                const previousCoords = previousFt && previousFt.getGeometry() && previousFt.getGeometry().getCoordinates && previousFt.getGeometry().getCoordinates() || [];
                let actualCoords = [];
                let olFt;
                let newDrawMethod = newProps.drawMethod;
                switch (newDrawMethod) {
                    case "Polygon": {
                        if (previousCoords.length) {
                            if (isCompletePolygon(previousCoords)) {
                                // insert at penultimate position
                                actualCoords = slice(previousCoords[0], 0, previousCoords[0].length - 1);
                                actualCoords = actualCoords.concat([event.coordinate]);
                                actualCoords = [actualCoords.concat([previousCoords[0][0]])];
                            } else {
                                // insert at ultimate position if more than 2 point
                                actualCoords = previousCoords[0].length > 1 ? [[...previousCoords[0], event.coordinate, previousCoords[0][0] ]] : [[...previousCoords[0], event.coordinate ]];
                            }
                        } else {
                            // insert at first position
                            actualCoords = [[event.coordinate]];
                        }
                        olFt = this.getNewFeature(newDrawMethod, actualCoords);
                        olFt.setProperties(omit(previousFt && previousFt.getProperties() || {}, "geometry"));
                        break;
                    }
                    case "LineString": case "MultiPoint": {
                        actualCoords = previousCoords.length ? [...previousCoords, event.coordinate] : [event.coordinate];
                        olFt = this.getNewFeature(newDrawMethod, actualCoords);
                        olFt.setProperties(omit(previousFt && previousFt.getProperties() || {}, "geometry"));
                    }
                     break;
                    case "Circle": {
                        newDrawMethod = "Polygon";
                        const radius = previousFt && previousFt.getProperties() && previousFt.getProperties().radius || 10000;
                        let center = event.coordinate;
                        const coords = this.polygonCoordsFromCircle(center, 100);
                        olFt = this.getNewFeature(newDrawMethod, coords);
                        // TODO verify center is projected in 4326 and is an array
                        center = reproject(center, this.getMapCrs(), "EPSG:4326", false);
                        olFt.setProperties(omit(previousFt && previousFt.getProperties() || {}, "geometry"));
                        olFt.setProperties({isCircle: true, radius, center: [center.x, center.y]});
                        break;
                    }
                    case "Text": {
                        newDrawMethod = "Point";
                        olFt = this.getNewFeature(newDrawMethod, event.coordinate);
                        olFt.setProperties(omit(previousFt && previousFt.getProperties() || {}, "geometry"));
                        olFt.setProperties({isText: true, valueText: previousFt && previousFt.getProperties() && previousFt.getProperties().valueText || newProps.options.defaultTextAnnotation || "New" });
                        break;
                    }
                    // point
                    default: {
                        actualCoords = event.coordinate;
                        olFt = this.getNewFeature(newDrawMethod, actualCoords);
                        olFt.setProperties(omit(previousFt && previousFt.getProperties() || {}, "geometry"));
                    }
                }

                let drawnFtWGS84 = reprojectGeoJson(geojsonFormat.writeFeaturesObject([olFt.clone()]), this.getMapCrs(), "EPSG:4326");
                const coordinates = [...drawnFtWGS84.features[0].geometry.coordinates];

                let ft = {
                    type: "Feature",
                    geometry: {
                        coordinates,
                        type: newDrawMethod
                    },
                    properties: {
                        ...omit(olFt.getProperties(), "geometry")
                    }
                };

                this.props.onDrawingFeatures([ft]);

                olFt = transformPolygonToCircle(olFt, this.getMapCrs());
                previousFeatures[previousFtIndex] = olFt;
                this.drawSource = new ol.source.Vector({
                    features: previousFeatures
                });
                this.drawLayer.setSource(this.drawSource);
                this.addModifyInteraction(newProps);
            }
        };
        this.clean();

        let newFeature = reprojectGeoJson(head(newProps.features), newProps.options.featureProjection, this.getMapCrs()) || {};
        let props;
        if (newFeature && newFeature.features && newFeature.features.length) {
            // filtering circles features only when drawing

            props = assign({}, newProps, {features: [newFeature]});
        } else {
            if (newFeature && newFeature.properties && newFeature.properties.isCircle) {
                props = assign({}, newProps, {features: []});
            } else {
                props = assign({}, newProps, {features: newFeature.geometry ? [{...newFeature.geometry, properties: newFeature.properties}] : []});
            }
        }
        // TODO investigate if this newFeature.geometry is needed instead of only newFeature
        if (!this.drawLayer) {
            this.addLayer(props);
        } else {
            this.drawSource.clear();

            this.addFeatures(props);
        }
        if (newProps.options.editEnabled) {

            this.addModifyInteraction(newProps);
            // removed for polygon because of the issue https://github.com/geosolutions-it/MapStore2/issues/2378
            if (newProps.options.translateEnabled !== false) {
                this.addTranslateInteraction();
            }
            if (newProps.options.addClickCallback) {
                this.setState({keySingleClickCallback: this.addSingleClickListener(singleClickCallback, newProps)});
            }
        }
        if (newProps.options && newProps.options.selectEnabled) {
            this.addSelectInteraction(newProps.options && newProps.options.selected, newProps);

        }

        if (newProps.options.drawEnabled) {
            this.handleDrawAndEdit(newProps.drawMethod, newProps.options.startingPoint, newProps.options.maxPoints, newProps);
        }
    };

    addSelectInteraction = (selectedFeature, props) => {
        if (this.selectInteraction) {
            this.props.map.removeInteraction(this.selectInteraction);
        }
        let olFt;
        if (selectedFeature) {
            olFt = find(this.drawSource.getFeatures(), f => f.getProperties().id === selectedFeature.properties.id );
            if (olFt) {
                this.selectFeature(olFt);
            }
        }
        this.selectInteraction = new ol.interaction.Select({
            layers: [this.drawLayer],
            features: new ol.Collection(selectedFeature && olFt ? [olFt] : null)
        });
        if (olFt) {
            const styleType = this.convertGeometryTypeToStyleType(props.drawMethod);
            olFt.setStyle(VectorStyle.getStyle({ ...props, style: {...props.style, type: styleType, highlight: true, useSelectedStyle: props.options.useSelectedStyle }}, false, props.features[0] && props.features[0].properties && props.features[0].properties.valueText && [props.features[0].properties.valueText] || [] ));
        }
        this.selectInteraction.on('select', (evt) => {

            let selectedFeatures = this.selectInteraction.getFeatures().getArray();
            let featuresSelected = [];
            if (selectedFeatures.length) {
                featuresSelected = this.props.features.map(f => {
                    let selected = false;
                    if (f.type === "FeatureCollection" && selectedFeatures.length > 0) {
                        let ftSelected = head(selectedFeatures);
                        this.selectFeature(ftSelected);
                        // TODO SELECT SMALLEST ONE IF THERE ARE >= 2 features selected

                        if (ftSelected.getGeometry && ftSelected.getGeometry().getType() === "Circle") {
                            let radius = ftSelected.getGeometry().getRadius();
                            let center = reproject(ftSelected.getGeometry().getCenter(), this.getMapCrs(), "EPSG:4326");
                            ftSelected.setProperties({center: [center.x, center.y], radius});
                            ftSelected = this.replaceCircleWithPolygon(ftSelected.clone());
                        }
                        this.drawSource.getFeatures().forEach(feat => {
                            if (feat.getProperties().id === ftSelected.getProperties().id) {
                                this.selectFeature(ftSelected);
                            } else {
                                this.deselectFeature(feat);
                            }
                        });
                        return reprojectGeoJson(geojsonFormat.writeFeatureObject(ftSelected.clone()), this.getMapCrs(), "EPSG:4326");
                    }
                    selected = selectedFeatures.reduce((previous, current) => {
                        return current.get('id') === f.id ? true : previous;
                    }, false);
                    return assign({}, f, { selected: selected, selectedFeature: evt.selected });
                });
                this.props.onSelectFeatures(featuresSelected);
            }
            if (selectedFeatures.length === 0) {
                this.props.onSelectFeatures([]);
                this.drawSource.getFeatures().map( ft => this.deselectFeature(ft));
                return null;
            }
            // this.props.onChangeDrawingStatus('select', null, this.props.drawOwner, features);
        });

        this.props.map.addInteraction(this.selectInteraction);
    };

    selectFeature = (f) => {
        f.setProperties({selected: true});
    }
    deselectFeature = (f) => {
        f.setProperties({selected: false});
    }
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
            this.props.map.removeInteraction(this.selectInteraction);
        }

        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
            this.props.map.un('singleclick');
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

    fromOLFeature = (feature, startingPoint, properties) => {
        let geometry = feature.getGeometry();
        let extent = geometry.getExtent();
        let geometryProperties = geometry.getProperties();
        // retrieve geodesic center from properties
        // it's different from extent center
        let center = geometryProperties && geometryProperties.geodesicCenter || ol.extent.getCenter(extent);
        let coordinates;
        let projection = this.props.map.getView().getProjection().getCode();
        let radius;
        let type = geometry.getType();
        if (geometry.getCoordinates) {
            coordinates = geometry.getCoordinates();
            if (startingPoint) {
                coordinates = concat(startingPoint, coordinates);
                geometry.setCoordinates(coordinates);
            }
            if (this.props.drawMethod === "Circle") {
                if (this.props.options.geodesic) {
                    const wgs84Coordinates = [[...center], [...coordinates[0][0]]].map((coordinate) => {
                        return this.reprojectCoordinatesToWGS84(coordinate, projection);
                    });
                    radius = calculateDistance(wgs84Coordinates, 'haversine');
                } else {
                    radius = this.calculateRadius(center, coordinates);
                }
            }
            return assign({}, {
                id: feature.get('id'),
                type,
                extent,
                center,
                coordinates,
                radius,
                style: this.fromOlStyle(feature.getStyle()),
                projection: this.getMapCrs()
            });

        }
        let geometries = geometry.getGeometries().map((g, i) => {
            extent = g.getExtent();
            center = ol.extent.getCenter(extent);
            coordinates = g.getCoordinates();
            if (startingPoint) {
                coordinates = concat(startingPoint, coordinates);
                g.setCoordinates(coordinates);
            }
            if (properties.circles && properties.circles.indexOf(i) !== -1) {
                if (this.props.options.geodesic) {
                    const wgs84Coordinates = [[...center], [...coordinates[0][0]]].map((coordinate) => {
                        return this.reprojectCoordinatesToWGS84(coordinate, projection);
                    });
                    radius = calculateDistance(wgs84Coordinates, 'haversine');
                } else {
                    radius = this.calculateRadius(center, coordinates);
                }
            } else {
                radius = 0;
            }
            return assign({}, {
                id: feature.get('id'),
                type: g.getType(),
                extent,
                center,
                coordinates,
                radius,
                style: this.fromOlStyle(feature.getStyle()),
                projection: this.getMapCrs()
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
            },
            projection
        });
    };

    reprojectCoordinatesToWGS84 = (coordinate, projection) => {
        let reprojectedCoordinate = reproject(coordinate, projection, 'EPSG:4326');
        return [reprojectedCoordinate.x, reprojectedCoordinate.y];
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
            return [...VectorStyle.getMarkerStyleLegacy({
                    style: { iconGlyph: 'comment',
                        iconShape: 'square',
                        iconColor: 'blue' }
                }), newStyle];
        }
        if (style && (style.iconUrl || style.iconGlyph)) {
            return VectorStyle.getMarkerStyleLegacy({
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

    addModifyInteraction = (props) => {
        if (this.modifyInteraction) {
            this.props.map.removeInteraction(this.modifyInteraction);
        }
        /*
            filter features to be edited
        */
        const editFilter = props && props.options && props.options.editFilter;
        this.modifyFeatureColl = new ol.Collection(filter(this.drawLayer.getSource().getFeatures(), editFilter));


        this.modifyInteraction = new ol.interaction.Modify({
            features: this.modifyFeatureColl,
            condition: (e) => {
                return ol.events.condition.primaryAction(e) && !ol.events.condition.altKeyOnly(e);
            }
        });

        this.modifyInteraction.on('modifyend', (e) => {

            let features = e.features.getArray().map((f) => {
                // transform back circles in polygons
                let newFt = f.clone();

                if (newFt.getGeometry && newFt.getGeometry().getType() === "GeometryCollection") {
                    newFt.getGeometry().setGeometries(this.replaceCirclesWithPolygons(newFt));
                }
                if (newFt.getGeometry && newFt.getGeometry() && newFt.getGeometry().getType() === "Circle") {
                    let center = reproject(newFt.getGeometry().getCenter(), this.getMapCrs(), "EPSG:4326");
                    let radius = newFt.getGeometry().getRadius();
                    newFt.setProperties({center: [center.x, center.y], radius});
                    f.setProperties({center: [center.x, center.y], radius});
                    newFt = this.replaceCircleWithPolygon(newFt.clone());
                }
                return reprojectGeoJson(geojsonFormat.writeFeatureObject(newFt), this.getMapCrs(), "EPSG:4326");
            });
            if (this.props.options.transformToFeatureCollection) {
                this.props.onDrawingFeatures(features);
            } else {
                this.props.onGeometryChanged(features, this.props.drawOwner, false, "editing", "editing"); // TODO FIX THIS
            }
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
        this.translateInteraction.setActive(false);
        this.translateInteraction.on('translateend', (e) => {
            let features = e.features.getArray().map(f => {
                // transform back circles in polygons
                let newFt = f.clone();
                if (newFt.getGeometry && newFt.getGeometry().getType() === "GeometryCollection") {
                    newFt.getGeometry().setGeometries(this.replaceCirclesWithPolygons(newFt));
                }
                if (newFt.getGeometry && newFt.getGeometry() && newFt.getGeometry().getType() === "Circle") {
                    let center = reproject(newFt.getGeometry().getCenter(), this.getMapCrs(), "EPSG:4326");
                    let radius = newFt.getGeometry().getRadius();
                    newFt.setProperties({center: [center.x, center.y], radius});
                    newFt = this.replaceCircleWithPolygon(newFt);
                }
                if (f.getProperties() && f.getProperties().selected) {
                    this.props.onSelectFeatures([reprojectGeoJson(geojsonFormat.writeFeatureObject(newFt), this.getMapCrs(), "EPSG:4326")]);
                }
                return reprojectGeoJson(geojsonFormat.writeFeatureObject(newFt), this.getMapCrs(), "EPSG:4326");
            });
            if (this.props.options.transformToFeatureCollection) {
                this.props.onDrawingFeatures(features);
            } else {
                this.props.onGeometryChanged(features, this.props.drawOwner, this.props.drawOwner, false, this.props.drawMethod === "Text", this.props.drawMethod === "Circle");
            }
        });
        this.addTranslateListener();
        this.props.map.addInteraction(this.translateInteraction);
    }

    createOLGeometry = ({type, coordinates, radius, center, geometries, projection, options = {}}) => {
        if (type === "GeometryCollection") {
            return geometries && geometries.length ? new ol.geom.GeometryCollection(geometries.map(g => this.olGeomFromType({type: g.type}))) : new ol.geom.GeometryCollection([]);
        }
        return this.olGeomFromType({type, coordinates, radius, center, projection, options});
    };

    olGeomFromType = ({type, coordinates, radius, center, projection, options}) => {

        let geometry;
        switch (type) {
            case "Point": case "Marker": case "Text": { geometry = new ol.geom.Point(coordinates ? coordinates : []); break; }
            case "LineString": { geometry = new ol.geom.LineString(coordinates ? coordinates : []); break; }
            case "MultiPoint": /*case "Text":*/ { geometry = new ol.geom.MultiPoint(coordinates ? coordinates : []); break; } // TODO move text on "Point"
            case "MultiLineString": { geometry = new ol.geom.MultiLineString(coordinates ? coordinates : []); break; }
            case "MultiPolygon": { geometry = new ol.geom.MultiPolygon(coordinates ? coordinates : []); break; }
            // default is Polygon
            default: {
                let correctCenter = isArray(center) ? {x: center[0], y: center[1]} : center;
                const isCircle = projection
                    && !isNaN(parseFloat(radius))
                    && correctCenter
                    && !isNil(correctCenter.x)
                    && !isNil(correctCenter.y)
                    && !isNaN(parseFloat(correctCenter.x))
                    && !isNaN(parseFloat(correctCenter.y));

                    // TODO simplify, too much use of elvis operator
                geometry = isCircle ?
                    options.geodesic ?
                    ol.geom.Polygon.circular(wgs84Sphere, this.reprojectCoordinatesToWGS84([correctCenter.x, correctCenter.y], projection), radius, 100).clone().transform('EPSG:4326', projection)
                    : ol.geom.Polygon.fromCircle(new ol.geom.Circle([correctCenter.x, correctCenter.y], radius), 100)
                        : new ol.geom.Polygon(coordinates && isArray(coordinates[0]) ? coordinates : []);

                    // store geodesic center
                if (geometry && isCircle && options.geodesic) {
                    geometry.setProperties({geodesicCenter: [correctCenter.x, correctCenter.y]}, true);
                }
            }
        }
        return geometry;
    }
    convertGeometryTypeToStyleType = (drawMethod) => {
        switch (drawMethod) {
            case "BBOX": return "LineString";
            default: return drawMethod;
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
    calculateRadius = (center, coordinates) => {
        return isArray(coordinates) && isArray(coordinates[0]) && isArray(coordinates[0][0]) ? Math.sqrt(Math.pow(center[0] - coordinates[0][0][0], 2) + Math.pow(center[1] - coordinates[0][0][1], 2)) : 100;
    }
    /**
     * @param {number[]} center in 3857 [lon, lat]
     * @param {number} radius in meters
     * @param {number} npoints number of sides
     * @return {ol.geom.Polygon} the polygon which approximate the circle
    */
    polygonFromCircle = (center, radius, npoints = 100) => {
        return ol.geom.Polygon.fromCircle(new ol.geom.Circle(center, radius), npoints);
    }

    polygonCoordsFromCircle = (center, radius, npoints = 100) => {
        return this.polygonFromCircle(center, radius, npoints).getCoordinates();
    }

    /**
     * replace circles with polygons in feature collection
     * @param {ol.Feature[]} features to transform
     * @return {ol.Feature[]} features transformed
    */
    replaceCirclesWithPolygonsInFeatureColl = (features) => {
        return features.map(f => {
            if (f.getGeometry().getType() !== "Circle") {
                return f;
            }
            return this.replaceCircleWithPolygon(f);
        });
    }
    /**
     * tranform circle to polygon
     * @param {ol.Feature} feature to check if needs to be transformed
     * @return {ol.Feature} feature transformed in polygon
    */
    replaceCircleWithPolygon = (feature) => {
        if (feature.getProperties().isCircle && feature.getGeometry().getType() === "Circle") {
            const center = feature.getGeometry().getCenter();
            const radius = feature.getGeometry().getRadius();
            feature.setGeometry(this.polygonFromCircle(center, radius));
            return feature;
        }
        return feature;
    }
    /**
     * replace circles with polygons
     * @param {ol.Feature} feature must contain a geometry collection
     * @return {ol.geom.SimpleGeometry[]} geometries
    */
    replaceCirclesWithPolygons = (feature) => {
        if (feature.getGeometry && !feature.getGeometry().getGeometries) {
            return feature;
        }
        let geoms = feature.getGeometry().getGeometries();
        return geoms.map((g, i) => {
            if (g.getType() !== "Circle") {
                return g;
            }
            if (feature.getProperties() && feature.getProperties().circles && feature.getProperties().circles.indexOf(i) !== -1) {
                const center = g.getCenter();
                const radius = g.getRadius();
                return this.polygonFromCircle(center, radius);
            }
            return g;
        });
    }
    /**
     * replace polygons with circles
     * @param {ol.Feature} feature must contain a geometry collection and property "circles"
     * @return {ol.geom.SimpleGeometry[]} geometries
     */
    replacePolygonsWithCircles = (feature) => {
        let geoms = feature.getGeometry().getGeometries();
        return geoms.map((g, i) => {
            if (g.getType() !== "Polygon") {
                return g;
            }
            if (feature.getProperties() && feature.getProperties().circles && feature.getProperties().circles.indexOf(i) !== -1) {
                const extent = g.getExtent();
                const center = ol.extent.getCenter(extent);
                const radius = this.calculateRadius(center, g.getCoordinates());
                return new ol.geom.Circle(center, radius);
            }
            return g;
        });
    }


    addTranslateListener = () => {
        document.addEventListener("keydown", (event) => {
            if (event.altKey && event.code === "AltLeft") {
                this.translateInteraction.setActive(true);
            }
        });
        document.addEventListener("keyup", (event) => {
            if (event.code === "AltLeft") {
                this.translateInteraction.setActive(false);
            }
        });
    }
}
module.exports = DrawSupport;
