/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';

const FilterDropdownList = ({
    filterName,
    filterIcon,
    items = [],
    selectionMode = 'multiple',
    selectedValues,
    placeholder = 'Select...',
    onSelectionChange = () => {}
}) => {
    const isSingle = selectionMode === 'single';
    const normalizedValues = Array.isArray(selectedValues)
        ? selectedValues
        : (selectedValues ? [selectedValues] : []);

    const options = useMemo(() => items.map((item) => ({
        value: item.id,
        label: item.label,
        isDisabled: item.disabled
    })), [items]);

    const selectedOption = useMemo(() => {
        if (isSingle) {
            return options.find((option) => option.value === normalizedValues[0]) || null;
        }
        return options.filter((option) => normalizedValues.includes(option.value));
    }, [isSingle, options, normalizedValues]);

    const handleChange = (selected) => {
        if (isSingle) {
            onSelectionChange(selected ? [selected.value] : []);
            return;
        }
        const nextValues = Array.isArray(selected)
            ? selected.map((option) => option.value)
            : [];
        onSelectionChange(nextValues);
    };

    return (
        <FormGroup className="ms-filter-dropdown-list">
            {filterName ? (
                <ControlLabel className="ms-filter-dropdown-list-title">
                    {filterIcon && <Glyphicon glyph={filterIcon} style={{ marginRight: '5px' }} />}
                    {filterName}
                </ControlLabel>
            ) : null}
            <Select
                className="ms-filter-dropdown"
                clearable={isSingle}
                multi={!isSingle}
                closeOnSelect={isSingle}
                options={options}
                value={selectedOption}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </FormGroup>
    );
};

FilterDropdownList.propTypes = {
    filterName: PropTypes.string,
    filterIcon: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    placeholder: PropTypes.string,
    onSelectionChange: PropTypes.func
};

export default FilterDropdownList;


