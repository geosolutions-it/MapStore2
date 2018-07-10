/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../../components/I18N/Message');
const {defaultProps} = require('recompose');
const {Glyphicon} = require('react-bootstrap');

const assign = require('object-assign');
const HTMLViewer = require('../../components/data/identify/viewers/HTMLViewer');
const TextViewer = require('../../components/data/identify/viewers/TextViewer');
const JSONViewer = require('../../components/data/identify/viewers/JSONViewer');
const HtmlRenderer = require('../../components/misc/HtmlRenderer');

const MapInfoUtils = require('../../utils/MapInfoUtils');
const PluginsUtils = require('../../utils/PluginsUtils');

const General = require('../../components/TOC/fragments/settings/General');
const Display = require('../../components/TOC/fragments/settings/Display');

const WMSStyle = require('../../components/TOC/fragments/settings/WMSStyle');

const Elevation = require('../../components/TOC/fragments/settings/Elevation');
const FeatureInfoEditor = require('../../components/TOC/fragments/settings/FeatureInfoEditor');
const LoadingView = require('../../components/misc/LoadingView');

const responses = {
    html: require('raw-loader!./featureInfoPreviews/responseHTML.txt'),
    json: JSON.parse(require('raw-loader!./featureInfoPreviews/responseJSON.txt')),
    text: require('raw-loader!./featureInfoPreviews/responseText.txt')
};

const formatCards = {
    TEXT: {
        titleId: 'layerProperties.textFormatTitle',
        descId: 'layerProperties.textFormatDescription',
        glyph: 'ext-txt',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse"/></div>
                <br/>
                <TextViewer response={responses.text}/>
            </div>
        )
    },
    HTML: {
        titleId: 'layerProperties.htmlFormatTitle',
        descId: 'layerProperties.htmlFormatDescription',
        glyph: 'ext-html',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse"/></div>
                <br/>
                <HTMLViewer response={responses.html}/>
            </div>
        )
    },
    PROPERTIES: {
        titleId: 'layerProperties.propertiesFormatTitle',
        descId: 'layerProperties.propertiesFormatDescription',
        glyph: 'ext-json',
        body: () => (
            <div>
                <div><Message msgId="layerProperties.exampleOfResponse"/></div>
                <br/>
                <JSONViewer response={responses.json} />
            </div>
        )
    },
    TEMPLATE: {
        titleId: 'layerProperties.templateFormatTitle',
        descId: 'layerProperties.templateFormatDescription',
        glyph: 'ext-empty',
        body: ({template = '', ...props}) => (
            <div>
                <div>{template && template !== '<p><br></p>' ? <Message msgId="layerProperties.templatePreview"/> : null}</div>
                <br/>
                <div>
                    {template && template !== '<p><br></p>' ?
                    <HtmlRenderer html={template}/>
                    :
                    <span>
                        <p><Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: '{ }'}}/></p>
                        <pre>
                            <Message msgId="layerProperties.templateFormatInfoAlertExample" msgParams={{ properties: '{ properties.id }' }}/>
                        </pre>
                        <p><small><Message msgId="layerProperties.templateFormatInfoAlert1"/></small>&nbsp;(&nbsp;<Glyphicon glyph="pencil"/>&nbsp;)</p>
                    </span>}
                    <FeatureInfoEditor template={template} {...props}/>
                </div>
            </div>
        )
    }
};

const FeatureInfo = defaultProps({
    formatCards,
    defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat()
})(require('../../components/TOC/fragments/settings/FeatureInfo'));

let settingsPlugins = null;
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

module.exports = ({showFeatureInfoTab = true, ...props}, {plugins, pluginsConfig, loadedPlugins}) => {
    if (!settingsPlugins) {
        settingsPlugins = assign({}, (PluginsUtils.getPluginItems({}, plugins, pluginsConfig, "TOC", props.id, true, loadedPlugins, (p) => p.container === 'TOCItemSettings') || [])
            .reduce((previoius, p) => ({[p.name]: p}), {}));
    }

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
            Component: props.activeTab === 'style' && props.element.thematic && settingsPlugins.ThematicLayer && getConfiguredPlugin(settingsPlugins.ThematicLayer, loadedPlugins, <LoadingView width={100} height={100} />) || WMSStyle,
            toolbar: [
                {
                    glyph: 'list',
                    tooltipId: 'toc.thematic.classify',
                    visible: settingsPlugins.ThematicLayer && props.isAdmin && !props.element.thematic && props.element.search || false,
                    onClick: () => props.onUpdateParams && props.onUpdateParams({
                        thematic: {
                            unconfigured: true
                        }
                    })
                },
                {
                    glyph: 'trash',
                    tooltipId: 'toc.thematic.remove_thematic',
                    visible: settingsPlugins.ThematicLayer && props.isAdmin && props.element.thematic || false,
                    onClick: () => props.onUpdateParams && props.onUpdateParams({
                        thematic: null
                    })
                }
            ]
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
