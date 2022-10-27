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
        initialOptionValue,
        getSelectOptions = () => [],
        selectClearable = false
    } = {},
    onChange,
    disabled,
    ...props
}) {

    const selectOptions = getSelectOptions(props);

    const dropdownButtonOptions = [
        { labelId: "styleeditor.constantValue", value: "constant" },
        { labelId: "styleeditor.attributeValue", value: "attribute" }
    ];
    const dropdownButtonValue = value?.type === 'constant' ? 'constant' : 'attribute';

    const onConstantValueChangeHandler = (event) => {
        onChange({
            ...value,
            value: event.target.value
        });
    };

    const onSelectValueChangeHandler = (option) => {
        if (option.value === initialOptionValue) {
            onChange({ type: "initial" });
            return;
        }
        onChange({ type: "attribute", name: option.value });
    };

    const handleDropdownButtonSelect = (newValue) => {
        if (value.type !== newValue) {
            onChange({
                type: newValue
            });
        }
    };

    return (<div className="flex-center">
        {value?.type === 'constant' && <FormGroup>
            <FormControl
                type="number"
                disabled={disabled}
                value={value?.value}
                placeholder="styleeditor.placeholderInput"
                onChange={onConstantValueChangeHandler}
            />
        </FormGroup>}
        {value?.type !== 'constant' && <div className="flex-grow-1">
            <ReactSelect
                disabled={disabled}
                clearable={selectClearable}
                options={selectOptions}
                value={value?.type === 'initial' ? initialOptionValue : value?.name}
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
