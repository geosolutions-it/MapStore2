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

var MousePositionLabelDD = React.createClass({
    propTypes: {
        position: React.PropTypes.shape({
            lng: React.PropTypes.number,
            lat: React.PropTypes.number
        })
    },
    render() {
        let integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 6, minimumFractionDigits: 6};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 6, minimumFractionDigits: 6};
        return (
                <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><FormattedNumber key="latD" {...integerFormat} value={this.props.position.lat} />
                    <span>° Lng: </span>
                    <FormattedNumber key="lngD" {...lngDFormat} value={this.props.position.lng} />
                    <span>° </span>
                </Label>
                </h5>);
    }
});

module.exports = MousePositionLabelDD;
