import React, {useState} from 'react';

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
export default function FormulaInput({onChange, value, ...props}) {
    const [initialValid, initialValidationValue] = validate(props.value);
    const [isValid, setValid] = useState(initialValid);
    const [validationValue, setValidationValue] = useState(initialValidationValue);
    const [localValue, setLocalValue] = useState(props.value);
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
            <ControlLabel><Message msgId="widgets.advanced.formula" />
                <DisposablePopover placement="top" title={<Message msgId="widgets.advanced.formula"/>} text={
                    <div>
                Transform the value using a formula. Use the variable <code>value</code> in the expression:
                        <h5>Examples</h5>
                        <ul>
                            <li><code></code>value / 100</li>
                        </ul>
                        More information about all the operators <a target="_blank" href="https://github.com/m93a/filtrex#expressions">here</a>
                    </div>
                } /></ControlLabel>
            <FormControl feedback={getFeedback(isValid, validationValue)} {...props} type="text" value={localValue} onChange={validateAndChange} />
        </Col>
    </FormGroup>);
}
