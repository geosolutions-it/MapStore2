/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';

import React from 'react';
import './css/formControlIntl.css';
import NumericInput from '../../libs/numeric-input/NumericInput';
/**
 * Localized Numeric Input. It provides an numeric input value that uses
 * separators (eg. ",",".") as they are used in the current selected language from context.
 * @prop {string|number} value a numeric value
 * @prop {string|number] defaultValue a value to use as default
 * @prop {function} onChange handler of change event. the argument of this handler is the current value inserted.
 * @prop {number} step the step when you click on arrows (up, down) of the input
 * @prop {function} onBlur event handler on blur event
 */
class IntlNumberFormControl extends React.Component {

    static propTypes = {
        type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChange: PropTypes.func,
        step: PropTypes.number,
        locale: PropTypes.string,
        disabled: PropTypes.bool,
        onBlur: PropTypes.func
    }

    static contextTypes = {
        intl: PropTypes.object
    };
    constructor(props) {
        super(props);
        this.state = {
            value: undefined,
            inputRef: null,
            focusedInput: false             // it is a flag used for prevent formatting the number during focus mode
        };
    }
    componentDidUpdate(prevProps, prevState) {
        const currentValue = this.state?.value || "";
        const prevValue = prevState?.value || "";
        if (prevValue !== currentValue) {
            const currentCursorPos = this.state.inputRef.selectionStart;
            const locale = this.context && this.context.intl && this.context.intl.locale || "en-US";
            const formatParts = new Intl.NumberFormat(locale).formatToParts(10000.1);
            const decimalSeparator = formatParts?.find(part => part.type === 'decimal').value;
            const groupSeparator = formatParts?.find(part => part.type === 'group').value;
            let isFormattedVal = currentValue && decimalSeparator && groupSeparator && (currentValue.includes(decimalSeparator) || currentValue.includes(groupSeparator));
            if (isFormattedVal) {
                let prevValueLength = prevValue.length;
                let currentValueLength = currentValue.length;
                let numGrSeparatorInPrevValue = prevValue.length - prevValue.replaceAll(groupSeparator, "").length;
                let numGrSeparatorInCurrentValue = currentValue.length - currentValue.replaceAll(groupSeparator, "").length;
                if (currentValueLength - prevValueLength === 2 && numGrSeparatorInPrevValue < numGrSeparatorInCurrentValue) {
                    this.state.inputRef.setSelectionRange(currentCursorPos + 1, currentCursorPos + 1 );
                } else if (currentValueLength - prevValueLength === 1 && numGrSeparatorInPrevValue === numGrSeparatorInCurrentValue) {
                    this.state.inputRef.setSelectionRange(currentCursorPos, currentCursorPos );
                }
            }

        }
    }

    render() {
        const {onChange, onBlur, disabled, type, step, value, defaultValue,
            ...formProps} = this.props;
        const locale = this.context && this.context.intl && this.context.intl.locale || "en-US";
        const formatParts = new Intl.NumberFormat(locale).formatToParts(10000.1);
        const decimalSeparator = formatParts?.find(part => part.type === 'decimal').value;
        const groupSeparator = formatParts?.find(part => part.type === 'group').value;
        return (
            <NumericInput
                id={'intl-numeric'}
                step={step}
                {...formProps}
                decimalSeparator={decimalSeparator}
                groupSeparator={groupSeparator}
                {...value !== undefined ? {value: this.format(value) } : {defaultValue: this.format(defaultValue)}}
                format={this.format}
                onChange={(val) => {
                    val === null ? this.props.onChange("") : this.props.onChange(val.toString());
                }}
                onKeyUp={ev=>{
                    let inputValue = ev.target.value;
                    this.setState({ value: inputValue });
                    let isDelete = ev.keyCode === 8 || ev.keyCode === 46;
                    if (![37, 39, 17].includes(ev.keyCode) && !isDelete && ev.target.selectionStart === ev.target.value.length - 1) {
                        return ev.target.setSelectionRange(-1, -1);
                    }
                    return true;
                }}
                onBlur={e=>{
                    let val = e.target.value;
                    this.setState({ focusedInput: false });
                    if (onBlur) {
                        e.target.value = this.parse(val);
                        onBlur(e);
                    }
                }}
                disabled={disabled || false}
                onKeyDown={(e) =>{
                    if (!this.state.inputRef) {
                        this.setState({ inputRef: e.target });
                        return;
                    }
                }}
                parse={this.parse}
                onKeyPress={e => {
                    const allow = e.key.match(/^[a-zA-Z]*$/);
                    allow !== null && e.preventDefault();
                }}
                componentClass={"input"}
                className="form-control intl-numeric"
            />
        );
    }
    calculateCursorPosition = (val, decimalSeparator, groupSeparator, initialPos) => {
        const formattedValue = this.format(val);
        const numCommas = formattedValue.length - (formattedValue.replace(/,/g, "")).length;
        return numCommas + initialPos;
    }
    parse = value => {
        let formatValue = value;
        // eslint-disable-next-line use-isnan
        if (formatValue !== NaN && formatValue !== "NaN") {  // Allow locale string to parse
            const locale = this.context && this.context.intl && this.context.intl.locale || "en-US";
            const format = new Intl.NumberFormat(locale);
            const parts = format.formatToParts(12345.6);
            const numerals = Array.from({ length: 10 }).map((_, i) => format.format(i));
            const index = new Map(numerals.map((d, i) => [d, i]));
            const group = new RegExp(
                `[${parts.find(d => d.type === "group").value}]`,
                "g"
            );
            const decimal = new RegExp(
                `[${parts.find(d => d.type === "decimal").value}]`
            );
            const numeral = new RegExp(`[${numerals.join("")}]`, "g");
            const rIndex = d => index.get(d);

            formatValue = (formatValue
                .trim()
                .replace(group, "")
                .replace(decimal, ".")
                .replace(numeral, rIndex));
            return formatValue ? +formatValue : NaN;
        }
        return "";
    };

    format = val => {
        // if (this.state.focusedInput) return val;
        if (!isNaN(val) && val !== "NaN") {
            const locale = this.context && this.context.intl && this.context.intl.locale || "en-US";
            const formatter = new Intl.NumberFormat(locale, {minimumFractionDigits: 0, maximumFractionDigits: 20});
            return formatter.format(val);
        }
        return "";
    };
}

export default IntlNumberFormControl;
