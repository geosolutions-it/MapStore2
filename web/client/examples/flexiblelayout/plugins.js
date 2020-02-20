/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FlexibleLayoutPlugin from '../../plugins/FlexibleLayout';
import MapPlugin from '../../plugins/Map';
import TOCPlugin from '../../plugins/TOC';

import InfoPanelPlugin from './plugins/InfoPanel';

export const plugins = {
    FlexibleLayoutPlugin,
    MapPlugin,
    TOCPlugin,

    // plugin to test layout functionality
    InfoPanelPlugin
};

export const requires = {};

export default {
    plugins,
    requires
};
