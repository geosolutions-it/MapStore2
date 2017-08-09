const PropTypes = require('prop-types');
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
const ConfirmModal = require('../maps/modals/ConfirmModal');
const LayersTool = require('./fragments/LayersTool');
const SettingsModal = require('./fragments/SettingsModal');
const Message = require('../I18N/Message');

class DefaultLayer extends React.Component {
    static propTypes = {
        node: PropTypes.object,
        settings: PropTypes.object,
        propertiesChangeHandler: PropTypes.func,
        retrieveLayerData: PropTypes.func,
        onToggle: PropTypes.func,
        onContextMenu: PropTypes.func,
        onBrowseData: PropTypes.func,
        onZoom: PropTypes.func,
        onSettings: PropTypes.func,
        onRefresh: PropTypes.func,
        style: PropTypes.object,
        sortableStyle: PropTypes.object,
        hideSettings: PropTypes.func,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        removeNode: PropTypes.func,
        activateLegendTool: PropTypes.bool,
        activateRemoveLayer: PropTypes.bool,
        activateSettingsTool: PropTypes.bool,
        activateQueryTool: PropTypes.bool,
        activateZoomTool: PropTypes.bool,
        activateRefreshTool: PropTypes.bool,
        chartStyle: PropTypes.object,
        settingsText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        opacityText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        elevationText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        saveText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        closeText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        confirmDeleteText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        confirmDeleteMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        modalOptions: PropTypes.object,
        settingsOptions: PropTypes.object,
        visibilityCheckType: PropTypes.string,
        includeDeleteButtonInSettings: PropTypes.bool,
        groups: PropTypes.array,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        additionalTools: PropTypes.array,
        legendOptions: PropTypes.object
    };

    static defaultProps = {
        style: {},
        sortableStyle: {},
        propertiesChangeHandler: () => {},
        onToggle: () => {},
        onContextMenu: () => {},
        onZoom: () => {},
        onSettings: () => {},
        onRefresh: () => {},
        retrieveLayerData: () => {},
        onBrowseData: () => {},
        activateRemoveLayer: false,
        activateLegendTool: false,
        activateSettingsTool: false,
        activateQueryTool: false,
        activateZoomTool: false,
        activateRefreshTool: false,
        includeDeleteButtonInSettings: false,
        modalOptions: {},
        settingsOptions: {},
        confirmDeleteText: <Message msgId="layerProperties.deleteLayer" />,
        confirmDeleteMessage: <Message msgId="layerProperties.deleteLayerMessage" />,
        visibilityCheckType: "glyph",
        additionalTools: []
    };

    state = {
        showDeleteDialog: false
    };

    onConfirmDelete = () => {
        this.props.removeNode(this.props.node.id, "layers", this.props.node);
        this.closeDeleteDialog();
    };

    renderCollapsible = () => {
        let tools = this.props.additionalTools.filter((t) => t.collapsible).map((Tool) => <Tool style={{"float": "right", cursor: "pointer"}}/>);
        if (this.props.activateRemoveLayer) {
            tools.push(<LayersTool
                        node={this.props.node}
                        key="removelayer"
                        className="clayer_removal_button"
                        onClick={this.displayDeleteDialog}
                        tooltip="toc.removeLayer"
                        glyph="1-close"
                        />);
        }
        if (this.props.activateRefreshTool && this.props.node.type === 'wms') {
            tools.push((<LayersTool
                        node={this.props.node}
                        key="refreshlayer"
                        className="clayer_refresh_button"
                        onClick={this.displayRefreshDialog}
                        tooltip="toc.refreshConfirm"
                        glyph="refresh"
                        />));
        }
        tools.push(
            <LayersTool node={this.props.node} key="toolsettings"
                    tooltip="toc.editLayerProperties"
                    glyph="cog"
                    onClick={(node) => this.props.onSettings(node.id, "layers",
                        {opacity: parseFloat(node.opacity !== undefined ? node.opacity : 1)})}/>
        );
        if (this.props.settings && this.props.settings.node === this.props.node.id) {
            tools.push(<SettingsModal
                            node={this.props.node}
                            key="toolsettingsmodal" options={this.props.modalOptions}
                           {...this.props.settingsOptions}
                           retrieveLayerData={this.props.retrieveLayerData}
                           hideSettings={this.props.hideSettings}
                           settings={this.props.settings}
                           element={this.props.node}
                           updateSettings={this.props.updateSettings}
                           updateNode={this.props.updateNode}
                           removeNode={this.props.removeNode}
                           includeDeleteButton={this.props.includeDeleteButtonInSettings}
                           titleText={this.props.settingsText}
                           opacityText={this.props.opacityText}
                           elevationText={this.props.elevationText}
                           chartStyle={this.props.chartStyle}
                           saveText={this.props.saveText}
                           closeText={this.props.closeText}
                           groups={this.props.groups}/>
               );
        }
        if (this.props.activateQueryTool && this.props.node.search) {
            tools.push(
                <LayersTool key="toolquery"
                        tooltip="toc.browseData"
                        className="toc-queryTool"
                        node={this.props.node}
                        ref="target"
                        style={{"float": "right", cursor: "pointer"}}
                        glyph="features-grid"
                        onClick={(node) => this.props.onBrowseData({
                            url: node.search.url || node.url,
                            name: node.name,
                            id: node.id
                        })}/>
                );
        }
        return (<div position="collapsible" className="collapsible-toc">
             <div style={{minHeight: "35px"}}>{tools}</div>
             <div><WMSLegend node={this.props.node} currentZoomLvl={this.props.currentZoomLvl} scales={this.props.scales} {...this.props.legendOptions}/></div>
        </div>);
    };

