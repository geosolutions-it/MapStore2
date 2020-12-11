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

import { hide, chooseMedia } from '../actions/mediaEditor';
import * as epics from '../epics/mediaEditor';
import mediaEditor from '../reducers/mediaEditor';
import {
    currentMediaTypeSelector,
    openSelector,
    editingSelector,
    selectedItemSelector,
    addingSelector
} from '../selectors/mediaEditor';

import MediaModal from './mediaEditor/MediaModal';

/**
 * Renders a modal to browse and select media files (video, image, map... ).
 * Used by {@link #plugins.GeoStoryEditor|GeoStoryEditor}
 * @name MediaEditor
 * @class
 * @memberof plugins
 */
export default createPlugin('MediaEditor', {
    component: connect(
        createStructuredSelector({
            mediaType: currentMediaTypeSelector,
            editing: editingSelector,
            adding: addingSelector,
            open: openSelector,
            selectedItem: selectedItemSelector
        }), {
            hide,
            chooseMedia
        }
    )(MediaModal),
    reducers: {
        mediaEditor
    },
    epics
});
