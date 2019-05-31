/**
* Copyright 2015, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {isNil} = require('lodash');
const {FormattedNumber} = require('react-intl');
class NumberFormat extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        numberParams: PropTypes.object
    };

    static contextTypes = {
        intl: PropTypes.object
    };

    render() {
        return this.context.intl ? <FormattedNumber value={this.props.value} {...this.props.numberParams} /> : <span>{!isNil(this.props.value) && !isNaN(this.props.value) && this.props.value.toString && this.props.value.toString() || ''}</span>;
    }
}

module.exports = NumberFormat;
