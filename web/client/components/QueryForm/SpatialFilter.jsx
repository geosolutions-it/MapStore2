/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Row, Col, Panel, Button, Glyphicon} = require('react-bootstrap');
const ComboField = require('./ComboField');
const GeometryDetails = require('./GeometryDetails');

const LocaleUtils = require('../../utils/LocaleUtils');
const I18N = require('../I18N/I18N');

const SpatialFilter = React.createClass({
    propTypes: {
        useMapProjection: React.PropTypes.bool,
        spatialField: React.PropTypes.object,
        spatialOperations: React.PropTypes.array,
        spatialMethodOptions: React.PropTypes.array,
        spatialPanelExpanded: React.PropTypes.bool,
        showDetailsPanel: React.PropTypes.bool,
        actions: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            useMapProjection: true,
            method: null,
            operation: null,
            spatialPanelExpanded: true,
            showDetailsPanel: false,
            spatialMethodOptions: [
                {id: "BBOX", name: "queryform.spatialfilter.methods.box"},
                {id: "Circle", name: "queryform.spatialfilter.methods.circle"},
                {id: "Polygon", name: "queryform.spatialfilter.methods.poly"}
            ],
            spatialOperations: [
                {id: "INTERSECTS", name: "queryform.spatialfilter.operations.intersects"},
                {id: "BBOX", name: "queryform.spatialfilter.operations.bbox"},
                {id: "CONTAINS", name: "queryform.spatialfilter.operations.contains"},
                {id: "DWITHIN", name: "queryform.spatialfilter.operations.dwithin"},
                {id: "WITHIN", name: "queryform.spatialfilter.operations.within"}
            ],
            actions: {
                onExpandSpatialFilterPanel: () => {},
                onSelectSpatialMethod: () => {},
                onSelectSpatialOperation: () => {},
                onChangeDrawingStatus: () => {},
                onRemoveSpatialSelection: () => {},
                onShowSpatialSelectionDetails: () => {},
                onEndDrawing: () => {}
            }
        };
    },
    renderHeader() {
        const spatialFilterHeader = LocaleUtils.getMessageById(this.context.messages, "queryform.spatialfilter.spatial_filter_header");

        return this.props.spatialPanelExpanded ? (
            <span>
                <span>{spatialFilterHeader}</span>
                <button onClick={this.props.actions.onExpandSpatialFilterPanel.bind(null, false)} className="close">
                    <Glyphicon glyph="glyphicon glyphicon-collapse-down"/>
                </button>
            </span>
        ) : (
            <span>
                <span>{spatialFilterHeader}</span>
                <button onClick={this.props.actions.onExpandSpatialFilterPanel.bind(null, true)} className="close">
                    <Glyphicon glyph="glyphicon glyphicon-expand"/>
                </button>
            </span>
        );
    },
    renderSpatialHeader() {
        const selectedMethod = this.props.spatialMethodOptions.filter((opt) => this.props.spatialField.method === opt.id)[0];

        const methodCombo = (
            <ComboField
                fieldOptions={
                    this.props.spatialMethodOptions.map((opt) => {
                        return LocaleUtils.getMessageById(this.context.messages, opt.name);
                    })
                }
                fieldName="method"
                style={{width: "140px", marginTop: "3px"}}
                fieldRowId={new Date().getUTCMilliseconds()}
                fieldValue={
                    LocaleUtils.getMessageById(this.context.messages, selectedMethod ? selectedMethod.name : "")
                }
                onUpdateField={this.updateSpatialMethod}/>
        );

        const detailsButton = this.props.spatialField.geometry && (this.props.spatialField.method === "BBOX" || this.props.spatialField.method === "Circle") ? (
            <Button id="remove-filter-field" onClick={() => this.props.actions.onShowSpatialSelectionDetails(true)}>
                <I18N.Message msgId={"queryform.spatialfilter.details.detail_button_label"}/>
            </Button>
        ) : (
            <span/>
        );

        const resetButton = this.props.spatialField.geometry ? (
            <Button id="remove-filter-field" onClick={() => this.resetSpatialFilter()}>
                <Glyphicon glyph="glyphicon glyphicon-minus-sign"/>
            </Button>
        ) : (
            <span/>
        );

        const methodSelector = this.props.spatialField.geometry ? (
            <Row className="logicHeader">
                <Col xs={5}>
                    <div style={{"paddingTop": "9px"}}><I18N.Message msgId={"queryform.spatialfilter.selection_method"}/></div>
                </Col>
                <Col xs={3}>
                    {methodCombo}
                </Col>
                <Col xs={2} className="detail_geom_button">
                    {detailsButton}
                </Col>
                <Col xs={2} className="detail_geom_button">
                    {resetButton}
                </Col>
            </Row>
        ) : (
            <Row className="logicHeader">
                <Col xs={5}>
                    <div style={{"paddingTop": "9px"}}><I18N.Message msgId={"queryform.spatialfilter.selection_method"}/></div>
                </Col>
                <Col xs={7}>
                    {methodCombo}
                </Col>
            </Row>
        );

        return (
            methodSelector
        );
    },
    render() {
        const selecteOperation = this.props.spatialOperations.filter((opt) => this.props.spatialField.operation === opt.id)[0];

        let drawLabel = (<span/>);
        if (this.props.spatialField.method) {
            drawLabel = !this.props.spatialField.geometry ? (
                <span>
                    <hr width="100%" style={{"borderTop": "1px solid #337AB7"}}/>
                    <div style={{"textAlign": "center"}}><h4><I18N.Message msgId={"queryform.spatialfilter.draw_start_label"}/></h4></div>
                </span>
            ) : (
                <span/>
            );
        }

        const detailsPanel = this.props.showDetailsPanel ? (
            <GeometryDetails
                useMapProjection={this.props.useMapProjection}
                geometry={this.props.spatialField.geometry}
                type={this.props.spatialField.method}
                onShowPanel={this.props.actions.onShowSpatialSelectionDetails}
                onChangeDrawingStatus={this.changeDrawingStatus}
                onEndDrawing={this.props.actions.onEndDrawing}/>
        ) : (
            <span/>
        );

        return (
            <div>
                <Panel id="spatialFilterPanel" collapsible expanded={this.props.spatialPanelExpanded} header={this.renderHeader()}>
                    <Panel>
                        {this.renderSpatialHeader()}
                        <Panel>
                            <Row>
                                <Col xs={5}>
                                    <div style={{"paddingTop": "9px"}}><I18N.Message msgId={"queryform.spatialfilter.geometric_operation"}/></div>
                                </Col>
                                <Col xs={7}>
                                    <ComboField
                                        fieldOptions={
                                            this.props.spatialOperations.map((opt) => {
                                                return LocaleUtils.getMessageById(this.context.messages, opt.name);
                                            })
                                        }
                                        fieldName="operation"
                                        style={{width: "140px", marginTop: "3px"}}
                                        fieldRowId={new Date().getUTCMilliseconds()}
                                        fieldValue={
                                            LocaleUtils.getMessageById(this.context.messages, selecteOperation ? selecteOperation.name : "")
                                        }
                                        onUpdateField={this.updateSpatialOperation}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    {drawLabel}
                                </Col>
                            </Row>
                        </Panel>
                    </Panel>
                </Panel>
                {detailsPanel}
            </div>
        );
    },
    updateSpatialMethod(id, name, value) {
        this.props.actions.onShowSpatialSelectionDetails(false);

        const method = this.props.spatialMethodOptions.filter((opt) => {
            if (value === LocaleUtils.getMessageById(this.context.messages, opt.name)) {
                return opt;
            }
        })[0].id;

        this.props.actions.onSelectSpatialMethod(method, name);
        this.changeDrawingStatus('start', method, "queryform", []);
    },
    updateSpatialOperation(id, name, value) {
        const opeartion = this.props.spatialOperations.filter((opt) => {
            if (value === LocaleUtils.getMessageById(this.context.messages, opt.name)) {
                return opt;
            }
        })[0].id;

        this.props.actions.onSelectSpatialOperation(opeartion, name);
    },
    resetSpatialFilter() {
        this.changeDrawingStatus('clean', null, "queryform", []);
        this.props.actions.onRemoveSpatialSelection();
        this.props.actions.onShowSpatialSelectionDetails(false);
    },
    changeDrawingStatus(status, method, owner, features) {
        this.props.actions.onChangeDrawingStatus(
            status,
            method !== undefined ? method : this.props.spatialField.method,
            owner,
            features);
    }
});

module.exports = SpatialFilter;
