import React from 'react';
import Confirm from '../../../misc/ConfirmDialog';
import Portal from '../../../misc/Portal';
import Message from '../../../I18N/Message';

export default ({
    onClose = () => {},
    saving = false,
    onConfirm = () => {}
} = {}) => (<Portal><Confirm
    draggable={false}
    show
    onClose={onClose}
    onConfirm={onConfirm}
    confirmButtonBSStyle="default"
    closeGlyph="1-close"
    confirmButtonContent={<Message msgId="featuregrid.yesButton" />}
    confirmButtonDisabled={saving}
    closeText={<Message msgId="featuregrid.noButton" />}>
    <Message msgId="featuregrid.clear"/>
</Confirm></Portal>);
