/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';
import InlineLoader from '../components/InlineLoader';
import { layerLoadingByIdSelector } from '../../../selectors/layers';

const ConnectedInlineLoader = connect((state, ownProps) => ({
    loading: layerLoadingByIdSelector(ownProps.node?.id)(state)
}))(InlineLoader);

export default ConnectedInlineLoader;

