/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Point, Polygon, LineString, Circle } from 'ol/geom';
import {circular} from 'ol/geom/Polygon';
import {getDistance} from 'ol/sphere';
import {transform} from 'ol/proj';
import Feature from 'ol/Feature';
import { squaredDistance } from 'ol/coordinate';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import tinycolor from 'tinycolor2';
import { never } from 'ol/events/condition';
import { transformLineToArcs, reproject } from '../CoordinatesUtils';
import { generateEditingStyle } from '../DrawUtils';

const geoJSON = new GeoJSON();

const geodesicGeometryFunction = {
    'Circle': ({ map, onDrawing }) => (coordinates, geometry, projection) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new Polygon([]);
            _geometry.set('@geometry', new Point([]));
        }
        const projectionCode = projection ? projection.getCode() : map.getView().getProjection().getCode();
        const center = transform(coordinates[0], projectionCode, 'EPSG:4326');
        const last = transform(coordinates[1], projectionCode, 'EPSG:4326');
        const radius = getDistance(center, last);
        const circle = circular(center, radius, 128);
        circle.transform('EPSG:4326', projectionCode);
        _geometry.setCoordinates(circle.getCoordinates());
        _geometry.get('@geometry').setCoordinates(coordinates[0]);
        _geometry.set('@properties', { radius, geodesic: true });
        onDrawing({
            coordinates: [...coordinates]
        });
        return _geometry;
    },
    'LineString': ({ map, onDrawing }) => (coordinates, geometry, projection) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new LineString([]);
            _geometry.set('@geometry', new LineString([]));
        }
        const projectionCode = projection ? projection.getCode() : map.getView().getProjection().getCode();
        const geodesicCoordinates = transformLineToArcs(coordinates.map(c => {
            const point = reproject(c, projectionCode, 'EPSG:4326');
            return [point.x, point .y];
        }));
        _geometry.setCoordinates(geodesicCoordinates.map(c => {
            const point = reproject(c, 'EPSG:4326', projectionCode);
            return [point.x, point .y];
        }));
        _geometry.get('@geometry').setCoordinates(coordinates);
        _geometry.set('@properties', { geodesic: true });
        onDrawing({
            coordinates: [...coordinates]
        });
        return _geometry;
    },
    'Polygon': ({ map, onDrawing }) => (coordinates, geometry, projection) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new Polygon([]);
            _geometry.set('@geometry', new Polygon([]));
        }
        const projectionCode = projection ? projection.getCode() : map.getView().getProjection().getCode();
        let _coordinates = coordinates[0].length
            ? [[...coordinates[0], coordinates[0][0]]]
            : [];
        const geodesicCoordinates = transformLineToArcs(_coordinates[0].map(c => {
            const point = reproject(c, projectionCode, 'EPSG:4326');
            return [point.x, point .y];
        }));
        _geometry.setCoordinates([geodesicCoordinates.map(c => {
            const point = reproject(c, 'EPSG:4326', projectionCode);
            return [point.x, point .y];
        })]);
        _geometry.get('@geometry').setCoordinates(_coordinates);
        _geometry.set('@properties', { geodesic: true });
        onDrawing({
            coordinates: [..._coordinates]
        });
        return _geometry;
    }
};

const defaultGeometryFunction = {
    'Point': ({ onDrawing }) => (coordinates, geometry) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new Point([]);
        }
        _geometry.setCoordinates(coordinates);
        onDrawing({
            coordinates: [...coordinates]
        });
        return _geometry;
    },
    'Circle': ({ onDrawing }) => (coordinates, geometry) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new Circle([]);
            _geometry.set('@geometry', new Point([]));
        }
        const squaredLength = squaredDistance( coordinates[0], coordinates[1] );
        const radius = Math.sqrt(squaredLength);
        _geometry.setCenterAndRadius(coordinates[0], radius);
        _geometry.get('@geometry').setCoordinates(coordinates[0]);
        _geometry.set('@properties', { radius });
        onDrawing({
            coordinates: [...coordinates]
        });
        return _geometry;
    },
    'LineString': ({ onDrawing }) => (coordinates, geometry) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new LineString([]);
        }
        _geometry.setCoordinates(coordinates);
        onDrawing({
            coordinates: [...coordinates]
        });
        return _geometry;
    },
    'Polygon': ({ onDrawing }) => (coordinates, geometry) => {
        let _geometry = geometry;
        if (!_geometry) {
            _geometry = new Polygon([]);
        }
        let _coordinates = coordinates[0].length
            ? [[...coordinates[0], coordinates[0][0]]]
            : [];
        _geometry.setCoordinates(_coordinates);
        onDrawing({
            coordinates: [..._coordinates]
        });
        return _geometry;
    }
};

function getColor(color, opacity) {
    if (opacity === undefined) {
        return color;
    }
    const { r, g, b } = tinycolor(color).toRgb();
    return `rgba(${[r, g, b, opacity].join(', ')})`;
}

