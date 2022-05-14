/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { loadVersion } from '../actions/version';
import appConfigEmbedded from './appConfigGeostoryEmbedded';
import pluginsEmbedded from './pluginsGeostoryEmbedded';
import main from './main';
import { checkForMissingPlugins } from '../utils/DebugUtils';

checkForMissingPlugins(pluginsEmbedded.plugins);

main(
    appConfigEmbedded,
    pluginsEmbedded,
    (cfg) => ({
        ...cfg,
        initialActions: [loadVersion]
    })
);
