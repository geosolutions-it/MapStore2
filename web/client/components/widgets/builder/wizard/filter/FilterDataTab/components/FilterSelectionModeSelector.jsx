/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, Glyphicon, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import InfoPopover from '../../../../../widget/InfoPopover';
import { FILTER_SELECTION_MODE_OPTIONS, FILTER_SELECTION_MODES } from '../constants';
import { HTML, Message } from '../../../../../../I18N/I18N';
import { useLocalizedOptions } from '../../hooks/useLocalizedOptions';

/**
 * No selection mode selector component (No filter / Exclude / Custom)
 * When Custom is selected, shows a filter button inline beside the dropdown.
 */
const FilterSelectionModeSelector = ({
    value,
    onChange,
    defaultFilter,
    onDefineFilter,
    isFilterValid
}) => {
    const selectedOption = FILTER_SELECTION_MODE_OPTIONS.find(opt => opt.value === value);
    const { localizedOptions, localizedSelectedOption } = useLocalizedOptions(
        FILTER_SELECTION_MODE_OPTIONS,
        selectedOption
    );

    const handleChange = (option) => {
        onChange(option?.value || FILTER_SELECTION_MODES.NO_FILTER);
    };

    const showCustomFilterWarning = value === FILTER_SELECTION_MODES.CUSTOM
        && !(defaultFilter && isFilterValid && isFilterValid(defaultFilter));

    return (
        <>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.filterWidget.noSelectionMode" />&nbsp;
                    <InfoPopover
                        id="ms-filter-no-selection-mode-help"
                        placement="right"
                        trigger={['hover', 'focus']}
                        text={
                            <div className="ms-filter-type-help-popover">
                                <HTML msgId="widgets.filterWidget.noSelectionModeTooltip" />
                            </div>
                        }
                    />
                </ControlLabel>
                <InputGroup>
                    <Select
                        value={localizedSelectedOption}
                        options={localizedOptions}
                        placeholder="Select mode..."
                        onChange={handleChange}
                        clearable={false}
                    />
                    {value === FILTER_SELECTION_MODES.CUSTOM && onDefineFilter && (
                        <InputGroup.Button>
                            <Button
                                bsStyle={defaultFilter && isFilterValid && isFilterValid(defaultFilter) ? 'success' : 'primary'}
                                onClick={onDefineFilter}
                            >
                                <Glyphicon glyph="filter" />
                            </Button>
                        </InputGroup.Button>
                    )}
                </InputGroup>
            </FormGroup>
            {showCustomFilterWarning && (
                <Alert bsStyle="warning" className="ms-filter-custom-filter-warning">
                    <Message msgId="widgets.filterWidget.customFilterRequiredWarning" />
                </Alert>
            )}
        </>
    );
};

FilterSelectionModeSelector.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    defaultFilter: PropTypes.object,
    onDefineFilter: PropTypes.func,
    isFilterValid: PropTypes.func
};

export default FilterSelectionModeSelector;
