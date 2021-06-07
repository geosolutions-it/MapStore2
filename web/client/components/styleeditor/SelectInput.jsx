/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { Glyphicon } from 'react-bootstrap';
import castArray from 'lodash/castArray';
import Message from '../I18N/Message';
import Select from 'react-select';
import localizedProps from '../misc/enhancers/localizedProps';

const ReactSelect = localizedProps(['placeholder', 'noResultsText'])(Select);
const ReactSelectCreatable = localizedProps(['placeholder', 'noResultsText'])(Select.Creatable);

function SelectInput({
    label,
    value,
    config: {
        getOptions = () => [],
        selectProps = {}
    } = {},
    onChange,
    disabled,
    ...props
}) {

    const {
        creatable,
        clearable = false,
        multi
    } = selectProps;

    function updateOptions(options = [], newValue) {
        const optionsValues = options.map(option => option.value);
        const isMissing = newValue?.value && optionsValues.indexOf(newValue.value) === -1;
        return isMissing
            ? [ newValue, ...options]
            : options;
    }

    function initOptions(options) {
        if (!value) {
            return options;
        }
        // we get an array when using some properties
        // eg. font-family
        const values = castArray(value);
        return values
            .map(entry => ({ value: entry, label: entry }))
            .reduce(updateOptions, options);
    }

    const options = getOptions(props);

    const [newOptions, setNewOptions] = useState(initOptions(options));
    useEffect(() => {
        setNewOptions(initOptions(options));
        // we should compare the previous and new options inside the dependencies
        // we could try the stringify for now because we have a usually small and constant array
        // this is to avoid infinite loop inside the style editor
    }, [JSON.stringify(options)]);

    const SelectComponent = creatable
        ? ReactSelectCreatable
        : ReactSelect;

    return (
        <SelectComponent
            disabled={disabled}
            clearable={clearable}
            placeholder="styleeditor.selectPlaceholder"
            noResultsText="styleeditor.noResultsSelectInput"
            {...selectProps}
            options={newOptions.map((option) => ({
                ...option,
                label: option.labelId
                    ? <><Message msgId={option.labelId}/>
                        {option.glyphId && <Glyphicon style={{ marginLeft: 10 }} glyph={option.glyphId}/>}
                    </>
                    : option.label
            }))}
            value={value}
            onChange={option => {
                if (multi) {
                    return onChange(option.length > 0
                        ? option.map((entry) => entry.value)
                        : undefined);
                }
                setNewOptions(updateOptions(newOptions, option));
                return onChange(option.value);
            }}
        />
    );
}

export default SelectInput;
