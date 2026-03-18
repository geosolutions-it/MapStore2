/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import WidgetContainer from './WidgetContainer';
import FilterView from '../../../plugins/widgetbuilder/FilterView';
import { applyFilterWidgetInteractions } from '../../../actions/interactions';
import './filter-widget.less';
import { interactionTargetVisibilitySelector, interactionTargetsFilterDisabledSelector, getApplyStyleOutOfSyncForFilterWidget } from '../../../selectors/widgets';

/**
 * FilterWidget component for rendering filter widgets in dashboard view
 * Displays all filters stacked vertically with immediate selection updates
 */
const FilterWidget = ({
    id,
    title,
    filters = [],
    interactions = [],
    activeTargets = {},
    targetsWithDisabledFilter = {},
    applyStyleOutOfSyncForWidget = {},
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
    target = 'floating' // Default target container
} = {}) => {

    // Handle selection change for a specific filter
    const handleSelectionChange = (filterId) => (newValues) => {
        // Update widget state
        const updatedSelections = {
            ...selections,
            [filterId]: newValues
        };
        updateProperty(id, 'selections', updatedSelections);

        // Trigger interaction effects after state is updated
        // Use setTimeout to ensure reducer has processed UPDATE_PROPERTY first
        if (dispatch) {
            setTimeout(() => {
                dispatch(applyFilterWidgetInteractions(id, target, filterId));
            }, 0);
        }
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
                    filters.map((filter, index) => {
                        const filterInteractions = interactions.filter(i => i.source.nodePath.includes(filter.id));
                        return (<div
                            key={filter.id}
                            className="ms-filter-widget-item"
                            style={{
                                marginBottom: index < filters.length - 1 ? '20px' : '0'
                            }}
                        >
                            <FilterView
                                interactions={filterInteractions}
                                activeTargets={activeTargets}
                                targetsWithDisabledFilter={targetsWithDisabledFilter}
                                applyStyleOutOfSync={applyStyleOutOfSyncForWidget[filter.id] || {}}
                                filterData={filter}
                                selections={selections[filter.id] || []}
                                onSelectionChange={handleSelectionChange(filter.id)}
                            />
                        </div>);
                    })
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
    target: PropTypes.string
};

export default connect(createStructuredSelector({
    activeTargets: interactionTargetVisibilitySelector,
    targetsWithDisabledFilter: interactionTargetsFilterDisabledSelector,
    applyStyleOutOfSyncForWidget: (state, ownProps) => getApplyStyleOutOfSyncForFilterWidget(state, ownProps?.id)
}))(FilterWidget);

