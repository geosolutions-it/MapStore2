/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { shouldUpdate } from 'recompose';
import TEMPLATE from './TemplateViewer';
import PROPERTIES from './PropertiesViewer';

const Viewers = {
    TEMPLATE,
    PROPERTIES
};

export default shouldUpdate((props, nextProps) => nextProps.response !== props.response)(
    props => {
        const type = props.layer && props.layer.featureInfo && props.layer.featureInfo.format && (props.layer.featureInfo.template && props.layer.featureInfo.template !== '<p><br></p>') && props.layer.featureInfo.format || 'PROPERTIES';
        const Viewer = Viewers[type] || Viewers.PROPERTIES;
        return <Viewer {...props}/>;
    }
);
