/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useMemo, useEffect} from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, OverlayTrigger, Tooltip, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { USER_DEFINED_TYPE_OPTIONS, USER_DEFINED_TYPES } from '../constants';
import { HTML, Message } from '../../../../../../I18N/I18N';
import { useLocalizedOptions } from '../../hooks/useLocalizedOptions';

/**
 * User defined type selector component
 */
const UserDefinedTypeSelector = ({
    value,
    onChange,
    selectedLayer
}) => {
    const selectedOption = USER_DEFINED_TYPE_OPTIONS.find(opt => opt.value === value);
    const { localizedOptions, localizedSelectedOption } = useLocalizedOptions(
        USER_DEFINED_TYPE_OPTIONS,
        selectedOption
    );
    const isWfsLayer = useMemo(() => selectedLayer?.type === "wfs", [selectedLayer]);

    const selectOptions = useMemo(() => {
        return localizedOptions.filter(opt => isWfsLayer ? opt.value !== USER_DEFINED_TYPES.STYLE_LIST : true);
    }, [USER_DEFINED_TYPE_OPTIONS, value, isWfsLayer]);


    useEffect(() => {
        if (isWfsLayer) {
            onChange(USER_DEFINED_TYPES.FILTER_LIST);
        }
    }, [isWfsLayer, onChange]);
    const handleChange = (option) => {
        onChange(option?.value || USER_DEFINED_TYPES.FILTER_LIST);
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>
                <Message msgId="widgets.filterWidget.type" />
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="right"
                    overlay={
                        <Tooltip id="user-defined-type-tooltip">
                            <HTML msgId="widgets.filterWidget.typeTooltip" />
                        </Tooltip>
                    }
                >
                    <Glyphicon glyph="info-sign" style={{ marginLeft: 4, cursor: 'help' }} />
                </OverlayTrigger>
            </ControlLabel>
            <InputGroup>
                <Select
                    value={localizedSelectedOption}
                    options={selectOptions}
                    onChange={handleChange}
                    clearable={false}
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

