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
import { userRoleSelector } from '../../selectors/security';
import { CONTROL_NAME } from './constants';
import { autorefreshUpdateAvailableLayers, autorefreshStart, autorefreshStop, autorefreshUpdateActiveLayer } from './actions/autorefresh';
import { updateNode } from '../../actions/layers';
import { autorefreshArchivedTicksSelector, autorefreshAvailableLayersSelector, autorefreshEnabledSelector, autorefreshLayersSelector } from './selectors/autorefresh';
import autorefresh from './reducers/autorefresh';
import {
    autorefreshStartEpicCreation,
    autorefreshUpdateNodeEpicCreation,
    autorefreshRemoveNodeEpicCreation,
    autorefreshActiveLayerChangeEpicCreation,
    autorefreshMapVisualisationModeChangeEpicCreation
} from './epics/autorefresh';
import { mapTypeSelector } from '../../selectors/maptype';

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
        userRoles: userRoleSelector,
        mapType: mapTypeSelector,
        layers: layersSelector,

        enabled: autorefreshEnabledSelector,
        availableLayers: autorefreshAvailableLayersSelector,
        activeLayers: autorefreshLayersSelector,
        ticks: autorefreshArchivedTicksSelector
    }), {
        onStart: autorefreshStart,
        onStop: autorefreshStop,
        onUpdateLayer: autorefreshUpdateActiveLayer,
        onUpdateAvailableLayers: autorefreshUpdateAvailableLayers,
        onUpdateNode: updateNode
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
        epics: {
            autorefreshStartEpicCreation,
            autorefreshUpdateNodeEpicCreation,
            autorefreshRemoveNodeEpicCreation,
            autorefreshActiveLayerChangeEpicCreation,
            autorefreshMapVisualisationModeChangeEpicCreation
        },
        containers: {
            SidebarMenu: {},
            BurgerMenu: {},
            MapFooter: {
                name: CONTROL_NAME,
                position: 20,
                target: 'right-footer',
                priority: 1
            }
        }
    }
);
