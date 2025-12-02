/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo, useCallback, useEffect } from 'react';
import FilterWizard from '../../components/widgets/builder/wizard/FilterWizard';
import FilterSelector from '../../components/widgets/builder/wizard/filter/FilterSelector';
import FilterList from '../../components/widgets/builder/wizard/filter/FilterList';
import FilterCheckboxList from '../../components/widgets/builder/wizard/filter/FilterCheckboxList';
import FilterChipList from '../../components/widgets/builder/wizard/filter/FilterChipList';
import FilterDropdownList from '../../components/widgets/builder/wizard/filter/FilterDropdownList';
import useBatchedUpdates from '../../hooks/useBatchedUpdates';
import {
    createNewFilter,
    updateNestedProperty,
    createEmptyFilterData,
    createDefaultSelections
} from './utils/filterBuilderDefaults';

const ensureFilterShape = (filter = {}) => ({
    ...filter,
    data: filter.data || createEmptyFilterData(),
    layout: {
        ...(filter.layout || {}),
        selectedColor: filter.layout?.selectedColor || '#0d99ff'
    },
    actions: filter.actions || {}
});

const createFallbackFilter = () => ensureFilterShape(createNewFilter(0));

const FilterBuilderContent = ({
    data: editorData = {},
    onChange: onChangeEditor = () => {},
    enabled,
    toggleLayerSelector,
    openFilterEditor
} = {}) => {
    const {
        widgetType,
        title: widgetTitle,
        filters = [],
        selectedFilterId = null,
        selections = {}
    } = editorData;

    // Initialize filters, selections, and title
    useEffect(() => {
        if (!enabled || widgetType !== 'filter') {
            return;
        }
        if (!filters.length) {
            const fallbackFilter = createFallbackFilter();
            onChangeEditor('filters', [fallbackFilter]);
            onChangeEditor('selectedFilterId', fallbackFilter.id);
            onChangeEditor('selections', {
                ...(selections || {}),
                [fallbackFilter.id]: []
            });
            return;
        }
        if (!Object.keys(selections || {}).length) {
            onChangeEditor('selections', createDefaultSelections(filters));
        }
        if (!widgetTitle) {
            onChangeEditor('title', 'Filter widget');
        }
    }, [enabled, widgetType, filters.length, Object.keys(selections || {}).length, widgetTitle, onChangeEditor]);


    const variantComponentMap = useMemo(() => ({
        checkbox: FilterCheckboxList,
        chips: FilterChipList,
        dropdown: FilterDropdownList
    }), []);

    const selectedFilter = useMemo(
        () => filters.find(filter => filter.id === selectedFilterId) || null,
        [filters, selectedFilterId]
    );
    const data = useMemo(() => {
        if (selectedFilter) {
            return ensureFilterShape(selectedFilter);
        }
        if (filters[0]) {
            return ensureFilterShape(filters[0]);
        }
        return null;
    }, [selectedFilter, filters]);

    const handleFilterSelect = useCallback((filterId) => {
        onChangeEditor('selectedFilterId', filterId || null);
    }, [onChangeEditor]);

    const handleAddFilter = useCallback(() => {
        const nextFilter = createNewFilter(filters.length);
        // Inherit layer from currently selected filter if available
        if (selectedFilter?.data?.layer) {
            nextFilter.data = {
                ...nextFilter.data,
                layer: selectedFilter.data.layer
            };
        }
        const nextFilters = [...filters, nextFilter];
        onChangeEditor('filters', nextFilters);
        onChangeEditor('selectedFilterId', nextFilter.id);
        onChangeEditor('selections', {
            ...(selections || {}),
            [nextFilter.id]: []
        });
    }, [filters, selectedFilter, selections, onChangeEditor]);

    const handleDeleteFilter = useCallback((filterId) => {
        if (!filterId) {
            return;
        }
        const nextFilters = filters.filter(filter => filter.id !== filterId);
        onChangeEditor('filters', nextFilters);
        if (selections && selections[filterId]) {
            const nextSelections = { ...selections };
            delete nextSelections[filterId];
            onChangeEditor('selections', nextSelections);
        }
        if (selectedFilterId === filterId) {
            onChangeEditor('selectedFilterId', nextFilters[0]?.id || null);
        }
    }, [filters, selections, selectedFilterId, onChangeEditor]);

    const handleRenameFilter = useCallback((filterId, name) => {
        const label = name?.trim() || 'Untitled';
        const nextFilters = filters.map(filter => filter.id === filterId
            ? { ...filter, name: label, label }
            : filter);
        onChangeEditor('filters', nextFilters);
        if (data && data.id === filterId) {
            handleFilterSelect(filterId);
        }
    }, [filters, data, handleFilterSelect, onChangeEditor]);

    // Batched update handler to avoid race conditions when multiple properties are updated together
    const [batchedHandleChange] = useBatchedUpdates(
        (changes) => {
            if (!data) {
                return;
            }
            // Apply all accumulated changes to the filter
            let nextFilter = { ...data };
            Object.entries(changes).forEach(([key, value]) => {
                nextFilter = key.includes('.')
                    ? updateNestedProperty(nextFilter, key, value)
                    : { ...nextFilter, [key]: value };
            });
            const nextFilters = filters.map(filter =>
                filter.id === data.id ? nextFilter : filter
            );
            onChangeEditor('filters', nextFilters);
        },
        {
            delay: 0,
            reducer: (accumulated, key, value) => {
                const current = accumulated || {};
                return { ...current, [key]: value };
            }
        }
    );

    const handleChange = useCallback((key, value) => {
        batchedHandleChange(key, value);
    }, [batchedHandleChange]);

    const handleSelectionChange = useCallback((filterId) => (nextValues = []) => {
        onChangeEditor('selections', {
            ...(selections || {}),
            [filterId]: nextValues
        });
    }, [selections, onChangeEditor]);

    const handleOpenLayerSelector = useCallback(() => {
        if (toggleLayerSelector && data?.id) {
            toggleLayerSelector({ key: 'filter-layer', filterId: data.id });
        }
    }, [toggleLayerSelector, data]);

    return (
        <div className="ms-filter-builder-content">
            <FilterList
                filters={filters}
                componentMap={variantComponentMap}
                selections={selections}
                getSelectionHandler={handleSelectionChange}
                selectedFilterId={selectedFilterId}
            />
            <FilterSelector
                filters={filters}
                selectedFilterId={selectedFilterId}
                onSelect={handleFilterSelect}
                onAdd={handleAddFilter}
                onDelete={handleDeleteFilter}
                onRename={handleRenameFilter}
            />
            {data && (
                <FilterWizard
                    data={data}
                    onChange={handleChange}
                    onOpenLayerSelector={handleOpenLayerSelector}
                    openFilterEditor={openFilterEditor}
                />
            )}
        </div>
    );
};

export default FilterBuilderContent;

