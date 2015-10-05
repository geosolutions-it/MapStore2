/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const defaultIcon = require('./img/spinner.gif');

var InlineSpinner = React.createClass({
    propTypes: {
        loading: React.PropTypes.bool,
        icon: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            loading: false,
            icon: defaultIcon
        };
    },
    getDisplayStyle() {
        return (this.props.loading ? 'inline-block' : 'none');
    },
    render() {
        return (
            <img src={this.props.icon} style={{
                display: this.getDisplayStyle(),
                margin: '4px',
                padding: 0,
                background: 'transparent',
                border: 0
            }} alt="..." />
        );
    }
});

module.exports = InlineSpinner;
