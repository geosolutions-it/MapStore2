/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Select from 'react-select';
import { Glyphicon, MenuItem, DropdownButton, FormGroup, FormControl as FormControlRB } from 'react-bootstrap';
import localizedProps from '../misc/enhancers/localizedProps';
import Message from '../I18N/Message';

const ReactSelect = localizedProps(['placeholder', 'noResultsText'])(Select);
const FormControl = localizedProps('placeholder')(FormControlRB);

function MultiInput({
    label,
    value,
    config: {
        originalOptionValue,
        getSelectOptions = () => [],
        selectClearable = false
    } = {},
    onChange,
    disabled,
    ...props
}) {

    let castedValue = value;
    if (typeof value !== 'object') {
        castedValue = {
            type: "constant",
            value
        };
    }

    const selectOptions = getSelectOptions(props);

    const dropdownButtonOptions = [
        { labelId: "styleeditor.constantValue", value: "constant" },
        { labelId: "styleeditor.attributeValue", value: "attribute" }
    ];
    const dropdownButtonValue = typeof value === 'object' && value.type || 'constant';

    const onChangeHandler = (newValue) => {
        if (newValue.type === "constant") {
            onChange(newValue.value ?? 0);
        } else {
            onChange(newValue);
        }
    };

    const onConstantValueChangeHandler = (event) => {
        // match float number
        if (event.target.value.match(/^-?\d*(\.\d*)?$/)) {
            castedValue.value = event.target.value;
        }
        onChangeHandler(castedValue);
    };

    const onSelectValueChangeHandler = (option) => {
        if (option.value === originalOptionValue) {
            castedValue = { type: "original" };
            onChangeHandler({ type: "original" });
            return;
        }
        onChangeHandler({ type: "attribute", name: option.value });
    };

    const handleDropdownButtonSelect = (newValue) => {
        if (castedValue.type !== newValue) {
            castedValue = {
                type: newValue
            };
            onChangeHandler(castedValue);
        }
    };

    return (<div className="flex-center">
        {castedValue.type === 'constant' && <FormGroup>
            <FormControl
                type="text"
                disabled={disabled}
                value={castedValue.value}
                placeholder="styleeditor.placeholderInput"
                onChange={onConstantValueChangeHandler}
            />
        </FormGroup>}
        {castedValue.type !== 'constant' && <div className="flex-grow-1">
            <ReactSelect
                disabled={disabled}
                clearable={selectClearable}
                options={selectOptions}
                value={castedValue.type === 'original' && originalOptionValue || castedValue.name}
                onChange={onSelectValueChangeHandler}
            />
        </div>}
        <DropdownButton
            className="square-button-md no-border flex-center"
            noCaret
            pullRight
            disabled={disabled}
            title={<Glyphicon glyph="option-vertical" />}>
            {dropdownButtonOptions.map((option) => (
                <MenuItem
                    key={option.value}
                    active={dropdownButtonValue === option.value}
                    onClick={() => handleDropdownButtonSelect(option.value)}>
                    <Message msgId={option.labelId} />
                </MenuItem>
            ))}
        </DropdownButton>
    </div >);
}

export default MultiInput;
