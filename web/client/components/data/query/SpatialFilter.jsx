/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {find} = require('lodash');
const PropTypes = require('prop-types');
const {Row, Col, Panel, Glyphicon} = require('react-bootstrap');

const ComboField = require('./ComboField');
const GeometryDetails = require('./GeometryDetails');

const {AutocompleteWFSCombobox} = require('../../misc/AutocompleteWFSCombobox');
const ComboFieldListItem = require('./ComboFieldListItem');
const {createWFSFetchStream} = require('../../../observables/autocomplete');

const ZoneField = require('./ZoneField');

const LocaleUtils = require('../../../utils/LocaleUtils');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const I18N = require('../../I18N/I18N');
const IntlNumberFormControl = require("../../I18N/IntlNumberFormControl");

class SpatialFilter extends React.Component {
    static propTypes = {
        useMapProjection: PropTypes.bool,
        spatialField: PropTypes.object,
        spatialOperations: PropTypes.array,
        spatialMethodOptions: PropTypes.array,
        spatialPanelExpanded: PropTypes.bool,
        showDetailsPanel: PropTypes.bool,
        withContainer: PropTypes.bool,
        actions: PropTypes.object,
        zoom: PropTypes.number,
        projection: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        useMapProjection: true,
        spatialField: {},
        spatialPanelExpanded: true,
        showDetailsPanel: false,
        withContainer: true,
        spatialMethodOptions: [],
        spatialOperations: [],
        actions: {
            onExpandSpatialFilterPanel: () => {},
            onSelectSpatialMethod: () => {},
            onSelectSpatialOperation: () => {},
            onChangeSpatialFilterValue: () => {},
            onChangeDrawingStatus: () => {},
            onRemoveSpatialSelection: () => {},
            onShowSpatialSelectionDetails: () => {},
            onSelectViewportSpatialMethod: () => {},
            onChangeRegion: () => {},
            onChangeDwithinValue: () => {},
            zoneFilter: () => {},
            zoneSearch: () => {},
            // openMenu: () => {},
            zoneChange: () => {}
            // zoneSelect: () => {}
        }
    };

    getMethodFromId = (id) => {
        return find(this.props.spatialMethodOptions, method => method && method.id === id) || null;
    };
    renderHeader = () => {
        const spatialFilterHeader = LocaleUtils.getMessageById(this.context.messages, "queryform.spatialfilter.spatial_filter_header");

        return (
            <span>
                <span
                    style={{cursor: "pointer"}}
                    onClick={this.props.actions.onExpandSpatialFilterPanel.bind(null, !this.props.spatialPanelExpanded)}>{spatialFilterHeader}</span>
                <button onClick={this.props.actions.onExpandSpatialFilterPanel.bind(null, !this.props.spatialPanelExpanded)} className="close">
                    {this.props.spatialPanelExpanded ? <Glyphicon glyph="glyphicon glyphicon-collapse-down"/> : <Glyphicon glyph="glyphicon glyphicon-expand"/>}
                </button>
            </span>
        );
    };

    renderSpatialHeader = () => {
        const selectedMethod = this.getMethodFromId(this.props.spatialField.method);
        return (
            <div>
                <Row className="logicHeader inline-form filter-field-row filter-field-fixed-row">
                    <Col xs={6}>
                        <div><I18N.Message msgId={"queryform.spatialfilter.filterType"}/></div>
                    </Col>
                    <Col xs={6}>
                        <ComboField
                            itemComponent={(other) =>
                                (<ComboFieldListItem
                                    customItemClassName={this.getMethodFromId(other.item) && this.getMethodFromId(other.item).customItemClassName || ""}
                                    {...other}/>)}
                            fieldOptions={
                                this.props.spatialMethodOptions.map((opt) => {
                                    return LocaleUtils.getMessageById(this.context.messages, opt.name) || opt.name;
                                })
                            }
                            placeholder={LocaleUtils.getMessageById(this.context.messages, "queryform.spatialfilter.combo_placeholder")}
                            fieldName="method"
                            fieldRowId={new Date().getTime()}
                            fieldValue={
                                LocaleUtils.getMessageById(this.context.messages, selectedMethod ? selectedMethod.name : "") || selectedMethod && selectedMethod.name || ""
                            }
                            onUpdateField={this.updateSpatialMethod}/>
                    </Col>
                </Row>
            </div>
        );
    };

