/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withState, withHandlers, withProps } from 'recompose';

export default compose(
    withState('showDetailsSheet', 'setShowDetailsSheet', false),
    withState('editorState', 'setEditorState'),
    withState('detailsBackup', 'setDetailsBackup'),
    withHandlers({
        onShowDetailsSheet: ({ setShowDetailsSheet = () => {} }) => () => setShowDetailsSheet(true),
        onHideDetailsSheet: ({ setShowDetailsSheet = () => {} }) => () => setShowDetailsSheet(false)
    }),
    withProps(({linkedResources = {}}) => ({
        savedDetailsText: linkedResources?.details?.data === 'NODATA' ?
            undefined :
            linkedResources?.details?.data
    }))
);
