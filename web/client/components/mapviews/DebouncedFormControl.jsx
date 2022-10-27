
/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FormControl as FormControlRB } from 'react-bootstrap';
import withDebounceOnCallback from '../misc/enhancers/withDebounceOnCallback';
import localizedProps from '../misc/enhancers/localizedProps';

const FormControlOnChange = withDebounceOnCallback('onChange', 'value')(
    localizedProps('placeholder')(({ debounceTime, ...props }) =>
        <FormControlRB { ...props } onChange={(event) => props.onChange(event.target.value)} />
    )
);

function DebouncedFormControl({ fallbackValue, ...props }) {

    const [value, setValue] = useState(props.value ?? fallbackValue);
    const [resetTrigger, setResetTrigger] = useState(0);
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
            value: eventValue
        };
    }

    function handleBlurChange() {
        if (props.type === 'number') {
            if (value === '') {
                props.onChange(undefined);
                setValue(fallbackValue);
                setResetTrigger(prevCount => prevCount + 1);
            } else {
                const { changed, value: newValue } = computeRange(value);
                if (changed) {
                    props.onChange(newValue);
                    setValue(newValue);
                    setResetTrigger(prevCount => prevCount + 1);
                }
            }
        }
    }

    function handleChange(newValue) {
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

    return (
        <FormControlOnChange
            {...props}
            key={resetTrigger}
            value={value}
            onChange={handleChange}
            onBlur={handleBlurChange}
        />
    );
}

export default DebouncedFormControl;
