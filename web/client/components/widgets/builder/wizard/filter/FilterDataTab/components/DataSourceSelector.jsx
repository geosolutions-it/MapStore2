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
import Message from '../../../../../../I18N/Message';
import { useLocalizedOptions } from '../../hooks/useLocalizedOptions';

/**
 * Data source selector component
 */
const DataSourceSelector = ({
    value,
    onChange
}) => {
    const selectedOption = DATA_SOURCE_OPTIONS.find(opt => opt.value === value);
    const { localizedOptions, localizedSelectedOption } = useLocalizedOptions(
        DATA_SOURCE_OPTIONS,
        selectedOption
    );

    const handleChange = (option) => {
        onChange(option?.value || 'features');
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel><Message msgId="widgets.filterWidget.dataSource" /></ControlLabel>
            <InputGroup>
                <Select
                    value={localizedSelectedOption}
                    options={localizedOptions}
                    placeholder={<Message msgId="widgets.filterWidget.selectDataSourcePlaceHolder" />}
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

