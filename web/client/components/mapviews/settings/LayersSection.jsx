/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormControl as FormControlRB, FormGroup, InputGroup, Glyphicon, Checkbox, Button as ButtonRB, ButtonGroup } from 'react-bootstrap';
import Section from './Section';
import { mergeViewLayers, mergeViewGroups, pickViewLayerProperties, pickViewGroupProperties } from '../../../utils/MapViewsUtils';
import LayerOverridesNodeContent from './LayerOverridesNodeContent';
import Message from '../../I18N/Message';
import TOC from '../../../plugins/TOC/components/TOC';
import tooltip from '../../misc/enhancers/tooltip';
import localizedProps from '../../misc/enhancers/localizedProps';
import { NodeTypes } from '../../../utils/LayersUtils';
import { getMessageById } from '../../../utils/LocaleUtils';

const Button = tooltip(ButtonRB);
const FormControl = localizedProps('placeholder')(FormControlRB);

function ResetLayerOverrides({
    itemComponent,
    node,
    config,
    nodeType,
    nodeTypes,
    onChange
}) {
    const ItemComponent = itemComponent;
    const { view } = config?.mapViews || {};
    const changed = nodeType === nodeTypes.LAYER
        ? !!view?.layers?.find(layer => layer.id === node.id)
        : !!view?.groups?.find(group => group.id === node.id);
    function handleClick() {
        if (changed) {
            onChange({ resetView: true });
        } else {
            onChange(nodeType === nodeTypes.LAYER
                ? pickViewLayerProperties(node)
                : pickViewGroupProperties(node));
        }
    }
    return (
        <ItemComponent
            tooltipId={changed ? `mapViews.${nodeType}Unlinked` : `mapViews.${nodeType}Linked`}
            glyph={changed ? 'unplug' : 'plug'}
            onClick={handleClick}
        />
    );
}

function LayersSection({
    view,
    expandedSections = {},
    onExpandSection,
    onChange,
    resources,
    layers = [],
    groups = [],
    vectorLayers,
    updateLayerRequest,
    locale,
    onChangeLayer,
    onResetLayer,
    onChangeGroup,
    onResetGroup,
    showClipGeometries,
    onShowClipGeometries,
    isTerrainAvailable,
    isClippingAvailable
}, { messages }) {

    const [filterText, setFilterText] = useState('');
    const [expandedNodes, setExpandedNodes] = useState([
        ...groups.filter((group) => group.expanded).map(group => group.id),
        ...layers.filter((layer) => layer.expanded).map(layer => layer.id)
    ]);
    const mergedLayers = mergeViewLayers(layers, view);
    const mergedGroups = mergeViewGroups(groups, view);
    const tocMapViewConfig = {
        view,
        updateLayerRequest,
        vectorLayers,
        resources,
        locale
    };
    function applyExpandedProperty(nodes) {
        return nodes.map(node => ({ ...node, expanded: expandedNodes.includes(node.id) }));
    }
    function areAllNodesUnlinked() {
        return layers.every(layer => (view?.layers || []).some(vLayer => vLayer.id === layer.id))
            && groups.every(group => (view?.groups || []).some(vGroup => vGroup.id === group.id));
    }
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
            <FormGroup style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <InputGroup style={{ flex: 1 }}>
                    <FormControl
                        placeholder="toc.filterPlaceholder"
                        value={filterText}
                        onChange={(event) => setFilterText(event?.target?.value)}
                    />
                    {filterText
                        ? <InputGroup.Button>
                            <Button tooltipId="toc.clearFilter" onClick={() => setFilterText('')}><Glyphicon glyph="1-close"/></Button>
                        </InputGroup.Button>
                        : <InputGroup.Addon>
                            <Glyphicon glyph="filter"/>
                        </InputGroup.Addon>}
                </InputGroup>
                <ButtonGroup>
                    <Button
                        tooltipId="mapViews.linkAllNodes"
                        disabled={!view?.layers?.length && !view?.groups?.length}
                        className="square-button-md"
                        bsStyle="primary"
                        onClick={() => {
                            onChange({
                                groups: undefined,
                                layers: undefined
                            });
                        }}
                    >
                        <Glyphicon glyph="plug"/>
                    </Button>
                    <Button
                        tooltipId="mapViews.unlinkAllNodes"
                        className="square-button-md"
                        bsStyle="primary"
                        disabled={areAllNodesUnlinked()}
                        onClick={() => {
                            onChange({
                                groups: groups.map((group) => {
                                    const viewGroup = (view?.groups || []).find(vGroup => vGroup.id === group.id);
                                    return pickViewGroupProperties(viewGroup || group);
                                }),
                                layers: layers.map((layer) => {
                                    const viewLayer = (view?.layers || []).find(vLayer => vLayer.id === layer.id);
                                    return pickViewLayerProperties(viewLayer || layer);
                                })
                            });
                        }}
                    >
                        <Glyphicon glyph="unplug" />
                    </Button>
                </ButtonGroup>
            </FormGroup>
            {isTerrainAvailable ? <TOC
                map={{
                    layers: [{
                        ...view?.terrain,
                        id: 'terrain',
                        type: 'terrain',
                        title: getMessageById(messages, 'mapViews.terrain')
                    }]
                }}
                nodeContentItems={[
                    { name: 'LayerOverridesNodeContent', Component: LayerOverridesNodeContent }
                ]}
                config={{
                    sortable: false,
                    hideOpacitySlider: true,
                    hideVisibilityButton: true,
                    layerOptions: {
                        hideFilter: true,
                        hideLegend: true
                    },
                    mapViews: tocMapViewConfig
                }}
                onChangeNode={(nodeId, nodeType, options) => {
                    if (nodeId === 'terrain' && nodeType === NodeTypes.LAYER) {
                        onChange({ terrain: { ...view?.terrain, ...options }});
                    }
                }}
            /> : null}
            <TOC
                map={{
                    layers: applyExpandedProperty(mergedLayers),
                    groups: applyExpandedProperty(mergedGroups)
                }}
                filterText={filterText}
                config={{
                    sortable: false,
                    layerOptions: {
                        hideFilter: true,
                        hideLegend: true
                    },
                    mapViews: tocMapViewConfig
                }}
                nodeContentItems={[
                    { name: 'LayerOverridesNodeContent', Component: LayerOverridesNodeContent }
                ]}
                nodeToolItems={[
                    { name: 'ResetLayerOverrides', Component: ResetLayerOverrides }
                ]}
                onChangeNode={(nodeId, nodeType, options) => {
                    if (options.expanded !== undefined) {
                        return setExpandedNodes(
                            options.expanded
                                ? [...expandedNodes, nodeId]
                                : expandedNodes.filter(expandedNodeId => expandedNodeId !== nodeId));
                    }
                    if (options.resetView) {
                        return nodeType === NodeTypes.LAYER
                            ? onResetLayer(nodeId)
                            : onResetGroup(nodeId);
                    }
                    return nodeType === NodeTypes.LAYER
                        ? onChangeLayer(nodeId, options)
                        : onChangeGroup(nodeId, options);
                }}
            />
        </Section>
    );
}

LayersSection.contextTypes = {
    messages: PropTypes.object
};

export default LayersSection;
