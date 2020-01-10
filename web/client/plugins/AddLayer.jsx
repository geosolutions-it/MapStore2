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
 * Requires the MetadataExplorer Plugin To Work
 */
export default createPlugin('AddLayer',
    {
        component: AddLayer,
        containers: {
            TOC: {
                name: "AddLayer",
                position: 1
            }
        }
    }
);
