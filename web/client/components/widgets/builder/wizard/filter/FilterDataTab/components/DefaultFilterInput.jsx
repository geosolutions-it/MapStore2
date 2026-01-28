/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, Glyphicon, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import Message from '../../../../../../I18N/Message';
import SwitchButton from '../../../../../../misc/switch/SwitchButton';
import { isFilterValid } from '../../../../../../../utils/FilterUtils';

/**
 * Default Filter input component
 * Shows a switch to enable/disable default filter, and when enabled, shows a text input for CQL
 */
const DefaultFilterInput = ({
    defaultFilterEnabled,
    defaultFilter,
    onDefaultFilterEnabledChange,
    onDefineFilter
}) => {
    const handleFilterIconClick = () => {
        if (onDefineFilter) {
            onDefineFilter();
        }
    };

    return (
        <>
            <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.filterWidget.enableDefaultFilter" />
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="right"
                        overlay={
                            <Tooltip id="default-filter-tooltip">
                                <Message msgId="widgets.filterWidget.defaultFilterTooltip" />
                            </Tooltip>
                        }
                    >
                        <Glyphicon glyph="info-sign" style={{ marginLeft: 4, cursor: 'help' }} />
                    </OverlayTrigger>
                </ControlLabel>
                <InputGroup>
                    <SwitchButton
                        checked={defaultFilterEnabled}
                        onChange={onDefaultFilterEnabledChange}
                    />
                    {defaultFilterEnabled && <InputGroup.Button>
                        <Button
                            bsStyle={defaultFilter && isFilterValid(defaultFilter) ? 'success' : 'primary'}
                            onClick={handleFilterIconClick}
                        >
                            <Glyphicon glyph="filter" />
                        </Button>
                    </InputGroup.Button>}
                </InputGroup>
            </FormGroup>

        </>
    );
};

DefaultFilterInput.propTypes = {
    defaultFilterEnabled: PropTypes.bool,
    defaultFilter: PropTypes.string,
    onDefaultFilterEnabledChange: PropTypes.func.isRequired,
    onDefaultFilterChange: PropTypes.func.isRequired,
    onDefineFilter: PropTypes.func
};

export default DefaultFilterInput;
