/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as Cesium from 'cesium';
import chroma from 'chroma-js';
import { castArray, isNumber, isEmpty, isEqual, pick, range } from 'lodash';
import { needProxy, getProxyUrl } from '../ProxyUtils';
import {
    resolveAttributeTemplate,
    geoStylerStyleFilter,
    drawIcons,
    getImageIdFromSymbolizer
} from './StyleParserUtils';
import { geometryFunctionsLibrary } from './GeometryFunctionsUtils';

const getGeometryFunction = geometryFunctionsLibrary.cesium({ Cesium });

function getCesiumColor({ color, opacity }) {
    const [r, g, b, a] = chroma(color).gl();
    if (opacity !== undefined) {
        return new Cesium.Color(r, g, b, opacity);
    }
    return new Cesium.Color(r, g, b, a);
}

function getPositionByGraphicKey(graphicKey, entity) {
    switch (graphicKey) {
    case 'polyline':
        return entity[graphicKey]?.positions;
    case 'polygon':
        return entity[graphicKey]?.hierarchy;
    default:
        return null;
    }
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

const getNumberAttributeValue = (value, properties) => {
    const constantHeight = parseFloat(value);

    if (!isNaN(constantHeight) && isNumber(constantHeight)) {
        return constantHeight;
    }

    const attributeValue = value?.type === "attribute" && parseFloat(properties[value.name]);

    if (!isNaN(attributeValue) && isNumber(attributeValue)) {
        return attributeValue;
    }
    return null;
};

const isGlobalOpacityChanged = (entity, globalOpacity) => (entity._msGlobalOpacity ?? 1) !== globalOpacity;

function getLeaderLinePositions({
    map,
    cartographic,
    heightReference,
    sampleTerrain
}) {
    return new Promise(resolve => {
        const drawLine = (zValue) => {
            const computedHeight = {
                none: cartographic.height,
                relative: cartographic.height + zValue,
                clamp: zValue
            };
            resolve(
                zValue === cartographic.height
                    ? undefined
                    : Cesium.Cartesian3.fromRadiansArrayHeights([
                        cartographic.longitude,
                        cartographic.latitude,
                        zValue,
                        cartographic.longitude,
                        cartographic.latitude,
                        computedHeight[heightReference ?? "none"]
                    ])
            );
        };
        const terrainProvider = map?.terrainProvider;
        if (!terrainProvider) {
            drawLine(0);
            return;
        }

        const readyPromise = terrainProvider.ready
            ? Promise.resolve(true)
            : terrainProvider.readyPromise;

        readyPromise.then(() => {
            const promise = terrainProvider?.availability
                ? Cesium.sampleTerrainMostDetailed(
                    terrainProvider,
                    [new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, 0)]
                )
                : sampleTerrain(
                    terrainProvider,
                    terrainProvider?.sampleTerrainZoomLevel ?? 18,
                    [new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, 0)]
                );
            if (Cesium.defined(promise)) {
                promise
                    .then((updatedPositions) => drawLine(updatedPositions?.[0]?.height ?? 0))
                    // the sampleTerrainMostDetailed from the Cesium Terrain is still using .otherwise
                    // and it resolve everything in the .then
                    // while the sampleTerrain uses .catch
                    // the optional chain help us to avoid error if catch is not exposed by the promise
                    ?.catch?.(() => drawLine(0));
            } else {
                drawLine(0);
            }
        });
    });
}

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

