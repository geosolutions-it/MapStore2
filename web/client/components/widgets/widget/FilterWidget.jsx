/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import WidgetContainer from './WidgetContainer';
import FilterView from '../../../plugins/widgetbuilder/FilterView';
import FilterCheckboxList from '../builder/wizard/filter/FilterCheckboxList';
import FilterChipList from '../builder/wizard/filter/FilterChipList';
import FilterDropdownList from '../builder/wizard/filter/FilterDropdownList';
import FilterSwitchList from '../builder/wizard/filter/FilterSwitchList';
import { emitFilterChange } from '../../../utils/WidgetEventEmitter';
import { combineFiltersToCQL } from '../../../utils/FilterEventUtils';
import { generateNodePath } from '../../../utils/InteractionUtils';
import { getWidgetInteractionTreeGenerated } from '../../../selectors/widgets';

/**
 * FilterWidget component for rendering filter widgets in dashboard view
 * Displays all filters stacked vertically with immediate selection updates
 */
const FilterWidget = ({
    id,
    title,
    filters = [],
    selections = {},
    updateProperty = () => {},
    toggleDeleteConfirm = () => {},
    icons,
    topLeftItems,
    topRightItems,
    headerStyle,
    options = {},
    dataGrid = {},
    confirmDelete = false,
    onDelete = () => {},
    dispatch,
    widgetInteractionTree
} = {}) => {
    // Map of filter variant components
    const variantComponentMap = useMemo(() => ({
        checkbox: FilterCheckboxList,
        chips: FilterChipList,
        dropdown: FilterDropdownList,
        'switch': FilterSwitchList
    }), []);

    // Handle selection change for a specific filter
    const handleSelectionChange = (filterId) => (newValues) => {
        // Update widget state
        const updatedSelections = {
            ...selections,
            [filterId]: newValues
        };
        updateProperty(id, 'selections', updatedSelections);

        // Combine all filters into array of CQL filters
        const cqlFilters = combineFiltersToCQL(filters, updatedSelections);

        // Emit a single filter change event
        // if (cqlFilters && cqlFilters.length > 0) {
        // Generate node path using generateNodePath
        const nodePath = widgetInteractionTree ? generateNodePath(widgetInteractionTree, filterId) : null;

        // Wrap in logic format filter object
        // const logicFilter = {
        //     id,
        //     format: 'logic',
        //     version: '1.0.0',
        //     logic: 'OR', // Default logic for combining different filters
        //     filters: cqlFilters
        // };

        // Emit event with logic format filter object
        emitFilterChange(
            dispatch,
            id,
            cqlFilters,
            {},
            nodePath
        );
        // }
    };

    return (
        <WidgetContainer
            id={`widget-filter-${id}`}
            title={title}
            confirmDelete={confirmDelete}
            onDelete={onDelete}
            toggleDeleteConfirm={toggleDeleteConfirm}
            headerStyle={headerStyle}
            isDraggable={dataGrid.isDraggable}
            icons={icons}
            topLeftItems={topLeftItems}
            topRightItems={topRightItems}
            options={options}
        >
            <div className="mapstore-widget-filter-content" style={{ padding: '15px' }}>
                {filters.length === 0 ? (
                    <div className="ms-filter-widget-empty" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        No filters configured
                    </div>
                ) : (
                    filters.map((filter, index) => (
                        <div
                            key={filter.id}
                            className="ms-filter-widget-item"
                            style={{
                                marginBottom: index < filters.length - 1 ? '20px' : '0'
                            }}
                        >
                            <FilterView
                                filterData={filter}
                                componentMap={variantComponentMap}
                                selections={selections[filter.id] || []}
                                onSelectionChange={handleSelectionChange(filter.id)}
                            />
                        </div>
                    ))
                )}
            </div>
        </WidgetContainer>
    );
};

FilterWidget.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    filters: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        layout: PropTypes.shape({
            variant: PropTypes.string,
            icon: PropTypes.string,
            selectionMode: PropTypes.string,
            direction: PropTypes.string,
            maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        }),
        data: PropTypes.object,
        items: PropTypes.array
    })),
    selections: PropTypes.object,
    updateProperty: PropTypes.func,
    toggleDeleteConfirm: PropTypes.func,
    icons: PropTypes.node,
    topLeftItems: PropTypes.node,
    topRightItems: PropTypes.node,
    headerStyle: PropTypes.object,
    options: PropTypes.object,
    dataGrid: PropTypes.object,
    confirmDelete: PropTypes.bool,
    onDelete: PropTypes.func,
    dispatch: PropTypes.func,
    widgetInteractionTree: PropTypes.object
};

export default connect((state) => ({
    widgetInteractionTree: getWidgetInteractionTreeGenerated(state)
}))(FilterWidget);

