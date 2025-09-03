/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from "react-redux";
import { createSelector } from "reselect";

import { createPlugin } from "../utils/PluginsUtils";
import Permalink from "../components/permalink/Permalink";
import { updatePermalinkSettings, savePermalink, resetPermalink } from '../actions/permalink';
import permalink from '../reducers/permalink';
import permalinkEpics from '../epics/permalink';
import { permalinkLoadingSelector, permalinkSettingsSelector } from "../selectors/permalink";
import Message from '../components/I18N/Message';

/*
 * Permalink Component
 */
const PermalinkComponent = connect(
    createSelector(
        permalinkSettingsSelector,
        permalinkLoadingSelector,
        (settings, loading) => ({ settings, loading })
    ),
    {
        onUpdateSettings: updatePermalinkSettings,
        onSave: savePermalink,
        onReset: resetPermalink
    }
)(Permalink);

/**
 * Permalink plugin
 * Allows creating a copy of the resource's current state.
 * Enabled only when user is authenticated
 * @class PermalinkComponent
 * @memberof plugins
 * @static
 */
export default createPlugin('Permalink', {
    component: () => null,
    options: {
        disablePluginIf: "{!state('userrole')}"
    },
    containers: {
        Share: {
            target: "tabs",
            tabName: "permalink",
            hideAdvancedSettingsInTab: true,
            title: <Message msgId="permalink.title" />,
            component: PermalinkComponent
        }
    },
    reducers: {
        permalink
    },
    epics: permalinkEpics
});
