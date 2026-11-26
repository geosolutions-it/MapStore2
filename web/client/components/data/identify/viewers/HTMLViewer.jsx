/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import ShadowHtml from '../../../misc/ShadowHtml';
import SandboxedHtmlFrame from '../../../misc/SandboxedHtmlFrame';
import localizedProps from '../../../misc/enhancers/localizedProps';

const regexpBody = /^[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*$/i;
const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;
const LocalizedHtmlFrame = localizedProps('title')(SandboxedHtmlFrame);
/**
 * The HTML view of a layer asks for frame rendering with `featureInfo.htmlFrame: true`.
 */
const isFrameRequested = (layer) => layer?.featureInfo?.htmlFrame === true;

class HTMLViewer extends React.Component {
    static propTypes = {
        response: PropTypes.string,
        layer: PropTypes.object
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response || nextProps.layer?.featureInfo?.htmlFrame !== this.props.layer?.featureInfo?.htmlFrame;
    }

    render() {
        let response = this.props.response || '';
        if (isFrameRequested(this.props.layer)) {
            return <LocalizedHtmlFrame html={response} title="identifyTitle" />;
        }
        // gets css rules from the response and removes which are related to body tag.
        let styleMatch = regexpStyle.exec(response);
        let style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(response)[1] : "";
        style = style.replace(/body[,]+/g, '');
        // gets feature info managing an eventually empty response
        let content = response.replace(regexpBody, '$1').trim();
        // rendered in a shadow root (ShadowHtml) so the WMS <style> block is scoped
        // to this panel and does not restyle the rest of the application.
        return <ShadowHtml html={style + content} />;
    }
}

export default HTMLViewer;
