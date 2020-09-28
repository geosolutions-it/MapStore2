/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {isNumber} from 'lodash';
import IntlNumberFormControl from '../../../I18N/IntlNumberFormControl';

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
export default class NumberEditor extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number]),
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

        this.state = {inputText: props.value?.toString?.() ?? ''};
        this.inputRef = React.createRef();
    }

    state = {inputText: ''};

    componentDidMount() {
        this.props.onTemporaryChanges?.(true);
    }

    componentWillUnmount() {
        this.props.onTemporaryChanges?.(false);

    }

    getValue() {
        try {
            const numberValue = parsers[this.props.dataType](this.state.inputText);
            return {
                [this.props.column.key]: this.validateNumberValue(numberValue) ? numberValue : this.props.value
            };
        } catch (e) {
            return {
                [this.props.column.key]: this.props.value
            };
        }
    }

    getInputNode() {
        return this.inputRef.current;
    }

    render() {
        return (<IntlNumberFormControl
            {...this.props.inputProps}
            style={!this.state.validated || this.state.isValid ? {} : {
                borderColor: 'red'
            }}
            value={this.state.inputText}
            ref={(input)=>{this.inputRef = input;}}
            type="number"
            min={this.props.minValue}
            max={this.props.maxValue}
            className="form-control"
            defaultValue={this.props.value}
            onChange={(val) => {
                this.setState({
                    inputText: val,
                    isValid: this.validateTextValue(val),
                    validated: true
                });
            }}
        />);
    }

    validateTextValue = (value) => {
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
        return isNumber(value) &&
            !isNaN(value) &&
            (!isNumber(this.props.minValue) || this.props.minValue <= value) &&
            (!isNumber(this.props.maxValue) || this.props.maxValue >= value);
    };
}
