/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { filter, head, sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { defaultProps } from 'recompose';


import { isCesium } from '../../selectors/maptype';

import {getConfiguredPlugin as getConfiguredPluginUtil } from '../../utils/PluginsUtils';
import { isAnnotationLayer } from '../Annotations/utils/AnnotationsUtils';
import General from '../../components/TOC/fragments/settings/General';
import Display from '../../components/TOC/fragments/settings/Display';

import Elevation from '../../components/TOC/fragments/settings/Elevation';
import LoadingView from '../../components/misc/LoadingView';
import Fields, { hasFields } from './tabs/Fields';
import FeatureInfo from './tabs/FeatureInfo';


import VectorStyleEditor from '../styleeditor/VectorStyleEditor';
import MultiBandEditor from '../styleeditor/MultiBandEditor';
import { mapSelector } from '../../selectors/map';


import { StyleSelector } from '../styleeditor/index';

const StyleList = defaultProps({ readOnly: true })(StyleSelector);

const ConnectedDisplay = connect(
    createSelector([mapSelector], ({ zoom, projection, size, bbox }) => ({ zoom, projection, mapSize: size, mapBbox: bbox }))
)(Display);

const ConnectedVectorStyleEditor = connect(
    createSelector([isCesium], (enable3dStyleOptions) => ({ enable3dStyleOptions }))
)(VectorStyleEditor);

const isLayerNode = ({settings = {}} = {}) => settings.nodeType === 'layers';
const isVectorStylableLayer = ({element = {}} = {}) => element.type === "wfs" || element.type === "3dtiles" || element.type === "vector" && !isAnnotationLayer(element);
const isCOGStylableLayer = ({element = {}} = {}) => element.type === "cog";
const isWMS = ({element = {}} = {}) => element.type === "wms";
const isWFS = ({element = {}} = {}) => element.type === "wfs";

const isStylableLayer = (props) =>
    isLayerNode(props)
    && (isWMS(props) || isVectorStylableLayer(props) || isCOGStylableLayer(props));


const configuredPlugins = {};

const getConfiguredPlugin = (plugin, loaded, loadingComp) => {
    if (plugin) {
        let configured = configuredPlugins[plugin.name];
        if (!configured) {
            configured = getConfiguredPluginUtil(plugin, loaded, loadingComp);
            if (configured && configured.loaded) {
                configuredPlugins[plugin.name] = configured;
            }
        }
        return configured;
    }
    return plugin;
};

export const getStyleTabPlugin = ({ settings, items = [], loadedPlugins, onToggleStyleEditor = () => { }, onUpdateParams = () => { }, element, ...props }) => {

    if (isVectorStylableLayer({element})) {
        return { Component: ConnectedVectorStyleEditor };
    }
    if (isCOGStylableLayer({element})) {
        return { Component: MultiBandEditor };
    }
    // get Higher priority plugin that satisfies requirements.
    const candidatePluginItems =
            sortBy(filter([...items], { target: 'style' }), ["priority"]) // find out plugins with target panel 'style' and sort by priority
                .filter(({selector}) => selector ? selector({...props, element}) : true); // filter out items that do not have the correct requirements.
    // TODO: to complete externalization of these items, we need to
    // move handlers, Component creation and configuration on the plugins, delegating also action dispatch.
    const thematicPlugin = head(filter(candidatePluginItems, {name: "ThematicLayer"}));
    if (thematicPlugin) {
        const thematicConfig = settings && settings.options && settings.options.thematic;
        const toolbar = [
            {
                glyph: 'list',
                tooltipId: 'toc.thematic.classify',
                visible: props.isAdmin && !thematicConfig || false,
                onClick: () => onUpdateParams({
                    thematic: {
                        unconfigured: true
                    }
                })
            },
            {
                glyph: 'trash',
                tooltipId: 'toc.thematic.remove_thematic',
                visible: props.isAdmin && thematicConfig || false,
                onClick: () => onUpdateParams({
                    thematic: null
                })
            }
        ];
        if (thematicConfig) {
            return {
                Component: props.activeTab === 'style' && thematicPlugin.plugin,
                toolbar
            };
        }
        return {
            toolbar
        };
    }

    const item = head(candidatePluginItems);
    // StyleEditor case TODO: externalize `onClose` trigger (delegating action dispatch) and components creation to make the two plugins independent
    if (item && item.plugin) {
        const cfg = item.cfg || item.plugin.cfg;
        return {
            // This is connected on TOCItemsSettings close, not on StyleEditor unmount
            // to prevent re-initialization on each tab switch.
            onClose: () => onToggleStyleEditor(null, false),
            Component: getConfiguredPlugin({ ...item, cfg: { ...(cfg || {}), active: true } }, loadedPlugins, <LoadingView width={100} height={100} />),
            toolbarComponent: item.ToolbarComponent
                && (
                    cfg && defaultProps(cfg)(item.ToolbarComponent) || item.ToolbarComponent
                )
        };
    }
    // keep default layer selector
    return {};
};

export default ({ showFeatureInfoTab = true, loadedPlugins, items, onToggleStyleEditor, ...props }) => {

    return [
        {
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
            visible: isLayerNode(props),
            Component: ConnectedDisplay
        }, {
            id: 'fields',
            titleId: 'layerProperties.fields.title',
            tooltipId: 'layerProperties.fields.tooltip',
            glyph: 'list',
            visible: isLayerNode(props) && hasFields(props?.element),
            Component: Fields
        },
        {
            id: 'style',
            titleId: 'layerProperties.style',
            tooltipId: 'layerProperties.style',
            glyph: 'dropper',
            visible: isStylableLayer(props),
            Component: StyleList,
            ...getStyleTabPlugin({ items, loadedPlugins, onToggleStyleEditor, ...props })
        },
        {
            id: 'feature',
            titleId: 'layerProperties.featureInfo',
            tooltipId: 'layerProperties.featureInfo',
            glyph: 'map-marker',
            visible: showFeatureInfoTab && isLayerNode(props) && (isWMS(props) || isWFS(props)) && !(props.element.featureInfo && props.element.featureInfo.viewer),
            Component: FeatureInfo,
            toolbar: [
                {
                    glyph: 'pencil',
                    tooltipId: 'layerProperties.editCustomFormat',
                    visible: !props.showEditor && props.element && props.element.featureInfo && props.element.featureInfo.format === 'TEMPLATE' || false,
                    onClick: () => props.onShowEditor && props.onShowEditor(!props.showEditor)
                }
            ]
        },
        {
            id: 'elevation',
            titleId: 'layerProperties.elevation',
            tooltipId: 'layerProperties.elevation',
            glyph: '1-vector',
            visible: isLayerNode(props) && isWMS(props) && props.element.dimensions && props.getDimension && props.getDimension(props.element.dimensions, 'elevation'),
            Component: Elevation
        }
    ].filter(tab => tab.visible);
};
