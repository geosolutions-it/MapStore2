/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isFilterEmpty } from '../../../utils/FilterUtils';

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
    return (
        <ItemComponent
            glyph="filter"
            active={!disabled}
            tooltipId={!disabled ? 'toc.filterIconEnabled' : 'toc.filterIconDisabled'}
            onClick={() => {
                onChange({ layerFilter: { ...layerFilter, disabled: !layerFilter.disabled }});
            }}
        />
    );
};

export default FilterNodeTool;
