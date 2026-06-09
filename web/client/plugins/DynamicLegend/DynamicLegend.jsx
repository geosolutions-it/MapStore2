/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import { Glyphicon } from 'react-bootstrap';

import { createPlugin } from '../../utils/PluginsUtils';
import { groupsSelector, layersSelector } from '../../selectors/layers';
import { currentZoomLevelSelector, mapBboxSelector, currentResolutionSelector } from '../../selectors/map';
import { updateNode } from '../../actions/layers';
import controls from '../../reducers/controls';
import { toggleControl } from '../../actions/controls';
import Message from '../../components/I18N/Message';
import dynamicLegendEpic from './epics/dynamiclegend';
import DynamicLegend from './components/DynamicLegend';
import { CONTROL_NAME } from './constants';
import { mapLayoutValuesSelector } from '../../selectors/maplayout';
import dynamiclegend from './reducers/dynamiclegend';
import { setConfiguration } from './actions/dynamiclegend';

/**
 * The DynamicLegend plugin shows the current map legend inside a panel.
 * The legend dynamically updates based on the current map view extent.
 * @name DynamicLegend
 * @memberof plugins
 * @class
 *
 * @prop {boolean} cfg.isFloating Legend is displayed as a modal. Default value is false
 * @prop {boolean} cfg.flatLegend Legend is displayed without any grouping or hierarchy, so all layers appear on the same level. Default value is false.
 *
 * @example
 * {
 *     "name": "DynamicLegend",
 *     "cfg": {
 *      "isFloating": false,
 *      "flatLegend": false
 *  }
 * }
 */
const DynamicLegendPlugin = connect(
    createSelector([
        (state) => get(state, 'controls.dynamic-legend.enabled'),
        groupsSelector,
        layersSelector,
        currentZoomLevelSelector,
        mapBboxSelector,
        currentResolutionSelector,
        state => mapLayoutValuesSelector(state, { height: true, right: true }, true)
    ], (isVisible, groups, layers, currentZoomLvl, mapBbox, resolution, dockStyle) => ({
        isVisible,
        groups,
        layers: layers.filter(layer => layer.group !== 'background'),
        currentZoomLvl,
        mapBbox,
        resolution,
        dockStyle
    })),
    {
        onClose: toggleControl.bind(null, CONTROL_NAME, null),
        onUpdateNode: updateNode,
        setConfiguration
    }
)(DynamicLegend);

/**
 * Plugin registration using MapStore's plugin system.
 */
export default createPlugin('DynamicLegend', {
    component: DynamicLegendPlugin,
    reducers: {
        controls,
        dynamiclegend
    },
    epics: dynamicLegendEpic,
    containers: {
        // review containers
        BurgerMenu: {
            name: CONTROL_NAME,
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="dynamiclegend.title" />,
            tooltip: <Message msgId="dynamiclegend.tooltip" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            toggle: true
        },
        SidebarMenu: {
            name: CONTROL_NAME,
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="dynamiclegend.title" />,
            tooltip: <Message msgId="dynamiclegend.tooltip" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            toggle: true
        },
        Toolbar: {
            name: CONTROL_NAME,
            alwaysVisible: true,
            position: 2,
            priority: 0,
            doNotHide: true,
            tooltip: <Message msgId="dynamiclegend.title" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, CONTROL_NAME, null),
            toggle: true
        }
    }
});
