/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import isEqual from 'lodash/isEqual';
import isNaN from 'lodash/isNaN';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import tinycolor from 'tinycolor2';

const property = {
    color: ({
        key = 'color',
        opacityKey = 'opacity',
        graphicKey,
        label = 'Fill',
        stroke,
        pattern,
        disableAlpha,
        getGroupParams,
        getGroupConfig,
        isDisabled
    }) => ({
        type: 'color',
        label,
        config: {
            stroke,
            pattern,
            disableAlpha,
            getGroupParams,
            getGroupConfig,
            graphicKey
        },
        setValue: (value, properties) => {
            if (pattern && properties[graphicKey]?.kind) {
                return properties[graphicKey];
            }
            const opacity = isNil(properties[opacityKey]) ? 1 : properties[opacityKey];
            return tinycolor(value).setAlpha(opacity).toRgb();
        },
        getValue: (value) => {
            if (pattern && isObject(value) && value.kind) {
                return {
                    [graphicKey]: value,
                    [key]: undefined,
                    [opacityKey]: undefined
                };
            }
            const { a, ...color } = value || {};
            return {
                [key]: tinycolor({ ...color, a: 1 }).toHexString(),
                [opacityKey]: a,
                ...(pattern && {[graphicKey]: undefined})
            };
        },
        isDisabled
    }),
    width: ({ key = 'width', label = 'Width', fallbackValue = 1, dasharrayKey = 'dasharray', isDisabled }) => ({
        type: 'input',
        label,
        config: {
            min: 0,
            fallbackValue,
            type: 'number',
            maxWidth: 105,
            uom: 'px'
        },
        setValue: (value) => {
            return value === undefined ? fallbackValue : parseFloat(value);
        },
        getValue: (value, properties) => {
            const width = value === undefined ? fallbackValue : parseFloat(value);
            const dasharray = properties[dasharrayKey];
            const previousWidth = properties[key];
            return {
                [key]: width,
                ...(dasharray && {
                    // dasharray should scale based on width
                    [dasharrayKey]: width
                        ? dasharray.map(entry => Math.round(entry / previousWidth * width))
                        : undefined
                })
            };
        },
        isDisabled
    }),
    dasharray: ({ key = 'dasharray', label = 'Dash array' }) => ({
        type: 'dash',
        label,
        config: {
            options: [{
                value: '0'
            }, {
                value: '1 4'
            }, {
                value: '1 12'
            }, {
                value: '8 8'
            }, {
                value: '8 16'
            }, {
                value: '8 8 1 8'
            }, {
                value: '8 8 1 4 1 8'
            }]
        },
        setValue: (value, properties) => {
            const width = properties.width === undefined ? 1 : properties.width;
            return value !== undefined
                ? value.map(entry => Math.round(entry / width))
                : [0];
        },
        getValue: (value, properties) => {
            if (isEqual(value, ['0'])) {
                return { [key]: undefined };
            }
            const width = properties.width === undefined ? 1 : properties.width;
            const isValid = !(value || []).find((entry) => isNaN(parseFloat(entry)));
            return {
                [key]: value !== undefined && isValid
                    ? value.map((entry) => parseFloat(entry) * width)
                    : undefined
            };
        }
    }),
    cap: ({ key = 'cap', label = 'Line cap', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.lineCapButt',
                value: 'butt'
            }, {
                labelId: 'styleeditor.lineCapRound',
                value: 'round'
            }, {
                labelId: 'styleeditor.lineCapSquare',
                value: 'square'
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        isDisabled
    }),
    join: ({ key = 'join', label = 'Line join', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.lineJoinBevel',
                value: 'bevel'
            }, {
                labelId: 'styleeditor.lineJoinRound',
                value: 'round'
            }, {
                labelId: 'styleeditor.lineJoinMiter',
                value: 'miter'
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        isDisabled
    }),
    colorMapType: ({ key = 'colorMapType', label = 'Color map type', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.colorMapType.ramp',
                value: 'ramp'
            }, {
                labelId: 'styleeditor.colorMapType.intervals',
                value: 'intervals'
            }, {
                labelId: 'styleeditor.colorMapType.values',
                value: 'values'
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        isDisabled
    }),
    size: ({ key = 'radius', label = 'Radius', range, fallbackValue = 1, infoMessageId }) => ({
        type: 'input',
        label,
        config: {
            fallbackValue,
            type: 'number',
            maxWidth: 105,
            uom: 'px',
            min: range?.min ?? 0,
            max: range?.max,
            infoMessageId
        },
        setValue: (value = 1) => {
            return value === undefined ? fallbackValue : parseFloat(value);
        },
        getValue: (value) => {
            return {
                [key]: value === undefined ? fallbackValue : parseFloat(value)
            };
        }
    }),
    number: ({ key = 'scale', label = 'Scale', min, max, fallbackValue, maxWidth, uom, isDisabled }) => ({
        type: 'input',
        label,
        config: {
            min,
            max,
            fallbackValue,
            type: 'number',
            maxWidth,
            uom
        },
        setValue: (value) => {
            return value === undefined ? fallbackValue : parseFloat(value);
        },
        getValue: (value) => {
            return {
                [key]: value === undefined ? undefined : parseFloat(value)
            };
        },
        isDisabled
    }),
    opacity: ({ key = 'opacity', label = 'Opacity' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 1 }
        },
        setValue: (value = 1) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            const width = value[0] && value[0].split(' px')[0];
            return {
                [key]: parseFloat(width)
            };
        }
    }),
    offset: ({ key = 'offset', label = '', axis = '', fallbackValue = 0 }) => ({
        key,
        type: 'input',
        label,
        config: {
            fallbackValue,
            type: 'number',
            maxWidth: 105,
            uom: 'px'
        },
        setValue: (value = []) => {
            const currentValue = axis === 'y' ? parseFloat(value[1]) : parseFloat(value[0]);
            return  currentValue === undefined ? fallbackValue : parseFloat(currentValue);
        },
        getValue: (value, properties) => {
            const offset = value === undefined ? fallbackValue : parseFloat(value);
            const currentOffset = properties[key] || [0, 0];
            return {
                [key]: axis === 'y'
                    ? [
                        currentOffset[0],
                        offset
                    ]
                    : [
                        offset,
                        currentOffset[1]
                    ]
            };
        }
    }),
    rotate: ({ key = 'rotate', label = 'Rotation (deg)', fallbackValue = 0 }) => ({
        type: 'input',
        label,
        config: {
            fallbackValue,
            type: 'number',
            maxWidth: 105,
            uom: '°'
        },
        setValue: (value = 0) => {
            return value === undefined ? fallbackValue : parseFloat(value);
        },
        getValue: (value) => {
            return {
                [key]: value === undefined ? fallbackValue : parseFloat(value)
            };
        }
    }),
    msClampToGround: ({ key = 'msClampToGround', label = 'Clamp to ground', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.boolTrue',
                value: true
            }, {
                labelId: 'styleeditor.boolFalse',
                value: false
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        setValue: (value) => !!value,
        isDisabled
    }),
    msBringToFront: ({ key = 'msBringToFront', label = 'Arrange', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.boolTrue',
                value: true
            }, {
                labelId: 'styleeditor.boolFalse',
                value: false
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        setValue: (value) => !!value,
        isDisabled
    }),
    msClassificationType: ({
        key = 'msClassificationType',
        label = 'PolygonType',
        isDisabled
    }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.3dTile',
                value: '3d'
            }, {
                labelId: 'styleeditor.terrain',
                value: 'terrain'
            }, {
                labelId: 'styleeditor.both',
                value: 'both'
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        isDisabled
    }),
    msHeightReference: ({ key = 'msHeightReference', label = 'Height reference from ground', isDisabled }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.none',
                value: 'none'
            }, {
                labelId: 'styleeditor.relative',
                value: 'relative'
            }, {
                labelId: 'styleeditor.clamp',
                value: 'clamp'
            }]
        },
        getValue: (value) => {
            return {
                [key]: value,
                ...(value === 'clamp' && { msHeight: undefined })
            };
        },
        isDisabled
    }),
    shape: ({ label, key = 'wellKnownName' }) => ({
        type: 'mark',
        label,
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    image: ({ label, key = 'image' }) => ({
        type: 'image',
        label,
        config: {},
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    model: ({ label, key = 'model', isDisabled }) => ({
        type: 'model',
        label,
        config: {},
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }, isDisabled
    }),
    fontStyle: ({ label, key = 'fontStyle' }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.fontStyleNormal',
                value: 'normal'
            }, {
                labelId: 'styleeditor.fontStyleItalic',
                value: 'italic'
            }]
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    fontWeight: ({ label, key = 'fontWeight' }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.fontWeightNormal',
                value: 'normal'
            }, {
                labelId: 'styleeditor.fontWeightBold',
                value: 'bold'
            }]
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    bool: ({
        key = 'label',
        label,
        isDisabled
    }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                labelId: 'styleeditor.boolTrue',
                value: true
            }, {
                labelId: 'styleeditor.boolFalse',
                value: false
            }]
        },
        isDisabled,
        getValue: (value) => {
            return {
                [key]: value
            };
        }
    }),
    intervals: ({
        key = 'intervals',
        label,
        isDisabled = (value, properties) =>
            properties?.method === 'customInterval'
    }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 2, max: 25 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value)
            }
        },
        isDisabled,
        setValue: (value = 2) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            return {
                [key]: parseFloat(value[0])
            };
        }
    }),
    select: ({ label, key = '', getOptions = () => [], selectProps, isValid, isDisabled, isVisible, setValue, getValue }) => ({
        type: 'select',
        label,
        config: {
            getOptions,
            selectProps,
            isValid
        },
        getValue: getValue ? getValue : (value) => {
            return {
                [key]: value
            };
        },
        isDisabled,
        isVisible,
        setValue
    }),
    multiInput: ({ label, key = '', initialOptionValue, getSelectOptions = () => [], isDisabled, isVisible, fallbackValue = 0 }) => ({
        type: 'multiInput',
        label,
        config: {
            initialOptionValue,
            getSelectOptions,
            fallbackValue
        },
        setValue: (value) => {
            if (value === undefined) {
                return { type: 'initial' };
            }
            if (!isObject(value)) {
                return {
                    type: 'constant',
                    value: value === undefined ? fallbackValue : parseFloat(value)
                };
            }
            return value;
        },
        getValue: (value) => {
            if (value?.type === 'initial') {
                return {
                    [key]: undefined
                };
            }
            if (value?.type === 'constant') {
                return {
                    [key]: value?.value === undefined ? fallbackValue : parseFloat(value.value)
                };
            }
            return {
                [key]: value
            };
        },
        isDisabled,
        isVisible
    }),
    colorRamp: ({ label, key = '', getOptions = () => [] }) => ({
        type: 'colorRamp',
        label,
        config: {
            getOptions
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    colorMap: ({ label, key = '' }) => ({
        type: 'colorMap',
        label,
        getValue: (value = {}, properties) => {
            const {
                classification,
                type
            } = value;
            const isMethodCustomInterval = properties.method === 'customInterval';
            const isCustomInterval = type === 'interval' || isMethodCustomInterval;
            const isCustomColor = type === 'color' || properties.ramp === 'custom';
            return {
                [key]: classification,
                ...(isCustomInterval && {
                    method: 'customInterval',
                    methodEdit: isMethodCustomInterval ? properties.methodEdit : properties.method
                }),
                ...(isCustomColor && { ramp: 'custom' })
            };
        }
    }),
    channel: ({ label }) => ({
        type: 'channel',
        label,
        setValue: (value, properties) => {
            return {
                channelSelection: properties.channelSelection,
                contrastEnhancement: properties.contrastEnhancement
            };
        },
        getValue: (value = {}) => {
            return {
                channelSelection: value.channelSelection,
                contrastEnhancement: value.contrastEnhancement
            };
        }
    })
};

export default property;
