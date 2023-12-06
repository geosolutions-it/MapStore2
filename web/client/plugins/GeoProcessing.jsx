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
import GeoProcessingPanel from './GeoProcessing/Panel';
import { toggleControl } from '../actions/controls';
import * as epics  from '../epics/geoProcessing';
import geoProcessing from '../reducers/geoProcessing';

import { createPlugin } from '../utils/PluginsUtils';

/**
 * Plugin for geo process layers
 *
 * options available are:
 * - "buffer" to create a new layer around the source layer
 * - "intersection" of two layers
 * the result is a new vector layer that is added in the TOC
 *
 * @name GeoProcessing
 * @memberof plugins
 * @class
*
 * @prop {string} cfg.selectedTool the values are "buffer", "intersection", default is "buffer"
 * @prop {string} cfg.wpsUrl the default value to use where to execute geoserver processes. It must support some mandatory wps processes like geo:buffer,gs:IntersectionFeatureCollection,gs:CollectGeometries
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
 *   "name": "GeoProcessing",
 *   "cfg": {
 *     "wpsUrl": "http://localhost:8080/geoserver/wps",
 *     "selectedTool": "buffer",
 *     "buffer": {
 *       "quadrantSegments": 200,
 *       "capStyle": "Round"
 *     }
 *   }
 * }
 *
 */
const GeoProcessing = createPlugin(
    "GeoProcessing",
    {
        component: GeoProcessingPanel,
        containers: {
            SidebarMenu: {
                name: 'GeoProcessing',
                position: 2100,
                doNotHide: true,
                tooltip: "GeoProcessing.tooltip.siderBarBtn",
                text: <Message msgId="GeoProcessing.title" />,
                icon: <Glyphicon glyph="globe-settings" />,
                action: toggleControl.bind(null, 'GeoProcessing', null),
                priority: 10,
                toggle: true
            },
            BurgerMenu: {
                name: 'GeoProcessing',
                position: 2100,
                doNotHide: true,
                tooltip: "GeoProcessing.tooltip.siderBarBtn",
                text: <Message msgId="GeoProcessing.title" />,
                icon: <Glyphicon glyph="globe-settings" />,
                action: toggleControl.bind(null, 'GeoProcessing', null),
                priority: 12,
                toggle: true
            }
        },
        reducers: {
            geoProcessing
        },
        epics
    });

export default GeoProcessing;
