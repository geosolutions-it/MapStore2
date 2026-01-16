/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from 'uuid/v1';
import { cqlStringField, cqlNumberField, cqlBooleanField, toCQLFilter } from './FilterUtils';

/**
 * Convert filter selections to filterObj format (mapstore format).
 * Uses the same structure as layerFilter with filterFields and groupFields.
 * Based on the pattern from gridUpdateToQueryUpdate in FeatureGridUtils.
 *
 * @param {object} filterData - Filter data object with layer, valueAttribute, etc.
 * @param {array} selections - Array of selected item IDs/values
 * @param {object} options - Optional parameters
 * @param {string} options.groupId - Optional group ID (UUID will be generated if not provided)
 * @returns {object} Filter object in mapstore format
 */
export const selectionsToFilterObj = (filterData, selections = [], options = {}) => {
    if (!filterData || !filterData.data || selections.length === 0) {
        return {
            format: 'mapstore',
            version: '1.0.0',
            filterFields: [],
            groupFields: []
        };
    }

    const { data } = filterData;
    const { layer, valueAttribute, filterComposition = 'OR' } = data;

    if (!layer || !valueAttribute) {
        return {
            format: 'mapstore',
            version: '1.0.0',
            filterFields: [],
            groupFields: []
        };
    }

    // Generate unique group ID - use provided UUID or generate new one
    const groupId = options.groupId || uuid();

    // Create filterFields from selections - same pattern as gridUpdateToQueryUpdate
    const filterFields = selections.map((value) => ({
        attribute: valueAttribute,
        rowId: uuid(), // Generate unique UUID for each rowId
        type: 'string', // Default to string, can be enhanced to detect type
        groupId: selections.length > 1 ? groupId : undefined,
        operator: '=',
        value: value
    }));

    // Create groupFields if multiple selections (same pattern as gridUpdateToQueryUpdate)
    const groupFields = selections.length > 1 ? [{
        id: groupId,
        logic: filterComposition, // 'OR' or 'AND'
        index: 0
    }] : [];

    return {
        format: 'mapstore',
        version: '1.0.0',
        filterFields,
        groupFields
    };
};

/**
 * Process userDefined filters by converting each selected item's filter to CQL
 * and combining them with filterComposition.
 *
 * @param {object} filter - Filter configuration object with userDefinedItems
 * @param {array} filterSelections - Array of selected userDefinedItem IDs
 * @param {string} filterComposition - 'OR' or 'AND' to combine multiple selections
 * @returns {object|null} Single CQL filter object with combined body, or null if no selections
 */
export const processUserDefinedFilters = (filter, filterSelections = [], filterComposition = 'OR') => {
    if (!filter || !filter.data || !filter.data.userDefinedItems || filterSelections.length === 0) {
        return null;
    }

    const { userDefinedItems } = filter.data;
    const cqlStrings = [];

    // For each selected userDefinedItem, generate CQL using toCQLFilter
    filterSelections.forEach((selectedId) => {
        const userDefinedItem = userDefinedItems.find(item => item.id === selectedId);
        if (userDefinedItem && userDefinedItem.filter) {
            const cqlString = toCQLFilter(userDefinedItem.filter);
            if (cqlString && cqlString !== 'INCLUDE') {
                cqlStrings.push(cqlString);
            }
        }
    });

    if (cqlStrings.length === 0) {
        return null;
    }

    // Combine all CQL strings using filterComposition
    const combinedBody = cqlStrings.length === 1
        ? cqlStrings[0]
        : cqlStrings.map(cql => `(${cql})`).join(` ${filterComposition.toUpperCase()} `);

    return {
        format: 'cql',
        version: '1.0.0',
        body: combinedBody,
        id: `${combinedBody}`,
        filterId: filter.id
    };
};

/**
 * Process features filters by generating CQL for each selection
 * and combining them with filterComposition.
 *
 * @param {object} filter - Filter configuration object with valueAttribute
 * @param {array} filterSelections - Array of selected values
 * @param {string} filterComposition - 'OR' or 'AND' to combine multiple selections
 * @returns {object|null} Single CQL filter object with combined body, or null if no selections
 */
