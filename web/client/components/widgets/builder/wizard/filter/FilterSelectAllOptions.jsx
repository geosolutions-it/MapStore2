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
import { Button } from 'react-bootstrap';

/**
 * Common component for rendering Select All / Clear options
 * Used across all filter variants (checkbox, button, dropdown, switch)
 */
const FilterSelectAllOptions = ({
    items = [],
    selectedValues = [],
    onSelectionChange,
    selectionMode = 'multiple',
    allowEmptySelection = true
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
    const showSelectAll = isMultiple;
    const isAllSelected = hasItems && selectedValues.length === items.filter(item => !item.disabled).length;
    // Show Select All only if not all items are already selected
    const hasSelectedItems = selectedValues && selectedValues.length > 0;
    const showClear = allowEmptySelection;
    const shouldShow = hasItems
        && onSelectionChange
        && (showSelectAll || showClear);
    const showSeparator = isMultiple && showClear;
    if (!shouldShow) {
        return null;
    }


    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                fontSize: '12px'
            }}
        >
            {isMultiple && <Button
                bsStyle="link"
                bsSize="sm"
                onClick={isMultiple ? handleSelectAll : undefined}
                disabled={!isMultiple || isAllSelected}

            >
                <span><Message msgId="widgets.filterWidget.selectAll" /></span>
            </Button>}
            {showClear ? (
                <>
                    {showSeparator ? <span>/</span> : null}
                    <Button
                        bsStyle="link"
                        bsSize="sm"
                        onClick={hasSelectedItems ? handleDeselectAll : undefined}
                        disabled={!hasSelectedItems}
                    >
                        <Message msgId="widgets.filterWidget.clear" />
                    </Button>
                </>
            ) : null}
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
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    allowEmptySelection: PropTypes.bool
};

export default FilterSelectAllOptions;

