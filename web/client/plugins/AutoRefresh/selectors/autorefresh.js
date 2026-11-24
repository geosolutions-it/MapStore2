/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { layersSelector, groupsSelector } from '../../../selectors/layers';
import { mapIsEditableSelector, mapIsNewSelector, mapIdSelector } from '../../../selectors/map';
import { isLoggedIn } from '../../../selectors/security';
import { pathnameSelector } from '../../../selectors/router';
import { mapTypeSelector } from '../../../selectors/maptype';
import { collectLayerInstances, getEditedLayerKeys, isValidInterval } from '../utils';
import { AUTOREFRESH_MINIMUM_REFRESH_INTERVAL } from '../constants';

/**
 * Selectors for automatic refresh controls, dataset configuration and scheduling.
 * @memberof selectors
 * @static
 * @name autorefresh
 */

/**
 * Select whether refreshes are explicitly paused.
 * @function isPausedSelector
 * @param {object} state Redux state.
 * @returns {boolean} Whether automatic and immediate refreshes are suspended.
 * @memberof selectors.autorefresh
 */
export const isPausedSelector = state => !!state?.autorefresh?.paused;

/**
 * Select whether automatic refresh timers are enabled.
 * @function isActiveRefreshSelector
 * @param {object} state Redux state.
 * @returns {boolean} Whether automatic refresh is active.
 * @memberof selectors.autorefresh
 */
export const isActiveRefreshSelector = state => !!state?.autorefresh?.enabled;

/**
 * Select the last dispatched refresh time, rather than the completion time of data loading.
 * @function lastRefreshSelector
 * @param {object} state Redux state.
 * @returns {number|null|undefined} Unix timestamp in milliseconds, or an unset value before refresh.
 * @memberof selectors.autorefresh
 */
export const lastRefreshSelector = state => state?.autorefresh?.lastRefresh;

/**
 * Detect a dashboard from the route, loaded resource or available dashboard editor.
 * @function isDashboardSelector
 * @param {object} state Redux state.
 * @returns {boolean} Whether the current resource is a dashboard.
 * @memberof selectors.autorefresh
 */
export const isDashboardSelector = state => /\/dashboard(?:\/|$)/.test(pathnameSelector(state))
    || !!state.dashboard?.resource || !!state.dashboard?.editor?.available;
/**
 * Check whether the logged-in user can edit refresh intervals on the current resource.
 * New maps and dashboards can be configured before they have a resource ID.
 * @function canConfigureSelector
 * @param {object} state Redux state.
 * @returns {boolean} Whether interval configuration controls should be available.
 * @memberof selectors.autorefresh
 */
export const canConfigureSelector = state => !!isLoggedIn(state) && (isDashboardSelector(state)
    ? !!state.dashboard?.resource?.canEdit || !state.dashboard?.resource?.id
    : !!mapIsEditableSelector(state) || mapIsNewSelector(state) || !mapIdSelector(state) && mapIsEditableSelector(state) !== false);

/**
 * Collect supported layer instances from the main map and widget containers.
 * @function layerInstancesSelector
 * @param {object} state Redux state.
 * @returns {object[]} Layer instances with dataset keys, visibility and map/widget locations.
 * @memberof selectors.autorefresh
 */
export const layerInstancesSelector = createSelector(
    layersSelector, groupsSelector, state => state.widgets?.containers, isDashboardSelector, mapTypeSelector,
    collectLayerInstances
);

/**
 * Select datasets being edited in the feature grid or an active widget builder.
 * @function editedLayerKeysSelector
 * @param {object} state Redux state.
 * @returns {Set<string>} Dataset keys to protect from refreshes.
 * @memberof selectors.autorefresh
 */
export const editedLayerKeysSelector = createSelector(
    layersSelector, state => state.featuregrid,
    state => state.controls?.widgetBuilder?.enabled || state.dashboard?.editing ? state.widgets?.builder?.editor : undefined,
    getEditedLayerKeys
);

/**
 * Merge layer instances into one settings entry per dataset, using its dataset key as the ID.
 * Entries combine visibility, retain a valid saved interval and the newest refresh version,
 * and indicate whether any instance's dataset is being edited.
 * @function allLayersSelector
 * @param {object} state Redux state.
 * @returns {object[]} Unique supported datasets, including hidden and edited datasets.
 * @memberof selectors.autorefresh
 */
export const allLayersSelector = createSelector(layerInstancesSelector, editedLayerKeysSelector, (instances, edited) => {
    const datasets = {};
    instances.forEach(instance => {
        const { layer, key } = instance;
        const existing = datasets[key];
        const interval = isValidInterval(layer.autoRefreshInterval) ? layer.autoRefreshInterval : undefined;
        datasets[key] = {
            ...(existing || layer), id: key, title: existing?.title || layer.title || layer.name || layer.provider || layer.url,
            autoRefreshInterval: existing?.autoRefreshInterval ?? interval,
            visibility: !!existing?.visibility || instance.visible,
            _v_: Math.max(existing?._v_ || 0, layer._v_ || 0) || undefined,
            editing: edited.has(key)
        };
    });
    return Object.values(datasets);
});

/**
 * Select datasets with valid configured intervals, including hidden and edited datasets.
 * @function refreshableLayersSelector
 * @param {object} state Redux state.
 * @returns {object[]} Datasets listed in the active refresh settings.
 * @memberof selectors.autorefresh
 */
export const refreshableLayersSelector = createSelector(allLayersSelector,
    layers => layers.filter(layer => isValidInterval(layer.autoRefreshInterval)));

/**
 * Select supported datasets that do not yet have a valid refresh interval.
 * @function availableLayersSelector
 * @param {object} state Redux state.
 * @returns {object[]} Datasets available to add to the refresh settings.
 * @memberof selectors.autorefresh
 */
export const availableLayersSelector = createSelector(allLayersSelector,
    layers => layers.filter(layer => !isValidInterval(layer.autoRefreshInterval)));

/**
 * Select visible configured datasets that are not being edited, clamping intervals to the minimum.
 * Activation and pause state are checked separately by the epics.
 * @function eligibleLayersSelector
 * @param {object} state Redux state.
 * @returns {object[]} Eligible datasets with effective autoRefreshInterval values in milliseconds.
 * @memberof selectors.autorefresh
 */
export const eligibleLayersSelector = createSelector(refreshableLayersSelector,
    state => state.autorefresh?.minimumRefreshInterval || AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,
    (layers, minimum) => layers.filter(layer => layer.visibility && !layer.editing)
        .map(layer => ({ ...layer, autoRefreshInterval: Math.max(minimum, layer.autoRefreshInterval) })));

