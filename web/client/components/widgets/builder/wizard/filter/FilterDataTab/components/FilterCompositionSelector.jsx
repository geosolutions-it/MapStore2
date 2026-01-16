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
import { FILTER_COMPOSITION_OPTIONS, FILTER_COMPOSITION_TYPES } from '../constants';
import Message from '../../../../../../I18N/Message';
import { useLocalizedOptions } from '../../hooks/useLocalizedOptions';

/**
 * Filter composition selector component
 */
const FilterCompositionSelector = ({
    value,
    onChange
}) => {
    const selectedOption = FILTER_COMPOSITION_OPTIONS.find(opt => opt.value === value);
    const { localizedOptions, localizedSelectedOption } = useLocalizedOptions(
        FILTER_COMPOSITION_OPTIONS,
        selectedOption
    );

    const handleChange = (option) => {
        onChange(option?.value || FILTER_COMPOSITION_TYPES.AND);
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId="widgets.filterWidget.filterComposition" /></ControlLabel>
            <InputGroup>
                <Select
                    value={localizedSelectedOption}
                    options={localizedOptions}
                    placeholder="Select composition..."
                    onChange={handleChange}
                    clearable={false}
                />
            </InputGroup>
        </FormGroup>
    );
};

FilterCompositionSelector.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

export default FilterCompositionSelector;

