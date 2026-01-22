/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";

import usePluginItems from "../../hooks/usePluginItems";
import AutoRefreshContainer from './containers/AutoRefresh';
import { createPlugin } from '../../utils/PluginsUtils';
import { createStructuredSelector } from 'reselect';
import { layersSelector } from '../../selectors/layers';
import { isLoggedIn, userRoleSelector } from '../../selectors/security';
import { CONTROL_NAME } from './constants';
import { registerCustomSaveHandler } from '../../selectors/mapsave';
import { setEnabled, setInterval, setLayerIds } from './actions/autorefresh';
import { autorefreshEnabledSelector, autorefreshIntervalSelector, autorefreshLayerIdsSelector } from './selectors/autorefresh';
import * as epics from './epics/autorefresh';
import autorefresh from './reducers/autorefresh';

registerCustomSaveHandler(CONTROL_NAME, (state) => (state?.[CONTROL_NAME]));

const AutoRefresh = ({ items, ...props }, context) => {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    return (
        <AutoRefreshContainer
            {...props}
            configuredItems={configuredItems}
        />
    );
};

AutoRefresh.contextTypes = {
    loadedPlugins: PropTypes.object
};

const autoRefreshConnect = connect(
    createStructuredSelector({
        isLoggedIn: isLoggedIn,
        userRoles: userRoleSelector,
        map: state => state?.mapConfigRawData,
        layers: layersSelector,
        activeLayerIds: autorefreshLayerIdsSelector,
        enabled: autorefreshEnabledSelector,
        interval: autorefreshIntervalSelector
    }), {
        onSetLayerIds: setLayerIds,
        onSetEnabled: setEnabled,
        onSetInterval: setInterval
    }
);

const AutoRefreshComponent = autoRefreshConnect(AutoRefresh);

AutoRefreshComponent.propTypes = {
    items: PropTypes.array
};

export default createPlugin(
    'AutoRefresh',
    {
        component: AutoRefreshComponent,
        reducers: {
            autorefresh
        },
        epics,
        containers: {
            SidebarMenu: {},
            BurgerMenu: {},
            MapFooter: {
                name: "autorefresh",
                position: 20,
                target: 'right-footer',
                priority: 1
            }
        }
    }
);
