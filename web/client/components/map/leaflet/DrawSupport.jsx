/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {head, last: _last, isNil} = require('lodash');
const L = require('leaflet');

require('leaflet-draw');

L.Draw.Polygon.prototype._calculateFinishDistance = function(t) {
    if (this._markers.length > 0) {
        const first = this._map.latLngToContainerPoint(this._markers[0].getLatLng());
        const last = this._map.latLngToContainerPoint(this._markers[this._markers.length - 1].getLatLng());

        const clickedMarker = new L.Marker(t, {
            icon: this.options.icon,
            zIndexOffset: 2 * this.options.zIndexOffset
        });
        const clicked = this._map.latLngToContainerPoint(clickedMarker.getLatLng());
        return Math.min(first.distanceTo(clicked), last.distanceTo(clicked));
    }
    return 1 / 0;
};

const {isSimpleGeomType, getSimpleGeomType} = require('../../../utils/MapUtils');
const {boundsToOLExtent} = require('../../../utils/leaflet/DrawSupportUtils');
const assign = require('object-assign');

const CoordinatesUtils = require('../../../utils/CoordinatesUtils');

const {pointToLayer} = require('../../../utils/leaflet/Vector');

const DEG_TO_RAD = Math.PI / 180.0;
/**
 * Converts the leaflet circle into the projected circle (usually in 3857)
 * @param  {number} mRadius leaflet radius of circle
 * @param  {array} center  The center point in EPSG:4326. Array [lng,lat]
 * @return {object}        center and radius of the projected circle
 */
const toProjectedCircle = (mRadius, center, projection) => {
    if (projection === "EPSG:4326") {
        return {
            center,
            srs: projection,
            radius: mRadius
        };
    }

    // calculate
    const lonRadius = (mRadius / 40075017) * 360 / Math.cos(DEG_TO_RAD * (center[1]));
    const projCenter = CoordinatesUtils.reproject(center, "EPSG:4326", projection);
    if (lonRadius) {
        const checkPoint = CoordinatesUtils.reproject([center[0] + lonRadius, center[1]], "EPSG:4326", projection);
        return {
            center: projCenter,
            srs: projection,
            radius: Math.sqrt(Math.pow(projCenter.x - checkPoint.x, 2) + Math.pow(projCenter.y - checkPoint.y, 2))
        };
    }
    return {
        center: projCenter,
        srs: projection,
        radius: mRadius
    };

};

/**
 * From projected circle into leaflet circle.
 * @param  {number} radius                   Projected radius
 * @param  {object} center                   `{lng: {number}, lat: {number}}`
 * @param  {String} [projection="EPSG:4326"] projection from where to convert
 * @return {object}                          center and radius of leaflet circle
 */
