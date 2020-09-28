/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Glyphicon, Button as ButtonRB } from 'react-bootstrap';
import isNaN from 'lodash/isNaN';
import Select from 'react-select';
import Popover from './Popover';
import PropertyField from './PropertyField';
import tooltip from '../misc/enhancers/tooltip';
import localizedProps from '../misc/enhancers/localizedProps';

const ReactSelectCreatable = localizedProps(['placeholder', 'noResultsText'])(Select.Creatable);

const Button = tooltip(ButtonRB);

function ScaleFieldRenderer({ label, currentZoom }) {
    return <span>{label}{currentZoom && <>&nbsp;<Glyphicon glyph="arrow-left"/></>}</span>;
}

function ScaleInput({
    label,
    value,
    options,
    isValidNewOption,
    onChange
}) {
    return (
        <PropertyField
            label={label}>
            <ReactSelectCreatable
                placeholder="styleeditor.selectScale"
                noResultsText="styleeditor.noResultScales"
                value={value}
                options={options}
                optionRenderer={ScaleFieldRenderer}
                valueRenderer={ScaleFieldRenderer}
                isValidNewOption={(option) => {
                    if (option.label) {
                        const newValue = parseFloat(option.label);
                        return !isNaN(newValue) && isValidNewOption(newValue);
                    }
                    return false;
                }}
                onChange={(option) => {
                    const newValue = option?.value && parseFloat(option.value);
                    onChange(isNaN(newValue) ? undefined : newValue);
                }}
            />
        </PropertyField>
    );
}

function ScaleDenominator({
    value,
    zoom,
    scales: propScales = [],
    onChange
}) {

    function updateScales(scales, newValue) {
        const scalesValues = scales.map(scale => scale.value);
        const isMissing = newValue && scalesValues.indexOf(newValue) === -1;
        return isMissing
            ? [ { value: newValue }, ...scales].sort((a, b) => a.value > b.value ? -1 : 1)
            : scales;
    }

    function initScales(scales) {
        const scalesWithZooms = scales.map((scale, idx) => ({
            value: scale,
            zoom: idx
        }));
        const valueScale = [value.min, value.max].filter((scale) => scale !== undefined);
        if (valueScale.length === 0) {
            return scalesWithZooms;
        }
        return valueScale.reduce(updateScales, scalesWithZooms);
    }

    const [scales, setScales] = useState(initScales(propScales));

    return (
        <div className="ms-style-rule-scale">
            <ScaleInput
                label="styleeditor.maxScaleDenominator"
                value={value.max}
                options={scales.map((scale) => ({
                    value: scale.value,
                    label: '1 : ' + scale.value,
                    currentZoom: zoom !== undefined && zoom === scale.zoom,
                    disabled: value.min && scale.value <= value.min
                }))}
                isValidNewOption={(newValue) => {
                    return newValue >= value.min;
                }}
                onChange={(maxValue) => {
                    onChange({
                        ...value,
                        max: maxValue
                    });
                    setScales(updateScales(scales, maxValue));
                }}/>
            <ScaleInput
                label="styleeditor.minScaleDenominator"
                value={value.min}
                options={scales.map((scale) => ({
                    value: scale.value,
                    label: '1 : ' + scale.value,
                    currentZoom: zoom !== undefined && zoom === scale.zoom,
                    disabled: value.max && scale.value >= value.max
                }))}
                isValidNewOption={(newValue) => {
                    return newValue <= value.max;
                }}
                onChange={(minValue) => {
                    onChange({
                        ...value,
                        min: minValue
                    });
                    setScales(updateScales(scales, minValue));
                }}/>
        </div>
    );
}

export function ScaleDenominatorPopover({
    value = {},
    scales = [],
    zoom,
    hide,
    onChange,
    placement = 'right'
}) {
    if (hide) {
        return null;
    }
    return (
        <Popover
            placement={placement}
            content={
                <ScaleDenominator
                    value={value}
                    zoom={zoom}
                    scales={scales}
                    onChange={(scaleDenominator) => onChange({ scaleDenominator })}
                />
            }>
            <Button
                className="square-button-md no-border"
                tooltipId="styleeditor.openScaleDenominator"
                active={value.min !== undefined || value.max !== undefined}>
                <Glyphicon
                    glyph="1-ruler"
                />
            </Button>
        </Popover>
    );
}

export default ScaleDenominator;
