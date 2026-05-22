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
 * It also disconnects apply-dimension interactions because they depend on valueAttributeType.
 *
 * @param {object} filterData - Current filter data object
 * @param {function} onChangeProp - Original onChange callback
 * @returns {function} Enhanced onChange handler with auto-sync
 */
export const useAttributeSync = (filterData, onChangeProp, onEditorChange, selections, interactions = []) => {
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

        if (key === 'data.valueAttribute' || key === 'data.valueAttributeType') {
            const filterId = filterData?.id;
            let disconnectedDimensionInteraction = false;
            const updatedInteractions = interactions.map(interaction => {
                const isCurrentFilterInteraction = filterId
                    ? interaction?.source?.nodePath?.includes(filterId)
                    : true;
                const shouldDisconnect = isCurrentFilterInteraction
                    && interaction?.targetType === 'applyDimension'
                    && interaction?.plugged === true;

                if (shouldDisconnect) {
                    disconnectedDimensionInteraction = true;
                    return {
                        ...interaction,
                        plugged: false
                    };
                }
                return interaction;
            });

            if (disconnectedDimensionInteraction) {
                // Apply Dimension depends on valueAttributeType, so disconnect it when the value attribute or its type changes.
                onEditorChange('interactions', updatedInteractions);
            }
        }

        if (["data.dataSource", "data.valuesFrom", "data.layer", "data.valueAttribute", "data.labelAttribute", "data.sortByAttribute", "data.maxFeatures", "data.sortOrder"].includes(key)) {
            onEditorChange('selections', {
                ...selections,
                [filterData.id]: []
            });
        }
    }, [onChangeProp, filterData, selections, onEditorChange]);
};
