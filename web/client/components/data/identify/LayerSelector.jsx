/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import localizedProps from '../../misc/enhancers/localizedProps';
const SelectLocalized = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(Select);

const LayerSelector = ({ responses, index, loaded, setIndex, missingResponses, emptyResponses, validator, format, showAllResponses = false}) => {
    const selectProps = {clearable: false, isSearchable: true};
    const responseValidator = validator(format);
    const options = responses.reduce((validOptions, response, idx) => {
        const value = response?.layerMetadata?.title || response?.layer?.name;
        const valid = !responseValidator
            || !!responseValidator.getValidResponses([response]).length;
        // Keep the original response index while excluding invalid responses
        // from the select instead of rendering hidden options.
        if (showAllResponses || valid) {
            validOptions.push({
                label: value,
                value,
                idx
            });
        }
        return validOptions;
    }, []);
    const selectedValue = loaded
        ? options.find(option => option.idx === index)?.value || ""
        : "";

    const onChange = (event) => {
        const idx = event?.idx || 0;
        setIndex(idx);
    };
    return (
        <div id="identify-layer-select" style={{flex: "1 1 0%", padding: "0px 4px"}}>
            <SelectLocalized
                {...selectProps}
                onChange={onChange}
                value={selectedValue}
                options={options}
                disabled={missingResponses !== 0 || responses.length === 0 || emptyResponses}
                noResultsText="identifyLayerSelectNoResult"
            />
        </div>
    );
};

LayerSelector.defaultProps = {
    responses: [],
    index: 0,
    loaded: false,
    setIndex: () => {},
    missingResponses: 0,
    emptyResponses: false,
    validator: () => {},
    format: ""
};

LayerSelector.propTypes = {
    responses: PropTypes.array,
    setIndex: PropTypes.func,
    index: PropTypes.number,
    emptyResponses: PropTypes.bool,
    validator: PropTypes.func,
    format: PropTypes.string
};

export default LayerSelector;
