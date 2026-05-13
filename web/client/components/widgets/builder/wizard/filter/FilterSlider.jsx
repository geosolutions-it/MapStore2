/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import Slider from 'react-nouislider';
import Message from '../../../../I18N/Message';

const parseList = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'string') {
        if (!value.trim()) {
            return [];
        }
        return value
            .split(',')
            .map(item => item.trim());
    }
    return [];
};

const getTickAngle = (value) => {
    if (value === undefined || value === null || value === '') {
        return -90;
    }
    const angle = Number(value);
    if (!Number.isFinite(angle)) {
        return -90;
    }
    return Math.max(-90, Math.min(90, angle));
};

const FilterSlider = ({
    items = [],
    selectedValues = [],
    onSelectionChange = () => {},
    layoutMaxHeight,
    showSelectedValue = false,
    showTicks = false,
    tickValues = [],
    tickLabels = [],
    tickAngle
}) => {
    const normalizedItems = useMemo(() => items.filter(item => item && item.id !== undefined && item.id !== null), [items]);
    const normalizedSelectedValues = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
    const requestedTickValues = useMemo(() => parseList(tickValues), [tickValues]);
    const itemMatchIndex = normalizedItems.findIndex(item => String(item.id) === String(normalizedSelectedValues[0]));
    const hasExplicitSelection = normalizedSelectedValues.length > 0
        && normalizedSelectedValues[0] !== undefined
        && normalizedSelectedValues[0] !== null
        && itemMatchIndex >= 0;
    const sliderStartIndex = hasExplicitSelection ? itemMatchIndex : 0;
    const selectedItem = hasExplicitSelection ? normalizedItems[itemMatchIndex] : null;
    const selectedDisplayValue = selectedItem ? String(selectedItem.id) : '';

    const tickEntries = useMemo(() => {
        const labels = parseList(tickLabels);
        if (!requestedTickValues.length) {
            return normalizedItems.map((item, index) => ({
                index,
                label: item.label ?? item.id
            }));
        }
        return normalizedItems.map((item, index) => {
            const tickIndex = requestedTickValues.findIndex(value => String(item.id) === String(value));
            return {
                index,
                label: tickIndex >= 0
                    ? labels[tickIndex] ?? (item.label ?? item.id)
                    : ''
            };
        });
    }, [normalizedItems, requestedTickValues, tickLabels]);

    const pipValues = useMemo(() => {
        return tickEntries.map(entry => entry.index);
    }, [tickEntries]);

    const pipFormat = useMemo(() => ({
        to: (value) => {
            const index = Math.round(Number(value));
            const tickEntry = tickEntries.find(entry => entry.index === index);
            return tickEntry ? tickEntry.label : '';
        },
        from: (value) => value
    }), [tickEntries]);

    if (normalizedItems.length === 0) {
        return null;
    }

    const noSelectionClass = !hasExplicitSelection ? ' ms-filter-slider--no-selection' : '';
    const showTicksClass = showTicks ? ' ms-filter-slider--with-ticks' : '';
    const normalizedTickAngle = getTickAngle(tickAngle);
    const tickAnchor = normalizedTickAngle === 0
        ? { origin: 'center center', translateX: '-50%' }
        : normalizedTickAngle === 90
            ? { origin: 'left center', translateX: '5px', translateY: '-5px' }
            : normalizedTickAngle === -90
                ? { origin: 'right center', translateX: 'calc(-100% - 5px)', translateY: '-5px' }
                : normalizedTickAngle < 0
                    ? { origin: 'right center', translateX: '-100%' }
                    : { origin: 'left center', translateX: '0%' };
    const sliderControlHeight = typeof layoutMaxHeight === 'number' ? `${layoutMaxHeight}px` : layoutMaxHeight;
    const sliderStyle = showTicks
        ? {
            '--ms-filter-slider-tick-angle': `${normalizedTickAngle}deg`,
            '--ms-filter-slider-tick-origin': tickAnchor.origin,
            '--ms-filter-slider-tick-translate-x': tickAnchor.translateX,
            '--ms-filter-slider-tick-translate-y': tickAnchor.translateY ?? '-50%',
            ...(sliderControlHeight ? { '--ms-filter-slider-control-height': sliderControlHeight } : {})
        }
        : undefined;
    // In slider layout, layoutMaxHeight is intentionally treated as height.
    const containerStyle = layoutMaxHeight ? {
        height: layoutMaxHeight,
        maxHeight: layoutMaxHeight,
        overflowY: 'hidden'
    } : undefined;

    return (
        <FormGroup className={`ms-filter-slider${noSelectionClass}${showTicksClass}`}>
            <div className="ms-filter-slider-items" style={containerStyle}>
                {showSelectedValue && (
                    <div
                        className="ms-filter-slider-selected-value"
                        style={{
                            marginBottom: 8,
                            textAlign: 'right',
                            fontSize: 10,
                            fontWeight: 400
                        }}
                    >
                        {hasExplicitSelection
                            ? selectedDisplayValue
                            : <Message msgId="widgets.filterWidget.sliderNotSelected" />}
                    </div>
                )}
                <div className="mapstore-slider ms-filter-slider-control" style={sliderStyle}>
                    <Slider
                        start={[sliderStartIndex]}
                        range={{
                            min: 0,
                            max: Math.max(0, normalizedItems.length - 1)
                        }}
                        step={1}
                        pips={showTicks ? {
                            mode: 'values',
                            values: pipValues,
                            density: 100,
                            format: pipFormat
                        } : undefined}
                        onChange={(values) => {
                            const index = Math.round(Number(values?.[0]));
                            const nextItem = normalizedItems[index];
                            if (nextItem) {
                                onSelectionChange([nextItem.id]);
                            }
                        }}
                    />
                </div>
            </div>
        </FormGroup>
    );
};

FilterSlider.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
    })),
    selectedValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelectionChange: PropTypes.func,
    layoutMaxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    showSelectedValue: PropTypes.bool,
    showTicks: PropTypes.bool,
    tickValues: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    tickLabels: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    tickAngle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valueAttributeType: PropTypes.string,
    labelAttributeType: PropTypes.string
};

export default FilterSlider;
