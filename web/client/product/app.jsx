/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import main from './main';
import appConfig from './appConfig';
import pluginsDef from './plugins';


const missingPlugins = Object.keys(pluginsDef.plugins).filter(plugin => pluginsDef.plugins[plugin].default);

if (missingPlugins.length) {
    console.error("plugin not correctly loaded: ", missingPlugins);
}


main(appConfig, pluginsDef);
