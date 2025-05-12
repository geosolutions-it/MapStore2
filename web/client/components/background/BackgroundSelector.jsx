/*
showLabel * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, lazy } from 'react';

import ConfirmDialog from '../../components/layout/ConfirmDialog';
import withSuspense from '../misc/withSuspense';
import FlexBox from '../layout/FlexBox';
import Button from '../layout/Button';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import BackgroundLayersList from './BackgroundLayersList';
import thumbs from '../../plugins/background/DefaultThumbs';
import TerrainEditor from './TerrainEditor';
import PropTypes from 'prop-types';
import { getMessageById } from '../../utils/LocaleUtils';
import Message from '../I18N/Message';
import OverlayTrigger from '../misc/OverlayTrigger';
import { assign } from 'lodash';
import withTooltip from '../misc/enhancers/tooltip';

const BackgroundDialog = withSuspense()(lazy(() => import('./BackgroundDialog')));
const ButtonWithTooltip = withTooltip(({ children, ...props }) => <button {...props}>{children}</button>);

function MetadataExplorerAdd({onClickHandler = () => {}, tooltipId = ""}) {
    return (
        <ButtonWithTooltip onClick={onClickHandler} tooltipId={tooltipId}>
            <Glyphicon glyph="plus" />
        </ButtonWithTooltip>
    );
}


function BackgroundSelector({
    mode = 'desktop',
    addBackgroundProperties = () => {},
    onBackgroundEdit = () => {},
    setCurrentBackgroundLayer = () => {},
    source = 'backgroundSelector',
    backgrounds: backgroundsProp = [],
    style = {},
    enabled = false,
    currentLayer = {},
    tempLayer = {},
    allowDeletion = true,
    mapIsEditable = true,
    onRemoveBackground,
    onPropertiesChange = () => {},
    onToggle = () => {},
    onLayerChange = () => {},
    onAdd = () => {},
    clearModal = () => {},
    projection,
    confirmDeleteBackgroundModal,
    removeBackground,
    modalParams,
    updateNode,
    addLayer,
    backgroundAdded,
    onUpdateThumbnail,
    disableTileGrids,
    backgroundList,
    isCesium,
    currentTerrainLayer,
    hasCatalog = true,
    enabledCatalog,
    alwaysVisible,
    dimensions = {}
}, context) {
    const { messages = {} } = context || {};

    const [open, setOpen] = useState(false);
    const [showTerrainModal, setShowTerrainModal] = useState({
        open: false,
        layer: undefined
    });
    // handlers
    const onToggleLayer =  (layer) => {
        onToggle();
        onPropertiesChange(layer.id ?? "ellipsoid", {visibility: true});
        setCurrentBackgroundLayer(layer.id);
    };
    const handleAddEditTerrainLayer = (layerToAdd) => {
        if (showTerrainModal.layer) {
            updateNode(layerToAdd.id, 'layers', layerToAdd);
        } else {
            addLayer(layerToAdd);
            onPropertiesChange(layerToAdd.id ?? "ellipsoid", {visibility: true});
        }
    };

    // if the add logic depends on MetadataExplorer
    // we need to inject this component via items similar as we do for TOC (but in this case for background layer logic)
    const showAddBtnForBgLayer = mode !== 'mobile' && mapIsEditable && hasCatalog && !enabledCatalog;

    const configuredItemsBackgroundTools = [{ name: 'MetadataExplorer', tooltipId: "backgroundSelector.addTooltip", Component: showAddBtnForBgLayer && MetadataExplorerAdd, onClickHandler: () => {
        onAdd(source || 'backgroundSelector');
    }}];

    if (!backgroundsProp.length) {
        return null;
    }
    // backgrounds options
    const backgrounds = backgroundsProp.filter(({ type }) => type !== 'terrain').map((background) => {
        const thumbURL = background.thumbURL || thumbs?.[background.source]?.[background.name] || thumbs.unknown;
        return {
            ...background,
            editable: background.type !== 'empty',
            thumbURL
        };
    });
    // terrain options
    let defaultTerrainOp = {
        type: 'terrain',
        visibility: true,
        title: 'Ellipsoid',
        provider: 'ellipsoid',
        editable: false,
        notDeletable: true,
        group: "background"
    };
    let terrains = [defaultTerrainOp, ...backgroundsProp.filter(({ type }) => type === 'terrain')];
    let isDefaultTerrainNotSelected = terrains.length > 1 && currentTerrainLayer && (currentTerrainLayer.visibility && currentTerrainLayer.provider !== 'ellipsoid');
    if (isDefaultTerrainNotSelected) {
        defaultTerrainOp.visibility = false;
    }

    const {show: showConfirm, layerId: confirmLayerId, layerTitle: confirmLayerTitle} =
    confirmDeleteBackgroundModal || {show: false};

    // for edit background layer
    const editedBGroundLayer = modalParams && modalParams.layer || {};
    const backgroundListEntry = (backgroundList || []).find(background => background.id === editedBGroundLayer.id);
    const getThumb = (layer) => {
        return layer.thumbURL || thumbs[layer.source] && thumbs[layer.source][layer.name] || thumbs.unknown;
    };
    const backgroundDialogParams = {
        title: editedBGroundLayer.title,
        format: editedBGroundLayer.format,
        style: editedBGroundLayer.style,
        additionalParameters: editedBGroundLayer.params,
        credits: editedBGroundLayer?.credits || {},
        thumbnail: {
            data: backgroundListEntry && backgroundListEntry.thumbnail,
            url: getThumb(editedBGroundLayer)
        }
    };
    const tooltip = <Tooltip id="background-selector-tooltip"><Message msgId={"backgroundSwitcher.tooltip"} /></Tooltip>;
    const configuration = assign({
        side: 78,
        sidePreview: 104,
        frame: 3,
        margin: 5,
        label: true,
        vertical: false
    }, dimensions);

    return (
        <>
            <ConfirmDialog
                show={showConfirm}
                onCancel={() => onRemoveBackground(false)}
                onConfirm={() => {
                    removeBackground(confirmLayerId);
                    onRemoveBackground(false);
                }}
                titleId={"backgroundSelector.confirmDelete"}
                titleParams={{title: confirmLayerTitle}}
                variant="danger"
                confirmId="confirm"
                preventHide
                cancelId="cancel">
            </ConfirmDialog>
            {modalParams && <BackgroundDialog
                onClose={clearModal}
                onSave={layerToAdd => {
                    if (modalParams.editing) {
                        updateNode(layerToAdd.id, 'layers', layerToAdd);
                        onBackgroundEdit(layerToAdd.id);
                    } else {
                        addLayer(layerToAdd);
                        backgroundAdded(layerToAdd.id);
                    }

                }}
                updateThumbnail={onUpdateThumbnail}
                projection={projection}
                disableTileGrids={disableTileGrids}
                {...backgroundDialogParams}
                {...modalParams}
            />}
            <FlexBox column gap="xs" classNames={['ms-background-selector', '_absolute', '_corner-bl']} style={style}>
                {open || alwaysVisible ? <FlexBox component="ul" gap="md" column classNames={['ms-background-selector-list', 'ms-main-colors', '_padding-tb-sm', 'shadow']}>
                    <BackgroundLayersList
                        title={"Backgrounds"}
                        layers={backgrounds}
                        onLayerChange={onLayerChange}
                        showThumbnail
                        allowDeletion={mapIsEditable && allowDeletion && backgrounds.length > 1}
                        allowEditing={mapIsEditable && !enabledCatalog}
                        mode={mode}
                        projection={projection}
                        onToggleLayer={onToggleLayer}
                        onEdit={(layer) => {
                            addBackgroundProperties({
                                layer,
                                editing: true
                            });
                        }}
                        onRemove={(layer) =>onRemoveBackground(true, layer.title || layer.name || '', layer.id)}
                        tools={<>
                            {configuredItemsBackgroundTools.map(({ name, Component, onClickHandler, tooltipId }) => Component && <Component key={name} tooltipId={tooltipId} onClickHandler={onClickHandler} />)}
                        </>}
                    />
                    {terrains.length && isCesium ? <BackgroundLayersList
                        title={getMessageById(messages, "backgroundSelector.terrain.mainTitle")}
                        layers={terrains}
                        mode={mode}
                        projection={projection}
                        allowDeletion={mapIsEditable && allowDeletion}
                        allowEditing={mapIsEditable && !enabledCatalog}
                        onToggleLayer={onToggleLayer}
                        onRemove={(layer) =>onRemoveBackground(true, layer.title || layer.name || '', layer.id)}
                        onEdit={(layer) => {
                            setShowTerrainModal({
                                open: true,
                                layer
                            });
                        }}
                        tools={
                            <>
                                {showAddBtnForBgLayer && <ButtonWithTooltip
                                    tooltipId={"backgroundSelector.addTerrainTooltip"}
                                    onClick={() => setShowTerrainModal({open: true})}>
                                    <Glyphicon glyph="plus" />
                                </ButtonWithTooltip>}
                            </>
                        }
                    /> : null}
                </FlexBox> : null}
                <FlexBox
                    component={Button}
                    onClick={() => {
                        onToggle();
                        setOpen(!open);
                    }}
                    centerChildren
                    classNames={['ms-background-selector-preview', 'ms-main-colors', 'shadow', 'square-button']}
                >
                    {!enabled ? <OverlayTrigger placement="top" key={"overlay-trigger.changeBackground"} overlay={tooltip} >
                        <div className="background-preview-button-container bg-body">
                            {configuration.label ? (<div className="background-preview-button-label"><div className="bg-body bg-text">{( enabled ? tempLayer : currentLayer)?.label}</div></div>) : null}
                            <div className="background-preview-button-frame">
                                <img src={( enabled ? tempLayer : currentLayer)?.thumbURL} style={{ width: '100%', height: '100%' }}/>
                            </div>
                        </div>
                    </OverlayTrigger> :
                        <img src={( enabled ? tempLayer : currentLayer)?.thumbURL} style={{ width: '100%', height: '100%' }}/>
                    }
                </FlexBox>
                {showTerrainModal.open && <TerrainEditor
                    terrain
                    isEditing={!!showTerrainModal.layer}
                    layer={showTerrainModal.layer || {}}
                    onHide={()=>{
                        setShowTerrainModal({
                            open: false,
                            layer: undefined
                        });
                    }}
                    handleAddEditTerrainLayer={handleAddEditTerrainLayer}
                />}
            </FlexBox>
        </>
    );
}
BackgroundSelector.contextTypes = {
    messages: PropTypes.object
};
export default BackgroundSelector;
