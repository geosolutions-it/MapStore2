/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import DragZone from '../components/import/dragZone/DragZone';
import {createPlugin} from "../utils/PluginsUtils";
import { createControlEnabledSelector } from '../selectors/controls';
import { dashboardImport } from '../actions/dashboard';

import { toggleControl } from '../actions/controls';
import Message from '../components/I18N/Message';
import HTML from '../components/I18N/HTML';
import Button from '../components/misc/Button';

const isEnabled = createControlEnabledSelector('import');

const mapStateToProps = createSelector(
    isEnabled,
    (show) => ( {show })
);

const actions = {
    onClose: () => toggleControl('import'),
    onDrop: dashboardImport
};

const Component = ({
    show,
    onDrop,
    onClose
}) => {
    const dropZoneRef = useRef();
    return (
        <DragZone
            onRef={dropZoneRef}
            style={!show ? {display: 'none'} : {}}
            onClose={onClose}
            onDrop={onDrop}
        >
            <div>
                <Glyphicon
                    glyph="upload"
                    style={{ fontSize: 80}}
                />
                <br />
                <HTML msgId="dashboard.importDialog.heading" />
                <br />
                <br />
                <Button bsStyle="primary" onClick={() => {dropZoneRef.current.open();}}>
                    <Message msgId="dashboard.importDialog.selectFiles" />
                </Button>
                <hr />
                <HTML msgId="dashboard.importDialog.note" />
            </div>
        </DragZone >
    );
};

const ConnectedComponent = connect(mapStateToProps, actions)(Component);

const DashboardImportPlugin = createPlugin('DashboardImport', {
    component: ConnectedComponent,
    containers: {
        BurgerMenu: () => {
            return {
                name: "import",
                position: 4,
                text: <Message msgId="mapImport.title" />,
                icon: <Glyphicon glyph="upload" />,
                action: () => toggleControl('import'),
                priority: 2,
                toggle: true,
                doNotHide: true
            };
        }
    }
});

export default DashboardImportPlugin;
