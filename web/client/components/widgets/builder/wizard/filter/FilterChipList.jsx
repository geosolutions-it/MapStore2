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
import './FilterChipList.less';

const FilterChipList = ({
    items = [],
    selectionMode = 'multiple',
    selectedValues = [],
    onSelectionChange = () => {},
    layoutDirection = 'vertical',
    layoutMaxHeight
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

export default FilterChipList;


