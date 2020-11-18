/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import gridEventsEnhancer from './gridEvents';
import gridToolsEnhancer from './gridTools';
import pageEventsEnhancer from './pageEvents';
import toolbarEventsEnhancer from './toolbarEvents';

export const gridEvents = gridEventsEnhancer;
export const gridTools = gridToolsEnhancer;
export const pageEvents = pageEventsEnhancer;
export const toolbarEvents = toolbarEventsEnhancer;

export default {
    gridTools,
    toolbarEvents,
    gridEvents,
    pageEvents
};
