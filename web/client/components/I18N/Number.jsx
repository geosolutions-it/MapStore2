/**
* Copyright 2015, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {FormattedNumber} = require('react-intl');
const { checkRounding } = require('../../utils/CoordinatesUtils');
class NumberFormat extends React.Component {
    static propTypes = {
        value: PropTypes.oneOf([PropTypes.object, PropTypes.number]),
        numberParams: PropTypes.object,
        roundingBehaviour: PropTypes.string
    };

    static contextTypes = {
        intl: PropTypes.object
    };

    static defaultProps = {
        value: new Date(),
        roundingBehaviour: "round"
    };

    render() {
        const {value, roundingBehaviour, numberParams} = this.props;
        const {maximumFractionDigits} = numberParams;

        const roundingOptions = {value, roundingBehaviour, maximumFractionDigits};
        return this.context.intl ? <FormattedNumber value={checkRounding(roundingOptions)} {...numberParams}/> : <span>{value && value.toString() || ''}</span>;
    }
}

module.exports = NumberFormat;
