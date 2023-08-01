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
import GeoProcessingToolsPanel from './GeoProcessingTools/Panel';
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
 * @prop {string} cfg.selectedTool the values are "buffer", "intersection", default is "buffer"
 * @prop {number} cfg.buffer.quadrantSegments Number determining the style and smoothness of buffer corners. Positive numbers create round corners with that number of segments per quarter-circle, 0 creates flat corners, default is unset.
 * @prop {string} cfg.buffer.capStyle Style for the buffer end caps. Values are: Round - rounded ends (default), Flat - flat ends; Square - square ends, default is unset
 * @prop {string} cfg.intersection.firstAttributeToRetain First feature collection attribute to include
 * @prop {string} cfg.intersection.secondAttributeToRetain Second feature collection attribute to include
 * @prop {string} cfg.intersection.intersectionMode Specifies geometry computed for intersecting features. INTERSECTION (default) computes the spatial intersection of the inputs. FIRST copies geometry A. SECOND copies geometry B.
 * @prop {boolean} cfg.intersection.percentagesEnabled Indicates whether to output feature area percentages (attributes percentageA and percentageB)
 * @prop {boolean} cfg.intersection.areasEnabled Indicates whether to output feature areas (attributes areaA and areaB)
 *
 * @example
 *
 * {
 *   "name": "GeoProcessingTools",
 *   "cfg": {
 *     "selectedTool": "buffer",
 *     "buffer": {
 *       "quadrantSegments": 200,
 *       "capStyle": "Round"
 *     }
 *   }
 * }
 *
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
