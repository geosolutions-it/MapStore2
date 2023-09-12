/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import MultiPoint from 'ol/geom/MultiPoint';
import Circle from 'ol/geom/Circle';
import Polygon, { circular } from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import {getDistance} from 'ol/sphere';
import {transform} from 'ol/proj';
import { transformLineToArcs, reproject } from '../CoordinatesUtils';
import { GeometryCollection } from 'ol/geom';
import DrawHole from './hole/DrawHole';
import tinycolor from 'tinycolor2';
import { never } from 'ol/events/condition';
import {
    generateEditingStyle,
    featureToModifyProperties as defaultFeatureToModifyProperties,
    modifyPropertiesToFeatureProperties as defaultModifyPropertiesToFeatureProperties
} from '../DrawUtils';

const geoJSON = new GeoJSON();

const transformCoordinatesToGeodesic = (map, coordinates) => {
    const projectionCode = map.getView().getProjection().getCode();
    const geodesicCoordinates = transformLineToArcs(coordinates.map(c => {
        const point = reproject(c, projectionCode, 'EPSG:4326');
        return [point.x, point .y];
    }));
    return geodesicCoordinates.map(c => {
        const point = reproject(c, 'EPSG:4326', projectionCode);
        return [point.x, point .y];
    });
};

function toOLFeature({
    map,
    feature,
    featureToModifyProperties = () => ({})
}) {
    const mapProjection = map.getView().getProjection().getCode();
    const olFeature = geoJSON.readFeature(feature, {
        featureProjection: mapProjection,
        dataProjection: 'EPSG:4326'
    });
    const properties = featureToModifyProperties(feature);
    const { geodesic, geometryType, radius } = properties;
    olFeature.set('@properties', properties);
    if (geodesic && geometryType === 'Circle' && radius) {
        const coordinates = circular(feature.geometry.coordinates, radius, 128)
            .transform('EPSG:4326', mapProjection)
            .getCoordinates();
        olFeature.setGeometry(
            new GeometryCollection([
                new Polygon(coordinates),
                olFeature.getGeometry()
            ])
        );
        return olFeature;
    }
    if (geometryType === 'Circle' && radius) {
        const center = olFeature.getGeometry().clone();
        olFeature.set('@geometry', center);
        olFeature.setGeometry(new Circle(center.getCoordinates(), radius));
    }
    return olFeature;
}

function updateCoordinatesHeight(coordinates) {
    const hasHeight = coordinates.find(coords => coords[2] !== undefined);
    if (hasHeight) {
        return coordinates.map(([lng, lat, height]) => [lng, lat, height === undefined ? 0 : height]);
    }
    return coordinates;
}

function updateGeometryHeight(geometry) {
    const geometryType = geometry?.type;
    if (geometryType === 'Point') {
        return { type: 'Point', coordinates: updateCoordinatesHeight([geometry.coordinates])[0] };
    }
    if (geometryType === 'LineString') {
        return { type: 'LineString', coordinates: updateCoordinatesHeight(geometry.coordinates) };
    }
    if (geometryType === 'Polygon') {
        return { type: 'Polygon', coordinates: geometry.coordinates.map(updateCoordinatesHeight) };
    }
    return geometry;
}

function toGeoJSONFeature({
    map,
    olFeature: _olFeature,
    feature,
    modifyPropertiesToFeatureProperties = () => ({})
}) {
    const mapProjection = map.getView().getProjection().getCode();
    let olFeature = _olFeature.clone();
    let properties = olFeature.get('@properties') || {};
    const { geometryType } = properties;
    if (geometryType === 'Circle' && olFeature.getGeometry() instanceof Circle) {
        properties = { ...properties, radius: olFeature.getGeometry().getRadius() };
        olFeature.setGeometry(new Point(olFeature.getGeometry().getCenter()));
    }
    if (geometryType === 'Circle' && olFeature.getGeometry() instanceof GeometryCollection) {
        properties = { ...properties, ...olFeature.get('@properties') };
        const geometries = olFeature.getGeometry().getGeometries();
        olFeature.setGeometry(geometries[geometries.length - 1].clone());
    }
    const { geometry } = geoJSON.writeFeatureObject(olFeature, {
        featureProjection: mapProjection,
        dataProjection: 'EPSG:4326'
    });

    return {
        ...feature,
        geometry: updateGeometryHeight(geometry),
        properties: modifyPropertiesToFeatureProperties(properties, feature)
    };
}

function getColor(color, opacity) {
    if (opacity === undefined) {
        return color;
    }
    const { r, g, b } = tinycolor(color).toRgb();
    return `rgba(${[r, g, b, opacity].join(', ')})`;
}

