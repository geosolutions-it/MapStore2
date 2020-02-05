/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import get from 'lodash/get';
import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';
import { mapSelector } from '../selectors/map';
import { updateMapLayout } from '../actions/maplayout';
import maplayout from '../reducers/maplayout';
import controls from '../reducers/controls';
import { userSelector } from '../selectors/security';
import {
    updateLayoutType,
    resizeLayoutPanel,
    setActivePlugin,
    updateLayoutStructure
} from '../actions/layout';
import LayoutPlugin from './layout/Layout';
import {
    activePluginsSelector,
    panelSizesSelector,
    layoutTypeSelector
} from '../selectors/layout';

const selector = createSelector(
    [
        activePluginsSelector,
        layoutTypeSelector,
        state => get(state, 'mapInitialConfig.loadingError'),
        mapSelector,
        userSelector,
        panelSizesSelector
    ], (activePlugins, type, mapLoadingError, map, user, panelSizes) => ({
        activePlugins,
        type,
        error: mapLoadingError,
        loading: !map && !mapLoadingError,
        user,
        panelSizes
    })
);

export default createPlugin('Layout', {
    component: connect(
        selector,
        {
            onResize: updateLayoutType,
            onResizePanel: resizeLayoutPanel,
            onSelect: setActivePlugin,
            onUpdateStructure: updateLayoutStructure,
            onUpdateMapSize: updateMapLayout
        })(LayoutPlugin),
    reducers: {
        maplayout,
        controls
    }
});
