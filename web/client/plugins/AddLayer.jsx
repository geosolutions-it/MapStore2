/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPlugin } from '../utils/PluginsUtils';

const AddLayer = () => null;

/**
 * Plugin that activate the AddLayer button in the TOC.
 * Requires the MetadataExplorer Plugin To Work.
 * TODO: inject the button directly from this button
 * @memberof plugins
 * @requires plugins.MetadataExplorer
 * @requires plugins.TOC
 */
export default createPlugin('AddLayer',
    {
        component: AddLayer,
        containers: {
            TOC: {
                name: "AddLayer"
            }
        }
    }
);
