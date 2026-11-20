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

export const isPausedSelector = state => !!state?.autorefresh?.paused;
export const isActiveRefreshSelector = state => !!state?.autorefresh?.enabled;
export const lastRefreshSelector = state => state?.autorefresh?.lastRefresh;
export const isDashboardSelector = state => /\/dashboard(?:\/|$)/.test(pathnameSelector(state))
    || !!state.dashboard?.resource || !!state.dashboard?.editor?.available;
export const canConfigureSelector = state => !!isLoggedIn(state) && (isDashboardSelector(state)
    ? !!state.dashboard?.resource?.canEdit || !state.dashboard?.resource?.id
    : !!mapIsEditableSelector(state) || mapIsNewSelector(state) || !mapIdSelector(state) && mapIsEditableSelector(state) !== false);

export const layerInstancesSelector = createSelector(
    layersSelector, groupsSelector, state => state.widgets?.containers, isDashboardSelector, mapTypeSelector,
    collectLayerInstances
);

export const editedLayerKeysSelector = createSelector(
    layersSelector, state => state.featuregrid,
    state => state.controls?.widgetBuilder?.enabled || state.dashboard?.editing ? state.widgets?.builder?.editor : undefined,
    getEditedLayerKeys
);

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

// Configuration includes hidden layers; only the scheduler filters by visibility/editing.
export const refreshableLayersSelector = createSelector(allLayersSelector,
    layers => layers.filter(layer => isValidInterval(layer.autoRefreshInterval)));
export const availableLayersSelector = createSelector(allLayersSelector,
    layers => layers.filter(layer => !isValidInterval(layer.autoRefreshInterval)));
export const eligibleLayersSelector = createSelector(refreshableLayersSelector,
    state => state.autorefresh?.minimumRefreshInterval || AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,
    (layers, minimum) => layers.filter(layer => layer.visibility && !layer.editing)
        .map(layer => ({ ...layer, autoRefreshInterval: Math.max(minimum, layer.autoRefreshInterval) })));

