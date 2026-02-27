/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuidv1 from 'uuid/v1';
import { USER_DEFINED_TYPES, FILTER_SELECTION_MODES } from '../../../components/widgets/builder/wizard/filter/FilterDataTab/constants';

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
    noSelectionMode: FILTER_SELECTION_MODES.NO_FILTER,
    defaultFilter: null,
    userDefinedType: USER_DEFINED_TYPES.FILTER_LIST,
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
            maxHeight: undefined,
            label: getFilterName(filtersCount),
            titleStyle: {
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                textColor: '#000000'
            },
            forceSelection: false
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

/**
 * Checks if a filter has valid selections when forceSelection is enabled
 * @param {object} filter - The filter object containing layout and id
 * @param {array} selectedValues - Selected values array for this filter
 * @returns {boolean} - true if valid, false if forceSelection is on but no selection made
 */
export const isFilterSelectionValid = (filter, selectedValues = []) => {
    const forceSelection = filter?.layout?.forceSelection;
    if (!forceSelection) {
        return true; // No force selection, always valid
    }
    return (selectedValues || []).length > 0;
};

/**
 * Checks if all filters with forceSelection have at least one selection
 * @param {Array} filters - Array of filter objects
 * @param {object} selections - The selections object { filterId: [selectedValues] }
 * @returns {boolean} - true if all filters with forceSelection have selections
 */
export const areAllForceSelectionsValid = (filters = [], selections = {}) => {
    return filters.every(filter => isFilterSelectionValid(filter, selections?.[filter?.id] || []));
};

/**
 * Checks if custom no-selection filters have a valid defaultFilter defined
 * @param {Array} filters - Array of filter objects
 * @param {Function} isFilterValid - Function to validate filter object (from FilterUtils)
 * @returns {boolean} - true if all custom-mode filters have valid defaultFilter
 */
export const areAllCustomNoSelectionFiltersValid = (filters = [], isFilterValid) => {
    if (!isFilterValid) return true;
    return filters.every(filter => {
        const noSelectionMode = filter?.data?.noSelectionMode;
        if (noSelectionMode !== FILTER_SELECTION_MODES.CUSTOM) {
            return true;
        }
        const defaultFilter = filter?.data?.defaultFilter;
        return defaultFilter && isFilterValid(defaultFilter);
    });
};

