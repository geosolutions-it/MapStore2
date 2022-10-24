/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormGroup, Checkbox } from 'react-bootstrap';
import Section from './Section';
import { getTitle } from '../../../utils/TOCUtils';
import { mergeViewLayers } from '../../../utils/MapViewsUtils';
import LayerOverridesNode from './LayerOverridesNode';
import Message from '../../I18N/Message';

function LayersSection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange,
    resources,
    layers,
    vectorLayers,
    updateLayerRequest,
    locale,
    onChangeLayer,
    onResetLayer,
    showClipGeometries,
    onShowClipGeometries,
    isTerrainAvailable,
    isClippingAvailable
}) {

    const terrainClippingLayerResource = resources?.find(resource => resource.id === view?.terrain?.clippingLayerResourceId)?.data;
    const terrainVectorLayer = vectorLayers?.find(layer => layer.id === terrainClippingLayerResource?.id);
    const terrainClippingFeatures = terrainClippingLayerResource?.collection?.features || terrainVectorLayer?.features;
    const mergedLayers = mergeViewLayers(layers, view);
    const vectorLayersOptions = vectorLayers
        ?.filter((layer) => {
            if (layer.type === 'wfs') {
                return true;
            }
            if (layer.type === 'vector') {
                return !!layer?.features?.find(({ geometry }) => ['Polygon'].includes(geometry?.type));
            }
            return false;
        })
        .map((layer) => ({
            label: getTitle(layer.title, locale) || layer.name || layer.id,
            value: layer.id,
            layer
        }));

    return (
        <Section
            title={<Message msgId="mapViews.layersOptions"/>}
            initialExpanded={expandedSections.layers}
            onExpand={(expanded) => onExpandSection({ layers: expanded })}
        >
            {isClippingAvailable && <div className="ms-map-views-layers-options-header">
                <FormGroup
                    controlId="map-views-show-clipping-geometries">
                    <Checkbox
                        checked={!!showClipGeometries}
                        onChange={() => onShowClipGeometries(!showClipGeometries)}
                    >
                        <Message msgId="mapViews.showClippingLayersGeometries"/>
                    </Checkbox>
                </FormGroup>
            </div>}
            <ul className="ms-map-views-layers-options-body">
                {isTerrainAvailable && <LayerOverridesNode
                    key="terrain"
                    title={<Message msgId="mapViews.terrain"/>}
                    layer={{
                        ...view?.terrain,
                        type: 'terrain',
                        id: 'terrain'
                    }}
                    onChange={(newOptions) => onChange({  terrain: { ...view?.terrain, ...newOptions }})}
                    updateLayerRequest={updateLayerRequest}
                    vectorLayers={vectorLayersOptions}
                    clippingFeatures={terrainClippingFeatures}
                    clippingLayerResource={terrainClippingLayerResource
                        ? {
                            value: terrainClippingLayerResource?.id,
                            label: getTitle(terrainVectorLayer?.title, locale) || terrainVectorLayer?.name || terrainVectorLayer?.id,
                            resource: terrainClippingLayerResource
                        }
                        : undefined}
                />}
                {mergedLayers?.length === 0
                    ? <Message msgId="mapViews.addNewLayerToTheMap"/>
                    : [ ...mergedLayers ].reverse().map((layer) => {
                        const clippingLayerResource = resources?.find(({ id }) => id === layer.clippingLayerResourceId)?.data;
                        const vectorLayer = vectorLayers?.find(({ id }) => id === clippingLayerResource?.id);
                        const clippingFeatures = clippingLayerResource?.collection?.features || vectorLayer?.features;
                        return (
                            <LayerOverridesNode
                                key={`${view?.id}-${layer.id}`}
                                layer={layer}
                                title={getTitle(layer.title, locale) || layer.name || layer.id}
                                onChange={(newOptions) => onChangeLayer(layer.id, newOptions)}
                                onReset={() => onResetLayer(layer.id)}
                                updateLayerRequest={updateLayerRequest}
                                vectorLayers={vectorLayersOptions}
                                clippingFeatures={clippingFeatures}
                                clippingLayerResource={clippingLayerResource
                                    ? {
                                        value: clippingLayerResource?.id,
                                        label: getTitle(vectorLayer?.title, locale) || vectorLayer?.name || vectorLayer?.id,
                                        resource: clippingLayerResource
                                    } : undefined}
                            />
                        );
                    })}
            </ul>
        </Section>
    );
}

export default LayersSection;
