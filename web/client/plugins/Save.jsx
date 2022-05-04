/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import {compose} from 'recompose';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Glyphicon} from 'react-bootstrap';
import Message from '../components/I18N/Message';
import {mapInfoSelector} from '../selectors/map';
import { isLoggedIn } from '../selectors/security';
import { createPlugin } from '../utils/PluginsUtils';
import {toggleControl} from '../actions/controls';
import {resetMapSaveError} from '../actions/config';
import SaveBaseDialog from './maps/MapSave';

const showMapSaveSelector = state => state.controls && state.controls.mapSave && state.controls.mapSave.enabled;

/**
 * Plugin for Save Map. Allows to re-save an existing map (using the persistence API). Note: creation of new Map is implemented by {@link #plugins.SaveAs|SaveAs} plugin.
 * @prop {boolean} [cfg.disablePermission=false] disable the permission selector in the tool. Can be used in context when permissions are not needed (resources are private only/using plugin with another API)
 * @name Save
 * @class
 * @memberof plugins
 */
export default createPlugin('Save', {
    component: compose(
        connect(createSelector(
            showMapSaveSelector,
            mapInfoSelector,
            (show, resource) => ({show, resource})),
        {
            onClose: toggleControl.bind(null, 'mapSave', false),
            onResetMapSaveError: resetMapSaveError
        }))(SaveBaseDialog),
    containers: {
        BurgerMenu: {
            name: 'mapSave',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'mapSave', null),
            tooltip: "saveDialog.saveTooltip",
            // display the BurgerMenu button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                mapInfoSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            ),
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'mapSave',
            position: 30,
            icon: <Glyphicon glyph="floppy-disk"/>,
            text: <Message msgId="save"/>,
            action: toggleControl.bind(null, 'mapSave', null),
            toggle: true,
            tooltip: "saveDialog.saveTooltip",
            // display the button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                mapInfoSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            ),
            priority: 1,
            doNotHide: true
        }
    }
});
