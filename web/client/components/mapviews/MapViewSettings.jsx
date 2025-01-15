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

    function handleChange(options) {
        onChange({ ...view, ...options });
    }

    function handleChangeLayer(layerId, options) {
        const viewLayer = view?.layers?.find(vLayer => vLayer.id === layerId);
        const viewLayers = viewLayer
            ? (view?.layers || [])
                .map((vLayer) => vLayer.id === layerId ? ({ ...viewLayer, ...options }) : vLayer)
            : [...(view?.layers || []), { id: layerId, ...options }];
        onChange({
            ...view,
            layers: viewLayers
        });
    }

    function handleResetLayer(layerId) {
        const viewLayers = view?.layers?.filter(vLayer => vLayer.id !== layerId);
        onChange({
            ...view,
            layers: viewLayers
        });
    }

    function handleChangeGroup(groupId, options) {
        const viewGroup = view?.groups?.find(vGroup => vGroup.id === groupId);
        const viewGroups = viewGroup
            ? (view?.groups || [])
                .map((vGroup) => vGroup.id === groupId ? ({ ...viewGroup, ...options }) : vGroup)
            : [...(view?.groups || []), { id: groupId, ...options }];
        onChange({
            ...view,
            groups: viewGroups
        });
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
