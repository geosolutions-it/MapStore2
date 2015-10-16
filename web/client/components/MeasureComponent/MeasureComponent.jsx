/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Grid, Col, Glyphicon, Button, Panel} = require('react-bootstrap');
var ToggleButton = require('../buttons/ToggleButton');
var ReactIntl = require('react-intl');
var FormattedNumber = ReactIntl.FormattedNumber;

let MeasureComponent = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        columnProperties: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        lengthButtonText: React.PropTypes.string,
        areaButtonText: React.PropTypes.string,
        resetButtonText: React.PropTypes.string,
        lengthLabel: React.PropTypes.string,
        areaLabel: React.PropTypes.string,
        bearingLabel: React.PropTypes.string,
        toggleMeasure: React.PropTypes.func,
        measurement: React.PropTypes.object,
        lineMeasureEnabled: React.PropTypes.Boolean,
        areaMeasureEnabled: React.PropTypes.Boolean,
        bearingMeasureEnabled: React.PropTypes.Boolean
    },
    getDefaultProps() {
        return {
            icon: <Glyphicon glyph="minus"/>,
            columnProperties: {
                xs: 4,
                sm: 4,
                md: 4
            }
        };
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
        if (this.props.areaMeasureEnabled === false) {
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
    getFormattedBearingValue(azimuth) {
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
    render() {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <Panel style={{overflow: "hidden", width: "320px"}} >
               <Grid className="MeasureComponent" header={this.props.name} fluid={false} style={{overflow: "auto", width: "100%"}}>
                   <Col {...this.props.columnProperties}>
                       <ToggleButton
                           text={this.props.lengthButtonText}
                           pressed={this.props.lineMeasureEnabled}
                           onClick={this.onLineClick} />
                   </Col>
                   <Col {...this.props.columnProperties}>
                       <ToggleButton
                           text={this.props.areaButtonText}
                           pressed={this.props.areaMeasureEnabled}
                           onClick={this.onAreaClick} />
                   </Col>
                       <ToggleButton
                           text="Bearing"
                           pressed={this.props.bearingMeasureEnabled}
                           onClick={this.onBearingClick} />
               </Grid>
               <Grid style={{"margin-top": "15px"}}>
                   <Col {...this.props.columnProperties}>
                       <p><span>{this.props.lengthLabel}: </span><span><FormattedNumber key="len" {...decimalFormat} value={this.props.measurement.len} /> m</span></p>
                       <p><span>{this.props.areaLabel}: </span><span><FormattedNumber key="area" {...decimalFormat} value={this.props.measurement.area} /> m²</span></p>
                       <p><span>{this.props.bearingLabel}: </span><span>{this.getFormattedBearingValue(this.props.measurement.bearing)}</span></p>
                           <Button
                               onClick={this.onResetClick}>
                               {this.props.resetButtonText}
                           </Button>
                   </Col>
               </Grid>

            </Panel>
        );
    },
    degToDms: function(deg) {
        // convert decimal deg to minutes and seconds
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat - m) * 60;
        var s = Math.round(secfloat);
        // After rounding, the seconds might become 60. These two
        // if-tests are not necessary if no rounding is done.
        if (s === 60) {
            m++;
            s = 0;
        }
        if (m === 60) {
            d++;
            m = 0;
        }
        return ("" + d + "° " + m + "' " + s + "'' ");
    }
});

module.exports = MeasureComponent;
