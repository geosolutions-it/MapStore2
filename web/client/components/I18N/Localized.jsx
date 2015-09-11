/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var Localized = React.createClass({
    propTypes: {
        locale: React.PropTypes.string,
        messages: React.PropTypes.object
    },
    childContextTypes: {
        locale: React.PropTypes.string,
        messages: React.PropTypes.object
    },
    getChildContext() {
        return {
           locale: this.props.locale,
           messages: this.props.messages
        };
    },
    render() {
        let { children } = this.props;

        if (this.props.messages) {
            if (typeof children === 'function') {
                children = children();
            }

            return React.Children.only(children);
        }
        return null;
    }
 });

module.exports = Localized;
