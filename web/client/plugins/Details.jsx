/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { get } from "lodash";

import {
    save,
    edit,
    cancelEdit,
    setEditedContent,
    changeSetting
} from '../actions/details';
import {
    contentSelector,
    editedContentSelector,
    contentChangedSelector,
    editingSelector,
    settingsSelector,
    loadingSelector,
    loadFlagsSelector,
    editedSettingsSelector
} from '../selectors/details';
import { setControlProperty } from '../actions/controls';
import { mapFromIdSelector } from '../selectors/maps';
import { mapInfoSelector, mapIdSelector, mapInfoDetailsUriFromIdSelector } from '../selectors/map';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import { isLoggedIn } from '../selectors/security';

import Message from '../components/I18N/Message';
import Details from '../components/details/Details';
import { createPlugin } from '../utils/PluginsUtils';

import details from '../reducers/details';
import * as epics from '../epics/details';

/**
 * Details plugin used for fetching details of the map
 * @class
 * @memberof plugins
 */

export default createPlugin('Details', {
    component: connect((state) => ({
        show: get(state, "controls.details.enabled"),
        loading: loadingSelector(state),
        loadFlags: loadFlagsSelector(state),
        mapInfo: mapInfoSelector(state),
        canEdit: isLoggedIn(state) && get(mapInfoSelector(state), 'canEdit'),
        settings: settingsSelector(state),
        map: mapFromIdSelector(state, mapIdSelector(state)),
        content: contentSelector(state),
        editedContent: editedContentSelector(state),
        contentChanged: contentChangedSelector(state),
        editedSettings: editedSettingsSelector(state),
        editing: editingSelector(state),
        dockStyle: mapLayoutValuesSelector(state, {height: true})
    }), {
        onSave: save,
        onEdit: edit.bind(null, 'content'),
        onEditSettings: edit.bind(null, 'settings'),
        onCancelEdit: cancelEdit,
        onClose: setControlProperty.bind(null, 'details', 'enabled', false),
        onSettingsChange: changeSetting,
        onEditorUpdate: setEditedContent
    }, (stateProps, dispatchProps, ownProps) => ({
        ...stateProps,
        ...ownProps,
        ...dispatchProps,
        editorProps: {
            ...(stateProps.editorProps || {}),
            ...(ownProps.editorProps || {}),
            onUpdate: dispatchProps.onEditorUpdate
        }
    }))(Details),
    containers: {
        BurgerMenu: {
            name: 'details',
            position: 1000,
            text: <Message msgId="details.title"/>,
            icon: <Glyphicon glyph="sheet"/>,
            action: setControlProperty.bind(null, 'details', 'enabled', true),
            selector: (state) => {
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                const settings = settingsSelector(state) || {};
                if (detailsUri && !settings.showAsModal) {
                    return {};
                }
                return { style: {display: "none"} };
            }
        },
        Toolbar: {
            name: 'details',
            position: 1,
            priority: 1,
            alwaysVisible: true,
            doNotHide: true,
            icon: <Glyphicon glyph="sheet"/>,
            action: setControlProperty.bind(null, 'details', 'enabled', true),
            selector: (state) => {
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                const settings = settingsSelector(state) || {};
                if (detailsUri && settings.showAsModal) {
                    return {};
                }
                return { style: {display: "none"} };
            }
        }
    },
    reducers: {
        details
    },
    epics
});
