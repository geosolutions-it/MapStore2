/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import { castArray, isNumber, isEqual, range, isNaN } from 'lodash';
import { needProxy, getProxyUrl } from '../ProxyUtils';
import {
    resolveAttributeTemplate,
    geoStylerStyleFilter,
    getImageIdFromSymbolizer,
    parseSymbolizerExpressions
} from './StyleParserUtils';
import { drawIcons } from './IconUtils';
import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';
import EllipseGeometryLibrary from '@cesium/engine/Source/Core/EllipseGeometryLibrary';
import CylinderGeometryLibrary from '@cesium/engine/Source/Core/CylinderGeometryLibrary';

const getGeometryFunction = geometryFunctionsLibrary.cesium({ Cesium });

function getCesiumColor({ color, opacity }) {
    if (!color) {
        return new Cesium.Color(0, 0, 0, 0);
    }
    const [r, g, b, a] = chroma(color).gl();
    if (opacity !== undefined) {
        return new Cesium.Color(r, g, b, opacity);
    }
    return new Cesium.Color(r, g, b, a);
}

function getCesiumDashArray({ color, opacity, dasharray }) {
    if (dasharray?.length <= 0) {
        return getCesiumColor({ color, opacity });
    }
    const dashLength = dasharray.reduce((acc, value) => acc + value, 0);
    return new Cesium.PolylineDashMaterialProperty({
        color: getCesiumColor({ color, opacity }),
        dashLength,
        dashPattern: parseInt((dasharray
            .map((value) => Math.floor(value / dashLength * 16))
            .map((value, idx) => range(value).map(() => idx % 2 === 0 ? '1' : '0').join(''))
            .join('')), 2)
    });
}

const getNumberAttributeValue = (value) => {
    const constantHeight = parseFloat(value);
    if (!isNaN(constantHeight) && isNumber(constantHeight)) {
        return constantHeight;
    }
    return null;
};

const getPositionsRelativeToTerrain = ({
    map,
    positions,
    heightReference: _heightReference,
    sampleTerrain,
    initialHeight
}) => {

    const heightReference = _heightReference  ?? 'none';

    const heightReferenceMap = {
        none: (originalHeight) => originalHeight,
        relative: (originalHeight, sampledHeight) => originalHeight + sampledHeight,
        clamp: (originalHeight, sampledHeight) => sampledHeight
    };

    let originalHeights = [];

    const computeHeight = (cartographicPositions) => {
        const computeHeightReference = heightReferenceMap[heightReference];
        let minHeight = Infinity;
        let maxHeight = -Infinity;
        let minSampledHeight = Infinity;
        let maxSampledHeight = -Infinity;
        const newPositions = cartographicPositions.map((cartographic, idx) => {
            const originalHeight = originalHeights[idx] || 0;
            const sampledHeight = heightReference === 'none' ? 0 : cartographic.height || 0;
            const height = computeHeightReference(originalHeight, sampledHeight);
            minHeight = height < minHeight ? height : minHeight;
            maxHeight = height > maxHeight ? height : maxHeight;
            minSampledHeight = sampledHeight < minSampledHeight ? sampledHeight : minSampledHeight;
            maxSampledHeight = sampledHeight > maxSampledHeight ? sampledHeight : maxSampledHeight;
            return Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                height
            );
        });
        return {
            height: {
                min: minHeight,
                max: maxHeight
            },
            sampledHeight: {
                min: minSampledHeight,
                max: maxSampledHeight
            },
            positions: newPositions
        };
    };

    const cartographicPositions = positions.map(cartesian => {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        originalHeights.push(initialHeight ?? cartographic.height ?? 0);
        return new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, initialHeight ?? 0);
    });

    const terrainProvider = map?.terrainProvider;

    if (heightReference === 'none' || !terrainProvider) {
        return Promise.resolve(computeHeight(cartographicPositions));
    }

    const promise = terrainProvider?.availability
        ? Cesium.sampleTerrainMostDetailed(
            terrainProvider,
            cartographicPositions
        )
        : sampleTerrain(
            terrainProvider,
            terrainProvider?.sampleTerrainZoomLevel ?? 18,
            cartographicPositions
        );
    if (Cesium.defined(promise)) {
        return promise
            .then((updatedCartographicPositions) => {
                return computeHeight(updatedCartographicPositions);
            })
            // the sampleTerrainMostDetailed from the Cesium Terrain is still using .otherwise
            // and it resolve everything in the .then
            // while the sampleTerrain uses .catch
            // the optional chain help us to avoid error if catch is not exposed by the promise
            ?.catch?.(() => {
                return computeHeight(cartographicPositions);
            });
    }
    return computeHeight(cartographicPositions);

};

