/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps, withHandlers, setObservableConfig } from 'recompose';
// TODO: externalize
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);

import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';
import Message from '../components/I18N/Message';
import {Glyphicon} from 'react-bootstrap';


import { Controls } from '../utils/GeoStoryUtils';

import { userSelector, isLoggedIn } from '../selectors/security';

import {
    saveDialogSelector,
    currentStorySelector,
    resourceSelector,
    loadingSelector,
    saveErrorSelector
} from '../selectors/geostory';
import { saveStory, clearSaveError, setControl } from '../actions/geostory';
import handleSaveModal from '../components/resources/modals/enhancers/handleSaveModal';
import geostory from '../reducers/geostory';

/**
 * Save dialog component enhanced for GeoStory
 *
 */
const SaveBaseDialog = compose(
    connect(createSelector(
        currentStorySelector,
        userSelector,
        loadingSelector,
        saveErrorSelector,
        (data, user, loading, errors) => ({ data, user, loading, errors })
    ), {
        onSave: saveStory,
        clearGeostorySaveError: clearSaveError,
        onClose: () => setControl(Controls.SHOW_SAVE, false)
    }),
    withHandlers({
        onClose: ({onClose = () => {}, clearGeostorySaveError = () => {}} = {}) => () => {
            onClose();
            clearGeostorySaveError(); // reset errors when closing the modal
        }
    }),
    withProps({
        category: "GEOSTORY"
    }),
    handleSaveModal
)(require('../components/resources/modals/Save'));

/**
 * Plugin for GeoStory Save
 * @name GeoStorySave
 * @memberof plugins
 */
export const GeoStorySave = createPlugin('GeoStorySave', {
    component: compose(
        connect(createSelector(
            saveDialogSelector,
            resourceSelector,
            (showSave, resource) => ({ show: showSave === "save", resource })
        )),
        withProps(({resource}) => ({
            isNewResource: !resource?.id
        }))
    )(SaveBaseDialog),
    reducers: { geostory },
    containers: {
        BurgerMenu: {
            name: 'geoStorySave',
            selector: createSelector(
                isLoggedIn,
                resourceSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && (!id || id && canEdit) ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            ),
            position: 1,
            text: <Message msgId="save" />,
            icon: <Glyphicon glyph="floppy-open" />,
            action: setControl.bind(null, Controls.SHOW_SAVE, "save"),
            priority: 1,
            doNotHide: true
        }
    }
});
/**
 * Plugin for GeoStory SaveAs functionality
 * @name GeoStorySaveAs
 * @memberof plugins
 */
export const GeoStorySaveAs = createPlugin('GeoStorySaveAs', {
    component: compose(
        connect(createSelector(
            saveDialogSelector,
            (showSave) => ({ show: showSave === "saveAs" })
        )),
        withProps({
            isNewResource: true
        })
    )(SaveBaseDialog),
    reducers: { geostory },
    containers: {
        BurgerMenu: {
            name: 'geoStorySaveAs',
            selector: createSelector(
                isLoggedIn,
                resourceSelector,
                (loggedIn, {id} = {}) => ({
                    style: loggedIn && id ? {} : { display: "none" }// save as is present only if the resource already exists and you can save
                })
            ),
            position: 2,
            text: <Message msgId="saveAs" />,
            icon: <Glyphicon glyph="floppy-open" />,
            action: setControl.bind(null, Controls.SHOW_SAVE, "saveAs"),
            priority: 1,
            doNotHide: true
        }
    }
});
