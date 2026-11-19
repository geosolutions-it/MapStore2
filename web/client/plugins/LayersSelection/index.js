/*
 * Copyright 2026, GeoSolutions Sas.
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
import { layersSelector } from '../../selectors/layers';
import { updateNode, addLayer, changeLayerProperties } from '../../actions/layers';
import { zoomToExtent } from '../../actions/map';
import { toggleControl } from '../../actions/controls';
import Message from '../../components/I18N/Message';

import SelectComponent from './components/LayersSelection';
import epics from './epics/layersSelection';
import layersSelection from './reducers/layersSelection';
import { storeConfiguration, cleanSelection, addOrUpdateSelection, updateSelectionFeature, viewSelectionInTable } from './actions/layersSelection';
import { getSelectSelections, getSelectQueryMaxFeatureCount, getSelectDrawType, getSelectionFeature, isSelectEnabled, canDrawSelection } from './selectors/layersSelection';
import LayersSelectionSupport from './components/LayersSelectionSupport';
import { removeAdditionalLayer, updateAdditionalLayer } from '../../actions/additionallayers';
import { dockStyleSelector } from '../../selectors/maplayout';

/**
 * Select plugin that enables layer feature selection in the map.
 * Uses selectors to retrieve visibility, layers, selection results, and feature count.
  * @class LayersSelection
  * @memberof plugins
  * @static
  * @prop {boolean} cfg.isFloating Shows a draggable panel by default. Set false to use a docked panel.
 */
export default createPlugin('LayersSelection', {
    component: connect(
        createSelector([
            (state) => get(state, 'controls.layersSelection.enabled'),
            layersSelector,
            getSelectSelections,
            getSelectQueryMaxFeatureCount,
            getSelectDrawType,
            dockStyleSelector
        ], (isVisible, layers, selections, maxFeatureCount, drawType, dockStyle) => ({
            isVisible,
            layers,
            selections,
            maxFeatureCount,
            drawType,
            dockStyle
        })),
        {
            onClose: toggleControl.bind(null, 'layersSelection', null),
            onUpdateNode: updateNode,
            storeConfiguration,
            cleanSelection,
            addOrUpdateSelection,
            zoomToExtent,
            addLayer,
            changeLayerProperties,
            viewSelectionInTable
        }
    )(SelectComponent),
    options: {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    },
    reducers: {
        layersSelection
    },
    epics: epics,
    containers: {
        BurgerMenu: {
            name: 'layersSelection',
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="layersSelection.title"/>,
            tooltip: <Message msgId="layersSelection.tooltip"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'layersSelection', null),
            toggle: true
        },
        SidebarMenu: {
            name: 'layersSelection',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="layersSelection.title"/>,
            tooltip: <Message msgId="layersSelection.tooltip"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'layersSelection', null),
            toggle: true
        },
        Toolbar: {
            name: 'layersSelection',
            alwaysVisible: true,
            position: 2,
            priority: 0,
            doNotHide: true,
            tooltip: <Message msgId="layersSelection.title"/>,
            icon: <Glyphicon glyph="hand-down"/>,
            action: toggleControl.bind(null, 'layersSelection', null),
            toggle: true
        },
        Map: {
            name: 'LayersSelectionSupport',
            Tool: connect(
                createSelector([getSelectDrawType, getSelectionFeature, isSelectEnabled, canDrawSelection], (type, feature, enabled, canDraw) => ({
                    type,
                    feature,
                    enabled,
                    canDraw
                })),
                {
                    onChange: updateSelectionFeature,
                    onUpdateLayer: updateAdditionalLayer,
                    onRemoveLayer: removeAdditionalLayer,
                    cleanSelection
                }
            )(LayersSelectionSupport),
            alwaysRender: true
        }
    }
});
