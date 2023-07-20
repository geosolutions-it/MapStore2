/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from "react";
import { Glyphicon } from "react-bootstrap";
import { connect } from "react-redux";
import { createSelector } from "reselect";

import DragZone from "../components/import/dragZone/DragZone";
import { createPlugin } from "../utils/PluginsUtils";
import { createControlEnabledSelector } from "../selectors/controls";
import { onContextImport } from "../actions/contextcreator";

import { toggleControl } from "../actions/controls";
import Message from "../components/I18N/Message";
import HTML from "../components/I18N/HTML";
import Button from "../components/misc/Button";
import { disableImportSelector } from "../selectors/contextcreator";
import tooltip from "../components/misc/enhancers/tooltip";
const ButtonWithTooltip = tooltip(Button);

const isEnabled = createControlEnabledSelector("import");

const mapStateToProps = createSelector(isEnabled, (show) => ({ show }));

const actions = {
    onClose: () => toggleControl("import"),
    handleDrop: (file) => onContextImport(file)
};

const Component = ({ show, onClose, handleDrop }) => {
    const dropZoneRef = useRef();
    return (
        <DragZone
            onRef={dropZoneRef}
            style={!show ? { display: "none" } : {}}
            onClose={onClose}
            onDrop={(file) => handleDrop(file)}
        >
            <div>
                <Glyphicon glyph="upload" style={{ fontSize: 80 }} />
                <br />
                <HTML msgId="contextCreator.importDialog.heading" />
                <br />
                <br />
                <Button
                    bsStyle="primary"
                    onClick={() => {
                        dropZoneRef.current.open();
                    }}
                >
                    <Message msgId="contextCreator.importDialog.selectFiles" />
                </Button>
                <hr />
                <HTML msgId="contextCreator.importDialog.note" />
            </div>
        </DragZone>
    );
};

const ImportComponent = connect(mapStateToProps, actions)(Component);

const ImportButton = connect(
    createSelector(disableImportSelector, (disable) => ({ disable })),
    {
        onImport: () => toggleControl("import")
    }
)(({ disable, onImport }) => (
    <ButtonWithTooltip
        {...disable && {tooltipId: "contextCreator.importTooltip", disabled: true}}
        key={"import"}
        bsStyle="primary"
        bsSize="sm"
        onClick={onImport}
    >
        <Message msgId={"contextCreator.import"} />
    </ButtonWithTooltip>
));

/**
 * Context Import Plugin
 * Allows importing context json into the context creator wizard
 * The plugins is enabled by adding `ContextImport` to context-creator in localConfig (default enabled)
 * @class ImportComponent
 * @memberof plugins
 * @static
 */
const ContextImportPlugin = createPlugin("ContextImport", {
    component: ImportComponent,
    containers: {
        ContextCreator: {
            name: "context-import",
            toolbarBtn: {
                id: "import",
                component: ImportButton
            }
        }
    }
});

export default ContextImportPlugin;
