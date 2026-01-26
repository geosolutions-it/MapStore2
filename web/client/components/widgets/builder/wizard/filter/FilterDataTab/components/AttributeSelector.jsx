/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import Select from 'react-select';

// Inline utility function
const getAttributeNoResultsText = (hasLayerSelection, error = null) => {
    if (!hasLayerSelection) {
        return 'Select a layer first';
    }
    return error || 'No attributes available';
};

/**
 * Reusable attribute selector component with loading and error states
 */
const AttributeSelector = ({
    label,
    value,
    options = [],
    onChange,
    placeholder = 'Select attribute...',
    isLoading = false,
    hasLayerSelection = false,
    error = null,
    disabled = false,
    clearable = false
}) => {
    const selectedOption = value
        ? options.find(opt => opt.value === value) || null
        : null;

    const noResultsText = getAttributeNoResultsText(hasLayerSelection, error);
    const isDisabled = disabled || (!options.length && !isLoading);

    return (
        <FormGroup className="form-group-flex">
            {label && <ControlLabel>{label}</ControlLabel>}
            <InputGroup>
                <Select
                    value={selectedOption}
                    options={options}
                    placeholder={placeholder}
                    onChange={onChange}
                    disabled={isDisabled}
                    isLoading={isLoading}
                    noResultsText={noResultsText}
                    clearable={clearable}
                />
            </InputGroup>
        </FormGroup>
    );
};

AttributeSelector.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string
    })),
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    isLoading: PropTypes.bool,
    hasLayerSelection: PropTypes.bool,
    error: PropTypes.string,
    disabled: PropTypes.bool,
    clearable: PropTypes.bool
};

export default AttributeSelector;

