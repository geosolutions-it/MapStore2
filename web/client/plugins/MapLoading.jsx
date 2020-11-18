
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './maploading/maploading.css';

import assign from 'object-assign';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import GlobalSpinner from '../components/misc/spinners/GlobalSpinner/GlobalSpinner';
import { layersSelector } from '../selectors/layers';

const selector = createSelector([layersSelector], (layers) => ({
    loading: layers && layers.some((layer) => layer.loading)
}));

const MapLoadingPlugin = connect(selector)(GlobalSpinner);

/**
 * Loading spinner rendered in the {@link #plugins.Toolbar|Toolbar}
 * when layers are loading.
 * @name MapLoading
 * @class
 * @memberof plugins
 */
export default {
    MapLoadingPlugin: assign(MapLoadingPlugin, {
        Toolbar: {
            name: 'maploading',
            position: 1,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
