/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Select from 'react-select';
import { Glyphicon, MenuItem, DropdownButton, FormGroup } from 'react-bootstrap';
import localizedProps from '../misc/enhancers/localizedProps';
import Message from '../I18N/Message';
import DebouncedFormControl from '../misc/DebouncedFormControl';

const ReactSelect = localizedProps('options', 'label', "object")(localizedProps(['placeholder', 'noResultsText'])(Select));

function MultiInput({
    label,
    value,
    config: {
        initialOptionValue,
        getSelectOptions = () => [],
        selectClearable = false,
        fallbackValue
    } = {},
    onChange,
    disabled,
    ...props
}) {

    const selectOptions = getSelectOptions(props)
        .map((option) => ({ ...option, label: option.labelId ? <Message msgId={option.labelId} /> : option.label }));

    const dropdownButtonOptions = [
        { labelId: "styleeditor.constantValue", value: "constant" },
        { labelId: "styleeditor.attributeValue", value: "attribute" }
    ];
    const dropdownButtonValue = value?.type === 'constant' ? 'constant' : 'attribute';

    const onConstantValueChangeHandler = (eventValue) => {
        onChange({
            ...value,
            value: eventValue
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
            onChange(newValue === 'attribute' && initialOptionValue
                ? { type: 'initial' }
                : { type: newValue }
            );
        }
    };

    return (<div className="ms-style-editor-multi-input">
        {value?.type === 'constant' && <FormGroup>
            <DebouncedFormControl
                type="number"
                disabled={disabled}
                fallbackValue={fallbackValue}
                value={value?.value}
                placeholder="styleeditor.placeholderInput"
                onChange={onConstantValueChangeHandler}
            />
        </FormGroup>}
        {value?.type !== 'constant' && <FormGroup>
            <ReactSelect
                disabled={disabled}
                clearable={selectClearable}
                options={selectOptions}
                value={value?.type === 'initial' ? initialOptionValue : value?.name}
                onChange={onSelectValueChangeHandler}
            />
        </FormGroup>}
        <DropdownButton
            className="square-button-md no-border"
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
