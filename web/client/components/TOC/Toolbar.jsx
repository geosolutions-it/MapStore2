/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Glyphicon, Tooltip } from 'react-bootstrap';
import { head } from 'lodash';
import Proj4js from 'proj4';

import OverlayTrigger from '../misc/OverlayTrigger';
import ConfirmModal from '../maps/modals/ConfirmModal';
import LayerMetadataModal from './fragments/LayerMetadataModal';
import Message from '../I18N/Message';
import Button from '../misc/Button';

class Toolbar extends React.Component {

    static propTypes = {
        groups: PropTypes.array,
        items: PropTypes.array,
        layers: PropTypes.array,
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
        layerdownload: PropTypes.object,
        maxDepth: PropTypes.number,
        metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func])
    };

    static defaultProps = {
        groups: [],
        items: [],
        layers: [],
        selectedLayers: [],
        selectedGroups: [],
        onToolsActions: {
            onZoom: () => {},
            onNewWidget: () => {},
            onBrowseData: () => {},
            onQueryBuilder: () => {},
            onUpdate: () => {},
            onRemove: () => {},
            onClear: () => {},
            onSettings: () => {},
            onUpdateSettings: () => {},
            onRetrieveLayerData: () => {},
            onHideSettings: () => {},
            onReload: () => {},
            onAddLayer: () => {},
            onAddGroup: () => { },
            onDownload: () => {},
            onGetMetadataRecord: () => {},
            onHideLayerMetadata: () => {},
            onShow: () => {},
            onLayerInfo: () => {}
        },
        maxDepth: 3,
        text: {
            settingsText: '',
            opacityText: '',
            elevationText: '',
            saveText: '',
            closeText: '',
            confirmDeleteText: '',
            confirmDeleteMessage: '',
            confirmDeleteConfirmText: '',
            confirmDeleteCancelText: '',
            createWidgetTooltip: '',
            addLayerTooltip: '',
            addLayerToGroupTooltip: '',
            addGroupTooltip: '',
            addSubGroupTooltip: '',
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
                LAYERS: '',
                GROUP: ''
            },
            reloadTooltip: {
                LAYER: '',
                LAYERS: ''
            },
            layerMetadataTooltip: '',
            layerMetadataPanelTitle: '',
            layerFilter: '',
            layerInfoTooltip: ''

        },
        activateTool: {
            activateToolsContainer: true,
            activateRemoveLayer: true,
            activateRemoveGroup: true,
            activateZoomTool: true,
            activateQueryTool: true,
            activateDownloadTool: true,
            activateSettingsTool: true,
            activateAddLayer: true,
            activateAddGroup: true,
            includeDeleteButtonInSettings: false,
            activateMetedataTool: true,
            activateLayerFilterTool: true,
            activateLayerInfoTool: true
        },
        options: {
            modalOptions: {},
            metadataOptions: {},
            settingsOptions: {}
        },
        style: {
            chartStyle: {}
        },
        settings: {},
        layerMetadata: {},
        layerdownload: {},
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
    /**
     * retrieve current status based on selected layers and groups
     * 'DESELECT' no selection
     * 'LAYER' single layer selection
     * 'LAYERS' multiple layer selection
     * 'GROUP' single group selection, it select also children layers
     * 'GROUPS' multiple group selection, it select also children layers
     * 'LAYER_LOAD_ERROR' single layer selection with error
     * 'LAYERS_LOAD_ERROR' multiple layer selection with error, all selected layer have an error
     */
    getStatus = () => {
        const {selectedLayers, selectedGroups} = this.props;
        const isSingleGroup = this.isNestedGroup();
        let status = selectedLayers.length === 0 & selectedGroups.length === 0 ? 'DESELECT' : '';
        status = selectedLayers.length === 1 & selectedGroups.length === 0 ? 'LAYER' : status;
        status = isSingleGroup ? 'GROUP' : status;
        status = selectedLayers.length > 1 & selectedGroups.length === 0 ? 'LAYERS' : status;
        status = selectedGroups.length > 1 && !isSingleGroup ? 'GROUPS' : status;
        status = this.props.selectedLayers.length > 0 && this.props.selectedLayers.filter(l => l.loadingError === 'Error').length === this.props.selectedLayers.length ? `${status}_LOAD_ERROR` : status;
        return status;
    }
    getSelectedGroup = () => {
        return this.props.selectedGroups.length > 0 && this.props.selectedGroups[this.props.selectedGroups.length - 1];
    };
    getSelectedNodeDepth = () => {
        if (this.getStatus() === 'DESELECT') {
            return 0;
        }
        return this.getSelectedGroup().id.split('.').length + 1;
    };
    addLayer = () => {
        const group = this.getSelectedGroup();
        this.props.onToolsActions.onAddLayer(group && group.id);
    };
    addGroup = () => {
        const group = this.getSelectedGroup();
        this.props.onToolsActions.onAddGroup(group && group.id);
    };
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
                {this.props.activateTool.activateLayerInfoTool && status === 'DESELECT' ?
                    <OverlayTrigger
                        key="layerInfo"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-layerInfo">{this.props.text.layerInfoTooltip}</Tooltip>}>
                        <Button key="layerInfo" bsStyle="primary" className="square-button-md" onClick={this.props.onToolsActions.onLayerInfo}>
                            <Glyphicon glyph="layer-info" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateAddLayer && (status === 'DESELECT' || status === 'GROUP') ?
                    <OverlayTrigger
                        key="addLayer"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-addLayer">{status === 'GROUP' ? this.props.text.addLayerToGroupTooltip : this.props.text.addLayerTooltip}</Tooltip>}>
                        <Button key="addLayer" bsStyle="primary" className="square-button-md" onClick={this.addLayer}>
                            <Glyphicon glyph="add-layer" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateAddGroup && (status === 'DESELECT' || status === 'GROUP') && this.getSelectedNodeDepth() <= this.props.maxDepth ?
                    <OverlayTrigger
                        key="addGroup"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-addGroup">{status === 'GROUP' ? this.props.text.addSubGroupTooltip : this.props.text.addGroupTooltip}</Tooltip>}>
                        <Button key="addGroup" bsStyle="primary" className="square-button-md" onClick={this.addGroup}>
                            <Glyphicon glyph="add-folder" />
                        </Button>
                    </OverlayTrigger>
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
                {this.props.activateTool.activateSettingsTool && (status === 'LAYER' || status === 'GROUP' || status === 'LAYER_LOAD_ERROR') && !this.props.layerMetadata.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="settings"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-settings">{this.props.text.settingsTooltip[status === 'LAYER_LOAD_ERROR' ? 'LAYER' : status]}</Tooltip>}>
                        <Button active={this.props.settings.expanded} bsStyle={this.props.settings.expanded ? 'success' : 'primary'} className="square-button-md" onClick={() => { this.showSettings(status); }}>
                            <Glyphicon glyph="wrench"/>
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateLayerFilterTool && (status === 'LAYER' || status === 'LAYER_LOAD_ERROR') && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="queryPanel"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-layerFilter">{this.props.text.layerFilterTooltip}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.props.onToolsActions.onQueryBuilder}>
                            <Glyphicon glyph="filter-layer" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateQueryTool && status === 'LAYER' && this.props.selectedLayers[0].search && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="featuresGrid"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-featuresGrid">{this.props.text.featuresGridTooltip}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.browseData}>
                            <Glyphicon glyph="features-grid" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {(this.props.activateTool.activateRemoveLayer && (status === 'LAYER' || status === 'LAYERS' || status === 'LAYER_LOAD_ERROR' || status === 'LAYERS_LOAD_ERROR') || this.props.activateTool.activateRemoveGroup && (status === 'GROUP' || status === 'GROUPS' || status === 'GROUP_LOAD_ERROR' || status === 'GROUPS_LOAD_ERROR')) && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="removeNode"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-trash">{
                            this.props.selectedGroups.length ? this.props.text.trashTooltip.GROUP : (this.props.text.trashTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER'])
                        }</Tooltip>}>
                        <Button active={this.state.showDeleteDialog} bsStyle={this.props.settings.showDeleteDialog ? 'success' : 'primary'} className="square-button-md" onClick={this.displayDeleteDialog}>
                            <Glyphicon glyph="trash" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {!this.isLoading() && status === 'LAYER_LOAD_ERROR' || status === 'LAYERS_LOAD_ERROR' ?
                    <OverlayTrigger
                        key="reload"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-reload">{this.props.text.reloadTooltip[this.props.selectedLayers.length > 1 ? 'LAYERS' : 'LAYER']}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.reload}>
                            <Glyphicon glyph="refresh" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateWidgetTool && (status === 'LAYER') && this.props.selectedLayers.length === 1 && this.props.selectedLayers[0].search && this.props.selectedLayers[0].search !== 'vector' && !this.props.settings.expanded && !this.props.layerMetadata.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="widgets"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-widgets">{this.props.text.createWidgetTooltip}</Tooltip>}>
                        <Button bsStyle="primary" className="square-button-md" onClick={this.props.onToolsActions.onNewWidget}>
                            <Glyphicon glyph="stats" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateDownloadTool && status === 'LAYER' && (this.props.selectedLayers[0].type === 'wms' || this.props.selectedLayers[0].search) && !this.props.settings.expanded && !this.props.layerMetadata.expanded ?
                    <OverlayTrigger
                        key="downloadTool"
                        placement="top"
                        overlay={<Tooltip id="toc-tooltip-downloadTool">{this.props.text.downloadToolTooltip}</Tooltip>}>
                        <Button bsStyle={this.props.layerdownload.expanded ? "success" : "primary"} className="square-button-md" onClick={this.download}>
                            <Glyphicon glyph="download" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.activateTool.activateMetedataTool && (status === 'LAYER') && !this.props.settings.expanded && !this.props.layerdownload.expanded ?
                    <OverlayTrigger
                        key="layerMetadata"
                        placement="top"
                        overlay={<Tooltip id="legend-tooltip-metadata">{this.props.text.layerMetadataTooltip}</Tooltip>}>
                        <Button key="layer-metadata" bsStyle={this.props.layerMetadata.expanded ? 'success' : 'primary'} className="square-button-md" onClick={() => this.showMetadata()}>
                            <Glyphicon glyph="info-sign" />
                        </Button>
                    </OverlayTrigger>
                    : null}
                {this.props.items
                    .filter(({ selector = () => true }) => selector({ ...this.props, status })) // filter items that should not show
                    .map(({ Component }) => <Component {...this.props} status={status} />)}
                <ConfirmModal
                    ref="removelayer"
                    options={{
                        animation: false,
                        className: "modal-fixed"
                    }}
                    show= {this.state.showDeleteDialog}
                    onHide={this.closeDeleteDialog}
                    onClose={this.closeDeleteDialog}
                    onConfirm={this.removeNodes}
                    titleText={this.props.selectedGroups && this.props.selectedGroups.length ? this.props.text.confirmDeleteLayerGroupText : this.props.text.confirmDeleteText}
                    confirmText={this.props.text.confirmDeleteConfirmText}
                    cancelText={this.props.text.confirmDeleteCancelText}
                    body={this.props.selectedGroups && this.props.selectedGroups.length ? this.props.text.confirmDeleteLayerGroupMessage : this.props.text.confirmDeleteMessage} />
                {layerMetadataModal}
            </ButtonGroup>) : null;
    }

    browseData = () => {
        this.props.onToolsActions.onBrowseData({
            url: this.props.selectedLayers[0].search.url || this.props.selectedLayers[0].url,
            name: this.props.selectedLayers[0].name,
            id: this.props.selectedLayers[0].id
        });
    }

    download = () => {
        this.props.onToolsActions.onDownload({
            url: this.props.selectedLayers[0].search?.url || this.props.selectedLayers[0].url,
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
            if (status === 'LAYER' || status === 'LAYER_LOAD_ERROR') {
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
            this.props.onToolsActions.onGetMetadataRecord(this.props.options.metadataOptions);
        } else {
            this.props.onToolsActions.onHideLayerMetadata();
        }
    }

    removeNodes = () => {
        this.props.selectedLayers.forEach((layer) => {
            this.props.onToolsActions.onRemove(layer.id, 'layers');
        });
        this.props.selectedGroups.forEach((group) => {
            this.props.onToolsActions.onRemove(group.id, 'groups');
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

export default Toolbar;
