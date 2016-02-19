/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Row, Col, Panel, Glyphicon} = require('react-bootstrap');
const ComboField = require('./ComboField');

const LocaleUtils = require('../../utils/LocaleUtils');
const I18N = require('../I18N/I18N');

const SpatialFilter = React.createClass({
    propTypes: {
        spatialMethodOptions: React.PropTypes.array,
        spatialPanelExpanded: React.PropTypes.bool,
        actions: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            spatialPanelExpanded: true,
            spatialMethodOptions: [
                {id: "zone", name: "queryform.spatialfilter.methods_options.zone"},
                {id: "box", name: "queryform.spatialfilter.methods_options.box"},
                {id: "buffer", name: "queryform.spatialfilter.methods_options.buffer"},
                {id: "circle", name: "queryform.spatialfilter.methods_options.circle"},
                {id: "poly", name: "queryform.spatialfilter.methods_options.poly"}
            ],
            actions: {
                onExpandSpatialFilterPanel: () => {}
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
        return (
            <Row className="logicHeader">
                <Col xs={4}>
                    <div style={{"paddingTop": "9px"}}><I18N.Message msgId={"queryform.spatialfilter.selection_method"}/></div>
                </Col>
                <Col xs={7}>
                    <ComboField
                        fieldOptions={
                            this.props.spatialMethodOptions.map((opt) => {
                                return LocaleUtils.getMessageById(this.context.messages, opt.name);
                            })
                        }
                        fieldName="logic"
                        style={{width: "140px", marginTop: "3px"}}
                        fieldRowId={new Date().getUTCMilliseconds()}
                        onUpdateField={this.updateLogicCombo}/>
                </Col>
            </Row>
        );
    },
    render() {
        return (
            <Panel id="spatialFilterPanel" collapsible expanded={this.props.spatialPanelExpanded} header={this.renderHeader()}>
                <Panel>
                    {this.renderSpatialHeader()}
                </Panel>
            </Panel>
        );
    }
});

module.exports = SpatialFilter;
