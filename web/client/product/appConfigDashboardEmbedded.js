/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Dashboard from './pages/Dashboard';
import version from '../reducers/version';
import dashboardEpics from '../epics/dashboard';
import widgetsEpics from '../epics/widgets';

import dashboard from '../reducers/dashboard';
import widgets from '../reducers/widgets';

export default {
    pages: [{
        name: 'dashboard-embedded',
        path: '/:did',
        component: Dashboard,
        pageConfig: {
            name: 'dashboard-embedded'
        }
    }],
    initialState: {
        defaultState: {},
        mobile: {}
    },
    baseReducers: {
        version,
        dashboard,
        widgets
    },
    baseEpics: {
        ...dashboardEpics,
        ...widgetsEpics
    },
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
