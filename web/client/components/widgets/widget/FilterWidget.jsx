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
import { applyFilterWidgetInteractions, zoomToFilterExtent } from '../../../actions/interactions';
import './filter-widget.less';
import { interactionTargetVisibilitySelector, interactionTargetsFilterDisabledSelector, getApplyStyleOutOfSyncForFilterWidget, getApplyDimensionOutOfSyncForFilterWidget, inactiveInteractionIdsForWidgetSelector } from '../../../selectors/widgets';
import { currentTimeSelector, offsetEnabledSelector } from '../../../selectors/dimension';
import { isMapTimeTarget } from '../../../utils/InteractionUtils';

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
    applyDimensionOutOfSyncForWidget = {},
    selections = {},
    currentTime,
    timelineRangeEnabled,
    inactiveInteractionIds = [],
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
    onApplyInteractions = () => {},
    onZoomToFilterExtent = () => {},
    target = 'floating' // Default target container
} = {}) => {

    // Re-apply interaction effects for a filter. Deferred so the reducer has
    // processed the preceding UPDATE_PROPERTY first.
    const reapplyInteractions = (filterId) => {
        setTimeout(() => {
            onApplyInteractions(id, target, filterId);
        }, 0);
    };

    const handleZoomToFilterExtent = (filterId) => () => {
        onZoomToFilterExtent(id, target, filterId);
    };

    // Handle selection change for a specific filter
    const handleSelectionChange = (filterId) => (newValues) => {
        updateProperty(id, `selections[${filterId}]`, newValues);
        reapplyInteractions(filterId);
    };

    // Toggle a filter's `disabled` flag. Selections are preserved.
    const handleToggleDisabled = (filterId) => (nextDisabled) => {
        const updatedFilters = filters.map(f => (
            f.id === filterId ? { ...f, disabled: !!nextDisabled } : f
        ));
        updateProperty(id, 'filters', updatedFilters);
        reapplyInteractions(filterId);
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
            <div className="mapstore-widget-filter-content">
                {filters.length === 0 ? (
                    <div className="ms-filter-widget-empty" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        No filters configured
                    </div>
                ) : (
                    filters.map((filter, index) => {
                        const filterInteractions = (interactions || []).filter(i => i?.source?.nodePath?.includes(filter.id));
                        const syncCurrentTime = filterInteractions.some(interaction =>
                            interaction?.plugged === true
                            && isMapTimeTarget(interaction?.target?.nodePath)
                            && interaction?.configuration?.twoWaySynchronization === true
                        );
                        return (<div
                            key={filter.id}
                            className="ms-filter-widget-item"
                            style={{
                                marginBottom: index < filters.length - 1 ? '20px' : '0'
                            }}
                        >
                            <FilterView
                                interactions={filterInteractions}
                                inactiveInteractionIds={inactiveInteractionIds}
                                activeTargets={activeTargets}
                                targetsWithDisabledFilter={targetsWithDisabledFilter}
                                applyStyleOutOfSync={applyStyleOutOfSyncForWidget[filter.id] || {}}
                                applyDimensionOutOfSync={applyDimensionOutOfSyncForWidget[filter.id] || {}}
                                filterData={filter}
                                selections={selections[filter.id] || []}
                                currentTime={currentTime}
                                syncCurrentTime={syncCurrentTime}
                                timelineRangeEnabled={timelineRangeEnabled}
                                onSelectionChange={handleSelectionChange(filter.id)}
                                showItemToolbar // toolbar shown inside the widget, not in the builder preview
                                onToggleDisabled={handleToggleDisabled(filter.id)}
                                onZoomToFilterExtent={handleZoomToFilterExtent(filter.id)}
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
    onApplyInteractions: PropTypes.func,
    onZoomToFilterExtent: PropTypes.func,
    timelineRangeEnabled: PropTypes.bool,
    inactiveInteractionIds: PropTypes.array,
    target: PropTypes.string
};

export default connect(createStructuredSelector({
    activeTargets: interactionTargetVisibilitySelector,
    targetsWithDisabledFilter: interactionTargetsFilterDisabledSelector,
    applyStyleOutOfSyncForWidget: (state, ownProps) => getApplyStyleOutOfSyncForFilterWidget(state, ownProps?.id),
    applyDimensionOutOfSyncForWidget: (state, ownProps) => getApplyDimensionOutOfSyncForFilterWidget(state, ownProps?.id),
    inactiveInteractionIds: (state, ownProps) => inactiveInteractionIdsForWidgetSelector(state, ownProps?.id),
    currentTime: currentTimeSelector,
    timelineRangeEnabled: offsetEnabledSelector
}), {
    onApplyInteractions: applyFilterWidgetInteractions,
    onZoomToFilterExtent: zoomToFilterExtent
})(FilterWidget);
