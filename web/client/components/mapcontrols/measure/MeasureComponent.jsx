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
const NumberFormat = require('../../I18N/Number');
const Message = require('../../I18N/Message');

const measureUtils = require('../../../utils/MeasureUtils');
const localeUtils = require('../../../utils/LocaleUtils');

const {isEqual, round} = require('lodash');

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
            length: React.PropTypes.shape({
                unit: React.PropTypes.string.isRequired,
                label: React.PropTypes.string.isRequired
            }),
            area: React.PropTypes.shape({
                unit: React.PropTypes.string.isRequired,
                label: React.PropTypes.string.isRequired
            })
        }),
        toggleMeasure: React.PropTypes.func,
        measurement: React.PropTypes.object,
        lineMeasureEnabled: React.PropTypes.bool,
        areaMeasureEnabled: React.PropTypes.bool,
        bearingMeasureEnabled: React.PropTypes.bool,
        showButtons: React.PropTypes.bool,
        showResults: React.PropTypes.bool,
        lineGlyph: React.PropTypes.string,
        areaGlyph: React.PropTypes.string,
        bearingGlyph: React.PropTypes.string,
        useButtonGroup: React.PropTypes.bool,
        withReset: React.PropTypes.bool,
        showButtonsLabels: React.PropTypes.bool,
        inlineGlyph: React.PropTypes.bool,
        formatLength: React.PropTypes.func,
        formatArea: React.PropTypes.func,
        formatBearing: React.PropTypes.func
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
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
            showButtons: true,
            showResults: true,
            useButtonGroup: false,
            withReset: false,
            lineGlyph: "1-measure-lenght",
            areaGlyph: "1-measure-area",
            bearingGlyph: "1-bearing",
            showButtonsLabels: true,
            lengthLabel: <Message msgId="measureComponent.lengthLabel"/>,
            areaLabel: <Message msgId="measureComponent.areaLabel"/>,
            bearingLabel: <Message msgId="measureComponent.bearingLabel"/>,
            formatLength: (uom, value) => measureUtils.getFormattedLength(uom, value),
            formatArea: (uom, value) => measureUtils.getFormattedArea(uom, value),
            formatBearing: (value) => measureUtils.getFormattedBearingValue(round(value || 0, 6))
        };
    },
    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    },
    onLineClick: function() {
        this.props.toggleMeasure({
            geomType: 'LineString'
        });
    },
    onAreaClick: function() {
        this.props.toggleMeasure({
            geomType: 'Polygon'
        });
    },
    onBearingClick: function() {
        this.props.toggleMeasure({
            geomType: 'Bearing'
        });
    },
    onResetClick: function() {
        this.props.toggleMeasure({
            geomType: null
        });
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
                    <p><span>{this.props.lengthLabel}: </span><span id="measure-len-res">
                        <NumberFormat key="len" numberParams={decimalFormat} value={this.props.formatLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}</span></p>
                    <p><span>{this.props.areaLabel}: </span><span id="measure-area-res">
                        <NumberFormat key="area" numberParams={decimalFormat} value={this.props.formatArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}</span></p>
                    <p><span>{this.props.bearingLabel}: </span>
                    <span id="measure-bearing-res">{this.props.formatBearing(this.props.measurement.bearing || 0)}</span></p>
                </div>
            );
    },
    renderPanel() {
        if (this.props.showResults) {
            return (this.renderMeasurements());
        }
        return null;
    },
    renderLabel(msgId) {
        if (this.props.showButtonsLabels) {
            return <span className="option-text">{localeUtils.getMessageById(this.context.messages, msgId)}</span>;
        }
    },
    renderText(glyph, labelId) {
        if (glyph) {
            return (<span>
                <span className="option-icon"><Glyphicon glyph={glyph}/></span>
                {this.renderLabel(labelId)}
            </span>);
        }
        return this.renderLabel(labelId);
    },
    renderButtons() {
        let {lineToolTip, areaToolTip, bearingToolTip} = this.getToolTips();
        return (
                <div>
                    <ToggleButton
                        text={this.renderText(this.props.inlineGlyph && this.props.lineGlyph, "measureComponent.MeasureLength")}
                        glyphicon={!this.props.inlineGlyph && this.props.lineGlyph}
                        style={{"width": "100%", textAlign: "left"}}
                        pressed={this.props.lineMeasureEnabled}
                        onClick={this.onLineClick}
                        tooltip={lineToolTip} />
                    <ToggleButton
                        text={this.renderText(this.props.inlineGlyph && this.props.areaGlyph, "measureComponent.MeasureArea")}
                        glyphicon={!this.props.inlineGlyph && this.props.areaGlyph}
                        style={{"width": "100%", textAlign: "left"}}
                        pressed={this.props.areaMeasureEnabled}
                        onClick={this.onAreaClick}
                        tooltip={areaToolTip} />
                    <ToggleButton
                        text={this.renderText(this.props.inlineGlyph && this.props.bearingGlyph, "measureComponent.MeasureBearing")}
                        glyphicon={!this.props.inlineGlyph && this.props.bearingGlyph}
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
                {this.props.showButtons && (this.props.useButtonGroup ? this.renderButtonGroup() : this.renderButtons()) }
                {this.renderPanel()}
            </Panel>
        );
    }
});

module.exports = MeasureComponent;
