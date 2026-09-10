/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ControlLabel, FormControl, FormGroup, Glyphicon, InputGroup, Tooltip } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Message from '../../../I18N/Message';
import OverlayTrigger from '../../../misc/OverlayTrigger';

const REQUIRED_ERROR = 'required';
const VALIDATION_ERROR = 'validation';
const LAYER_LOAD_ERROR = 'layer-load';

/**
 * Text field that requires an explicit confirmation before updating its value.
 */
const EditableTextField = ({
    dataQa,
    labelId,
    value = '',
    onChange = () => {},
    onDraftChange = () => {},
    onValidate,
    required = false,
    formatValue = (currentValue) => currentValue ?? '',
    parseValue = (currentValue) => currentValue,
    waitForLayerLoad = false,
    layerLoading = false,
    layerLoadingError = false,
    resetKey
}) => {
    const formattedValue = formatValue(value);
    const [editing, setEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(formattedValue);
    const [loading, setLoading] = useState(false);
    const [errorType, setErrorType] = useState();
    const [waitingForLayerLoading, setWaitingForLayerLoading] = useState(false);
    const [waitingForLayerLoad, setWaitingForLayerLoad] = useState(false);

    useEffect(() => {
        if (!editing) {
            setCurrentValue(formattedValue);
        }
    }, [formattedValue, editing]);

    useEffect(() => {
        setCurrentValue(formattedValue);
        setEditing(false);
        setLoading(false);
        setErrorType();
        setWaitingForLayerLoading(false);
        setWaitingForLayerLoad(false);
    }, [resetKey]);

    useEffect(() => {
        if (waitingForLayerLoading && layerLoading) {
            setWaitingForLayerLoading(false);
            setWaitingForLayerLoad(true);
        } else if (waitingForLayerLoad && !layerLoading) {
            setWaitingForLayerLoad(false);
            if (layerLoadingError) {
                setErrorType(LAYER_LOAD_ERROR);
                setEditing(true);
            } else {
                setErrorType();
                setEditing(false);
            }
        }
    }, [layerLoading, layerLoadingError, waitingForLayerLoad, waitingForLayerLoading]);

    const busy = loading || waitingForLayerLoading || waitingForLayerLoad;

    const confirm = () => {
        const parsedValue = parseValue(currentValue);
        const isEmpty = Array.isArray(parsedValue)
            ? !parsedValue.length || parsedValue.some((entry) => !entry?.trim())
            : !parsedValue?.trim?.();
        if (required && isEmpty) {
            setErrorType(REQUIRED_ERROR);
            return;
        }
        if (errorType === LAYER_LOAD_ERROR) {
            onChange(parsedValue, undefined, { forced: true });
            setEditing(false);
            setErrorType();
            return;
        }
        if (currentValue === formattedValue) {
            setEditing(false);
            setErrorType();
            return;
        }
        if (errorType === VALIDATION_ERROR) {
            onChange(parsedValue, undefined, { forced: true });
            setEditing(false);
            setErrorType();
            return;
        }
        setLoading(true);
        setErrorType();
        Promise.resolve()
            .then(() => onValidate?.(parsedValue))
            .then((validationResult) => {
                if (waitForLayerLoad) {
                    setWaitingForLayerLoading(true);
                }
                onChange(parsedValue, validationResult, { forced: false });
                if (!waitForLayerLoad) {
                    setEditing(false);
                }
            })
            .catch((error) => setErrorType(error?.required ? REQUIRED_ERROR : VALIDATION_ERROR))
            .then(() => setLoading(false));
    };

    const tooltipId = errorType === REQUIRED_ERROR
        ? 'layerProperties.tooltip.requiredValue'
        : `layerProperties.tooltip.${editing ? 'confirmValue' : 'editValue'}`;

    const editButton = (
        <InputGroup.Addon
            className="btn"
            data-qa={`${dataQa}-edit`}
            onClick={() => {
                if (!busy) {
                    if (editing) {
                        confirm();
                    } else {
                        setErrorType();
                        setEditing(true);
                    }
                }
            }}>
            {busy
                ? <Spinner noFadeIn style={{width: '18px', height: '18px'}} spinnerName="circle"/>
                : <Glyphicon glyph={editing ? 'ok' : 'pencil'} />}
        </InputGroup.Addon>
    );

    return (
        <FormGroup validationState={errorType && !busy ? 'error' : null}>
            <ControlLabel><Message msgId={labelId} /></ControlLabel>
            <InputGroup>
                <FormControl
                    data-qa={dataQa}
                    value={currentValue}
                    type="text"
                    disabled={!editing || busy}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        setCurrentValue(nextValue);
                        setErrorType();
                        onDraftChange(parseValue(nextValue));
                    }} />
                <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${dataQa}`}>
                    <Message msgId={tooltipId}/>
                </Tooltip>}>
                    {editButton}
                </OverlayTrigger>
            </InputGroup>
        </FormGroup>
    );
};

EditableTextField.propTypes = {
    dataQa: PropTypes.string.isRequired,
    labelId: PropTypes.string.isRequired,
    value: PropTypes.any,
    onChange: PropTypes.func,
    onDraftChange: PropTypes.func,
    onValidate: PropTypes.func,
    required: PropTypes.bool,
    formatValue: PropTypes.func,
    parseValue: PropTypes.func,
    waitForLayerLoad: PropTypes.bool,
    layerLoading: PropTypes.bool,
    layerLoadingError: PropTypes.any,
    resetKey: PropTypes.any
};

export default EditableTextField;
