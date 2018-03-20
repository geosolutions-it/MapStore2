/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps, withState, withHandlers } = require('recompose');
/* TABS definitions */
const General = require('../../../../../TOC/fragments/settings/General');
const Display = require('../../../../../TOC/fragments/settings/Display');
const WMSStyle = require('../../../../../TOC/fragments/settings/WMSStyle');
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

const withControllableState = require('../../../../../misc/enhancers/withControllableState');
const mapToNodes = require('./mapToNodes');
const withSelectedNode = require('./withSelectedNode');
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
            nodeType: selectedNode.nodes ? "groups" : "layers",
            options: {

                opacity: settings.opacity >= 0
                    ? settings.opacity
                    : selectedNode.opacity >= 0
                        ? selectedNode.opacity
                        : 1
            }
        },
        groups: map.groups
    })),
    // adapter for handlers
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
    // manage local changes
    settingsLifecycle,
    // manage tabs of node editor
    withControllableState('activeTab', 'setActiveTab', 'general'),
    withDefaultTabs
);
