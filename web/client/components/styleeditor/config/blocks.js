/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import includes from 'lodash/includes';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';

import property from './property';

import {SUPPORTED_MIME_TYPES} from "../../../utils/StyleEditorUtils";

const vector3dStyleOptions = ({ label = 'styleeditor.clampToGround', isDisabled }) => ({
    msClampToGround: property.msClampToGround({
        label,
        isDisabled
    })
});

const pointGeometryTransformation = () => ({
    msGeometry: property.select({
        label: 'styleeditor.geometryTransformation',
        key: 'msGeometry',
        disablePropertySelection: true,
        setValue: (value) => {
            if (!value) {
                return 'unset';
            }
            return value?.name;
        },
        getValue: (value) => {
            if (value === 'unset') {
                return { msGeometry: undefined };
            }
            return {
                msGeometry: { name: value }
            };
        },
        getOptions: () => [
            {
                value: 'unset',
                labelId: 'styleeditor.center'
            },
            {
                value: 'startPoint',
                labelId: 'styleeditor.startPoint'
            },
            {
                value: 'endPoint',
                labelId: 'styleeditor.endPoint'
            }
        ]
    })
});

const anchorProperty = () => ({
    anchor: property.select({
        label: 'styleeditor.anchor',
        key: 'anchor',
        setValue: (value) => {
            return value ? value : 'center';
        },
        getOptions: () => [
            {
                value: 'top-left',
                labelId: 'styleeditor.topLeft'
            },
            {
                value: 'top',
                labelId: 'styleeditor.top'
            },
            {
                value: 'top-right',
                labelId: 'styleeditor.topRight'
            },
            {
                value: 'left',
                labelId: 'styleeditor.left'
            },
            {
                value: 'center',
                labelId: 'styleeditor.center'
            },
            {
                value: 'right',
                labelId: 'styleeditor.right'
            },
            {
                value: 'bottom-left',
                labelId: 'styleeditor.bottomLeft'
            },
            {
                value: 'bottom',
                labelId: 'styleeditor.bottom'
            },
            {
                value: 'bottom-right',
                labelId: 'styleeditor.bottomRight'
            }
        ]
    })
});

const lineGeometryTransformation = () => ({
    msGeometry: property.select({
        label: 'styleeditor.geometryTransformation',
        key: 'msGeometry',
        disablePropertySelection: true,
        setValue: (value) => {
            if (!value) {
                return 'unset';
            }
            return value?.name;
        },
        getValue: (value) => {
            if (value === 'unset') {
                return { msGeometry: undefined };
            }
            return {
                msGeometry: { name: value }
            };
        },
        getOptions: () => [
            {
                value: 'unset',
                labelId: 'styleeditor.line'
            },
            {
                value: 'lineToArc',
                labelId: 'styleeditor.geodesicLine'
            }
        ]
    })
});

const heightPoint3dOptions = ({ isDisabled, enableTranslation }) =>  ({
    msHeightReference: property.msHeightReference({
        label: "styleeditor.heightReferenceFromGround",
        isDisabled
    }),
    msHeight: property.number({
        key: 'msHeight',
        label: 'styleeditor.height',
        uom: 'm',
        placeholderId: 'styleeditor.pointHeight',
        isDisabled: (value, properties) => isDisabled(value, properties) || properties?.msHeightReference === 'clamp'
    }),
    ...(enableTranslation && {
        msTranslateX: property.number({
            key: 'msTranslateX',
            label: 'styleeditor.msTranslateX',
            uom: 'm',
            fallbackValue: 0,
            isDisabled
        }),
        msTranslateY: property.number({
            key: 'msTranslateY',
            label: 'styleeditor.msTranslateY',
            uom: 'm',
            fallbackValue: 0,
            isDisabled
        })
    }),
    msLeaderLineColor: property.color({
        key: 'msLeaderLineColor',
        opacityKey: 'msLeaderLineOpacity',
        label: 'styleeditor.leaderLineColor',
        stroke: true,
        isDisabled
    }),
    msLeaderLineWidth: property.width({
        key: 'msLeaderLineWidth',
        label: 'styleeditor.leaderLineWidth',
        fallbackValue: 0,
        isDisabled
    })
});

