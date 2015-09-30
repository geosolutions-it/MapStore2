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
        let latFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
                <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><FormattedNumber key="latD" {...latFormat} value={this.props.lat} />
                    <span>° </span><FormattedNumber key="latM" {...latFormat} value={this.props.latM} />
                    <span>' </span><FormattedNumber key="latS" {...latFormat} value={this.props.latS} />
                    <span>'' Lng: </span><FormattedNumber key="lngD" {...lngDFormat} value={this.props.lng} />
                    <span>° </span><FormattedNumber key="lngM" {...latFormat} value={this.props.lngM} />
                    <span>' </span><FormattedNumber key="lngS" {...latFormat} value={this.props.lngS} /><span>''</span>
                </Label>
                </h5>);
    }
});

module.exports = MousePositionLabelDMS;