    renderTools = () => {
        const tools = this.props.additionalTools.filter((t) => !t.collapsible).map((Tool) => <Tool style={{"float": "right", cursor: "pointer"}}/>);
        if (this.props.visibilityCheckType) {
            tools.push(
                <VisibilityCheck key="visibilitycheck"
                   checkType={this.props.visibilityCheckType}
                   propertiesChangeHandler={this.props.propertiesChangeHandler}
                   style={{"float": "right", cursor: "pointer"}}/>
            );
        }
        if (this.props.activateLegendTool) {
            tools.push(
                <LayersTool
                        tooltip="toc.displayLegendAndTools"
                        key="toollegend"
                        className="toc-legendTool"
                        ref="target"
                        style={{"float": "right", cursor: "pointer"}}
                        glyph="1-menu-manage"
                        onClick={(node) => this.props.onToggle(node.id, node.expanded)}/>
                );
        }
        if (this.props.activateZoomTool && this.props.node.bbox && !this.props.node.loadingError) {
            tools.push(
                <LayersTool key="toolzoom"
                        tooltip="toc.zoomToLayerExtent"
                        className="toc-zoomTool"
                        ref="target"
                        style={{"float": "right", cursor: "pointer"}}
                        glyph="zoom-to"
                        onClick={(node) => this.props.onZoom(node.bbox.bounds, node.bbox.crs)}/>
                );
        }
        return tools;
    };

    render() {
        let {children, propertiesChangeHandler, onToggle, ...other } = this.props;
        return (
            <Node className="toc-default-layer" sortableStyle={this.props.sortableStyle} style={this.props.style} type="layer" {...other}>
                <Title onClick={this.props.onToggle} onContextMenu={this.props.onContextMenu}/>
                <LayersTool key="loadingerror"
                        style={{"display": this.props.node.loadingError ? "block" : "none", color: "red", cursor: "default"}}
                        glyph="ban-circle"
                        tooltip="toc.loadingerror"
                        />
                {this.renderCollapsible()}
                {this.renderTools()}
                <InlineSpinner loading={this.props.node.loading}/>
                <ConfirmModal ref="removelayer" show= {this.state.showDeleteDialog} onHide={this.closeDeleteDialog} onClose={this.closeDeleteDialog} onConfirm={this.onConfirmDelete} titleText={this.props.confirmDeleteText} confirmText={this.props.confirmDeleteText} cancelText={<Message msgId="cancel" />} body={this.props.confirmDeleteMessage} />
            </Node>
        );
    }

    closeDeleteDialog = () => {
        this.setState({
            showDeleteDialog: false
        });
    };

    displayDeleteDialog = () => {
        this.setState({
            showDeleteDialog: true
        });
    };

    displayRefreshDialog = () => {
        this.props.onRefresh(this.props.node);
    };
}

module.exports = DefaultLayer;
