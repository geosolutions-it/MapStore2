/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Editor of the FeatureGrid that uses a regex passed as prop to validate the input.
 * @memberof components.data.featuregrid.editors
 * @name FormatEditor
 * @class
 * @prop {string} editorProps.formatRegex regular expression that a value must match to be considered valid
 */
export default class FormatEditor extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        inputProps: PropTypes.object,
        dataType: PropTypes.string,
        column: PropTypes.object,
        formatRegex: PropTypes.string,
        onTemporaryChanges: PropTypes.func
    };

    static defaultProps = {
        dataType: "string",
        column: {}
    };

    constructor(props) {
        super(props);

        this.state = {inputText: props.value};
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
        return {
            [this.props.column.key]: this.validateValue(this.state.inputText) ? this.state.inputText : this.props.value
        };
    }

    getInputNode() {
        return this.inputRef.current;
    }

    render() {
        return (<input
            {...this.props.inputProps}
            style={!this.state.validated || this.state.isValid ? {} : {
                borderColor: 'red'
            }}
            value={this.state.inputText}
            ref={this.inputRef}
            className="form-control"
            defaultValue={this.props.value}
            onChange={(e) => {
                this.setState({
                    inputText: e.target.value,
                    isValid: this.validateValue(e.target.value),
                    validated: true
                });
            }}
        />);
    }

    validateValue = (value) => {
        if (!this.props.formatRegex) {
            return true;
        }

        const regExp = new RegExp(this.props.formatRegex);
        return regExp.test(value);
    }
}
