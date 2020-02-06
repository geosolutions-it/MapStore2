/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import Message from '../I18N/Message';
import ConfirmDialog from '../misc/ConfirmDialog';
import MapViewer from '../../containers/MapViewer';

export default ({
    pluginsConfig = {},
    plugins = {},
    mapType = 'openlayers',
    className = 'viewer context-creator-viewer',
    showConfirm = false,
    confirmMessage = 'contextCreator.configureMap.confirm',
    onReloadConfirm = () => {},
    onMapViewerReload = () => {}
}) => (
    <React.Fragment>
        <ConfirmDialog
            draggable={false}
            modal
            show={showConfirm}
            onClose={() => {
                onReloadConfirm(false);
            }}
            onConfirm={() => {
                onReloadConfirm(false);
                onMapViewerReload();
            }}
            confirmButtonBSStyle="default"
            closeGlyph="1-close"
            confirmButtonContent={<Message msgId="confirm"/>}
            closeText={<Message msgId="cancel"/>}
        >
            <Message msgId={confirmMessage}/>
        </ConfirmDialog>
        <MapViewer
            className={className}
            pluginsConfig={pluginsConfig}
            plugins={plugins}
            params={{
                mapType,
                mapId: 'new'
            }}/>
    </React.Fragment>
);
