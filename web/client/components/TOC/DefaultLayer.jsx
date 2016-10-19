/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Node = require('./Node');
var VisibilityCheck = require('./fragments/VisibilityCheck');
var Title = require('./fragments/Title');
var InlineSpinner = require('../misc/spinners/InlineSpinner/InlineSpinner');
var WMSLegend = require('./fragments/WMSLegend');
const ConfirmButton = require('../buttons/ConfirmButton');
const LayersTool = require('./fragments/LayersTool');
const SettingsModal = require('./fragments/SettingsModal');
const Message = require('../I18N/Message');
const {Glyphicon} = require('react-bootstrap');

var DefaultLayer = React.createClass({
    propTypes: {
        node: React.PropTypes.object,
        settings: React.PropTypes.object,
        propertiesChangeHandler: React.PropTypes.func,
        onToggle: React.PropTypes.func,
        onSettings: React.PropTypes.func,
        style: React.PropTypes.object,
        sortableStyle: React.PropTypes.object,
        hideSettings: React.PropTypes.func,
        updateSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        removeNode: React.PropTypes.func,
        activateLegendTool: React.PropTypes.bool,
        activateRemoveLayer: React.PropTypes.bool,
        activateSettingsTool: React.PropTypes.bool,
        settingsText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        opacityText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        closeText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        confirmDeleteText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        modalOptions: React.PropTypes.object,
        settingsOptions: React.PropTypes.object,
        visibilityCheckType: React.PropTypes.string,
        groups: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            style: {},
            sortableStyle: {},
            propertiesChangeHandler: () => {},
            onToggle: () => {},
            onSettings: () => {},
            activateRemoveLayer: false,
            activateLegendTool: false,
            activateSettingsTool: false,
            modalOptions: {},
            settingsOptions: {},
            confirmDeleteText: <Message msgId="layerProperties.confirmDelete" />,
            visibilityCheckType: "glyph"
        };
    },
    renderCollapsible() {
        if (this.props.node && this.props.node.type === 'wms') {
            return <WMSLegend position="collapsible"/>;
        }
        return [];
    },
    renderTools() {
        const tools = [];
        if (this.props.activateRemoveLayer) {
            tools.push(
                <ConfirmButton key="removelayer" className="clayer_removal_button"
                    text={(<Glyphicon glyph="1-close" />)}
                    style={{"float": "right", cursor: "pointer", backgroundColor: "transparent", marginRight: 3, padding: 0, outline: "none"}}
                    confirming={{text: this.props.confirmDeleteText,
                        style: {"float": "right", cursor: "pointer", marginTop: -5}}}
                        onConfirm={() => {
                            this.props.removeNode(this.props.node.id, "layers");
                        }}/>
            );
        }
        if (this.props.activateSettingsTool) {
            tools.push(
                <LayersTool key="toolsettings"
                        style={{"float": "right", cursor: "pointer"}}
                        glyph="cog"
                        onClick={(node) => this.props.onSettings(node.id, "layers",
                            {opacity: parseFloat(node.opacity !== undefined ? node.opacity : 1)})}/>
            );
            if (this.props.settings && this.props.settings.node === this.props.node.id) {
                tools.push(
                    <SettingsModal key="toolsettingsmodal" options={this.props.modalOptions}
                               {...this.props.settingsOptions}
                               hideSettings={this.props.hideSettings}
                               settings={this.props.settings}
                               element={this.props.node}
                               updateSettings={this.props.updateSettings}
                               updateNode={this.props.updateNode}
                               removeNode={this.props.removeNode}
                               titleText={this.props.settingsText}
                               opacityText={this.props.opacityText}
                               saveText={this.props.saveText}
                               closeText={this.props.closeText}
                               groups={this.props.groups}/>
                );
            }
        }
        if (this.props.visibilityCheckType) {
            tools.push(
                <VisibilityCheck key="visibilitycheck"
                   checkType={this.props.visibilityCheckType}
                   propertiesChangeHandler={this.props.propertiesChangeHandler}
                   style={{"float": "right", cursor: "pointer", marginLeft: 0, marginRight: 0}}/>
            );
        }
        if (this.props.activateLegendTool) {
            tools.push(
                <LayersTool key="toollegend"
                        ref="target"
                        style={{"float": "right", cursor: "pointer"}}
                        glyph="list"
                        onClick={(node) => this.props.onToggle(node.id, node.expanded)}/>
                );
        }
        return tools;
    },
    render() {
        let {children, propertiesChangeHandler, onToggle, ...other } = this.props;
        return (
            <Node className="toc-default-layer" sortableStyle={this.props.sortableStyle} style={this.props.style} type="layer" {...other}>
                <Title onClick={this.props.onToggle}/>
                <InlineSpinner loading={this.props.node.loading}/>
                <LayersTool key="loadingerror"
                        style={{"display": this.props.node.loadingError ? "block" : "none", color: "red", cursor: "default"}}
                        glyph="ban-circle"
                        tooltip="toc.loadingerror"
                        />
                {this.renderCollapsible()}
                {this.renderTools()}
            </Node>
        );
    }
});

module.exports = DefaultLayer;
