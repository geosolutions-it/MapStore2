/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import turfLength from '@turf/length';
import turfAlong from '@turf/along';
import turfCenter from '@turf/center';
import { transformLineToArcs, reproject } from '../CoordinatesUtils';

export const isMSGeometryFunction = (got) => [
    'centerPoint',
    'lineToArc',
    'startPoint',
    'endPoint'
].includes(got?.name);

export const geometryFunctionsLibrary = {
    /**
     * creates geometry function utils for Cesium library
     * @param {object} options
     * @param {object} options.Cesium a Cesium lib instance
     * @returns {function} geometry function utils for cesium
     */
    cesium: ({ Cesium }) => {
        const getPositions = (entity) => {
            if (entity._msStoredCoordinates.polygon) {
                const hierarchy = entity._msStoredCoordinates.polygon.getValue(Cesium.JulianDate.now());
                return {
                    type: 'Polygon',
                    positions: hierarchy.positions.filter((pos, idx) => idx < hierarchy.positions.length - 1)
                };
            }
            if (entity._msStoredCoordinates.polyline) {
                return {
                    type: 'LineString',
                    positions: entity._msStoredCoordinates.polyline.getValue(Cesium.JulianDate.now())
                };
            }
            return { positions: [] };
        };
        const geometryFunctions = {
            centerPoint: (entity) => {
                const { positions, type } = getPositions(entity);
                const cartographic = positions.map(position => {
                    const { longitude, latitude, height } = Cesium.Cartographic.fromCartesian(position);
                    return [Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height];
                });
                if (type === 'LineString') {
                    const distance = positions.reduce((sum, position, idx) =>
                        positions[idx + 1]
                            ? sum + Cesium.Cartesian3.distance(position, positions[idx + 1])
                            : sum,
                    0) / 2;
                    const cartographicLengths = cartographic.map((coords, idx) => {
                        const partialsPositions = positions.filter((pos, jdx) => jdx < idx + 1);
                        return [
                            coords[0],
                            coords[1],
                            coords[2],
                            partialsPositions.reduce((sum, position, jdx) =>
                                partialsPositions[jdx + 1]
                                    ? sum + Cesium.Cartesian3.distance(position, partialsPositions[jdx + 1])
                                    : sum,
                            0)
                        ];
                    });
                    const maxPosition = cartographicLengths.find((position) => position[3] > distance);
                    const minIndex = cartographicLengths.indexOf(maxPosition) - 1;
                    const minPosition = cartographicLengths[minIndex];
                    const deltaDistance = distance - minPosition[3];
                    const minCartesian = Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(minPosition[0], minPosition[1], minPosition[2]));
                    const normal = Cesium.Cartesian3.normalize(
                        Cesium.Cartesian3.subtract(
                            Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(maxPosition[0], maxPosition[1], maxPosition[2])),
                            minCartesian,
                            new Cesium.Cartesian3()
                        ),
                        new Cesium.Cartesian3()
                    );
                    entity.position = Cesium.Cartesian3.add(
                        minCartesian,
                        Cesium.Cartesian3.multiplyByScalar(
                            normal,
                            deltaDistance,
                            new Cesium.Cartesian3()
                        ),
                        new Cesium.Cartesian3()
                    );
                    return entity;
                }

                const { geometry } = turfCenter({ type: 'Polygon', coordinates: [[ ...cartographic, cartographic[0] ]] }) || {};
                const averageHeight = cartographic.reduce((sum, [ , , hgt]) => sum + hgt, 0) / cartographic.length;
                const coordinates = [geometry.coordinates[0], geometry.coordinates[1], averageHeight] || [0, 0, 0];

                entity.position = Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coordinates));
                return entity;
            },
            lineToArc: (entity) => {
                if (entity.polyline) {
                    entity.polyline.arcType = Cesium.ArcType.GEODESIC;
                }
                return entity;
            },
            startPoint: (entity) => {
                const { positions } = getPositions(entity);
                entity.position = positions[0];
                return entity;
            },
            endPoint: (entity) => {
                const { positions } = getPositions(entity);
                entity.position = positions[positions.length - 1];
                return entity;
            }
        };
        return (symbolizer) => {
            const { msGeometry } = symbolizer;
            if (isMSGeometryFunction(msGeometry) && geometryFunctions[msGeometry?.name]) {
                return geometryFunctions[msGeometry.name];
            }
            return null;
        };
    },
    /**
     * creates geometry function utils for OpenLayers library
     * @param {object} options
     * @param {class} options.Point ol/geom/Point class
     * @param {class} options.LineString ol/geom/LineString class
     * @param {class} options.GeoJSON ol/format/GeoJSON class
     * @param {function} options.getCenter from ol/extent
     * @returns {function} geometry function utils for OpenLayers
     */
    openlayers: ({
        Point,
        LineString,
        GeoJSON,
        getCenter
    }) => {
        const geoJSONParser = new GeoJSON();
        const geometryFunctions = {
            centerPoint: (map) => (feature) => {
                const type = feature.getGeometry().getType();
                if (['Point', 'MultiPoint'].includes(type)) {
                    return feature.getGeometry();
                }
                const mapProjection = map
                    ? map.getView().getProjection().getCode()
                    : 'EPSG:3857';
                const geometry = feature.getGeometry();
                if (['LineString'].includes(type)) {
                    const lineStringGeoJSON = JSON.parse(geoJSONParser.writeFeature(feature, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: mapProjection
                    }));
                    const distance = turfLength(lineStringGeoJSON) / 2;
                    const pointGeoJSON = turfAlong(lineStringGeoJSON, distance);
                    const point = reproject(pointGeoJSON.geometry.coordinates, 'EPSG:4326', mapProjection);
                    return new Point([point.x, point.y]);
                }
                const extent = geometry.getExtent();
                const center = getCenter(extent);
                return new Point(center);
            },
            lineToArc: (map) => (feature) => {
                const mapProjection = map
                    ? map.getView().getProjection().getCode()
                    : 'EPSG:3857';
                const type = feature.getGeometry().getType();
                if (type === 'LineString' || type === 'MultiPoint') {
                    let coordinates = feature.getGeometry().getCoordinates();
                    coordinates = transformLineToArcs(coordinates.map(c => {
                        const point = reproject(c, mapProjection, 'EPSG:4326');
                        return [point.x, point .y];
                    }));
                    return new LineString(coordinates.map(c => {
                        const point = reproject(c, 'EPSG:4326', mapProjection);
                        return [point.x, point .y];
                    }));
                }
                return feature.getGeometry();
            },
            startPoint: () => (feature) => {
                const geom = feature.getGeometry();
                const type = geom.getType();
                if (['Point', 'MultiPoint'].includes(type)) {
                    return feature.getGeometry();
                }
                let coordinates = type === 'Polygon' ? geom.getCoordinates()[0] : geom.getCoordinates();
                return coordinates.length > 1 ? new Point(coordinates[0]) : null;
            },
            endPoint: () => (feature) => {
                const geom = feature.getGeometry();
                const type = geom.getType();
                if (['Point', 'MultiPoint'].includes(type)) {
                    return feature.getGeometry();
                }
                let coordinates = type === 'Polygon' ? geom.getCoordinates()[0] : geom.getCoordinates();
                return new Point(coordinates.length > 3 ? coordinates[coordinates.length - (type === 'Polygon' ? 2 : 1)] : coordinates[coordinates.length - 1]);
            }
        };
        return (symbolizer, feature, map) => {
            const { msGeometry } = symbolizer;
            if (isMSGeometryFunction(msGeometry) && geometryFunctions[msGeometry?.name]) {
                return {
                    geometry: geometryFunctions[msGeometry.name](map)
                };
            }
            const geometryType = feature?.getGeometry && feature?.getGeometry()?.getType();
            if (['Mark', 'Icon'].includes(symbolizer.kind) && ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometryType)) {
                return {
                    geometry: geometryFunctions.centerPoint(map)
                };
            }
            return null;
        };
    },
    /**
     * creates geometry function utils for GeoJSON implementation such as Leaflet of Print parsers
     * @returns {function} geometry function utils for geojson implementations
     */
    geojson: () => {
        const geometryFunctions = {
            centerPoint: (feature) => {
                if (['LineString'].includes(feature.geometry.type)) {
                    const distance = turfLength(feature) / 2;
                    const pointGeoJSON = turfAlong(feature, distance);
                    return pointGeoJSON.geometry.coordinates;
                }
                const pointGeoJSON = turfCenter(feature);
                return pointGeoJSON.geometry.coordinates;
            },
            lineToArc: (feature) => {
                if (feature.geometry.type === 'LineString') {
                    return transformLineToArcs(feature.geometry.coordinates);
                }
                return null;
            },
            startPoint: (feature) => {
                if (feature.geometry.type === 'Polygon') {
                    return feature.geometry.coordinates[0][0];
                }
                if (feature.geometry.type === 'LineString') {
                    return feature.geometry.coordinates[0];
                }
                return null;
            },
            endPoint: (feature) => {
                if (feature.geometry.type === 'Polygon') {
                    return feature.geometry.coordinates[0][feature.geometry.coordinates[0].length - 2];
                }
                if (feature.geometry.type === 'LineString') {
                    return feature.geometry.coordinates[feature.geometry.coordinates.length - 1];
                }
                return null;
            }
        };
        return (symbolizer) => {
            const { msGeometry } = symbolizer;
            if (isMSGeometryFunction(msGeometry) && geometryFunctions[msGeometry?.name]) {
                return geometryFunctions[msGeometry.name];
            }
            return null;
        };
    }
};
