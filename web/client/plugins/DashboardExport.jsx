/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import ExportPanel from '../components/export/ExportPanel';
import {createPlugin} from "../utils/PluginsUtils";
import { createControlEnabledSelector } from '../selectors/controls';
import { dashboardResource } from '../selectors/dashboard';
import { widgetsConfig } from '../selectors/widgets';
import { dashboardExport } from '../actions/dashboard';

import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';
const isEnabled = createControlEnabledSelector('export');

const mapStateToProps = createSelector(
    isEnabled,
    dashboardResource,
    widgetsConfig,
    (show, resource, data) => ({
        show,
        resource,
        data
    }));

const actions = {
    onClose: () => toggleControl('export'),
    onExport: dashboardExport
};

const Component = ({
    show,
    onClose,
    onExport,
    data,
    resource
}) => {
    const fileName = resource?.name ? `${resource.name}-dashboard.json` : 'dashboard.json';
    const handleExport = () => onExport(data, fileName);
    return (
        <ExportPanel
            show={show}
            onClose={onClose}
            onExport={handleExport}
            exportPanelTitle={<Message msgId="dashboard.exportDialog.heading"/>}
        />
    );
};

const ConnectedComponent = connect(mapStateToProps, actions)(Component);

const DashboardExportPlugin = createPlugin('DashboardExport', {
    component: ConnectedComponent,
    containers: {
        BurgerMenu: () => {
            return {
                name: "export",
                position: 4,
                text: <Message msgId="mapExport.title" />,
                icon: <Glyphicon glyph="download" />,
                action: () => toggleControl('export'),
                priority: 2,
                toggle: true,
                doNotHide: true
            };
        }
    }
});

export default DashboardExportPlugin;
