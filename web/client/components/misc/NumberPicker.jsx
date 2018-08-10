/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose, withStateHandlers, withHandlers, lifecycle} = require('recompose');


const TEMP_NUMBER_REGEX = /^[+-]?[0-9]*(\.?[0-9]*)*(e[0-9]+)?$/;
const isEmptyString = v => v === "";
const isValid = v => {
    return TEMP_NUMBER_REGEX.test(`${v}`);
};
const isNumber = v => {
    const vv = parseFloat(v);
    return !isNaN(vv) && isValid(vv);
};

const round = (v, precision = 0) => {
    let value = ('' + v).split('e');
    value = Math.round(
        +(value[0] + 'e' + (value[1] ? +value[1] + precision : precision))
    );

    value = ('' + value).split('e');
    value = +(value[0] + 'e' + (value[1] ? +value[1] - precision : -precision));

    return value.toFixed(precision);
};

const getPrecision = (precision, value) => {
    if (precision !== null && precision !== undefined) {
        return precision;
    }
    const decimal = (value + "").split("e")[0].split(".");
    if (decimal[1]) {
        return decimal[1].length;
    }
    return 0;
};
/**
 * This is a replacement of react-widgets Number Picker to avoid issues in
 *
 */
module.exports =
compose(
    withStateHandlers(
        ({ value }) => ({ rawValue: value }),
        {
            onChange: ({ rawValue: oldValue }, {value, onChange = () => {}}) => newValue => {
                if (isEmptyString(newValue)) {
                    onChange(null);
                } else if (isNumber(newValue) && value !== parseFloat(newValue, 10) ) {
                    onChange(parseFloat(newValue, 10));
                }
                return ({
                    rawValue: isValid(newValue)
                        ? newValue
                        : oldValue
                });
            }
    }),
    lifecycle({
        componentDidUpdate({value: oldValue, rawValue, onChange = () => {}}) {
            if (this.props.value !== oldValue && rawValue && (this.props.value === null || this.props.value === undefined)) {
                onChange("");
            }
        }
    }),
    withHandlers({
        clearValue: ({rawValue, onChange = () => {}}) => () => {
            if (!isNumber(rawValue)) {
                onChange("");
            } else {
                onChange(`${parseFloat(rawValue, 10)}`);
            }
        },
        onIncrement: ({ rawValue, onChange = () => { }, precision }) => () => {
            const v = parseFloat(rawValue, 10);
            if (isNaN(v)) {
                return onChange("1");
            }
            return onChange(`${round(v + 1, getPrecision(precision, rawValue))}`);
        },
        onDecrement: ({ rawValue, onChange = () => { }, precision }) => () => {
            const v = parseFloat(rawValue, 10);
            if (isNaN(v)) {
                return onChange("-1");
            }
            return onChange(`${round(v - 1, getPrecision(precision, rawValue))}`);
        }
    })
)(({ onChange = () => { }, onIncrement = () => { }, onDecrement = () => { }, clearValue = () => {}, disabled, rawValue, props }) =>
    (<div className={`rw-numberpicker rw-widget ${disabled ? 'rw-state-disabled' : ''}`} style={{ borderColor: "rgb(222, 222, 222)" }}>
        <span className="rw-select">
            <button onMouseDown={onIncrement} title="increment value" type="button" aria-label="increment value" className="rw-btn increment">
                <span aria-hidden="true" className="rw-i rw-i-caret-up"></span></button>
            <button onMouseDown={onDecrement} title="decrement value" type="button" aria-label="decrement value" className="rw-btn decrement">
                <span aria-hidden="true" className="rw-i rw-i-caret-down"></span></button>
        </span>
        <input onBlur={clearValue} type="text" role="spinbutton" disabled={disabled} className="rw-input" {...props} value={rawValue} onChange={e => onChange(e.target.value)} />
    </div>));
