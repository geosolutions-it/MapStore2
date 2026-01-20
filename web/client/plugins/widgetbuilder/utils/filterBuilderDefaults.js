/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuidv1 from 'uuid/v1';

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
    filterComposition: 'OR',
    userDefinedItems: []
});

const getFilterName = (count = 0) => `Filter ${count + 1}`;

export const createNewFilter = (filtersCount = 0) => {
    return {
        id: uuidv1(),
        layout: {
            variant: 'checkbox',
            icon: 'filter',
            selectionMode: 'multiple',
            direction: 'vertical',
            maxHeight: 240,
            label: getFilterName(filtersCount),
            titleStyle: {
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                textColor: '#000000'
            }
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

