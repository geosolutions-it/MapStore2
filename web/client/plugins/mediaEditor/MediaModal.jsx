
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector, createSelector } from 'reselect';
import withCloseConfirm from './withCloseConfirm';

import {
    setAddingMedia,
    setEditingMedia,
    setMediaType,
    setMediaService,
    saveMedia,
    selectItem,
    loadMedia
} from '../../actions/mediaEditor';
import {
    availableSourcesSelector,
    currentResourcesSelector,
    editingSelector,
    saveStateSelector,
    sourceIdSelector,
    selectedSourceSelector,
    selectedItemSelector,
    getCurrentMediaResourcesParams,
    getCurrentMediaResourcesTotalCount,
    getLoadingSelectedMedia,
    getLoadingMediaList
} from '../../selectors/mediaEditor';

import ResizableModal from '../../components/misc/ResizableModal';
import Portal from '../../components/misc/Portal';
import MediaEditor from '../../components/mediaEditor/MediaEditor';
import MediaSelector from '../../components/mediaEditor/MediaSelector';
import Message from '../../components/I18N/Message';

const ConnectedMediaSelector = connect(createSelector([
    currentResourcesSelector,
    selectedItemSelector,
    sourceIdSelector,
    selectedSourceSelector,
    editingSelector,
    getCurrentMediaResourcesParams,
    getCurrentMediaResourcesTotalCount,
    getLoadingSelectedMedia,
    getLoadingMediaList,
    saveStateSelector,
    availableSourcesSelector
], (
    resources,
    selectedItem,
    selectedService,
    selectedSource,
    editing,
    params,
    totalCount,
    loadingSelected,
    loading,
    saveState,
    services
) => ({
    resources,
    selectedItem,
    selectedService,
    selectedSource,
    editing,
    services,
    params,
    totalCount,
    loadingSelected,
    loading,
    ...saveState
})), {
    selectItem,
    setAddingMedia,
    setEditingMedia,
    saveMedia,
    onLoad: loadMedia,
    setMediaService
})(MediaSelector);

// connect editor state
const Editor = connect(createStructuredSelector({
    selectedItem: selectedItemSelector,
    selectedService: sourceIdSelector,
    services: availableSourcesSelector,
    editing: editingSelector,
    saveState: saveStateSelector
}), {
    setMediaService,
    setMediaType
})(MediaEditor);

/**
 * Media Editor Modal. Contains the media picker
 * @param {object} props the properties
 * @param {boolean} props.open show/hide the modal
 * @param {function} props.hide handler for close
 */
const MediaModal = ({
    open,
    mediaType,
    chooseMedia,
    selectedItem,
    editing,
    adding,
    hide = () => { },
    disableAddMedia,
    disableEditMedia
}) => {
    return (
        <Portal>
            <ResizableModal
                title={<Message msgId="mediaEditor.modalTitle"/>}
                show={open}
                clickOutEnabled={false}
                onClose={hide}
                size="lg"
                modalClassName="media-editor-modal"
                buttons={[
                    {
                        text: <Message msgId="mediaEditor.apply"/>,
                        bsSize: 'sm',
                        disabled: adding || editing,
                        onClick: () => chooseMedia(selectedItem)
                    }
                ]}>
                <Editor
                    mediaType={mediaType}
                    mediaSelector={
                        <ConnectedMediaSelector
                            mediaType={mediaType}
                            disableAddMedia={disableAddMedia}
                            disableEditMedia={disableEditMedia}
                        />
                    }
                />
            </ResizableModal>
        </Portal>
    );
};

export default withCloseConfirm(MediaModal);
