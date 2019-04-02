/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const PropTypes = require('prop-types');
const React = require('react');
const {DropdownList} = require('react-widgets');
const {ButtonToolbar, Tooltip, Glyphicon, Grid, Row, Col, FormGroup} = require('react-bootstrap');
const {isEqual, round, get} = require('lodash');

const NumberFormat = require('../../I18N/Number');
const Message = require('../../I18N/Message');
const {convertUom, getFormattedBearingValue} = require('../../../utils/MeasureUtils');
const LocaleUtils = require('../../../utils/LocaleUtils');
const Toolbar = require('../../misc/toolbar/Toolbar');
const BorderLayout = require('../../layout/BorderLayout');
const CoordinatesEditor = require('../annotations/CoordinatesEditor');
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
        withReset: PropTypes.bool,
        showButtonsLabels: PropTypes.bool,
        inlineGlyph: PropTypes.bool,
        formatLength: PropTypes.func,
        formatArea: PropTypes.func,
        formatBearing: PropTypes.func,
        onChangeUom: PropTypes.func,
        uomLengthValues: PropTypes.array,
        uomAreaValues: PropTypes.array,
        format: PropTypes.string,
        onChangeFormat: PropTypes.func,
        onChangeCoordinates: PropTypes.func,
        onHighlightPoint: PropTypes.func,
        geomType: PropTypes.string,
        defaultOptions: PropTypes.object,
        onAddAnnotation: PropTypes.func,
        showAddAsAnnotation: PropTypes.bool,
        onMount: PropTypes.func,
        onUpdateOptions: PropTypes.func,
        showCoordinateEditor: PropTypes.bool,
        isCoordinateEditorEnabled: PropTypes.bool
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
        geomType: "LineString",
        defaultOptions: {
            geomType: "LineString"
        },
        showResults: true,
        showAddAsAnnotation: false,
        showCoordinateEditor: false,
        isCoordinateEditorEnabled: true,
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
        onChangeUom: () => {},
        onChangeFormat: () => {},
        onMount: () => {},
        onUpdateOptions: () => {}
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
        const decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <Grid fluid style={{maxHeight: 400}}>
                    {this.props.lineMeasureEnabled && <Row >
                        <FormGroup style={{display: 'flex', alignItems: 'center'}}>
                        <Col xs={6}>
                            <span>{this.props.lengthLabel}: </span>
                            <span id="measure-len-res" className="measure-value">
                                <h3><strong>
                                    <NumberFormat key="len" numberParams={decimalFormat} value={this.props.formatLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}
                                </strong></h3>
                            </span>
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
                </Row>}
                {this.props.areaMeasureEnabled && <Row>
                    <FormGroup style={{display: 'flex', alignItems: 'center'}}>
                        <Col xs={6}>
                            <span>{this.props.areaLabel}: </span>
                            <span id="measure-area-res" className="measure-value">
                                <h3><strong>
                                    <NumberFormat key="area" numberParams={decimalFormat} value={this.props.formatArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}
                                </strong></h3>
                            </span>
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
                </Row>}
                {this.props.bearingMeasureEnabled && <Row>
                    <FormGroup style={{display: 'flex', alignItems: 'center', minHeight: 34}}>
                        <Col xs={6}>
                            <span>{this.props.bearingLabel}: </span>
                            <span id="measure-bearing-res" className="measure-value"><h3><strong>{this.props.formatBearing(this.props.measurement.bearing || 0)}</strong></h3></span>
                        </Col>
                    </FormGroup>
                </Row>}
            </Grid>
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
            return <span className="option-text">{LocaleUtils.getMessageById(this.context.messages, msgId)}</span>;
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


    render() {
        const geomType = (get(this.props.measurement, 'feature.geometry.type') || '').toLowerCase();
        let coords = (get(this.props.measurement, geomType.indexOf('polygon') !== -1 ? 'feature.geometry.coordinates[0]' : 'feature.geometry.coordinates') || []).map(coordinate => ({lon: coordinate[0], lat: coordinate[1]}));
        return (
           <BorderLayout
               id={this.props.id}
               header={
                   <div>
                       <ButtonToolbar style={{width: '100%', marginBottom: 15, marginTop: 8, display: 'flex', justifyContent: 'center'}}>
                       <Toolbar
                           btnDefaultProps={{
                               className: 'square-button-md',
                               bsStyle: 'primary'
                           }}
                           buttons={
                               [
                                   {
                                       glyph: this.props.lineGlyph,
                                       active: !!this.props.lineMeasureEnabled,
                                       bsStyle: this.props.lineMeasureEnabled ? 'success' : 'primary',
                                       tooltip: this.renderText(this.props.inlineGlyph && this.props.lineGlyph, "measureComponent.MeasureLength"),
                                       onClick: () => this.onLineClick()
                                   },
                                   {
                                       active: !!this.props.areaMeasureEnabled,
                                       bsStyle: this.props.areaMeasureEnabled ? 'success' : 'primary',
                                       glyph: this.props.areaGlyph,
                                       tooltip: this.renderText(this.props.inlineGlyph && this.props.areaGlyph, "measureComponent.MeasureArea"),
                                       onClick: () => this.onAreaClick()
                                   },
                                   {
                                       active: !!this.props.bearingMeasureEnabled,
                                       bsStyle: this.props.bearingMeasureEnabled ? 'success' : 'primary',
                                       glyph: this.props.bearingGlyph,
                                       tooltip: this.renderText(this.props.inlineGlyph && this.props.bearingGlyph, "measureComponent.MeasureBearing"),
                                       onClick: () => this.onBearingClick()
                                   }
                               ]
                           }/>
                           <Toolbar
                           btnDefaultProps={{
                               className: 'square-button-md',
                               bsStyle: 'primary'
                           }}
                           buttons={
                               [
                                   {
                                       glyph: 'refresh',
                                       visible: !!this.props.withReset,
                                       tooltip: this.props.resetButtonText,
                                       onClick: () => this.onResetClick()
                                   },
                                   {
                                       glyph: 'comment',
                                       tooltip: <Message msgId="measureComponent.addAsAnnotation"/>,
                                       onClick: () => this.addAsAnnotation(),
                                       disabled: !!(this.props.measurement.feature && this.props.measurement.feature.properties && this.props.measurement.feature.properties.disabled),
                                       visible: !!(this.props.bearingMeasureEnabled || this.props.areaMeasureEnabled || this.props.lineMeasureEnabled) && this.props.showAddAsAnnotation
                                   }
                               ]
                           }/>
                           </ButtonToolbar>
                       {this.renderPanel()}
                   </div>
               }>
               {this.props.showCoordinateEditor && (<Grid fluid style={{maxHeight: 400, borderTop: '1px solid #ddd'}}>
                {(this.props.bearingMeasureEnabled || this.props.areaMeasureEnabled || this.props.lineMeasureEnabled)
                        ? <Row style={ this.props.isCoordinateEditorEnabled ? {} : {pointerEvents: "none", opacity: 0.5}}>
                        <CoordinatesEditor
                            isMouseEnterEnabled
                            isMouseLeaveEnabled
                            format={this.props.format}
                            onChangeFormat={this.props.onChangeFormat}
                            onHighlightPoint={this.props.onHighlightPoint}
                            onChange={this.props.onChangeCoordinates}
                            items={[]}
                            isDraggable
                            type={this.props.geomType}
                            components={coords}/>
                    </Row> :
                 <Row>
                     <Col xs={12} className="text-center" style={{padding: 15}}>
                         <i><Message msgId="measureComponent.selectTool"/></i>
                     </Col>
                 </Row>}
                </Grid>)}
           </BorderLayout>
       );
    }
    addAsAnnotation = () => {
        let value = this.props.measurement.area || this.props.measurement.len || this.props.measurement.bearing;
        let uom = (this.props.measurement.area && this.props.uom.area.label) ||
        (this.props.measurement.len && this.props.uom.length.label) ||
        (this.props.measurement.bearing && "") || "";
        let measureTool = (this.props.measurement.area && "area") ||
        (this.props.measurement.len && "length") ||
        (this.props.measurement.bearing && "bearing") || "";

        this.props.onAddAnnotation(this.props.measurement.feature, value, uom, measureTool);
    };
}

module.exports = MeasureComponent;
