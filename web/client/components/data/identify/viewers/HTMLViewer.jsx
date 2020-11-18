/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import HtmlRenderer from '../../../misc/HtmlRenderer';

const regexpBody = /^[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*$/i;
const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;

class HTMLViewer extends React.Component {
    static propTypes = {
        response: PropTypes.string
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response;
    }

    render() {
        let response = this.props.response || '';
        // gets css rules from the response and removes which are related to body tag.
        let styleMatch = regexpStyle.exec(response);
        let style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(response)[1] : "";
        style = style.replace(/body[,]+/g, '');
        // gets feature info managing an eventually empty response
        let content = response.replace(regexpBody, '$1').trim();
        return <HtmlRenderer html={style + content} />;
    }
}

export default HTMLViewer;
