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
import { DATA_SOURCE_OPTIONS } from '../constants';

/**
 * Data source selector component
 */
const DataSourceSelector = ({
    value,
    onChange
}) => {
    const selectedOption = DATA_SOURCE_OPTIONS.find(opt => opt.value === value);

    const handleChange = (option) => {
        onChange(option?.value || 'features');
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>Data source</ControlLabel>
            <InputGroup>
                <Select
                    value={selectedOption}
                    options={DATA_SOURCE_OPTIONS}
                    placeholder="Select data source..."
                    onChange={handleChange}
                    clearable={false}
                />
            </InputGroup>
        </FormGroup>
    );
};

DataSourceSelector.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default DataSourceSelector;

