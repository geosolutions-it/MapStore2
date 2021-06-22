/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { template } from 'lodash';
import { getCleanTemplate } from '../../../../utils/TemplateUtils';
import HtmlRenderer from '../../../misc/HtmlRenderer';

export default ({layer = {}, response}) => (
    <div className="ms-template-viewer">
        {response.features.map((feature, i) => {
            const cleanTemplate = getCleanTemplate(layer.featureInfo && layer.featureInfo.template || '', feature, /\$\{.*?\}/g, 2, 1);
            let html = "";
            try {
                html = template(cleanTemplate)(feature);
            } catch (e) {
                console.error(e);
                html = "There was an error parsing the template, please check if the template contains a minus -, like ${ properties.data-array } ";
            }
            return (<div key={i}>
                <HtmlRenderer html={html}/>
            </div>);
        }
        )}
    </div>
);
