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
    updateFlexibleLayoutType,
    resizeFlexibleLayoutPanel,
    setActivePlugin,
    updateFlexibleLayoutStructure
} from '../actions/flexiblelayout';
import FlexibleLayoutPlugin from './flexiblelayout/FlexibleLayout';
import {
    activePluginsSelector,
    panelSizesSelector,
    flexibleLayoutTypeSelector
} from '../selectors/flexiblelayout';

const selector = createSelector(
    [
        activePluginsSelector,
        flexibleLayoutTypeSelector,
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

export default createPlugin('FlexibleLayout', {
    component: connect(
        selector,
        {
            onResize: updateFlexibleLayoutType,
            onResizePanel: resizeFlexibleLayoutPanel,
            onSelect: setActivePlugin,
            onUpdateStructure: updateFlexibleLayoutStructure,
            onUpdateMapSize: updateMapLayout
        })(FlexibleLayoutPlugin),
    reducers: {
        maplayout,
        controls
    }
});
