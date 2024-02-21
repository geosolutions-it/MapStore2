/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';

function DefaultLayerOrGroup({
    node,
    groupElement: DefaultGroup,
    layerElement: DefaultLayer,
    ...props
}) {
    if (node.nodes) {
        return cloneElement(
            DefaultGroup,
            {
                node,
                nodeType: props.nodeTypes.GROUP,
                ...props
            },
            <DefaultLayerOrGroup groupElement={DefaultGroup} layerElement={DefaultLayer}/>
        );
    }
    return cloneElement(DefaultLayer, { node, nodeType: props.nodeTypes.LAYER, ...props });
}

DefaultLayerOrGroup.propTypes = {
    node: PropTypes.object,
    groupElement: PropTypes.element.isRequired,
    layerElement: PropTypes.element.isRequired
};

export default DefaultLayerOrGroup;
