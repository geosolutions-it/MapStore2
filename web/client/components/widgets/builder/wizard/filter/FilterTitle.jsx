/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { loadFontAwesome } from '../../../../../utils/FontUtils';

/**
 * Common component for rendering filter title with icon
 * Used across all filter variants (checkbox, button, dropdown, switch)
 */
const FilterTitle = ({
    filterLabel,
    filterIcon,
    filterNameStyle = {},
    className = 'ms-filter-title',
    titleDisabled = false
}) => {
    useEffect(() => {
        loadFontAwesome();
    }, []);

    if (!filterLabel || titleDisabled) {
        return null;
    }

    return (
        <span className={className} style={filterNameStyle}>
            {filterIcon && <i className={`fa fa-${filterIcon}`} style={{ marginRight: '5px' }} />}
            {filterLabel}
        </span>
    );
};

FilterTitle.propTypes = {
    filterLabel: PropTypes.string,
    filterIcon: PropTypes.string,
    filterNameStyle: PropTypes.object,
    className: PropTypes.string,
    titleDisabled: PropTypes.bool
};

export default FilterTitle;