function addLeaderLineGraphic({
    map,
    symbolizer,
    entity,
    globalOpacity,
    sampleTerrain
}) {
    const compareKeys = [
        'msLeaderLineColor',
        'msLeaderLineOpacity',
        'msLeaderLineWidth',
        'msHeight',
        'msHeightReference',
        'offset'
    ];
    const shouldNotUpdateLeaderLine = entity._msSymbolizer
        && !isGlobalOpacityChanged(entity, globalOpacity)
        && isEqual(
            pick(symbolizer, compareKeys),
            pick(entity._msSymbolizer, compareKeys)
        );
    if (shouldNotUpdateLeaderLine) {
        return Promise.resolve({
            polyline: entity.polyline,
            billboard: entity.billboard,
            updated: false
        });
    }

    if (!symbolizer.msLeaderLineWidth) {
        return Promise.resolve({
            updated: entity.polyline !== undefined
        });
    }

    const cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
    const heightReference = symbolizer.msHeightReference;
    return (
        (
            symbolizer?.msHeight !== entity._msSymbolizer?.msHeight
            || symbolizer?.msHeightReference !== entity._msSymbolizer?.msHeightReference
            || !entity.polyline
        )
            ? getLeaderLinePositions({ map, cartographic, heightReference, sampleTerrain })
                .then((positions) => new Cesium.PolylineGraphics({ positions }))
            : Promise.resolve(entity.polyline)
    )
        .then((polyline) => {
            const color = getCesiumColor({
                color: symbolizer.msLeaderLineColor || '#000000',
                opacity: (symbolizer.msLeaderLineOpacity ?? 1) * globalOpacity
            });
            if (polyline) {
                polyline.material = color;
                polyline.width = symbolizer.msLeaderLineWidth ?? 1;
            }
            if (symbolizer.offset && (symbolizer.offset[0] !== 0 || symbolizer.offset[1] !== 0)) {
                const canvas = createLeaderLineCanvas(symbolizer);
                const billboard = new Cesium.BillboardGraphics({
                    image: canvas,
                    scale: 1,
                    pixelOffset: new Cesium.Cartesian2(
                        (symbolizer.offset[0] || 0) / 2,
                        (symbolizer.offset[1] || 0) / 2
                    ),
                    color
                });
                return {
                    billboard,
                    polyline,
                    updated: true
                };
            }
            return { polyline, updated: true };
        });
}

function modifyPointHeight({ entity, symbolizer, properties }) {
    // store the initial position of the feature created from the GeoJSON feature
    if (!entity._msPosition) {
        entity._msPosition = entity.position.getValue(Cesium.JulianDate.now());
    }

    const height = getNumberAttributeValue(symbolizer.msHeight, properties);

    if (height === null) {
        entity.position.setValue(entity._msPosition);
        return;
    }

    const cartographic = Cesium.Cartographic.fromCartesian(entity._msPosition);
    cartographic.height = height;
    entity.position.setValue(Cesium.Cartographic.toCartesian(cartographic));
    return;
}

const HEIGHT_REFERENCE_CONSTANTS_MAP = {
    none: 'NONE',
    relative: 'RELATIVE_TO_GROUND',
    clamp: 'CLAMP_TO_GROUND'
};

const GRAPHIC_KEYS = [
    'billboard',
    'box',
    'corridor',
    'cylinder',
    'ellipse',
    'ellipsoid',
    'label',
    'model',
    'tileset',
    'path',
    'plane',
    'point',
    'polygon',
    'polyline',
    'polylineVolume',
    'rectangle',
    'wall'
];

