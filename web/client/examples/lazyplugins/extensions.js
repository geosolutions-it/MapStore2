/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPlugin } from "../../utils/PluginsUtils";

export default {
    Extension: createPlugin('Extension', {
        lazy: true,
        loader: () => import(/* webpackChunkName: "extensions/dummy-extension" */`./plugins/Extension`),
        enabler: (state) => state && state.zoom === 6
    })
};
