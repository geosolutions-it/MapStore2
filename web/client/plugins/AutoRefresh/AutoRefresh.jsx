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
 * Automatic refresh for map and dashboard datasets. Intervals are stored in milliseconds.
 * Activation and last-refresh status are transient and reset when loading a resource.
 * @memberof plugins
 * @class
 * @name AutoRefresh
 * @param {number} cfg.defaultRefreshInterval Default interval in milliseconds (60000).
 * @param {number} cfg.minimumRefreshInterval Minimum interval in milliseconds (30000).
 * @example
 * { "name": "AutoRefresh", "cfg": { "defaultRefreshInterval": 60000, "minimumRefreshInterval": 30000 } }
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
