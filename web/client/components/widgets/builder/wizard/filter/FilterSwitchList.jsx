/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import SwitchButton from '../../../../misc/switch/SwitchButton';

const FilterSwitchList = ({
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {},
    layoutDirection = 'vertical',
    layoutMaxHeight
}) => {
    const isSingle = selectionMode === 'single';

    const handleToggle = (value, currentChecked) => {
        if (isSingle) {
            // For single mode: if turning on, set only this value; if turning off, clear selection
            if (!currentChecked) {
                onSelectionChange([value]);
            } else {
                onSelectionChange([]);
            }
            return;
        }
        // For multiple mode: toggle the value in the array
        const alreadySelected = selectedValues.includes(value);
        const nextValues = alreadySelected
            ? selectedValues.filter((val) => val !== value)
            : [...selectedValues, value];
        onSelectionChange(nextValues);
    };

    const containerClassName = [
        'ms-filter-switch-list-items',
        layoutDirection === 'horizontal' ? '_direction-horizontal' : '_direction-vertical'
    ].filter(Boolean).join(' ');

    const containerStyle = layoutMaxHeight
        ? { maxHeight: layoutMaxHeight, overflowY: 'auto' }
        : undefined;

    return (
        <FormGroup className="ms-filter-switch-list">
            <div className={containerClassName} style={containerStyle}>
                {items.map(({ id, label, disabled }) => {
                    const isChecked = selectedValues.includes(id);
                    return (
                        <div
                            key={id}
                            className="ms-filter-switch-list-item"
                        >
                            <SwitchButton
                                checked={isChecked}
                                disabled={disabled}
                                onChange={() => handleToggle(id, isChecked)}
                            />
                            <span className="ms-filter-switch-list-item-label">{label}</span>
                        </div>
                    );
                })}
            </div>
        </FormGroup>
    );
};

FilterSwitchList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelectionChange: PropTypes.func,
    layoutDirection: PropTypes.oneOf(['horizontal', 'vertical']),
    layoutMaxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default FilterSwitchList;

