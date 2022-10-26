/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect } from 'react';
import * as Cesium from 'cesium';
import uuidv1 from 'uuid/v1';

import DrawGeometrySupport from './DrawGeometrySupport';
import {
    MeasureTypes,
    convertUom,
    mapUomAreaToLength
} from '../../../utils/MeasureUtils';
import {
    getCesiumColor,
    createPolylinePrimitive,
    createPolygonPrimitive,
    clearPrimitivesCollection,
    createCircleMarkerImage
} from '../../../utils/cesium/PrimitivesUtils';
import {
    computeMiddlePoint,
    computeAngles,
    computeTriangleMiddlePoint,
    computeSlopes
} from '../../../utils/cesium/MathUtils';

function computeAngleLineCoordinates(coordinates) {
    const aDistance = Cesium.Cartesian3.distance(coordinates[1], coordinates[0]);
    const bDistance = Cesium.Cartesian3.distance(coordinates[1], coordinates[2]);

    const aNormal = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(coordinates[0], coordinates[1], new Cesium.Cartesian3()),
        new Cesium.Cartesian3());
    const bNormal = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(coordinates[2], coordinates[1], new Cesium.Cartesian3()), new Cesium.Cartesian3());

    // const middleCoordinates = computeTriangleMiddlePoint(coordinates);
    const middleNormal = Cesium.Cartesian3.normalize(
        computeMiddlePoint(
            aNormal,
            bNormal
        ),
        new Cesium.Cartesian3()
    );

    const angleDistance = (aDistance > bDistance ? bDistance : aDistance) / 3;
    return [aNormal, middleNormal, bNormal].map(normal => {
        return Cesium.Cartesian3.add(
            coordinates[1],
            Cesium.Cartesian3.multiplyByScalar(normal, angleDistance, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
        );
    });
}

function measureFeatureToCartesianCoordinates(feature) {

    const { properties = {}, geometry = {} } = feature;
    const { measureType } = properties;
    const { coordinates = []} = geometry;

    switch (measureType) {
    case MeasureTypes.HEIGHT_FROM_TERRAIN:
        return [
            Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...properties?.terrainCoordinates)),
            Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coordinates))
        ];
    case MeasureTypes.POINT_COORDINATES:
        return [Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coordinates))];
    case MeasureTypes.ANGLE_3D:
    case MeasureTypes.POLYLINE_DISTANCE_3D:
        return coordinates.map((coords) => Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coords)));
    case MeasureTypes.SLOPE:
    case MeasureTypes.AREA_3D:
        return coordinates[0].map((coords) => Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromDegrees(...coords)));
    default:
        return [];
    }
}

/**
 * This component extend the DrawGeometry support mapping the measure type to the correspondent geometry.
 * This adds also the Cesium Primitives to visualize the measurement geometries
 * @name DrawMeasureSupport
 * @prop {object} map instance of the current map library in use
 * @prop {boolean} [active=false] activate the drawing functionalities
 * @prop {string} type measurement type to enable, one of: POLYLINE_DISTANCE_3D, AREA_3D, POINT_COORDINATES, HEIGHT_FROM_TERRAIN, ANGLE_3D and SLOPE
 * @prop {string} clearId value that trigger clear process
 * @prop {boolean} hideInfoLabel hide labels the show the measure value
 * @prop {boolean} hideSegmentsLengthLabels hide labels that show segment distance value
 * @prop {function} onUpdateCollection callback triggered on draw end with the updated feature collection
 * @prop {object} unitsOfMeasure object that list all the measure type unit of measure in use eg: { [MeasureTypes.POLYLINE_DISTANCE_3D]: { value: 'm', label: 'm' }, ... }
 * @prop {object} tooltipLabels object that list all the tooltip messages eg: { [MeasureTypes.POLYLINE_DISTANCE_3D]: { start: 'Draw start' }, ... }
 * @prop {object} infoLabelsFormat object that list all the info messages format functions eg: { [MeasureTypes.POLYLINE_DISTANCE_3D]: value => value, ... }
 */
