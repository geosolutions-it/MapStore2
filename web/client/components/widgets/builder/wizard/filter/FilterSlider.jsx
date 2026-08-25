/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'react-bootstrap';
import Slider from '../../../../misc/Slider';
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

export const getTickIndexFromPosition = (position, itemCount) => {
    const percentage = Number.parseFloat(position);
    if (!Number.isFinite(percentage) || itemCount < 2) {
        return -1;
    }
    const boundedPercentage = Math.max(0, Math.min(100, percentage));
    return Math.round((boundedPercentage / 100) * (itemCount - 1));
};

const ORIGINAL_LEFT_KEY = 'msOriginalLeft';
const ORIGINAL_WIDTH_KEY = 'msOriginalWidth';

/**
 * Align noUiSlider tick markers to the physical pixel grid so fractional display
 * scaling does not make individual dashes render with different widths.
 */
const snapMarkersToPixelGrid = (container) => {
    const pips = container.querySelector('.noUi-pips');
    if (!pips) {
        return;
    }
    const scale = pips.getBoundingClientRect().width / pips.offsetWidth;
    if (!(scale > 0)) {
        return;
    }
    const pixelRatio = window.devicePixelRatio || 1;
    const deviceScale = scale * pixelRatio;
    const markers = Array.from(container.querySelectorAll('.noUi-marker'));
    markers.forEach((marker) => {
        if (marker.dataset[ORIGINAL_LEFT_KEY] === undefined) {
            marker.dataset[ORIGINAL_LEFT_KEY] = marker.style.left;
        }
        if (marker.dataset[ORIGINAL_WIDTH_KEY] === undefined) {
            marker.dataset[ORIGINAL_WIDTH_KEY] = marker.style.width;
        }
        marker.style.left = marker.dataset[ORIGINAL_LEFT_KEY];
        marker.style.width = marker.dataset[ORIGINAL_WIDTH_KEY];
    });
    const resolved = markers.map((marker) => {
        const style = window.getComputedStyle(marker);
        return { left: parseFloat(style.left), width: parseFloat(style.width) };
    });
    markers.forEach((marker, index) => {
        const { left, width } = resolved[index];
        if (Number.isFinite(left)) {
            marker.style.left = `${left}px`;
        }
        if (Number.isFinite(width) && width > 0) {
            marker.style.width = `${Math.max(1, Math.round(width * deviceScale)) / deviceScale}px`;
        }
    });
    for (let pass = 0; pass < 3; pass++) {
        const errors = markers.map((marker) => {
            const { left } = marker.getBoundingClientRect();
            return Math.round(left * pixelRatio) / pixelRatio - left;
        });
        let corrected = false;
        markers.forEach((marker, index) => {
            const current = parseFloat(marker.style.left);
            if (!Number.isFinite(current) || Math.abs(errors[index]) <= 0.01) {
                return;
            }
            marker.style.left = `${current + errors[index] / scale}px`;
            corrected = true;
        });
        if (!corrected) {
            break;
        }
    }
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
    const selectedDisplayValue = selectedItem ? String(selectedItem.label) : '';

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
    const sliderKey = useMemo(() => JSON.stringify({
        items: normalizedItems.map(({ id, label }) => [id, label ?? '']),
        tickValues: requestedTickValues,
        tickLabels: parseList(tickLabels),
        showTicks
    }), [normalizedItems, requestedTickValues, tickLabels, showTicks]);

    const sliderRef = useRef();

    useEffect(() => {
        const container = sliderRef.current;
        if (!showTicks || !container) {
            return () => {};
        }
        const snap = () => snapMarkersToPixelGrid(container);
        snap();
        if (typeof ResizeObserver === 'undefined') {
            return () => {};
        }
        const observer = new ResizeObserver(snap);
        observer.observe(container);
        return () => observer.disconnect();
    }, [showTicks, sliderKey]);

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
    const handleTickClick = (event) => {
        const tickElement = event.target.closest?.('.noUi-marker, .noUi-value');
        const pipsElement = event.target.closest?.('.noUi-pips');
        if (!pipsElement || !event.currentTarget.contains(pipsElement)) {
            return;
        }
        const sliderBase = event.currentTarget.querySelector('.noUi-base');
        const sliderBounds = sliderBase?.getBoundingClientRect();
        const position = tickElement?.style.left || (sliderBounds?.width
            ? `${((event.clientX - sliderBounds.left) / sliderBounds.width) * 100}%`
            : undefined);
        const index = getTickIndexFromPosition(position, normalizedItems.length);
        const nextItem = normalizedItems[index];
        if (nextItem) {
            onSelectionChange([nextItem.id]);
        }
    };

    return (
        <FormGroup className={`ms-filter-slider${noSelectionClass}${showTicksClass}`}>
            <div className="ms-filter-slider-items" style={containerStyle}>
                {showSelectedValue && (
                    <div className="ms-filter-slider-selected-value">
                        {hasExplicitSelection
                            ? selectedDisplayValue
                            : <Message msgId="widgets.filterWidget.sliderNotSelected" />}
                    </div>
                )}
                <div className="mapstore-slider ms-filter-slider-control" style={sliderStyle} ref={sliderRef} onClick={handleTickClick}>
                    <Slider
                        key={sliderKey}
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
