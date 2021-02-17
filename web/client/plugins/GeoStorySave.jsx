/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose, setObservableConfig, withHandlers, withProps } from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
import { createSelector } from 'reselect';

import { clearSaveError, saveStory, setControl } from '../actions/geostory';
import Message from '../components/I18N/Message';
import handleSaveModal from '../components/resources/modals/enhancers/handleSaveModal';
import Save from '../components/resources/modals/Save';
import geostory from '../reducers/geostory';
import {
    currentStorySelector,
    loadingSelector,
    resourceSelector,
    saveDialogSelector,
    saveErrorSelector
} from '../selectors/geostory';
import { isLoggedIn, userSelector } from '../selectors/security';
import { Controls } from '../utils/GeoStoryUtils';
import { createPlugin } from '../utils/PluginsUtils';

// TODO: externalize

setObservableConfig(rxjsConfig);


/**
 * Save dialog component enhanced for GeoStory
 * @ignore
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
)(Save);

/**
 * Implements "save" button for geostories, to render in the {@link #plugins.BurgerMenu|BurgerMenu}}
 * @class
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
                    style: loggedIn && (id && canEdit) ? {} : { display: "none" } // save is present only if the resource already exists and you can save
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
 * Implements "save as" button for geostories, to render in the {@link #plugins.BurgerMenu|BurgerMenu}}
 * @class
 * @name GeoStorySave
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
                (loggedIn ) => ({
                    style: loggedIn ? {} : { display: "none" } // the  resource is new (no resource) or if present, is editable
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
