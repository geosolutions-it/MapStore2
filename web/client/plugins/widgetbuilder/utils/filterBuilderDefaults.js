/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const createEmptyFilterData = () => ({
    title: '',
    layer: null,
    dataSource: 'features',
    valuesFrom: 'grouped',
    valueAttribute: undefined,
    labelAttribute: undefined,
    sortByAttribute: undefined,
    sortOrder: 'ASC',
    maxFeatures: 20,
    filterComposition: 'AND',
    userDefinedItems: []
});

const generateSelectionsPreview = (config = {}) => {
    const { layout = {} } = config;
    const selectionMode = layout.selectionMode || 'multiple';
    const { items = [] } = config;
    if (selectionMode === 'single') {
        return items[0]?.id ? [items[0].id] : [];
    }
    return items.slice(0, 2).map(item => item.id);
};

export const createDefaultSelections = (filters = []) =>
    filters.reduce((acc, config) => ({
        ...acc,
        [config.id]: generateSelectionsPreview(config)
    }), {});

const getNewFilterName = (count = 0) => `New Filter ${count + 1}`;

export const createNewFilter = (filtersCount = 0) => {
    const label = getNewFilterName(filtersCount);
    return {
        id: `filter-${Date.now()}`,
        label,
        name: label,
        layout: {
            variant: 'checkbox',
            icon: 'filter',
            selectionMode: 'multiple',
            direction: 'vertical',
            maxHeight: 150,
            selectedColor: '#0d99ff'
        },
        items: [],
        data: createEmptyFilterData()
    };
};

export const updateNestedProperty = (obj = {}, path = '', value) => {
    if (!path) {
        return obj;
    }
    const keys = path.split('.');
    const lastKey = keys.pop();
    const result = { ...obj };
    let current = result;
    keys.forEach((key) => {
        current[key] = current[key] ? { ...current[key] } : {};
        current = current[key];
    });
    current[lastKey] = value;
    return result;
};

