/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { loadVersion } from '../actions/version';
import { triggerShowConnections } from '../actions/dashboard';
import appConfigDashboardEmbedded from './appConfigDashboardEmbedded';
import pluginsDashboardEmbedded from './pluginsDashboardEmbedded';
import main from './main';
import url from 'url';
import { checkForMissingPlugins } from '../utils/DebugUtils';

checkForMissingPlugins(pluginsDashboardEmbedded.plugins);

const { query } = url.parse(window.location.href, true);

main(
    appConfigDashboardEmbedded,
    pluginsDashboardEmbedded,
    (cfg) => ({
        ...cfg,
        initialActions: [
            loadVersion,
            triggerShowConnections.bind(null, !!query.connections)
        ]
    })
);
