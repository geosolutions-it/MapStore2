/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {template} = require('lodash');
const TemplateUtils = require('../../../../utils/TemplateUtils');
const HtmlRenderer = require('../../../misc/HtmlRenderer');

module.exports = ({layer = {}, response}) => (
    <div className="ms-template-viewer">
        {response.features.map((feature, i) =>
            <div key={i}>
                <HtmlRenderer html={template(TemplateUtils.getCleanTemplate(layer.featureInfo && layer.featureInfo.template || '', feature, /\$\{.*?\}/g, 2, 1))(feature)}/>
            </div>
        )}
    </div>
);
