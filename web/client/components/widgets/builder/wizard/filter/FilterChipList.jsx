/*
 * Copyright 2025, GeoSolutions.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FlexBox from '../../../../layout/FlexBox';
import Text from '../../../../layout/Text';
import { getTagColorVariables } from '../../../../../utils/ResourcesFiltersUtils';
import FilterTitle from './FilterTitle';

const FilterChipList = ({
    filterLabel,
    filterIcon,
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {},
    layoutDirection = 'vertical',
    layoutMaxHeight,
    selectedColor,
    filterNameStyle = {},
    titleDisabled = false
}) => {
    const isSingle = selectionMode === 'single';
    const isVertical = layoutDirection === 'vertical';

    const handleToggle = (value) => {
        const alreadySelected = selectedValues.includes(value);
        if (isSingle) {
            if (alreadySelected && selectedValues.length === 1) {
                onSelectionChange([]);
                return;
            }
            onSelectionChange([value]);
            return;
        }
        const next = alreadySelected
            ? selectedValues.filter((item) => item !== value)
            : [...selectedValues, value];
        onSelectionChange(next);
    };

    const getButtonStyle = (active) => {
        return active
            ? getTagColorVariables(selectedColor)
            : getTagColorVariables('#eee');
    };

    const getChipClassNames = (active, disabled) => {
        return [
            'ms-filter-button-list-item',
            active ? '_is-active' : undefined,
            disabled ? '_is-disabled' : '_pointer'
        ].filter(Boolean);
    };

    const handleKeyToggle = (event, id, disabled) => {
        if (disabled) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle(id);
        }
    };

    const listStyle = layoutMaxHeight
        ? { maxHeight: layoutMaxHeight, overflowY: 'auto' }
        : undefined;

    return (
        <FlexBox column gap="xs" className="ms-filter-chip-list _padding-sm">
            <FilterTitle
                filterLabel={filterLabel}
                filterIcon={filterIcon}
                filterNameStyle={filterNameStyle}
                className="ms-filter-chip-list-title"
                titleDisabled={titleDisabled}
                items={items}
                onSelectionChange={onSelectionChange}
                showSelectAllOptions
                selectionMode={selectionMode}
            />
            <FlexBox
                component="ul"
                gap="xs"
                wrap={!isVertical}
                column={isVertical}
                className="ms-filter-chip-list-items"
                style={listStyle}
            >
                {items.map(({ id, label, disabled }) => {
                    const active = selectedValues.includes(id);
                    const buttonStyle = {
                        display: 'inline-flex',
                        alignSelf: 'flex-start',
                        ...getButtonStyle(active)
                    };
                    return (
                        <Text
                            key={id}
                            component="li"
                            fontSize="sm"
                            role={isSingle ? 'radio' : 'checkbox'}
                            aria-checked={active}
                            tabIndex={disabled ? -1 : 0}
                            onClick={() => !disabled && handleToggle(id)}
                            onKeyDown={(event) => handleKeyToggle(event, id, disabled)}
                            classNames={['ms-tag', ...getChipClassNames(active, disabled)]}
                            style={buttonStyle}
                        >
                            {label}
                        </Text>
                    );
                })}
            </FlexBox>
        </FlexBox>
    );
};

FilterChipList.propTypes = {
    filterLabel: PropTypes.string,
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
    onSelectionChange: PropTypes.func,
    layoutDirection: PropTypes.oneOf(['horizontal', 'vertical']),
    layoutMaxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    selectedColor: PropTypes.string,
    filterNameStyle: PropTypes.object,
    titleDisabled: PropTypes.bool
};

export default FilterChipList;