/**
 * Class to manage all modify interaction of OpenLayers library given a GeoJSON as input data
 * At the moment only `Feature` or `FeatureCollection` with single geometries are supported. **It does not support multi geometry types**.
 * Following feature properties are used by the edit tool:
 * - properties.geodesic {boolean} if true enabled geodesic geometries editing
 * - properties.radius {number} value in meters of radius for `Circle` geometry
 * @param {object} options.map a Cesium map instance
 * @param {object} options.geojson `Feature` or `FeatureCollection` GeoJSON data **does not support multi geometry types**
 * @prop {function} getGeometryType argument of the function is the feature and it should return a string representing the geometry type: `Point`, `LineString`, `Polygon` or `Circle`
 * @param {function} options.onEditEnd triggered one the editing has been completed
 * @param {object} options.style style for drawing geometries, see the `web/client/DrawUtils.js` file
 */
class OpenLayersModifyGeoJSONInteraction {
    constructor(options = {}) {
        // TODO: add support for multi geometry type. Verify if the interactions of OL are already supporting it
        this._map = options.map;
        const geojson = options.geojson;
        this._featureToModifyProperties = defaultFeatureToModifyProperties({ getGeometryType: options?.getGeometryType });
        const modifyPropertiesToFeatureProperties = defaultModifyPropertiesToFeatureProperties;
        const onEditEnd = options.onEditEnd ? options.onEditEnd : () => {};
        const style = generateEditingStyle(options.style);
        // not enabled yet on Cesium
        const enablePolygonHoles = !!options.enablePolygonHoles;

        let drawing = false;

        const source = new VectorSource({
            wrapX: false,
            format: new GeoJSON(),
            features: []
        });
        this._layer = new VectorLayer({
            source: source,
            style: this._createStyleFunction({ map: this._map, style }),
            zIndex: Infinity
        });
        this.setGeoJSON(geojson);
        this._modify = new Modify({
            source: source,
            style: (olFeature) => {
                // based on OpenLayers example
                // https://openlayers.org/en/latest/examples/draw-and-modify-geodesic.html
                olFeature.get('features').forEach((modifyFeature) => {
                    const modifyGeometry = modifyFeature.get('@modifyGeometry');
                    const { geometryType, radius } = modifyFeature.get('@properties') || {};
                    if (modifyGeometry && geometryType === 'Circle') {
                        const modifyPoint = olFeature.getGeometry().getCoordinates();
                        const geometries = modifyFeature.getGeometry().getGeometries();
                        const center = geometries[1].getCoordinates();
                        const projection = this._map.getView().getProjection();
                        let first;
                        let last;
                        let newRadius = radius;
                        if (!(modifyPoint[0] === center[0] && modifyPoint[1] === center[1])) {
                            // radius is being modified
                            first = transform(center, projection, 'EPSG:4326');
                            last = transform(modifyPoint, projection, 'EPSG:4326');
                            newRadius = getDistance(first, last);
                        }
                        // update the polygon using new center or radius
                        const circle = circular(
                            transform(center, projection, 'EPSG:4326'),
                            newRadius,
                            128
                        );
                        circle.transform('EPSG:4326', projection);
                        geometries[0].setCoordinates(circle.getCoordinates());
                        // save changes to be applied at the end of the interaction
                        modifyGeometry.setGeometries(geometries);
                        modifyFeature.set('@properties', { ...modifyFeature.get('@properties'), radius: newRadius });
                    }
                });
                return new Style({
                    image: new CircleStyle({
                        stroke: new Stroke({
                            color: getColor(style?.cursor?.color, style?.cursor?.opacity),
                            width: style?.cursor?.width
                        }),
                        radius: style?.cursor?.radius
                    })
                });
            }
        });
        this._modify.on('modifystart', (event) => {
            event.features.forEach((olFeature) => {
                const geometry = olFeature.getGeometry();
                if (geometry.getType() === 'GeometryCollection') {
                    olFeature.set('@modifyGeometry', geometry.clone(), true);
                }
            });
        });
        this._modify.on('modifyend', (event) => {
            event.features.forEach((olFeature) => {
                const modifyGeometry = olFeature.get('@modifyGeometry');
                if (modifyGeometry) {
                    olFeature.setGeometry(modifyGeometry);
                    olFeature.unset('@modifyGeometry', true);
                }
            });
            onEditEnd(
                this._normalizeGeoJSONResult((feature) => {
                    const olFeature = event.features.getArray().find(_olFeature => _olFeature.getId() === feature.id);
                    if (olFeature) {
                        return toGeoJSONFeature({
                            map: this._map,
                            olFeature,
                            feature,
                            modifyPropertiesToFeatureProperties
                        });
                    }
                    return feature;
                })
            );
        });

        this._map.addInteraction(this._modify);
        this._map.addLayer(this._layer);

        this._map.on('singleclick', this._onSingleClick);

        // extend line geometry with draw interaction
        // it works only with a single feature
        if (geojson?.geometry?.type === 'LineString') {
            this._draw = new Draw({
                type: 'LineString',
                stopClick: true,
                freehandCondition: never,
                style: (olFeature) => {
                    const [lineFeature] = source.getFeatures();
                    const { geodesic } = lineFeature.get('@properties') || {};
                    const lineStringCoordinates = lineFeature.getGeometry().getCoordinates();
                    const geometryCoordinates = olFeature.getGeometry().get('@coordinates');
                    const connectionLine = !drawing && [lineStringCoordinates[lineStringCoordinates.length - 1], olFeature.getGeometry().getCoordinates()];
                    const lineCoordinates = geometryCoordinates || connectionLine;
                    return [
                        ...(lineCoordinates
                            ? [
                                new Style({
                                    geometry: new LineString(lineCoordinates),
                                    stroke: new Stroke({
                                        color: getColor(style?.lineDrawing?.color, style?.lineDrawing?.opacity),
                                        width: style?.lineDrawing?.width,
                                        ...(style?.lineDrawing?.dashLength && { lineDash: [style.lineDrawing.dashLength] })
                                    })
                                }),
                                ...(geodesic
                                    ? [
                                        new Style({
                                            geometry: new LineString(transformCoordinatesToGeodesic(this._map, lineCoordinates)),
                                            stroke: new Stroke({
                                                color: getColor(style?.line?.color, style?.line?.opacity),
                                                width: style?.line?.width,
                                                ...(style?.line?.dashLength && { lineDash: [style.line.dashLength] })
                                            })
                                        })
                                    ]
                                    : [])
                            ]
                            : []),
                        new Style({
                            image: new CircleStyle({
                                stroke: new Stroke({
                                    color: getColor(style?.cursor?.color, style?.cursor?.opacity),
                                    width: style?.cursor?.width
                                }),
                                radius: style?.cursor?.radius
                            })
                        })
                    ];
                },
                geometryFunction: (coordinates, geometry) => {
                    let _geometry = geometry;
                    const [lineFeature] = source.getFeatures();
                    if (!_geometry) {
                        _geometry = new LineString([]);
                    }
                    const lineStringCoordinates = lineFeature.getGeometry().getCoordinates();
                    _geometry.setCoordinates([...lineStringCoordinates, ...coordinates]);
                    _geometry.set('@coordinates', [lineStringCoordinates[lineStringCoordinates.length - 1], ...coordinates]);
                    return _geometry;
                }
            });
            this._map.addInteraction(this._draw);
            this._draw.setActive(false);
            this._draw.on('drawstart', () => {
                drawing = !drawing;
                if (!drawing) {
                    this._draw.setActive(false);
                    this._modify.setActive(true);
                }
            });
            this._draw.on('drawend', (event) => {
                this._draw.setActive(false);
                this._modify.setActive(true);
                drawing = false;
                onEditEnd(
                    this._normalizeGeoJSONResult((feature) => {
                        return toGeoJSONFeature({
                            map: this._map,
                            olFeature: event.feature,
                            feature,
                            modifyPropertiesToFeatureProperties
                        });
                    })
                );
            });
        }

        if (geojson?.geometry?.type === 'Polygon' && enablePolygonHoles) {
            this._draw = new DrawHole({
                type: 'Polygon',
                stopClick: true,
                style: (olFeature) => {
                    const olGeometryType = olFeature.getGeometry().getType();
                    if (olGeometryType === 'Point') {
                        return new Style({
                            image: new CircleStyle({
                                stroke: new Stroke({
                                    color: getColor(style?.cursor?.color, style?.cursor?.opacity),
                                    width: style?.cursor?.width
                                }),
                                radius: style?.cursor?.radius
                            })
                        });
                    }
                    return this._createStyleFunction({ map: this._map, style })(olFeature);
                }
            });
            this._map.addInteraction(this._draw);
            this._draw.setActive(false);
            this._draw.on('drawstart', () => {
                drawing = true;
            });
            this._draw.on('drawend', (event) => {
                this._draw.setActive(false);
                this._modify.setActive(true);
                drawing = false;
                onEditEnd(
                    this._normalizeGeoJSONResult((feature) => {
                        if (event.feature.getId() === feature.id) {
                            return toGeoJSONFeature({
                                map: this._map,
                                olFeature: event.feature,
                                feature,
                                modifyPropertiesToFeatureProperties
                            });
                        }
                        return feature;
                    })
                );
            });
        }
    }

