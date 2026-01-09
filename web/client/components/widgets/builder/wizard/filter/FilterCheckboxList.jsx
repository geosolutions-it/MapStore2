/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Checkbox, Radio } from 'react-bootstrap';
import FilterTitle from './FilterTitle';

const FilterCheckboxList = ({
    filterLabel,
    filterIcon,
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {},
    layoutDirection = 'vertical',
    layoutMaxHeight,
    filterNameStyle = {},
    titleDisabled = false
}) => {
    const isSingle = selectionMode === 'single';
    const isInline = layoutDirection === 'horizontal';

    const handleToggle = (value) => {
        if (isSingle) {
            onSelectionChange([value]);
            return;
        }
        const alreadySelected = selectedValues.includes(value);
        const nextValues = alreadySelected
            ? selectedValues.filter((val) => val !== value)
            : [...selectedValues, value];
        onSelectionChange(nextValues);
    };

    const ControlComponent = isSingle ? Radio : Checkbox;

    const containerClassName = [
        'ms-filter-checkbox-list-items',
        layoutDirection === 'horizontal' ? '_direction-horizontal' : '_direction-vertical'
    ].filter(Boolean).join(' ');

    const containerStyle = layoutMaxHeight
        ? { maxHeight: layoutMaxHeight, overflowY: 'auto' }
        : undefined;

    return (
        <FormGroup className="ms-filter-checkbox-list">
            <FilterTitle
                filterLabel={filterLabel}
                filterIcon={filterIcon}
                filterNameStyle={filterNameStyle}
                className="ms-filter-checkbox-list-title"
                titleDisabled={titleDisabled}
                items={items}
                onSelectionChange={onSelectionChange}
                showSelectAllOptions
                selectionMode={selectionMode}
            />
            <div className={containerClassName} style={containerStyle}>
                {items.map(({ id, label, description, disabled }) => (
                    <ControlComponent
                        key={id}
                        inline={isInline}
                        checked={selectedValues.includes(id)}
                        onChange={() => handleToggle(id)}
                        disabled={disabled}
                    >
                        <span className="ms-filter-checkbox-list-item-label">{label}</span>
                        {description ? (
                            <span className="ms-filter-checkbox-list-item-description">
                                {description}
                            </span>
                        ) : null}
                    </ControlComponent>
                ))}
            </div>
        </FormGroup>
    );
};

FilterCheckboxList.propTypes = {
    filterLabel: PropTypes.string,
    filterIcon: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        disabled: PropTypes.bool
    })),
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelectionChange: PropTypes.func,
    layoutDirection: PropTypes.oneOf(['horizontal', 'vertical']),
    layoutMaxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    filterNameStyle: PropTypes.object,
    titleDisabled: PropTypes.bool
};

export default FilterCheckboxList;


