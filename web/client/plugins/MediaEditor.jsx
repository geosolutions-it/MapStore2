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

import mediaEditor from '../reducers/mediaEditor';

import MediaEditor from '../components/mediaEditor/MediaEditor';

/**
 * Plugin for GeoStory side panel editor
 * @name GeoStoryEditor
 * @memberof plugins
 */
export default createPlugin('MediaEditor', {
    component: connect(
        createStructuredSelector({
            enabled: () => true
        })
    )(MediaEditor),
    reducers: {
        mediaEditor
    }
});
