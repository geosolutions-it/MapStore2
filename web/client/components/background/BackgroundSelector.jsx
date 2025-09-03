/*
 * Copyright 2017, GeoSolutions Sas.
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
import withTooltip from '../misc/enhancers/tooltip';

const BackgroundDialog = withSuspense()(lazy(() => import('./BackgroundDialog')));
const ButtonWithTooltip = withTooltip(({ children, ...props }) => <button {...props}>{children}</button>);

function ToolbarItem({ onClick = () => {}, tooltipId, glyph, disabled }) {
    return (
        <ButtonWithTooltip onClick={onClick} tooltipId={tooltipId} disabled={disabled}>
            <Glyphicon glyph={glyph} />
        </ButtonWithTooltip>
    );
}

function BackgroundSelector({
    addBackgroundProperties = () => {},
    onBackgroundEdit = () => {},
    backgrounds: backgroundsProp = [],
    style = {},
    allowDeletion = true,
    onRemoveBackground,
    onPropertiesChange = () => {},
    clearModal = () => {},
    projection,
    confirmDeleteBackgroundModal,
    removeBackground = () => {},
    modalParams,
    updateNode = () => {},
    addLayer = () => {},
    backgroundAdded,
    onUpdateThumbnail,
    disableTileGrids,
    backgroundList,
    enableTerrainList,
    alwaysVisible,
    canEdit,
    backgroundToolbarItems = []
}, context) {
    const { messages = {} } = context || {};

    const [open, setOpen] = useState(false);
    const [showTerrainModal, setShowTerrainModal] = useState({
        open: false,
        layer: undefined
    });
    // handlers
    const onToggleLayer =  (layer) => {
        onPropertiesChange(layer.id ?? "ellipsoid", {visibility: true});
    };
    const handleAddEditTerrainLayer = (layerToAdd) => {
        if (showTerrainModal.layer) {
            updateNode(layerToAdd.id, 'layers', layerToAdd);
        } else {
            addLayer(layerToAdd);
            onPropertiesChange(layerToAdd.id, {visibility: true});
        }
    };

    // Get current selected background (the one with visibility: true)
    const getCurrentBackground = () => {
        const visibleBackground = backgroundsProp.find(bg => bg.visibility === true);
        if (visibleBackground) {
            const thumbURL = visibleBackground.thumbURL || thumbs?.[visibleBackground.source]?.[visibleBackground.name] || thumbs.unknown;
            return {
                ...visibleBackground,
                thumbURL
            };
        }
        return backgroundsProp[0];
    };
    const getCurrentTerrainLayer = () => {
        const terrainLayers = backgroundsProp.find(bg => bg.type === 'terrain');
        const visibleTerrain = backgroundsProp.find(bg => bg.type === 'terrain' && bg.visibility === true);
        if (visibleTerrain) return visibleTerrain;
        return terrainLayers?.[0];
    };
    const currentBackground = getCurrentBackground();
    const currentTerrain = getCurrentTerrainLayer();

    const filteredBackgrounds = backgroundsProp.filter(({ type }) => type !== 'terrain');
    const backgrounds = filteredBackgrounds.map((background) => {
        const thumbURL = background.thumbURL || thumbs?.[background.source]?.[background.name] || thumbs.unknown;
        return {
            ...background,
            thumbURL,
            editable: canEdit && ['wms', 'wmts', 'tms', 'tileprovider', 'cog'].includes(background.type),
            deletable: canEdit && allowDeletion && filteredBackgrounds.length > 1
        };
    });
    const terrains = backgroundsProp.filter(({ type }) => type === 'terrain').map(terrain => {
        return {
            ...terrain,
            editable: canEdit && terrain.provider !== 'ellipsoid',
            deletable: canEdit && allowDeletion && terrain.provider !== 'ellipsoid'
        };
    });

    // include the ellipsoidal terrain if missing
    const hasEllipsoidTerrain = terrains.some(terrain => terrain.provider === 'ellipsoid');
    if (!hasEllipsoidTerrain) {
        handleAddEditTerrainLayer({
            type: 'terrain',
            visibility: !currentTerrain,
            title: 'Ellipsoid',
            provider: 'ellipsoid',
            group: "background"
        });
    }

    const {show: showConfirm, layerId: confirmLayerId, layerTitle: confirmLayerTitle} = confirmDeleteBackgroundModal || {show: false};

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

    if (!backgroundsProp.length) {
        return null;
    }

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
                        showThumbnail
                        projection={projection}
                        onToggleLayer={onToggleLayer}
                        editTooltip={"backgroundSelector.editTooltip"}
                        deleteTooltip={"backgroundSelector.deleteTooltip"}
                        onEdit={(layer) => {
                            addBackgroundProperties({
                                layer,
                                editing: true
                            });
                        }}
                        onRemove={(layer) =>onRemoveBackground(true, layer.title || layer.name || '', layer.id)}
                        tools={<>
                            {backgroundToolbarItems.map(({ name, Component }) => <Component key={name} itemComponent={ToolbarItem} canEdit={canEdit} />)}
                        </>}
                    />
                    {terrains.length && enableTerrainList ? <BackgroundLayersList
                        title={getMessageById(messages, "backgroundSelector.terrain.mainTitle")}
                        layers={terrains}
                        projection={projection}
                        onToggleLayer={onToggleLayer}
                        editTooltip={"backgroundSelector.editTerrainTooltip"}
                        deleteTooltip={"backgroundSelector.deleteTerrainTooltip"}
                        onRemove={(layer) =>onRemoveBackground(true, layer.title || layer.name || '', layer.id)}
                        onEdit={(layer) => {
                            setShowTerrainModal({
                                open: true,
                                layer
                            });
                        }}
                        tools={
                            <>
                                {canEdit && <ButtonWithTooltip
                                    tooltipId={"backgroundSelector.addTerrainTooltip"}
                                    onClick={() => setShowTerrainModal({open: true})}>
                                    <Glyphicon glyph="plus" />
                                </ButtonWithTooltip>}
                            </>
                        }
                    /> : null}
                </FlexBox> : null}
                <OverlayTrigger key={"overlay-trigger.changeBackground"} overlay={!open ? tooltip : <></>}>
                    <FlexBox
                        component={Button}
                        onClick={() => {
                            setOpen(!open);
                        }}
                        centerChildren
                        classNames={['ms-background-selector-preview', 'ms-main-colors', 'shadow', 'square-button']}
                    >
                        <img src={currentBackground?.thumbURL} style={{ width: '100%', height: '100%' }} alt={currentBackground?.title || 'Background preview'} />
                    </FlexBox>
                </OverlayTrigger>
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
                    onUpdate={handleAddEditTerrainLayer}
                />}
            </FlexBox>
        </>
    );
}
BackgroundSelector.contextTypes = {
    messages: PropTypes.object
};
export default BackgroundSelector;