    renderDwithin = () => {
        return (<Row className="container-fluid filter-field-fixed-row">
            <Col xs={6} className="filter-text-desc">
                <I18N.Message msgId={"queryform.spatialfilter.dwithin_label"}/>
            </Col>
            <Col xs={6}>
                <IntlNumberFormControl
                    type="number"
                    min="0"
                    defaultValue="0"
                    disabled={!this.props.spatialField.geometry}
                    id={"queryform_dwithin_field"}
                    onChange={(val) => this.props.actions.onChangeDwithinValue(val, name)}/>
            </Col>
        </Row>);
    };
    renderZoneFields = () => {
        return this.props.spatialField.method &&
            this.props.spatialField.method === "ZONE" &&
            this.props.spatialField.zoneFields &&
            this.props.spatialField.zoneFields.length > 0 ?
            this.props.spatialField.zoneFields.map((zone) => {
                return (
                    <ZoneField
                        key={zone.id}
                        open={zone.open}
                        zoneId={zone.id}
                        url={zone.url}
                        typeName={zone.typeName}
                        wfs={zone.wfs}
                        busy={zone.busy}
                        label={zone.label}
                        values={zone.values}
                        value={zone.value}
                        valueField={zone.valueField}
                        textField={zone.textField}
                        searchText={zone.searchText}
                        searchMethod={zone.searchMethod}
                        searchAttribute={zone.searchAttribute}
                        sort={zone.sort}
                        error={zone.error}
                        disabled={zone.disabled}
                        dependsOn={zone.dependson}
                        groupBy={zone.groupBy}
                        multivalue={zone.multivalue}
                        onSearch={this.props.actions.zoneSearch}
                        onFilter={this.props.actions.zoneFilter}
                        // onOpenMenu={this.props.actions.openMenu}
                        // onSelect={this.props.actions.zoneSelect}
                        onChange={this.props.actions.zoneChange}/>
                );
            }) : null;
    };

    renderRoiPanel = () => {
        const selectedMethod = this.getMethodFromId(this.props.spatialField.method);
        const value = selectedMethod
            && selectedMethod.filterProps
            && selectedMethod.filterProps.valueField
            && this.props.spatialField
            && this.props.spatialField.value
            && this.props.spatialField.value[selectedMethod.filterProps.valueField];
        return (<Panel>
            <div className="container-fluid">
                <Row className="filter-field-row filter-field-fixed-row">
                    <Col xs={6}>
                        <span>{selectedMethod && selectedMethod.name || selectedMethod.id}</span>
                    </Col>
                    <Col xs={6}>
                        <AutocompleteWFSCombobox
                            originalValue={value}
                            key={this.props.spatialField.method}
                            options={selectedMethod}
                            autocompleteStreamFactory={createWFSFetchStream}
                            valueField={selectedMethod && selectedMethod.filterProps && selectedMethod.filterProps.valueField}
                            textField={selectedMethod && selectedMethod.filterProps && selectedMethod.filterProps.valueField}
                            url={selectedMethod && selectedMethod.url}
                            filter="contains"
                            onChangeSpatialFilterValue={this.props.actions.onChangeSpatialFilterValue}
                            onChangeDrawingStatus={(...props) => {
                                this.props.actions.onChangeDrawingStatus(...props);
                            }}
                            filterProps={selectedMethod && selectedMethod.filterProps}
                        />
                    </Col>
                </Row>
            </div>
        </Panel>);
    };
    renderSpatialPanel = (operationRow, drawLabel, selectedOperation) => {
        return (
            <Panel className="spatial-panel">
                {this.props.spatialMethodOptions.length > 1 ? this.renderSpatialHeader() : <span/>}
                {this.renderZoneFields()}
                {this.props.spatialField.method
                     && this.getMethodFromId(this.props.spatialField.method)
                     && this.getMethodFromId(this.props.spatialField.method).type === "wfsGeocoder"
                    ? this.renderRoiPanel()
                    : null}
                {this.props.spatialOperations.length > 1 ?
                    <Panel>
                        <div>
                            {operationRow}
                        </div>
                        {selectedOperation && selectedOperation.id === "DWITHIN" ? this.renderDwithin() : null}
                        <Row>
                            <Col xs={12}>
                                {drawLabel}
                            </Col>
                        </Row>
                    </Panel>
                    :
                    <span/>
                }
            </Panel>
        );
    };
    renderButtons = () => {
        const buttons = [];
        const showDetails = this.props.spatialField.geometry
            && (this.props.spatialField.method
                && this.props.spatialField.method === "BBOX"
                || this.props.spatialField.method === "Circle");
        const showReset = this.props.spatialField.geometry && this.props.spatialField.geometry.coordinates;
        if (showDetails) {
            buttons.push({
                glyph: 'pencil',
                onClick: () => this.props.actions.onShowSpatialSelectionDetails(true),
                tooltipId: "queryform.spatialfilter.details.detail_button_label"
            });
        }
        if (showReset) {
            buttons.push({
                glyph: 'clear-filter',
                tooltipId: "queryform.spatialfilter.remove",
                onClick: () => this.resetSpatialFilter()
            });
        }
        return buttons;
    };
    render() {
        const selectedOperation = this.props.spatialOperations.filter((opt) => this.props.spatialField.operation === opt.id)[0];
        let drawLabel = <span/>;
        if (this.props.spatialField.method !== "ZONE"
            && this.props.spatialField.method !== "Viewport"
            && this.getMethodFromId(this.props.spatialField.method)
            && this.getMethodFromId(this.props.spatialField.method).type !== "wfsGeocoder" ) {
            drawLabel = !this.props.spatialField.geometry
                ? (<span><div className="m-label m-caption text-center"><I18N.Message msgId={"queryform.spatialfilter.draw_start_label"}/></div></span>)
                : null;
        }
        const selectedMethod = this.getMethodFromId(this.props.spatialField.method);
        const detailsPanel = this.props.showDetailsPanel ?
            (<GeometryDetails
                useMapProjection={this.props.useMapProjection}
                enableGeodesic={selectedMethod && selectedMethod.geodesic}
                geometry={this.props.spatialField.geometry}
                type={this.props.spatialField.method}
                onShowPanel={this.props.actions.onShowSpatialSelectionDetails}
                onChangeDrawingStatus={this.changeDrawingStatus}
                zoom={this.props.zoom}
                projection={this.props.projection}/>)
            :
            <span/>
        ;

        const operationRow = (<Row className="filter-field-row inline-form filter-field-fixed-row">
            <Col xs={6}>
                <I18N.Message msgId={"queryform.spatialfilter.geometric_operation"}/>
            </Col>
            <Col xs={6}>
                <ComboField
                    fieldOptions={
                        this.props.spatialOperations.map((opt) => {
                            return LocaleUtils.getMessageById(this.context.messages, opt.name);
                        })
                    }
                    fieldName="operation"
                    fieldRowId={new Date().getTime()}
                    fieldValue={
                        LocaleUtils.getMessageById(this.context.messages, selectedOperation ? selectedOperation.name : "")
                    }
                    onUpdateField={this.updateSpatialOperation}/>
            </Col>
        </Row>);

        return (
            <div className="query-filter-container">
                {
                    this.props.withContainer ?
                        <SwitchPanel
                            id="spatialFilterPanel"
                            header={this.renderHeader()}
                            buttons={this.renderButtons()}
                            collapsible
                            expanded={this.props.spatialPanelExpanded}
                            onSwitch={(expanded) => this.props.actions.onExpandSpatialFilterPanel(expanded)}
                        >
                            {this.renderSpatialPanel(operationRow, drawLabel, selectedOperation)}
                        </SwitchPanel>
                        : this.renderSpatialPanel(operationRow, drawLabel, selectedOperation)
                }
                {detailsPanel}
            </div>
        );
    }

