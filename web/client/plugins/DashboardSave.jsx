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
import { compose, withProps } from 'recompose';
import { createSelector } from 'reselect';

import { saveDashboard, triggerSave, triggerSaveAs } from '../actions/dashboard';
import Message from '../components/I18N/Message';
import handleSaveModal from '../components/resources/modals/enhancers/handleSaveModal';
import Save from '../components/resources/modals/Save';
import dashboard from '../reducers/dashboard';
import { dashboardResource, getDashboardSaveErrors, isDashboardLoading, isShowSaveAsOpen, isShowSaveOpen } from '../selectors/dashboard';
import { isLoggedIn, userSelector } from '../selectors/security';
import { widgetsConfig } from '../selectors/widgets';
import { createPlugin } from '../utils/PluginsUtils';

/**
 * Save dialog component enhanced for dashboard
 *  @ignore
 */
const SaveBaseDialog = compose(
    connect(createSelector(
        widgetsConfig,
        userSelector,
        isDashboardLoading,
        getDashboardSaveErrors,
        (data, user, loading, errors ) => ({ data, user, loading, errors })
    ), {
        onSave: saveDashboard
    }),
    withProps({
        category: "DASHBOARD",
        enableDetails: true         // to enable details in dashboard
    }),
    handleSaveModal
)(Save);

/**
 * Implements "save" button for dashboards, to render in the {@link #plugins.BurgerMenu|BurgerMenu}}
 * @class
 * @name DashboardSave
 * @memberof plugins
 */
export const DashboardSave = createPlugin('DashboardSave', {
    component: compose(
        connect(createSelector(
            isShowSaveOpen, dashboardResource,
            (show, resource) => ({show, resource})),
        {
            onClose: () => triggerSave(false)
        }
        ))(SaveBaseDialog),
    reducers: {dashboard},
    options: {
        disablePluginIf: "{!!(state('browser') && state('browser').mobile)}"
    },
    containers: {
        BurgerMenu: {
            name: 'dashboardSave',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-disk"/>,
            action: triggerSave.bind(null, true),
            tooltip: "saveDialog.saveTooltip",
            // display the BurgerMenu button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                dashboardResource,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        },
        SidebarMenu: {
            name: 'dashboardSave',
            position: 30,
            text: <Message msgId="save"/>,
            icon: <Glyphicon glyph="floppy-disk"/>,
            action: triggerSave.bind(null, true),
            tooltip: "saveDialog.saveTooltip",
            // display the BurgerMenu button only if the map can be edited
            selector: createSelector(
                isLoggedIn,
                dashboardResource,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && id && canEdit ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        }
    }
});

/**
 * Implements "save as" button for dashboards, to render in the {@link #plugins.BurgerMenu|BurgerMenu}}
 * @class
 * @name DashboardSaveAs
 * @memberof plugins
 */
export const DashboardSaveAs = createPlugin('DashboardSaveAs',  {
    component: compose(
        connect(createSelector(
            isShowSaveAsOpen, dashboardResource,
            (show, resource) => {
                const {id, attributes, name, description, ...others} = resource || {};
                return {show, resource: others};
            }),
        {
            onClose: () => triggerSaveAs(false)
        }
        ),
        withProps({
            isNewResource: true
        }))(SaveBaseDialog),
    reducers: {dashboard},
    options: {
        disablePluginIf: "{!!(state('browser') && state('browser').mobile)}"
    },
    containers: {
        BurgerMenu: {
            name: 'dashboardSaveAs',
            position: 31,
            tooltip: "saveAs",
            text: <Message msgId="saveAs"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: triggerSaveAs.bind(null, true),
            // always display on the BurgerMenu button if logged in
            selector: createSelector(
                isLoggedIn,
                (loggedIn) => ({
                    style: loggedIn ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        },
        SidebarMenu: {
            name: 'dashboardSaveAs',
            position: 31,
            tooltip: "saveAs",
            text: <Message msgId="saveAs"/>,
            icon: <Glyphicon glyph="floppy-open"/>,
            action: triggerSaveAs.bind(null, true),
            // always display on the BurgerMenu button if logged in
            selector: createSelector(
                isLoggedIn,
                (loggedIn) => ({
                    style: loggedIn ? {} : { display: "none" }// the resource is new (no resource) or if present, is editable
                })
            )
        }
    }
});
