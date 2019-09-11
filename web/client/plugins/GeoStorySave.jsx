/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { createSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';
import Message from '../components/I18N/Message';
import {Glyphicon} from 'react-bootstrap';


import { Controls } from '../utils/GeoStoryUtils';

import { userSelector } from '../selectors/security';

import {
    isSaveDialogOpen,
    currentStorySelector,
    resourceSelector,
    loadingSelector,
    saveErrorSelector
} from '../selectors/geostory';
import { saveStory, setControl } from '../actions/geostory';
import handleSaveModal from '../components/resources/modals/enhancers/handleSaveModal';

/**
 * Save dialog component enhanced for GeoStory
 *
 */
const SaveDialog = compose(
    connect(createSelector(
        isSaveDialogOpen,
        resourceSelector,
        currentStorySelector,
        userSelector,
        loadingSelector,
        saveErrorSelector,
        (show, resource, data, user, loading, errors) => ({ show, resource, data, user, loading, errors })
    ), {
            onClose: () => setControl(Controls.SHOW_SAVE, false),
            onSave: saveStory
        }),
    withProps({
        category: "GEOSTORY"
    }),
    handleSaveModal
)(require('../components/resources/modals/Save'));

/**
 * Plugin for GeoStory top panel for navigation
 * @name GeoStoryNavigation
 * @memberof plugins
 */
export default createPlugin('GeoStorySave', {
    component: SaveDialog,
    containers: {
        BurgerMenu: {
            name: 'geoStorySave',
            position: 1,
            text: <Message msgId="save" />,
            icon: <Glyphicon glyph="floppy-open" />,
            action: setControl.bind(null, Controls.SHOW_SAVE, true),
            priority: 2,
            doNotHide: true
        }
    },
});
