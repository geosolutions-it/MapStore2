/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createSelector} from 'reselect';

import {clearErrors} from '../actions/config';
import {toggleControl} from '../actions/controls';
import Message from '../components/I18N/Message';
import {mapInfoSelector} from '../selectors/map';
import { isLoggedIn } from '../selectors/security';
import { createPlugin } from '../utils/PluginsUtils';
import SaveBaseDialog from './maps/MapSave';

const showMapSaveSelector = state => state.controls && state.controls.mapSave && state.controls.mapSave.enabled;

export default createPlugin('Save', {
    component: compose(
        connect(createSelector(
            showMapSaveSelector,
            mapInfoSelector,
            (show, resource) => ({show, resource})),
        {
            onClose: toggleControl.bind(null, 'mapSave', false),
            clearErrors
        }))(SaveBaseDialog),
    containers: {
        BurgerMenu: {
            name: 'save',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: toggleControl.bind(null, 'mapSave', null),
            // display the BurgerMenu button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                mapInfoSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        }
    }
});
