/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { compose, setDisplayName } from 'recompose';
import { onEditorChange } from '../../../actions/widgets';

const mapLayerSelectorConnect = connect(() => ({}), {
    onLayerChoice: (...args) => onEditorChange(...args)
});

const mapLayerSelector = compose(
    setDisplayName('MapCatalogLayerSelector'),
    mapLayerSelectorConnect
);

export default mapLayerSelector;
