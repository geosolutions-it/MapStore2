/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { loadVersion } from '../actions/version';
import appConfigEmbedded from './appConfigEmbedded';
import apiPlugins from './apiPlugins';
import main from './main';
import { checkForMissingPlugins } from '../utils/DebugUtils';

checkForMissingPlugins(apiPlugins.plugins);

main(
    appConfigEmbedded,
    apiPlugins,
    (cfg) => ({
        ...cfg,
        initialActions: [loadVersion]
    })
);
