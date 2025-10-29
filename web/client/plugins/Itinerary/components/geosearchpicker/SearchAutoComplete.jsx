/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState } from 'react';
import PropTypes from "prop-types";
import { Combobox } from "react-widgets";
import get from "lodash/get";
import { getMessageById } from '../../../../utils/LocaleUtils';
import { generateTemplateString } from '../../../../utils/TemplateUtils';

/**
 * SearchAutoComplete component
 * @param {Object} props - The component props
 * @param {string} props.value - The input value
 * @param {Function} props.onChange - The function to handle input change
 * @param {Function} props.onSearch - The function to handle search
 * @param {Array} props.results - The search results
 */
const SearchAutoComplete = ({
    value,
    onChange,
    onSearch,
    displayName,
    results = [],
    loading = false,
    placeholder,
    onSelect
}, {messages}) => {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (newValue) => {
        setInputValue(newValue);
        onChange(newValue);
        onSearch(newValue);
    };

    const getDisplayName = (result) => {
        return get(result, displayName, generateTemplateString(displayName || "")(result));
    };

    const handleSelect = (result) => {
        const _displayName = getDisplayName(result);
        setInputValue(_displayName);
        onChange(_displayName);
        if (onSelect && result) {
            onSelect(result);
        }
    };

    // Transform results to format expected by Combobox
    const options = results.map(result => {
        const _value = getDisplayName(result);
        return {
            value: _value,
            label: _value,
            original: result
        };
    });

    return (
        <div style={{ width: '100%' }}>
            <Combobox
                value={inputValue}
                data={options}
                textField="label"
                valueField="value"
                placeholder={placeholder || getMessageById(messages, "search.searchByLocationName")}
                busy={loading}
                filter={false}
                onChange={handleChange}
                onSelect={(item) => handleSelect(item?.original || item)}
                messages={{
                    emptyList: loading
                        ? getMessageById(messages, "search.searching")
                        : getMessageById(messages, "search.noResultsFound")
                }}
                style={{ width: '100%' }}
            />
        </div>
    );
};

SearchAutoComplete.contextTypes = {
    messages: PropTypes.object
};

export default SearchAutoComplete;
