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
        lenghtButtonText: React.PropTypes.string,
        areaButtonText: React.PropTypes.string,
        resetButtonText: React.PropTypes.string,
        lengthLabel: React.PropTypes.string,
        areaLabel: React.PropTypes.string,
        bearingLabel: React.PropTypes.string,
        measurement: React.PropTypes.object({
            length: React.PropTypes.number,
            area: React.PropTypes.number,
            bearing: React.PropTypes.number
        })
    },
    getDefaultProps() {
        return {
            icon: <Glyphicon glyph="minus"/>,
            columnProperties: {
                xs: 6,
                sm: 4,
                md: 2
            },
            measurement: React.PropTypes.object({
                len: 0,
                area: 0,
                bearing: 0
            })
        };
    },
    render() {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <Panel style={{overflow: "hidden", width: "300px"}} >
               <Grid className="MeasureComponent" header={this.props.name} fluid={false} style={{overflow: "auto", width: "100%"}}>
                   <Col {...this.props.columnProperties}>
                       <ToggleButton
                           text={this.props.lenghtButtonText} />
                   </Col>
                   <Col {...this.props.columnProperties}>
                       <ToggleButton
                           text={this.props.areaButtonText} />
                   </Col>
                   <Col {...this.props.columnProperties}>
                       <Button>{this.props.resetButtonText}</Button>
                   </Col>
               </Grid>
               <Grid style={{"margin-top": "15px"}}>
                   <Col {...this.props.columnProperties}>
                       <p><span>{this.props.lengthLabel}: </span><span><FormattedNumber key="len" {...decimalFormat} value="0" /> km</span></p>
                       <p><span>{this.props.areaLabel}: </span><span><FormattedNumber key="area" {...decimalFormat} value="0" /> km²</span></p>
                       <p><span>{this.props.bearingLabel}: </span><span><FormattedNumber key="bearing" {...decimalFormat} value="0" /> deg</span></p>
                   </Col>
               </Grid>
            </Panel>
        );
    }
});

module.exports = MeasureComponent;
