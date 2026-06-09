/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Alert } from 'react-bootstrap';
import DescriptionSection from './settings/DescriptionSection';
import PositionsSection from './settings/PositionsSection';
import AnimationSection from './settings/AnimationSection';
import MaskSection from './settings/MaskSection';
import GlobeTranslucencySection from './settings/GlobeTranslucencySection';
import LayersSection from './settings/LayersSection';
import { getResourceFromLayer } from '../../api/MapViews';
import { ViewSettingsTypes } from '../../utils/MapViewsUtils';
import Message from '../I18N/Message';
import useBatchedUpdates from '../../hooks/useBatchedUpdates';

const sections = {
    [ViewSettingsTypes.DESCRIPTION]: DescriptionSection,
    [ViewSettingsTypes.POSITION]: PositionsSection,
    [ViewSettingsTypes.ANIMATION]: AnimationSection,
    [ViewSettingsTypes.MASK]: MaskSection,
    [ViewSettingsTypes.GLOBE_TRANSLUCENCY]: GlobeTranslucencySection,
    [ViewSettingsTypes.LAYERS_OPTIONS]: LayersSection
};

function ViewSettings({
    view,
    api,
    layers = [],
    groups = [],
    onChange,
    onUpdateResource = () => { },
    onCaptureView,
    locale,
    resources = [],
    expandedSections = {},
    onExpandSection = () => {},
    showClipGeometries,
    onShowClipGeometries = () => {}
}) {

    const availableVectorLayers = layers
        .filter(({ type, features }) => {
            if (type === 'wfs') {
                return true;
            }
            if (type === 'vector') {
                return !!features?.find(({ geometry }) => ['Polygon', 'MultiPolygon'].includes(geometry?.type));
            }
            return false;
        });

    /**
     * Custom batching logic for layers and groups.
     * Accumulates changes in an object with separate keys for layers and groups,
     * then applies them all at once to prevent race conditions.
     */
    const [batchedUpdate] = useBatchedUpdates(
        (changes) => {
            const updatedView = { ...view };
            const { layers: layerChanges = {}, groups: groupChanges = {} } = changes;

            // Apply layer changes
            if (Object.keys(layerChanges).length > 0) {
                const updatedLayers = [...(view?.layers || [])];
                Object.entries(layerChanges).forEach(([layerId, layerOptions]) => {
                    const layerIndex = updatedLayers.findIndex(layer => layer.id === layerId);
                    if (layerIndex >= 0) {
                        updatedLayers[layerIndex] = { ...updatedLayers[layerIndex], ...layerOptions };
                    } else {
                        updatedLayers.push({ id: layerId, ...layerOptions });
                    }
                });
                updatedView.layers = updatedLayers;
            }

            // Apply group changes
            if (Object.keys(groupChanges).length > 0) {
                const updatedGroups = [...(view?.groups || [])];
                Object.entries(groupChanges).forEach(([groupId, groupOptions]) => {
                    const groupIndex = updatedGroups.findIndex(group => group.id === groupId);
                    if (groupIndex >= 0) {
                        updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], ...groupOptions };
                    } else {
                        updatedGroups.push({ id: groupId, ...groupOptions });
                    }
                });
                updatedView.groups = updatedGroups;
            }

            onChange(updatedView);
        },
        {
            delay: 0,
            reducer: (accumulated, type, id, options) => {
                const current = accumulated || { layers: {}, groups: {} };
                return {
                    layers: type === 'layers' ? { ...current.layers, [id]: { ...current.layers[id], ...options } } : current.layers,
                    groups: type === 'groups' ? { ...current.groups, [id]: { ...current.groups[id], ...options } } : current.groups
                };
            }
        }
    );

    function handleChange(options) {
        onChange({ ...view, ...options });
    }

    /**
     * Handles layer changes with batching to prevent race conditions.
     * Multiple calls are batched and flushed together.
     */
    function handleChangeLayer(layerId, options) {
        batchedUpdate('layers', layerId, options);
    }

    function handleResetLayer(layerId) {
        const viewLayers = view?.layers?.filter(vLayer => vLayer.id !== layerId);
        onChange({
            ...view,
            layers: viewLayers
        });
    }

    /**
     * Handles group changes with batching to prevent race conditions.
     * Multiple calls are batched and flushed together.
     */
    function handleChangeGroup(groupId, options) {
        batchedUpdate('groups', groupId, options);
    }

    function handleResetGroup(groupId) {
        const viewGroups = view?.groups?.filter(vGroup => vGroup.id !== groupId);
        onChange({
            ...view,
            groups: viewGroups
        });
    }

    function updateLayerRequest({ layer, inverse = false, offset = 0 } = {}) {
        return getResourceFromLayer({
            layer,
            inverse,
            offset,
            resources
        }).then(({ updated, ...resource }) => {
            if (updated) {
                onUpdateResource(resource.id, resource.data);
            }
            return resource.id;
        });
    }

    return (
        <div className="ms-map-views-settings">
            <form>
                {api?.options?.settings?.map((key) => {
                    const SectionComponent = sections[key];
                    return (
                        <SectionComponent
                            key={key}
                            isTerrainAvailable={!(api?.options?.unsupportedLayers || []).includes('terrain')}
                            isClippingAvailable={!(api?.options?.unsupportedLayers || []).includes('3dtiles')}
                            computeViewCoordinates={api.computeViewCoordinates}
                            view={view}
                            expandedSections={expandedSections}
                            onExpandSection={onExpandSection}
                            onChange={handleChange}
                            resources={resources}
                            layers={layers.filter(({ type }) => !(api?.options?.unsupportedLayers || []).includes(type))}
                            groups={groups}
                            vectorLayers={availableVectorLayers}
                            updateLayerRequest={updateLayerRequest}
                            locale={locale}
                            onChangeLayer={handleChangeLayer}
                            onResetLayer={handleResetLayer}
                            onChangeGroup={handleChangeGroup}
                            onResetGroup={handleResetGroup}
                            showClipGeometries={showClipGeometries}
                            onShowClipGeometries={onShowClipGeometries}
                            onCaptureView={onCaptureView}
                        />
                    );
                })}
            </form>
            {(view?.globeTranslucency?.enabled && view?.mask?.enabled) &&
                <Alert bsStyle="warning" style={{ bottom: 0, position: 'sticky', margin: 0, zIndex: 30 }}>
                    <Message msgId="mapViews.maskWithGlobeTranslucencyWarning" />
                </Alert>}
        </div>
    );
}

export default ViewSettings;
