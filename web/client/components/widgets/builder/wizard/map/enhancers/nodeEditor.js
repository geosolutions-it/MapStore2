/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps, withState, withHandlers } = require('recompose');
const { get } = require('lodash');

const withControllableState = require('../../../../../misc/enhancers/withControllableState');
const {splitMapAndLayers} = require('../../../../../../utils/LayersUtils');
const mapToNodes = require('./mapToNodes');
const withSelectedNode = require('./withSelectedNode');
const withCapabilitiesRetrieval = require('./withCapabilitiesRetrieval');

/* TABS definitions */
const General = require('../../../../../TOC/fragments/settings/General');
const Display = require('../../../../../TOC/fragments/settings/Display');
const WMSStyle = withCapabilitiesRetrieval(require('../../../../../TOC/fragments/settings/WMSStyle'));
const handleNodePropertyChanges = require('./handleNodePropertyChanges');
const { settingsLifecycle } = require('../../../../../TOC/enhancers/tocItemsSettings');

const withDefaultTabs = withProps((props) => ({
    tabs: props.tabs || [{
        id: 'general',
        titleId: 'layerProperties.general',
        tooltipId: 'layerProperties.general',
        glyph: 'wrench',
        visible: true,
        Component: General
    },
    {
        id: 'display',
        titleId: 'layerProperties.display',
        tooltipId: 'layerProperties.display',
        glyph: 'eye-open',
        visible: props.settings && props.settings.nodeType === 'layers',
        Component: Display
    },
    {
        id: 'style',
        titleId: 'layerProperties.style',
        tooltipId: 'layerProperties.style',
        glyph: 'dropper',
        visible: props.settings && props.settings.nodeType === 'layers' && props.element && props.element.type === "wms",
        Component: WMSStyle
    }]
}));
/**
 * Manages internal TOC node editor state exposing only
 * @prop {string} editNode the ID of the node to edit
 * @prop {object} map the map (with layers and groups)
 * @prop {function} onChange method called when a change has been applied
 * @example
 * // `path` can be something like `map.layers[idx].prop` (path definition of lodash get, set)
 * <EnhancedNodeEditor editNode={"LAYER_1"} map={map} onChange={(path, value) => set(map, path, value)} /> // set could be immutable version of lodash set
 */
module.exports = compose(
    // select selected node
    mapToNodes,
    withSelectedNode,
    // manage settings variables for local changes (required by tocItemsSettings tabs)
    withState('settings', 'onUpdateSettings', {}),
    // transform selected node to fit tocItemsSettings props
    withProps(({ map = {}, selectedNode, settings = {}} = {}) => ({
        element: selectedNode,
        settings: {
            ...settings,
            nodeType: selectedNode && selectedNode.nodes ? "groups" : "layers",
            options: {

                opacity: settings.opacity >= 0
                    ? settings.opacity
                    : selectedNode.opacity >= 0
                        ? selectedNode.opacity
                        : 1
            }
        },
        groups: get(splitMapAndLayers(map), 'layers.groups')
    })),
    // adapter for handlers
    compose(
        handleNodePropertyChanges,
        withHandlers({
            onUpdateNode: ({changeLayerProperty = () => {}, changeGroupProperty = () => {}, editNode}) => (node, type, newProps) => {
                if (type === "layers") {
                    Object.keys(newProps).map(k => changeLayerProperty(editNode, k, newProps[k]));
                }
                if (type === "groups") {
                    Object.keys(newProps).map(k => changeGroupProperty(editNode, k, newProps[k]));
                }
            }
        }),
        withHandlers({
            onUpdateParams: ({ settings = {}, onUpdateNode = () => { } }) => (newParams, doUpdate = true) => {
                if (doUpdate) {
                    onUpdateNode(
                        settings.node,
                        settings.nodeType,
                        { ...settings.props, ...newParams }
                    );
                }
            }
        })
    ),
    // manage local changes
    settingsLifecycle,
    // manage tabs of node editor
    withControllableState('activeTab', 'setActiveTab', 'general'),
    withDefaultTabs
);
