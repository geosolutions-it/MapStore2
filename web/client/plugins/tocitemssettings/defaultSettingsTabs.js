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
const General = require('../../components/TOC/fragments/settings/General');
const Display = require('../../components/TOC/fragments/settings/Display');
const WMSStyle = require('../../components/TOC/fragments/settings/WMSStyle');
const Elevation = require('../../components/TOC/fragments/settings/Elevation');

const HTMLViewer = require('../../components/data/identify/viewers/HTMLViewer');
const TextViewer = require('../../components/data/identify/viewers/TextViewer');
const JSONViewer = require('../../components/data/identify/viewers/JSONViewer');
const HtmlRenderer = require('../../components/misc/HtmlRenderer');

const MapInfoUtils = require('../../utils/MapInfoUtils');

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
        body: () => <TextViewer response={responses.text}/>
    },
    HTML: {
        titleId: 'layerProperties.htmlFormatTitle',
        descId: 'layerProperties.htmlFormatDescription',
        glyph: 'ext-html',
        body: () => <HTMLViewer response={responses.html}/>
    },
    PROPERTIES: {
        titleId: 'layerProperties.propertiesFormatTitle',
        descId: 'layerProperties.propertiesFormatDescription',
        glyph: 'ext-json',
        body: () => <JSONViewer response={responses.json} />
    },
    CUSTOM: {
        titleId: 'layerProperties.customFormatTitle',
        descId: 'layerProperties.customFormatDescription',
        glyph: 'ext-empty',
        body: ({template = ''}) => template && template !== '<p><br></p>' && <HtmlRenderer html={template}/>
        || <div>
            <p><i><Message msgId="layerProperties.customFormatInfoAlert1"/></i>&nbsp;<Glyphicon glyph="pencil"/></p>
            <p><i><Message msgId="layerProperties.customFormatInfoAlert2" msgParams={{ attribute: '{ }'}}/></i></p>
            <pre>
                <Message msgId="layerProperties.customFormatInfoAlertExample" msgParams={{ properties: '{ properties.id }' }}/>
            </pre>
        </div>
    }
};

const FeatureInfo = defaultProps({
    formatCards,
    defaultInfoFormat: MapInfoUtils.getAvailableInfoFormat()
})(require('../../components/TOC/fragments/settings/FeatureInfo'));

module.exports = ({showFeatureInfoTab = true, ...props}) => [
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
        Component: WMSStyle
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
                visible: !props.showEditor && props.element && props.element.featureInfo && props.element.featureInfo.format === 'CUSTOM' || false,
                onClick: () => props.onShowEditor && props.onShowEditor(!props.showEditor)
            }
        ]
    },
    {
        id: 'elevation',
        titleId: 'layerProperties.elevation',
        tooltipId: 'layerProperties.elevation',
        glyph: '1-vector',
        visible: props.settings.nodeType === 'layers' && props.element.type === "wms" && props.element.dimensions && props.elevationDim,
        Component: Elevation
    }
].filter(tab => tab.visible);
