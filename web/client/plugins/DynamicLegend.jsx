/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import { Glyphicon } from 'react-bootstrap';

import { createPlugin } from '../utils/PluginsUtils';
import { groupsSelector, layersSelector } from '../selectors/layers';
import { keepLayer } from '../selectors/dynamiclegend';
import { mapSelector } from '../selectors/map';
import { updateNode } from '../actions/layers';
import controls from '../reducers/controls';
import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';

import DynamicLegend from './dynamicLegend/components/DynamicLegend';

export default createPlugin('DynamicLegend', {
    component: connect(
        createSelector([
            (state) => get(state, 'controls.dynamic-legend.enabled'),
            groupsSelector,
            layersSelector,
            mapSelector
        ], (isVisible, groups, layers, map) => ({
            isVisible,
            groups,
            layers: layers.filter(keepLayer),
            currentZoomLvl: map?.zoom,
            mapBbox: map?.bbox
        })),
        {
            onClose: toggleControl.bind(null, 'dynamic-legend', null),
            onUpdateNode: updateNode
        }
    )(DynamicLegend),
    options: {
        disablePluginIf: "{state('router') && (state('router').endsWith('new') || state('router').includes('newgeostory') || state('router').endsWith('dashboard'))}"
    },
    reducers: { controls },
    epics: {},
    containers: {
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
