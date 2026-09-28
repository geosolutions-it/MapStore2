/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';
import InlineLoader from '../components/InlineLoader';
import { layerTransientSelector } from '../../../selectors/layers';
import { NodeTypes } from '../../../utils/LayersUtils';

const isGroupLoading = (group, layerTransientProps) =>
    (group?.nodes || []).some(child => child?.nodes
        ? isGroupLoading(child, layerTransientProps)
        : !!layerTransientProps[child?.id]?.loading);

const ConnectedInlineLoader = connect((state, { node, nodeType }) => {
    const layerTransientProps = layerTransientSelector(state);
    return {
        loading: nodeType === NodeTypes.GROUP
            ? isGroupLoading(node, layerTransientProps)
            : !!layerTransientProps[node?.id]?.loading
    };
})(InlineLoader);

export default ConnectedInlineLoader;