const point3dStyleOptions = ({ isDisabled }) =>  ({
    msBringToFront: property.msBringToFront({
        label: "styleeditor.msBringToFront",
        isDisabled
    }),
    ...heightPoint3dOptions({ isDisabled })
});

const polygon3dStyleOptions = ({ isDisabled }) =>  ({
    msClassificationType: property.msClassificationType({
        label: 'styleeditor.classificationtype',
        isDisabled
    })
});

const polygon3dExtrusion = ({ isDisabled }) => ({
    msHeightReference: property.msHeightReference({
        key: 'msHeightReference',
        label: "styleeditor.heightReferenceFromGround",
        isDisabled
    }),
    msHeight: property.number({
        key: 'msHeight',
        label: 'styleeditor.height',
        uom: 'm',
        placeholderId: 'styleeditor.geometryHeight',
        isDisabled: (value, properties) => isDisabled(value, properties) || properties?.msHeightReference === 'clamp'
    }),
    msExtrusionRelativeToGeometry: property.bool({
        key: 'msExtrusionRelativeToGeometry',
        label: 'styleeditor.msExtrusionRelativeToGeometry',
        isDisabled
    }),
    msExtrudedHeight: property.number({
        key: 'msExtrudedHeight',
        label: 'styleeditor.msExtrudedHeight',
        uom: 'm',
        fallbackValue: 0,
        isDisabled
    })
});

const line3dExtrusion = ({ isDisabled }) => ({
    msHeightReference: property.msHeightReference({
        key: 'msHeightReference',
        label: "styleeditor.heightReferenceFromGround",
        isDisabled
    }),
    msHeight: property.number({
        key: 'msHeight',
        label: 'styleeditor.height',
        uom: 'm',
        placeholderId: 'styleeditor.geometryHeight',
        isDisabled: (value, properties) => isDisabled(value, properties) || properties?.msHeightReference === 'clamp'
    }),
    msExtrusionRelativeToGeometry: property.bool({
        key: 'msExtrusionRelativeToGeometry',
        label: 'styleeditor.msExtrusionRelativeToGeometry',
        isDisabled: (value, properties) => isDisabled(value, properties) || !!properties?.msExtrusionType
    }),
    msExtrudedHeight: property.number({
        key: 'msExtrudedHeight',
        label: 'styleeditor.msExtrudedHeight',
        uom: 'm',
        fallbackValue: 0,
        isDisabled
    }),
    msExtrusionColor: property.color({
        key: 'msExtrusionColor',
        opacityKey: 'msExtrusionOpacity',
        label: 'styleeditor.msExtrusionColor',
        isDisabled
    }),
    msExtrusionType: property.select({
        key: 'msExtrusionType',
        label: 'styleeditor.msExtrusionType',
        setValue: (value) => {
            return value || '';
        },
        getOptions: () => {
            return [
                { value: '', labelId: 'styleeditor.wall' },
                { value: 'Circle', labelId: 'styleeditor.circle' },
                { value: 'Square', labelId: 'styleeditor.square' }
            ];
        },
        isDisabled
    })
});

