/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Dashboard from './pages/Dashboard';
import version from '../reducers/version';

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
    storeOpts: {
        persist: {
            whitelist: ['security']
        }
    }
};
