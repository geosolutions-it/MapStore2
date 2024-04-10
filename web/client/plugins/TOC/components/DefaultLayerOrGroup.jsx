/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { NodeTypes } from '../../../utils/LayersUtils';

/**
 * DefaultLayerOrGroup is the LayersTree core component and manage the distribution of groups and layers nodes
 * @prop {string} node group or layer node
 * @prop {node} groupElement component that represents the group node
 * @prop {node} layerElement component that represents the layer node
 * @prop {node} containerNode container node, used by sorting handler of default groups and layers
 */
function DefaultLayerOrGroup({
    node,
    groupElement,
    layerElement,
    ...props
}) {
    if (!groupElement || !layerElement) {
        return null;
    }
    if (node.nodes) {
        return cloneElement(
            groupElement,
            {
                node,
                nodeType: props.nodeTypes.GROUP,
                ...props
            },
            <DefaultLayerOrGroup groupElement={groupElement} layerElement={layerElement}/>
        );
    }
    return cloneElement(layerElement, { node, nodeType: props.nodeTypes.LAYER, ...props });
}

DefaultLayerOrGroup.propTypes = {
    node: PropTypes.object,
    groupElement: PropTypes.element.isRequired,
    layerElement: PropTypes.element.isRequired,
    nodeTypes: PropTypes.object
};

DefaultLayerOrGroup.defaultProps = {
    node: {},
    nodeTypes: NodeTypes
};

export default DefaultLayerOrGroup;
