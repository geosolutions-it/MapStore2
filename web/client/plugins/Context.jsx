/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as epics from '../epics/context';

import context from '../reducers/context';
import { createPlugin } from '../utils/PluginsUtils';

/**
 * Plugin for Context support. Adds state handlers to the application (reducer and epics).
 * @name Context
 * @memberof plugins
 */
export default createPlugin("Context", {
    component: () => null,
    reducers: {
        context
    },
    epics
});