function DrawMeasureSupport({
    map,
    active = false,
    type,
    clearId,
    hideInfoLabel,
    hideSegmentsLengthLabels,
    onUpdateCollection = () => {},
    unitsOfMeasure = {},
    tooltipLabels = {},
    style = {
        primaryLabel: {
            font: '12px sans-serif',
            fillColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
        },
        secondaryLabel: {
            font: '12px sans-serif',
            fillColor: '#ffffff',
            outlineColor: '#000000',
            outlineWidth: 4,
            offset: [0, -16]
        },
        tooltip: {
            font: '12px sans-serif',
            fillColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            offset: [8, 8]
        },
        lineDrawing: {
            color: '#000000',
            opacity: 1.0,
            depthFailColor: '#000000',
            depthFailOpacity: 0.4,
            width: 3,
            dashLength: 8.0
        },
        line: {
            color: '#ffcc33',
            opacity: 1.0,
            depthFailColor: '#ffcc33',
            depthFailOpacity: 0.4,
            width: 2
        },
        areaDrawing: {
            color: '#ffffff',
            opacity: 0.5,
            depthFailColor: '#ffffff',
            depthFailOpacity: 0.25
        },
        area: {
            color: '#ffffff',
            opacity: 0.5,
            depthFailColor: '#ffffff',
            depthFailOpacity: 0.25
        },
        cursor: {
            color: '#000000'
        },
        coordinatesNode: {
            color: '#333333'
        }
    },
    infoLabelsFormat = {
        [MeasureTypes.POLYLINE_DISTANCE_3D]: (value) => value,
        [MeasureTypes.AREA_3D]: (value) => value,
        [MeasureTypes.HEIGHT_FROM_TERRAIN]: (value) => value,
        [MeasureTypes.ANGLE_3D]: (value) => value,
        [MeasureTypes.SLOPE]: (value) => value,
        [MeasureTypes.POINT_COORDINATES]: (value, { latitude, longitude } = {}) =>
            `latitude: ${latitude.toFixed(6)}\n` +
            `longitude: ${longitude.toFixed(6)}\n` +
            `altitude: ${value}`
    },
    getPositionInfo
}) {

    const staticPrimitivesCollection = useRef();
    const dynamicPrimitivesCollection = useRef();

    const staticBillboardCollection = useRef();
    const dynamicBillboardCollection = useRef();

    const staticLabelsCollection = useRef();
    const dynamicLabelsCollection = useRef();

    const collection = useRef({ type: 'FeatureCollection', features: [] });

    const cursorImage = useRef();
    const coordinateNodeImage = useRef();

    const unitsOfMeasureRef = useRef();
    unitsOfMeasureRef.current = unitsOfMeasure;

    const tooltipLabelsRef = useRef();
    tooltipLabelsRef.current = tooltipLabels;

    const infoLabelsFormatRef = useRef();
    infoLabelsFormatRef.current = infoLabelsFormat;

    function clearAll() {
        dynamicPrimitivesCollection.current.removeAll();
        dynamicBillboardCollection.current.removeAll();
        dynamicLabelsCollection.current.removeAll();

        staticPrimitivesCollection.current.removeAll();
        staticBillboardCollection.current.removeAll();
        staticLabelsCollection.current.removeAll();

        collection.current = { type: 'FeatureCollection', features: [] };
        onUpdateCollection(collection.current);
        map.scene.requestRender();
    }

    function getCoordinatesNodeStyle() {
        return {
            color: getCesiumColor({
                ...style?.coordinatesNode
            }),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        };
    }

    function getPrimaryLabelStyle() {
        const {
            font = '12px sans-serif',
            fillColor = '#ffffff',
            backgroundColor = 'rgba(0, 0, 0, 0.6)',
            offset = [0, -16]
        } = style?.primaryLabel || {};
        return {
            font,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            fillColor: getCesiumColor({
                color: fillColor
            }),
            showBackground: true,
            backgroundColor: getCesiumColor({
                color: backgroundColor
            }),
            backgroundPadding: new Cesium.Cartesian2(4, 4),
            pixelOffset: new Cesium.Cartesian2(...offset),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BASELINE
        };
    }

    function getSecondaryLabelStyle() {
        const {
            font = '12px sans-serif',
            fillColor = '#ffffff',
            outlineColor = '#000000',
            outlineWidth = 4
        } = style?.secondaryLabel || {};
        return {
            font,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            fillColor: getCesiumColor({
                color: fillColor
            }),
            outlineColor: getCesiumColor({
                color: outlineColor
            }),
            outlineWidth,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: false,
            backgroundPadding: new Cesium.Cartesian2(4, 4),
            pixelOffset: new Cesium.Cartesian2(0, 0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BASELINE
        };
    }

    function getTooltipLabelStyle() {
        const {
            font = '12px sans-serif',
            fillColor = '#ffffff',
            backgroundColor = 'rgba(0, 0, 0, 0.5)',
            offset = [8, 8]
        } = style?.tooltip || {};
        return {
            font,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            fillColor: getCesiumColor({
                color: fillColor
            }),
            showBackground: true,
            backgroundColor: getCesiumColor({
                color: backgroundColor
            }),
            backgroundPadding: new Cesium.Cartesian2(4, 4),
            pixelOffset: new Cesium.Cartesian2(...offset),
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.TOP
        };
    }

    function convertMeasure(unitOfMeasure, value, sourceUom) {
        return unitOfMeasure && unitOfMeasure.value !== sourceUom
            ? `${convertUom(value, sourceUom, unitOfMeasure.value).toFixed(2)} ${unitOfMeasure.label}`
            : `${value.toFixed(2)} ${unitOfMeasure.label}`;
    }

    function addSegmentsLabels(pCollection, coordinates, measureType) {
        const unitOfMeasure = measureType === MeasureTypes.AREA_3D
            ? mapUomAreaToLength[unitsOfMeasureRef.current[measureType]?.value]
            : unitsOfMeasureRef.current[measureType];
        if (!hideSegmentsLengthLabels) {
            return coordinates.map((currentCartesian, idx) => {
                const nextCartesian = coordinates[idx + 1];
                if (nextCartesian) {
                    const middlePoint = computeMiddlePoint(currentCartesian, nextCartesian);
                    const length = Cesium.Cartesian3.distance(currentCartesian, nextCartesian);
                    const label = convertMeasure(unitOfMeasure, length, 'm');
                    pCollection.add({
                        position: middlePoint,
                        text: label,
                        ...getSecondaryLabelStyle()
                    });
                    const { longitude, latitude, height } = Cesium.Cartographic.fromCartesian(middlePoint);
                    return [Cesium.Math.toDegrees(longitude), Cesium.Math.toDegrees(latitude), height, length, label];
                }
                return null;
            }).filter(val => val);
        }
        return null;
    }

    useEffect(() => {

        if (map) {
            staticPrimitivesCollection.current = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
            map.scene.primitives.add(staticPrimitivesCollection.current);

            staticBillboardCollection.current = new Cesium.BillboardCollection();
            map.scene.primitives.add(staticBillboardCollection.current);

            staticLabelsCollection.current = new Cesium.LabelCollection();
            map.scene.primitives.add(staticLabelsCollection.current);

            dynamicPrimitivesCollection.current = new Cesium.PrimitiveCollection({ destroyPrimitives: true });
            map.scene.primitives.add(dynamicPrimitivesCollection.current);

            dynamicBillboardCollection.current = new Cesium.BillboardCollection();
            map.scene.primitives.add(dynamicBillboardCollection.current);

            dynamicLabelsCollection.current = new Cesium.LabelCollection();
            map.scene.primitives.add(dynamicLabelsCollection.current);

            cursorImage.current = createCircleMarkerImage(12, { stroke: '#ffffff', strokeWidth: 2, fill: false});
            coordinateNodeImage.current = createCircleMarkerImage(8, { stroke: '#ffffff', strokeWidth: 2, fill: false});
        }

        return () => {
            if (map?.isDestroyed && !map.isDestroyed()) {
                clearPrimitivesCollection(map, staticPrimitivesCollection.current);
                staticPrimitivesCollection.current = null;
                clearPrimitivesCollection(map, staticBillboardCollection.current);
                staticBillboardCollection.current = null;
                clearPrimitivesCollection(map, staticLabelsCollection.current);
                staticLabelsCollection.current = null;

                clearPrimitivesCollection(map, dynamicPrimitivesCollection.current);
                dynamicPrimitivesCollection.current = null;
                clearPrimitivesCollection(map, dynamicBillboardCollection.current);
                dynamicBillboardCollection.current = null;
                clearPrimitivesCollection(map, dynamicLabelsCollection.current);
                dynamicLabelsCollection.current = null;
            }
        };

    }, [map]);

    useEffect(() => {
        if (!active) {
            dynamicPrimitivesCollection.current.removeAll();
            dynamicBillboardCollection.current.removeAll();
            dynamicLabelsCollection.current.removeAll();
            map.scene.requestRender();
        }
    }, [active]);

    useEffect(() => {
        if (clearId) {
            clearAll();
        }
    }, [clearId]);

    function featureToToPrimitives({
        coordinates,
        feature,
        measureType
    }) {

        let infoLabelText = '';
        let infoLabelTextPosition = coordinates[coordinates.length - 1];
        let segments;
        let angle;
        let slope;

        const unitOfMeasure = unitsOfMeasureRef.current[measureType];
        const infoLabelFormat = infoLabelsFormatRef.current[measureType];
        switch (measureType) {
        case MeasureTypes.HEIGHT_FROM_TERRAIN:
            staticBillboardCollection.current.add({
                position: coordinates[coordinates.length - 1],
                image: cursorImage.current,
                color: getCesiumColor({
                    color: '#ffff00'
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                allowPicking: false
            });
            infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, feature.properties.height, 'm'));
            staticPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.line, coordinates: [...coordinates ] }));
            break;
        case MeasureTypes.ANGLE_3D:
            staticPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.line, coordinates: [...coordinates] }));
            const [computedAngle] = computeAngles(coordinates);
            angle = computedAngle;
            infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, angle, 'deg'));
            infoLabelTextPosition = coordinates[1];
            staticPrimitivesCollection.current.add(createPolylinePrimitive({
                ...style?.line,
                coordinates: computeAngleLineCoordinates(coordinates)
            }));
            break;
        case MeasureTypes.SLOPE:
            staticPrimitivesCollection.current.add(createPolygonPrimitive({ ...style?.area, coordinates: [...coordinates] }));
            staticPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.line, coordinates: [...coordinates] }));
            const [computedSlope] = computeSlopes(coordinates, map?.camera?.position);
            slope = computedSlope;
            infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, slope, 'deg'));
            infoLabelTextPosition = computeTriangleMiddlePoint(coordinates);
            break;
        case MeasureTypes.POINT_COORDINATES:
            staticBillboardCollection.current.add({
                position: coordinates[coordinates.length - 1],
                image: cursorImage.current,
                color: getCesiumColor({
                    color: '#ffff00'
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                allowPicking: false
            });
            infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, feature.geometry.coordinates[2], 'm'), {
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0]
            });
            break;
        case MeasureTypes.POLYLINE_DISTANCE_3D:
            if (coordinates.length > 1) {
                staticPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.line, coordinates: [...coordinates] }));
                segments = addSegmentsLabels(staticLabelsCollection.current, coordinates, MeasureTypes.POLYLINE_DISTANCE_3D);
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, feature.properties.length, 'm'));
            }
            break;
        case MeasureTypes.AREA_3D:
            if (coordinates.length > 2) {
                staticPrimitivesCollection.current.add(createPolygonPrimitive({ ...style?.area, coordinates: [...coordinates] }));
                staticPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.line, coordinates: [...coordinates] }));
                segments = addSegmentsLabels(staticLabelsCollection.current, coordinates, MeasureTypes.AREA_3D);
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, feature.properties.area, 'm²'));
            }
            break;
        default:
            break;
        }

        if (!hideInfoLabel) {
            staticLabelsCollection.current.add({
                position: infoLabelTextPosition,
                text: infoLabelText,
                ...getPrimaryLabelStyle()
            });
        }

        const id = feature?.id ? feature.id : uuidv1();

        return {
            ...feature,
            id,
            properties: {
                ...feature?.properties,
                id,
                measureType,
                ...(segments && {
                    segments,
                    segmentsCRS: 'WGS84',
                    segmentsColumns: ['longitude', 'latitude', 'height:m', 'length:m', 'label']
                }),
                ...(infoLabelText && {
                    infoLabelText
                }),
                ...(angle && {
                    angle,
                    angleUom: 'deg'
                }),
                ...(slope && {
                    slope,
                    slopeUom: 'deg'
                })
            }
        };
    }

    function featureCollectionToPrimitives() {

        staticPrimitivesCollection.current.removeAll();
        staticBillboardCollection.current.removeAll();
        staticLabelsCollection.current.removeAll();

        const { features = [] } = collection.current || {};

        const newFeatures = features.map((feature) => {
            const coordinates = measureFeatureToCartesianCoordinates(feature);
            return featureToToPrimitives({
                coordinates,
                feature,
                measureType: feature?.properties?.measureType
            });
        });

        collection.current.features = newFeatures;
        onUpdateCollection(collection.current);

        map.scene.requestRender();
    }

    function updateStaticCoordinates(coordinates, { feature }) {

        const updatedFeature = featureToToPrimitives({
            coordinates,
            feature,
            measureType: type
        });

        collection.current.features.push(updatedFeature);

        onUpdateCollection(collection.current);

        map.scene.requestRender();
    }

    useEffect(() => {
        if (unitsOfMeasure[type]?.value) {
            featureCollectionToPrimitives();
        }
    }, [unitsOfMeasure[type]?.value]);

    function updateDynamicCoordinates(coordinates, {
        area,
        distance
    } = {}) {

        dynamicPrimitivesCollection.current.removeAll();
        dynamicBillboardCollection.current.removeAll();
        dynamicLabelsCollection.current.removeAll();

        let infoLabelText = '';
        let tooltipLabelText = '';
        let infoLabelTextPosition = coordinates[coordinates.length - 1];

        const unitOfMeasure = unitsOfMeasureRef.current[type];
        const tooltips = tooltipLabelsRef.current[type] || {};
        const infoLabelFormat = infoLabelsFormatRef.current[type];

        switch (type) {
        case MeasureTypes.HEIGHT_FROM_TERRAIN:
            tooltipLabelText = tooltips.start;
            if (coordinates?.length === 2) {
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({
                    ...style?.lineDrawing,
                    coordinates: [...coordinates]
                }));
                infoLabelText = distance ? infoLabelFormat(convertMeasure(unitOfMeasure, distance, 'm')) : '';
            }
            break;
        case MeasureTypes.ANGLE_3D:
            tooltipLabelText = tooltips.start;
            if (coordinates.length > 1) {
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.lineDrawing, coordinates: [...coordinates] }));
            }
            if (coordinates.length === 3) {
                const [angle] = computeAngles(coordinates);
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, angle, 'deg'));
                infoLabelTextPosition = coordinates[1];
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({
                    ...style?.lineDrawing,
                    coordinates: computeAngleLineCoordinates(coordinates)
                }));
            }
            break;
        case MeasureTypes.SLOPE:
            tooltipLabelText = tooltips.start;
            if (coordinates.length > 1) {
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.lineDrawing, coordinates: [...coordinates] }));
            }
            if (coordinates.length === 3) {
                dynamicPrimitivesCollection.current.add(createPolygonPrimitive({ ...style?.areaDrawing, coordinates: [...coordinates] }));
                const [slope] = computeSlopes(coordinates, map?.camera?.position);
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, slope, 'deg'));
                infoLabelTextPosition = computeTriangleMiddlePoint(coordinates);
            }
            break;
        case MeasureTypes.POINT_COORDINATES:
            tooltipLabelText = tooltips.start;
            if (coordinates[0]) {
                const cartographic = Cesium.Cartographic.fromCartesian(coordinates[0]);
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, cartographic.height, 'm'), {
                    latitude: cartographic.latitude,
                    longitude: cartographic.longitude
                });
            }
            break;
        case MeasureTypes.POLYLINE_DISTANCE_3D:
            tooltipLabelText = tooltips.start;
            if (coordinates.length > 1) {
                tooltipLabelText = tooltips.end;
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, distance, 'm'));
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.lineDrawing, coordinates: [...coordinates] }));
                addSegmentsLabels(dynamicLabelsCollection.current, coordinates, MeasureTypes.POLYLINE_DISTANCE_3D);
                coordinates.forEach((cartesian, idx) => {
                    if (idx !== (coordinates.length - 1)) {
                        dynamicBillboardCollection.current.add({
                            position: cartesian,
                            image: coordinateNodeImage.current,
                            ...getCoordinatesNodeStyle()
                        });
                    }
                });
            }
            break;
        case MeasureTypes.AREA_3D:
            tooltipLabelText = tooltips.start;
            if (coordinates.length > 1) {
                dynamicPrimitivesCollection.current.add(createPolygonPrimitive({ ...style?.areaDrawing, coordinates: [...coordinates] }));
                dynamicPrimitivesCollection.current.add(createPolylinePrimitive({ ...style?.lineDrawing, coordinates: [...coordinates] }));
                addSegmentsLabels(dynamicLabelsCollection.current, coordinates, MeasureTypes.AREA_3D);
                coordinates.forEach((cartesian, idx) => {
                    if (idx !== (coordinates.length - 1)) {
                        dynamicBillboardCollection.current.add({
                            position: cartesian,
                            image: coordinateNodeImage.current,
                            ...getCoordinatesNodeStyle()
                        });
                    }
                });
            }
            if (coordinates.length > 2) {
                tooltipLabelText = tooltips.end;
                infoLabelText = infoLabelFormat(convertMeasure(unitOfMeasure, area, 'm²'));
            }
            if (coordinates.length === 2) {
                tooltipLabelText = tooltips.missingVertex;
            }
            break;
        default:
            break;
        }
        if (coordinates.length > 0) {
            dynamicBillboardCollection.current.add({
                position: coordinates[coordinates.length - 1],
                image: cursorImage.current,
                color: getCesiumColor({
                    ...style?.cursor
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            });
            dynamicLabelsCollection.current.add({
                position: coordinates[coordinates.length - 1],
                text: tooltipLabelText,
                ...getTooltipLabelStyle()
            });
            if (!hideInfoLabel) {
                dynamicLabelsCollection.current.add({
                    position: infoLabelTextPosition,
                    text: infoLabelText,
                    ...getPrimaryLabelStyle()
                });
            }
        }
        map.scene.requestRender();
    }

    function handleDrawUpdate({
        coordinates,
        area,
        distance
    }) {
        updateDynamicCoordinates(coordinates, {
            area,
            distance
        });
    }

    function handleDrawEnd({
        coordinates,
        feature
    }) {
        if (coordinates && feature) {
            updateStaticCoordinates(coordinates, {
                feature
            });
        }
    }

    function getGeometryType() {
        switch (type) {
        case MeasureTypes.HEIGHT_FROM_TERRAIN:
        case MeasureTypes.POINT_COORDINATES:
            return 'Point';
        case MeasureTypes.ANGLE_3D:
        case MeasureTypes.POLYLINE_DISTANCE_3D:
            return 'LineString';
        case MeasureTypes.SLOPE:
        case MeasureTypes.AREA_3D:
            return 'Polygon';
        default:
            return null;
        }
    }

    function getCoordinatesLength() {
        switch (type) {
        case MeasureTypes.ANGLE_3D:
        case MeasureTypes.SLOPE:
            return 3;
        case MeasureTypes.HEIGHT_FROM_TERRAIN:
        case MeasureTypes.POINT_COORDINATES:
        case MeasureTypes.POLYLINE_DISTANCE_3D:
        case MeasureTypes.AREA_3D:
            return null;
        default:
            return null;
        }
    }

    return (
        <DrawGeometrySupport
            key={type}
            map={map}
            active={active}
            geometryType={getGeometryType()}
            onDrawStart={handleDrawUpdate}
            onMouseMove={handleDrawUpdate}
            onDrawing={handleDrawUpdate}
            onDrawEnd={handleDrawEnd}
            depthTestAgainstTerrain={false}
            sampleTerrain={MeasureTypes.HEIGHT_FROM_TERRAIN === type}
            coordinatesLength={getCoordinatesLength()}
            getPositionInfo={getPositionInfo}
            getObjectsToExcludeOnPick={() => [
                dynamicPrimitivesCollection.current,
                dynamicBillboardCollection.current,
                dynamicLabelsCollection.current,
                staticPrimitivesCollection.current,
                staticBillboardCollection.current,
                staticLabelsCollection.current
            ]}
        />
    );
}

export default DrawMeasureSupport;
