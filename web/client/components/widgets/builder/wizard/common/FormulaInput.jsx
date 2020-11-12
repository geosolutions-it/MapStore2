/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import HTML from '../../../../I18N/HTML';

import {Col, FormControl, ControlLabel, FormGroup} from 'react-bootstrap';
import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import Message from '../../../../I18N/Message';
import {isNil, isNaN, isError} from 'lodash';


import { parseExpression } from '../../../../../utils/ExpressionUtils';
const testContext = {
    value: 1
};
function validate(value) {
    try {
        if (!value) return [true]; // "", undefined or null are valid
        const processedValue = parseExpression(value, testContext);
        // if returns null of undefined the expression is not valid, even if it doesn't throw errors
        return [!isNil(processedValue) && !isNaN(processedValue) && !isError(processedValue), processedValue];
    } catch (e) {
        return [false, e];
    }
}
function getFeedback(isValid, value) {
    if (isValid) {
        return null;
    }
    if (isNil(value)) {
        return "the expression returns no value";
    }
    if (isNaN(value)) {
        return "the expression returned NaN";
    }
    if (isError(value)) {
        return value.message;
    }
    return null;
}
function getValidationState(isValid, value) {
    if (value) {
        return isValid ? 'success' : 'error';
    }
    return null;
}
/**
 * Input for formula. Provides validation, and change the value
 * only if the value is valid.
 */
export default function FormulaInput({onChange, value, ...props}) {
    const [initialValid, initialValidationValue] = validate(value);
    const [isValid, setValid] = useState(initialValid);
    const [validationValue, setValidationValue] = useState(initialValidationValue);
    const [localValue, setLocalValue] = useState(value);
    const validateAndChange = e => {
        const [valid, val] = validate(e.target.value);
        if (valid) {
            setValid(true);
            setValidationValue(undefined);
            onChange(e);
        } else {
            setValid(false);
            setValidationValue(val);
        }
        setLocalValue(e.target.value);
    };
    return (<FormGroup validationState={getValidationState(isValid, localValue)}>
        <Col xs={12}>
            <ControlLabel><Message msgId="widgets.advanced.formula" /></ControlLabel>
            <DisposablePopover placement="top" title={<Message msgId="widgets.advanced.formula" />} text={<HTML msgId="widgets.advanced.formulaExamples" />} />
            <FormControl placeholder="e.g. value / 100" feedback={getFeedback(isValid, validationValue)} {...props} type="text" value={localValue} onChange={validateAndChange} />
        </Col>
    </FormGroup>);
}
