/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {ButtonGroup, Button, Glyphicon, Tooltip} = require('react-bootstrap');
const OverlayTrigger = require('../misc/OverlayTrigger');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const {head} = require('lodash');
const ConfirmModal = require('../maps/modals/ConfirmModal');
const LayerMetadataModal = require('./fragments/LayerMetadataModal');
const Proj4js = require('proj4').default;
const Message = require('../I18N/Message');

class Toolbar extends React.Component {

    static propTypes = {
        groups: PropTypes.array,
        selectedLayers: PropTypes.array,
        generalInfoFormat: PropTypes.string,
        selectedGroups: PropTypes.array,
        onToolsActions: PropTypes.object,
        text: PropTypes.object,
        activateTool: PropTypes.object,
        options: PropTypes.object,
        style: PropTypes.object,
        settings: PropTypes.object,
        layerMetadata: PropTypes.object,
        wfsdownload: PropTypes.object,
        metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func])
    };

    static defaultProps = {
        groups: [],
        selectedLayers: [],
        selectedGroups: [],
        onToolsActions: {
            onZoom: () => {},
            onNewWidget: () => {},
            onBrowseData: () => {},
            onUpdate: () => {},
            onRemove: () => {},
            onClear: () => {},
            onSettings: () => {},
            onUpdateSettings: () => {},
            onRetrieveLayerData: () => {},
            onHideSettings: () => {},
            onReload: () => {},
            onAddLayer: () => {},
            onDownload: () => {},
            onGetMetadataRecord: () => {},
            onHideLayerMetadata: () => {},
            onShow: () => {}
        },
        text: {
            settingsText: '',
            opacityText: '',
            elevationText: '',
            saveText: '',
            closeText: '',
            confirmDeleteText: '',
            confirmDeleteMessage: '',
            confirmDeleteCancelText: '',
            createWidgetTooltip: '',
            zoomToTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            settingsTooltip: {
                LAYER: '',
                GROUP: ''
            },
            featuresGridTooltip: '',
            downloadToolTooltip: '',
            trashTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            reloadTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            layerMetadataTooltip: '',
            layerMetadataPanelTitle: ''
        },
        activateTool: {
            activateToolsContainer: true,
            activateRemoveLayer: true,
            activateZoomTool: true,
            activateQueryTool: true,
            activateDownloadTool: true,
            activateSettingsTool: true,
            activateAddLayer: true,
            includeDeleteButtonInSettings: false,
            activateMetedataTool: true
        },
        options: {
            modalOptions: {},
            settingsOptions: {}
        },
        style: {
            chartStyle: {}
        },
        settings: {},
        layerMetadata: {},
        wfsdownload: {},
        metadataTemplate: null
    };

    state = {
        showDeleteDialog: false
    };

    isNestedGroup = () => {
        const splitIdGroups = this.props.selectedGroups.map(g => g.id.split('.'));
        return head(splitIdGroups.reduce((a, b) => a[0] === b[0] ? b : [false], splitIdGroups[0]));
    }

    isLoading = () => {
        return head(this.props.selectedLayers.filter(l => l.loading));
    }

    getStatus = () => {
        const {selectedLayers, selectedGroups} = this.props;
        const isSingleGroup = this.isNestedGroup();
        let status = selectedLayers.length === 0 & selectedGroups.length === 0 ? 'DESELECT' : '';
        status = selectedLayers.length === 1 & selectedGroups.length === 0 ? 'LAYER' : status;
        status = isSingleGroup ? 'GROUP' : status;
        status = selectedLayers.length > 1 & selectedGroups.length === 0 ? 'LAYERS' : status;
        status = selectedGroups.length > 1 && !isSingleGroup ? 'GROUPS' : status;
        status = this.props.selectedLayers.length > 0 && this.props.selectedLayers.filter(l => l.loadingError === 'Error').length === this.props.selectedLayers.length ? 'LAYERS_LOAD_ERROR' : status;
        return status;
    }

    render() {
        const status = this.getStatus();
        const currentEPSG = this.checkBbox();
        const epsgIsSupported = currentEPSG && Proj4js.defs(currentEPSG);

        const layerMetadataModal = (<LayerMetadataModal
                                key="toollayermetadatamodal"
                                layerMetadata={this.props.layerMetadata}
                                metadataTemplate={this.props.metadataTemplate}
                                hideLayerMetadata={this.props.onToolsActions.onHideLayerMetadata}
                                layerMetadataPanelTitle={this.props.text.layerMetadataPanelTitle} />);
        return this.props.activateTool.activateToolsContainer ? (
        <ButtonGroup>
            <ReactCSSTransitionGroup
                transitionName="toc-toolbar-btn-transition"
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}>
                {this.props.activateTool.activateAddLayer && status === 'DESELECT' ?
                    <Button key="addLayer" bsStyle="primary" bsSize="small" onClick={this.props.onToolsActions.onAddLayer}>
                        {this.props.text.addLayer}
                    </Button>
                : null}
                {this.props.activateTool.activateZoomTool && (status === 'LAYER' || status === 'GROUP' || status === 'LAYERS' || status === 'GROUPS') && currentEPSG ?
                    <OverlayTrigger
                        key="zoomTo"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-zoomTo">{
                            epsgIsSupported ? this.props.text.zoomToTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER']
                            : <Message msgId="toc.epsgNotSupported" msgParams={{epsg: currentEPSG || ' '}}/>
                        }</Tooltip>}>
                        <Button
                            bsStyle="primary"
                            className="square-button-md"
                            style={epsgIsSupported ? {opacity: 1.0, cursor: 'pointer'} : {opacity: 0.5, cursor: 'default'}}
                            onClick={epsgIsSupported ? this.zoomTo : () => {}}>
                            <Glyphicon glyph="zoom-to" />
                        </Button>
                    </OverlayTrigger>
                : null}
                    {this.props.activateTool.activateSettingsTool && (status === 'LAYER' || status === 'GROUP') && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded ?
                    <OverlayTrigger
                        key="settings"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-settings">{this.props.text.settingsTooltip[status]}</Tooltip>}>
                        <Button active={this.props.settings.expanded} bsStyle={this.props.settings.expanded ? 'success' : 'primary'} className="square-button-md" onClick={() => { this.showSettings(status); }}>
                            <Glyphicon glyph="wrench"/>
                        </Button>
                    </OverlayTrigger>
                : null}
                    {this.props.activateTool.activateQueryTool && status === 'LAYER' && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded ?
                    <OverlayTrigger
                        key="featuresGrid"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-featuresGrid">{this.props.text.featuresGridTooltip}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.brosweData}>
                            <Glyphicon glyph="features-grid" />
                        </Button>
                    </OverlayTrigger>
                : null}
                    {this.props.activateTool.activateRemoveLayer && (status === 'LAYER' || status === 'GROUP' || status === 'LAYERS' || status === 'GROUPS' || status === 'LAYERS_LOAD_ERROR') && this.props.selectedLayers.length > 0 && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded ?
                    <OverlayTrigger
                        key="removeNode"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-trash">{this.props.text.trashTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER']}</Tooltip>}>
                        <Button active={this.state.showDeleteDialog} bsStyle={this.props.settings.showDeleteDialog ? 'success' : 'primary'} className="square-button-md" onClick={this.displayDeleteDialog}>
                            <Glyphicon glyph="trash" />
                        </Button>
                    </OverlayTrigger>
                : null}
                {!this.isLoading() && status === 'LAYERS_LOAD_ERROR' ?
                    <OverlayTrigger
                        key="reload"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-reload">{this.props.text.reloadTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER']}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.reload}>
                            <Glyphicon glyph="refresh" />
                        </Button>
                    </OverlayTrigger>
                : null}
                    {this.props.activateTool.activateWidgetTool && (status === 'LAYER') && this.props.selectedLayers.length === 1 && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.wfsdownload.expanded ?
                    <OverlayTrigger
                        key="widgets"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-widgets">{this.props.text.createWidgetTooltip}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.props.onToolsActions.onNewWidget}>
                            <Glyphicon glyph="stats" />
                        </Button>
                    </OverlayTrigger>
                : null}
                {this.props.activateTool.activateDownloadTool && status === 'LAYER' && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded ?
                    <OverlayTrigger
                        key="downloadTool"
                        placement="top"
                            overlay={<Tooltip id="toc-tooltip-downloadTool">{this.props.text.downloadToolTooltip}</Tooltip>}>
                            <Button bsStyle={this.props.wfsdownload.expanded ? "success" : "primary"} className="square-button-md" onClick={this.download}>
                            <Glyphicon glyph="download" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                    {this.props.activateTool.activateMetedataTool && (status === 'LAYER') && this.props.selectedLayers[0].catalogURL && !this.props.settings.expanded && !this.props.wfsdownload.expanded ?
                    <OverlayTrigger
                        key="layerMetadata"
                        placement="top"
                        overlay={<Tooltip id="legend-tooltip-metadata">{this.props.text.layerMetadataTooltip}</Tooltip>}>
                        <Button key="layer-metadata" bsStyle={this.props.layerMetadata.expanded ? 'success' : 'primary'} className="square-button-md" onClick={() => this.showMetadata()}>
                            <Glyphicon glyph="info-sign" />
                        </Button>
                    </OverlayTrigger>
                : null}
            </ReactCSSTransitionGroup>
            <ConfirmModal
                ref="removelayer"
                show= {this.state.showDeleteDialog}
                onHide={this.closeDeleteDialog}
                onClose={this.closeDeleteDialog}
                onConfirm={this.removeNodes}
                titleText={this.props.text.confirmDeleteText}
                confirmText={this.props.text.confirmDeleteText}
                cancelText={this.props.text.confirmDeleteCancelText}
                body={this.props.text.confirmDeleteMessage} />
            {layerMetadataModal}
        </ButtonGroup>) : null;
    }

    brosweData = () => {
        this.props.onToolsActions.onBrowseData({
            url: this.props.selectedLayers[0].search.url || this.props.selectedLayers[0].url,
            name: this.props.selectedLayers[0].name,
            id: this.props.selectedLayers[0].id
        });
    }

    download = () => {
        this.props.onToolsActions.onDownload({
            url: this.props.selectedLayers[0].search.url || this.props.selectedLayers[0].url,
            name: this.props.selectedLayers[0].name,
            id: this.props.selectedLayers[0].id
        });
    }

    checkBbox = () => {
        const layersBbox = this.props.selectedLayers.filter(l => l.bbox).map(l => l.bbox);
        const uniqueCRS = layersBbox.length > 0 ? layersBbox.reduce((a, b) => a.crs === b.crs ? a : {crs: 'differentCRS'}) : {crs: 'differentCRS'};
        return !!head(layersBbox) && uniqueCRS.crs !== 'differentCRS' && uniqueCRS.crs;
    }

    zoomTo = () => {
        const layersBbox = this.props.selectedLayers.filter(l => l.bbox).map(l => l.bbox);
        const bbox = layersBbox.length > 1 ? layersBbox.reduce((a, b) => {
            return {
                bounds: {
                    maxx: a.bounds.maxx > b.bounds.maxx ? a.bounds.maxx : b.bounds.maxx,
                    maxy: a.bounds.maxy > b.bounds.maxy ? a.bounds.maxy : b.bounds.maxy,
                    minx: a.bounds.minx < b.bounds.minx ? a.bounds.minx : b.bounds.minx,
                    miny: a.bounds.miny < b.bounds.miny ? a.bounds.miny : b.bounds.miny
                }, crs: b.crs};
        }, layersBbox[0]) : layersBbox[0];
        this.props.onToolsActions.onZoom(bbox.bounds, bbox.crs);
    }

    showSettings = (status) => {
        if (!this.props.settings.expanded) {
            if (status === 'LAYER') {
                this.props.onToolsActions.onSettings( this.props.selectedLayers[0].id, 'layers', {opacity: parseFloat(this.props.selectedLayers[0].opacity !== undefined ? this.props.selectedLayers[0].opacity : 1)});
            } else if (status === 'GROUP') {
                this.props.onToolsActions.onSettings(this.props.selectedGroups[this.props.selectedGroups.length - 1].id, 'groups', {});
            }
        } else {
            this.props.onToolsActions.onHideSettings();
        }
    }

    showMetadata = () => {
        if (!this.props.layerMetadata.expanded) {
            this.props.onToolsActions.onGetMetadataRecord();
        } else {
            this.props.onToolsActions.onHideLayerMetadata();
        }
    }

    removeNodes = () => {
        this.props.selectedLayers.forEach((layer) => {
            this.props.onToolsActions.onRemove(layer.id, 'layers', layer);
        });
        this.props.onToolsActions.onClear();
        this.closeDeleteDialog();
    }

    reload = () => {
        this.props.selectedLayers.forEach((layer) => {
            this.props.onToolsActions.onShow(layer.id, {visibility: true});
            this.props.onToolsActions.onReload(layer.id);
        });
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

}

module.exports = Toolbar;
