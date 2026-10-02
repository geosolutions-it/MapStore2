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
import { createPlugin } from '../../utils/PluginsUtils';
import { userRoleSelector } from '../../selectors/security';
import { updateNode } from '../../actions/layers';

import { refreshableLayers, availableLayers, isActiveRefresh } from './selectors/autorefresh';
import AutoRefreshContainer from './containers/AutoRefresh';
import { createStructuredSelector } from 'reselect';
import { CONTROL_NAME } from './constants';
import autorefresh from './reducers/autorefresh';
import {
    layersAutoRefreshEpic
} from './epics/autorefresh';
import { mapTypeSelector } from '../../selectors/maptype';
import { autoRefreshStart, autoRefreshStop } from './actions/autorefresh';

/**
 * AutoRefresh plugin that provides automatic layer refresh functionality
 * @memberof plugins
 * @class
 * @name AutoRefresh
 * @param {number} cfg.defaultRefreshInterval - The default refresh interval in milliseconds (default to 60000)
 * @param {number} cfg.minimumRefreshInterval - The minimum refresh interval in milliseconds (default to 30000)
 * @example
 * ```json
 * {
 *   "name": "AutoRefresh",
 *   "cfg": {
 *     "defaultRefreshInterval": 30000,
 *     "minimumRefreshInterval": 10000
 *   }
 * }
 * ```
 */
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

        enabled: isActiveRefresh,
        availableLayers: availableLayers,
        activeLayers: refreshableLayers
    }), {
        onStart: autoRefreshStart,
        onStop: autoRefreshStop,
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
            layersAutoRefreshEpic
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
