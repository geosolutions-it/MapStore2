/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import DefaultLayer from '../../TOC/components/DefaultLayer';
import { keepLayer } from '../utils/DynamicLegendUtils';

/**
 * Custom layer node component that filters and extends layers for dynamic legend display.
 *
 * @param {Object} props - Properties including the node to render.
 * @param {Object} props.node - Layer node data.
 * @returns {JSX.Element|null}
 */
const CustomLayerNodeComponent = ({ node, ...props }) => {
    if (!keepLayer(node)) {
        return null;
    }
    return (
        <DefaultLayer
            {...props}
            node={{
                ...node,
                enableDynamicLegend: true,
                enableInteractiveLegend: false
            }}
        />
    );
};

export default CustomLayerNodeComponent;
