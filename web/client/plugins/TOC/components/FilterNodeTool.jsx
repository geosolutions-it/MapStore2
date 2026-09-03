/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isFilterEmpty, getFilterWidgetIds, isFilterFromWidgetOnly } from '../../../utils/FilterUtils';

const FilterNodeTool = ({
    node,
    onChange,
    itemComponent
}) => {
    const ItemComponent = itemComponent;
    const { layerFilter } = node || {};
    if (isFilterEmpty(layerFilter) || !ItemComponent) {
        return null;
    }
    const { disabled } = layerFilter || {};
    const widgetIds = getFilterWidgetIds(layerFilter);
    const isWidgetOnly = isFilterFromWidgetOnly(layerFilter);
    const filterType = isWidgetOnly ? 'filterWidget' : widgetIds.length > 0 ? 'filterAndWidget' : 'filter';
    const tooltipId = `toc.${filterType}Icon${disabled ? 'Disabled' : 'Enabled'}`;

    return (
        <ItemComponent
            glyph={isWidgetOnly ? 'filter-widget' : 'filter'}
            active={!disabled}
            tooltipId={tooltipId}
            onClick={() => {
                onChange({ layerFilter: { ...layerFilter, disabled: !layerFilter.disabled }});
            }}
        />
    );
};

export default FilterNodeTool;