const getBlocks = ({
    exactMatchGeometrySymbol,
    enable3dStyleOptions
} = {}) => {
    // if enable3dStyleOptions is undefined means we are using the WMS style editor
    // so we do not need to show the properties because there are no differences between 2D/3D
    const shouldHideVectorStyleOptions = enable3dStyleOptions === undefined;
    const symbolizerBlock = {
        Mark: {
            kind: 'Mark',
            glyph: '1-point',
            glyphAdd: '1-point-add',
            tooltipAddId: 'styleeditor.addMarkRule',
            supportedTypes: [
                'point',
                'linestring',
                'polygon',
                'vector',
                'annotation-point',
                'annotation-linestring',
                'annotation-polygon',
                'annotation-circle'
            ],
            params: {
                wellKnownName: property.shape({
                    label: 'styleeditor.shape'
                }),
                color: property.color({
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    label: 'styleeditor.fill'
                }),
                strokeColor: property.color({
                    key: 'strokeColor',
                    opacityKey: 'strokeOpacity',
                    label: 'styleeditor.strokeColor',
                    stroke: true
                }),
                strokeWidth: property.width({
                    key: 'strokeWidth',
                    label: 'styleeditor.strokeWidth'
                }),
                ...(!shouldHideVectorStyleOptions && {
                    strokeDasharray: property.dasharray({
                        label: 'styleeditor.strokeStyle',
                        key: 'strokeDasharray'
                    })
                }),
                radius: property.size({
                    key: 'radius',
                    label: 'styleeditor.radius'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                ...(!shouldHideVectorStyleOptions && point3dStyleOptions({
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && pointGeometryTransformation({}))
            },
            defaultProperties: {
                kind: 'Mark',
                wellKnownName: 'Circle',
                color: '#dddddd',
                fillOpacity: 1,
                strokeColor: '#777777',
                strokeOpacity: 1,
                strokeWidth: 1,
                radius: 16,
                rotate: 0,
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Icon: {
            kind: 'Icon',
            glyph: 'point',
            glyphAdd: 'point-plus',
            tooltipAddId: 'styleeditor.addIconRule',
            supportedTypes: [
                'point',
                'linestring',
                'polygon',
                'vector',
                'annotation-point',
                'annotation-linestring',
                'annotation-polygon',
                'annotation-circle'
            ],
            hideMenu: true,
            params: {
                image: property.image({
                    label: 'styleeditor.image',
                    key: 'image'
                }),
                format: property.select({
                    label: 'styleeditor.format',
                    key: 'format',
                    isVisible: (value, { image } = {}, format) => {
                        return image !== undefined && value?.name !== 'msMarkerIcon' && format !== 'css'
                        && !isObject(image)
                        && !['png', 'jpg', 'svg', 'gif', 'jpeg'].includes(image.split('.').pop());
                    },
                    getOptions: () => SUPPORTED_MIME_TYPES
                }),
                opacity: property.opacity({
                    label: 'styleeditor.opacity'
                }),
                size: property.size({
                    key: 'size',
                    label: 'styleeditor.size'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                ...(!shouldHideVectorStyleOptions && anchorProperty()),
                ...(!shouldHideVectorStyleOptions && point3dStyleOptions({
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && pointGeometryTransformation({}))
            },
            defaultProperties: {
                kind: 'Icon',
                image: '',
                opacity: 1,
                size: 32,
                rotate: 0,
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Line: {
            kind: 'Line',
            glyph: 'line',
            glyphAdd: 'line-plus',
            tooltipAddId: 'styleeditor.addLineRule',
            supportedTypes: exactMatchGeometrySymbol
                ? ['linestring', 'vector']
                : ['linestring', 'polygon', 'vector'],
            params: {
                color: property.color({
                    label: 'styleeditor.strokeColor',
                    stroke: true,
                    pattern: true,
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return { disableAlpha: true };
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    },
                    graphicKey: 'graphicStroke'
                }),
                width: property.width({
                    label: 'styleeditor.strokeWidth',
                    key: 'width'
                }),
                dasharray: property.dasharray({
                    label: 'styleeditor.lineStyle',
                    key: 'dasharray'
                }),
                cap: property.cap({
                    label: 'styleeditor.lineCap',
                    key: 'cap',
                    isDisabled: () => !!enable3dStyleOptions
                }),
                join: property.join({
                    label: 'styleeditor.lineJoin',
                    key: 'join',
                    isDisabled: () => !!enable3dStyleOptions
                }),
                ...(!shouldHideVectorStyleOptions && vector3dStyleOptions({
                    label: 'styleeditor.clampToGround',
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && lineGeometryTransformation({})),
                ...(!shouldHideVectorStyleOptions && line3dExtrusion({
                    isDisabled: (value, properties) => !(!properties?.msClampToGround && enable3dStyleOptions)
                }))
            },
            defaultProperties: {
                kind: 'Line',
                color: '#777777',
                width: 1,
                opacity: 1,
                cap: 'round',
                join: 'round',
                msClampToGround: true
            }
        },
        Fill: {
            kind: 'Fill',
            glyph: 'polygon',
            glyphAdd: 'polygon-plus',
            tooltipAddId: 'styleeditor.addFillRule',
            supportedTypes: ['polygon', 'vector'],
            params: {
                color: property.color({
                    label: 'styleeditor.fill',
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    pattern: true,
                    graphicKey: 'graphicFill',
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return {};
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    }
                }),
                outlineColor: property.color({
                    key: 'outlineColor',
                    opacityKey: 'outlineOpacity',
                    label: 'styleeditor.outlineColor',
                    stroke: true,
                    isDisabled: (value, properties) => !properties?.msClampToGround && !!properties?.msExtrudedHeight
                }),
                outlineWidth: property.width({
                    key: 'outlineWidth',
                    label: 'styleeditor.outlineWidth',
                    isDisabled: (value, properties) => !properties?.msClampToGround && !!properties?.msExtrudedHeight
                }),
                ...(!shouldHideVectorStyleOptions && {
                    outlineDasharray: property.dasharray({
                        label: 'styleeditor.outlineStyle',
                        key: 'outlineDasharray',
                        isDisabled: (value, properties) => !properties?.msClampToGround && !!properties?.msExtrudedHeight
                    })
                }),
                ...(!shouldHideVectorStyleOptions && vector3dStyleOptions({
                    label: 'styleeditor.clampOutlineToGround',
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && polygon3dStyleOptions({
                    isDisabled: (value, properties) => !properties?.msClampToGround || !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && polygon3dExtrusion({
                    isDisabled: (value, properties) => !(!properties?.msClampToGround && enable3dStyleOptions)
                }))
            },
            defaultProperties: {
                kind: 'Fill',
                color: '#dddddd',
                fillOpacity: 1,
                outlineColor: '#777777',
                outlineWidth: 1,
                msClassificationType: 'both',
                msClampToGround: true
            }
        },
        PointCloud: {
            kind: 'Mark',
            glyph: '1-point',
            glyphAdd: '1-point-add',
            tooltipAddId: 'styleeditor.addMarkRule',
            supportedTypes: ['pointcloud'],
            hideMenu: true,
            params: {
                color: property.color({
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    label: 'styleeditor.fill'
                }),
                radius: property.size({
                    key: 'radius',
                    label: 'styleeditor.radius',
                    range: {
                        min: 1,
                        max: 10
                    },
                    infoMessageId: 'styleeditor.pointCloudSizeInfo'
                })
            },
            defaultProperties: {
                kind: 'Mark',
                wellKnownName: 'Circle',
                color: '#dddddd',
                fillOpacity: 1,
                radius: 1
            }
        },
        Polyhedron: {
            kind: 'Fill',
            glyph: 'polygon',
            glyphAdd: 'polygon-plus',
            tooltipAddId: 'styleeditor.addFillRule',
            supportedTypes: ['polyhedron'],
            hideMenu: true,
            params: {
                color: property.color({
                    label: 'styleeditor.fill',
                    key: 'color',
                    opacityKey: 'fillOpacity',
                    pattern: true,
                    graphicKey: 'graphicFill',
                    getGroupParams: (kind) => symbolizerBlock[kind],
                    getGroupConfig: (kind) => {
                        if (kind === 'Mark') {
                            return {};
                        }
                        if (kind === 'Icon') {
                            return {
                                omittedKeys: ['rotate', 'opacity']
                            };
                        }
                        return {};
                    }
                })
            },
            defaultProperties: {
                kind: 'Fill',
                color: '#dddddd',
                fillOpacity: 1
            }
        },
        Model: {
            kind: 'Model',
            glyph: 'model',
            glyphAdd: 'model-plus',
            disableAdd: () => !enable3dStyleOptions,
            tooltipAddId: 'styleeditor.addModelRule',
            supportedTypes: [
                'point',
                'linestring',
                'polygon',
                'vector',
                'annotation-point',
                'annotation-linestring',
                'annotation-polygon',
                'annotation-circle'
            ],
            hideMenu: true,
            params: {
                model: property.model({
                    label: 'styleeditor.model',
                    key: 'model',
                    isDisabled: () => !enable3dStyleOptions
                }),
                scale: property.number({
                    key: 'scale',
                    label: 'styleeditor.scale',
                    fallbackValue: 1,
                    maxWidth: 80,
                    isDisabled: () => !enable3dStyleOptions
                }),
                pitch: property.number({
                    key: 'pitch',
                    label: 'styleeditor.pitch',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°',
                    isDisabled: () => !enable3dStyleOptions
                }),
                roll: property.number({
                    key: 'roll',
                    label: 'styleeditor.roll',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°',
                    isDisabled: () => !enable3dStyleOptions
                }),
                heading: property.number({
                    key: 'heading',
                    label: 'styleeditor.heading',
                    fallbackValue: 0,
                    maxWidth: 105,
                    uom: '°',
                    isDisabled: () => !enable3dStyleOptions
                }),
                color: property.color({
                    key: 'color',
                    opacityKey: 'opacity',
                    label: 'styleeditor.color',
                    isDisabled: () => !enable3dStyleOptions
                }),
                ...heightPoint3dOptions({
                    isDisabled: () => !enable3dStyleOptions,
                    enableTranslation: true
                }),
                ...(!shouldHideVectorStyleOptions && pointGeometryTransformation({}))
            },
            defaultProperties: {
                kind: 'Model',
                model: '',
                scale: 1,
                color: '#ffffff',
                opacity: 1,
                msHeightReference: 'none'
            }
        },
        Text: {
            kind: 'Text',
            glyph: 'font',
            tooltipAddId: 'styleeditor.addTextRule',
            supportedTypes: ['point', 'linestring', 'polygon', 'vector'],
            params: {
                label: property.select({
                    key: 'label',
                    label: 'styleeditor.label',
                    disablePropertySelection: true,
                    selectProps: {
                        creatable: true
                    },
                    getOptions: ({ attributes }) => {
                        return attributes?.map((option) => ({
                            value: '{{' + option.attribute + '}}',
                            label: option.label || option.attribute
                        })) || [];
                    }
                }),
                font: property.select({
                    key: 'font',
                    label: 'styleeditor.fontFamily',
                    disablePropertySelection: true,
                    selectProps: {
                        multi: true
                    },
                    getOptions: ({ fonts }) => {
                        return fonts?.map((font) => ({
                            value: font,
                            label: font
                        })) || [];
                    }
                }),
                color: property.color({
                    label: 'styleeditor.fontColor',
                    key: 'color',
                    disableAlpha: true
                }),
                size: property.size({
                    label: 'styleeditor.fontSize',
                    key: 'size'
                }),
                fontStyle: property.fontStyle({
                    label: 'styleeditor.fontStyle',
                    key: 'fontStyle'
                }),
                fontWeight: property.fontWeight({
                    label: 'styleeditor.fontWeight',
                    key: 'fontWeight'
                }),
                ...(!shouldHideVectorStyleOptions && anchorProperty()),
                haloColor: property.color({
                    label: 'styleeditor.haloColor',
                    key: 'haloColor',
                    stroke: true,
                    disableAlpha: true
                }),
                haloWidth: property.width({
                    label: 'styleeditor.haloWidth',
                    key: 'haloWidth'
                }),
                rotate: property.rotate({
                    label: 'styleeditor.rotation'
                }),
                offset: property.offset({
                    label: 'styleeditor.offset'
                }),
                ...(!shouldHideVectorStyleOptions && point3dStyleOptions({
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && pointGeometryTransformation({}))
            },
            defaultProperties: {
                kind: 'Text',
                color: '#333333',
                size: 14,
                fontStyle: 'normal',
                fontWeight: 'normal',
                haloColor: '#ffffff',
                haloWidth: 1,
                allowOverlap: true,
                offset: [0, 0],
                msBringToFront: false,
                msHeightReference: 'none'
            }
        },
        Raster: {
            kind: 'Raster',
            glyph: '1-raster',
            tooltipAddId: 'styleeditor.addRasterRule',
            supportedTypes: ['raster'],
            params: {
                channel: property.channel({}),
                opacity: property.opacity({
                    label: 'styleeditor.opacity'
                })
            },
            defaultProperties: {
                kind: 'Raster',
                opacity: 1,
                contrastEnhancement: {}
            }
        },
        Circle: {
            kind: 'Circle',
            glyph: '1-circle',
            glyphAdd: '1-circle-add',
            tooltipAddId: 'styleeditor.addCircleRule',
            supportedTypes: [],
            params: {
                color: property.color({
                    key: 'color',
                    opacityKey: 'opacity',
                    label: 'styleeditor.color'
                }),
                outlineColor: property.color({
                    key: 'outlineColor',
                    opacityKey: 'outlineOpacity',
                    label: 'styleeditor.outlineColor',
                    stroke: true
                }),
                outlineWidth: property.width({
                    key: 'outlineWidth',
                    label: 'styleeditor.outlineWidth'
                }),
                outlineDasharray: property.dasharray({
                    label: 'styleeditor.outlineStyle',
                    key: 'outlineDasharray'
                }),
                radius: property.number({
                    key: 'radius',
                    label: 'styleeditor.radius',
                    uom: 'm',
                    fallbackValue: 0,
                    maxWidth: 125
                }),
                geodesic: property.bool({
                    key: 'geodesic',
                    label: 'styleeditor.geodesic'
                }),
                ...(!shouldHideVectorStyleOptions && vector3dStyleOptions({
                    label: 'styleeditor.clampOutlineToGround',
                    isDisabled: () => !enable3dStyleOptions
                })),
                ...(!shouldHideVectorStyleOptions && polygon3dStyleOptions({
                    isDisabled: (value, properties) => !properties?.msClampToGround || !enable3dStyleOptions
                }))
            },
            defaultProperties: {
                kind: 'Circle',
                color: '#dddddd',
                opacity: 1,
                outlineColor: '#777777',
                outlineWidth: 1
            }
        }
    };

    const ruleBlock = {
        Classification: {
            kind: 'Classification',
            glyph: 'list',
            classificationType: 'classificationVector',
            hideInputLabel: true,
            hideFilter: true,
            params: [
                {
                    ramp: property.colorRamp({
                        key: 'ramp',
                        label: 'styleeditor.colorRamp',
                        disablePropertySelection: true,
                        getOptions: ({ getColors }) => getColors()
                    }),
                    reverse: property.bool({
                        key: 'reverse',
                        label: 'styleeditor.reverse',
                        disablePropertySelection: true,
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    attribute: property.select({
                        key: 'attribute',
                        label: 'styleeditor.attribute',
                        disablePropertySelection: true,
                        isValid: ({ value }) => value !== undefined,
                        getOptions: ({ attributes }) => {
                            return attributes?.map((option) => ({
                                value: option.attribute,
                                label: option.label || option.attribute,
                                disabled: option.disabled
                            }));
                        }
                    }),
                    method: property.select({
                        key: 'method',
                        label: 'styleeditor.method',
                        disablePropertySelection: true,
                        isDisabled: (value, properties, {attributes})=>
                            attributes?.filter(({label}) => label === properties?.attribute)?.[0]?.type === 'string'
                            && properties?.method !== 'customInterval',
                        getOptions: ({ methods, method, methodEdit }) => {
                            const options = methods?.map((value) => ({
                                labelId: 'styleeditor.' + value,
                                value
                            })) || [];
                            return [
                                ...(method === "customInterval"
                                    ? [
                                        {
                                            labelId: "styleeditor." + methodEdit,
                                            glyphId: 'edit',
                                            value: method
                                        }
                                    ]
                                    : []),
                                ...options
                            ];
                        }
                    }),
                    intervals: property.intervals({
                        label: 'styleeditor.intervals',
                        disablePropertySelection: true,
                        isDisabled: (value, properties) =>
                            includes(['customInterval', 'uniqueInterval'], properties?.method)
                    })
                },
                (symbolizerKind) => {
                    if (!symbolizerKind) {
                        return {};
                    }
                    switch (symbolizerKind) {
                    case 'Mark':
                        return {
                            fillOpacity: property.opacity({
                                key: 'fillOpacity',
                                label: 'styleeditor.opacity',
                                disablePropertySelection: true
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    case 'Line':
                        return {
                            opacity: property.opacity({
                                key: 'opacity',
                                label: 'styleeditor.opacity',
                                disablePropertySelection: true
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    case 'Fill':
                        return {
                            fillOpacity: property.opacity({
                                key: 'fillOpacity',
                                label: 'styleeditor.opacity',
                                disablePropertySelection: true
                            }),
                            ...omit(symbolizerBlock[symbolizerKind]?.params, ['color'])
                        };
                    default:
                        return symbolizerBlock[symbolizerKind]?.params;
                    }
                },
                {
                    msViewParams: property.customParams({
                        key: 'msViewParams',
                        label: 'styleeditor.customParams',
                        disablePropertySelection: true
                    }),
                    classification: property.colorMap({
                        key: 'classification',
                        rampKey: 'ramp'
                    })
                }
            ],
            defaultProperties: {
                kind: 'Classification',
                classification: [],
                intervals: 5,
                method: 'equalInterval',
                ramp: 'orrd',
                reverse: false
            }
        },
        Raster: {
            kind: 'Raster',
            glyph: '1-raster',
            classificationType: 'classificationRaster',
            hideInputLabel: false,
            hideFilter: true,
            params: [
                {
                    channel: property.channel({}),
                    opacity: property.opacity({
                        label: 'styleeditor.opacity'
                    }),
                    ramp: property.colorRamp({
                        key: 'ramp',
                        label: 'styleeditor.colorRamp',
                        getOptions: ({ getColors }) => getColors()
                    }),
                    reverse: property.bool({
                        key: 'reverse',
                        label: 'styleeditor.reverse',
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    continuous: property.bool({
                        key: 'continuous',
                        label: 'styleeditor.continuous',
                        isDisabled: (value, properties) =>
                            properties?.ramp === 'custom'
                            || properties?.method === 'customInterval'
                    }),
                    colorMapType: property.colorMapType({
                        key: 'colorMapType',
                        label: 'styleeditor.colorMapType.label'
                    }),
                    method: property.select({
                        key: 'method',
                        label: 'styleeditor.method',
                        getOptions: ({ methods, method, methodEdit }) => {
                            const options = methods?.map((value) => ({
                                labelId: 'styleeditor.' + value,
                                value
                            })) || [];
                            return [
                                ...(method === "customInterval"
                                    ? [
                                        {
                                            labelId: "styleeditor." + methodEdit,
                                            glyphId: 'edit',
                                            value: method
                                        }
                                    ]
                                    : []),
                                ...options
                            ];
                        }
                    }),
                    intervals: property.intervals({
                        label: 'styleeditor.intervals'
                    })
                },
                {
                    classification: property.colorMap({
                        key: 'classification',
                        rampKey: 'ramp'
                    })
                }
            ],
            defaultProperties: {
                kind: 'Raster',
                opacity: 1,
                classification: [],
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                colorMapType: 'ramp',
                symbolizerKind: 'Raster'
            }
        }
    };

    return { symbolizerBlock, ruleBlock };
};

export default getBlocks;
