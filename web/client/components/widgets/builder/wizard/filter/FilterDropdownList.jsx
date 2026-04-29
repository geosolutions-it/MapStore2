/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import Select from 'react-select';
import './FilterDropdownList.less';

const FilterDropdownList = ({
    items = [],
    selectionMode = 'multiple',
    selectedValues,
    placeholder = 'Select...',
    onSelectionChange = () => {},
    layoutMaxHeight
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

    const hasScrollableValues = typeof layoutMaxHeight === 'number' && normalizedValues.length > 0;
    const valueContainerStyle = hasScrollableValues
        ? { ['--filter-widget-dropdown-value-max-height']: `${layoutMaxHeight}px` }
        : undefined;
    const listClassName = ['ms-filter-widget-dropdown-list', hasScrollableValues && 'ms-filter-widget-dropdown-list--scrollable-values'].filter(Boolean).join(' ');

    return (
        <FormGroup className={listClassName} style={valueContainerStyle}>
            <Select
                className="ms-filter-widget-dropdown"
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
    onSelectionChange: PropTypes.func,
    layoutMaxHeight: PropTypes.number
};

export default FilterDropdownList;


