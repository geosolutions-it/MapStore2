/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';


import ConfirmDialog from '../layout/ConfirmDialog';
import MapViewer from '../../containers/MapViewer';
import { MapLibraries } from '../../utils/MapTypeUtils';

export default ({
    pluginsConfig = {},
    plugins = {},
    mapType = MapLibraries.OPENLAYERS,
    className = 'viewer context-creator-viewer',
    showConfirm = false,
    confirmMessage = 'contextCreator.configureMap.confirm',
    onReloadConfirm = () => {},
    onMapViewerReload = () => {}
}) => (
    <React.Fragment>
        <ConfirmDialog
            show={showConfirm}
            onCancel={() => {
                onReloadConfirm(false);
            }}
            onConfirm={() => {
                onReloadConfirm(false);
                onMapViewerReload();
            }}
            titleId={confirmMessage}
            preventHide
            variant="danger"
            confirmId="confirm"
            cancelId="cancel">
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
