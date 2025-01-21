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

/**
 * ResetLayerOverrides node tool to link and unlink groups and layers to TOC
 * @prop {object} itemComponent default node tool component
 * @prop {object} node layer object
 * @prop {object} config optional configuration available for the nodes
 * @prop {string} nodeType node type
 * @prop {object} nodeTypes constant values for node types
 * @prop {function} onChange return the changes of this node
 */
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

ResetLayerOverrides.propTypes = {
    itemComponent: PropTypes.any,
    node: PropTypes.object,
    config: PropTypes.object,
    nodeType: PropTypes.string,
    nodeTypes: PropTypes.object,
    onChange: PropTypes.func
};
/**
 * LayersSection table of content for layers and groups inside a map view
 * @prop {object} view view configuration
 * @prop {object} expandedSections state of the expended section
 * @prop {function} onExpandSection returns the new expanded state
 * @prop {function} onChange returns changes on the view
 * @prop {array} resources list of resources available for the views
 * @prop {array} layers list of supported layers
 * @prop {array} groups list of supported groups
 * @prop {array} vectorLayers list of vector layers
 * @prop {string} locale current locale
 * @prop {function} onChangeLayer returns changes on a view layer
 * @prop {function} onResetLayer requests a reset on the selected view layer
 * @prop {function} onChangeGroup returns changes on a view group
 * @prop {function} onResetGroup requests a reset on the selected view group
 * @prop {boolean} showClipGeometries visibility state of clipping features
 * @prop {function} onShowClipGeometries return the clipping checkbox state
 * @prop {function} isTerrainAvailable if true shows the terrain options
 * @prop {function} isClippingAvailable if true shows enable clipping options
 */
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

LayersSection.propTypes = {
    view: PropTypes.object,
    expandedSections: PropTypes.object,
    onExpandSection: PropTypes.func,
    onChange: PropTypes.func,
    resources: PropTypes.array,
    layers: PropTypes.array,
    groups: PropTypes.array,
    vectorLayers: PropTypes.array,
    updateLayerRequest: PropTypes.func,
    locale: PropTypes.string,
    onChangeLayer: PropTypes.func,
    onResetLayer: PropTypes.func,
    onChangeGroup: PropTypes.func,
    onResetGroup: PropTypes.func,
    showClipGeometries: PropTypes.bool,
    onShowClipGeometries: PropTypes.func,
    isTerrainAvailable: PropTypes.bool,
    isClippingAvailable: PropTypes.bool
};

LayersSection.contextTypes = {
    messages: PropTypes.object
};

export default LayersSection;
