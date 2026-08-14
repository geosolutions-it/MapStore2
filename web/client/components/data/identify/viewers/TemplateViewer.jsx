/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

import { getCleanTemplate, generateTemplateString } from '../../../../utils/TemplateUtils';
import HtmlRenderer from '../../../misc/HtmlRenderer';
import Message from '../../../I18N/Message';


const TemplateViewer = ({layer = {}, response}) => (
    <div className="ms-template-viewer">
        {response?.features?.map((feature, i) => {
            const cleanTemplate = getCleanTemplate(layer.featureInfo && layer.featureInfo.template || '', feature, /\$\{.*?\}/g, 2, 1);
            let html = "";
            try {
                html = generateTemplateString(
                    cleanTemplate,
                    (v) => DOMPurify.sanitize(String(v ?? ''))
                )(feature);
            } catch (e) {
                console.error(e);
                return (<div key={i}>
                    <Message msgId="layerProperties.templateError"/>
                </div>);
            }
            return (<div key={i}>
                <HtmlRenderer html={html}/>
            </div>);
        }
        )}
    </div>
);

export default TemplateViewer;

TemplateViewer.propTypes = {
    response: PropTypes.object,
    layer: PropTypes.object
};