/**
 * Class to manage all the drawing interaction of OpenLayers library
 * @param {string} options.type type of drawing, one of: `Point`, `LineString`, `Polygon` or `Circle`
 * @param {object} options.map a Cesium map instance
 * @param {number} options.coordinatesLength maximum count of drawing coordinates
 * @param {object} options.style style for drawing geometries, see the `web/client/DrawUtils.js` file
 * @param {boolean} options.geodesic if true the geometries height will be forced to the ellipsoid at 0 height
 * @param {function} options.onDrawStart triggered on draw start
 * @param {function} options.onDrawing triggered while drawing
 * @param {function} options.onDrawEnd triggered when the drawing event is completed (double click)
 */
class OpenLayersDrawGeometryInteraction {
    constructor(options = {}) {
        const geometryType = options.type;
        const coordinatesLength = options.coordinatesLength;
        const geodesic = !!options.geodesic;
        const onDrawStart = options.onDrawStart ? options.onDrawStart : () => {};
        const onDrawing = options.onDrawing ? options.onDrawing : () => {};
        const onDrawEnd = options.onDrawEnd ? options.onDrawEnd : () => {};
        this._map = options.map;
        const style = generateEditingStyle(options.style);
        const source = new VectorSource({ wrapX: false });
        this._layer = new VectorLayer({
            source: source,
            zIndex: Infinity,
            style: (olFeature) => {
                const olGeometryType = olFeature.getGeometry().getType();
                const lineStyle = new Stroke({
                    color: getColor(style?.line?.color, style?.line?.opacity),
                    width: style?.line?.width,
                    ...(style?.line?.dashLength && { lineDash: [style.line.dashLength, style.line.dashLength] })
                });
                const areaStyle = new Fill({
                    color: getColor(style?.area?.color, style?.area?.opacity)
                });

                if (olGeometryType === 'Point') {
                    return new Style({
                        image: new CircleStyle({
                            stroke: new Stroke({
                                color: getColor(style?.coordinatesNode?.color, style?.coordinatesNode?.opacity),
                                width: style?.coordinatesNode?.width
                            }),
                            radius: style?.coordinatesNode?.radius
                        })
                    });
                }
                if (olGeometryType === 'LineString') {
                    return new Style({
                        stroke: lineStyle
                    });
                }
                return new Style({
                    stroke: lineStyle,
                    fill: areaStyle
                });
            }
        });

        const geometryFunction = geodesic && geodesicGeometryFunction[geometryType]
            ? geodesicGeometryFunction[geometryType]
            : defaultGeometryFunction[geometryType];

        this._draw = new Draw({
            source: source,
            type: geometryType,
            maxPoints: coordinatesLength,
            stopClick: true,
            freehandCondition: never,
            geometryFunction: geometryFunction ? geometryFunction({ map: this._map, onDrawing }) : undefined,
            style: (olFeature) => {
                const olGeometryType = olFeature.getGeometry().getType();
                const lineDrawingStyle = new Stroke({
                    color: getColor(style?.lineDrawing?.color, style?.lineDrawing?.opacity),
                    width: style?.lineDrawing?.width,
                    ...(style?.lineDrawing?.dashLength && { lineDash: [style.lineDrawing.dashLength, style.lineDrawing.dashLength] })
                });
                const areaDrawingStyle = new Fill({
                    color: getColor(style?.areaDrawing?.color, style?.areaDrawing?.opacity)
                });

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
                if (olGeometryType === 'LineString' && geometryType === 'LineString') {
                    return new Style({
                        stroke: lineDrawingStyle
                    });
                }
                if ((olGeometryType === 'Polygon' && ['Polygon', 'Circle'].includes(geometryType))
                || olGeometryType === 'Circle') {
                    return new Style({
                        stroke: lineDrawingStyle,
                        fill: areaDrawingStyle
                    });
                }
                return null;
            }
        });
        this._draw.on('drawstart', () => {
            onDrawStart();
        });
        this._draw.on('drawend', (event) => {
            const properties = event.feature.getGeometry().get('@properties') || { geodesic };
            const feature = event.feature.getGeometry().get('@geometry')
                ? new Feature({ geometry: event.feature.getGeometry().get('@geometry') })
                : event.feature;
            onDrawEnd({
                feature: {
                    ...geoJSON.writeFeatureObject(feature, {
                        featureProjection: this._map.getView().getProjection().getCode(),
                        dataProjection: 'EPSG:4326'
                    }),
                    properties
                }
            });
        });
        this._map.addInteraction(this._draw);
        this._map.addLayer(this._layer);
    }
    getCoordinates() {
        return [];
    }
    remove() {
        if (this._draw) {
            this._map.removeInteraction(this._draw);
            this._draw = null;
        }
        if (this._layer) {
            this._map.removeLayer(this._layer);
            this._layer = null;
        }
    }
}

export default OpenLayersDrawGeometryInteraction;
