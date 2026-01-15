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
import InfoPopover from '../../../../../widget/InfoPopover';
import { VALUES_FROM_OPTIONS, VALUES_FROM_TYPES } from '../constants';

/**
 * Values from selector component with help popover
 */
const ValuesFromSelector = ({
    value,
    onChange
}) => {
    const selectedOption = VALUES_FROM_OPTIONS.find(opt => opt.value === value);

    const handleChange = (option) => {
        onChange(option?.value || VALUES_FROM_TYPES.GROUPED);
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>
                Values from{' '}
                <InfoPopover
                    id="ms-filter-values-from-help"
                    placement="right"
                    trigger={['hover', 'focus']}
                    text={
                        <div className="ms-filter-type-help-popover">
                            {VALUES_FROM_OPTIONS.map(option => (
                                <div key={option.value} className="ms-filter-type-help-entry">
                                    <strong>{option.label}:</strong> {option.description}
                                </div>
                            ))}
                        </div>
                    }
                />
            </ControlLabel>
            <InputGroup>
                <Select
                    value={selectedOption}
                    options={VALUES_FROM_OPTIONS}
                    placeholder="Select source..."
                    onChange={handleChange}
                    clearable={false}
                />
            </InputGroup>
        </FormGroup>
    );
};

ValuesFromSelector.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default ValuesFromSelector;