const cachedLeaderLineCanvas = {};

function createLeaderLineCanvas({
    offset = [],
    msLeaderLineWidth
}) {
    const lineWidth = msLeaderLineWidth ?? 1;
    const width = Math.abs(offset[0] || 1);
    const height = Math.abs(offset[1] || 1);
    const isLeftTopDiagonal = Math.sign(offset[0]) === Math.sign(offset[1]);
    const key = [width, height, lineWidth, isLeftTopDiagonal].join(';');
    if (cachedLeaderLineCanvas[key]) {
        return cachedLeaderLineCanvas[key];
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(...(isLeftTopDiagonal ? [0, 0] : [width, 0]));
    ctx.lineTo(...(isLeftTopDiagonal ? [width, height] : [0, height]));
    ctx.stroke();
    cachedLeaderLineCanvas[key] = canvas;
    return canvas;
}

const translatePoint = (cartesian, symbolizer) => {
    const { msTranslateX, msTranslateY } = symbolizer || {};
    const x = getNumberAttributeValue(msTranslateX);
    const y = getNumberAttributeValue(msTranslateY);
    return (x || y)
        ? Cesium.Matrix4.multiplyByPoint(
            Cesium.Transforms.eastNorthUpToFixedFrame(cartesian),
            new Cesium.Cartesian3(x || 0, y || 0, 0),
            new Cesium.Cartesian3()
        )
        : cartesian;
};

const HEIGHT_REFERENCE_CONSTANTS_MAP = {
    none: 'NONE',
    relative: 'RELATIVE_TO_GROUND',
    clamp: 'CLAMP_TO_GROUND'
};

const anchorToOrigin = (anchor) => {
    switch (anchor) {
    case 'top-left':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.TOP
        };
    case 'top':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.TOP
        };
    case 'top-right':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.TOP
        };
    case 'left':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER
        };
    case 'center':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER
        };
    case 'right':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.CENTER
        };
    case 'bottom-left':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        };
    case 'bottom':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        };
    case 'bottom-right':
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        };
    default:
        return {
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER
        };
    }
};

const getVolumeShape = (shape = 'Square', radius = 1) => {
    if (shape === 'Circle') {
        const positions = [];
        for (let i = 0; i < 360; i++) {
            const radians = Cesium.Math.toRadians(i);
            positions.push(
                new Cesium.Cartesian2(
                    radius * Math.cos(radians),
                    radius * Math.sin(radians)
                )
            );
        }
        return positions;
    }
    if (shape === 'Square') {
        return [
            new Cesium.Cartesian2(-radius, -radius),
            new Cesium.Cartesian2(radius, -radius),
            new Cesium.Cartesian2(radius, radius),
            new Cesium.Cartesian2(-radius, radius)
        ];
    }
    return [];
};

const isCompatibleGeometry = ({ geometry, symbolizer }) => {
    if (geometry.type === 'Point' && ['Fill', 'Line'].includes(symbolizer.kind)) {
        return false;
    }
    if (geometry.type === 'LineString' && ['Fill'].includes(symbolizer.kind)) {
        return false;
    }
    if (geometry.type === 'Polygon' && ['Line'].includes(symbolizer.kind)) {
        return false;
    }
    return true;
};

const getOrientation = (position, symbolizer) => {
    const { heading, pitch, roll } = symbolizer || {};
    if (heading || pitch || roll) {
        const hpr = new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading ?? 0),
            Cesium.Math.toRadians(pitch ?? 0),
            Cesium.Math.toRadians(roll ?? 0));
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        return orientation;
    }
    return null;
};

const getCirclePositions = (position, symbolizer) => {
    const radius = symbolizer.radius;
    const geodesic = symbolizer.geodesic;
    const slices = 128;
    const center = position;
    let positions;
    if (geodesic) {
        const { outerPositions } = EllipseGeometryLibrary.computeEllipsePositions({
            granularity: 0.02,
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            rotation: 0,
            center
        }, false, true);
        positions = Cesium.Cartesian3.unpackArray(outerPositions);
        positions = [...positions, positions[0]];
    } else {
        const modelMatrix = Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
                center
            ),
            new Cesium.Cartesian3(0, 0, 0),
            new Cesium.Matrix4()
        );
        positions = CylinderGeometryLibrary.computePositions(0.0, radius, radius, slices, false);
        positions = Cesium.Cartesian3.unpackArray(positions);
        positions = [...positions.splice(0, Math.ceil(positions.length / 2))];
        positions = positions.map((cartesian) =>
            Cesium.Matrix4.multiplyByPoint(modelMatrix, cartesian, new Cesium.Cartesian3())
        );
        positions = [...positions, positions[0]];
    }
    return positions;
};

