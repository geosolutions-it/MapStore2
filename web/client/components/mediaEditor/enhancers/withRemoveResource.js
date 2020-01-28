/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
    compose,
    renameProp,
    withProps
} from 'recompose';
import {removeMedia} from '../../../actions/mediaEditor';
import {isMediaResourceUsed} from '../../../selectors/geostory';
import {selectedIdSelector} from '../../../selectors/mediaEditor';
import {connect} from 'react-redux';
import withConfirm from '../../misc/withConfirm';
import Message from '../../I18N/Message';


/**
 * Allow map creation with mapEditorPlugins
 */
export default compose(
    connect((state) => ({
        isUsed: isMediaResourceUsed(state, selectedIdSelector(state))})
    , {onClick: removeMedia}),
    withProps(({isUsed}) => ({
        confirmTitle: <Message msgId="mediaEditor.mediaList.removeResourceTitle"/>,
        confirmContent: <Message msgId={!isUsed ? "mediaEditor.mediaList.confirmRemoveResource" : "mediaEditor.mediaList.confirmRemoveUsedResource"}/>
    })),
    withConfirm,
    renameProp("onClick", "removeMedia")
);

