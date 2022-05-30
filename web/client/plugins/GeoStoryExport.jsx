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
import { createPlugin } from "../utils/PluginsUtils";
import { currentStorySelector, controlSelectorCreator } from '../selectors/geostory';
import { geostoryExport, setControl } from '../actions/geostory';

import Message from '../components/I18N/Message';
const isEnabled = controlSelectorCreator('export');

const mapStateToProps = createSelector(
    isEnabled,
    currentStorySelector,
    (show, data) => ({
        show,
        data
    }));

const actions = {
    onClose: (toggle) => setControl('export', toggle),
    onExport: geostoryExport
};

const Component = ({
    show,
    onClose,
    onExport,
    data
}) => {
    const fileName = data?.settings?.storyTitle ? `${data.settings.storyTitle}-geostory.json` : 'geostory.json';
    const handleExport = () => onExport(data, fileName);
    const toggleControl = () => onClose(!show);
    return (
        <ExportPanel
            show={show}
            onClose={toggleControl}
            onExport={handleExport}
            exportPanelTitle={<Message msgId="geostory.exportDialog.heading"/>}
        />
    );
};

const ConnectedComponent = connect(mapStateToProps, actions)(Component);

const GeoStoryExportPlugin = createPlugin('GeoStoryExport', {
    component: ConnectedComponent,
    containers: {
        BurgerMenu: () => {
            return {
                name: "export",
                position: 4,
                text: <Message msgId="mapExport.title" />,
                icon: <Glyphicon glyph="download" />,
                action: () => setControl('export', true),
                priority: 2,
                doNotHide: true
            };
        }
    }
});

export default GeoStoryExportPlugin;
