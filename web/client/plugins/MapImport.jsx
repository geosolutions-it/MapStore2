/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { connect } from 'react-redux';
import Message from './locale/Message';

import {
    onError,
    setLoading,
    setLayers,
    onSelectLayer,
    onLayerAdded,
    onLayerSkipped,
    updateBBox,
    onSuccess
} from '../actions/mapimport';

import { warning } from '../actions/notifications';
import { zoomToExtent } from '../actions/map';
import { addLayer } from '../actions/layers';
import { loadAnnotations } from '../plugins/Annotations/actions/annotations';
import { annotationsLayerSelector } from '../plugins/Annotations/selectors/annotations';
import { toggleControl } from '../actions/controls';
import assign from 'object-assign';
import { Glyphicon } from 'react-bootstrap';
import { mapTypeSelector } from '../selectors/maptype';
import { DEFAULT_VECTOR_FILE_MAX_SIZE_IN_MB } from '../utils/FileUtils';

/**
 * Allows the user to import a file into current map.
 * Supported formats are:
 * - **Maps** (current map will be overridden):
 *     - MapStore JSON format
 *     - WMC
 * - **Vector Data**:
 *     - shapefiles (must be contained in zip archives)
 *     - KML/KMZ
 *     - GeoJSON
 *     - GPX
 * @memberof plugins
 * @name MapImport
 * @class
 * @prop {number} cfg.importedVectorFileMaxSizeInMB it is the max allowable file size for import vectir layers in mega bytes
 */
export default {
    MapImportPlugin: assign({loadPlugin: (resolve) => {
        import('./import/Import').then((importMod) => {
            const Import = importMod.default;

            const ImportPlugin = connect((state, ownProps) =>(
                {
                    enabled: state.controls && state.controls.mapimport && state.controls.mapimport.enabled,
                    layers: state.mapimport && state.mapimport.layers || null,
                    selected: state.mapimport && state.mapimport.selected || null,
                    bbox: state.mapimport && state.mapimport.bbox || null,
                    success: state.mapimport && state.mapimport.success || null,
                    errors: state.mapimport && state.mapimport.errors || null,
                    shapeStyle: state.style || {},
                    mapType: mapTypeSelector(state),
                    annotationsLayer: annotationsLayerSelector(state),
                    importedVectorFileMaxSizeInMB: ownProps?.importedVectorFileMaxSizeInMB || DEFAULT_VECTOR_FILE_MAX_SIZE_IN_MB
                }
            ), {
                setLayers,
                onLayerAdded,
                onLayerSkipped,
                onSelectLayer,
                onError,
                onSuccess,
                addLayer,
                loadAnnotations,
                onZoomSelected: zoomToExtent,
                updateBBox,
                setLoading,
                onClose: toggleControl.bind(null, 'mapimport', null),
                warning
            })(Import);

            resolve(ImportPlugin);
        });
    }, enabler: (state) => state.mapimport && state.mapimport.enabled || state.toolbar && state.toolbar.active === 'import'}, {
        BurgerMenu: {
            name: 'import',
            position: 4,
            text: <Message msgId="mapImport.title"/>,
            tooltip: "mapImport.tooltip",
            icon: <Glyphicon glyph="upload"/>,
            action: toggleControl.bind(null, 'mapimport', null),
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: "mapimport",
            position: 4,
            tooltip: "mapImport.tooltip",
            text: <Message msgId="mapImport.title"/>,
            icon: <Glyphicon glyph="upload"/>,
            action: toggleControl.bind(null, 'mapimport', null),
            toggle: true,
            priority: 1,
            doNotHide: true
        }
    }),
    reducers: {
        mapimport: require('../reducers/mapimport').default,
        style: require('../reducers/style').default
    }
};
