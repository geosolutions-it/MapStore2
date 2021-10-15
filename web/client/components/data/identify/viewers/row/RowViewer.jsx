/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isString } from 'lodash';
import PropertiesViewer from './PropertiesViewer';
import { getRowViewer } from '../../../../../utils/MapInfoUtils';
import { ANNOTATIONS } from '../../../../../utils/AnnotationsUtils';
import PropTypes from 'prop-types';

const defaultRowViewerOptions = {
    // we need some default options for annotations
    // to ensure that only title and description are displayed
    // when the custom row viewer is not mounted
    [ANNOTATIONS]: {
        include: ['title', 'description'],
        labelIds: {
            title: 'annotations.field.title',
            description: 'annotations.field.description'
        }
    }
};

function RowViewer({
    layer,
    component,
    feature
}) {
    // the name of the registered viewer could be associate by a string in the rowViewer or id
    const layerRowViewerProperty = layer?.rowViewer || layer?.layerId;
    const defaultOptions = isString(layerRowViewerProperty) ? defaultRowViewerOptions[layerRowViewerProperty] : {};
    const excludeProperties = defaultOptions?.exclude ? defaultOptions.exclude : ['bbox'];
    const includeProperties = defaultOptions?.include;
    const labelIds = defaultOptions?.labelIds;
    const layerRowViewer = isString(layerRowViewerProperty) ? getRowViewer(layerRowViewerProperty) : layerRowViewerProperty;
    const Row = layerRowViewer || component || PropertiesViewer;
    return (
        <Row
            {...feature.properties}
            feature={feature}
            labelIds={labelIds}
            exclude={excludeProperties}
            include={includeProperties}
        />
    );
}

RowViewer.propTypes = {
    layer: PropTypes.string,
    component: PropTypes.array,
    feature: PropTypes.array
};

RowViewer.defaultProps = {
    layer: {},
    feature: {}
};

export default RowViewer;
