import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import { Glyphicon } from 'react-bootstrap';

import { createPlugin } from '../utils/PluginsUtils';
import { layersSelector } from '../selectors/layers';
import { updateNode, addLayer, changeLayerProperties } from '../actions/layers';
import { zoomToExtent } from '../actions/map';
import controls from '../reducers/controls';
import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';

import SelectComponent from './layersSelection/components/LayersSelection';
import epics from './layersSelection/epics/layersSelection';
import select from './layersSelection/reducers/layersSelection';
import { storeConfiguration, cleanSelection, addOrUpdateSelection } from './layersSelection/actions/layersSelection';
import { getSelectSelections, getSelectQueryMaxFeatureCount } from './layersSelection/selectors/layersSelection';

/**
 * Select plugin that enables layer feature selection in the map.
 * It connects Redux state and actions to the SelectComponent UI.
 * Uses selectors to retrieve visibility, layers, selection results, and feature count.
 *
 * @function
 * @returns {Object} A plugin definition object used by the application to render and control the Select tool.
 */
export default createPlugin('Select', {
    component: connect(
        createSelector([
            (state) => get(state, 'controls.select.enabled'),
            layersSelector,
            getSelectSelections,
            getSelectQueryMaxFeatureCount
        ], (isVisible, layers, selections, maxFeatureCount) => ({
            isVisible,
            layers,
            selections,
            maxFeatureCount
        })),
        {
            onClose: toggleControl.bind(null, 'select', null),
            onUpdateNode: updateNode,
            storeConfiguration,
            cleanSelection,
            addOrUpdateSelection,
            zoomToExtent,
            addLayer,
            changeLayerProperties
        }
    )(SelectComponent),
    options: {
        disablePluginIf: "{state('router') && (state('router').endsWith('new') || state('router').includes('newgeostory') || state('router').endsWith('dashboard'))}"
    },
    reducers: {
        ...controls,
        select
    },
    epics: epics,
    containers: {
        BurgerMenu: {
            name: 'select',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="layersSelection.title"/>,
            tooltip: <Message msgId="layersSelection.tooltip"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'select', null),
            toggle: true
        },
        SidebarMenu: {
            name: 'select',
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="layersSelection.title"/>,
            tooltip: <Message msgId="layersSelection.tooltip"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'select', null),
            toggle: true
        },
        Toolbar: {
            name: 'select',
            alwaysVisible: true,
            position: 2,
            priority: 0,
            doNotHide: true,
            tooltip: <Message msgId="layersSelection.title"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'select', null),
            toggle: true
        }
    }
});
