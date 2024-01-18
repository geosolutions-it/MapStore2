/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import isEmpty from 'lodash/isEmpty';

import ExportPanel from "../components/export/ExportPanel";
import { createPlugin } from "../utils/PluginsUtils";
import { createControlEnabledSelector } from "../selectors/controls";
import { resourceSelector } from "../selectors/contextcreator";
import { onContextExport } from "../actions/contextcreator";

import { toggleControl } from "../actions/controls";
import Message from "../components/I18N/Message";
import Button from "../components/misc/Button";
import { EXPORT_CONTEXT } from "../utils/ControlUtils";

const isEnabled = createControlEnabledSelector(EXPORT_CONTEXT);

const mapStateToProps = createSelector(
    isEnabled,
    resourceSelector,
    (show, resource) => ({
        show,
        resource
    })
);

const actions = {
    onClose: () => toggleControl(EXPORT_CONTEXT),
    onExport: onContextExport
};

const getFileName = (resource) => {
    const name = resource?.name;
    return name ? `${name}-context.json` : "context.json";
};
const Component = ({ show, onClose, onExport, resource }) => {
    const fileName = getFileName(resource);
    const handleExport = () => onExport(fileName);
    return (
        <ExportPanel
            show={show}
            onClose={onClose}
            onExport={handleExport}
            exportPanelTitle={<Message msgId="contextCreator.exportDialog.heading" />}
        />
    );
};

const ExportComponent = connect(mapStateToProps, actions)(Component);

const ExportButton = connect(
    createSelector(resourceSelector, (resource) => ({ resource })),
    {
        onExport: () => toggleControl(EXPORT_CONTEXT)
    }
)(({ resource, onExport }) => (
    <Button
        key={"export"}
        bsStyle="primary"
        bsSize="sm"
        disabled={isEmpty(resource)}
        onClick={onExport}
    >
        <Message msgId={"contextCreator.export"} />
    </Button>
));

/**
 * Context Export Plugin
 * Allows exporting of the context resources, all configured plugins, themes
 * pertaining to the context from context creator wizard
 * The plugins is enabled by adding `ContextExport` to context-creator in localConfig (default enabled)
 * @class ExportComponent
 * @memberof plugins
 * @static
 */
const ContextExportPlugin = createPlugin("ContextExport", {
    component: ExportComponent,
    containers: {
        ContextCreator: {
            name: "context-export",
            toolbarBtn: {
                id: "export",
                component: ExportButton
            }
        }
    }
});

export default ContextExportPlugin;
