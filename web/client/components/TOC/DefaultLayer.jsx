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
const LayersTool = require('./fragments/LayersTool');
const SettingsModal = require('./fragments/SettingsModal');

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
        activateLegendTool: React.PropTypes.bool,
        activateSettingsTool: React.PropTypes.bool,
        settingsText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        opacityText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        closeText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        modalOptions: React.PropTypes.object,
        settingsOptions: React.PropTypes.object,
        visibilityCheckType: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            style: {},
            sortableStyle: {},
            propertiesChangeHandler: () => {},
            onToggle: () => {},
            onSettings: () => {},
            activateLegendTool: false,
            activateSettingsTool: false,
            modalOptions: {},
            settingsOptions: {},
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
                               titleText={this.props.settingsText}
                               opacityText={this.props.opacityText}
                               saveText={this.props.saveText}
                               closeText={this.props.closeText}/>
                );
            }
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
                <VisibilityCheck checkType={this.props.visibilityCheckType} propertiesChangeHandler={this.props.propertiesChangeHandler}/>
                <Title onClick={this.props.onToggle}/>
                <InlineSpinner loading={this.props.node.loading}/>
                {this.renderCollapsible()}
                {this.renderTools()}
            </Node>
        );
    }
});

module.exports = DefaultLayer;
