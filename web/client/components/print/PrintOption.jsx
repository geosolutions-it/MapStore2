/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Input} = require('react-bootstrap');

const PrintOption = React.createClass({
    propTypes: {
        layouts: React.PropTypes.array,
        enableRegex: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string]),
        label: React.PropTypes.string,
        onChange: React.PropTypes.func,
        checked: React.PropTypes.bool,
        isEnabled: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            layouts: [],
            enableRegex: /^.*$/,
            label: 'Option',
            onChange: () => {},
            checked: false
        };
    },
    onChange() {
        this.props.onChange(this.refs.input.getInputDOMNode().checked);
    },
    render() {
        return (
            <Input disabled={!this.isEnabled()} ref="input" checked={this.props.checked}
                type="checkbox" label={this.props.label} onChange={this.onChange}
            />
        );
    },
    isEnabled() {
        return this.props.isEnabled ?
            this.props.isEnabled(this.props.layouts) :
            this.props.layouts.length === 0 || this.props.layouts.some((layout) => layout.name.match(this.props.enableRegex));
    }
});

module.exports = PrintOption;
