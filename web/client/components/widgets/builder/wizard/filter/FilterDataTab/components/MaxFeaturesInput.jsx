/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, FormControl } from 'react-bootstrap';

/**
 * Max features input component
 */
const MaxFeaturesInput = ({
    value,
    onChange
}) => {
    const handleChange = (event) => {
        const nextValue = parseInt(event?.target?.value, 10);
        onChange(Number.isNaN(nextValue) ? undefined : nextValue);
    };

    const displayValue = value === '' ? '' : `${value}`;

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>Max features</ControlLabel>
            <InputGroup>
                <FormControl
                    type="number"
                    min={1}
                    placeholder="Enter max features..."
                    value={displayValue}
                    onChange={handleChange}
                />
            </InputGroup>
        </FormGroup>
    );
};

MaxFeaturesInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func.isRequired
};

export default MaxFeaturesInput;