const toLeafletCircle = (radius, center, projection = "EPSG:4326") => {
    if (projection === "EPSG:4326" || radius === undefined) {
        return {
            center,
            projection,
            radius
        };
    }
    const leafletCenter = CoordinatesUtils.reproject({x: center.lng, y: center.lat}, projection, "EPSG:4326");
    if (radius === undefined) {
        return {
            center: leafletCenter,
            projection,
            radius
        };
    }
    const checkPoint = CoordinatesUtils.reproject([center.lng + radius, center.lat], projection, "EPSG:4326");

    const lonRadius = Math.sqrt(Math.pow(leafletCenter.x - checkPoint.x, 2) + Math.pow(leafletCenter.y - checkPoint.y, 2));
    const mRadius = lonRadius * Math.cos(DEG_TO_RAD * leafletCenter.y) * 40075017 / 360;
    return {
        center: leafletCenter,
        projection: "EPSG:4326",
        radius: mRadius
    };
};
/**
 * Component that allows to draw and edit geometries as (Point, LineString, Polygon, Rectangle, Circle, MultiGeometries)
 * @class DrawSupport
 * @memberof components.map
 * @prop {object} map the map usedto drawing on
 * @prop {string} drawOwner the owner of the drawn features
 * @prop {string} drawStatus the status that allows to do different things. see UNSAFE_componentWillReceiveProps method
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
     * endDrawing as for 'replace' action allows to replace all the features in addition triggers end drawing action to store data in state
     * @memberof components.map.DrawSupport
     * @function UNSAFE_componentWillReceiveProps
    */
    UNSAFE_componentWillReceiveProps(newProps) {
        let drawingStrings = this.props.messages || this.context.messages ? this.context.messages.drawLocal : false;
        if (drawingStrings) {
            L.drawLocal = drawingStrings;
        }
        if (this.props.drawStatus !== newProps.drawStatus || newProps.drawStatus === "replace" || this.props.drawMethod !== newProps.drawMethod || this.props.features !== newProps.features) {
            switch (newProps.drawStatus) {
            case "create": this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style && newProps.style[newProps.drawMethod] || newProps.style}); break;
            case "start": this.addDrawInteraction(newProps); break;
            case "drawOrEdit": this.addDrawOrEditInteractions(newProps); break;
            case "stop": {
                this.removeAllInteractions();
                break;
            }
            case "replace": this.replaceFeatures(newProps); break;
            case "clean": this.cleanAndStop(); break;
            case "endDrawing": this.endDrawing(newProps); break;
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
        if (evt.layerType === "marker") {
            bounds = L.latLngBounds(geoJesonFt.geometry.coordinates, geoJesonFt.geometry.coordinates);
        } else {
            if (!layer._map) {
                layer._map = this.props.map;
                layer._renderer = this.props.map.getRenderer(layer);
                layer._project();
            }
            bounds = layer.getBounds();
        }
        let extent = boundsToOLExtent(bounds);
        let center = bounds.getCenter();
        center = [center.lng, center.lat];
        let coordinates = geoJesonFt.geometry.coordinates;
        let projection = "EPSG:4326";
        let type = geoJesonFt.geometry.type;
        let radius = layer.getRadius ? layer.getRadius() : 0;
        if (evt.layerType === "circle") {
            // Circle needs to generate path and needs to be projected before
            // When GeometryDetails update circle it's in charge to generete path
            // but for first time we need to do this!
            geoJesonFt.projection = "EPSG:4326";
            projection = "EPSG:3857";
            extent = CoordinatesUtils.reprojectBbox(extent, "EPSG:4326", projection);
            const projCircle = toProjectedCircle(layer._mRadius, center, projection);
            center = projCircle.center;
            radius = projCircle.radius;
            coordinates = CoordinatesUtils.calculateCircleCoordinates(center, radius, 100);
            geoJesonFt.radius = layer.getRadius ? layer.getRadius() : 0;
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
            radius,
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
        const vector = L.geoJson(null, {
            pointToLayer: function(feature, latLng) {
                const {center, radius} = toLeafletCircle(feature.radius, latLng, feature.projection);
                return L.circle(center, radius || 5);
            },
            style: (feature) => newProps.style && newProps.style[feature.geometry.type] || {
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

    addGeojsonLayer = ({features, projection, style}) => {
        this.clean();
        let geoJsonLayerGroup = L.geoJson(features, {style: (f) => {
            return f.style || style;
        }, pointToLayer: (f, latLng) => {
            let center = CoordinatesUtils.reproject({x: latLng.lng, y: latLng.lat}, projection, "EPSG:4326");
            return pointToLayer(L.latLng(center.y, center.x), f, style);
        }});

        // (toGeoJSON())
        this.drawLayer = geoJsonLayerGroup.addTo(this.props.map);
        // this.drawLayer = tempLayer.addTo(this.props.map);
    };


    replaceFeatures = (newProps) => {
        if (!this.drawLayer) {
            this.addGeojsonLayer({features: newProps.features, projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style && newProps.style[newProps.drawMethod] || newProps.style});
        } else {
            this.drawLayer.clearLayers();
            if (this.props.drawMethod === "Circle") {
                this.drawLayer.options.pointToLayer = (feature, latLng) => {
                    const {center, radius} = toLeafletCircle(feature.radius, latLng, feature.projection);
                    return L.circle(center, radius || 5);
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
                    return pointToLayer(L.latLng(center.y, center.x), f, newProps.style);
                };
            }
            this.drawLayer.addData(this.convertFeaturesPolygonToPoint(newProps.features, this.props.drawMethod));
        }
    };

    endDrawing = (newProps) => {
        this.replaceFeatures(newProps);
        const geometry = _last(newProps.features);
        if (this.props.drawMethod === "Circle" && geometry && !isNil(geometry.center) && !isNil(geometry.radius)) {
            this.props.onEndDrawing({...geometry, coordinates: CoordinatesUtils.calculateCircleCoordinates(geometry.center, geometry.radius, 100)}, this.props.drawOwner);
        } else if (geometry) {
            this.props.onEndDrawing(geometry, this.props.drawOwner);
        }
    };

    addDrawInteraction = (newProps) => {
        this.removeAllInteractions();
        if (newProps.drawMethod === "Point" || newProps.drawMethod === "MultiPoint") {
            this.addGeojsonLayer({
                features: newProps.features,
                projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style && newProps.style[newProps.drawMethod] || newProps.style
            });
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
                showLength: false,
                repeatMode: true,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                })
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
                allowIntersection: false,
                showLength: false,
                showArea: false,
                repeatMode: true,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                })
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
                repeatMode: true,
                icon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                }),
                touchIcon: new L.DivIcon({
                    iconSize: new L.Point(8, 8),
                    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                })
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
                showRadius: false,
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
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.disable();
        }
        this.drawControl.enable();
    };

    addDrawOrEditInteractions = (newProps) => {
        let newFeature = head(newProps.features);
        let newFeatures;
        if (newFeature && newFeature.geometry && newFeature.geometry.type && !isSimpleGeomType(newFeature.geometry.type)) {
            if (newFeature.geometry.type === "GeometryCollection") {
                newFeatures = newFeature.geometry.geometries.map(g => {
                    return g.coordinates.map((coords, idx) => {
                        return {
                            type: 'Feature',
                            properties: {...newFeature.properties},
                            id: g.type + idx,
                            geometry: {
                                coordinates: coords,
                                type: getSimpleGeomType(g.type)
                            }
                        };
                    });
                });
            } else {
                newFeatures = newFeature.geometry.coordinates.map((coords, idx) => {
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
        }
        const props = assign({}, newProps, {features: [newFeature ? newFeature : {}]});
        if (!this.drawLayer) {
            /* Reprojection is needed to implement circle initial visualization after querypanel geometry reload (on reload the 100 points polygon is shown)
             *
             * We should, for the future draw a circle also on reload.
             * NOTE: after some center or radius changes (e.g. )
            */
            this.addGeojsonLayer({
                features: newProps.features && newProps.options.featureProjection && newProps.options.featureProjection !== "EPSG:4326"
                    ? newProps.features.map(f => CoordinatesUtils.reprojectGeoJson(f, newProps.options.featureProjection, "EPSG:4326") )
                    : newProps.features,
                projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
                style: newProps.style && newProps.style[newProps.drawMethod] || newProps.style});

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

        this.addGeojsonLayer({
            features: newProps.features,
            projection: newProps.options && newProps.options.featureProjection || "EPSG:4326",
            style: assign({}, newProps.style, {
                poly: {
                    icon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'leaflet-div-icon leaflet-editing-icon'
                    }),
                    touchIcon: new L.DivIcon({
                        iconSize: new L.Point(8, 8),
                        className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                    })
                }
            })
        });

        let allLayers = this.drawLayer.getLayers();

        setTimeout(() => {
            allLayers.forEach(l => {
                if (l.getLayers && l.getLayers() && l.getLayers().length) {
                    l.getLayers().forEach((layer) => {
                        layer.on('edit', (e) => this.onUpdateGeom(e.target, newProps));
                        layer.on('moveend', (e) => this.onUpdateGeom(e.target, newProps));
                        if (layer.editing) {
                            layer.editing.enable();
                        }
                    });
                } else {
                    l.on('edit', (e) => this.onUpdateGeom(e.target, newProps));
                    l.on('moveend', (e) => this.onUpdateGeom(e.target, newProps));
                    if (l.editing) {
                        l.editing.enable();
                    }
                }
            });
        }, 0);

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
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.disable();
        }
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
            if (this.props.map.doubleClickZoom) {
                this.props.map.doubleClickZoom.enable();
            }
        }
    };

    removeEditInteraction = () => {
        if (this.drawLayer) {
            let allLayers = this.drawLayer.getLayers();
            allLayers.forEach(l => {
                if (l.getLayers && l.getLayers() && l.getLayers().length) {
                    l.getLayers().forEach((layer) => {
                        layer.off('edit');
                        layer.off('moveend');
                        if (layer.editing) {
                            layer.editing.disable();
                        }
                    });
                } else {
                    l.off('edit');
                    l.off('moveend');
                    if (l.editing) {
                        l.editing.disable();
                    }
                }
            });
            this.editControl = null;
        }
        if (this.props.map.doubleClickZoom) {
            this.props.map.doubleClickZoom.enable();
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
            const {center, projection, radius} = ((f.center !== undefined && f.radius !== undefined) ? toLeafletCircle(f.radius, {lat: f.center.y, lng: f.center.x}, f.projection) : f);
            return {
                ...f,
                coordinates: center ? [center.x, center.y] : f.coordinates,
                center: center || f.center,
                projection: projection || f.projection,
                radius: radius !== undefined ? radius : f.radius,
                type: "Point"
            };
        }) : features;

    };

    convertFeaturesToGeoJson = (featureEdited, props) => {
        let geom;
        if (!isSimpleGeomType(props.drawMethod)) {
            if (props.drawMethod === "GeometryCollection") {
                let geometries = this.drawLayer.getLayers().map(f => f.toGeoJSON());
                return {
                    type: "GeometryCollection",
                    geometries: geometries.map(g => {
                        if (g.type === "FeatureCollection") {
                            return {
                                type: "Multi" + g.features[0].geometry.type,
                                coordinates: g.features.map((feat) => {
                                    return feat.geometry.coordinates;
                                })
                            };
                        }
                        return {
                            type: g.geometry.type,
                            coordinates: g.geometry.coordinates
                        };
                    })
                };
            }
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
