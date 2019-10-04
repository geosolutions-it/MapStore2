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
const wk = require("wellknown");
const ComboField = require("../../data/query/ComboField");

const ComboFieldListItem = require('../../data/query/ComboFieldListItem');
const RoiCql = require("./RoiCql");

const LocaleUtils = require('../../../utils/LocaleUtils');
const SwitchPanel = require('../../misc/switch/SwitchPanel');
const I18N = require('../../I18N/I18N');

class SpatialFilter extends React.Component {
    static propTypes = {
        useMapProjection: PropTypes.bool,
        spatialField: PropTypes.object,
        spatialMethodOptions: PropTypes.array,
        spatialPanelExpanded: PropTypes.bool,
        actions: PropTypes.object,
        zoom: PropTypes.number,
        owner: PropTypes.string,
        features: PropTypes.array,
        wkt: PropTypes.string,
        onError: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        useMapProjection: true,
        spatialField: {},
        spatialPanelExpanded: true,
        spatialOperations: [],
        owner: "queryform",
        features: [],
        actions: {
            onExpandSpatialFilterPanel: () => {},
            onSelectSpatialMethod: () => {},
            onChangeSpatialFilterValue: () => {},
            onChangeDrawingStatus: () => {},
            onRemoveSpatialSelection: () => {}
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
            <div className="container-fluid">
                <Row className="logicHeader filter-field-row filter-field-fixed-row">
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
    renderSpatialPanel = () => {
        const showLabel = this.getMethodFromId(this.props.spatialField.method) && this.props.spatialField.method !== "CQL" && !this.props.spatialField.geometry;
        return (
            <Panel className="spatial-panel">
                {this.props.spatialMethodOptions.length > 1 ? this.renderSpatialHeader() : <span/>}
                { this.props.spatialField.method === "CQL" && (
                    <RoiCql wkt={this.props.wkt} onChangeFilter={this.cqlChanged}/>
                )}
                <Row>
                    <Col xs={12}>
                        {showLabel && (
                            <span>
                                <div className="m-label m-caption text-center">
                                    <I18N.Message msgId={"queryform.spatialfilter.draw_start_label"}/>
                                </div>
                            </span>)
                        }
                    </Col>
                </Row>
            </Panel>
        );
    };
    renderButtons = () => {
        const buttons = [];
        const showReset = this.props.spatialField.geometry && this.props.spatialField.geometry.coordinates;
        if (showReset) {
            buttons.push({
                glyph: 'clear-filter',
                tooltipId: "rulesmanager.remove",
                onClick: () => this.resetSpatialFilter()
            });
        }
        return buttons;
    };
    render() {
        return (
            <div className="query-filter-container">
                <SwitchPanel
                    id="spatialFilterPanel"
                    header={this.renderHeader()}
                    buttons={this.renderButtons()}
                    collapsible
                    expanded={this.props.spatialPanelExpanded}
                    onSwitch={(expanded) => this.props.actions.onExpandSpatialFilterPanel(expanded)}
                >
                    {this.renderSpatialPanel()}
                </SwitchPanel>
            </div>
        );
    }

    updateSpatialMethod = (id, name, value) => {
        const method = this.props.spatialMethodOptions.filter((opt) => {
            return value === (LocaleUtils.getMessageById(this.context.messages, opt.name) || opt.name);
        })[0].id;

        this.props.actions.onSelectSpatialMethod(method, name);
        switch (method) {
        case "CQL":
            break;
        default: {
            this.changeDrawingStatus('start', method, {stopAfterDrawing: true});
        }
        }

    };

    resetSpatialFilter = () => {
        this.changeDrawingStatus('clean', null);
    };
    changeDrawingStatus = (status, method, options) => {
        this.props.actions.onChangeDrawingStatus(
            status,
            method !== undefined ? method : this.props.spatialField.method,
            this.props.owner,
            this.props.features,
            options);
    };
    cqlChanged = (cql) => {
        if (cql.length === 0) {
            this.props.actions.onChangeDrawingStatus(
                "clean",
                "",
                this.props.owner,
                [],
                {});
            return;
        }
        try {
            const geometry = wk.parse(cql);
            if (geometry) {
                this.props.actions.onChangeDrawingStatus(
                    "replace",
                    "",
                    this.props.owner,
                    [geometry],
                    {});
            } else {
                throw new Error();
            }

        } catch (err) {
            this.props.actions.onError({title: "rulesmanager.errorTitle", message: "rulesmanager.errorCQL"});
        }
    }
}

module.exports = SpatialFilter;
