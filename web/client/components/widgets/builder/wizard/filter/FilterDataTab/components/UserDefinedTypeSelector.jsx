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
import { USER_DEFINED_TYPE_OPTIONS, USER_DEFINED_TYPES } from '../constants';

/**
 * User defined type selector component
 */
const UserDefinedTypeSelector = ({
    value,
    onChange
}) => {
    const selectedOption = USER_DEFINED_TYPE_OPTIONS.find(opt => opt.value === value);

    const handleChange = (option) => {
        onChange(option?.value || USER_DEFINED_TYPES.FILTER_LIST);
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>Type</ControlLabel>
            <InputGroup>
                <Select
                    value={selectedOption}
                    options={USER_DEFINED_TYPE_OPTIONS}
                    placeholder="Select type..."
                    onChange={handleChange}
                    clearable={false}
                    disabled
                />
            </InputGroup>
        </FormGroup>
    );
};

UserDefinedTypeSelector.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default UserDefinedTypeSelector;

