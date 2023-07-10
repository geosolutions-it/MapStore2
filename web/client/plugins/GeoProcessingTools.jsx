/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Message from '../components/I18N/Message';
import GeoProcessingToolsPanel from './GeoProcessingTools/GeoProcessingToolsPanel';
import { toggleControl } from '../actions/controls';
import * as epics  from '../epics/geoProcessingTools';
import geoProcessingTools from '../reducers/geoProcessingTools';

import { createPlugin } from '../utils/PluginsUtils';

/**
 * Plugin for geo process layers
 *
 * options available are:
 * - "buffer" to create a new layer around the source layer
 * - "intersection" of two layers
 * the result is a new vector layer that is added in the TOC
 *
 * @name GeoProcessingTools
 * @memberof plugins
 * @class
 *
 * @example
 *
 * {
 *   "name": "GeoProcessingTools",
 *   "cfg": {
 *   }
 * }
 * `
 */
const GeoProcessingTools = createPlugin(
    "GeoProcessingTools",
    {
        component: GeoProcessingToolsPanel,
        containers: {
            SidebarMenu: {
                name: 'GeoProcessingTools',
                position: 2100,
                doNotHide: true,
                tooltip: "GeoProcessingTools.tooltip.siderBarBtn",
                text: <Message msgId="GeoProcessingTools.title" />,
                icon: <Glyphicon glyph="star" />, // [ ] change this
                action: toggleControl.bind(null, 'GeoProcessingTools', null),
                priority: 10,
                toggle: true
            }
        },
        reducers: {
            geoProcessingTools
        },
        epics
    });

export default GeoProcessingTools;
