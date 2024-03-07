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
        isDisabled,
        propertySelectorInfoMessageId = 'styleeditor.colorPropertyInfoMessage'
    }) => ({
        type: 'color',
        valueType: 'string',
        label,
        config: {
            stroke,
            pattern,
            disableAlpha,
            getGroupParams,
            getGroupConfig,
            graphicKey,
            opacityKey,
            propertySelectorInfoMessageId
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
                ...(pattern && { [graphicKey]: undefined })
            };
        },
        isDisabled
    }),
    width: ({ key = 'width', label = 'Width', fallbackValue = 1, isDisabled }) => ({
        type: 'input',
        label,
        valueType: 'number',
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
        getValue: (value) => {
            const width = value === undefined ? fallbackValue : parseFloat(value);
            return {
                [key]: width
            };
        },
        isDisabled
    }),
    dasharray: ({ key = 'dasharray', label = 'Dash array', disablePropertySelection = true, isDisabled }) => ({
        type: 'dash',
        label,
        config: {
            disablePropertySelection
        },
        setValue: (value) => {
            return value !== undefined
                ? value.map(entry => Math.round(entry))
                : [0];
        },
        getValue: (value) => {
            if (isEqual(value, ['0']) || isEqual(value, ['1', '0'])) {
                return { [key]: undefined };
            }
            const isValid = !(value || []).find((entry) => isNaN(parseFloat(entry)));
            return {
                [key]: value !== undefined && isValid
                    ? value.map((entry) => parseFloat(entry))
                    : undefined
            };
        },
        isDisabled
    }),
    cap: ({ key = 'cap', label = 'Line cap', isDisabled }) => ({
        type: 'toolbar',
        valueType: 'string',
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
        valueType: 'string',
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
        valueType: 'number',
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
    number: ({ key = 'scale', label = 'Scale', min, max, fallbackValue, maxWidth, uom, isDisabled, placeholderId }) => ({
        type: 'input',
        valueType: 'number',
        label,
        config: {
            min,
            max,
            fallbackValue,
            type: 'number',
            maxWidth,
            uom,
            placeholderId
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
    opacity: ({ key = 'opacity', label = 'Opacity', disablePropertySelection }) => ({
        type: 'slider',
        valueType: 'number',
        label,
        config: {
            disablePropertySelection,
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
    offset: ({ key = 'offset', label = '', fallbackValue = [0, 0], disablePropertySelection = true }) => ({
        key,
        type: 'xyInput',
        label,
        config: {
            fallbackValue,
            uom: 'px',
            disablePropertySelection
        },
        setValue: (value = [0, 0]) => {
            return value === undefined ? fallbackValue : value;
        },
        getValue: (value) => {
            return {
                [key]: value === undefined ? fallbackValue : value
            };
        }
    }),
    rotate: ({ key = 'rotate', label = 'Rotation (deg)', fallbackValue = 0 }) => ({
        type: 'input',
        valueType: 'number',
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
    msClampToGround: ({ key = 'msClampToGround', label = 'Clamp to ground', isDisabled, disablePropertySelection = true }) => ({
        type: 'checkbox',
        valueType: 'string',
        label,
        config: {
            disablePropertySelection
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        },
        setValue: (value) => !!value,
        isDisabled
    }),
    msBringToFront: ({ key = 'msBringToFront', label = 'Arrange', isDisabled, disablePropertySelection = true }) => ({
        type: 'checkbox',
        valueType: 'string',
        label,
        config: {
            disablePropertySelection
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
        valueType: 'string',
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
        valueType: 'string',
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
                [key]: value
            };
        },
        isDisabled
    }),
    shape: ({ label, key = 'wellKnownName', options, excludeSvg, isDisabled }) => ({
        type: 'mark',
        valueType: 'string',
        label,
        config: {
            options,
            excludeSvg
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        },
        isDisabled
    }),
    image: ({ label, key = 'image' }) => ({
        type: 'image',
        valueType: 'string',
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
        valueType: 'string',
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
        valueType: 'string',
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
        valueType: 'string',
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
        isDisabled,
        disablePropertySelection
    }) => ({
        type: 'checkbox',
        label,
        config: {
            disablePropertySelection
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
            properties?.method === 'customInterval',
        disablePropertySelection = true
    }) => ({
        type: 'slider',
        label,
        config: {
            disablePropertySelection,
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
    select: ({ label, key = '', getOptions = () => [], selectProps, isValid, isDisabled, isVisible, setValue, getValue, disablePropertySelection }) => ({
        type: 'select',
        valueType: 'string',
        label,
        config: {
            getOptions,
            selectProps,
            isValid,
            disablePropertySelection
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
    colorRamp: ({ label, key = '', getOptions = () => [], disablePropertySelection = true }) => ({
        type: 'colorRamp',
        label,
        config: {
            disablePropertySelection,
            getOptions
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    colorMap: ({ label, key = '', disablePropertySelection = true }) => ({
        type: 'colorMap',
        label,
        config: {
            disablePropertySelection
        },
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
    }),
    customParams: ({ label, key = '', getOptions = () => [], selectProps, isValid, isDisabled, isVisible, setValue, getValue, disablePropertySelection }) => {
        return ({
            type: 'customParams',
            valueType: 'string',
            label,
            config: {
                getOptions,
                selectProps: { ...selectProps, clearable: true},
                isValid,
                disablePropertySelection
            },
            getValue: getValue ? getValue : (value, props) => {
                return {
                    [key]: {...(props[key] || {}), ...value}
                };
            },
            isDisabled,
            isVisible,
            setValue
        });
    }
};

export default property;
