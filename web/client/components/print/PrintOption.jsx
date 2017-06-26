const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Checkbox} = require('react-bootstrap');

class PrintOption extends React.Component {
    static propTypes = {
        layouts: PropTypes.array,
        enableRegex: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        label: PropTypes.string,
        onChange: PropTypes.func,
        checked: PropTypes.bool,
        isEnabled: PropTypes.func
    };

    static defaultProps = {
        layouts: [],
        enableRegex: /^.*$/,
        label: 'Option',
        onChange: () => {},
        checked: false
    };

    onChange = () => {
        this.props.onChange(!this.refs.input.props.checked);
    };

    render() {
        return (
            <Checkbox disabled={!this.isEnabled()} ref="input" checked={this.props.checked}
                onChange={this.onChange}
            >{this.props.label}</Checkbox>
        );
    }

    isEnabled = () => {
        return this.props.isEnabled ?
            this.props.isEnabled(this.props.layouts) :
            this.props.layouts.length === 0 || this.props.layouts.some((layout) => layout.name.match(this.props.enableRegex));
    };
}

module.exports = PrintOption;
