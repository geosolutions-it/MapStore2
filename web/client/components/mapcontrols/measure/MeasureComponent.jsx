/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Button, Panel, ButtonGroup, ButtonToolbar, Tooltip} = require('react-bootstrap');
var ToggleButton = require('../../buttons/ToggleButton');
var ReactIntl = require('react-intl');
var FormattedNumber = ReactIntl.FormattedNumber;

var lineRuleIcon = require('./img/line-ruler.png');
var areaRuleIcon = require('./img/area-ruler.png');
var bearingRuleIcon = require('./img/bearing-ruler.png');

var {isEqual} = require('lodash');

let MeasureComponent = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        columnProperties: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        lengthButtonText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        areaButtonText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        resetButtonText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        lengthLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        areaLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        bearingLabel: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        uom: React.PropTypes.shape({
                    length: React.PropTypes.shape({ unit: React.PropTypes.string.isRequired,
                              label: React.PropTypes.string.isRequired}),
                    area: React.PropTypes.shape({ unit: React.PropTypes.string.isRequired,
                            label: React.PropTypes.string.isRequired})
                        }),
        toggleMeasure: React.PropTypes.func,
        measurement: React.PropTypes.object,
        lineMeasureEnabled: React.PropTypes.bool,
        areaMeasureEnabled: React.PropTypes.bool,
        bearingMeasureEnabled: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            icon: <img src={lineRuleIcon} />,
            columnProperties: {
                xs: 4,
                sm: 4,
                md: 4
            },
            id: "measure-result-panel",
            uom: {
                length: {unit: 'm', label: 'm'},
                area: {unit: 'sqm', label: 'm²'}
            }
        };
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    onLineClick: function() {
        var newMeasureState;
        if (this.props.lineMeasureEnabled === false) {
            newMeasureState = {
                lineMeasureEnabled: true,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false,
                geomType: 'LineString',
                // reset old measurements
                len: 0,
                area: 0,
                bearing: 0
            };
            this.props.toggleMeasure(newMeasureState);
        }
    },
    onAreaClick: function() {
        var newMeasureState;
        if (this.props.areaMeasureEnabled === false) {
            newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: true,
                bearingMeasureEnabled: false,
                geomType: 'Polygon',
                // reset old measurements
                len: 0,
                area: 0,
                bearing: 0
            };
            this.props.toggleMeasure(newMeasureState);
        }
    },
    onBearingClick: function() {
        var newMeasureState;
        if (this.props.bearingMeasureEnabled === false) {
            newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: true,
                geomType: 'Bearing',
                // reset old measurements
                len: 0,
                area: 0,
                bearing: 0
            };
            this.props.toggleMeasure(newMeasureState);
        }
    },
    onResetClick: function() {
        var resetMeasureState = {
            lineMeasureEnabled: false,
            areaMeasureEnabled: false,
            bearingMeasureEnabled: false,
            geomType: null,
            len: 0,
            area: 0,
            bearing: 0
        };
        this.props.toggleMeasure(resetMeasureState);
    },
    getFormattedBearingValue(azimuth = 0) {
        var bearing = "";
        if (azimuth >= 0 && azimuth < 90) {
            bearing = "N " + this.degToDms(azimuth) + " E";

        } else if (azimuth > 90 && azimuth <= 180) {
            bearing = "S " + this.degToDms(180.0 - azimuth) + " E";
        } else if (azimuth > 180 && azimuth < 270) {
            bearing = "S " + this.degToDms(azimuth - 180.0 ) + " W";
        } else if (azimuth >= 270 && azimuth <= 360) {
            bearing = "N " + this.degToDms(360 - azimuth ) + " W";
        }

        return bearing;
    },
    getFormattedLength(length = 0) {
        switch (this.props.uom.length.unit) {
            case 'm':
                return length;
            case 'ft':
                return this.mToft(length);
            case 'km':
                return this.mTokm(length);
            case 'mi':
                return this.mTomi(length);
            default:
            return length;
        }
    },
    getFormattedArea(area = 0) {
        switch (this.props.uom.area.unit) {
            case 'sqm':
                return area;
            case 'sqft':
                return this.sqmTosqft(area);
            case 'sqkm':
                return this.sqmTosqkm(area);
            case 'sqmi':
                return this.sqmTosqmi(area);
            default:
            return area;
        }
    },
    getToolTips() {
        return {
            lineToolTip: <Tooltip id={"tooltip-button.line"}>{this.props.lengthLabel}</Tooltip>,
            areaToolTip: <Tooltip id={"tooltip-button.area"}>{this.props.areaLabel}</Tooltip>,
            bearingToolTip: <Tooltip id={"tooltip-button.bearing"}>{this.props.bearingLabel}</Tooltip>
        };
    },
    render() {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        let {lineToolTip, areaToolTip, bearingToolTip} = this.getToolTips();
        return (
            <Panel id={this.props.id}>
                <ButtonToolbar>
                    <ButtonGroup>
                        <ToggleButton
                            text={<img src={lineRuleIcon}/>}
                            pressed={this.props.lineMeasureEnabled}
                            onClick={this.onLineClick}
                            tooltip={lineToolTip} />
                        <ToggleButton
                            text={<img src={areaRuleIcon}/>}
                            pressed={this.props.areaMeasureEnabled}
                            onClick={this.onAreaClick}
                            tooltip={areaToolTip} />
                        <ToggleButton
                            text={<img src={bearingRuleIcon}/>}
                            pressed={this.props.bearingMeasureEnabled}
                            onClick={this.onBearingClick}
                            tooltip={bearingToolTip} />
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button
                            onClick={this.onResetClick}>
                            {this.props.resetButtonText}
                        </Button>
                    </ButtonGroup>
                </ButtonToolbar>

                <div className="panel-body">
                    <p><span>{this.props.lengthLabel}: </span><span id="measure-len-res"><FormattedNumber key="len" {...decimalFormat} value={this.getFormattedLength(this.props.measurement.len)} /> {this.props.uom.length.label}</span></p>
                    <p><span>{this.props.areaLabel}: </span><span id="measure-area-res"><FormattedNumber key="area" {...decimalFormat} value={this.getFormattedArea(this.props.measurement.area)} /> {this.props.uom.area.label}</span></p>
                    <p><span>{this.props.bearingLabel}: </span><span id="measure-bearing-res">{this.getFormattedBearingValue(this.props.measurement.bearing)}</span></p>
                </div>
            </Panel>
        );
    },
    degToDms: function(deg) {
        // convert decimal deg to minutes and seconds
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat - m) * 60;
        var s = Math.floor(secfloat);

        return ("" + d + "° " + m + "' " + s + "'' ");
    },
    mToft: function(length) {
        return length * 3.28084;
    },
    mTokm: function(length) {
        return length * 0.001;
    },
    mTomi: function(length) {
        return length * 0.000621371;
    },
    sqmTosqft: function(area) {
        return area * 10.7639;
    },
    sqmTosqkm: function(area) {
        return area * 0.000001;
    },
    sqmTosqmi: function(area) {
        return area * 0.000000386102159;
    }
});

module.exports = MeasureComponent;
