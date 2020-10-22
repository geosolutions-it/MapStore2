/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { createPlugin } from '../utils/PluginsUtils';

import * as epics from '../epics/mapEditor';
import mapEditor from '../reducers/mapEditor';

import { hide, save } from '../actions/mapEditor';
import MapEditorModal from './mapEditor/MapEditorModal';

import {openSelector, ownerSelector} from '../selectors/mapEditor';

/**
 * Wraps the MapViewer in a modal to allow to edit a map with the usual plugins.
 * Used with {@link #plugins.GeoStoryEditor|GeoStoryEditor}.
 * @name MapEditor
 * @class
 * @memberof plugins
 */
export default createPlugin('MapEditor', {
    component: connect(
        createStructuredSelector({
            open: openSelector,
            owner: ownerSelector
        }), {
            hide,
            save
        }
    )(MapEditorModal),
    reducers: {
        mapEditor
    },
    epics
});
