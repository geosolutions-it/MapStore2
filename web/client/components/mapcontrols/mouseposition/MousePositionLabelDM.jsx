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

var MousePositionLabelDM = React.createClass({
    propTypes: {
        position: React.PropTypes.shape({
            lng: React.PropTypes.number,
            lat: React.PropTypes.number
        })
    },
    getPositionValues(mPos) {
        let {lng, lat} = (mPos) ? mPos : [null, null];
        let [latM, lngM] = [(lat % 1) * 60, (lng % 1) * 60];
        return {
            lat,
            latM: Math.abs(latM),
            lng,
            lngM: Math.abs(lngM)
        };
    },
    render() {
        let pos = this.getPositionValues(this.props.position);
        let integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 3, minimumFractionDigits: 3};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};
        return (
                <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><FormattedNumber key="latD" {...integerFormat} value={pos.lat} />
                    <span>° </span><FormattedNumber key="latM" {...decimalFormat} value={pos.latM} />
                    <span>' </span>
                    <span>Lng: </span><FormattedNumber key="lngD" {...lngDFormat} value={pos.lng} />
                    <span>° </span><FormattedNumber key="lngM" {...decimalFormat} value={pos.lngM} />
                    <span>' </span>
                </Label>
                </h5>);
    }
});

module.exports = MousePositionLabelDM;
