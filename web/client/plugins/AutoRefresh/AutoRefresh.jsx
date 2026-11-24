/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { createPlugin } from '../../utils/PluginsUtils';
import {
    refreshableLayersSelector, availableLayersSelector, eligibleLayersSelector,
    isActiveRefreshSelector, isPausedSelector, lastRefreshSelector, canConfigureSelector, isDashboardSelector
} from './selectors/autorefresh';
import AutoRefreshContainer from './containers/AutoRefresh';
import { CONTROL_NAME, AUTOREFRESH_DEFAULT_REFRESH_INTERVAL, AUTOREFRESH_MINIMUM_REFRESH_INTERVAL } from './constants';
import autorefresh from './reducers/autorefresh';
import * as epics from './epics/autorefresh';
import { isValidInterval } from './utils';
import { autoRefreshStart, autoRefreshStop, autoRefreshInit, autoRefreshNow, setAutoRefreshInterval } from './actions/autorefresh';

/**
 * Configure and control automatic refresh for map and dashboard datasets.
 * The map control is displayed in MapFooter and the dashboard control in SidebarMenu.
 * Refresh intervals are saved as autoRefreshInterval on each layer in milliseconds;
 * the settings form displays seconds. Copies of a dataset share the configured interval.
 * Hidden datasets and datasets being edited are excluded from refreshes. Activation,
 * pause state and last-refresh status are transient and reset when loading a resource.
 * Logged-in users with resource edit permission can configure intervals; other viewers
 * can activate configured refreshes and request an immediate refresh.
 * @memberof plugins
 * @class
 * @name AutoRefresh
 * @param {object} cfg Plugin configuration.
 * @param {number} [cfg.defaultRefreshInterval=60000] Default interval in milliseconds for newly configured datasets.
 * Values below the effective minimum are clamped to that minimum.
 * @param {number} [cfg.minimumRefreshInterval=30000] Minimum interval in milliseconds enforced by the form and scheduler.
 * Both interval options must be finite, positive and at most 2147483647; invalid values use their defaults.
 * @example
 * {
 *     "name": "AutoRefresh",
 *     "cfg": {
 *         "defaultRefreshInterval": 60000,
 *         "minimumRefreshInterval": 30000
 *     }
 * }
 */
export const AutoRefresh = ({
    defaultRefreshInterval = AUTOREFRESH_DEFAULT_REFRESH_INTERVAL,
    minimumRefreshInterval = AUTOREFRESH_MINIMUM_REFRESH_INTERVAL,
    dashboard, sidebar, onInit, onStop, eligibleLayers = [], ...props
}) => {
    const minimum = isValidInterval(minimumRefreshInterval)
        ? minimumRefreshInterval : AUTOREFRESH_MINIMUM_REFRESH_INTERVAL;
    const interval = isValidInterval(defaultRefreshInterval)
        ? Math.max(minimum, defaultRefreshInterval) : Math.max(minimum, AUTOREFRESH_DEFAULT_REFRESH_INTERVAL);
    useEffect(() => {
        onInit(minimum);
        return onStop;
    }, [minimum, sidebar, onInit, onStop]);
    return dashboard && !sidebar ? null : <AutoRefreshContainer {...props} sidebar={sidebar}
        onStop={onStop} defaultRefreshInterval={interval} minimumRefreshInterval={minimum}
        eligibleCount={eligibleLayers.length}/>;
};

const AutoRefreshComponent = connect(createStructuredSelector({
    dashboard: isDashboardSelector,
    canConfigure: canConfigureSelector,
    enabled: isActiveRefreshSelector,
    paused: state => isPausedSelector(state) || refreshableLayersSelector(state).some(layer => layer.editing) && !eligibleLayersSelector(state).length,
    lastRefresh: lastRefreshSelector,
    availableLayers: availableLayersSelector,
    activeLayers: refreshableLayersSelector,
    eligibleLayers: eligibleLayersSelector
}), {
    onStart: autoRefreshStart,
    onStop: autoRefreshStop,
    onInit: autoRefreshInit,
    onRefreshNow: autoRefreshNow,
    onUpdateNode: (key, nodeType, properties) => setAutoRefreshInterval(key, properties.autoRefreshInterval)
})(AutoRefresh);

export default createPlugin('AutoRefresh', {
    component: AutoRefreshComponent,
    reducers: { autorefresh },
    epics,
    containers: {
        SidebarMenu: {
            name: CONTROL_NAME,
            position: 4,
            priority: 1,
            tool: props => <AutoRefreshComponent {...props.pluginCfg} sidebar/>,
            selector: state => ({ style: { display: isDashboardSelector(state) ? undefined : 'none' } })
        },
        MapFooter: {
            name: CONTROL_NAME,
            position: 20,
            target: 'right-footer',
            priority: 1
        }
    }
});
