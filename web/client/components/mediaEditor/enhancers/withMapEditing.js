/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    compose,
    withHandlers
} from 'recompose';
import {importInLocal} from '../../../actions/mediaEditor';
import {show} from '../../../actions/mapEditor';
import {connect} from 'react-redux';
import {MediaTypes} from '../../../utils/GeoStoryUtils';

/**
 * Allow map creation with mapEditorPlugins
 */
const withMapEditing = compose(
    connect(null, {openMapEditor: show, importInLocal}),
    withHandlers({
        setAddingMedia: ({setAddingMedia, openMapEditor, mediaType}) => (adding, map) => {
            if (mediaType === MediaTypes.MAP) {
                openMapEditor("mediaEditor", map);
            }
            setAddingMedia(adding);
        },
        editRemoteMap: ({openMapEditor, selectedItem: {id, ...map} = {}} = {}) => () => {
            openMapEditor("mediaEditorEditRemote", {data: map, id});
        }
    })
);
export default withMapEditing;
