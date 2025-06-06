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
import { groupsSelector } from '../../selectors/layers';
import { currentZoomLevelSelector, mapBboxSelector, currentResolutionSelector } from '../../selectors/map';
import { updateNode } from '../../actions/layers';
import controls from '../../reducers/controls';
import { toggleControl } from '../../actions/controls';
import Message from '../../components/I18N/Message';

import DynamicLegend from './components/DynamicLegend';

const DynamicLegendPlugin = connect(
    createSelector([
        (state) => get(state, 'controls.dynamic-legend.enabled'),
        groupsSelector,
        currentZoomLevelSelector,
        mapBboxSelector,
        currentResolutionSelector
    ], (isVisible, groups, currentZoomLvl, mapBbox, resolution) => ({
        isVisible,
        groups,
        currentZoomLvl,
        mapBbox,
        resolution
    })),
    {
        onClose: toggleControl.bind(null, 'dynamic-legend', null),
        onUpdateNode: updateNode
    }
)(DynamicLegend);

export default createPlugin('DynamicLegend', {
    component: DynamicLegendPlugin,
    reducers: { controls },
    epics: {},
    containers: {
        // review containers
        BurgerMenu: {
            name: 'dynamic-legend',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="dynamiclegend.title" />,
            tooltip: <Message msgId="dynamiclegend.tooltip" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, 'dynamic-legend', null),
            toggle: true
        },
        SidebarMenu: {
            name: 'dynamic-legend',
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="dynamiclegend.title" />,
            tooltip: <Message msgId="dynamiclegend.tooltip" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, 'dynamic-legend', null),
            toggle: true
        },
        Toolbar: {
            name: 'dynamic-legend',
            alwaysVisible: true,
            position: 2,
            priority: 0,
            doNotHide: true,
            tooltip: <Message msgId="dynamiclegend.title" />,
            icon: <Glyphicon glyph="align-left" />,
            action: toggleControl.bind(null, 'dynamic-legend', null),
            toggle: true
        }
    }
});
