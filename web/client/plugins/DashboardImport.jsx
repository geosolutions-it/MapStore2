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

import DragZone from '../components/import/dragZone/DragZone';
import {createPlugin} from "../utils/PluginsUtils";
import { createControlEnabledSelector } from '../selectors/controls';
import { originalDataSelector, dashboardResource } from '../selectors/dashboard';
import { dashboardExport } from '../actions/dashboard';

import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';
const isEnabled = createControlEnabledSelector('import');

const Component = ({
    show,
    onClose
}) => (
    <DragZone
        style={!show ? {display: 'none'} : {}}
        onClose={onClose}
        onDrop={(file) => {
            console.log('ONDROP', file[0])
        }}
    >
        HOLAAAAAAA
    </DragZone >
);

const ConnectedComponent = connect(
    createSelector(
        isEnabled,
        dashboardResource,
        originalDataSelector,
        (show) => ({
            show
        })), {
        onClose: () => toggleControl('import')
    }
)(Component);

const DashboardImportPlugin = createPlugin('DashboardImport', {
    component: ConnectedComponent,
    containers: {
        BurgerMenu: () => {
            return {
                name: "import",
                position: 4,
                text: <Message msgId="mapImport.title" />,
                icon: <Glyphicon glyph="download" />,
                action: () => toggleControl('import'),
                priority: 2,
                toggle: true,
                doNotHide: true
            };
        }
    }
});

export default DashboardImportPlugin;
