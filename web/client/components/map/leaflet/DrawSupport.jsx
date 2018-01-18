/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {head} = require('lodash');
const L = require('leaflet');
require('leaflet-draw');
const {isSimpleGeomType, getSimpleGeomType} = require('../../../utils/MapUtils');
const {boundsToOLExtent} = require('../../../utils/DrawSupportUtils');
const assign = require('object-assign');
const circleToPolygon = require('circle-to-polygon');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');

const VectorUtils = require('../../../utils/leaflet/Vector');

/**
 * Component that allows to draw and edit geometries as (Point, LineString, Polygon, Rectangle, Circle, MultiGeometries)
 * @class DrawSupport
 * @memberof components.map
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
 * @prop {object} messages the localized messages that can be used to customize the tooltip text
*/
class DrawSupport extends React.Component {
    static displayName = 'DrawSupport';

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
        messages: PropTypes.object,
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
        style: {
            color: '#ffcc33',
            opacity: 1,
            weight: 3,
            fillColor: '#ffffff',
            fillOpacity: 0.2,
            clickable: false,
            editing: {
                fill: 1
            }
        }
    };

    /**
     * Inside this lyfecycle method the status is checked to manipulate the behaviour of the DrawSupport.<br>
     * Here is the list of all status:<br>
     * create allows to create features<br>
     * start allows to start drawing features<br>
     * drawOrEdit allows to start drawing or editing the passed features or both<br>
     * stop allows to stop drawing features<br>
     * replace allows to replace all the features drawn by Drawsupport with new ones<br>
     * clean it cleans the drawn features and stop the drawsupport
     * @memberof components.map.DrawSupport
     * @function componentWillReceiveProps
    */
    componentWillReceiveProps(newProps) {
        let drawingStrings = this.props.messages || this.context.messages ? this.context.messages.drawLocal : false;
        if (drawingStrings) {
            L.drawLocal = drawingStrings;
        }
        if (this.props.drawStatus !== newProps.drawStatus || newProps.drawStatus === "replace" || this.props.drawMethod !== newProps.drawMethod || this.props.features !== newProps.features) {
            switch (newProps.drawStatus) {
            case "create": this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style}); break;
            case "start": this.addDrawInteraction(newProps); break;
            case "drawOrEdit": this.addDrawOrEditInteractions(newProps); break;
            case "stop": {
                this.removeAllInteractions();
            } break;
            case "replace": this.replaceFeatures(newProps); break;
            case "clean": this.cleanAndStop(); break;
            default :
                return;
            }
        }
    }

    onDrawStart = () => {
        this.drawing = true;
    };

    onDrawCreated = (evt) => {
        this.drawing = false;
        const layer = evt.layer;
        // let drawn geom stay on the map
        let geoJesonFt = layer.toGeoJSON();
        let bounds;
        let tempCoordinates;
        if (evt.layerType === "marker") {
            bounds = L.latLngBounds(geoJesonFt.geometry.coordinates, geoJesonFt.geometry.coordinates);
        } else {
            bounds = layer.getBounds();
        }
        let projectedRadius;
        let extent = boundsToOLExtent(bounds);
        let center = bounds.getCenter();
        center = [center.lng, center.lat];
        let radius = layer.getRadius ? layer.getRadius() : 0;
        let coordinates = geoJesonFt.geometry.coordinates;
        let projection = "EPSG:4326";
        let type = geoJesonFt.geometry.type;
        if (evt.layerType === "circle") {
            // Circle needs to generate path and needs to be projected before
            // When GeometryDetails update circle it's in charge to generete path
            // but for first time we need to do this!
            geoJesonFt.projection = "EPSG:4326";
            projection = "EPSG:3857";
            // coordinates = CoordinatesUtils.calculateCircleCoordinates(center, radius, 100);

            /**
                in order to be aligned with openlayers we use the projected radius as the model.
                we need to convert it back to 4326 for leaflet
            */
            const polygonGeom = circleToPolygon(center, radius, 100);
            let projectedNorthPoint = CoordinatesUtils.reproject(polygonGeom.coordinates[0][0], 'EPSG:4326', 'EPSG:3857');
            let projectedCenter = CoordinatesUtils.reproject(center, 'EPSG:4326', 'EPSG:3857');
            // TODO revert the changes here for the radius, MAYBE NOT
            projectedRadius = Math.sqrt(Math.pow(projectedCenter.x - projectedNorthPoint.x, 2) + Math.pow(projectedCenter.y - projectedNorthPoint.y, 2));

            extent = CoordinatesUtils.reprojectBbox(extent, "EPSG:4326", projection);
            center = CoordinatesUtils.reproject(center, "EPSG:4326", projection);
            geoJesonFt.radius = radius;

            tempCoordinates = CoordinatesUtils.reprojectGeoJson({type: "Feature", geometry: {type: "Polygon", coordinates: polygonGeom.coordinates}}, "EPSG:4326", projection);
            coordinates = tempCoordinates.geometry.coordinates || polygonGeom.coordinates;
            center = [center.x, center.y];
            type = "Polygon";
        }
        // We always draw geoJson feature
        this.drawLayer.addData(geoJesonFt);
        // Geometry respect query form panel needs
        let geometry = {
            type,
            extent,
            center,
            coordinates,
            radius: projectedRadius || radius,
            leafletRadius: radius,
            projection
        };
        if (this.props.options && this.props.options.stopAfterDrawing) {
            this.props.onChangeDrawingStatus('stop', this.props.drawMethod, this.props.drawOwner);
        }
        const newGeoJsonFt = this.convertFeaturesToGeoJson(evt.layer, this.props);
        this.props.onEndDrawing(geometry, this.props.drawOwner);
        this.props.onGeometryChanged([newGeoJsonFt], this.props.drawOwner, this.props.options && this.props.options.stopAfterDrawing ? "enterEditMode" : "");
    };

    onUpdateGeom = (features, props) => {
        const newGeoJsonFt = this.convertFeaturesToGeoJson(features, props);
        props.onGeometryChanged([newGeoJsonFt], props.drawOwner);
    };

    render() {
        return null;
    }

    addLayer = (newProps) => {
        this.clean();

        let vector = L.geoJson(null, {
            pointToLayer: function(feature, latLng) {
                let center = CoordinatesUtils.reproject({x: latLng.lng, y: latLng.lat}, feature.projection || "EPSG:4326", "EPSG:4326");
                return L.circle(L.latLng(center.y, center.x), feature.radius || 5);
            },
            style: {
                color: '#ffcc33',
                opacity: 1,
                weight: 3,
                fillColor: '#ffffff',
                fillOpacity: 0.2,
                clickable: false
            }
        });
        this.props.map.addLayer(vector);
        // Immediately draw passed features
        if (newProps.features && newProps.features.length > 0) {
            vector.addData(this.convertFeaturesPolygonToPoint(newProps.features, this.props.drawMethod));
        }
        this.drawLayer = vector;
    };

    addGeojsonLayer = ({features, projection, style, drawMethod}) => {
        this.clean();
        let tempFeatures = features;
        let convertedRadius;
        if (drawMethod === "Circle") {
            tempFeatures = features.map(f => {
                return assign({}, f, {geometry: {...f.geometry, coordinates: [f.geometry.center.x, f.geometry.center.y], type: "Point"} });
            });
            const center4326 = CoordinatesUtils.reproject(features[0].geometry.center, projection, "EPSG:4326");
            const point4326 = CoordinatesUtils.reproject({y: features[0].geometry.coordinates[0][0][1], x: features[0].geometry.coordinates[0][0][0]}, projection, "EPSG:4326");
            const latlng = L.latLng(center4326.y, center4326.x);
            const point = L.latLng(point4326.y, point4326.x);
            convertedRadius = latlng.distanceTo(point);
        }
        let geoJsonLayerGroup = L.geoJson(tempFeatures, {style: (f) => {
            return f.style || style;
        }, pointToLayer: (f, latLng) => {
            let center = CoordinatesUtils.reproject({x: latLng.lng, y: latLng.lat}, projection, "EPSG:4326");
            if (drawMethod === "Circle") {
                return L.circle(L.latLng(center.y, center.x), convertedRadius || f.geometry.radius || 5);
            }
            return VectorUtils.pointToLayer(L.latLng(center.y, center.x), f, style);
        }
        });
        this.drawLayer = geoJsonLayerGroup.addTo(this.props.map);
    };


    replaceFeatures = (newProps) => {
        if (!this.drawLayer) {
            this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style, drawMethod: newProps.drawMethod});
        } else {
            this.drawLayer.clearLayers();
            let tempFeatures = newProps.features;
            if (newProps.drawMethod === "Circle") {
                // TODO revert all the changes here
                tempFeatures = newProps.features.map(f => {
                    return assign({}, f, {coordinates: [f.center.x, f.center.y], type: "Point"});
                });
                let oldLeafletRadius;
                oldLeafletRadius = newProps.features[0].leafletRadius;
                let oldOpenlayersRadius = newProps.features[0].oldOlRadius;
                let newOpenlayersRadius = newProps.features[0].radius;
                let newLeafletRadius = (newOpenlayersRadius * oldLeafletRadius) / oldOpenlayersRadius;

                if (newProps.features[0].coordinates !== newProps.features[0].newCoordinates) {
                    let proj = newProps.options && newProps.options.featureProjection || "EPSG:4326";
                    const newCenter4326 = CoordinatesUtils.reproject(newProps.features[0].center, proj, "EPSG:4326");
                    const newPoint4326 = CoordinatesUtils.reproject({y: newProps.features[0].newCoordinates[1], x: newProps.features[0].newCoordinates[0]}, proj, "EPSG:4326");
                    const newCenter = L.latLng(newCenter4326.y, newCenter4326.x);
                    const newPoint = L.latLng(newPoint4326.y, newPoint4326.x);
                    newLeafletRadius = newCenter.distanceTo(newPoint);
                    // newLeafletRadius = oldLeafletRadius;
                }

                this.drawLayer.options.pointToLayer = (feature, latLng) => {
                    let c = CoordinatesUtils.reproject({x: latLng.lng, y: latLng.lat}, feature.projection || "EPSG:4326", "EPSG:4326");
                    return L.circle(L.latLng(c.y, c.x), newLeafletRadius || oldLeafletRadius || feature.radius || 5);
                };
                this.drawLayer.options.style = {
                    color: '#ffcc33',
                    opacity: 1,
                    weight: 3,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2,
                    clickable: false
                };
            } else {
                this.drawLayer.options.pointToLayer = (f, latLng) => {
                    let center = CoordinatesUtils.reproject({x: latLng.lng, y: latLng.lat}, newProps.options && newProps.options.featureProjection || "EPSG:4326", "EPSG:4326");
                    return VectorUtils.pointToLayer(L.latLng(center.y, center.x), f, newProps.style);
                };
            }
            this.drawLayer.addData(tempFeatures);
        }
    };

    addDrawInteraction = (newProps) => {
        this.removeAllInteractions();
        if (newProps.drawMethod === "Point" || newProps.drawMethod === "MultiPoint") {
            this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style, drawMethod: newProps.drawMethod});
        } else {
            this.addLayer(newProps);
        }
        this.props.map.on('draw:created', this.onDrawCreated, this);
        this.props.map.on('draw:drawstart', this.onDrawStart, this);

        if (newProps.drawMethod === 'LineString' || newProps.drawMethod === 'Bearing' || newProps.drawMethod === 'MultiLineString') {
            this.drawControl = new L.Draw.Polyline(this.props.map, {
                shapeOptions: {
                    color: '#000000',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2
                },
                repeatMode: true
            });
        } else if (newProps.drawMethod === 'Polygon' || newProps.drawMethod === 'MultiPolygon') {
            this.drawControl = new L.Draw.Polygon(this.props.map, {
                shapeOptions: {
                    color: '#000000',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2,
                    dashArray: [5, 5],
                    guidelineDistance: 5
                },
                repeatMode: true
            });
        } else if (newProps.drawMethod === 'BBOX') {
            this.drawControl = new L.Draw.Rectangle(this.props.map, {
                draw: false,
                shapeOptions: {
                    color: '#000000',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2,
                    dashArray: [5, 5]
                },
                repeatMode: true
            });
        } else if (newProps.drawMethod === 'Circle') {
            this.drawControl = new L.Draw.Circle(this.props.map, {
                shapeOptions: {
                    color: '#000000',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2,
                    dashArray: [5, 5]
                },
                repeatMode: true
            });
        } else if (newProps.drawMethod === 'Point' || newProps.drawMethod === 'MultiPoint') {
            this.drawControl = new L.Draw.Marker(this.props.map, {
                shapeOptions: {
                    color: '#000000',
                    weight: 2,
                    fillColor: '#ffffff',
                    fillOpacity: 0.2
                },
                repeatMode: true
            });
        }

        // start the draw control
        this.drawControl.enable();
    };

    addDrawOrEditInteractions = (newProps) => {
        let newFeature = head(newProps.features);

        if (newFeature && newFeature.geometry && newFeature.geometry.type && !isSimpleGeomType(newFeature.geometry.type)) {
            const newFeatures = newFeature.geometry.coordinates.map((coords, idx) => {
                return {
                        type: 'Feature',
                        properties: {...newFeature.properties},
                        id: newFeature.geometry.type + idx,
                        geometry: {
                            coordinates: coords,
                            type: getSimpleGeomType(newFeature.geometry.type)
                        }
                    };
            });
            newFeature = {type: "FeatureCollection", features: newFeatures};
        }
        const props = assign({}, newProps, {features: [newFeature ? newFeature : {}]});
        if (!this.drawLayer) {
            this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style, drawMethod: newProps.drawMethod});
        } else {
            this.drawLayer.clearLayers();
            this.drawLayer.addData(this.convertFeaturesPolygonToPoint(props.features, props.drawMethod));
        }
        if (newProps.options.editEnabled) {
            this.addEditInteraction(props);
        }
        if (newProps.options.drawEnabled) {
            this.addDrawInteraction(props);
        }
    };

    addEditInteraction = (newProps) => {
        this.clean();

        this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326", style: newProps.style, drawMethod: newProps.drawMethod});

        let allLayers = this.drawLayer.getLayers();
        allLayers.forEach(l => {
            l.on('edit', (e) => this.onUpdateGeom(e.target, newProps));
            l.on('moveend', (e) => this.onUpdateGeom(e.target, newProps));
            if (l.editing) {
                l.editing.enable();
            }
        });

        this.editControl = new L.Control.Draw({
                edit: {
                    featureGroup: this.drawLayer,
                    poly: {
                        allowIntersection: false
                    },
                    edit: true
                },
                draw: {
                    polygon: {
                        allowIntersection: false,
                        showArea: true
                    }
                }
            });
    }

    removeAllInteractions = () => {
        this.removeEditInteraction();
        this.removeDrawInteraction();
        // this.props.onDrawStopped();
    }

    removeDrawInteraction = () => {
        if (this.drawControl !== null && this.drawControl !== undefined) {
            // Needed if missing disable() isn't warking
            if (this.props.options && this.props.options.stopAfterDrawing) {
                this.drawControl.setOptions({repeatMode: false});
                this.props.onDrawStopped();
            }
            this.drawControl.disable();
            this.drawControl = null;
            this.props.map.off('draw:created', this.onDrawCreated, this);
            this.props.map.off('draw:drawstart', this.onDrawStart, this);
        }
    };

    removeEditInteraction = () => {
        if (this.drawLayer) {
            let allLayers = this.drawLayer.getLayers();
            allLayers.forEach(l => {
                l.off('edit');
                l.off('moveend');
                if (l.editing) {
                    l.editing.disable();
                }
            });
            this.editControl = null;
        }
    };

    cleanAndStop = () => {
        this.removeAllInteractions();

        if (this.drawLayer) {
            this.drawLayer.clearLayers();
            this.props.map.removeLayer(this.drawLayer);
            this.drawLayer = null;
        }
    };

    clean = () => {
        this.removeEditInteraction();
        this.removeDrawInteraction();

        if (this.drawLayer) {
            this.drawLayer.clearLayers();
            this.props.map.removeLayer(this.drawLayer);
            this.drawLayer = null;
        }
    };

    convertFeaturesPolygonToPoint = (features, method) => {
        return method === 'Circle' ? features.map((f) => {
            return {...f, type: "Point"};
        }) : features;

    };

    convertFeaturesToGeoJson = (featureEdited, props) => {
        let geom;
        if (!isSimpleGeomType(props.drawMethod)) {
            let newFeatures = this.drawLayer.getLayers().map(f => f.toGeoJSON());
            geom = {
                type: props.drawMethod,
                coordinates: newFeatures.reduce((p, c) => {
                    return p.concat([c.geometry.coordinates]);
                }, [])
            };
        } else {
            geom = featureEdited.toGeoJSON().geometry;
        }
        return assign({}, featureEdited.toGeoJSON(), {geometry: geom});
    };
}


module.exports = DrawSupport;
