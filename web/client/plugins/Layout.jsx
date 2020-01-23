/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';
import { createShallowSelectorCreator } from '../utils/ReselectUtils';
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

const activePluginsSelector = createShallowSelectorCreator((a, b) => a === b)(
    state => get(state, 'controls.layout.activePlugins') || [],
    activePlugins => activePlugins
);

const panelSizesSelector = createShallowSelectorCreator(
    (a, b) => a === b
        || !isNil(a) && !isNil(b) && a.width === b.width && a.height === b.height
)(
    state => get(state, 'controls.layout.panelSizes') || {},
    panelSizes => panelSizes
);

const selector = createSelector(
    [
        activePluginsSelector,
        state => get(state, 'controls.layout.type'),
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
