/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../../components/I18N/Message');
const { filter, head, sortBy } = require('lodash');

const { defaultProps } = require('recompose');
const { Glyphicon } = require('react-bootstrap');

const HTMLViewer = require('../../components/data/identify/viewers/HTMLViewer');
const TextViewer = require('../../components/data/identify/viewers/TextViewer');
const JSONViewer = require('../../components/data/identify/viewers/JSONViewer');
const HtmlRenderer = require('../../components/misc/HtmlRenderer');

const MapInfoUtils = require('../../utils/MapInfoUtils');
const PluginsUtils = require('../../utils/PluginsUtils');

const General = require('../../components/TOC/fragments/settings/General');
const Display = require('../../components/TOC/fragments/settings/Display');

const Elevation = require('../../components/TOC/fragments/settings/Elevation');
const FeatureInfoEditor = require('../../components/TOC/fragments/settings/FeatureInfoEditor');
const LoadingView = require('../../components/misc/LoadingView');

const responses = {
    html: require('raw-loader!./featureInfoPreviews/responseHTML.txt'),
    json: JSON.parse(require('raw-loader!./featureInfoPreviews/responseJSON.txt')),
    text: require('raw-loader!./featureInfoPreviews/responseText.txt')
};

const { StyleSelector } = require('../styleeditor/index');
const StyleList = defaultProps({ readOnly: true })(StyleSelector);

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

const FeatureInfo = defaultProps({
    formatCards,
    defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat()
})(require('../../components/TOC/fragments/settings/FeatureInfo'));

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

let settingsPlugins = {};

const getStyleTabPlugin = ({ items, loadedPlugins, onToggleStyleEditor = () => { }, onUpdateParams = () => { }, ...props }) => {
    // get Higher priority plugin that satisfies requirements.
    const candidatePluginItems =
            sortBy(filter([...items] || [], { target: 'style' }), ["priority"]) // find out plugins with target panel 'style' and sort by priority
                .filter(({selector}) => selector ? selector(props) : true); // filter out items that do not have the correct requirements.
    // TODO: to complete externalization of these items, we need to
    // move handlers, Component creation and configuration on the plugins, delegating also action dispatch.
    const thematic = head(filter(candidatePluginItems, {name: "ThematicLayer"}));
    if (thematic) {
        const item = thematic;
        return {
            Component: props.activeTab === 'style' && item.plugin && getConfiguredPlugin(item, loadedPlugins, <LoadingView width={100} height={100} />),
            toolbar: [
                {
                    glyph: 'list',
                    tooltipId: 'toc.thematic.classify',
                    visible: props.isAdmin && !thematic && props.element.search || false,
                    onClick: () => onUpdateParams({
                        thematic: {
                            unconfigured: true
                        }
                    })
                },
                {
                    glyph: 'trash',
                    tooltipId: 'toc.thematic.remove_thematic',
                    visible: props.isAdmin && thematic || false,
                    onClick: () => onUpdateParams({
                        thematic: null
                    })
                }
            ]
        };
    }
    const item = head(candidatePluginItems);
    if (item && item.plugin) {
        return {
            onClose: () => onToggleStyleEditor(null, false),
            onClick: () => onToggleStyleEditor(null, true),
            Component: getConfiguredPlugin({ ...item, cfg: { ...item.plugin.cfg, active: true } }, loadedPlugins, <LoadingView width={100} height={100} />),
            toolbarComponent: item.ToolbarComponent
                && (
                    item.plugin.cfg && defaultProps(item.plugin.cfg)(item.ToolbarComponent) || item.ToolbarComponent
                )
        };
    }
    return {};
};

module.exports = ({ showFeatureInfoTab = true, loadedPlugins, items, onToggleStyleEditor, ...props }) => {

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
            visible: props.settings.nodeType === 'layers',
            Component: Display
        },
        {
            id: 'style',
            titleId: 'layerProperties.style',
            tooltipId: 'layerProperties.style',
            glyph: 'dropper',
            visible: props.settings.nodeType === 'layers' && props.element.type === "wms",
            Component: StyleList,
            ...getStyleTabPlugin({ items, loadedPlugins, onToggleStyleEditor, ...props })
        },
        {
            id: 'feature',
            titleId: 'layerProperties.featureInfo',
            tooltipId: 'layerProperties.featureInfo',
            glyph: 'map-marker',
            visible: showFeatureInfoTab && props.settings.nodeType === 'layers' && props.element.type === "wms" && !(props.element.featureInfo && props.element.featureInfo.viewer),
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
            visible: props.settings.nodeType === 'layers' && props.element.type === "wms" && props.element.dimensions && props.getDimension && props.getDimension(props.element.dimensions, 'elevation'),
            Component: Elevation
        }
    ].filter(tab => tab.visible);
};
