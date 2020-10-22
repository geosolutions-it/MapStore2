/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createPlugin } from '../utils/PluginsUtils';

// dummy plugin
const FilterLayer = () => null;

/**
 * Plugin that activate the FilterLayer button in the {@link #plugins.TOC|TOC}.
 * **Requires the {@link #plugins.QueryPanel|QueryPanel} plugin to work**
 * @name FilterLayer
 * @class
 * @memberof plugins
 * @requires plugins.QueryPanel
 */
export default createPlugin('FilterLayer',
    {
        component: FilterLayer,
        containers: {
            TOC: {
                name: "FilterLayer"
            }
        }
    }
);
