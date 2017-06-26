const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Radio} = require('react-bootstrap');
const LocaleUtils = require('../../utils/LocaleUtils');

class PrintOptions extends React.Component {
    static propTypes = {
        layouts: PropTypes.array,
        enableRegex: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        options: PropTypes.array,
        onChange: PropTypes.func,
        selected: PropTypes.string,
        isEnabled: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        layouts: [],
        enableRegex: /^.*$/,
        options: [{label: 'Option1', value: 'Option1'}, {label: 'Option2', value: 'Option2'}],
        onChange: () => {},
        selected: 'Option1'
    };

    onChange = (e) => {
        this.props.onChange(e.target.value);
    };

    renderOptions = () => {
        return this.props.options.map((option) => <Radio
            key={option.label}
            disabled={!this.isEnabled()} ref={"input" + option.value}
            checked={this.props.selected === option.value}
            onChange={this.onChange}
            value={option.value}
        >{LocaleUtils.getMessageById(this.context.messages, option.label)}</Radio>);
    };

    render() {
        return (
            <span className="form-inline">
                {this.renderOptions()}
            </span>
        );
    }

    isEnabled = () => {
        return this.props.isEnabled ?
            this.props.isEnabled(this.props.layouts) :
            this.props.layouts.length === 0 || this.props.layouts.some((layout) => layout.name.match(this.props.enableRegex));
    };
}

module.exports = PrintOptions;
