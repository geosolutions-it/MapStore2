/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {FormattedDate} = require('react-intl');

var DateFormat = React.createClass({
    propTypes: {
        locale: React.PropTypes.string,
        value: React.PropTypes.object,
        dateParams: React.PropTypes.object
    },
    contextTypes: {
        locale: React.PropTypes.string,
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            value: new Date()
        };
    },
    render() {
        var locale = this.props.locale || this.context.locale;
        return <FormattedDate locales={locale} value={this.props.value} {...this.props.dateParams}/>;
    }
});

module.exports = DateFormat;
