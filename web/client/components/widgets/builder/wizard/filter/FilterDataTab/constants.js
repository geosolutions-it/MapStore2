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
    { value: DATA_SOURCE_TYPES.FEATURES, label: 'Featuress', labelKey: 'widgets.filterWidget.features' },
    { value: DATA_SOURCE_TYPES.USER_DEFINED, label: 'User definedd', labelKey: 'widgets.filterWidget.userDefined' }
];

export const VALUES_FROM_OPTIONS = [
    {
        value: VALUES_FROM_TYPES.GROUPED,
        label: 'Unique Attribute',
        description: 'Invoke distinct WPS on the layer attribute.',
        labelKey: 'widgets.filterWidget.uniqueAttributes',
        descriptionKey: 'widgets.filterWidget.valueFromUniqueAttributeDescription'
    },
    {
        value: VALUES_FROM_TYPES.SINGLE,
        label: 'Attributes',
        description: 'Query WFS once per attribute value.',
        labelKey: 'widgets.filterWidget.attributes',
        descriptionKey: 'widgets.filterWidget.valueFromAttributeDescription'
    }
];

export const FILTER_COMPOSITION_OPTIONS = [
    { value: FILTER_COMPOSITION_TYPES.AND, label: 'Match all filters (AND))', labelKey: 'widgets.filterWidget.matchAllFilter' },
    { value: FILTER_COMPOSITION_TYPES.OR, label: 'Match any filter (OR))', labelKey: 'widgets.filterWidget.matchAnyFilter' }
];

export const USER_DEFINED_TYPE_OPTIONS = [
    { value: USER_DEFINED_TYPES.FILTER_LIST, label: 'Filter list', labelKey: 'widgets.filterWidget.filterList' },
    { value: USER_DEFINED_TYPES.STYLE_LIST, label: 'Style list', labelKey: 'widgets.filterWidget.styleList' }
];

