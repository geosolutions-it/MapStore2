/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const {FormControl} = require('react-bootstrap');
require('./css/formControlIntl.css');

class FormControlIntl extends React.Component {

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
        this.state = { isEditing: false };
    }

    onChange(event) {
        this.props.onChange(event);
    }

    render() {
        const {onChange, onBlur, disabled, type, step, value, defaultValue,
            ...formProps} = this.props;
        return (
            <div>
                {this.state.isEditing ? (
                    <FormControl
                        className="form-control-intl"
                        disabled={this.props.disabled || false}
                        {...formProps}
                        step={"any"}
                        type="number"
                        {...value !== undefined ? {value} : {defaultValue}}
                        onChange={this.onChange.bind(this)}
                        onBlur={this.toggleEditing.bind(this)}
                    />
                ) : (
                    <FormControl
                        className="form-control-intl"
                        disabled={this.props.disabled || false}
                        {...formProps}
                        type="text"
                        {...value !== undefined ? {value: this.formattedValue(value) } : {defaultValue: this.formattedValue(defaultValue)}}
                        onFocus={this.toggleEditing.bind(this)}
                        readOnly
                    />
                )}
            </div>
        );
    }

    formattedValue(number) {
        const locale = this.context && this.context.intl && this.context.intl.locale || "en-US";
        return number && number.toLocaleString(locale, {minimumFractionDigits: 0, maximumFractionDigits: 20});
    }

    toggleEditing(event) {
        this.setState({ isEditing: !this.state.isEditing });
        event.type === 'blur' && this.props.onBlur && this.props.onBlur(event);
    }
}

module.exports = FormControlIntl;
