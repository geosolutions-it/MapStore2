/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import isNaN from 'lodash/isNaN';
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
        getGroupConfig
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
        }
    }),
    width: ({ key = 'width', label = 'Width', dasharrayKey = 'dasharray' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 20 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + ' px'
            }
        },
        setValue: (value = 1) => {
            return parseFloat(value);
        },
        getValue: (value = [], properties) => {
            const stringWidth = value[0] && value[0].split(' px')[0];
            const width = parseFloat(stringWidth);
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
        }
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
    cap: ({ key = 'cap', label = 'Line cap' }) => ({
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
        }
    }),
    join: ({ key = 'join', label = 'Line join' }) => ({
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
        }
    }),
    size: ({ key = 'radius', label = 'Radius' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 100 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + ' px'
            }
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
    offset: ({ key = 'offset', label = '', axis = '' }) => ({
        key,
        type: 'slider',
        label,
        config: {
            range: { min: -100, max: 100 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + ' px'
            }
        },
        setValue: (value = []) => {
            const currentValue = axis === 'y' ? parseFloat(value[1]) : parseFloat(value[0]);
            return  !isNaN(currentValue) ? currentValue : 0;
        },
        getValue: (value = [], properties) => {
            const offset = value[0] && value[0].split(' px')[0];
            const currentOffset = properties[key] || [0, 0];
            return {
                [key]: axis === 'y'
                    ? [
                        currentOffset[0],
                        parseFloat(offset)
                    ]
                    : [
                        parseFloat(offset),
                        currentOffset[1]
                    ]
            };
        }
    }),
    rotate: ({ key = 'rotate', label = 'Rotation (deg)' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 360 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + '°'
            }
        },
        setValue: (value = 0) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            const angle = value[0] && value[0].split('°')[0];
            return {
                [key]: parseFloat(angle)
            };
        }
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
    image: ({ label, key = 'image', isValid }) => ({
        type: 'image',
        label,
        config: {
            isValid
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    text: ({ label, key = 'label' }) => ({
        type: 'input',
        label,
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
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
    select: ({ label, key = '', getOptions = () => [], selectProps, isValid }) => ({
        type: 'select',
        label,
        config: {
            getOptions,
            selectProps,
            isValid
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        }
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
            const isCustomInteval = type === 'interval' || properties.method === 'customInterval';
            const isCustomColor = type === 'color' || properties.ramp === 'custom';
            return {
                [key]: classification,
                ...(isCustomInteval && { method: 'customInterval' }),
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
