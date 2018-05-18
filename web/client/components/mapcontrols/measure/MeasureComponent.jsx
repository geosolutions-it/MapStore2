const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Panel, ButtonGroup, Tooltip, Glyphicon, Button, Grid, Row, Col, FormGroup, Form} = require('react-bootstrap');
const ToggleButton = require('../../buttons/ToggleButton');
const NumberFormat = require('../../I18N/Number');
const Message = require('../../I18N/Message');
const {DropdownList} = require('react-widgets');
const {convertUom, getFormattedBearingValue} = require('../../../utils/MeasureUtils');
const localeUtils = require('../../../utils/LocaleUtils');

const {isEqual, round} = require('lodash');

require('./measure.css');

class MeasureComponent extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        name: PropTypes.string,
        columnProperties: PropTypes.object,
        propertiesChangeHandler: PropTypes.func,
        lengthButtonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        areaButtonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        resetButtonText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        lengthLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        areaLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        bearingLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        uom: PropTypes.shape({
            length: PropTypes.shape({
                unit: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            }),
            area: PropTypes.shape({
                unit: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired
            })
        }),
        toggleMeasure: PropTypes.func,
        measurement: PropTypes.object,
        lineMeasureEnabled: PropTypes.bool,
        areaMeasureEnabled: PropTypes.bool,
        bearingMeasureEnabled: PropTypes.bool,
        showButtons: PropTypes.bool,
        showResults: PropTypes.bool,
        lineGlyph: PropTypes.string,
        areaGlyph: PropTypes.string,
        bearingGlyph: PropTypes.string,
        useButtonGroup: PropTypes.bool,
        withReset: PropTypes.bool,
        showButtonsLabels: PropTypes.bool,
        inlineGlyph: PropTypes.bool,
        formatLength: PropTypes.func,
        formatArea: PropTypes.func,
        formatBearing: PropTypes.func,
        onChangeUom: PropTypes.func,
        uomLengthValues: PropTypes.array,
        uomAreaValues: PropTypes.array
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        columnProperties: {
            xs: 4,
            sm: 4,
            md: 4
        },
        uomLengthValues: [
            {value: "ft", label: "ft"},
            {value: "m", label: "m"},
            {value: "km", label: "km"},
            {value: "mi", label: "mi"},
            {value: "nm", label: "nm"}
        ],
        uomAreaValues: [
            {value: "sqft", label: "ft²"},
            {value: "sqm", label: "m²"},
            {value: "sqkm", label: "km²"},
            {value: "sqmi", label: "mi²"},
            {value: "sqnm", label: "nm²"}
        ],
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
        formatLength: (uom, value) => convertUom(value, "m", uom),
        formatArea: (uom, value) => convertUom(value, "sqm", uom),
        formatBearing: (value) => getFormattedBearingValue(round(value || 0, 6)),
        onChangeUom: () => {}
    };

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    }

    onLineClick = () => {
        this.props.toggleMeasure({
            geomType: 'LineString'
        });
    };

    onAreaClick = () => {
        this.props.toggleMeasure({
            geomType: 'Polygon'
        });
    };

    onBearingClick = () => {
        this.props.toggleMeasure({
            geomType: 'Bearing'
        });
    };

    onResetClick = () => {
        this.props.toggleMeasure({
            geomType: null
        });
    };

    getToolTips = () => {
        return {
            lineToolTip: <Tooltip id={"tooltip-button.line"}>{this.props.lengthLabel}</Tooltip>,
            areaToolTip: <Tooltip id={"tooltip-button.area"}>{this.props.areaLabel}</Tooltip>,
            bearingToolTip: <Tooltip id={"tooltip-button.bearing"}>{this.props.bearingLabel}</Tooltip>
        };
    };

    renderMeasurements = () => {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <div>
                <Form horizontal>
                    <Row>
                        <FormGroup>
                            <Col xs={6}>
                                <span>{this.props.lengthLabel}: </span><span id="measure-len-res">
                                <NumberFormat key="len" numberParams={decimalFormat} value={this.props.formatLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}</span>
                            </Col>
                            <Col xs={6}>
                                <DropdownList
                                    value={this.props.uom.length.label}
                                    onChange={(value) => {
                                        this.props.onChangeUom("length", value, this.props.uom);
                                    }}
                                    data={this.props.uomLengthValues}
                                    textField="label"
                                    valueField="value"
                                    />
                            </Col>
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Col xs={6}>
                                <span>{this.props.areaLabel}: </span><span id="measure-area-res">
                                        <NumberFormat key="area" numberParams={decimalFormat} value={this.props.formatArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}</span>
                            </Col>
                            <Col xs={6}>
                                <DropdownList
                                    value={this.props.uom.area.label}
                                    onChange={(value) => {
                                        this.props.onChangeUom("area", value, this.props.uom);
                                    }}
                                    data={this.props.uomAreaValues}
                                    textField="label"
                                    valueField="value"/>
                            </Col>
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Col xs={6}>
                                <span>{this.props.bearingLabel}: </span>
                                <span id="measure-bearing-res">{this.props.formatBearing(this.props.measurement.bearing || 0)}</span>
                            </Col>
                        </FormGroup>
                    </Row>
                </Form>
            </div>
        );
    };

    renderPanel = () => {
        if (this.props.showResults) {
            return this.renderMeasurements();
        }
        return null;
    };

    renderLabel = (msgId) => {
        if (this.props.showButtonsLabels) {
            return <span className="option-text">{localeUtils.getMessageById(this.context.messages, msgId)}</span>;
        }
    };

    renderText = (glyph, labelId) => {
        if (glyph) {
            return (<span>
                <span className="option-icon"><Glyphicon glyph={glyph}/></span>
                {this.renderLabel(labelId)}
            </span>);
        }
        return this.renderLabel(labelId);
    };

    renderButtons = () => {
        let {lineToolTip, areaToolTip, bearingToolTip} = this.getToolTips();
        return (
                <div>
                    <Form horizontal>
                        <Row>
                        <FormGroup>
                            <Col xs={6}>
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
                            </Col>
                        </FormGroup>
                        </Row>
                    </Form>
                    <Row>
                        <Form horizontal>
                            <FormGroup>
                                <Col xs={12}>
                                    {this.props.withReset ? <ButtonGroup>
                                        <Button
                                            onClick={this.onResetClick}>
                                            {this.props.resetButtonText}
                                        </Button>
                                    </ButtonGroup> : <span/>}
                                </Col>
                            </FormGroup>
                        </Form>
                    </Row>
                </div>
        );
    };

    renderButtonGroup = () => {
        return (
                <ButtonGroup vertical block>
                    {this.renderButtons()}
                </ButtonGroup>
        );
    };

    render() {
        return (
            <Panel id={this.props.id}>
                <Grid fluid>
                {this.props.showButtons && (this.props.useButtonGroup ? this.renderButtonGroup() : this.renderButtons()) }
                {this.renderPanel()}
                </Grid>
            </Panel>
        );
    }
}

module.exports = MeasureComponent;