const changePositionHeight = (cartesian, symbolizer) =>{
    const { msHeight } = symbolizer || {};
    const height = getNumberAttributeValue(msHeight);
    if (height !== null) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        return Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height
        );
    }
    return cartesian;
};

const primitiveGeometryTypes = {
    point: (options) => {
        const { feature, primitive, parsedSymbolizer } = options;
        if (feature.geometry.type === 'Point') {
            const position = changePositionHeight(feature.positions[0][0], parsedSymbolizer);
            const orientation = getOrientation(position, parsedSymbolizer);
            return {
                ...options,
                primitive: {
                    ...primitive,
                    orientation,
                    geometry: translatePoint(position, parsedSymbolizer)
                }
            };
        }
        const geometryFunction = getGeometryFunction({ msGeometry: { name: 'centerPoint' }, ...parsedSymbolizer });
        const { position } = geometryFunction(feature);
        const orientation = getOrientation(position, parsedSymbolizer);
        return {
            ...options,
            primitive: {
                ...primitive,
                orientation,
                geometry: translatePoint(
                    changePositionHeight(position, parsedSymbolizer),
                    parsedSymbolizer
                )
            }
        };
    },
    leaderLine: (options, { map, sampleTerrain }) => {
        const { parsedSymbolizer } = options;
        // remove the translations and height options
        // to get the original position
        const { msTranslateX, msTranslateY, msHeight, ...pointParsedSymbolizer } = parsedSymbolizer;
        // use point function to compute geometry transformations
        const { primitive } = primitiveGeometryTypes.point({ ...options, parsedSymbolizer: pointParsedSymbolizer });
        return Promise.all([
            getPositionsRelativeToTerrain({
                map,
                positions: [primitive.geometry],
                heightReference: 'clamp',
                sampleTerrain
            }).then((computed) => computed.positions[0]),
            getPositionsRelativeToTerrain({
                map,
                positions: [
                    translatePoint(
                        changePositionHeight(primitive.geometry, parsedSymbolizer),
                        parsedSymbolizer
                    )
                ],
                heightReference: parsedSymbolizer.msHeightReference,
                sampleTerrain
            }).then((computed) => computed.positions[0])
        ]).then((positions) => {
            return {
                ...options,
                primitive: {
                    ...primitive,
                    geometry: [positions]
                }
            };
        });
    },
    polyline: (options, { map, sampleTerrain }) => {
        const { feature, primitive, parsedSymbolizer } = options;
        const extrudedHeight = getNumberAttributeValue(parsedSymbolizer.msExtrudedHeight);
        const height = getNumberAttributeValue(parsedSymbolizer.msHeight);
        if (height !== null || !!parsedSymbolizer.msExtrusionRelativeToGeometry) {
            let minHeight = Infinity;
            let maxHeight = -Infinity;
            return Promise.all(feature?.positions.map((positions) => {
                return getPositionsRelativeToTerrain({
                    map,
                    positions,
                    heightReference: parsedSymbolizer.msHeightReference,
                    sampleTerrain,
                    initialHeight: height
                }).then((computed) => {
                    const computedHeight = computed[parsedSymbolizer.msExtrusionRelativeToGeometry ? 'height' : 'sampledHeight'];
                    minHeight = computedHeight.min < minHeight ? computedHeight.min : minHeight;
                    maxHeight = computedHeight.max > maxHeight ? computedHeight.max : maxHeight;
                    return computed.positions;
                });
            })).then((geometry) => {
                return {
                    ...options,
                    primitive: {
                        ...primitive,
                        geometry,
                        // in case of relative or clamp
                        // extrusion will be relative to the height
                        // so 0 value should be considered undefined
                        extrudedHeight: extrudedHeight
                            ? extrudedHeight + (
                                extrudedHeight > 0
                                    ? maxHeight
                                    : minHeight
                            )
                            : undefined
                    }
                };
            });
        }
        return {
            ...options,
            primitive: {
                ...primitive,
                geometry: feature?.positions,
                ...(extrudedHeight !== null && { extrudedHeight })
            }
        };
    },
    wall: (options, configs) => {
        return Promise.resolve(primitiveGeometryTypes.polyline(options, configs))
            .then(({ primitive }) => {
                return {
                    ...options,
                    primitive: {
                        ...primitive,
                        geometry: primitive?.geometry,
                        minimumHeights: primitive?.geometry?.map((positions) => {
                            return positions.map((cartesian) => {
                                return Cesium.Cartographic.fromCartesian(cartesian).height;
                            });
                        }),
                        maximumHeights: primitive?.geometry?.map((positions) => {
                            return positions.map(() => {
                                return primitive.extrudedHeight;
                            });
                        })
                    }
                };
            });
    },
    polygon: (options, { map, sampleTerrain }) => {
        const { feature, primitive, parsedSymbolizer } = options;
        const extrudedHeight = getNumberAttributeValue(parsedSymbolizer.msExtrudedHeight);
        const height = getNumberAttributeValue(parsedSymbolizer.msHeight);
        if ((parsedSymbolizer.msHeightReference || 'none') !== 'none' || !!parsedSymbolizer.msExtrusionRelativeToGeometry) {
            let minHeight = Infinity;
            let maxHeight = -Infinity;
            return Promise.all(feature?.positions.map((positions) => {
                return getPositionsRelativeToTerrain({
                    map,
                    positions,
                    heightReference: parsedSymbolizer.msHeightReference,
                    sampleTerrain,
                    initialHeight: height
                }).then((computed) => {
                    const computedHeight = computed[parsedSymbolizer.msExtrusionRelativeToGeometry ? 'height' : 'sampledHeight'];
                    minHeight = computedHeight.min < minHeight ? computedHeight.min : minHeight;
                    maxHeight = computedHeight.max > maxHeight ? computedHeight.max : maxHeight;
                    return computed.positions;
                });
            })).then((geometry) => {
                const extrusionParams = {
                    // height will be computed on the geometry
                    height: undefined,
                    // in case of relative or clamp
                    // extrusion will be relative to the height
                    // so 0 value should be considered undefined
                    extrudedHeight: extrudedHeight
                        ? extrudedHeight + (
                            extrudedHeight > 0
                                ? maxHeight
                                : minHeight
                        )
                        : undefined
                };
                return {
                    ...options,
                    primitive: {
                        ...primitive,
                        geometry,
                        ...(primitive?.entity?.polygon
                            ? {
                                entity: {
                                    polygon: {
                                        ...primitive?.entity?.polygon,
                                        ...extrusionParams
                                    }
                                }
                            }
                            : extrusionParams)
                    }
                };
            });
        }
        const extrusionParams = {
            ...(extrudedHeight !== null && { extrudedHeight }),
            ...(height !== null && {
                height,
                perPositionHeight: false
            })
        };
        return {
            ...options,
            primitive: {
                ...primitive,
                geometry: feature?.positions,
                ...(primitive?.entity?.polygon
                    ? {
                        entity: {
                            polygon: {
                                ...primitive?.entity?.polygon,
                                ...extrusionParams
                            }
                        }
                    }
                    : extrusionParams)
            }
        };
    },
    circlePolyline: (options) => {
        const { feature, primitive, parsedSymbolizer } = options;
        if (feature.geometry.type === 'Point') {
            const position = Cesium.Cartesian3.fromDegrees(
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[2] || 0
            );
            const positions = getCirclePositions(position, parsedSymbolizer);
            return {
                ...options,
                primitive: {
                    ...primitive,
                    geometry: [positions]
                }
            };
        }
        return options;
    },
    circlePolygon: (options) => {
        const { feature, primitive, parsedSymbolizer } = options;
        if (feature.geometry.type === 'Point') {
            const position = Cesium.Cartesian3.fromDegrees(
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[2] || 0
            );
            const positions = getCirclePositions(position, parsedSymbolizer);
            return {
                ...options,
                primitive: {
                    ...primitive,
                    geometry: [positions]
                }
            };
        }
        return options;
    }
};

