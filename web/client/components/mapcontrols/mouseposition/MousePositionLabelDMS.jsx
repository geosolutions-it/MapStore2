/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var Label = BootstrapReact.Label;
var ReactIntl = require('react-intl');
var FormattedNumber = ReactIntl.FormattedNumber;

var MousePositionLabelDMS = React.createClass({
    propTypes: {
        lat: React.PropTypes.number,
        lng: React.PropTypes.number,
        latM: React.PropTypes.number,
        lngM: React.PropTypes.number,
        latS: React.PropTypes.number,
        lngS: React.PropTypes.number
    },
    render() {
        let integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};
        return (
                <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><FormattedNumber key="latD" {...integerFormat} value={this.props.lat} />
                    <span>° </span><FormattedNumber key="latM" {...integerFormat} value={this.props.latM} />
                    <span>' </span><FormattedNumber key="latS" {...decimalFormat} value={this.props.latS} />
                    <span>'' Lng: </span><FormattedNumber key="lngD" {...lngDFormat} value={this.props.lng} />
                    <span>° </span><FormattedNumber key="lngM" {...integerFormat} value={this.props.lngM} />
                    <span>' </span><FormattedNumber key="lngS" {...decimalFormat} value={this.props.lngS} /><span>''</span>
                </Label>
                </h5>);
    }
});

module.exports = MousePositionLabelDMS;
