
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { setAddingMedia, saveMedia, selectItem } from '../../actions/mediaEditor';
import { saveStateSelector, currentResourcesSelector, selectedItemSelector } from '../../selectors/mediaEditor';

import ResizableModal from '../../components/misc/ResizableModal';
import Portal from '../../components/misc/Portal';
import MediaEditor from '../../components/mediaEditor/MediaEditor';

// connect editor state
const Editor = connect(createStructuredSelector({
    saveState: saveStateSelector,
    selectedItem: selectedItemSelector,
    resources: currentResourcesSelector
}), {
    selectItem,
    setAddingMedia,
    saveMedia
})(MediaEditor);

/**
 * Media Editor Modal. Contains the media picker
 * @param {object} props the properties
 * @param {boolean} props.open show/hide the modal
 * @param {function} props.hide handler for close
 */
const MediaModal = ({
    open,
    chooseMedia,
    selectedItem,
    hide = () => { }
}) => {

    return (
        <Portal>
            <ResizableModal
                title="Media"
                show={open}
                onClose={() => hide()}
                size="lg"
                buttons={[
                    {
                        text: 'Apply',
                        bsSize: 'sm',
                        disabled: !selectedItem,
                        onClick: () => chooseMedia(selectedItem)
                    }
                ]}>
                <Editor />
            </ResizableModal>
        </Portal>
    );
};

export default MediaModal;
