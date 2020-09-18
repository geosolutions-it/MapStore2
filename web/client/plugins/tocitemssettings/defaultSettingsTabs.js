/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../../components/I18N/Message';
import { filter, head, sortBy } from 'lodash';

import { defaultProps } from 'recompose';
import { Glyphicon } from 'react-bootstrap';

import HTMLViewer from '../../components/data/identify/viewers/HTMLViewer';
import TextViewer from '../../components/data/identify/viewers/TextViewer';
import JSONViewer from '../../components/data/identify/viewers/JSONViewer';
import HtmlRenderer from '../../components/misc/HtmlRenderer';

import MapInfoUtils from '../../utils/MapInfoUtils';
import PluginsUtils from '../../utils/PluginsUtils';

import General from '../../components/TOC/fragments/settings/General';
import Display from '../../components/TOC/fragments/settings/Display';

import Elevation from '../../components/TOC/fragments/settings/Elevation';
import FeatureInfoEditor from '../../components/TOC/fragments/settings/FeatureInfoEditor';
import LoadingView from '../../components/misc/LoadingView';
import html from 'raw-loader!./featureInfoPreviews/responseHTML.txt';
import json from 'raw-loader!./featureInfoPreviews/responseJSON.txt';
import text from 'raw-loader!./featureInfoPreviews/responseText.txt';
import SimpleVectorStyleEditor from './SimpleVectorStyleEditor';


const responses = {
    html,
    json: JSON.parse(json),
    text
};

import { StyleSelector } from '../styleeditor/index';

const StyleList = defaultProps({ readOnly: true })(StyleSelector);

const isLayerNode = ({settings = {}} = {}) => settings.nodeType === 'layers';
const isVectorStylableLayer = ({element = {}} = {}) => element.type === "wfs" || element.type === "vector" && element.id !== "annotations";
const isWMS = ({element = {}} = {}) => element.type === "wms";
const isStylableLayer = (props) =>
    isLayerNode(props)
    && (isWMS(props) || isVectorStylableLayer(props));


const formatCards = {
    TEXT: {
        titleId: 'layerProperties.textFormatTitle',
        descId: 'layerProperties.textFormatDescription',
        glyph: 'ext-txt',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse" /></div>
                <br />
                <TextViewer response={responses.text} />
            </div>
        )
    },
    HTML: {
        titleId: 'layerProperties.htmlFormatTitle',
        descId: 'layerProperties.htmlFormatDescription',
        glyph: 'ext-html',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse" /></div>
                <br />
                <HTMLViewer response={responses.html} />
            </div>
        )
    },
    PROPERTIES: {
        titleId: 'layerProperties.propertiesFormatTitle',
        descId: 'layerProperties.propertiesFormatDescription',
        glyph: 'ext-json',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse" /></div>
                <br />
                <JSONViewer response={responses.json} />
            </div>
        )
    },
    TEMPLATE: {
        titleId: 'layerProperties.templateFormatTitle',
        descId: 'layerProperties.templateFormatDescription',
        glyph: 'ext-empty',
        body: ({ template = '', ...props }) => (
            <div>
                <div>{template && template !== '<p><br></p>' ? <Message msgId="layerProperties.templatePreview" /> : null}</div>
                <br />
                <div>
                    {template && template !== '<p><br></p>' ?
                        <HtmlRenderer html={template} />
                        :
                        <span>
                            <p><Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: '{ }' }} /></p>
                            <pre>
                                <Message msgId="layerProperties.templateFormatInfoAlertExample" msgParams={{ properties: '{ properties.id }' }} />
                            </pre>
                            <p><small><Message msgId="layerProperties.templateFormatInfoAlert1" /></small>&nbsp;(&nbsp;<Glyphicon glyph="pencil" />&nbsp;)</p>
                        </span>}
                    <FeatureInfoEditor template={template} {...props} />
                </div>
            </div>
        )
    }
};
import FeatureInfoCmp from '../../components/TOC/fragments/settings/FeatureInfo';
const FeatureInfo = defaultProps({
    formatCards,
    defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat()
})(FeatureInfoCmp);

const configuredPlugins = {};

const getConfiguredPlugin = (plugin, loaded, loadingComp) => {
    if (plugin) {
        let configured = configuredPlugins[plugin.name];
        if (!configured) {
            configured = PluginsUtils.getConfiguredPlugin(plugin, loaded, loadingComp);
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
        return {
            Component: SimpleVectorStyleEditor
        };
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
                Component: props.activeTab === 'style' && thematicPlugin.plugin && getConfiguredPlugin(thematicPlugin, loadedPlugins, <LoadingView width={100} height={100} />),
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
            Component: Display
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
            visible: showFeatureInfoTab && isLayerNode(props) && isWMS(props) && !(props.element.featureInfo && props.element.featureInfo.viewer),
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
