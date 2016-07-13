/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, ButtonGroup, Tooltip, Glyphicon, Button} = require('react-bootstrap');
const ToggleButton = require('../../buttons/ToggleButton');
const ReactIntl = require('react-intl');
const FormattedNumber = ReactIntl.FormattedNumber;

const lineRuleIcon = require('./img/line-ruler.png');
const areaRuleIcon = require('./img/area-ruler.png');
const bearingRuleIcon = require('./img/bearing-ruler.png');

const measureUtils = require('../../../utils/MeasureUtils');
const localeUtils = require('../../../utils/LocaleUtils');

const {isEqual} = require('lodash');

require('./measure.css');

const MeasureComponent = React.createClass({
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
        bearingMeasureEnabled: React.PropTypes.bool,
        showResults: React.PropTypes.bool,
        lineGlyph: React.PropTypes.string,
        areaGlyph: React.PropTypes.string,
        bearingGlyph: React.PropTypes.string,
        useButtonGroup: React.PropTypes.bool,
        withReset: React.PropTypes.bool
    },
    contextTypes: {
        messages: React.PropTypes.object
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
            },
            showResults: true,
            useButtonGroup: true,
            withReset: false
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
        } else {
            newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false
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
        } else {
            newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false
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
        } else {
            newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false
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
    getToolTips() {
        return {
            lineToolTip: <Tooltip id={"tooltip-button.line"}>{this.props.lengthLabel}</Tooltip>,
            areaToolTip: <Tooltip id={"tooltip-button.area"}>{this.props.areaLabel}</Tooltip>,
            bearingToolTip: <Tooltip id={"tooltip-button.bearing"}>{this.props.bearingLabel}</Tooltip>
        };
    },
    renderMeasurements() {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
               <div className="panel-body">
                    <p><span>{this.props.lengthLabel}: </span><span id="measure-len-res"><FormattedNumber key="len" {...decimalFormat} value={measureUtils.getFormattedLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}</span></p>
                    <p><span>{this.props.areaLabel}: </span><span id="measure-area-res"><FormattedNumber key="area" {...decimalFormat} value={measureUtils.getFormattedArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}</span></p>
                    <p><span>{this.props.bearingLabel}: </span><span id="measure-bearing-res">{measureUtils.getFormattedBearingValue(this.props.measurement.bearing)}</span></p>
                </div>
            );
    },
    renderPanel() {
        if (this.props.showResults) {
            return (this.renderMeasurements());
        }
        return null;
    },
    renderButtons() {
        let {lineToolTip, areaToolTip, bearingToolTip} = this.getToolTips();
        return (
                <div>
                    <ToggleButton
                        text={<span>
                            <span className="option-icon">{this.props.lineGlyph ? <Glyphicon glyph={this.props.lineGlyph}/> : <img src={lineRuleIcon}/>}</span>
                            <span className="option-text">{localeUtils.getMessageById(this.context.messages, "measureComponent.MeasureLength")}</span>
                            </span>}
                        style={{"width": "100%", textAlign: "left"}}
                        pressed={this.props.lineMeasureEnabled}
                        onClick={this.onLineClick}
                        tooltip={lineToolTip} />
                    <ToggleButton
                        text={<span>
                            <span className="option-icon">{this.props.areaGlyph ? <Glyphicon glyph={this.props.areaGlyph}/> : <img src={areaRuleIcon}/>}</span>
                            <span className="option-text">{localeUtils.getMessageById(this.context.messages, "measureComponent.MeasureArea")}</span>
                            </span>}
                        style={{"width": "100%", textAlign: "left"}}
                        pressed={this.props.areaMeasureEnabled}
                        onClick={this.onAreaClick}
                        tooltip={areaToolTip} />
                    <ToggleButton
                        text={<span>
                            <span className="option-icon">{this.props.bearingGlyph ? <Glyphicon glyph={this.props.bearingGlyph}/> : <img src={bearingRuleIcon}/>}</span>
                            <span className="option-text">{localeUtils.getMessageById(this.context.messages, "measureComponent.MeasureBearing")}</span>
                            </span>}
                        style={{"width": "100%", textAlign: "left"}}
                        pressed={this.props.bearingMeasureEnabled}
                        onClick={this.onBearingClick}
                        tooltip={bearingToolTip} />
                    {this.props.withReset ? <ButtonGroup>
                        <Button
                            onClick={this.onResetClick}>
                            {this.props.resetButtonText}
                        </Button>
                    </ButtonGroup> : <span/>}
                </div>
        );
    },
    renderButtonGroup() {
        return (
                <ButtonGroup vertical block>
                    {this.renderButtons()}
                </ButtonGroup>
        );
    },
    render() {
        return (
            <Panel id={this.props.id}>
                {this.props.useButtonGroup ? this.renderButtonGroup() : this.renderButtons() }
                {this.renderPanel()}
            </Panel>
        );
    }
});

module.exports = MeasureComponent;