const getGraphics = ({
    symbolizer,
    images,
    entity,
    globalOpacity,
    properties,
    map,
    sampleTerrain
}) => {
    if (symbolizer.kind === 'Mark') {
        modifyPointHeight({ entity, symbolizer, properties });
        const { image, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer)) || {};
        if (image) {
            const side = width > height ? width : height;
            const scale = (symbolizer.radius * 2) / side;
            return addLeaderLineGraphic({
                map,
                symbolizer,
                entity,
                globalOpacity,
                sampleTerrain
            }).then(({ polyline }) => ({
                polyline,
                billboard: new Cesium.BillboardGraphics({
                    image,
                    scale,
                    rotation: Cesium.Math.toRadians(-1 * symbolizer.rotate || 0),
                    disableDepthTestDistance: symbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                    heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                    color: getCesiumColor({
                        color: '#ffffff',
                        opacity: 1 * globalOpacity
                    })
                })
            }));
        }
    }
    if (symbolizer.kind === 'Icon') {
        modifyPointHeight({ entity, symbolizer, properties });
        const { image, width, height } = images.find(({ id }) => id === getImageIdFromSymbolizer(symbolizer)) || {};
        if (image) {
            const side = width > height ? width : height;
            const scale = symbolizer.size / side;
            return addLeaderLineGraphic({
                map,
                symbolizer,
                entity,
                globalOpacity,
                sampleTerrain
            }).then(({ polyline }) =>({
                polyline,
                billboard: new Cesium.BillboardGraphics({
                    image,
                    scale,
                    pixelOffset: symbolizer.offset ? new Cesium.Cartesian2(symbolizer.offset[0], symbolizer.offset[1]) : null,
                    rotation: Cesium.Math.toRadians(-1 * symbolizer.rotate || 0),
                    disableDepthTestDistance: symbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                    heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                    color: getCesiumColor({
                        color: '#ffffff',
                        opacity: symbolizer.opacity * globalOpacity
                    })
                })
            }));
        }
    }
    if (symbolizer.kind === 'Text') {
        modifyPointHeight({ entity, symbolizer, properties });
        return addLeaderLineGraphic({
            map,
            symbolizer,
            entity,
            globalOpacity,
            sampleTerrain
        }).then(({ polyline, billboard }) => ({
            billboard,
            polyline,
            label: new Cesium.LabelGraphics({
                text: resolveAttributeTemplate({ properties }, symbolizer.label, ''),
                font: [symbolizer.fontStyle, symbolizer.fontWeight,  `${symbolizer.size}px`, castArray(symbolizer.font || ['serif']).join(', ')]
                    .filter(val => val)
                    .join(' '),
                fillColor: getCesiumColor({
                    color: symbolizer.color,
                    opacity: 1 * globalOpacity
                }),
                disableDepthTestDistance: symbolizer.msBringToFront ? Number.POSITIVE_INFINITY : 0,
                heightReference: Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'],
                pixelOffset: new Cesium.Cartesian2(symbolizer?.offset?.[0] ?? 0, symbolizer?.offset?.[1] ?? 0),
                // rotation is not available as property
                ...(symbolizer.haloWidth > 0 && {
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: getCesiumColor({
                        color: symbolizer.haloColor,
                        opacity: 1 * globalOpacity
                    }),
                    outlineWidth: symbolizer.haloWidth
                })
            })
        }));
    }
    if (symbolizer.kind === 'Model') {
        if (!symbolizer?.model) {
            return Promise.resolve({});
        }
        const compareKeys = ['model'];
        const shouldNotUpdateGraphics = entity.model
            && entity._msSymbolizer
            && isEqual(
                pick(symbolizer, compareKeys),
                pick(entity._msSymbolizer, compareKeys)
            );

        const model = shouldNotUpdateGraphics
            ? entity.model
            : new Cesium.ModelGraphics({
                uri: new Cesium.Resource({
                    proxy: needProxy(symbolizer?.model) ? new Cesium.DefaultProxy(getProxyUrl()) : undefined,
                    url: symbolizer?.model
                })
            });
        modifyPointHeight({ entity, symbolizer, properties });
        const position = entity._msPosition;
        const heading = Cesium.Math.toRadians(symbolizer?.heading ?? 0);
        const pitch = Cesium.Math.toRadians(symbolizer?.pitch ?? 0);
        const roll = Cesium.Math.toRadians(symbolizer?.roll ?? 0);
        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
        entity.orientation = orientation;

        model.scale = symbolizer?.scale ?? 1;
        model.color = getCesiumColor({
            color: symbolizer.color ?? '#ffffff',
            opacity: (symbolizer.opacity ?? 1) * globalOpacity
        });

        model.heightReference = Cesium.HeightReference[HEIGHT_REFERENCE_CONSTANTS_MAP[symbolizer.msHeightReference] || 'NONE'];

        return addLeaderLineGraphic({
            map,
            symbolizer,
            entity,
            globalOpacity,
            sampleTerrain
        }).then(({ polyline, updated  }) => ({
            ...((!shouldNotUpdateGraphics || updated) && {
                model,
                polyline
            })
        }));
    }
    if (symbolizer.kind === 'Line') {
        const polyline = new Cesium.PolylineGraphics({
            material: symbolizer?.dasharray
                ? getCesiumDashArray({
                    color: symbolizer.color,
                    opacity: symbolizer.opacity * globalOpacity,
                    dasharray: symbolizer.dasharray
                })
                : getCesiumColor({
                    color: symbolizer.color,
                    opacity: symbolizer.opacity * globalOpacity
                }),
            width: symbolizer.width,
            positions: entity._msStoredCoordinates.polyline,
            clampToGround: symbolizer.msClampToGround,
            arcType: symbolizer.msClampToGround
                ? Cesium.ArcType.GEODESIC
                : Cesium.ArcType.NONE
        });
        const geometryFunction = getGeometryFunction(symbolizer);
        if (geometryFunction) {
            geometryFunction({ polyline });
        }

        return Promise.resolve({ polyline });
    }
    if (symbolizer.kind === 'Fill') {
        const polygon = new Cesium.PolygonGraphics({
            material: getCesiumColor({
                color: symbolizer.color,
                opacity: symbolizer.fillOpacity * globalOpacity
            }),
            hierarchy: entity._msStoredCoordinates.polygon,
            // height should be introduced with concept of extrusion
            // height: 0,
            perPositionHeight: !symbolizer.msClampToGround,
            ...(!symbolizer.msClampToGround ? undefined : {classificationType: symbolizer.msClassificationType === 'terrain' ?
                Cesium.ClassificationType.TERRAIN :
                symbolizer.msClassificationType === '3d' ?
                    Cesium.ClassificationType.CESIUM_3D_TILE :
                    Cesium.ClassificationType.BOTH} ),
            arcType: symbolizer.msClampToGround
                ? Cesium.ArcType.GEODESIC
                : Cesium.ArcType.NONE
        });

        let polyline;
        // outline properties is not working in some browser see https://github.com/CesiumGS/cesium/issues/40
        // this is a workaround to visualize the outline with the correct side
        // this only for the footprint
        if (symbolizer.outlineColor && symbolizer.outlineWidth !== 0) {
            polyline = new Cesium.PolylineGraphics({
                material: getCesiumColor({
                    color: symbolizer.outlineColor,
                    opacity: symbolizer.outlineOpacity * globalOpacity
                }),
                width: symbolizer.outlineWidth,
                positions: entity._msStoredCoordinates.polygon.getValue().positions,
                clampToGround: symbolizer.msClampToGround,
                ...(!symbolizer.msClampToGround ? undefined : {classificationType: symbolizer.msClassificationType === 'terrain' ?
                    Cesium.ClassificationType.TERRAIN :
                    symbolizer.msClassificationType === '3d' ?
                        Cesium.ClassificationType.CESIUM_3D_TILE :
                        Cesium.ClassificationType.BOTH} ),
                arcType: symbolizer.msClampToGround
                    ? Cesium.ArcType.GEODESIC
                    : Cesium.ArcType.NONE
            });
        }
        return Promise.resolve({
            polygon,
            ...(polyline && { polyline })
        });
    }
    return Promise.resolve({});
};

