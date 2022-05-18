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
import { originalDataSelector, dashboardResource } from '../selectors/dashboard';
import { dashboardExport } from '../actions/dashboard';

import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';
const isEnabled = createControlEnabledSelector('export');

const Component = ({
    show,
    onClose,
    onExport,
    originalData,
    resource
}) => (
    <ExportPanel
        show={show}
        // formats={pick(formats, ...enabledFormats)}
        // selectedFormat={format}
        // onSelect={setFormat}
        onExport={() => {
            onExport(originalData, resource);
            onClose();
        }}
        onClose={onClose}
    />
);

const ConnectedComponent = connect(
    createSelector(
        isEnabled,
        dashboardResource,
        originalDataSelector,
        (show, resource, originalData) => ({
            show,
            resource,
            originalData
        })), {
        onClose: () => toggleControl('export'),
        onExport: (originalData, resource) => dashboardExport(originalData, resource)
    }
)(Component);

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
