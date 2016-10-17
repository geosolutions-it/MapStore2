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
        position: React.PropTypes.shape({
            lng: React.PropTypes.number,
            lat: React.PropTypes.number
        })
    },
    getPositionValues(mPos) {
        let {lng, lat} = (mPos) ? mPos : [null, null];
        let [latM, lngM] = [(lat % 1) * 60, (lng % 1) * 60];
        let [latS, lngS] = [(latM % 1) * 60, (lngM % 1) * 60];
        return {
            lat: Math.floor(lat),
            latM: Math.abs(latM),
            latS: Math.abs(latS),
            lng: Math.floor(lng),
            lngM: Math.abs(lngM),
            lngS: Math.abs(lngS)
        };
    },
    render() {
        let pos = this.getPositionValues(this.props.position);
        let integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};
        return (
                <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><FormattedNumber key="latD" {...integerFormat} value={pos.lat} />
                    <span>° </span><FormattedNumber key="latM" {...integerFormat} value={pos.latM} />
                    <span>' </span><FormattedNumber key="latS" {...decimalFormat} value={pos.latS} />
                    <span>''</span>
                    <span className="mouseposition-separator"/>
                    <span> Lng: </span><FormattedNumber key="lngD" {...lngDFormat} value={pos.lng} />
                    <span>° </span><FormattedNumber key="lngM" {...integerFormat} value={pos.lngM} />
                    <span>' </span><FormattedNumber key="lngS" {...decimalFormat} value={pos.lngS} /><span>''</span>
                </Label>
                </h5>);
    }
});

module.exports = MousePositionLabelDMS;
