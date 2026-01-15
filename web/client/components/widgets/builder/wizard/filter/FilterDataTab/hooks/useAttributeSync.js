/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback } from 'react';

/**
 * Custom hook that provides an onChange handler with automatic attribute synchronization.
 * When valueAttribute changes, it automatically sets labelAttribute and sortByAttribute
 * to the same value if they are not already set.
 *
 * @param {object} filterData - Current filter data object
 * @param {function} onChangeProp - Original onChange callback
 * @returns {function} Enhanced onChange handler with auto-sync
 */
export const useAttributeSync = (filterData, onChangeProp) => {
    return useCallback((key, value) => {
        // Call the original onChange
        onChangeProp(key, value);

        // If valueAttribute is being changed, also update labelAttribute and sortByAttribute
        // Only update if they are currently undefined or null
        if (key === 'data.valueAttribute' && value) {
            const currentData = filterData?.data || {};

            // Set labelAttribute to the same value only if it's falsy
            if (!currentData.labelAttribute) {
                onChangeProp('data.labelAttribute', value);
            }

            // Set sortByAttribute to the same value only if it's falsy
            if (!currentData.sortByAttribute) {
                onChangeProp('data.sortByAttribute', value);
            }
        }
    }, [onChangeProp, filterData]);
};

