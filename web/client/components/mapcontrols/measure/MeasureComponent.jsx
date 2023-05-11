/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {dropRight, get, isEqual, round} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {ButtonToolbar, Col, Glyphicon, Grid, Row, Tooltip} from 'react-bootstrap';
import {DropdownList} from 'react-widgets';
import uuidv1 from 'uuid/v1';

import { download } from '../../../utils/FileUtils';
import {getMessageById} from '../../../utils/LocaleUtils';
import {convertMeasuresToGeoJSON} from '../../../utils/MeasurementUtils';
import {convertUom, getFormattedBearingValue} from '../../../utils/MeasureUtils';
import Message from '../../I18N/Message';
import NumberFormat from '../../I18N/Number';
import BorderLayout from '../../layout/BorderLayout';
import Toolbar from '../../misc/toolbar/Toolbar';
import CoordinatesEditor from '../annotations/CoordinatesEditor';
import MeasureToolbar from './MeasureToolbar';

import('./measure.css');

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
        trueBearingLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
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
        lineMeasureValueEnabled: PropTypes.bool,
        areaMeasureEnabled: PropTypes.bool,
        areaMeasureValueEnabled: PropTypes.bool,
        bearingMeasureEnabled: PropTypes.bool,
        bearingMeasureValueEnabled: PropTypes.bool,
        showButtons: PropTypes.bool,
        showResults: PropTypes.bool,
        mapProjection: PropTypes.string,
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
        onChangeCurrentFeature: PropTypes.func,
        onAddAsLayer: PropTypes.func,
        onHighlightPoint: PropTypes.func,
        geomType: PropTypes.string,
        defaultOptions: PropTypes.object,
        onAddAnnotation: PropTypes.func,
        showAddAsAnnotation: PropTypes.bool,
        showLengthAndBearingLabel: PropTypes.bool,
        showAddAsLayer: PropTypes.bool,
        showFeatureSelector: PropTypes.bool,
        useSingleFeature: PropTypes.bool,
        showExportToGeoJSON: PropTypes.bool,
        disableBearing: PropTypes.bool,
        trueBearing: PropTypes.object,
        onMount: PropTypes.func,
        onUpdateOptions: PropTypes.func,
        showCoordinateEditor: PropTypes.bool,
        isCoordinateEditorEnabled: PropTypes.bool,
        onClose: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mapProjection: "EPSG:3857",
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
        showAddAsLayer: true,
        showExportToGeoJSON: true,
        showCoordinateEditor: false,
        isCoordinateEditorEnabled: true,
        showLengthAndBearingLabel: false,
        withReset: true,
        lineGlyph: "1-measure-length",
        areaGlyph: "1-measure-area",
        bearingGlyph: "1-measure-bearing",
        showButtonsLabels: true,
        lengthLabel: <Message msgId="measureComponent.lengthLabel"/>,
        areaLabel: <Message msgId="measureComponent.areaLabel"/>,
        bearingLabel: <Message msgId="measureComponent.bearingLabel"/>,
        trueBearingLabel: <Message msgId="measureComponent.trueBearingLabel"/>,
        formatLength: (uom, value) => convertUom(value, "m", uom),
        formatArea: (uom, value) => convertUom(value, "sqm", uom),
        formatBearing: (value, trueBearing = {}) => getFormattedBearingValue(round(value || 0, 6), trueBearing),
        onChangeUom: () => {},
        onChangeFormat: () => {},
        onMount: () => {},
        onUpdateOptions: () => {},
        onAddAsLayer: () => {}
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (!nextProps.geomType) {
            this.props.toggleMeasure({
                geomType: 'LineString'
            });
        }
    }

    shouldComponentUpdate(nextProps) {
        return !isEqual(nextProps, this.props);
    }

    onGeomClick = (geomType) => {
        this.props.geomType !== geomType && this.props.toggleMeasure({geomType});
    }

    onResetClick = () => {
        this.props.toggleMeasure({
            geomType: null
        });
    };

    getToolTips = () => {
        return {
            lineToolTip: <Tooltip id={"tooltip-button.line"}>{this.props.lengthLabel}</Tooltip>,
            areaToolTip: <Tooltip id={"tooltip-button.area"}>{this.props.areaLabel}</Tooltip>,
            bearingToolTip: <Tooltip id={"tooltip-button.bearing"}>{this.isTrueBearing() ? this.props.trueBearingLabel : this.props.bearingLabel}</Tooltip>
        };
    };

    renderMeasurements = (disabled = false) => {
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 2, minimumFractionDigits: 2};
        return (
            <>
                {this.props.lineMeasureEnabled && <>
                    {this.props.lineMeasureValueEnabled && <>
                        <div>{this.props.lengthLabel}{': '} </div>
                        <div id="measure-len-res" className="measure-value">
                            <NumberFormat key="len" numberParams={decimalFormat} value={this.props.formatLength(this.props.uom.length.unit, this.props.measurement.len)} /> {this.props.uom.length.label}
                        </div>
                    </>}
                    <DropdownList
                        disabled={disabled}
                        value={this.props.uom.length.label}
                        onChange={(value) => {
                            this.props.onChangeUom("length", value, this.props.uom);
                        }}
                        data={this.props.uomLengthValues}
                        textField="label"
                        valueField="value"
                    />
                </>}
                {this.props.areaMeasureEnabled && <>
                    {this.props.areaMeasureValueEnabled && <>
                        <div>{this.props.areaLabel}{': '} </div>
                        <div id="measure-area-res" className="measure-value">
                            <NumberFormat key="area" numberParams={decimalFormat} value={this.props.formatArea(this.props.uom.area.unit, this.props.measurement.area)} /> {this.props.uom.area.label}
                        </div>
                    </>}
                    <DropdownList
                        disabled={disabled}
                        value={this.props.uom.area.label}
                        onChange={(value) => {
                            this.props.onChangeUom("area", value, this.props.uom);
                        }}
                        data={this.props.uomAreaValues}
                        textField="label"
                        valueField="value"/>
                </>}
                {this.props.bearingMeasureEnabled && this.props.bearingMeasureValueEnabled && <>
                    <div>{this.isTrueBearing() ? this.props.trueBearingLabel : this.props.bearingLabel}{': '} </div>
                    <div id="measure-bearing-res" className="measure-value">{this.props.formatBearing((this.props.measurement.bearing || 0), this.isTrueBearing() && this.props.measurement.trueBearing)}</div>
                </>}
            </>
        );
    };

    renderPanel = (disabled) => {
        if (this.props.showResults) {
            return this.renderMeasurements(disabled);
        }
        return null;
    };

    renderLabel = (msgId) => {
        if (this.props.showButtonsLabels) {
            return <span className="option-text">{getMessageById(this.context.messages, msgId)}</span>;
        }
        return null;
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
        let geomType;
        let coords;
        const measureToolEnabled = !!(this.props.bearingMeasureEnabled || this.props.areaMeasureEnabled || this.props.lineMeasureEnabled);
        const features = get(this.props.measurement, 'features', []);
        const feature = features[this.props.measurement.currentFeature || 0];
        const isFeatureInvalid = feature?.properties?.disabled || false;
        const toolbarDisabled = (this.props.measurement.features || []).length === 0 || isFeatureInvalid;
        if (this.props.useSingleFeature) {
            geomType = (get(this.props.measurement, 'feature.geometry.type') || '').toLowerCase();
            coords = (get(this.props.measurement, geomType.indexOf('polygon') !== -1 ? 'feature.geometry.coordinates[0]' : 'feature.geometry.coordinates') || []).map(coordinate => ({lon: coordinate[0], lat: coordinate[1]}));
        } else {
            geomType = get(feature, 'geometry.type', '').toLowerCase();
            coords = (get(feature, geomType.indexOf('polygon') !== -1 ? 'geometry.coordinates[0]' : 'geometry.coordinates') || []).map(coordinate => ({lon: coordinate[0], lat: coordinate[1]}));
        }

        const {exportToAnnotation = false} = this.props.measurement || {};

        return (
            <BorderLayout
                id={this.props.id}
                style={{
                    overflow: 'visible',
                    // the measure component needs to cover the surface of the container
                    // only if it has the coordinates editor enabled
                    ...(!this.props.showCoordinateEditor && {
                        display: 'block',
                        width: 'auto',
                        height: 'auto'
                    })
                }}
                header={
                    <MeasureToolbar
                        info={this.renderPanel(isFeatureInvalid)}
                        onClose={this.props.onClose}
                    >
                        <ButtonToolbar>
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
                                            onClick: () => this.onGeomClick('LineString'),
                                            disabled: !this.props.lineMeasureEnabled && isFeatureInvalid
                                        },
                                        {
                                            active: !!this.props.areaMeasureEnabled,
                                            bsStyle: this.props.areaMeasureEnabled ? 'success' : 'primary',
                                            glyph: this.props.areaGlyph,
                                            tooltip: this.renderText(this.props.inlineGlyph && this.props.areaGlyph, "measureComponent.MeasureArea"),
                                            onClick: () => this.onGeomClick('Polygon'),
                                            disabled: !this.props.areaMeasureEnabled && isFeatureInvalid
                                        },
                                        {
                                            visible: !this.props.disableBearing,
                                            active: !!this.props.bearingMeasureEnabled,
                                            bsStyle: this.props.bearingMeasureEnabled ? 'success' : 'primary',
                                            glyph: this.props.bearingGlyph,
                                            tooltip: this.renderText(this.props.inlineGlyph && this.props.bearingGlyph, this.isTrueBearing() ? "measureComponent.MeasureTrueBearing" : "measureComponent.MeasureBearing"),
                                            onClick: () => this.onGeomClick('Bearing'),
                                            disabled: !this.props.bearingMeasureEnabled && isFeatureInvalid
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
                                            glyph: 'trash',
                                            visible: !!this.props.withReset,
                                            tooltip: <Message msgId="measureComponent.resetTooltip"/>,
                                            onClick: () => this.onResetClick()
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
                                            glyph: 'ext-json',
                                            disabled: !measureToolEnabled || toolbarDisabled,
                                            visible: this.props.showExportToGeoJSON,
                                            tooltip: <Message msgId="measureComponent.exportToGeoJSON"/>,
                                            onClick: () => {
                                                download(JSON.stringify(convertMeasuresToGeoJSON(
                                                    this.props.measurement.features,
                                                    this.props.measurement.textLabels,
                                                    this.props.uom,
                                                    uuidv1(),
                                                    'MapStore Measurements'
                                                )), 'measurements.json', 'application/geo+json');
                                            }
                                        },
                                        {
                                            glyph: 'add-layer',
                                            visible: this.props.showAddAsLayer,
                                            disabled: !measureToolEnabled || toolbarDisabled || exportToAnnotation,
                                            tooltip: <Message msgId="measureComponent.addAsLayer"/>,
                                            onClick: () => this.props.onAddAsLayer(
                                                this.props.measurement.features,
                                                this.props.measurement.textLabels,
                                                this.props.uom
                                            )
                                        },
                                        {
                                            glyph: exportToAnnotation ? 'floppy-disk' : 'comment',
                                            tooltip: <Message msgId={exportToAnnotation ? "measureComponent.saveMeasure" : "measureComponent.addAsAnnotation"}/>,
                                            onClick: () => {
                                                this.props.onAddAnnotation(
                                                    this.props.measurement.features,
                                                    this.props.measurement.textLabels,
                                                    this.props.uom,
                                                    !exportToAnnotation,
                                                    {
                                                        id: this.props.measurement.id,
                                                        visibility: this.props.measurement.visibility
                                                    }
                                                );
                                            },
                                            disabled: !measureToolEnabled || toolbarDisabled,
                                            visible: this.props.showAddAsAnnotation
                                        }
                                    ]
                                }/>
                        </ButtonToolbar>
                    </MeasureToolbar>
                }>
                {this.props.showCoordinateEditor && (<Grid fluid style={{maxHeight: 400, borderTop: '1px solid #ddd'}}>
                    {(this.props.bearingMeasureEnabled || this.props.areaMeasureEnabled || this.props.lineMeasureEnabled)
                        ? <Row style={ this.props.isCoordinateEditorEnabled ? {} : {pointerEvents: "none", opacity: 0.5}}>
                            <CoordinatesEditor
                                key="measureEditor"
                                isMouseEnterEnabled
                                isMouseLeaveEnabled
                                format={this.props.format}
                                currentFeature={this.props.measurement.currentFeature}
                                features={this.props.measurement.features}
                                mapProjection={this.props.mapProjection}
                                onChangeFormat={this.props.onChangeFormat}
                                onHighlightPoint={this.props.onHighlightPoint}
                                onChange={this.props.onChangeCoordinates}
                                onChangeCurrentFeature={this.props.onChangeCurrentFeature}
                                showFeatureSelector={this.props.showFeatureSelector}
                                items={[]}
                                isDraggable
                                type={this.props.geomType}
                                showLengthAndBearingLabel={this.props.showLengthAndBearingLabel}
                                components={!this.props.useSingleFeature && geomType.indexOf('polygon') !== -1 ? dropRight(coords) : coords}
                                properties={feature?.properties || {}}
                            />
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

    isTrueBearing = () =>{
        return this.props.measurement && this.props.measurement.trueBearing && this.props.measurement.trueBearing.measureTrueBearing;
    }
}

export default MeasureComponent;
