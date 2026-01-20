/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Message from '../../../../I18N/Message';

/**
 * Common component for rendering Select All / Clear options
 * Used across all filter variants (checkbox, button, dropdown, switch)
 */
const FilterSelectAllOptions = ({
    items = [],
    onSelectionChange,
    selectionMode = 'multiple'
}) => {
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
    const shouldShow = hasItems && onSelectionChange;

    if (!shouldShow) {
        return null;
    }

    return (
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
                <span><Message msgId="widgets.filterWidget.selectAll" /></span>
            </div>
            <div
                onClick={handleDeselectAll}
                style={{
                    padding: '4px 8px',
                    cursor: 'pointer'
                }}
            >
                <Message msgId="widgets.filterWidget.clear" />
            </div>
        </div>
    );
};

FilterSelectAllOptions.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    onSelectionChange: PropTypes.func,
    selectionMode: PropTypes.oneOf(['single', 'multiple'])
};

export default FilterSelectAllOptions;