    updateSpatialMethod = (id, name, value) => {
        this.props.actions.onShowSpatialSelectionDetails(false);

        const method = this.props.spatialMethodOptions.filter((opt) => {
            return value === (LocaleUtils.getMessageById(this.context.messages, opt.name) || opt.name);
        })[0].id;

        const selectedMethod = this.getMethodFromId(method);
        this.props.actions.onSelectSpatialMethod(method, name);

        if (this.getMethodFromId(method).type !== "wfsGeocoder") {
            switch (method) {
            case "ZONE": {
                this.changeDrawingStatus('clean', '', "queryform", []); break;
            }
            case "Viewport": {
                this.changeDrawingStatus('clean', '', "queryform", []);
                this.props.actions.onSelectViewportSpatialMethod();
                break;
            }
            default: {
                this.changeDrawingStatus('start', method, "queryform", [], {geodesic: selectedMethod && selectedMethod.geodesic, stopAfterDrawing: true});
            }
            }
        } else {
            this.changeDrawingStatus('clean', '', "queryform", []);
        }

    };

    updateSpatialOperation = (id, name, value) => {
        const operation = this.props.spatialOperations.filter((opt) => {
            return value === LocaleUtils.getMessageById(this.context.messages, opt.name);
        })[0].id;

        this.props.actions.onSelectSpatialOperation(operation, name);
    };

    resetSpatialFilter = () => {
        this.changeDrawingStatus('clean', '', "queryform", []);
        this.props.actions.onRemoveSpatialSelection();
        this.props.actions.onShowSpatialSelectionDetails(false);
    };

    changeDrawingStatus = (status, method, owner, features, options) => {
        this.props.actions.onChangeDrawingStatus(
            status,
            method !== undefined ? method : this.props.spatialField.method,
            owner,
            features,
            options);
    };
}

module.exports = SpatialFilter;
