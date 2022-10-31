
/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FormControl as FormControlRB } from 'react-bootstrap';
import withDebounceOnCallback from './enhancers/withDebounceOnCallback';
import localizedProps from './enhancers/localizedProps';

const FormControlOnChange = withDebounceOnCallback('onChange', 'value')(
    localizedProps('placeholder')(({ debounceTime, ...props }) =>
        <FormControlRB { ...props } onChange={(event) => props.onChange(event.target.value)} />
    )
);

/**
 * Component for rendering an input with the following functionalities:
 * - debounce on change event
 * - restore to a fallback value on blur
 * @memberof components.DebouncedFormControl
 * @class
 * @prop {string|number} fallbackValue it replaces the value if undefined on blur
 *
 */
function DebouncedFormControl({ fallbackValue, ...props }) {

    const [value, setValue] = useState(props.value ?? fallbackValue);
    const [tmpValue, setTmpValue] = useState(props.value ?? fallbackValue);

    const [resetTrigger, setResetTrigger] = useState(0);
    const focus = useRef(false);
    const updateValue = useRef();
    updateValue.current = value;
    useEffect(() => {
        if (updateValue.current !== props.value) {
            setValue(props.value ?? fallbackValue);
        }
    }, [props.value]);

    function computeRange(eventValue) {
        const validNumber = !isNaN(parseFloat(eventValue));
        const isLessThanMin = validNumber && props.min !== undefined
            ? eventValue < props.min
            : false;
        if (isLessThanMin) {
            return {
                changed: true,
                value: props.min
            };
        }
        const isGreaterThanMax = validNumber && props.max !== undefined
            ? eventValue > props.max
            : false;
        if (isGreaterThanMax) {
            return {
                changed: true,
                value: props.max
            };
        }
        return {
            changed: false,
            value: validNumber ? parseFloat(eventValue) : eventValue
        };
    }

    function handleBlurChange() {
        if (props.type === 'number') {
            if (tmpValue === '') {
                props.onChange(undefined);
                setValue(fallbackValue);
                setResetTrigger(prevCount => prevCount + 1);
            } else {
                const { value: newValue } = computeRange(tmpValue);
                props.onChange(newValue);
                setResetTrigger(prevCount => prevCount + 1);
                setValue(newValue);
            }
        }
        focus.current = false;
    }

    function handleFocusChange() {
        focus.current = true;
    }

    function handleChange(newValue) {
        if (focus.current) {
            let eventValue = newValue;
            let update = true;
            if (props.type === 'number') {
                const { changed: rangeChanged } = computeRange(eventValue);
                if (eventValue === '' || rangeChanged) {
                    update = false;
                }
            }
            setValue(eventValue);
            if (update) {
                props.onChange(eventValue);
            }
        }
    }
    return (
        <FormControlOnChange
            {...props}
            key={resetTrigger}
            value={value}
            onChange={handleChange}
            onChangeNoDebounce={setTmpValue}
            onBlur={handleBlurChange}
            onFocus={handleFocusChange}
        />
    );
}

export default DebouncedFormControl;
