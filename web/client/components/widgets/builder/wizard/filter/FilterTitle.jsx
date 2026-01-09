/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ControlLabel } from 'react-bootstrap';
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
    titleDisabled = false,
    items = [],
    onSelectionChange,
    showSelectAllOptions = false,
    selectionMode = 'multiple'
}) => {
    useEffect(() => {
        loadFontAwesome();
    }, []);

    const handleSelectAll = () => {
        if (!onSelectionChange || !items || items.length === 0) {
            return;
        }
        // Select all items that are not disabled
        const enabledItems = items.filter(item => !item.disabled);
        const allIds = enabledItems.map(item => item.id);
        onSelectionChange(allIds);
    };

    const handleDeselectAll = () => {
        if (!onSelectionChange) {
            return;
        }
        onSelectionChange([]);
    };

    const hasItems = items && items.length > 0;
    const isMultiple = selectionMode === 'multiple';
    const shouldShowHeader = showSelectAllOptions && hasItems && onSelectionChange;

    if (!filterLabel || titleDisabled) {
        return null;
    }

    return (
        <div>
            <ControlLabel className={className} style={filterNameStyle}>
                {filterIcon && <i className={`fa fa-${filterIcon}`} style={{ marginRight: '5px' }} />}
                {filterLabel}
            </ControlLabel>
            {shouldShowHeader && (
                <div
                    style={{
                        borderBottom: '1px solid #ddd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                    }}
                >
                    <div
                        onClick={isMultiple ? handleSelectAll : undefined}
                        style={{
                            cursor: isMultiple ? 'pointer' : 'not-allowed',
                            opacity: isMultiple ? 1 : 0.5
                        }}
                    >
                        <span>Select all</span>
                    </div>
                    <div
                        onClick={handleDeselectAll}
                        style={{
                            padding: '4px 8px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </div>
                </div>
            )}
        </div>
    );
};

FilterTitle.propTypes = {
    filterLabel: PropTypes.string,
    filterIcon: PropTypes.string,
    filterNameStyle: PropTypes.object,
    className: PropTypes.string,
    titleDisabled: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    onSelectionChange: PropTypes.func,
    showSelectAllOptions: PropTypes.bool,
    selectionMode: PropTypes.oneOf(['single', 'multiple'])
};

export default FilterTitle;

