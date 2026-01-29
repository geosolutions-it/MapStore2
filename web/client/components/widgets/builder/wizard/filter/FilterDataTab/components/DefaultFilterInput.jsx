/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, InputGroup, Glyphicon, Button } from 'react-bootstrap';
import InfoPopover from '../../../../../widget/InfoPopover';
import Message from '../../../../../../I18N/Message';
import { isFilterValid } from '../../../../../../../utils/FilterUtils';

/**
 * Default Filter input component
 * Allows defining a default filter applied when nothing is selected.
 */
const DefaultFilterInput = ({
    defaultFilter,
    onDefineFilter
}) => {
    const handleFilterIconClick = () => {
        if (onDefineFilter) {
            onDefineFilter();
        }
    };

    return (
        <FormGroup className="form-group-flex">
            <ControlLabel>
                <Message msgId="widgets.filterWidget.defaultFilter" />&nbsp;
                <InfoPopover
                    id="ms-filter-default-filter-help"
                    placement="right"
                    trigger={['hover', 'focus']}
                    text={<Message msgId="widgets.filterWidget.defaultFilterInfo" />}
                />
            </ControlLabel>
            <InputGroup>
                <InputGroup.Button>
                    <Button
                        bsStyle={defaultFilter && isFilterValid(defaultFilter) ? 'success' : 'primary'}
                        onClick={handleFilterIconClick}
                    >
                        <Glyphicon glyph="filter" />
                    </Button>
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
    );
};

DefaultFilterInput.propTypes = {
    defaultFilter: PropTypes.string,
    onDefineFilter: PropTypes.func
};

export default DefaultFilterInput;
