import React from 'react';
import {defaultProps} from 'recompose';
import { Glyphicon } from 'react-bootstrap';

import html from 'raw-loader!./previews/responseHTML.txt';
import json from 'raw-loader!./previews/responseJSON.txt';
import text from 'raw-loader!./previews/responseText.txt';

import Message from '../../../../components/I18N/Message';
import HTML from '../../../../components/I18N/HTML';
import FeatureInfoCmp from '../../../../components/TOC/fragments/settings/FeatureInfo';
import {getAvailableInfoFormat} from '../../../../utils/MapInfoUtils';
import HTMLViewer from '../../../../components/data/identify/viewers/HTMLViewer';
import TextViewer from '../../../../components/data/identify/viewers/TextViewer';
import JSONViewer from '../../../../components/data/identify/viewers/JSONViewer';
import HtmlRenderer from '../../../../components/misc/HtmlRenderer';

import FeatureInfoEditor from '../../../../components/TOC/fragments/settings/FeatureInfoEditor';

const responses = {
    html,
    json: JSON.parse(json),
    text
};


const formatCards = {
    HIDDEN: {
        titleId: 'layerProperties.hideFormatTitle',
        descId: 'layerProperties.hideFormatDescription',
        glyph: 'hide-marker'
    },
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
            <div className="template-html-renderer" >
                <div>{template && template !== '<p><br></p>' ? <Message msgId="layerProperties.templatePreview" /> : null}</div>
                <br />
                <div>
                    {template && template !== '<p><br></p>' ?
                        <HtmlRenderer html={template} />
                        :
                        <span>
                            <p><Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: '{ }' }} /></p>
                            <pre>
                                <HTML msgId="layerProperties.templateFormatInfoAlertExample"/>
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
    defaultInfoFormat: Object.assign({ "HIDDEN": "text/html"}, getAvailableInfoFormat())
})(FeatureInfoCmp);

export default FeatureInfo;