const symbolizerToPrimitives = {
    Mark: ({ parsedSymbolizer, globalOpacity, images, symbolizer }) => {
        const { src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(parsedSymbolizer, symbolizer)) || {};
        const side = width > height ? width : height;
        const scale = (parsedSymbolizer.radius * 2) / side;
        return src && !isNaN(scale) ? [
            {
                type: 'point',
                geometryType: 'point',
                entity: {
                    billboard: {
                        image: src,
                        scale,
                        rotation: Cesium.Math.toRadians(-1 * parsedSymbolizer.rotate || 0),
                        disableDepthTestDistance: parsedSymbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                        heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[parsedSymbolizer.msHeightReference] || 'NONE'],
                        color: getCesiumColor({
                            color: '#ffffff',
                            opacity: 1 * globalOpacity
                        })
                    }
                }
            },
            ...(parsedSymbolizer.msLeaderLineWidth ? [
                {
                    type: 'leaderLine',
                    geometryType: 'leaderLine',
                    entity: {
                        polyline: {
                            material: getCesiumColor({
                                color: parsedSymbolizer.msLeaderLineColor || '#000000',
                                opacity: (parsedSymbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
                            }),
                            width: parsedSymbolizer.msLeaderLineWidth
                        }
                    }
                }
            ] : [])
        ] : [];
    },
    Icon: ({ parsedSymbolizer, globalOpacity, images, symbolizer }) => {
        const { src, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(parsedSymbolizer, symbolizer)) || {};
        const side = width > height ? width : height;
        const scale = parsedSymbolizer.size / side;
        return src && !isNaN(scale) ? [{
            type: 'point',
            geometryType: 'point',
            entity: {
                billboard: {
                    image: src,
                    scale,
                    ...anchorToOrigin(parsedSymbolizer.anchor),
                    pixelOffset: parsedSymbolizer.offset ? new Cesium.Cartesian2(parsedSymbolizer.offset[0], parsedSymbolizer.offset[1]) : null,
                    rotation: Cesium.Math.toRadians(-1 * parsedSymbolizer.rotate || 0),
                    disableDepthTestDistance: parsedSymbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                    heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[parsedSymbolizer.msHeightReference] || 'NONE'],
                    color: getCesiumColor({
                        color: '#ffffff',
                        opacity: parsedSymbolizer.opacity * globalOpacity
                    })
                }
            }
        },
        ...(parsedSymbolizer.msLeaderLineWidth ? [
            {
                type: 'leaderLine',
                geometryType: 'leaderLine',
                entity: {
                    polyline: {
                        material: getCesiumColor({
                            color: parsedSymbolizer.msLeaderLineColor || '#000000',
                            opacity: (parsedSymbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
                        }),
                        width: parsedSymbolizer.msLeaderLineWidth
                    }
                }
            }
        ] : [])] : [];
    },
    Text: ({ parsedSymbolizer, feature, globalOpacity }) => {
        const offsetX = getNumberAttributeValue(parsedSymbolizer?.offset?.[0]);
        const offsetY = getNumberAttributeValue(parsedSymbolizer?.offset?.[1]);
        return [
            {
                type: 'point',
                geometryType: 'point',
                entity: {
                    label: {
                        text: resolveAttributeTemplate({ properties: feature.properties }, parsedSymbolizer.label, ''),
                        font: [parsedSymbolizer.fontStyle, parsedSymbolizer.fontWeight,  `${parsedSymbolizer.size}px`, castArray(parsedSymbolizer.font || ['serif']).join(', ')]
                            .filter(val => val)
                            .join(' '),
                        fillColor: getCesiumColor({
                            color: parsedSymbolizer.color,
                            opacity: 1 * globalOpacity
                        }),
                        ...anchorToOrigin(parsedSymbolizer.anchor),
                        disableDepthTestDistance: parsedSymbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                        heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[parsedSymbolizer.msHeightReference] || 'NONE'],
                        pixelOffset: new Cesium.Cartesian2(offsetX ?? 0, offsetY ?? 0),
                        // rotation is not available as property
                        ...(parsedSymbolizer.haloWidth > 0 && {
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineColor: getCesiumColor({
                                color: parsedSymbolizer.haloColor,
                                opacity: 1 * globalOpacity
                            }),
                            outlineWidth: parsedSymbolizer.haloWidth
                        })
                    }
                }
            },
            ...(parsedSymbolizer.msLeaderLineWidth ? [
                {
                    type: 'leaderLine',
                    geometryType: 'leaderLine',
                    entity: {
                        polyline: {
                            material: getCesiumColor({
                                color: parsedSymbolizer.msLeaderLineColor || '#000000',
                                opacity: (parsedSymbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
                            }),
                            width: parsedSymbolizer.msLeaderLineWidth
                        }
                    }
                }
            ] : []),
            ...(parsedSymbolizer.msLeaderLineWidth && (offsetX || offsetY) ? [
                {
                    type: 'offset',
                    geometryType: 'point',
                    entity: {
                        billboard: {
                            image: createLeaderLineCanvas(parsedSymbolizer),
                            scale: 1,
                            pixelOffset: new Cesium.Cartesian2(
                                (offsetX || 0) / 2,
                                (offsetY || 0) / 2
                            ),
                            color: getCesiumColor({
                                color: parsedSymbolizer.msLeaderLineColor || '#000000',
                                opacity: (parsedSymbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
                            })
                        }
                    }
                }
            ] : [])
        ];
    },
    Model: ({ parsedSymbolizer, globalOpacity }) => {
        return parsedSymbolizer?.model ? [
            {
                type: 'point',
                geometryType: 'point',
                entity: {
                    model: {
                        uri: new Cesium.Resource({
                            proxy: needProxy(parsedSymbolizer?.model) ? new Cesium.DefaultProxy(getProxyUrl()) : undefined,
                            url: parsedSymbolizer?.model
                        }),
                        color: getCesiumColor({
                            color: parsedSymbolizer.color ?? '#ffffff',
                            opacity: (parsedSymbolizer.opacity ?? 1) * globalOpacity
                        }),
                        scale: parsedSymbolizer?.scale ?? 1,
                        heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[parsedSymbolizer.msHeightReference] || 'NONE']
                    }
                }
            },
            ...(parsedSymbolizer.msLeaderLineWidth ? [
                {
                    type: 'leaderLine',
                    geometryType: 'leaderLine',
                    entity: {
                        polyline: {
                            material: getCesiumColor({
                                color: parsedSymbolizer.msLeaderLineColor || '#000000',
                                opacity: (parsedSymbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
                            }),
                            width: parsedSymbolizer.msLeaderLineWidth
                        }
                    }
                }
            ] : [])
        ] : [];
    },
    Line: ({ parsedSymbolizer, feature, globalOpacity }) => {
        const geometryFunction = getGeometryFunction(parsedSymbolizer);
        const additionalOptions = geometryFunction ? geometryFunction(feature) : {};
        return [
            ...(parsedSymbolizer.color && parsedSymbolizer.width !== 0 ? [{
                type: 'polyline',
                geometryType: 'polyline',
                entity: {
                    polyline: {
                        material: parsedSymbolizer?.dasharray
                            ? getCesiumDashArray({
                                color: parsedSymbolizer.color,
                                opacity: parsedSymbolizer.opacity * globalOpacity,
                                dasharray: parsedSymbolizer.dasharray
                            })
                            : getCesiumColor({
                                color: parsedSymbolizer.color,
                                opacity: parsedSymbolizer.opacity * globalOpacity
                            }),
                        width: parsedSymbolizer.width,
                        clampToGround: parsedSymbolizer.msClampToGround,
                        arcType: parsedSymbolizer.msClampToGround
                            ? Cesium.ArcType.GEODESIC
                            : Cesium.ArcType.NONE,
                        ...additionalOptions
                    }
                }
            }] : []),
            ...((!parsedSymbolizer.msClampToGround && parsedSymbolizer.msExtrudedHeight && !parsedSymbolizer.msExtrusionType) ? [{
                type: 'polylineVolume',
                geometryType: 'wall',
                entity: {
                    wall: {
                        material: getCesiumColor({
                            color: parsedSymbolizer.msExtrusionColor || '#000000',
                            opacity: (parsedSymbolizer.msExtrusionOpacity ?? 1) * globalOpacity
                        })
                    }
                }
            }] : []),
            ...((!parsedSymbolizer.msClampToGround && parsedSymbolizer.msExtrudedHeight && parsedSymbolizer.msExtrusionType) ? [{
                type: 'polylineVolume',
                geometryType: 'polyline',
                entity: {
                    polylineVolume: {
                        material: getCesiumColor({
                            color: parsedSymbolizer.msExtrusionColor || '#000000',
                            opacity: (parsedSymbolizer.msExtrusionOpacity ?? 1) * globalOpacity
                        }),
                        shape: getVolumeShape(parsedSymbolizer.msExtrusionType, parsedSymbolizer.msExtrudedHeight / 2)
                    }
                }
            }] : [])
        ];
    },
    Fill: ({ parsedSymbolizer, feature, globalOpacity }) => {
        const isExtruded = !parsedSymbolizer.msClampToGround && !!parsedSymbolizer.msExtrudedHeight;
        const geometryFunction = getGeometryFunction(parsedSymbolizer);
        const additionalOptions = geometryFunction ? geometryFunction(feature) : {};
        return [
            {
                type: 'polygon',
                geometryType: 'polygon',
                clampToGround: parsedSymbolizer.msClampToGround,
                entity: {
                    polygon: {
                        material: getCesiumColor({
                            color: parsedSymbolizer.color,
                            opacity: parsedSymbolizer.fillOpacity * globalOpacity
                        }),
                        perPositionHeight: !parsedSymbolizer.msClampToGround,
                        ...(!parsedSymbolizer.msClampToGround ? undefined : {classificationType: parsedSymbolizer.msClassificationType === 'terrain' ?
                            Cesium.ClassificationType.TERRAIN :
                            parsedSymbolizer.msClassificationType === '3d' ?
                                Cesium.ClassificationType.CESIUM_3D_TILE :
                                Cesium.ClassificationType.BOTH} ),
                        arcType: parsedSymbolizer.msClampToGround
                            ? Cesium.ArcType.GEODESIC
                            : undefined,
                        ...additionalOptions
                    }
                }
            },
            // outline properties is not working in some browser see https://github.com/CesiumGS/cesium/issues/40
            // this is a workaround to visualize the outline with the correct side
            // this only for the footprint
            ...(parsedSymbolizer.outlineColor && parsedSymbolizer.outlineWidth !== 0 && !isExtruded ? [
                {
                    type: 'polyline',
                    geometryType: 'polyline',
                    entity: {
                        polyline: {
                            material: parsedSymbolizer?.outlineDasharray
                                ? getCesiumDashArray({
                                    color: parsedSymbolizer.outlineColor,
                                    opacity: parsedSymbolizer.outlineOpacity * globalOpacity,
                                    dasharray: parsedSymbolizer.outlineDasharray
                                })
                                : getCesiumColor({
                                    color: parsedSymbolizer.outlineColor,
                                    opacity: parsedSymbolizer.outlineOpacity * globalOpacity
                                }),
                            width: parsedSymbolizer.outlineWidth,
                            clampToGround: parsedSymbolizer.msClampToGround,
                            ...(!parsedSymbolizer.msClampToGround ? undefined : {classificationType: parsedSymbolizer.msClassificationType === 'terrain' ?
                                Cesium.ClassificationType.TERRAIN :
                                parsedSymbolizer.msClassificationType === '3d' ?
                                    Cesium.ClassificationType.CESIUM_3D_TILE :
                                    Cesium.ClassificationType.BOTH} ),
                            arcType: parsedSymbolizer.msClampToGround
                                ? Cesium.ArcType.GEODESIC
                                : Cesium.ArcType.NONE,
                            ...additionalOptions
                        }
                    }
                }
            ] : [])
        ];
    },
    Circle: ({ parsedSymbolizer, globalOpacity }) => {
        return [{
            type: 'polygon',
            geometryType: 'circlePolygon',
            clampToGround: parsedSymbolizer.msClampToGround,
            entity: {
                polygon: {
                    material: getCesiumColor({
                        color: parsedSymbolizer.color,
                        opacity: parsedSymbolizer.opacity * globalOpacity
                    }),
                    ...(parsedSymbolizer.geodesic
                        ? {
                            perPositionHeight: !parsedSymbolizer.msClampToGround,
                            ...(!parsedSymbolizer.msClampToGround ? undefined : {classificationType: parsedSymbolizer.msClassificationType === 'terrain' ?
                                Cesium.ClassificationType.TERRAIN :
                                parsedSymbolizer.msClassificationType === '3d' ?
                                    Cesium.ClassificationType.CESIUM_3D_TILE :
                                    Cesium.ClassificationType.BOTH} ),
                            arcType: Cesium.ArcType.GEODESIC
                        }
                        : {
                            perPositionHeight: true,
                            arcType: undefined
                        })
                }
            }
        },
        // outline properties is not working in some browser see https://github.com/CesiumGS/cesium/issues/40
        // this is a workaround to visualize the outline with the correct side
        // this only for the footprint
        ...(parsedSymbolizer.outlineColor && parsedSymbolizer.outlineWidth !== 0) ? [{
            type: 'polyline',
            geometryType: 'circlePolyline',
            entity: {
                polyline: {
                    material: parsedSymbolizer?.outlineDasharray
                        ? getCesiumDashArray({
                            color: parsedSymbolizer.outlineColor,
                            opacity: parsedSymbolizer.outlineOpacity * globalOpacity,
                            dasharray: parsedSymbolizer.outlineDasharray
                        })
                        : getCesiumColor({
                            color: parsedSymbolizer.outlineColor,
                            opacity: parsedSymbolizer.outlineOpacity * globalOpacity
                        }),
                    width: parsedSymbolizer.outlineWidth,
                    ...(parsedSymbolizer.geodesic
                        ? {
                            clampToGround: parsedSymbolizer.msClampToGround,
                            ...(!parsedSymbolizer.msClampToGround ? undefined : {classificationType: parsedSymbolizer.msClassificationType === 'terrain' ?
                                Cesium.ClassificationType.TERRAIN :
                                parsedSymbolizer.msClassificationType === '3d' ?
                                    Cesium.ClassificationType.CESIUM_3D_TILE :
                                    Cesium.ClassificationType.BOTH} ),
                            arcType: Cesium.ArcType.GEODESIC
                        }
                        : {
                            clampToGround: false,
                            arcType: Cesium.ArcType.NONE
                        })
                }
            }
        }] : []];
    }
};

const isGeometryChanged = (previousSymbolizer, currentSymbolizer) => {
    return previousSymbolizer?.msGeometry?.name !== currentSymbolizer?.msGeometry?.name
        || previousSymbolizer?.msHeight !== currentSymbolizer?.msHeight
        || previousSymbolizer?.msHeightReference !== currentSymbolizer?.msHeightReference
        || previousSymbolizer?.msExtrudedHeight !== currentSymbolizer?.msExtrudedHeight
        || previousSymbolizer?.msExtrusionRelativeToGeometry !== currentSymbolizer?.msExtrusionRelativeToGeometry
        || previousSymbolizer?.msExtrusionType !== currentSymbolizer?.msExtrusionType
        || previousSymbolizer?.msTranslateX !== currentSymbolizer?.msTranslateX
        || previousSymbolizer?.msTranslateY !== currentSymbolizer?.msTranslateY
        || previousSymbolizer?.heading !== currentSymbolizer?.heading
        || previousSymbolizer?.pitch !== currentSymbolizer?.pitch
        || previousSymbolizer?.roll !== currentSymbolizer?.roll;
};

const isSymbolizerChanged = (previousSymbolizer, currentSymbolizer) => {
    const { msGeometry: previousMsGeometry, ...previous } = previousSymbolizer;
    const { msGeometry, ...current } = currentSymbolizer;
    return !isEqual(previous, current);
};

const getStyledFeatures = ({ rules, features, globalOpacity, images }) => {
    return rules?.map((rule) => {
        const filteredFeatures = features
            .filter(({ properties }) => !rule.filter || geoStylerStyleFilter({ properties: properties || {}}, rule.filter));
        return rule.symbolizers.map((symbolizer) => {
            return filteredFeatures.filter(({ geometry }) => isCompatibleGeometry({ geometry, symbolizer })).map((feature) => {
                const parsedSymbolizer = parseSymbolizerExpressions(symbolizer, feature);
                const primitivesFunction = symbolizerToPrimitives[parsedSymbolizer.kind]
                    ? symbolizerToPrimitives[parsedSymbolizer.kind]
                    : () => [];
                return primitivesFunction({
                    feature,
                    symbolizer,
                    images,
                    parsedSymbolizer,
                    globalOpacity
                }).map((primitive) => ({
                    id: `${feature.id}:${parsedSymbolizer.symbolizerId}:${primitive.type}`,
                    feature,
                    primitive,
                    symbolizer,
                    parsedSymbolizer
                }));
            }).flat();
        }).flat();
    }).flat();
};

function getStyleFuncFromRules({
    rules = []
} = {}) {
    return ({
        opacity: globalOpacity = 1,
        features,
        getPreviousStyledFeature = () => {},
        map,
        sampleTerrain = Cesium.sampleTerrain
    }) => {
        return drawIcons({ rules }, { features })
            .then((images) => {
                const styledFeatures = getStyledFeatures({ rules, features, globalOpacity, images });
                return Promise.all(styledFeatures.map((currentFeature) => {
                    const previousFeature = getPreviousStyledFeature(currentFeature);
                    if (!previousFeature || isGeometryChanged(previousFeature.parsedSymbolizer, currentFeature.parsedSymbolizer)) {
                        const computeGeometry = primitiveGeometryTypes[currentFeature?.primitive?.geometryType]
                            ? primitiveGeometryTypes[currentFeature?.primitive?.geometryType]
                            : () => currentFeature;
                        return Promise.resolve(computeGeometry(currentFeature, { map, sampleTerrain }))
                            .then((payload) => {
                                return {
                                    ...payload,
                                    action: 'replace'
                                };
                            });
                    }
                    return Promise.resolve({
                        ...currentFeature,
                        primitive: {
                            ...previousFeature?.primitive,
                            ...currentFeature?.primitive,
                            geometry: previousFeature?.primitive?.geometry,
                            entity: {
                                ...(Object.keys(currentFeature?.primitive?.entity || {}).reduce((acc, key) => {
                                    return {
                                        ...acc,
                                        [key]: {
                                            ...previousFeature?.primitive?.entity?.[key],
                                            ...currentFeature?.primitive?.entity?.[key]
                                        }
                                    };
                                }, {}))
                            }
                        },
                        action: isSymbolizerChanged(previousFeature.parsedSymbolizer, currentFeature.parsedSymbolizer)
                            ? 'update'
                            : 'none'
                    });
                }));
            })
            .then((updatedStyledFeatures) => {
                // remove all styled features without geometry
                return updatedStyledFeatures.filter(({ primitive }) => !!primitive.geometry);
            });
    };
}

class CesiumStyleParser {

    readStyle() {
        return new Promise((resolve, reject) => {
            try {
                resolve(null);
            } catch (error) {
                reject(error);
            }
        });
    }

    writeStyle(geoStylerStyle) {
        return new Promise((resolve, reject) => {
            try {
                const styleFunc = getStyleFuncFromRules(geoStylerStyle);
                resolve(styleFunc);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default CesiumStyleParser;