    setGeoJSON(geojson) {
        if (this._layer) {
            this._geojson = {...geojson};
            this._features = geojson?.type === 'Feature'
                ? [geojson]
                : geojson?.features;
            this._layer.getSource().clear();
            this._layer.getSource().addFeatures(
                this._features.map((feature) => toOLFeature({
                    map: this._map,
                    feature,
                    featureToModifyProperties: this._featureToModifyProperties
                }))
            );
        }
    }

    remove() {
        if (this._modify) {
            this._map.removeInteraction(this._modify);
            this._modify = null;
        }
        if (this._draw) {
            this._map.removeInteraction(this._draw);
            this._draw = null;
        }
        if (this._layer) {
            this._map.removeLayer(this._layer);
            this._layer = null;
        }
        if (this._onSingleClick) {
            this._map.un('singleclick', this._onSingleClick);
        }
    }

    _normalizeGeoJSONResult(callback) {
        const newFeatures = this._features.map(callback);
        return this._geojson?.type === 'Feature'
            ? newFeatures[0]
            : { type: 'FeatureCollection', features: newFeatures };
    }

    _onSingleClick = () => {
        if (this._draw && !this._draw.active) {
            this._draw.setActive(true);
            this._modify.setActive(false);
        }
    }

    _createStyleFunction({
        map,
        style
    }) {
        return (olFeature) => {
            const olGeometryType = olFeature.getGeometry().getType();
            const { geodesic, geometryType } = olFeature.get('@properties') || {};
            const coordinatesNodeStyle = new CircleStyle({
                stroke: new Stroke({
                    color: getColor(style?.coordinatesNode?.color, style?.coordinatesNode?.opacity),
                    width: style?.coordinatesNode?.width
                }),
                radius: style?.coordinatesNode?.radius
            });
            const lineStyle = new Stroke({
                color: getColor(style?.line?.color, style?.line?.opacity),
                width: style?.line?.width,
                ...(style?.line?.dashLength && { lineDash: [style.line.dashLength] })
            });
            const lineDrawingStyle = new Stroke({
                color: getColor(style?.lineDrawing?.color, style?.lineDrawing?.opacity),
                width: style?.lineDrawing?.width,
                ...(style?.lineDrawing?.dashLength && { lineDash: [style.lineDrawing.dashLength] })
            });
            const areaDrawingStyle = new Fill({
                color: getColor(style?.areaDrawing?.color, style?.areaDrawing?.opacity)
            });
            const areaStyle = new Fill({
                color: getColor(style?.area?.color, style?.area?.opacity)
            });
            if (geodesic && geometryType === 'Circle' && olGeometryType === 'GeometryCollection') {
                return [
                    new Style({
                        geometry: olFeature.get('@modifyGeometry') || olFeature.getGeometry(),
                        stroke: lineDrawingStyle,
                        fill: areaDrawingStyle
                    }),
                    new Style({
                        geometry: olFeature.get('@geometry'),
                        image: coordinatesNodeStyle
                    })
                ];
            }
            if (olGeometryType === 'Circle') {
                return [
                    new Style({
                        stroke: lineDrawingStyle,
                        fill: areaDrawingStyle
                    }),
                    new Style({
                        geometry: olFeature.get('@geometry'),
                        image: coordinatesNodeStyle
                    })
                ];
            }
            if (olGeometryType === 'LineString') {
                return [
                    new Style({
                        ...(geodesic && { geometry: new LineString(transformCoordinatesToGeodesic(map, olFeature.getGeometry().getCoordinates())) }),
                        stroke: geodesic ? lineStyle : lineDrawingStyle
                    }),
                    ...(geodesic ? [
                        new Style({
                            stroke: lineDrawingStyle
                        })
                    ] : []),
                    new Style({
                        geometry: new MultiPoint(olFeature.getGeometry().getCoordinates()),
                        image: coordinatesNodeStyle
                    })
                ];
            }
            if (olGeometryType === 'Polygon') {
                return [
                    new Style({
                        ...(geodesic && { geometry: new Polygon(
                            olFeature.getGeometry().getCoordinates().map((coordinates) => transformCoordinatesToGeodesic(map, coordinates))
                        )}),
                        stroke: geodesic ? lineStyle : lineDrawingStyle,
                        fill: geodesic ? areaStyle : areaDrawingStyle
                    }),
                    ...(geodesic ? [
                        new Style({
                            stroke: lineDrawingStyle
                        })
                    ] : []),
                    new Style({
                        geometry: new MultiPoint(olFeature.getGeometry().getCoordinates().reduce((acc, coordinates) => [...acc, ...coordinates], [])),
                        image: coordinatesNodeStyle
                    })
                ];
            }
            return new Style({
                image: coordinatesNodeStyle
            });
        };
    }
}

export default OpenLayersModifyGeoJSONInteraction;