function getStyleFuncFromRules({
    rules = []
} = {}, {
    images = []
}) {
    return ({
        entities,
        map,
        opacity: globalOpacity = 1,
        sampleTerrain = Cesium.sampleTerrain
    }) => Promise.all(
        ([...(entities || [])]).map((entity) => new Promise(resolve => {
            if (entity._msAdditional) {
                entity.entityCollection.remove(entity);
                return resolve(null);
            }
            let coordinates = {};
            GRAPHIC_KEYS.forEach((graphicKey) => {
                if (!entity._msStoredCoordinates) {
                    coordinates[graphicKey] = getPositionByGraphicKey(graphicKey, entity) || undefined;
                }
            });
            if (entity._msAdditionalEntities) {
                entity._msAdditionalEntities.forEach(additionalEntity => {
                    entity.entityCollection.remove(additionalEntity);
                });
                entity._msAdditionalEntities = undefined;
            }
            if (!entity._msStoredCoordinates) {
                entity._msStoredCoordinates = coordinates;
            }
            const properties = entity?.properties?.getValue(Cesium.JulianDate.now()) || {};
            const entityRules = rules?.filter((rule) => !rule.filter || geoStylerStyleFilter({ properties: properties || {}}, rule.filter));

            if (entityRules?.length > 0) {
                const entitySymbolizers = entityRules.reduce((acc, rule) => [...acc, ...rule?.symbolizers], []);
                const pointGeometrySymbolizers = entitySymbolizers.filter((symbolizer) =>
                    ['Mark', 'Icon', 'Text', 'Model'].includes(symbolizer.kind) && entity.position
                );
                const polylineGeometrySymbolizers = entitySymbolizers.filter((symbolizer) =>
                    symbolizer.kind === 'Line' && entity._msStoredCoordinates.polyline
                );
                const polygonGeometrySymbolizers = entitySymbolizers.filter((symbolizer) =>
                    symbolizer.kind === 'Fill' && entity._msStoredCoordinates.polygon
                );

                const additionalPointSymbolizers = entitySymbolizers.filter((symbolizer, idx) =>
                    ['Mark', 'Icon', 'Text', 'Model'].includes(symbolizer.kind)
                    && (
                        entity._msStoredCoordinates.polygon
                        || entity._msStoredCoordinates.polyline
                        || entity.position && idx < pointGeometrySymbolizers.length - 1
                    )
                );

                const getAdditionalEntities = () => {
                    if (additionalPointSymbolizers.length > 0) {
                        entity._msAdditionalEntities = [];
                        return Promise.all([...additionalPointSymbolizers].reverse().map((symbolizer, idx) => {
                            return new Promise(resolveAdditional => {
                                const geometryFunction = entity.position
                                    ? () => null
                                    : getGeometryFunction({ msGeometry: { name: 'centerPoint' }, ...symbolizer });
                                if (geometryFunction) {
                                    const additionalEntity = entity.entityCollection.add({
                                        position: entity.position
                                            ? entity.position.getValue(Cesium.JulianDate.now()).clone()
                                            : new Cesium.Cartesian3(0, 0, 0)
                                    });
                                    additionalEntity._msStoredCoordinates = entity._msStoredCoordinates;
                                    additionalEntity._msAdditional = true;
                                    additionalEntity.properties = entity.properties;
                                    geometryFunction(additionalEntity);
                                    entity._msAdditionalEntities.push(additionalEntity);
                                    return getGraphics({
                                        symbolizer,
                                        images,
                                        entity: additionalEntity,
                                        globalOpacity,
                                        properties,
                                        map,
                                        sampleTerrain
                                    }).then((graphics) => {
                                        GRAPHIC_KEYS.forEach((graphicKey) => {
                                            additionalEntity[graphicKey] = undefined;
                                        });
                                        Object.keys(graphics).forEach(graphicKey => {
                                            additionalEntity[graphicKey] = graphics[graphicKey];
                                        });
                                        if (additionalEntity.billboard) {
                                            // use eyeOffset as zIndex
                                            additionalEntity.billboard.eyeOffset = new Cesium.Cartesian3(0, 0, (idx + 1) * 10);
                                        }
                                        resolveAdditional(additionalEntity);
                                    });
                                }
                                return resolveAdditional(null);
                            });
                        }));
                    }
                    return Promise.resolve(null);
                };

                const symbolizer = pointGeometrySymbolizers[pointGeometrySymbolizers.length - 1]
                    || polylineGeometrySymbolizers[polylineGeometrySymbolizers.length - 1]
                    || polygonGeometrySymbolizers[polygonGeometrySymbolizers.length - 1];

                const clearEntity = () => {
                    if (!symbolizer && entity._msSymbolizer) {
                        GRAPHIC_KEYS.forEach((graphicKey) => {
                            entity[graphicKey] = undefined;
                        });
                        entity._msSymbolizer = undefined;
                        entity._msGlobalOpacity = undefined;
                    }
                    resolve(entity);
                };

                if ((symbolizer && (
                    !isEqual(symbolizer, entity._msSymbolizer)
                    || isGlobalOpacityChanged(entity, globalOpacity)
                )) || additionalPointSymbolizers.length > 0) {
                    return getAdditionalEntities().then(() => symbolizer
                        ? getGraphics({
                            symbolizer,
                            images,
                            entity,
                            globalOpacity,
                            properties,
                            map,
                            sampleTerrain
                        }).then((graphics) => {
                            if (!isEmpty(graphics)) {
                                GRAPHIC_KEYS.forEach((graphicKey) => {
                                    entity[graphicKey] = undefined;
                                });
                                Object.keys(graphics).forEach(graphicKey => {
                                    entity[graphicKey] = graphics[graphicKey];
                                });
                            }
                            entity._msSymbolizer = symbolizer;
                            entity._msGlobalOpacity = globalOpacity;
                            if (entity.billboard) {
                                // use eyeOffset as zIndex
                                entity.billboard.eyeOffset = new Cesium.Cartesian3(0, 0, 0);
                            }
                            resolve(entity);
                        })
                        : clearEntity());
                }

                return clearEntity();
            }

            GRAPHIC_KEYS.forEach((graphicKey) => {
                entity[graphicKey] = undefined;
            });
            entity._msSymbolizer = undefined;
            entity._msGlobalOpacity = undefined;
            return resolve(entity);
        }))
    // map.scene.requestRender(); does not work without a setTimeout
    // it seems there is need of a small delay to correctly request the next map rendering
    // requestRender is used by layer to update the style
    ).then((response) => new Promise((resolve) => setTimeout(() => resolve(response))));
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
                drawIcons(geoStylerStyle)
                    .then((images = []) => {
                        const styleFunc = getStyleFuncFromRules(geoStylerStyle, { images });
                        resolve(styleFunc);
                    });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default CesiumStyleParser;
