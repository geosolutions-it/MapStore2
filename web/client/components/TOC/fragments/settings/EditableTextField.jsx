/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ControlLabel, FormControl, FormGroup, Glyphicon, InputGroup } from 'react-bootstrap';

import Message from '../../../I18N/Message';

/**
 * Text field that requires an explicit confirmation before updating its value.
 */
const EditableTextField = ({
    dataQa,
    labelId,
    value = '',
    onChange = () => {},
    formatValue = (currentValue) => currentValue ?? '',
    parseValue = (currentValue) => currentValue
}) => {
    const formattedValue = formatValue(value);
    const [editing, setEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(formattedValue);

    useEffect(() => {
        if (!editing) {
            setCurrentValue(formattedValue);
        }
    }, [formattedValue, editing]);

    const confirm = () => {
        if (currentValue !== formattedValue) {
            onChange(parseValue(currentValue));
        }
        setEditing(false);
    };

    return (
        <FormGroup>
            <ControlLabel><Message msgId={labelId} /></ControlLabel>
            <InputGroup>
                <FormControl
                    data-qa={dataQa}
                    value={currentValue}
                    type="text"
                    disabled={!editing}
                    onChange={(event) => setCurrentValue(event.target.value)} />
                <InputGroup.Addon
                    className="btn"
                    data-qa={`${dataQa}-edit`}
                    onClick={() => editing ? confirm() : setEditing(true)}>
                    <Glyphicon glyph={editing ? 'ok' : 'pencil'} />
                </InputGroup.Addon>
            </InputGroup>
        </FormGroup>
    );
};

EditableTextField.propTypes = {
    dataQa: PropTypes.string.isRequired,
    labelId: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
    formatValue: PropTypes.func,
    parseValue: PropTypes.func
};

export default EditableTextField;
