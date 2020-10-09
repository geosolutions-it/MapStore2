/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import {compose, withProps} from 'recompose';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Glyphicon} from 'react-bootstrap';
import {indexOf} from 'lodash';
import Message from '../components/I18N/Message';
import {mapInfoSelector} from '../selectors/map';
import { isLoggedIn } from '../selectors/security';
import { createPlugin } from '../utils/PluginsUtils';
import {toggleControl} from '../actions/controls';
import {resetMapSaveError} from '../actions/config';
import SaveBaseDialog from './maps/MapSave';

const showMapSaveAsSelector = state => state.controls && state.controls.mapSaveAs && state.controls.mapSaveAs.enabled;

/**
 * Plugin for Create/Clone a Map. Saves the map as a new Resource (using the persistence API).
 * @prop {boolean} [cfg.disablePermission=false] disable the permission selector in the tool. Can be used in context when permissions are not needed (resources are private only/using plugin with another API)
 * @name SaveAs
 * @memberof plugins
 */
export default createPlugin('SaveAs', {
    component: compose(
        connect(createSelector(
            showMapSaveAsSelector,
            mapInfoSelector,
            (show, resource) => {
                const {id, attributes, name, description, detailsSettings, ...others} = resource || {};
                return {show, resource: others};
            }),
        {
            onClose: toggleControl.bind(null, 'mapSaveAs', false),
            onResetMapSaveError: resetMapSaveError
        }),
        withProps({
            isNewResource: true
        }))(SaveBaseDialog),
    containers: {
        BurgerMenu: {
            name: 'saveAs',
            position: 31,
            text: <Message msgId="saveAs"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'mapSaveAs', null),
            // display the BurgerMenu button only if the map can be edited
            selector: (state) => {
                if (state && state.controls && state.controls.saveAs && state.controls.saveAs.allowedRoles) {
                    return indexOf(state.controls.saveAs.allowedRoles, state && state.security && state.security.user && state.security.user.role) !== -1 ? {} : { style: {display: "none"} };
                }
                return { style: isLoggedIn(state) ? {} : {display: "none"} };
            }
        }
    }
});
