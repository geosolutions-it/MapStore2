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
        return value
            .split(/[,\n;]+/)
            .map(item => item.trim())
            .filter(Boolean);
    }
    return [];
};

const FilterSlider = ({
    items = [],
    selectedValues = [],
    onSelectionChange = () => {},
    showSelectedValue = false,
    showTicks = false,
    tickValues = [],
    tickLabels = []
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
        return requestedTickValues
            .map((value, tickIndex) => {
                const index = normalizedItems.findIndex(item => String(item.id) === String(value));
                if (index < 0) {
                    return null;
                }
                return {
                    index,
                    label: labels[tickIndex] ?? (normalizedItems[index].label ?? normalizedItems[index].id)
                };
            })
            .filter(Boolean);
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

    return (
        <FormGroup className={`ms-filter-slider${noSelectionClass}`}>
            {showSelectedValue && (
                <div
                    className="ms-filter-slider-selected-value"
                    style={{
                        marginBottom: 8,
                        textAlign: 'right',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#666'
                    }}
                >
                    {hasExplicitSelection
                        ? selectedDisplayValue
                        : <Message msgId="widgets.filterWidget.sliderNotSelected" />}
                </div>
            )}
            <div className="mapstore-slider ms-filter-slider-control">
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
    showSelectedValue: PropTypes.bool,
    showTicks: PropTypes.bool,
    tickValues: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    tickLabels: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    valueAttributeType: PropTypes.string,
    labelAttributeType: PropTypes.string
};

export default FilterSlider;
