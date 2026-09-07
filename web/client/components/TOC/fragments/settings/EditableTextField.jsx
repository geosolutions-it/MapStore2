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
import Spinner from 'react-spinkit';

import Message from '../../../I18N/Message';

/**
 * Text field that requires an explicit confirmation before updating its value.
 */
const EditableTextField = ({
    dataQa,
    labelId,
    value = '',
    onChange = () => {},
    onValidate,
    required = false,
    formatValue = (currentValue) => currentValue ?? '',
    parseValue = (currentValue) => currentValue
}) => {
    const formattedValue = formatValue(value);
    const [editing, setEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(formattedValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!editing) {
            setCurrentValue(formattedValue);
        }
    }, [formattedValue, editing]);

    const confirm = () => {
        const parsedValue = parseValue(currentValue);
        const isEmpty = Array.isArray(parsedValue)
            ? !parsedValue.length || parsedValue.some((entry) => !entry?.trim())
            : !parsedValue?.trim?.();
        if (required && isEmpty) {
            setError(true);
            return;
        }
        if (currentValue === formattedValue) {
            setEditing(false);
            setError(false);
            return;
        }
        setLoading(true);
        setError(false);
        Promise.resolve()
            .then(() => onValidate?.(parsedValue))
            .then((validationResult) => {
                onChange(parsedValue, validationResult);
                setEditing(false);
            })
            .catch(() => setError(true))
            .then(() => setLoading(false));
    };

    return (
        <FormGroup validationState={error ? 'error' : null}>
            <ControlLabel><Message msgId={labelId} /></ControlLabel>
            <InputGroup>
                <FormControl
                    data-qa={dataQa}
                    value={currentValue}
                    type="text"
                    disabled={!editing || loading}
                    onChange={(event) => setCurrentValue(event.target.value)} />
                <InputGroup.Addon
                    className="btn"
                    data-qa={`${dataQa}-edit`}
                    onClick={() => {
                        if (!loading) {
                            if (editing) {
                                confirm();
                            } else {
                                setError(false);
                                setEditing(true);
                            }
                        }
                    }}>
                    {loading
                        ? <Spinner noFadeIn style={{width: '18px', height: '18px'}} spinnerName="circle"/>
                        : <Glyphicon glyph={editing ? 'ok' : 'pencil'} />}
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
    onValidate: PropTypes.func,
    required: PropTypes.bool,
    formatValue: PropTypes.func,
    parseValue: PropTypes.func
};

export default EditableTextField;