export const processFeaturesFilters = (filter, filterSelections = [], filterComposition = 'OR') => {
    if (!filter || !filter.data || filterSelections.length === 0) {
        return null;
    }

    const { valueAttribute } = filter.data;
    if (!valueAttribute) {
        return null;
    }

    const cqlStrings = [];

    // Process each selection to create CQL string
    filterSelections.forEach((selectionValue) => {
        // Default to string type and '=' operator for simple equality filter
        const operator = '=';
        const fieldType = 'string'; // Could be enhanced to detect type from layer metadata

        let cqlString = null;

        // Generate CQL based on field type
        switch (fieldType) {
        case 'number':
            cqlString = cqlNumberField(valueAttribute, operator, selectionValue);
            break;
        case 'boolean':
            cqlString = cqlBooleanField(valueAttribute, operator, selectionValue);
            break;
        case 'string':
        default:
            cqlString = cqlStringField(valueAttribute, operator, selectionValue);
            break;
        }

        if (cqlString) {
            cqlStrings.push(cqlString);
        }
    });

    if (cqlStrings.length === 0) {
        return null;
    }

    // Combine all CQL strings using filterComposition
    const combinedBody = cqlStrings.length === 1
        ? cqlStrings[0]
        : cqlStrings.map(cql => `(${cql})`).join(` ${filterComposition.toUpperCase()} `);

    return {
        format: 'cql',
        version: '1.0.0',
        body: combinedBody,
        id: `[${combinedBody}]`,
        filterId: filter.id
    };
};

/**
 * Process a single filter configuration to generate a CQL filter object.
 * Handles both features and userDefined dataSource types.
 *
 * @param {object} filter - Filter configuration object
 * @param {array} filterSelections - Array of selected values/IDs for this filter
 * @returns {object|null} CQL filter object in format:
 *   { format: 'cql', version: '1.0.0', body: string, id: string, filterId: string }
 *   Returns null if no valid filter can be generated
 */
export const processFilterToCQL = (filter, filterSelections = []) => {
    // Skip if no selections
    if (!filterSelections || filterSelections.length === 0) {
        return null;
    }

    const { data } = filter;
    const { dataSource, valuesFrom, filterComposition = 'OR' } = data || {};

    let cqlFilter = null;

    // Handle userDefined dataSource
    if (dataSource === 'userDefined') {
        cqlFilter = processUserDefinedFilters(filter, filterSelections, filterComposition);
    } else if (dataSource === 'features' && (valuesFrom === 'grouped' || valuesFrom === 'single')) {
        // Handle features dataSource with grouped or single (Attributes) valuesFrom
        cqlFilter = processFeaturesFilters(filter, filterSelections, filterComposition);
    }

    return cqlFilter;
};

/**
 * Combine multiple filter configurations into an array of CQL filter objects.
 * Handles both features and userDefined dataSource types.
 *
 * @param {array} filters - Array of filter configuration objects
 * @param {object} selections - Object mapping filter IDs to arrays of selected values/IDs
 * @param {object} options - Optional parameters (currently unused, kept for API compatibility)
 * @returns {array|null} Array of CQL filter objects in format:
 *   [{ format: 'cql', version: '1.0.0', body: string, id: string }, ...]
 *   Returns null if no valid filters
 */
export const combineFiltersToCQL = (filters = [], selections = {}) => {
    if (!filters || filters.length === 0) {
        return null;
    }

    const cqlFiltersToCombine = [];

    // Process each filter
    filters.forEach((filter) => {
        const filterSelections = selections[filter.id];
        const cqlFilter = processFilterToCQL(filter, filterSelections);

        // Add the CQL filter if generated (one per filter)
        if (cqlFilter) {
            cqlFiltersToCombine.push(cqlFilter);
        }
    });

    // Return null if no valid filters
    if (cqlFiltersToCombine.length === 0) {
        return null;
    }

    // Return array of CQL filters
    return cqlFiltersToCombine;
};

