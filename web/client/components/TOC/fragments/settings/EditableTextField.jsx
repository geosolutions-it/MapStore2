/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { upperFirst } from 'lodash';
import { ControlLabel, FormControl, FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Message from '../../../I18N/Message';
import tooltip from '../../../misc/enhancers/tooltip';

const EditButton = tooltip(InputGroup.Addon);

export const getTooltipMessageId = ({ field, editing, error }) => {
    if (error?.code === 'required' && error.field && error.field !== field) {
        return `layerProperties.sourceField.required${upperFirst(error.field)}`;
    }
    if (error?.code) {
        return `layerProperties.sourceField.${error.code}`;
    }
    return `layerProperties.sourceField.${editing ? 'confirm' : 'edit'}`;
};

/**
 * Controlled text field that requires an explicit confirmation before updating its value
 */
const EditableTextField = ({
    field,
    dataQa,
    labelId,
    value = '',
    editing = false,
    busy = false,
    error,
    onEdit = () => {},
    onChange = () => {},
    onConfirm = () => {}
}) => (
    <FormGroup validationState={error && !busy ? 'error' : null}>
        <ControlLabel><Message msgId={labelId} /></ControlLabel>
        <InputGroup>
            <FormControl
                data-qa={dataQa}
                value={value}
                type="text"
                disabled={!editing || busy}
                onChange={(event) => onChange(event.target.value)} />
            <EditButton
                className="btn"
                data-qa={`${dataQa}-edit`}
                keyProp={dataQa}
                tooltipId={busy ? undefined : getTooltipMessageId({ field, editing, error })}
                tooltipPosition="top"
                onClick={() => {
                    if (busy) {
                        return;
                    }
                    if (editing) {
                        onConfirm();
                        return;
                    }
                    onEdit();
                }}>
                {busy
                    ? <Spinner noFadeIn style={{ width: '18px', height: '18px' }} spinnerName="circle" />
                    : <Glyphicon glyph={editing ? 'ok' : 'pencil'} />}
            </EditButton>
        </InputGroup>
    </FormGroup>
);

EditableTextField.propTypes = {
    field: PropTypes.string,
    dataQa: PropTypes.string.isRequired,
    labelId: PropTypes.string.isRequired,
    value: PropTypes.any,
    editing: PropTypes.bool,
    busy: PropTypes.bool,
    error: PropTypes.object,
    onEdit: PropTypes.func,
    onChange: PropTypes.func,
    onConfirm: PropTypes.func
};

export default EditableTextField;
