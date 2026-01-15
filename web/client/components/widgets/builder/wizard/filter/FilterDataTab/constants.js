/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const DATA_SOURCE_TYPES = {
    FEATURES: 'features',
    USER_DEFINED: 'userDefined'
};

export const VALUES_FROM_TYPES = {
    GROUPED: 'grouped',
    SINGLE: 'single'
};

export const FILTER_COMPOSITION_TYPES = {
    AND: 'AND',
    OR: 'OR'
};

export const USER_DEFINED_TYPES = {
    FILTER_LIST: 'filterList',
    STYLE_LIST: 'styleList'
};

export const SORT_ORDERS = {
    ASC: 'ASC',
    DESC: 'DESC'
};

export const DATA_SOURCE_OPTIONS = [
    { value: DATA_SOURCE_TYPES.FEATURES, label: 'Features' },
    { value: DATA_SOURCE_TYPES.USER_DEFINED, label: 'User defined' }
];

export const VALUES_FROM_OPTIONS = [
    {
        value: VALUES_FROM_TYPES.GROUPED,
        label: 'Unique Attribute ',
        description: 'Invoke distinct WPS on the layer attribute.'
    },
    {
        value: VALUES_FROM_TYPES.SINGLE,
        label: 'Attributes',
        description: 'Query WFS once per attribute value.'
    }
];

export const FILTER_COMPOSITION_OPTIONS = [
    { value: FILTER_COMPOSITION_TYPES.AND, label: 'Match all filters (AND)' },
    { value: FILTER_COMPOSITION_TYPES.OR, label: 'Match any filter (OR)' }
];

export const USER_DEFINED_TYPE_OPTIONS = [
    { value: USER_DEFINED_TYPES.FILTER_LIST, label: 'Filter list' },
    { value: USER_DEFINED_TYPES.STYLE_LIST, label: 'Style list' }
];

