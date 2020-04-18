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

/**
 * Plugin for flexible layout container
 * @name FlexibleLayout
 * @memberof plugins
 * @prop {array} cfg.minMapViewSize [width, height] under this sizes the padding of map layout are not calculated but reset to 0
 * @prop {object} cfg.breakpoints all width breakpoints divided by layout type ('sm', 'md' and 'lg')
 * @prop {array} cfg.breakpoints[layoutType] min width and max with breakpoints to trigger specific layout type ('sm', 'md' and 'lg')
 * @prop {object} cfg.options options for all layout bodies divided by layout type ('sm', 'md' and 'lg')
 * @prop {array} cfg.options[layoutType].dragMargin [width, height] stop resize of panels if available space is less than dragMargin
 * @prop {array} cfg.options[layoutType].minLayoutBodySize [width, height] hide component in the body if the available body space is less than minLayoutBodySize
 * @prop {boolean} cfg.options[layoutType].resizeDisabled disable resize of all panels
 * @prop {array} cfg.options[layoutType].steps enable resize by percentage step based on the available resize space eg: [0, 0.5, 1]
 * @prop {number} cfg.options[layoutType].maxDragThreshold threshold to resize to nearest step
 * @prop {number} cfg.options[layoutType].initialStepIndex initial step index
 * @prop {number} cfg.resizeDebounceTime debounce time after resize the container to update the new layout
 * @prop {array} cfg.itemsMapping map items to containers eg: [{ key: 'bodyItems', containerName: 'body' }],
 *
 * @example
 * // This example shows how to configure a right panel inside the FlexibleLayout
 * import React from 'react';
 * import { createPlugin } from '../utils/PluginsUtils';
 *
 * const MyPlugin = () => {
 *   return (
 *     <div><h4>Right panel example</h4></div>
 *   );
 * };
 *
 * export default createPlugin('MyPlugin', {
 *   component: MyPlugin,
 *   containers: {
 *     FlexibleLayout: {
 *       priority: 1,
 *       glyph: 'question-sign',
 *       position: 1,
 *       size: 'auto',
 *       container: 'right-menu'
 *     }
 *   }
 * });
 *
 * // All available containers of FlexibleLayout:
 * // `body`, `background`, `center`, `left-menu`, `right-menu`, `column`, `bottom`, `header` and `footer`
 * // only `left-menu` and `right-menu` containers accept parameters displayed above in the right panel example
 * // others accept only `priority` and `container` parameters
 */

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
