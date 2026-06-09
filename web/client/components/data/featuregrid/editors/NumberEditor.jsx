/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isNumber, castArray } from 'lodash';
import IntlNumberFormControl from '../../../I18N/IntlNumberFormControl';
import { editors } from 'react-data-grid';

const parsers = {
    "int": v => parseInt(v, 10),
    "number": v => parseFloat(v, 10)
};

/**
 * Editor of the FeatureGrid, that allows to insert a number, limited by `minValue` and `maxValue`
 * @memberof components.data.featuregrid.editors
 * @name NumberEditor
 * @class
 * @prop {number} editorProps.minValue the lower boundary of valid numbers
 * @prop {number} editorProps.maxValue the upper boundary of valid numbers
 */
export default class NumberEditor extends editors.SimpleTextEditor {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.null
        ]),
        inputProps: PropTypes.object,
        dataType: PropTypes.string,
        minValue: PropTypes.number,
        maxValue: PropTypes.number,
        column: PropTypes.object,
        onTemporaryChanges: PropTypes.func
    };

    static defaultProps = {
        dataType: "number",
        column: {}
    };

    constructor(props) {
        super(props);
        const value = props.value?.toString?.() ?? '';
        this.state = {
            inputText: value,
            isValid: this.validateTextValue(value),
            validated: true
        };
    }

    componentDidMount() {
        this.props.onTemporaryChanges?.(true);
    }

    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);

    }

    getValue() {
        try {
            const numberValue = this.state.inputText === '' ? null : parsers[this.props.dataType](this.state.inputText);
            return {
                [this.props.column.key]: numberValue
            };
        } catch (e) {
            return {
                [this.props.column.key]: this.props.value
            };
        }
    }

    getMinValue() {
        return this.props?.column?.schema?.minimum ?? this.props.minValue;
    }

    getMaxValue() {
        return this.props?.column?.schema?.maximum ?? this.props.maxValue;
    }

    render() {
        return (<div className={`ms-cell-editor ${!this.state.validated || this.state.isValid ? '' : 'invalid'}`}><IntlNumberFormControl
            {...this.props.inputProps}
            value={this.state.inputText}
            type="number"
            min={this.getMinValue()}
            max={this.getMaxValue()}
            className="form-control"
            defaultValue={this.props.value}
            onKeyDown={this.props.onKeyDown}
            onBlur={this.props.onBlur}
            onChange={(val) => {
                this.setState({
                    inputText: val,
                    isValid: this.validateTextValue(val),
                    validated: true
                });
            }}
        /></div>);
    }

    validateTextValue = (value) => {
        if (value === '') {
            return castArray(this.props?.column?.schema?.type || []).includes('null');
        }
        if (!parsers[this.props.dataType]) {
            return false;
        }
        try {
            const numberValue = parsers[this.props.dataType](value);

            return this.validateNumberValue(numberValue);
        } catch (e) {
            return false;
        }
    };

    validateNumberValue = (value) => {
        const minValue = this.getMinValue();
        const maxValue = this.getMaxValue();
        return isNumber(value) &&
            !isNaN(value) &&
            (!isNumber(minValue) || minValue <= value) &&
            (!isNumber(maxValue) || maxValue >= value);
    };
}
