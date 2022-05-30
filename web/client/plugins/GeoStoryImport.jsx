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
import { controlSelectorCreator } from '../selectors/geostory';

import { geostoryImport, setControl } from '../actions/geostory';
import Message from '../components/I18N/Message';
import HTML from '../components/I18N/HTML';
import Button from '../components/misc/Button';

const isEnabled = controlSelectorCreator('import');

const mapStateToProps = createSelector(
    isEnabled,
    (show) => ( {show })
);

const actions = {
    onClose: (toggle) => setControl('import', toggle),
    handleDrop: geostoryImport
};

const Component = ({
    show,
    onClose,
    handleDrop
}) => {
    const dropZoneRef = useRef();
    return (
        <DragZone
            onRef={dropZoneRef}
            style={!show ? {display: 'none'} : {}}
            onClose={onClose}
            onDrop={handleDrop}
        >
            <div>
                <Glyphicon
                    glyph="upload"
                    style={{ fontSize: 80}}
                />
                <br />
                <HTML msgId="geostory.importDialog.heading" />
                <br />
                <br />
                <Button bsStyle="primary" onClick={() => {dropZoneRef.current.open();}}>
                    <Message msgId="geostory.importDialog.selectFiles" />
                </Button>
                <hr />
                <HTML msgId="geostory.importDialog.note" />
            </div>
        </DragZone >
    );
};

const ConnectedComponent = connect(mapStateToProps, actions)(Component);

const GeoStoryImportPlugin = createPlugin('GeoStoryImport', {
    component: ConnectedComponent,
    containers: {
        BurgerMenu: () => {
            return {
                name: "import",
                position: 4,
                text: <Message msgId="mapImport.title" />,
                icon: <Glyphicon glyph="upload" />,
                action: () => setControl('import', true),
                priority: 2,
                doNotHide: true
            };
        }
    }
});

export default GeoStoryImportPlugin;
