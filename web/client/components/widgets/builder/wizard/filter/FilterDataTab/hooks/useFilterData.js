/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useMemo } from 'react';
import { DATA_SOURCE_TYPES, VALUES_FROM_TYPES, USER_DEFINED_TYPES } from '../constants';

// Inline layer utility functions
const normalizeLayer = (layer) => {
    if (!layer) return null;
    if (typeof layer === 'object') return layer;
    return null;
};

const getLayerId = (layer) => {
    if (!layer) return null;
    if (typeof layer === 'string') return layer;
    if (typeof layer === 'object') return layer.id || null;
    return null;
};

// Inline filter data utility functions
const normalizeUserDefinedItems = (userDefinedItems = []) => {
    return userDefinedItems.map(item => {
        const filterEntry = typeof item?.filter === 'string'
            ? { expression: item.filter }
            : (item?.filter || null);

        // Normalize style: if it's an object, keep it; if it's a string, convert to object; if missing, set to null
        let styleEntry = null;
        if (item?.style) {
            if (typeof item.style === 'object' && item.style.name) {
                styleEntry = item.style;
            } else if (typeof item.style === 'string' && item.style) {
                styleEntry = { name: item.style };
            } else if (typeof item.style === 'object') {
                styleEntry = item.style;
            }
        }

        return {
            id: item?.id,
            label: item?.label || '',
            value: item?.value || '',
            filter: filterEntry,
            style: styleEntry
        };
    });
};

const normalizeMaxFeatures = (maxFeatures) => {
    return Number.isFinite(maxFeatures) ? maxFeatures : '';
};

/**
 * Custom hook that normalizes and derives filter data for easier consumption.
 *
 * @param {object} data - Raw filter data
 * @returns {object} Normalized filter data with derived values
 */
export const useFilterData = (data = {}) => {
    return useMemo(() => {
        const filterData = data?.data || {};

        // Normalize layer
        const selectedLayerId = getLayerId(filterData.layer);
        const selectedLayerObject = normalizeLayer(filterData.layer);

        // Data source flags
        const dataSource = filterData.dataSource;
        const isUserDefined = dataSource === DATA_SOURCE_TYPES.USER_DEFINED;
        const isFeaturesSource = dataSource === DATA_SOURCE_TYPES.FEATURES;
        const layerIsRequired = !!dataSource;

        // Values from
        const valuesFrom = filterData.valuesFrom || VALUES_FROM_TYPES.GROUPED;

        // Attributes
        const valueAttribute = filterData.valueAttribute ?? null;
        const labelAttribute = filterData.labelAttribute ?? null;
        const sortByAttribute = filterData.sortByAttribute ?? null;
        const sortOrder = filterData.sortOrder;

        // Other settings
        const maxFeaturesValue = normalizeMaxFeatures(filterData.maxFeatures);
        const filterComposition = filterData.filterComposition;
        const userDefinedType = filterData.userDefinedType || USER_DEFINED_TYPES.FILTER_LIST;

        // User defined items
        const userDefinedItems = normalizeUserDefinedItems(filterData.userDefinedItems);
        const defaultFilter = filterData.defaultFilter;

        return {
            // Raw data
            filterData,
            selectedLayerId,
            selectedLayerObject,

            // Data source
            dataSource,
            isUserDefined,
            isFeaturesSource,
            layerIsRequired,

            // Values from
            valuesFrom,

            // Attributes
            valueAttribute,
            labelAttribute,
            sortByAttribute,
            sortOrder,

            // Other
            maxFeaturesValue,
            filterComposition,
            userDefinedType,
            userDefinedItems,
            defaultFilter,

            // Flags
            hasLayerSelection: !!selectedLayerObject
        };
    }, [data]);
};

