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
        {response.features.map((feature, i) =>
            <div key={i}>
                <HtmlRenderer html={template(getCleanTemplate(layer.featureInfo && layer.featureInfo.template || '', feature, /\$\{.*?\}/g, 2, 1))(feature)}/>
            </div>
        )}
    </div>
);
